#!/bin/bash
source ~/.bashrc
now=$(date +"%Y%m%d.%H%M%S%3N")
#touch reports/$1
ref_split=(${1//./ })
ref_name=${ref_split[0]}
mkdir public/$ref_name

shift
i=0
num_files=${#@}
num_steps=$(( 8*num_files + 2 ))
echo "Number of steps: $num_steps"

jq -c --arg var1 "$ref_name" '. + { "\($var1)": { "state": "Initializing", "progress": "0" } }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
#rm public/json/tmp*.json

for file in "$@" 
do
    echo "File: $file";
    l=(${file//./ })
    p=${l[0]}
    echo "Prefix: $p: Downloading from booshboosh s3";
    progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
    jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Accessing \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
	aws s3 cp s3://booshboosh/pipelinedata/$file public/$file
	aws s3 cp public/$file s3://booshboosh/pipelinedata/$file
	((i++))
    progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
    jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Trimming \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
    
	echo "Trimming with cutadapt"
	../../anaconda3/bin/cutadapt -a TGGAATTCTCGGGTGCCAAGG -u 4 -u -4 -m 10 -o public/$p.trimmed.fastq.gz public/$file > public/$ref_name/$p.trim.txt
	#cutadapt
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Aligning \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
	
    echo "Aligning with bowtie2"
	#bowtie
	(../../anaconda3/bin/bowtie2 -x informatics/indices/human_miRNA_hairpin -U public/$p.trimmed.fastq.gz -S public/$p.sam) 2> public/$ref_name/$p.align.txt
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Converting sams \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

    echo "Converting sam to bam with samtools"
    #samtools
    /tmp/samtools-1.9/samtools view -bS public/$p.sam > public/$p.bam
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Sorting bams \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

    echo "Sorting bam with samtools"
    #samtools
    /tmp/samtools-1.9/samtools sort -m 10M public/$p.bam -o public/$p.sorted.bam
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Indexing bams \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

    echo "Indexing bam with samtools"
    #samtools
    /tmp/samtools-1.9/samtools index public/$p.sorted.bam
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Generating counts \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
    
    echo "Generating count stats with samtools"
    #samtools
    /tmp/samtools-1.9/samtools idxstats public/$p.sorted.bam > public/$ref_name/$p.counts.txt
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Removing temporary files \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

    echo "Removing residual files"
    echo
    aws s3 cp public/$file s3://booshboosh/pipelinedata/$file
    rm public/$file
    rm public/$p.trimmed.fastq.gz
    rm public/$p.sam
    rm public/$p.bam
    rm public/$p.sorted.bam
    rm public/$p.sorted.bam.bai
  	rm -f public/json/tmp*.json
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" '."\($var1)" = { "state": "Preparing for next file", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
   
done

echo "Archiving report files"
zip -r reports/$ref_name.zip public/$ref_name
((i++))
progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
jq -c --arg var1 "$ref_name" --arg var2 "$progress" '."\($var1)" = { "state": "Archiving run", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
   
echo "Final cleaning"
rm -rf public/$ref_name
((i++))
progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
jq -c --arg var1 "$ref_name" --arg var2 "$progress" '."\($var1)" = { "state": "Complete", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

#!/bin/bash

now=$(date +"%Y%m%d.%H%M%S%3N")
touch reports/$1
ref_name=$1
shift
i=0
num_files=${#@}
num_steps=$(( 7*num_files + 2 ))
echo "Number of steps: $num_steps"

jq -c --arg var1 "$ref_name" '. + { "\($var1)": { "state": "Initializing", "progress": "0" } }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
#rm public/json/tmp*.json

for file in "$@" 
do
    echo "File: $file";
    l=(${file//./ })
    p=${l[0]}
    echo "Prefix: $p";
    echo "Trimming with cutadapt"
    progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
    jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Trimming \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
    cutadapt -a TGGAATTCTCGGGTGCCAAGG -u 4 -u -4 -o public/$p.trimmed.fastq.gz public/$file > public/$p.trim.txt
	#cutadapt
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Aligning \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

    echo "Aligning with bowtie2"
	#bowtie
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Converting sams \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

    echo "Converting sam to bam with samtools"
    #samtools
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Indexing bams \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

    echo "Indexing bam with samtools"
    #samtools
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Sorting bams \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

    echo "Sorting bam with samtools"
    #samtools
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Generating counts \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
    
    echo "Generating count stats with samtools"
    #samtools
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Removing temporary files \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

    echo "Removing residual files"
    echo
    #samtools
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" '."\($var1)" = { "state": "Preparing for next file", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
   
done

echo "Archiving report files"
#zip
((i++))
progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
jq -c --arg var1 "$ref_name" --arg var2 "$progress" '."\($var1)" = { "state": "Archiving run", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json
   
echo "Final cleaning"
#rms
((i++))
progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
jq -c --arg var1 "$ref_name" --arg var2 "$progress" '."\($var1)" = { "state": "Complete", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json public/json/pipeline_status.json

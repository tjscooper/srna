#!/bin/bash
source ~/.bashrc
now=$(date +"%Y%m%d.%H%M%S%3N")
#touch reports/$1
ref_split=(${1//./ })
ref_name=${ref_split[0]}
mkdir public/$ref_name
mkdir public/$ref_name/plots

shift
i=0
num_files=${#@}
num_steps=$(( 8*num_files + 3 ))
echo "Number of steps: $num_steps"

#screen -S jq_qq_queue -X stuff "jq -c '. + [\"$ref_name\"]' public/json/queue.json > public/json/tmp2.$$.json && mv --force public/json/tmp.$$.json public/json/queue.json^M"
#screen -S jq_pipe_queue -X stuff "jq -c '. + { \"$ref_name\": { \"state\": \"In Queue: Position $queue_pos\", \"progress\": \"0\" } }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json"
#screen -S pipeline_queue -X stuff "$cmd"

screen -S jq_pipe_queue -X stuff "jq -c '. + { \"$ref_name\": { \"state\": \"Initializing\", \"progress\": \"0\" } }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
#rm public/json/tmp*.json

for file in "$@" 
do
	f="$(cut -d'/' -f2 <<<"$file")"
    echo "File: $f";
    l=(${f//./ })
    p=${l[0]}

    echo "Prefix: $p: Downloading from booshboosh s3";
    progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
    screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Accessing $f\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
	aws s3 cp s3://booshboosh/pipelinedata/$f public/$f
	aws s3 cp public/$f s3://booshboosh/pipelinedata/$f
	((i++))
    progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
    screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Trimming \"$f\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
    
	echo "Trimming with cutadapt"
	../../miniconda3/bin/cutadapt -u -4 -o public/$p.pretrimmed.fastq.gz public/$f
	rm public/$f
	../../miniconda3/bin/cutadapt -a TGGAATTCTCGGGTGCCAAGG -u 4 -m 10 -o public/$p.trimmed.fastq.gz public/$p.pretrimmed.fastq.gz > public/$ref_name/$p.trim.txt
	rm public/$p.pretrimmed.fastq.gz
	#cutadapt
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Aligning $f\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
	
    echo "Aligning with bowtie2"
	#bowtie
	(../../miniconda3/bin/bowtie2 -x informatics/indices/human_miRNA_hairpin -U public/$p.trimmed.fastq.gz -S public/$p.sam) 2> public/$ref_name/$p.align.txt
    rm public/$p.trimmed.fastq.gz
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Converting sams $f\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"

    echo "Converting sam to bam with samtools"
    #samtools
    ../../samtools-1.9/samtools view -bS public/$p.sam > public/$p.bam
    rm public/$p.sam
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Sorting bams $f\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"

    echo "Sorting bam with samtools"
    #samtools
    ../../samtools-1.9/samtools sort -m 10M public/$p.bam -o public/$p.sorted.bam
    rm public/$p.bam
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Indexing bams $f\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"

    echo "Indexing bam with samtools"
    #samtools
    ../../samtools-1.9/samtools index public/$p.sorted.bam
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Generating counts $f\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
    
    echo "Generating count stats with samtools"
    #samtools
    ../../samtools-1.9/samtools idxstats public/$p.sorted.bam > public/$ref_name/$p.counts.txt
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Removing temporary files $f\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"

    echo "Removing residual files"
    echo
    rm public/$p.sorted.bam
    rm public/$p.sorted.bam.bai
  	rm -f public/json/tmp*.json
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Preparing for next file\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
   
done
echo "Generating plots"
../../miniconda3/bin/python3.8 informatics/make_plots.py -i public/$ref_name -o public/$ref_name/plots -s $ref_name
((i++))
progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Drawing plots\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"

echo "Archiving report files"
zip -r reports/$ref_name.zip public/$ref_name
((i++))
progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Archiving run\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
   
echo "Final cleaning"
aws s3 cp public/$ref_name/plots/$ref_name-report.html s3://booshboosh/pipelinedata/
aws s3 cp reports/$ref_name.zip s3://booshboosh/pipelinedata/$ref_name.zip
rm -rf public/$ref_name
((i++))
progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
screen -S jq_pipe_queue -X stuff "jq -c '.\"$ref_name\" = { \"state\": \"Complete\", \"progress\": \"$progress\" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
screen -S jq_qq_queue -X stuff "jq -c 'del( .[0] )' public/json/queue.json > public/json/tmp2.$$.json && mv --force public/json/tmp2.$$.json public/json/queue.json^M"

q_ele=$(<public/json/queue.json jq -r '. | @sh')
echo $q_ele
queue_pos=1
for ele in $q_ele
do
    echo $ele
    screen -S jq_pipe_queue -X stuff "jq -c '. + { \"$ele\": { \"state\": \"In Queue: Position $queue_pos\", \"progress\": \"0\" } }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
    ((i++))
done
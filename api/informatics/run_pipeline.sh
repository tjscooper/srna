#!/bin/bash

now=$(date +"%Y%m%d.%H%M%S%3N")
touch reports/$1
ref_name=$1
shift
i=0
num_files=${#@}
num_steps=$(( 7*num_files + 2 ))
echo "Number of steps: $num_steps"

jq -c --arg var1 "$ref_name" '. + { "\($var1)": { "state": "Initializing", "progress": "0" } }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json pipeline_status.json
#rm public/json/tmp*.json

for file in "$@" 
do
    echo "File: $file";
    echo "Trimming with cutadapt"
	#cutadapt
	((i++))
	progress=$(bc -l <<< "scale=2;$i*100/$num_steps")
	jq -c --arg var1 "$ref_name" --arg var2 "$progress" --arg var3 "$file" '."\($var1)" = { "state": "Trimming \($var3)", "progress": "\($var2)" }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv public/json/tmp.$$.json pipeline_status.json

    echo "Aligning with bowtie2"

    echo "Converting sam to bam with samtools"

    echo "Indexing bam with samtools"

    echo "Sorting bam with samtools"
    
    echo "Generating count stats with samtools"

    echo "Removing residual files"
    echo
   
done

echo "Archiving report files"

echo "Final cleaning"
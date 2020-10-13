#!/bin/bash

now=$(date +"%Y%m%d.%H%M%S%3N")
touch reports/$1
ref_name=$1
shift

for file in "$@" 
do
    echo "File: $file";
    echo "Trimming with cutadapt"

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
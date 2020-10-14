#!/bin/bash
now=$(date +"%Y%m%d.%H%M%S%3N")
for file in "$@" 
do
	aws s3 cp public/$file s3://booshboosh/pipelinedata/$file
	rm public/$file
done
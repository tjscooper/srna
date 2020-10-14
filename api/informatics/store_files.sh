#!/bin/bash
source ~/.bashrc
now=$(date +"%Y%m%d.%H%M%S%3N")
aws s3 cp public/$1 s3://booshboosh/pipelinedata/$1
rm public/$1
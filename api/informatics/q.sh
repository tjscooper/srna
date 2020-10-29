#!/bin/bash
if ! screen -list | grep -q "pipeline_queue"; then
    screen -d -m -S pipeline_queue
    screen -S pipeline_queue -X stuff "cd ~/srna/api^M"
fi
if ! screen -list | grep -q "jq_pipe_queue"; then
    screen -d -m -S jq_pipe_queue
    screen -S jq_pipe_queue -X stuff "cd ~/srna/api^M"
fi
if ! screen -list | grep -q "jq_qq_queue"; then
    screen -d -m -S jq_qq_queue
    screen -S jq_qq_queue -X stuff "cd ~/srna/api^M"
fi

cmd="bash informatics/run_pipeline.sh"
echo $cmd
for arg in "$@"
do
	echo $arg
	cmd="${cmd} ${arg}" 
	echo $cmd
done

cmd="${cmd}^M"
ref_split=(${1//./ })
ref_name=${ref_split[0]}
q_ele=$(<public/json/queue.json jq -r '. | @sh')
queue_pos=${#q_ele[@]}

screen -S jq_qq_queue -X stuff "jq -c '. + [\"$ref_name\"]' public/json/queue.json > public/json/tmp2.$$.json && mv --force public/json/tmp2.$$.json public/json/queue.json^M"
q_ele2=$(<public/json/queue.json jq -r '. | @sh')
echo $q_ele2
screen -S jq_pipe_queue -X stuff "jq -c '. + { \"$ref_name\": { \"state\": \"In Queue: Position $queue_pos\", \"progress\": \"0\" } }' public/json/pipeline_status.json > public/json/tmp.$$.json && mv --force public/json/tmp.$$.json public/json/pipeline_status.json^M"
screen -S pipeline_queue -X stuff "$cmd"
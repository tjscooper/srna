#!/bin/bash
if ! screen -list | grep -q "queue"; then
    screen -d -m -S queue
fi

cmd="bash informatics/run_pipeline.sh"
for arg in "$@"
	cmd="${cmd} ${arg}" 
do
cmd="${cmd}^M"
screen -S queue -X stuff "$cmd"
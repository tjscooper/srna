#!/bin/bash
echo '[]' > public/json/queue.json
echo '{}' > public/json/pipeline_status.json

if ! screen -list | grep -q "qqqq"; then
    screen -d -m -S qqqq
    screen -S qqqq -X stuff "cd ~/srna/api^M"
fi

now=$(date +"%Y%m%d.%H%M%S%3N")
sleep 5
touch reports/$1
ref_name=$1
shift

for file in "$@" 
do
    echo "File: $file";
   
done
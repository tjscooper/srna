import gzip
import argparse
import csv
#-------------------------------------------------------------------------------------------
# arguments for main
parser = argparse.ArgumentParser(description='creates inserter txt file')
parser.add_argument('-i',  
    action='store', 
    dest='i',
    required=True,
    type=str,
    help="input fastq.gz")

parser.add_argument('-o',  
    action='store', 
    dest='o',
    required=True,
    type=str,
    help="output prefix")

#-------------------------------------------------------------------------------------------
def main():
    options = parser.parse_args()

    inserts = {} 

    count = 0
    with gzip.open(str(options.i), 'rt') as f:
        for line in f:
            if (count % 4) == 1:
                line_str = str(line).replace("\n", '')
                #print(line)
                #print(line_str)
                #print(line_str.split())
                #print(len(line_str))
                if(len(line_str) in inserts):
                    inserts[len(line_str)] += 1
                else:
                    inserts[len(line_str)] = 1
            count+=1
    f.close()

    i_keys = list(inserts.keys())
    i_keys.sort()

    with open(str(options.o) + ".inserts.txt", mode='w') as insert_f:
        writer = csv.writer(insert_f, delimiter='\t')
        for i in i_keys:
            writer.writerow([i, inserts[i]])


    print(inserts)
#-------------------------------------------------------------------------------------------
if __name__ == "__main__":
    main()

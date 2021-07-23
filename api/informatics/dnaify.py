import os
import sys
import argparse
import csv

#-------------------------------------------------------------------------------------------
# arguments for main
parser = argparse.ArgumentParser(description='dnaify an rna seq fasta')
parser.add_argument('-i',  
    action='store', 
    dest='i',
    required=True,
    type=str,
    help="rna fasta")
parser.add_argument('-o',  
    action='store', 
    dest='o',
    required=True,
    type=str,
    help="output dna fasta")

#-------------------------------------------------------------------------------------------
# global variables for more descriptive code


#-------------------------------------------------------------------------------------------
# main, serves as pipeline
def main():
    options = parser.parse_args()

    out_list = []

    with open(str(options.i), "r") as f:
        lines = f.readlines()
        for l in lines:
            if l[0] == ">":
                out_list.append([l.replace("\n", "")])
            else:
                out_list.append([l.replace("\n", "").replace("U", "T").replace("u", "t")])

   
    dumpCSVData(str(options.o), out_list)


def dumpCSVData(out_name, out_list):
    # dumps a list of lists to a csv
    with open(out_name, "w") as f:
        writer = csv.writer(f)
        writer.writerows(out_list)



#-------------------------------------------------------------------------------------------
if __name__ == "__main__":
    main()

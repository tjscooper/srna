'''
get_cigar_coord.py
gets the position of the genomic reference of a CIGAR from a transcript coordinate
author: Dylan Fox
inital date: 20210226
'''
import os
import sys
import argparse
import csv
import re

#-------------------------------------------------------------------------------------------
# arguments for main

parser = argparse.ArgumentParser(description='get cigar coordinates')
parser.add_argument('-i1',  
    action='store', 
    dest='i1',
    required=True,
    type=str,
    help="input file 1 - four column tab-delimited file containing (1) transcript name, (2) ref chromosome name, (3) 0-based starting position of alignment, and (4) CIGAR")
parser.add_argument('-i2',  
    action='store', 
    dest='i2',
    required=True,
    type=str,
    help="input file 2 - two column tab-delimited file containing (1) transcript name, (2) 0-based transcript coordinate")
parser.add_argument('-o',  
    action='store', 
    dest='o',
    default="ignore",
    type=str,
    help="(optional) output filename")


#-------------------------------------------------------------------------------------------
# global variables for more descriptive code
TRANSCRIPT = 0
CHROM = 1
START_POS = 2
CIGAR = 3
QUERY_POS = 1

#-------------------------------------------------------------------------------------------
# main, serves as pipeline
def main():
    options = parser.parse_args()
    cigar_dict = build_cigar_dict(load_tab_data(options.i1))

def build_cigar_dict(cigar_data):
    ret_dict = {}
    for c in cigar_data:
        split_cigar = re.split('(\d+)', c[CIGAR])
        print(split_cigar)
        

def load_tab_data(in_name):
    # loads tab delimited file into a list of lists
    ret_list = []
    with open(in_name, 'r') as f:
        reader = csv.reader(f, delimiter="\t")
        ret_list = list(reader)
    return ret_list


def dump_tab_data(out_name, out_list):
    # dumps a list of lists to a tab file
    with open(out_name, "w") as f:
        writer = csv.writer(f)
        writer.writerows(out_list)





#-------------------------------------------------------------------------------------------
if __name__ == "__main__":
    main()

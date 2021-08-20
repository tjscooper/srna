import sys
import csv
import argparse
import json
import getpass
import os

dirname = os.path.dirname(__file__)


#---------------------------------------------------------------------------------
#arguments for main

parser = argparse.ArgumentParser(description='DIBS --> Differential Integrated Barcode System')
subparser = parser.add_subparsers(dest="subparser_name")

parser_add = subparser.add_parser('add')
parser_add.add_argument('barcode_type',
    choices=['sRNA', '6-nt', '8-nt', '12-nt', 'qRNA', 'di', 'udi', 'budi', 'sRNAudi', 'custom'])
parser_add.add_argument('barcode_numbers',
     type=str)
parser_add.add_argument('-n', 
    metavar='--name_prefix',
    type=str,
    required=True,
    help='name of your prefix to appear in every sample')
parser_add.add_argument('-x',
    metavar='--number_of_samples',
    type=int,
    default=1,
    help='the amount of samples being added')
parser_add.add_argument('-r',
    metavar='--reads', 
    type=float, 
    required=True,
    help='number of reads desired (in millions)')
parser_add.add_argument('-s', 
    metavar='--size', 
    type=int,
    required=True,
    help='average size of library (in bp)')
parser_add.add_argument('-c', 
    metavar='--custom', 
    type=str, 
    help='label for custom barcode, must have barcodes_custom.csv in home dir')
#parser_add.set_defaults(func=add)

parser_delete = subparser.add_parser('delete')
parser_delete.add_argument('barcode_type', 
    choices=['sRNA', '6-nt', '8-nt', '12-nt', 'qRNA', 'di', 'udi', 'budi', 'sRNAudi', 'custom'])
parser_delete.add_argument('barcode_numbers', 
    type=str)
parser_delete.add_argument('-c', 
    metavar='--custom', 
    type=str, 
    help='label for custom barcode, must have barcodes_custom.csv in home dir')
#parser_delete.set_defaults(func=delete)

parser_view = subparser.add_parser('full_view')
parser_view.add_argument('-c', 
    metavar='--conflicts', 
    help='show i7/i5 matches and warnings') 
    #action='store_true')

parser_view = subparser.add_parser('user_view')
parser_view.add_argument('-u', 
    metavar='--user', 
    type=str, 
    default='all', 
    help='only show barcodes claimed by specified user')
parser_view.add_argument('-c', 
    metavar='--conflicts', 
    help='show i7/i5 matches and warnings') 
    #action='store_true')
#parser_view.set_defaults(func=view)

parser_push = subparser.add_parser('push') 
parser_push.add_argument('-e', 
    metavar='--exclude', 
    type=str, 
    help='exclude specified user from push outputs')
parser_push.add_argument('-o', 
    metavar='--output_prefix', 
    type=str, 
    default='miseq', 
    help='exclude specified user from push outputs')
parser_push.add_argument('-t', 
    metavar='--run_type', 
    type=str, 
    default='1x151', 
    help='ex: 1x151, 2x76')
parser_push.add_argument('-d', 
    metavar='--dual', 
    help='this will be a dual-index run') 
    #action='store_true')
#parser_push.set_defaults(func=push)


#parser_push.set_defaults(func=unpush)

parser_ready = subparser.add_parser('ready')
parser_ready.add_argument('barcode_type', 
    choices=['sRNA', '6-nt', '8-nt', '12-nt', 'qRNA', 'di', 'udi', 'budi', 'sRNAudi', 'custom'])
parser_ready.add_argument('barcode_numbers', 
    type=str)
parser_ready.add_argument('-n', 
    metavar='--nope', 
    help='remove ready status') 
    #action='store_true')
parser_ready.add_argument('-c', 
    metavar='--custom', 
    type=str, 
    help='label for custom barcode, must have barcodes_custom.csv in home dir')
#parser_ready.set_defaults(func=ready)

#---------------------------------------------------------------------------------
#GLOBALS

LONGEST_I7 = 2
LONGEST_I5 = 3


BARCODE_TYPE = 0
BARCODE_NUMBERS = 1

ADD_NAME_PREFIX = 2
ADD_NUMBER_OF_SAMPLES = 3
ADD_READS = 4
ADD_SIZES = 5
ADD_CUSTOM = 6


TYPE = 0
BC_NUMBER = 1
I7 = 2
I5 = 3
I7_EXTRA = 4
I5_EXTRA = 5
USER = 6
SAMPLE_NAME = 7
READS = 8
SIZE = 9
ANALYSIS = 10
FLAG = 11

#---------------------------------------------------------------------------------

def main():
    options = parser.parse_args()
    command = options.subparser_name
    if command == 'add':
        args = handle_add_args(options)
        write_barcodes(args, command)
    if command == 'delete':
        args = handle_del_args(options)
        write_barcodes(args, command)
    if command == 'full_view':
        full = full_view()
        print(full)
    if command == 'user_view':
        user_list = user_view()
        print(user_list)



#handles argument list for any subparser
def arg_list(args):
    return [getattr(args, arg) for arg in vars(args)]

#handles the add subparser argument and returns a list that can be used downstream
def handle_add_args(args):
    add_args = arg_list(args)
    add_args.pop(0)
    print(add_args)
    print(add_args[BARCODE_TYPE])
    add_args[BARCODE_NUMBERS] = get_availiable_barcodes(add_args[BARCODE_TYPE], set(add_args[BARCODE_NUMBERS].split(',')))
    add_args[ADD_NUMBER_OF_SAMPLES] = len(add_args[BARCODE_NUMBERS])
    return add_args

#handles the delete subparser and handles respective arguments, returning a list that can be used downstream
def handle_del_args(args):
    del_args = arg_list(args)
    del_args.pop(0)
    del_args[BARCODE_NUMBERS] = can_delete_barcodes(del_args[BARCODE_TYPE], set(del_args[BARCODE_NUMBERS].split(',')))
    return del_args

#accessed in add arguments will eliminate any given barcodes that are already taken
def get_availiable_barcodes(barcode_type, barcodes):
    with open(os.path.join(dirname, 'sheets/barcodes_master_copy.csv'), 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter='\t')
        for row in reader:
            if row[TYPE] == barcode_type and (row[BC_NUMBER] in barcodes):
                if row[USER] != '---':
                    barcodes.remove(row[BC_NUMBER])
    return barcodes

#accessed in del_arguments and will eliminate barcodes that are not allowed to be deleted
def can_delete_barcodes (barcode_type, barcodes):
    print(barcodes)
    with open(os.path.join(dirname, 'sheets/barcodes_master_copy.csv'), 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter='\t')
        for row in reader:
            if row[TYPE] == barcode_type and (row[BC_NUMBER] in barcodes):
                if row[USER] != str(getpass.getuser()):
                    barcodes.remove(row[BC_NUMBER])
    return barcodes

def full_view():
    view_sheet = []
    csv_file = open(os.path.join(dirname, 'sheets/barcodes_master_copy.csv'), 'r')
    for row in csv_file:
            row_list = row.strip().split('\t')
            if row_list[USER] != '---':
                view_sheet.append(row_list)
    with open(os.path.join(dirname, 'views/full_view.json'), 'w') as f:
        json.dump(view_sheet, f, indent=2)
    return view_sheet

def user_view():
    view_sheet = []
    csv_file = open(os.path.join(dirname, 'sheets/barcodes_master_copy.csv'), 'r')
    for row in csv_file:
            row_list = row.strip().split('\t')
            if row_list[USER] == str(getpass.getuser()):
                view_sheet.append(row_list)
    with open(os.path.join(dirname, 'views/user_view.json'), 'w') as f:
        json.dump(view_sheet, f, indent=2)





#write barcodes back to master barcode list
#the big guns that handles flag checking, hamming manipulation, and flag writing
##want: make it so that this master file can be changed            
def write_barcodes(args, command):
    edit_lines = []
    barcode_lines = []

    if command =='add' and args[ADD_NUMBER_OF_SAMPLES] != 0:
        add_lines = []
        csv_file = open(os.path.join(dirname, 'sheets/barcodes_master_copy.csv'), 'r')
        for x,row in enumerate(csv_file):
            row_list = row.strip().split('\t')
            barcode_lines.append(row_list)
            if row_list[TYPE] == args[BARCODE_TYPE] and (row_list[BC_NUMBER] in args[BARCODE_NUMBERS]):
                add_lines.append(x)
            if row_list[USER] != '---':
                edit_lines.append(x)

        csv_file.close()

        edit_lines += add_lines

        hamming_check(barcode_lines, edit_lines)

        for x,i in enumerate(add_lines):
            barcode_lines[i][USER] = getpass.getuser()
            x += 1 #fix off by 1 error
            if x <= 9:
                barcode_lines[i][SAMPLE_NAME] = str(args[ADD_NAME_PREFIX]) + '_0' + str(x)
            else: 
                barcode_lines[i][SAMPLE_NAME] = str(args[ADD_NAME_PREFIX]) + '_' + str(x)
            barcode_lines[i][READS] = str(args[ADD_READS])
            barcode_lines[i][SIZE] = str(args[ADD_SIZES])

        with open(os.path.join(dirname, 'sheets/barcodes_master_copy.csv'), 'w', newline='') as csv_file:
                writer = csv.writer(csv_file, delimiter="\t")
                for i in barcode_lines:
                    writer.writerow(i)
        csv_file.close()

    if command =='delete' and len(args[BARCODE_NUMBERS]) != 0:
        delete_lines = []
        csv_file = open(os.path.join(dirname, 'sheets/barcodes_master_copy.csv'), 'r')
        for x,row in enumerate(csv_file):
            row_list = row.strip().split('\t')
            barcode_lines.append(row_list)
            if row_list[TYPE] == args[BARCODE_TYPE] and (row_list[BC_NUMBER] in args[BARCODE_NUMBERS]):
                delete_lines.append(x)
            elif row_list[USER] != '---':
                edit_lines.append(x)

        csv_file.close()

        hamming_check(barcode_lines, edit_lines)

        for i in delete_lines:
            barcode_lines[i][USER] = '---'
            barcode_lines[i][SAMPLE_NAME] = '---'
            barcode_lines[i][READS] = '0'
            barcode_lines[i][SIZE] = '0'
            barcode_lines[i][FLAG] = '0,0,0,0'

        with open(os.path.join(dirname, 'sheets/barcodes_master_copy.csv'), 'w', newline='') as csv_file:
                writer = csv.writer(csv_file, delimiter="\t")
                for i in barcode_lines:
                    writer.writerow(i)
        csv_file.close()

# find length of longest taken barcode, where i7 is denoted as 0 and i5 is denoted as 1
def find_longest_bc(all_barcodes, i7_or_i5, lines_to_edit):
    len_longest_barcode = 0
    for x in lines_to_edit:
        if len(all_barcodes[x][i7_or_i5]) > len_longest_barcode:
            len_longest_barcode = len(all_barcodes[x][i7_or_i5])
    return len_longest_barcode

# return barcode sequence popped to given length
def bc_pop(i7_or_5, i7_or_5_extra, desired_length):
    extra_chars = list(i7_or_5_extra)
    pop_copy = i7_or_5
    while len(pop_copy) < desired_length:
        pop_copy += extra_chars.pop(0)
    return pop_copy

def hamming(str1, str2):
    distance = 0
    assert len(str1) == len(str2)
    for x in range(len(str1)):
        if str1[x] != str2[x]:
            distance += 1
    return distance

# check hamming of all combinations of claimed barcodes
def hamming_check(all_barcodes, lines_to_edit):

    # first, reset all hamming flags
    len_hamming_keys = 0
    for x in lines_to_edit:
        all_barcodes[x][FLAG] = [0,0,0,0]
        print(all_barcodes[x])
        len_hamming_keys += 1

    # then, calculate all pairwise hamming distances for claimed barcodes
    len_longest_barcode_i7 = find_longest_bc(all_barcodes, LONGEST_I7, lines_to_edit)
    len_longest_barcode_i5 = find_longest_bc(all_barcodes, LONGEST_I5, lines_to_edit)

    #create barcode hamming list
    barcodes_to_ham = [all_barcodes[x] for x in lines_to_edit]

  
    for x in range(len(barcodes_to_ham) - 1):
        y = x
        while y < len(barcodes_to_ham) - 1:
            pop_copy_x_i7 = bc_pop(barcodes_to_ham[x][I7], barcodes_to_ham[x][I7_EXTRA], len_longest_barcode_i7)
            pop_copy_y_i7 = bc_pop(barcodes_to_ham[y + 1][I7], barcodes_to_ham[y + 1][I7_EXTRA], len_longest_barcode_i7)
            pop_copy_x_i5 = bc_pop(barcodes_to_ham[x][I5], barcodes_to_ham[x][I5_EXTRA], len_longest_barcode_i5)
            pop_copy_y_i5 = bc_pop(barcodes_to_ham[y + 1][I5], barcodes_to_ham[y + 1][I5_EXTRA], len_longest_barcode_i5)
            i7_ham = hamming(pop_copy_x_i7, pop_copy_y_i7)
            i5_ham = hamming(pop_copy_x_i5, pop_copy_y_i5)
            if i7_ham == 0:
                print(barcodes_to_ham[x][FLAG])
                barcodes_to_ham[x][FLAG][0] += 1
                barcodes_to_ham[y + 1][FLAG][0] += 1
            elif i7_ham < 3:
                barcodes_to_ham[x][FLAG][1] += 1
                barcodes_to_ham[y + 1][FLAG][1] += 1
            if i5_ham == 0:
                print(barcodes_to_ham[x][FLAG])
                barcodes_to_ham[x][FLAG][2] += 1
                barcodes_to_ham[y + 1][FLAG][2] += 1
            elif i5_ham < 3:
                barcodes_to_ham[x][FLAG][3] += 1
                barcodes_to_ham[y + 1][FLAG][3] += 1
            y += 1

    for i in barcodes_to_ham:
        i[FLAG] = ','.join(str(elem) for elem in i[FLAG])

    for x, i in enumerate(lines_to_edit):
        all_barcodes[i] = barcodes_to_ham[x]



def expand_ranges(ranges):
    start_stop = ranges.split('-')
    full_range = [i for i in range(start_stop[0], start_stop[1] + 1)]
    return full_range


#---------------------------------------------------------------------------------
if __name__ == '__main__':
    main()

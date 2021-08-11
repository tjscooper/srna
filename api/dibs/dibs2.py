from prettytable import PrettyTable
from sortedcontainers import SortedDict
import re, getpass, csv, sys, argparse, time, subprocess, os, shutil, itertools, operator
from itertools import imap, izip
from tqdm import tqdm

# calculate hamming distance between two barcodes of equal length
def hamming(str1, str2):
    assert len(str1) == len(str2)
    ne = operator.ne
    return sum(imap(ne, str1, str2))

# convert dashed ranges to comma-separated ranges
def expand_ranges(s):
	return re.sub(
		r'(\d+)-(\d+)',
		lambda match: ','.join(
			str(i) for i in range(
				int(match.group(1)),
				int(match.group(2)) + 1
			)	
		),	
		s
	)

def clapback(my_bc):
	while True:
		yield my_bc


def checkIndexDiversity(full_sample_sheet):
    return True

# empty string
def empty_string():
	s = ""
	while True:
		yield s

# calc length of combinations
def comb(N,k): # from scipy.comb(), but MODIFIED!
	if (k > N) or (N < 0) or (k < 0):
		return 0L
	N,k = map(long,(N,k))
	top = N
	val = 1L
	while (top > (N-k)):
		val *= top
		top -= 1
	n = 1L
	while (n < k+1L):
		val /= n
		n += 1
	return val

# find length of longest taken barcode, where i7 is denoted as 0 and i5 is denoted as 1
def find_longest_bc(barcodes, i7_or_i5):
	len_longest_barcode = 0
	for bc in barcodes.keys():
		if barcodes[bc][4] != "---":
			if len(barcodes[bc][i7_or_i5]) > len_longest_barcode:
				len_longest_barcode = len(barcodes[bc][i7_or_i5])
	return len_longest_barcode

# return barcode sequence popped to given length
def bc_pop(iX, iX_extra, desired_length, barcodes):
	extra_chars = list(iX_extra)
	pop_copy = iX
	while len(pop_copy) < desired_length:
		pop_copy += extra_chars.pop(0)
	return pop_copy

# check hamming of all combinations of claimed barcodes
def hamming_check(my_bc, add_or_del, barcodes):
	# first, reset all hamming flags
	len_hamming_keys = 0
	for bc in [i for i in barcodes.keys() if barcodes[i][4] != "---"]:
		if my_bc is None:
			barcodes[bc][9] = "0,0,0,0"
		len_hamming_keys += 1
	# then, calculate all pairwise hamming distances for claimed barcodes
	len_longest_barcode_i7 = find_longest_bc(barcodes, 0)
	len_longest_barcode_i5 = find_longest_bc(barcodes, 1)
	if my_bc is None:
		looper = itertools.combinations([i for i in barcodes.keys() if barcodes[i][4] != "---"], 2)
		looper_total = comb(len_hamming_keys, 2)
		looper_desc = "Hamboning all barcodes"
	else:
		looper = itertools.izip(clapback(my_bc), [i for i in barcodes.keys() if barcodes[i][4] != "---" and i != my_bc])
		looper_desc = "Hamboning " + str(my_bc)
		looper_total = len([i for i in barcodes.keys() if barcodes[i][4] != "---" and i != my_bc])
	for bc_x, bc_y in tqdm(looper, total = looper_total, desc = looper_desc):
			len_longest_barcode_i7 = find_longest_bc(barcodes, 0)
			len_longest_barcode_i5 = find_longest_bc(barcodes, 1)
			pop_copy_x_i7 = bc_pop(barcodes[bc_x][0], barcodes[bc_x][2], len_longest_barcode_i7, barcodes)
			pop_copy_y_i7 = bc_pop(barcodes[bc_y][0], barcodes[bc_y][2],  len_longest_barcode_i7, barcodes)
			pop_copy_x_i5 = bc_pop(barcodes[bc_x][1], barcodes[bc_x][3], len_longest_barcode_i5, barcodes)
			pop_copy_y_i5 = bc_pop(barcodes[bc_y][1], barcodes[bc_y][3], len_longest_barcode_i5, barcodes)
			i7_ham = hamming(pop_copy_x_i7, pop_copy_y_i7)
			i5_ham = hamming(pop_copy_x_i5, pop_copy_y_i5)
			flags_x = [int(i) for i in barcodes[bc_x][9].split(",")]
			flags_y = [int(i) for i in barcodes[bc_y][9].split(",")]
			# 7 flag: i7 hamming = 0
			if i7_ham == 0:
				flags_x[0] += add_or_del
				flags_y[0] += add_or_del
			# & flag: 0 < i7 hamming < 3
			elif i7_ham < 3:
				flags_x[1] += add_or_del
				flags_y[1] += add_or_del
			# 5 flag: i5 hamming = 0
			if i5_ham == 0:
				flags_x[2] += add_or_del
				flags_y[2] += add_or_del
			# % flag: 0 < i5 hamming < 3
			elif i5_ham < 3:
				flags_x[3] += add_or_del
				flags_y[3] += add_or_del
			barcodes[bc_x][9] = ','.join([str(i) for i in flags_x])
			barcodes[bc_y][9] = ','.join([str(i) for i in flags_y])

# check if barcodes are OK to add or delete
def available(args, barcode_numbers, barcodes, user, len_longest_barcode_i7, len_longest_barcode_i5):
	barcodes_available = True
	# add special handling for custom barcodes
	temp_barcodes = {}
	if args.barcode_type == "custom":
		# loop through the custom csv, make sure all barcodes are there; if not, RETURN false
		# make temp_barcodes[bc_num] = [i7, i5, i7_extra, i5_extra]
		# else make temp_i7 whatever else
		custom_bc_count = 0
		for bc_num in barcode_numbers:
			with open('barcodes_custom.csv', 'rb') as custom_csvfile:
				custom_reader = csv.reader(custom_csvfile, delimiter='\t')
				for row in custom_reader:
					if row[0][0] != "#" and row[0] == args.custom and int(row[1]) == bc_num:
						temp_barcodes[bc_num] = row[2:] + [user]
						custom_bc_count += 1
		if custom_bc_count < len(barcode_numbers):
			print "Not all specified barcodes exist in your ~/barcodes_custom.csv file! ABORTING"
			return False
	else:
		for bc_num in barcode_numbers:
			temp_barcodes[bc_num] = barcodes[(args.barcode_type, bc_num)][0:]
	for bc_num in barcode_numbers:
		# if barcode is taken by another user, disallow
		if temp_barcodes[bc_num][4] != "---" and temp_barcodes[bc_num][4] != user:
			print "%s barcode  %s  is not available" % (args.barcode_type, bc_num)
			barcodes_available = False
		# if barcode is not taken, loop through all taken barcodes and make sure hamming != 0 for i7 and i5
		else:
			for bc in barcodes.keys():
				if barcodes[bc][4] != "---" and bc != (args.barcode_type, bc_num) and bc != (args.custom, bc_num) and args.subparser_name != "delete":
					if len(temp_barcodes[bc_num][0]) > len_longest_barcode_i7:
						len_longest_barcode_i7 = len(temp_barcodes[bc_num][0])
					if len(temp_barcodes[bc_num][1]) > len_longest_barcode_i5:
						len_longest_barcode_i5 = len(temp_barcodes[bc_num][1])
					if hamming(bc_pop(temp_barcodes[bc_num][0], temp_barcodes[bc_num][2], len_longest_barcode_i7, barcodes), bc_pop(barcodes[bc][0], barcodes[bc][2], len_longest_barcode_i7, barcodes)) == 0 and hamming(bc_pop(temp_barcodes[bc_num][1], temp_barcodes[bc_num][3], len_longest_barcode_i5, barcodes), bc_pop(barcodes[bc][1], barcodes[bc][3], len_longest_barcode_i5, barcodes)) == 0:
						print "%s barcode  %s  is not available because %s barcode %s is already taken" % (args.barcode_type, bc_num, bc[0], bc[1])
						barcodes_available = False
	# make sure hamming ! = 0 for i7 and i5 amongst barcodes being added
	for bc_num_x, bc_num_y in itertools.combinations(barcode_numbers, 2):
		if hamming(bc_pop(temp_barcodes[bc_num_x][0], temp_barcodes[bc_num_x][2], len_longest_barcode_i7, barcodes), bc_pop(temp_barcodes[bc_num_y][0], temp_barcodes[bc_num_y][2], len_longest_barcode_i7, barcodes)) == 0 and hamming(bc_pop(temp_barcodes[bc_num_x][1], temp_barcodes[bc_num_x][3], len_longest_barcode_i5, barcodes), bc_pop(temp_barcodes[bc_num_y][1], temp_barcodes[bc_num_y][3], len_longest_barcode_i5, barcodes)) == 0:
			print "%s barcode  %s  is not available because %s barcode %s overlaps @ i7 & i5" % (args.barcode_type, bc_num_x, args.barcode_type, bc_num_y)
			barcodes_available = False
	return barcodes_available

# check if all fields are complete	
def complete(barcode_numbers, barcodes, user):
	barcodes_complete = True
	temp_type = args.barcode_type
	if args.barcode_type == "custom":
		temp_type = args.custom
	for bc_num in barcode_numbers:
		if barcodes[(temp_type, bc_num)][4] != user or barcodes[(temp_type, bc_num)][4] == "---" or barcodes[(temp_type, bc_num)][6] == "0" or barcodes[(temp_type, bc_num)][7] == "0":
			print "%s barcode  %s  is not available or all fields are not filled out" % (temp_type, bc_num)
			barcodes_complete = False		
	return barcodes_complete
	
# check if readied sample names don't overlap
def names_are_valid(barcodes):
	names = []
	for bc in barcodes.keys():
		if barcodes[bc][5].startswith("*") and barcodes[bc][5].endswith("*"):
			if barcodes[bc][5] not in names:
				names.append(barcodes[bc][5])
			else:
				return False
	return True
				
# add ARG
def add(args, barcodes, user):
	barcode_numbers = [int(i) for i in expand_ranges(args.barcode_numbers).split(",")]
	if args.names is not None:
		if "[" in args.names and "]" in args.names:
			packed_sample_numbers = args.names[args.names.find("[")+1:args.names.find("]")]
			dissected_sample_numbers = re.split('\W+', packed_sample_numbers)
			longest = 0
			for num in dissected_sample_numbers:
				if len(num) > longest:
					longest = len(num)
			sample_numbers = expand_ranges(packed_sample_numbers).split(",")
			for i in range(len(sample_numbers)):
				while len(sample_numbers[i]) < longest:
					sample_numbers[i] = "0"+sample_numbers[i]
			sample_numbers = iter(sample_numbers)
			sample_prefix = args.names[:args.names.find("[")]
		else:
			sample_numbers = empty_string()
			sample_prefix = args.names
	

	len_longest_barcode_i7 = find_longest_bc(barcodes, 0)
	len_longest_barcode_i5 = find_longest_bc(barcodes, 1)
	if available(args, barcode_numbers, barcodes, user, len_longest_barcode_i7, len_longest_barcode_i5):
		panel_is_valid = True
		bc_type_temp = args.barcode_type
		if args.panel is not None:
			panel_is_valid = False
			FNULL = open(os.devnull, 'w')
			subprocess.call(['/usr/local/scripts/update_amp_ref.sh'], stdout=FNULL, stderr=subprocess.STDOUT)
			with open('/usr/local/scripts/amplicon_ref.csv', 'rb') as csvfile:
				reader = csv.reader(csvfile, delimiter=',')
				for row in reader:
					if args.panel == row[0]:
						panel_is_valid = True
			if "_" in args.panel:
				panel_is_valid = False
				print "analysis panel names cannot contain underscores, " + user
		if panel_is_valid:
			for bc_num in barcode_numbers:
				if args.barcode_type == "custom":
					bc_type_temp = args.custom
					# add special handling for custom barcodes
					if tuple([args.custom, bc_num]) not in barcodes.keys():
						with open('barcodes_custom.csv', 'rb') as custom_csvfile:
							custom_reader = csv.reader(custom_csvfile, delimiter='\t')
							for row in custom_reader:
								if row[0][0] != "#" and row[0] == bc_type_temp and int(row[1]) == bc_num:
									barcodes.setdefault((row[0], int(row[1])), [row[2], row[3], row[4], row[5], "---", "---", 0, 0, "---", "0,0,0,0"])
				if barcodes[(bc_type_temp, bc_num)][4] != user:
					barcodes[(bc_type_temp, bc_num)][4] = user
					if len_longest_barcode_i7 == find_longest_bc(barcodes, 0) and len_longest_barcode_i5 == find_longest_bc(barcodes, 1):
						hamming_check((bc_type_temp, bc_num), 1, barcodes)
				if args.names is not None:
					barcodes[(bc_type_temp, bc_num)][5] = sample_prefix+next(sample_numbers)
				if args.reads is not None:
					barcodes[(bc_type_temp, bc_num)][6] = args.reads
				if args.size is not None:
					barcodes[(bc_type_temp, bc_num)][7] = args.size
				if args.panel is not None:
					barcodes[(bc_type_temp, bc_num)][8] = args.panel
			len_longest_barcode_i7_new = find_longest_bc(barcodes, 0)
			len_longest_barcode_i5_new = find_longest_bc(barcodes, 1)
			if len_longest_barcode_i7 != len_longest_barcode_i7_new or len_longest_barcode_i5 != len_longest_barcode_i5_new:
				hamming_check(None, 1, barcodes)
			# only hamming_check for all iX if length of length of longest iX changed
			# do this pairwise (somewhere above) with the new ones if a barcode actually got added
			write_barcodes(barcodes)
		else:
			print "analysis panel is not valid!  please try again"

# delete ARG			
def delete(args, barcodes, user): ### ALLOW DELETING EVEN IF HAMMING FAILS
	barcode_numbers = [int(i) for i in expand_ranges(args.barcode_numbers).split(",")]
	len_longest_barcode_i7 = find_longest_bc(barcodes, 0)
	len_longest_barcode_i5 = find_longest_bc(barcodes, 1)
	if available(args, barcode_numbers, barcodes, user, len_longest_barcode_i7, len_longest_barcode_i5):
		to_ham_check = []
		for bc_num in barcode_numbers:
			if args.barcode_type == "custom":
				if barcodes[(args.custom, bc_num)][4] == user:
					to_ham_check.append(bc_num)
				barcodes[(args.custom, bc_num)][4:] = ['---', 'do_not_write', '', '', '', '0,0,0,0']
			else:
				if barcodes[(args.barcode_type, bc_num)][4] == user:
					to_ham_check.append(bc_num)
				barcodes[(args.barcode_type, bc_num)][4:] = ['---', '---', '0', '0', '---', '0,0,0,0']
		for bc_num in to_ham_check:	
			if len_longest_barcode_i7 == find_longest_bc(barcodes, 0) and len_longest_barcode_i5 == find_longest_bc(barcodes, 1):
				if args.barcode_type == "custom":
					hamming_check((args.custom, bc_num), -1, barcodes)
					barcodes[(args.custom, bc_num)][9] = "0,0,0,0"
				else:
					hamming_check((args.barcode_type, bc_num), -1, barcodes)
					barcodes[(args.barcode_type, bc_num)][9] = "0,0,0,0"
	len_longest_barcode_i7_new = find_longest_bc(barcodes, 0)
	len_longest_barcode_i5_new = find_longest_bc(barcodes, 1)
	if len_longest_barcode_i7 != len_longest_barcode_i7_new or len_longest_barcode_i5 != len_longest_barcode_i5_new:
		hamming_check(None, 1, barcodes)
	write_barcodes(barcodes)

#write barcodes back to barcodes_master.csv				
def write_barcodes(barcodes):
	with open('barcodes_master_copy2.csv', 'wb') as csvfile:	
		writer = csv.writer(csvfile, delimiter='\t')
		# skip header
		#next(writer, None)
		for bc in barcodes.keys():
			if barcodes[bc][5] != "do_not_write":
				writer.writerow([bc[0], bc[1]] + barcodes[(bc[0], bc[1])])

# view ARG
def view(args, barcodes, user):
	#hamming_check(barcodes)
	ready_reads = 0
	t = PrettyTable(['type', '#', 'i7', 'i5', 'user', 'sample name', 'reads (M)', 'size (bp)', 'analysis', 'i7 match', 'i7 warning', 'i5 match', 'i5 warning'])
	for bc in barcodes.keys():
		if bc[0] == args.type or args.type == 'all':
			if (args.user == "all" and barcodes[bc][4] != "---") or barcodes[bc][4] == args.user:
				flags = [i for i in barcodes[bc][9].split(",")]
				for i in range(4):
					if flags[i] == "0":
						flags[i] = ""
				t.add_row([bc[0], bc[1], barcodes[bc][0], barcodes[bc][1]] + barcodes[bc][4:9] + flags)
				if barcodes[bc][5].startswith("*") and barcodes[bc][5].endswith("*"):
					ready_reads += float(barcodes[bc][6])
	if args.conflicts:
		print t
	else:
		print(t.get_string(fields=['type', '#', 'i7', 'i5', 'user', 'sample name', 'reads (M)', 'size (bp)', 'analysis']))
	#print "Analysis based on total reads (", total_reads, " M)"
	#print "Minimum barcode distance (i7 and i5): ", min_mismatches_total, " mismatches"
	#print "This run will demux by %s mismatches (single-index) or %s mismatches (dual-index)"
	#print "This run must be read dual-index for proper demuxing."
	print "Ready reads: ", ready_reads, " M"
	#print "Minimum barcode distance (i7 and i5): ", min_mismatches_ready, " mismatches"
	#print "This run will demux by %s mismatches (single-index) or %s mismatches (dual-index)"
	#print "This run must be read dual-index for proper demuxing."

def write_samplesheet(args, barcodes, longest_bc):
	with open(args.output_prefix+"_sample.csv", 'wb') as csvfile:
		writer = csv.writer(csvfile, delimiter=',')
		run_type = [int(n) for n in args.run_type.split("x")]
		writer.writerow(["[Header]"])
		writer.writerow(["IEMFileVersion","4"])
		writer.writerow(["Date",time.strftime("%m/%d/%Y")])
		writer.writerow(["Workflow","GenerateFASTQ"])
		writer.writerow(["Application","FASTQ Only"])
		writer.writerow(["Assay","Bioo Run File"])
		writer.writerow(["Description"])
		if args.dual:
			writer.writerow(["Chemistry","Amplicon"])
		else:
			writer.writerow(["Chemistry","Default"])
		writer.writerow([])
		writer.writerow(["[Reads]"])
		writer.writerow([run_type[1]])
		if(run_type[0] == 2):
			writer.writerow([run_type[1]])
		else:
			writer.writerow("")
			#writer.writerow([0])
		writer.writerow([])
		writer.writerow(["[Settings]"])
		writer.writerow(["ReverseComplement","0"])
		writer.writerow([])
		writer.writerow(["[Data]"])
		if args.dual:
			writer.writerow(["Sample_ID","Sample_Name","Sample_Plate","Sample_Well","I7_Index_ID","index","I5_Index_ID","index2","Sample_Project","Description"])
		else:
			writer.writerow(["Sample_ID","Sample_Name","Sample_Plate","Sample_Well","I7_Index_ID","index","Sample_Project","Description"])

		len_longest_barcode_i7 = find_longest_bc(barcodes, 0)
		len_longest_barcode_i5 = find_longest_bc(barcodes, 1)
		for bc in barcodes.keys():
			if barcodes[bc][5].startswith("*") and barcodes[bc][5].endswith("*"):
				pop_copy_i7 = bc_pop(barcodes[bc][0], barcodes[bc][2], len_longest_barcode_i7, barcodes)
				pop_copy_i5 = bc_pop(barcodes[bc][1], barcodes[bc][3], len_longest_barcode_i5, barcodes)
				if args.dual:
					writer.writerow([barcodes[bc][5].strip("*"), "", "", "", "D7"+bc[0]+"_"+str(bc[1]), pop_copy_i7, "D5"+bc[0]+"_"+str(bc[1]), pop_copy_i5])
				else:
					writer.writerow([barcodes[bc][5].strip("*"), "", "", "", bc[0]+"_"+str(bc[1]), pop_copy_i7])
				if bc[0] not in ['sRNA', '6-nt', '8-nt', '12-nt', 'qRNA', 'di', 'udi', 'budi', 'sRNAudi']:
					barcodes[bc][4:] = ['---', 'do_not_write', '', '', '', '']
				else:
					barcodes[bc][4:] = ['---', '---', '0', '0', '---', '0,0,0,0']
	write_barcodes(barcodes)
	
def write_poolingsheet(args, barcodes):
	users = {}
	len_longest_barcode = 0
	for bc in barcodes.keys():
		if barcodes[bc][5].startswith("*") and barcodes[bc][5].endswith("*"):
			if barcodes[bc][4] not in users:
				#simplified: users[user] = [reads, size]
				users[barcodes[bc][4]] = [float(barcodes[bc][6]), float(barcodes[bc][6])*float(barcodes[bc][7])]
			else:
				users[barcodes[bc][4]] = [users[barcodes[bc][4]][0] + float(barcodes[bc][6]), users[barcodes[bc][4]][1] + float(barcodes[bc][6])*float(barcodes[bc][7])]
	with open(args.output_prefix+"_pooling.csv", 'wb') as csvfile:
		writer = csv.writer(csvfile, delimiter='\t')
		writer.writerow(["pool","reads","size"])
		for u in users:
			writer.writerow(["%s" % u, "%.3f" % users[u][0], "%.0f" % (float(users[u][1])/float(users[u][0]))])

def write_analysissheet(args, barcodes):
	with open('/data/runs/analysis_sheets/'+args.output_prefix+"_analysis.csv", 'wb') as csvfile:
		writer = csv.writer(csvfile, delimiter='\t')
		for bc in barcodes.keys():
			if barcodes[bc][8] != "---":
				writer.writerow([barcodes[bc][5].replace('*',''), barcodes[bc][8]])			

# push ARG					
def push(args, barcodes, user):
	admins = ["kevin", "dfox3", "luke", "allyson", "amanda", "aracele", "eric", "nicole", "mike"]
	if user not in admins:
		print "You're not an admin. Permission denied."
	elif names_are_valid(barcodes):
		with open('/usr/local/scripts/dibs2/backups/'+time.strftime("%Y%m%d")+'.csv', 'wb') as csvfile:	
			writer = csv.writer(csvfile, delimiter='\t')
			for bc in barcodes.keys():
				writer.writerow([bc[0], bc[1]] + barcodes[(bc[0], bc[1])])
		write_analysissheet(args, barcodes)
		longest_bc = write_poolingsheet(args, barcodes)
		write_samplesheet(args, barcodes, longest_bc)
	else:
		print "Some samples have the same name.  Fix this and try again."

def unpush():
	admins = ["kevin", "dfox3", "luke", "allyson", "amanda", "aracele", "eric", "nicole", "mike"]
	if user not in admins:
		print "You're not an admin. Permission denied."
	else:
		shutil.copy2("/usr/local/scripts/dibs2/backups/"+time.strftime("%Y%m%d")+".csv", "barcodes_master_copy2.csv")

# ready ARG
def ready(args, barcodes, user):
	temp_type = args.barcode_type
	if args.barcode_type == "custom":
		temp_type = args.custom
	if args.barcode_numbers == "all":
		barcode_numbers = []
		for bc in barcodes.keys():
			if barcodes[bc][4] == user and bc[0] == temp_type:
				barcode_numbers.append(bc[1])
	else:
		barcode_numbers = [int(i) for i in expand_ranges(args.barcode_numbers).split(",")]
	if complete(barcode_numbers, barcodes, user):
		if args.nope:
			for bc_num in barcode_numbers:
				if barcodes[(temp_type, bc_num)][5].startswith('*') and barcodes[(temp_type, bc_num)][5].endswith('*'):
					barcodes[(temp_type, bc_num)][5] = barcodes[(temp_type, bc_num)][5].strip("*")
		else:
			for bc_num in barcode_numbers:
				if not barcodes[(temp_type, bc_num)][5].startswith('*') and not barcodes[(temp_type, bc_num)][5].endswith('*'):
					barcodes[(temp_type, bc_num)][5] = "*"+barcodes[(temp_type, bc_num)][5]+"*"
		write_barcodes(barcodes)
		

parser = argparse.ArgumentParser(description='DIBS --> Differential Integrated Barcode System')
subparsers = parser.add_subparsers(dest='subparser_name')

parser_add = subparsers.add_parser('add')
parser_add.add_argument('barcode_type', choices=['sRNA', '6-nt', '8-nt', '12-nt', 'qRNA', 'di', 'udi', 'budi', 'sRNAudi', 'custom'])
parser_add.add_argument('barcode_numbers', type=str)
parser_add.add_argument('-n', '--names', type=str, help='name of your sample in format: XX55566[01-12]')
parser_add.add_argument('-r', '--reads', type=float, help='number of reads desired (in millions)')
parser_add.add_argument('-s', '--size', type=int, help='average size of library (in bp)')
parser_add.add_argument('-p', '--panel', type=str, help='analysis type or amplicon panel')
parser_add.add_argument('-c', '--custom', type=str, help='label for custom barcode, must have barcodes_custom.csv in home dir')
parser_add.set_defaults(func=add)

parser_delete = subparsers.add_parser('delete')
parser_delete.add_argument('barcode_type', choices=['sRNA', '6-nt', '8-nt', '12-nt', 'qRNA', 'di', 'udi', 'budi', 'sRNAudi', 'custom'])
parser_delete.add_argument('barcode_numbers', type=str)
parser_delete.add_argument('-c', '--custom', type=str, help='label for custom barcode, must have barcodes_custom.csv in home dir')
parser_delete.set_defaults(func=delete)

parser_view = subparsers.add_parser('view')
parser_view.add_argument('-u', '--user', type=str, default='all', help='only show barcodes claimed by specified user')
parser_view.add_argument('-t', '--type', type=str, default='all', help='only show barcodes of specified type')
parser_view.add_argument('-c', '--conflicts', help='show i7/i5 matches and warnings', action='store_true')
parser_view.set_defaults(func=view)

parser_push = subparsers.add_parser('push')
parser_push.add_argument('-e', '--exclude', type=str, help='exclude specified user from push outputs')
parser_push.add_argument('-o', '--output_prefix', type=str, default='miseq', help='exclude specified user from push outputs')
parser_push.add_argument('-t', '--run_type', type=str, default='1x151', help='ex: 1x151, 2x76')
parser_push.add_argument('-d', '--dual', help='this will be a dual-index run', action='store_true')
parser_push.set_defaults(func=push)

parser_push = subparsers.add_parser('unpush')
parser_push.set_defaults(func=unpush)

parser_ready = subparsers.add_parser('ready')
parser_ready.add_argument('barcode_type', choices=['sRNA', '6-nt', '8-nt', '12-nt', 'qRNA', 'di', 'udi', 'budi', 'sRNAudi', 'custom'])
parser_ready.add_argument('barcode_numbers', type=str)
parser_ready.add_argument('-n', '--nope', help='remove ready status', action='store_true')
parser_ready.add_argument('-c', '--custom', type=str, help='label for custom barcode, must have barcodes_custom.csv in home dir')
parser_ready.set_defaults(func=ready)

args = parser.parse_args()

user = getpass.getuser()
barcodes = SortedDict({})

if args.subparser_name != "view":
	with open('log.txt', 'a') as logfile:
		logfile.write(user+"\t"+str(args)+"\n")

# Read csv
with open('barcodes_master_copy2.csv', 'rb') as csvfile:
	reader = csv.reader(csvfile, delimiter='\t')
	# skip header
	#reader.next()
# read in csv add to SortedDict as key = (type, #), value = [i7,i5,i7_extra,i5_extra,user,name,reads,size,analysis,flag]
	for row in reader:
		if (row[0], int(row[1])) not in barcodes:
			barcodes.setdefault((row[0], int(row[1])), [row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11]])

	args.func(args, barcodes, user)

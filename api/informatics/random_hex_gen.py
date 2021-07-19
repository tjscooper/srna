import os
import sys
import argparse
import random
import json

#-------------------------------------------------------------------------------------------
# arguments for main
parser = argparse.ArgumentParser(description='make plots for srna website')
parser.add_argument('-h1',  
    action='store', 
    dest='h1',
    default="#00A1DE",
    type=str,
    help="hexcode 1")
parser.add_argument('-h2',  
    action='store', 
    dest='h2',
    default="#54B245",
    type=str,
    help="hexcode 2")
parser.add_argument('-i',  
    action='store', 
    dest='i',
    default=7,
    type=int,
    help="iterations")


#-------------------------------------------------------------------------------------------
# global variables for more descriptive code
R = 0
G = 1
B = 2



#-------------------------------------------------------------------------------------------
# main, serves as pipeline
def main():
    print("Generating plots")
    options = parser.parse_args()
    rgb1 = get_rgb_from_hex(options.h1)
    rgb2 = get_rgb_from_hex(options.h2)

    mins = [ i for i in rgb1 ]
    maxs = [ i for i in rgb2 ]
    if mins[R] > maxs[R]:
        mins[R] = rgb2[R]
        maxs[R] = rgb1[R]
    if mins[G] > maxs[G]:
        mins[G] = rgb2[G]
        maxs[G] = rgb1[G]
    if mins[B] > maxs[B]:
        mins[B] = rgb2[B]
        maxs[B] = rgb1[B]
    print("mins")
    print(mins)
    print("maxs")
    print(maxs)

    ret_dict = gen_hexes(mins, maxs, options.i)
    hex_dict = { r:get_hex_from_rgb(ret_dict[r]) for r in ret_dict }

    with open('hexes.json', 'w') as f:
        json.dump(hex_dict, f)


    

def gen_hexes(mins, maxs, iters):
    ret_dict = {}
    if iters > 0:
        for i in range(4):
            ret_dict[str(i)] = tuple([ random.randint(mins[j], maxs[j]) for j in range(3) ])
            new_dict = gen_hexes(mins, maxs, iters-1)
            for n in new_dict:
                ret_dict[str(i)+str(n)] = tuple([ random.randint(mins[j], maxs[j]) for j in range(3) ])
    return ret_dict
    


def get_rgb_from_hex(hex):
    return tuple(int(hex.lstrip("#")[i:i+2], 16) for i in (0, 2, 4))

def get_hex_from_rgb(rgb):
    return '#%02x%02x%02x' % rgb

#-------------------------------------------------------------------------------------------
if __name__ == "__main__":
    main()
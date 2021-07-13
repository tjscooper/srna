import os
import sys
import requests
import argparse
import json

#-------------------------------------------------------------------------------------------
# arguments for main
parser = argparse.ArgumentParser(description='request a post to send email to user')
parser.add_argument('-e',  
    action='store', 
    dest='e',
    required=True,
    type=str,
    help="email")
parser.add_argument('-l1',  
    action='store', 
    dest='l1',
    required=True,
    type=str,
    help="link #1 in html")
parser.add_argument('-l2',  
    action='store', 
    dest='l2',
    required=True,
    type=str,
    help="link #12 in html")


#-------------------------------------------------------------------------------------------
# global variables for more descriptive code


#-------------------------------------------------------------------------------------------
# main, serves as pipeline
def main():
    print("Generating plots")
    options = parser.parse_args()

    base_url="www.booshboosh.net"
    final_url="https://booshboosh.net/courier"

    payload = {'email': str(options.e), 
               'html': "<div style=\"background-color:blue; color:white; width:100%; height:100%\" >\
               <a href=\"" + str(options.l1) + "\">download</a> \
               <br/> \
               <a href=\"" + str(options.l2) + "\">view data</a> \
               </div>" }
    response = requests.post(final_url, data=json.dumps(payload), headers={'Content-Type': 'application/json'})

    print(response.text) #TEXT/HTML
    print(response.status_code, response.reason) #HTTP


#-------------------------------------------------------------------------------------------
if __name__ == "__main__":
    main()
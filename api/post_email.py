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
               'html': "<!DOCTYPE html> \
               <html lang=\"en\">\
               <head>\
               <meta charset="utf-8" />\
               <link href=\"https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Lobster&display=swap\" rel=\"stylesheet\"> \
               </head>\
               <div style=\"width:100%; height:100%\" >\
               <div style=\"background-color:#00A1DE; color:white; font-size:20px> \
               <br/> \
               ANALYSIS \
               <br/> \
               <br/> \
               <div style=\"background-color:#54B245; color:white; font-size:20px> \
               <br/> \
               COMPLETE \
               <br/> \
               <br/> \
               <a style=\"color:white\" href=\"" + str(options.l1) + "\">download</a> \
               <br/> \
               <a style=\"color:white; line-height: 12px; \
                  letter-spacing: 0px; \
                  font-size: 14px; \
                  font-family: 'Lato', sans-serif; \
                  font-weight: 400; \
                  color: var(--grey1); \
                  background-color: #003868; \
                  padding-top: 10px; \
                  padding-left: 20px; \
                  padding-bottom: 10px; \
                  padding-right: 20px; \
                  text-align: center; \
                  border-radius: 4px; \
                  margin: 4px 2px; \
                  border-width: thin; \
                  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.2), 0 2px 10px 0 rgba(0, 0, 0, 0.19);\" \
                  href=\"" + str(options.l2) + "\">view data</a> \
                </div>\
                </html>" }
    response = requests.post(final_url, data=json.dumps(payload), headers={'Content-Type': 'application/json'})

    print(response.text) #TEXT/HTML
    print(response.status_code, response.reason) #HTTP


#-------------------------------------------------------------------------------------------
if __name__ == "__main__":
    main()
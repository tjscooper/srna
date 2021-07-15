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
               <meta charset=\"utf-8\" />\
               <link href=\"https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Lobster&display=swap\" rel=\"stylesheet\"> \
               </head>\
               <div style=\"width:100%; height:100%\" >\
               <div style=\"background-color:#00A1DE; color:white; font-size:28px\"> \
               <br/> \
               </div> \
               <div style=\"background-color:#2faeba; color:white; text-align: center; font-size:28px; font-weight: 200\"> \
               <br/> \
               </div> \
               <div style=\"background-color:#42b297; color:white; font-size:28px\"> \
               <br/> \
               </div> \
               <div style=\"background-color:white; color:#003868; text-align: center;font-size:28px;\"> \
               <br/> \
               <h2>Your sRNA analysis is complete. </h2> \
               <br/> \
               <p style=\"font-size:20px\">Click the buttons below to access data. </p> \
               <br/> \
               <p style=\"font-size:16px\">Reports may only be available for up to a month after analysis. For help with interpreting the analysis, please visit our \
               <a href=\"/technical\">https://www.nextflex.io/technical page</a>.\
               If you have any questions, please forward this email to \
               <a href=\"mailto:NGS@perkinelmer.com\">NGS@perkinelmer.com</a>,\
                as this address will not respond. </p> \
               <br/> \
               <br/> \
               <a style=\"color:white; line-height: 12px; \
                  letter-spacing: 0px; \
                  font-size: 18px; \
                  color: white;\
                  text-decoration: none; \
                  background-color: #003868; \
                  display: inline-block; \
                  miso-padding-alt: 0; \
                  text-align: center; \
                  padding: 14px 20px; \
                  border-radius: 4px; \
                  margin: 4px 2px; \" \
                  href=\"" + str(options.l1) + "\"> \
                    <!--[if mso]> \
                    <i style=\"letter-spacing: 25px; mso-font-width: -100%; mso-text-raise: 30pt;\">&nbsp;</i> \
                    <![endif]-->\
                  <span style=\"mso-text-raise: 15pt;\">Download</span> \
                    <!--[if mso]> \
                    <i style=\"letter-spacing: 25px; mso-font-width: -100%;\">&nbsp;</i> \
                    <![endif]--> \
                  </a> \
               <br/> \
               <br/> \
               <a style=\"color:white; line-height: 12px; \
                  letter-spacing: 0px; \
                  font-size: 18px; \
                  color: white;\
                  text-decoration: none; \
                  background-color: #003868; \
                  display: inline-block; \
                  miso-padding-alt: 0; \
                  text-align: center; \
                  padding: 14px 20px; \
                  border-radius: 4px; \
                  margin: 4px 2px; \" \
                  href=\"" + str(options.l2) + "\"> \
                    <!--[if mso]> \
                    <i style=\"letter-spacing: 25px; mso-font-width: -100%; mso-text-raise: 30pt;\">&nbsp;</i> \
                    <![endif]-->\
                  <span style=\"mso-text-raise: 15pt;\">View data</span> \
                    <!--[if mso]> \
                    <i style=\"letter-spacing: 25px; mso-font-width: -100%;\">&nbsp;</i> \
                    <![endif]--> \
                  </a> \
               <br/> \
               <br/> \
               </div> \
               <div style=\"background-color:#54b678; color:white; font-size:28px\"> \
               <br/> \
               </div> \
               <div style=\"background-color:#7fc574; color:white; text-align: center;font-size:28px;\"> \
               <br/> \
               </div> \
               <div style=\"background-color:#aad9a2; color:white; text-align: center;font-size:28px;\"> \
               <br/> \
               </div> \
               </div>\
               </html>" }
    response = requests.post(final_url, data=json.dumps(payload), headers={'Content-Type': 'application/json'})

    print(response.text) #TEXT/HTML
    print(response.status_code, response.reason) #HTTP


#-------------------------------------------------------------------------------------------
if __name__ == "__main__":
    main()
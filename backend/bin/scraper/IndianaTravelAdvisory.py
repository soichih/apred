#!/usr/bin/python3

#requirement
# camelot-py 0.7.3
# opencv-python

import requests
from pathlib import Path
from bs4 import BeautifulSoup as bs
#import csv
import sys
import json

#filebase = 'IndianaTravelAdvisory'
#filename = Path(filebase + '.pdf')

def normalize(name):
    return name.replace(" ", "").replace(".", "").lower()

#load state/county to fips mapper
statecounty2fip = {}
with open("fips.json") as f:
    fips = json.load(f)
    for fip in fips:
        statecounty2fip[normalize(fip["state"]+"/"+fip["county"])] = fip["statefips"]+fip["countyfips"]

url = "https://www.in.gov/ai/dhs/dhs_travel_advisory.txt"

response = requests.get(url).content #headers={'User-Agent':'Mozilla/5.0'}).text

soup = bs(response, 'lxml')

# Find
counties = soup.find_all('pla_burnban.dbo.status')

data = []

for county in counties:
    posted_date = county.find('posted_date').text
    county_name = county.find('county').text
    travel_status = county.find('travel_status').text

    #search fips code

    #print(posted_date + "\t" + county_name + "\t" + travel_status)
    data.append({"state":"Indiana", "fips": statecounty2fip[normalize("Indiana/"+county_name)], "state": travel_status})

#with open(filebase + ".csv",'w') as f:
#writer = csv.writer(sys.stdout)
#writer.writerows(data)

json.dump(data, sys.stdout)


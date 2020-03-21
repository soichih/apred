#!/usr/bin/python3

#requirement
# camelot-py 0.7.3
# opencv-python

import requests
from pathlib import Path
from bs4 import BeautifulSoup as bs
import csv

filebase = 'IndianaTravelAdvisory'
filename = Path(filebase + '.pdf')

url = "https://www.in.gov/ai/dhs/dhs_travel_advisory.txt"

response = requests.get(url).content #headers={'User-Agent':'Mozilla/5.0'}).text

soup = bs(response, 'lxml')

# Find
counties = soup.find_all('pla_burnban.dbo.status')

# List
data =[['posted_date','county','travel_status']]

for county in counties:
    posted_date = county.find('posted_date').text
    county_name = county.find('county').text
    travel_status = county.find('travel_status').text
    print(posted_date + "\t" + county_name + "\t" + travel_status)
    data.append([posted_date, county_name, travel_status])

with open(filebase + ".csv",'w') as f:
    writer = csv.writer(f)
    writer.writerows(data)




#!/usr/bin/python3

#requirement
# camelot-py 0.7.3
# opencv-python

import camelot
import requests
from pathlib import Path
import pandas as pd
from datetime import date,timedelta
import sys
import re

today = date.today();
yesterday = today - timedelta(days=1)

filebase = 'COVID2019StateTrackingChart'
filename = Path(filebase + '.pdf')

# Find the current PDF url from webiste
nga_url = "https://www.nga.org/coronavirus/"
response = requests.get(nga_url, headers={'User-Agent':'Mozilla/5.0'})
rgx = re.compile(r'https:\/\/www.nga.org\S*orona\S*rack\S*.pdf')
rgx_matches = rgx.findall(response.text)

if len(rgx_matches)>0:
    url = rgx_matches[0]
else:
    #url = "http://www.nga.org/wp-content/uploads/2020/03/COVID19StateTrackingChart.pdf"
    #url = "https://www.nga.org/wp-content/uploads/2020/03/CoronavirusTrackingChart_20Mar2020.pdf"
    url = yesterday.strftime("https://www.nga.org/wp-content/uploads/%Y/%m/CoronavirusTrackingChart_%d%b%Y.pdf")

# Get PDF from URL
response = requests.get(url, headers={'User-Agent':'Mozilla/5.0'})
with open(filename, "wb") as outfile:
    outfile.write(response.content)

tables = camelot.read_pdf(filebase + '.pdf', flavor='lattice', strip_text='.\n', pages='1-end')

#tables.export('source.csv', f='csv', compress=True)
#tables[0].to_csv('source.csv')

tables_df = tables[0].df

if True:
    for i in range(1,len(tables)):
        tables_df = tables_df.append(tables[i].df,ignore_index=True)

tables_df.to_csv(filebase + '.csv', index=False)


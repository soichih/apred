#!/usr/bin/python3

#requirement
# camelot-py 0.7.3
# opencv-python
# xlrd

#import camelot
import requests
from pathlib import Path
import pandas as pd
from datetime import date,timedelta
import sys
import re

today = date.today();
yesterday = today - timedelta(days=1)

#filebase = 'COVID2019StateTrackingChart'
#filename = Path(filebase + '.pdf')

# Find the current PDF url from webiste
nga_url = "https://www.nga.org/coronavirus/"
response = requests.get(nga_url, headers={'User-Agent':'Mozilla/5.0'})
rgx = re.compile(r'https:\/\/www.nga.org\S*orona\S*rack\S*.xlsx')
rgx_matches = rgx.findall(response.text)

if len(rgx_matches) != 1:
    print("failed to find xlsx filename")
    sys.exit(1)

url = rgx_matches[0]
print(url)

#url = "http://www.nga.org/wp-content/uploads/2020/03/COVID19StateTrackingChart.pdf"
#url = "https://www.nga.org/wp-content/uploads/2020/03/CoronavirusTrackingChart_20Mar2020.pdf"
#jurl = yesterday.strftime("https://www.nga.org/wp-content/uploads/%Y/%m/CoronavirusTrackingChart_%d%b%Y.pdf")
#rint(url)
# Get PDF from URL
response = requests.get(url, headers={'User-Agent':'Mozilla/5.0'})
#with open(filename, "wb") as outfile:
#    outfile.write(response.content)

table = pd.read_excel(response.content)

#tables = camelot.read_pdf(filebase + '.pdf', flavor='lattice', strip_text='.\n', pages='1-end')

#tables.export('source.csv', f='csv', compress=True)
#tables[0].to_csv('source.csv')

#tables_df = tables[0].df

#if True:
#    for i in range(1,len(tables)):
#        tables_df = tables_df.append(tables[i].df,ignore_index=True)

table.to_csv(sys.stdout, index=False)


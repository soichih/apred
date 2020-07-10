#!/usr/bin/python3

#requirement
# camelot-py 0.7.3 (I don't think we need this anymore)
# xlrd

import requests
from pathlib import Path
import pandas as pd
from datetime import date,timedelta
import sys
import re

# Find the current PDF url from webiste
nga_url = "https://www.nga.org/coronavirus/"
#https://www.nga.org/wp-content/uploads/2020/06/6-22_Summary-of-State-Actions-Addressing-Business-Reopenings.xlsx
response = requests.get(nga_url, headers={'User-Agent':'Mozilla/5.0'})
rgx = re.compile(r'https:\/\/www.nga.org\S*CoronavirusStateActionsChart\S*.xlsx')
rgx_matches = rgx.findall(response.text)
if len(rgx_matches) != 1:
    print("failed to find xlsx filename")
    sys.exit(1)

url = rgx_matches[0]

#url = "https://www.nga.org/wp-content/uploads/2020/06/CoronavirusStateActionsChart_19June2020.xlsx"

# load the excel file
response = requests.get(url, headers={'User-Agent':'Mozilla'})
table = pd.read_excel(response.content)
table.to_csv(sys.stdout, index=False)


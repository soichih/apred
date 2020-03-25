#!/usr/bin/python3

#requirement
# camelot-py 0.7.3
# opencv-python
# xlrd

import requests
from pathlib import Path
import pandas as pd
from datetime import date,timedelta
import sys
import re

# Find the current PDF url from webiste
nga_url = "https://www.nga.org/coronavirus/"
response = requests.get(nga_url, headers={'User-Agent':'Mozilla/5.0'})
rgx = re.compile(r'https:\/\/www.nga.org\S*orona\S*rack\S*.xlsx')
rgx_matches = rgx.findall(response.text)

if len(rgx_matches) != 1:
    print("failed to find xlsx filename")
    sys.exit(1)

url = rgx_matches[0]

# load the excel file
response = requests.get(url, headers={'User-Agent':'Mozilla/5.0'})
table = pd.read_excel(response.content)
table.to_csv(sys.stdout, index=False)


#!/bin/bash

#APRED raw data extract (all quick)
./extract/fips.js
./extract/statsamerica_eda2018.js
./extract/statsamerica_fema_disasters.js
./extract/statsamerica_noaa_storms.js
./extract/statsamerica_dr.js
./extract/county_geojson.js
./extract/statsamerica_acs.js
./extract/statsamerica_demo2.js

#APRED transform
#0 3 * * * cd ~/git/apred/data && ~/git/apred/backend/bin/extract/COVID2019StateTrackingChart.py > /tmp/new.csv && mv /tmp/new.csv COVID2019StateTrackingChart.csv

./transform/eda2018.js
./transform/cutters.js
./transform/count_noaa_storms.js
./transform/geojson.js

./load/counties.js

#service monitoring (send sms alert if key service is down)
#*/15 * * * * cd ~/git/servicemonitor && ./check.sh > check.log 2>&1


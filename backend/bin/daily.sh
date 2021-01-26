#!/bin/bash

#APRED raw data extract (all quick)
./extract/fips.js
./extract/statsamerica_eda2018.js
./extract/statsamerica_fema_disasters.js
./extract/statsamerica_noaa_storms.js
./extract/statsamerica_dr.js
./extract/statsamerica_acs.js
./extract/statsamerica_bvi.js
./extract/statsamerica_distress.js

#APRED transform
#0 3 * * * cd ~/git/apred/data && ~/git/apred/backend/bin/extract/COVID2019StateTrackingChart.py > /tmp/new.csv && mv /tmp/new.csv COVID2019StateTrackingChart.csv

./transform/eda2018.js
./transform/cutters.js
./transform/count_noaa_storms.js
./transform/geojson.js
./load/counties.js

#service monitoring (send sms alert if key service is down)
#*/15 * * * * cd ~/git/servicemonitor && ./check.sh > check.log 2>&1


#convert geojson to albers 
pubdir=/home/hayashis/git/apred/pub
cat $pubdir/counties_geo.json | dirty-reproject --forward albersUsa > $pubdir/counties_geo.albers.geojson
cat $pubdir/eda2018.geojson | dirty-reproject --forward albersUsa > $pubdir/eda2018.albers.geojson

#test to see if puerto rico is properly mapped
#jq -r '.features[] | select(.properties.statefips=="72")' counties_geo.albers.json 


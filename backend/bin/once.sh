#!/bin/bash

./extract/fips.js
./extract/county_geojson.js
./extract/statsamerica_bea_gdp.js
./extract/statsamerica_noaa_storms_past.js
./extract/statsamerica_fema_disasters_past.js

./transform/find_nearest_tribes.js
./transform/count_noaa_storms.js

#!/bin/bash

./extract/fips.js
./extract/county_geojson.js

./transform/find_nearest_tribes.js
./transform/count_noaa_storms.js

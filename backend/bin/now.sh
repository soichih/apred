#!/bin/bash


#convert geojson to albers 
pubdir="/pub"

#debug..
[ "$(hostname)" == "gpu1-pestillilab.psych.indiana.edu" ] && pubdir=/home/hayashis/git/apred/pub

cat $pubdir/counties_geo.json | dirty-reproject --forward albersUsa > $pubdir/counties_geo.albers.geojson
cat $pubdir/eda2018.geojson | dirty-reproject --forward albersUsa > $pubdir/eda2018.albers.geojson

#test to see if puerto rico is properly mapped
#jq -r '.features[] | select(.properties.statefips=="72")' counties_geo.albers.json 


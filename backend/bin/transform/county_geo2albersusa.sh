#https://www.mapbox.com/elections/albers-usa-projection-style
#https://github.com/developmentseed/dirty-reprojectors


cd ~/git/apred/raw
cat counties_geo.json | dirty-reproject --forward albersUsa > counties_geo.albers.json

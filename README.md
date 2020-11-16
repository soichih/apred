# APRED

APRED (Analysis Platform for Risk, Resilience and Expenditure in Disasters) will provide historical insights from the 2011 disaster data, 
as well as a predictive capability that will be used to improve future funding decisions by local, state and federal agencies.

This repository contains all the source code used to run https://ctil.iu.edu/projects/apred/ 
It mainly consists of 1) backend ETL scripts to load and transform data from StatsAmerica DB, and
2) VueJS frontend to show users the various data aggregated by 1).

## Architecture

<img src="https://docs.google.com/drawings/d/e/2PACX-1vQQ-32ru9jQyRephmCwxx4dVN3DmavPhblELL5pi-yh2AtpFbe9Mf4p4IFd7XsNXJADdNXb9bZnLqOO/pub?w=1440&amp;h=1080">

apred VM runs on IU Jetstream (m1.medium).

```
openstack server create \
    --security-group web \
    --security-group global-ssh \
    --key-name home \
    --flavor m1.medium \
    --image "JS-API-Featured-Ubuntu20-Latest" \
    --nic net-id=ctil \
    apred 

```

Both ETL and auth services currently run on a single apred VM, but they can be launched on 
multiple VMs. We could also run multiple instances of each service as well. 

## ETL Services

We have 2 sets of ETL services we run. 

### `backend/bin/once.sh`

`once.sh` script need to run once per installation and it fetches static(historica) data that do not change

```
./extract/fips.js
./extract/county_geojson.js
./extract/statsamerica_bea_gdp.js
./extract/statsamerica_noaa_storms_past.js
./extract/statsamerica_fema_disasters_past.js

./transform/find_nearest_tribes.js
./transform/count_noaa_storms.js
``

### `backend/bin/daily.sh`

`daily.sh` runs once a day to pull new data from StatsAmerica DB.

```
#APRED raw data extract (all quick)
./extract/fips.js
./extract/statsamerica_eda2018.js
./extract/statsamerica_fema_disasters.js
./extract/statsamerica_noaa_storms.js
./extract/statsamerica_dr.js
./extract/county_geojson.js
./extract/statsamerica_acs.js
./extract/statsamerica_bvi.js

./transform/eda2018.js
./transform/cutters.js
./transform/count_noaa_storms.js
./transform/geojson.js

./load/counties.js
```

The last script `counties.js` generates per-county json to be loaded by APRED UI's county detail page.

Please see each script for more details.

#!/usr/bin/env node
const fs = require('fs');

console.log("count_noaa_storms---------------------------------");

const rawdir = __dirname+"/../../../raw";
const output_file = __dirname+"/../../../data/storm_counts.json";


//keyed by state/county fips, then keyed by EVENT_TYPE, then keyed by year then count
const storms = {
}; 

fs.readdir(rawdir, (err, files)=>{
    if(err) throw err;
    files.forEach(file=>{
        if(file.match(/statsamerica.noaa_storms_counties.*.json/)) {
            console.log(file);
            let json = require(rawdir+"/"+file);
            console.log(json.length);
            json.forEach(rec=>{
                /*
{ BEGIN_YEARMONTH: 195507,
  BEGIN_DAY: 18,
  BEGIN_TIME: 2200,
  END_YEARMONTH: 195507,
  END_DAY: 18,
  END_TIME: 2200,
  EPISODE_ID: 0,
  EVENT_ID: 9990153,
  STATE: 'CALIFORNIA',
  STATE_FIPS: 6,
  YEAR: 1955,
  MONTH_NAME: 'July',
  EVENT_TYPE: 'Thunderstorm Wind',
  CZ_TYPE: 'C',
  CZ_FIPS: 73,
  CZ_NAME: 'SAN DIEGO',
  WFO: '0',
  BEGIN_DATE_TIME: '1955-07-18T22:00:00.000Z',
  CZ_TIMEZONE: 'CST',
  END_DATE_TIME: '1955-07-18T22:00:00.000Z',
  INJURIES_DIRECT: 0,
  INJURIES_INDIRECT: 0,
  DEATHS_DIRECT: 0,
  DEATHS_INDIRECT: 0,
  DAMAGE_PROPERTY: '0.0',
  DAMAGE_CROPS: '0',
  SOURCE: '0',
  MAGNITUDE: '0.0',
  MAGNITUDE_TYPE: '0',
  FLOOD_CAUSE: '0',
  CATEGORY: '0',
  TOR_F_SCALE: '0',
  TOR_LENGTH: '0.0',
  TOR_WIDTH: '0',
  TOR_OTHER_WFO: '0',
  TOR_OTHER_CZ_STATE: '0',
  TOR_OTHER_CZ_FIPS: '0',
  TOR_OTHER_CZ_NAME: '0',
  BEGIN_RANGE: 0,
  BEGIN_AZIMUTH: '0',
  BEGIN_LOCATION: '0',
  END_RANGE: 0,
  END_AZIMUTH: '0',
  END_LOCATION: '0',
  BEGIN_LAT: 33.28,
  BEGIN_LON: -116.28,
  END_LAT: 0,
  END_LON: 0,
  EPISODE_NARRATIVE: '0',
  EVENT_NARRATIVE: '0',
  DATA_SOURCE: 'PUB' }

                */
                let state_fips = rec.STATE_FIPS.toString().padStart(2, '0');
                let county_fips =  rec.CZ_FIPS.toString().padStart(3, '0');
                let fips = state_fips+"."+county_fips;
                
                //county counts
                if(!storms[fips]) storms[fips] = {};
                if(!storms[fips][rec.EVENT_TYPE]) storms[fips][rec.EVENT_TYPE] = {};
                if(!storms[fips][rec.EVENT_TYPE][rec.YEAR]) storms[fips][rec.EVENT_TYPE][rec.YEAR] = 0;
                storms[fips][rec.EVENT_TYPE][rec.YEAR]++;

                //state counts
                if(!storms[state_fips]) storms[state_fips] = {};
                if(!storms[state_fips][rec.EVENT_TYPE]) storms[state_fips][rec.EVENT_TYPE] = {};
                if(!storms[state_fips][rec.EVENT_TYPE][rec.YEAR]) storms[state_fips][rec.EVENT_TYPE][rec.YEAR] = 0;
                storms[state_fips][rec.EVENT_TYPE][rec.YEAR]++;

                //us counts
                if(!storms["us"]) storms["us"] = {};
                if(!storms["us"][rec.EVENT_TYPE]) storms["us"][rec.EVENT_TYPE] = {};
                if(!storms["us"][rec.EVENT_TYPE][rec.YEAR]) storms["us"][rec.EVENT_TYPE][rec.YEAR] = 0;
                storms["us"][rec.EVENT_TYPE][rec.YEAR]++;
            });
        }
    });
    console.dir(storms["us"]);
    fs.writeFileSync(output_file, JSON.stringify(storms));
});

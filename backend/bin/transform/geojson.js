#!/usr/bin/env nodejs
const fs = require('fs');
const config = require('../../config');

console.log("simplify and augment countyes_geo.json ...........................");

const geojson = require(config.pubdir+"/raw/counties_geo.json");
const fips = require(config.pubdir+'/fips.json');

const fips_map = {};
fips.forEach(f=>{
    fips_map[f.statefips+f.countyfips] = f;
});

geojson.features.forEach(feature=>{
    feature.properties.statefips = feature.properties.STATE;
    feature.properties.countyfips = feature.properties.COUNTY;
    feature.properties.fips = feature.properties.STATE + feature.properties.COUNTY;
    let fipscode = feature.properties.statefips + feature.properties.countyfips;
    let f = fips_map[fipscode];
    if(!f) {
        console.error("failed to find fips ("+fipscode+") - using NAME as county");
        console.dir(feature);
        feature.properties.county = feature.properties.NAME;
    } else {
        feature.properties.county = f.county;
        feature.properties.stabb = f.stabb;
        feature.properties.state = f.state;
    }

    delete feature.properties.STATE;
    delete feature.properties.COUNTY;
    delete feature.properties.NAME;
    delete feature.properties.GEO_ID;
    delete feature.properties.LSAD;
});
fs.writeFileSync(config.pubdir+"/counties_geo.json", JSON.stringify(geojson));

//for searching counties
const countyList = [];
geojson.features.forEach(feature=>{
    const props = feature.properties;
    if(props.countyfips) {
        countyList.push({
            value: props.statefips+props.countyfips, 
            label: props.county+", "+props.state
        });
    }
});
fs.writeFileSync(config.pubdir+"/countylist.json", JSON.stringify(countyList));

console.log("all done");



#!/usr/bin/env nodejs
const fs = require('fs');

console.log("simplify and augment countyes_geo.json ...........................");

const geojson = require(__dirname+"/../../../raw/counties_geo.json");
const fips = require(__dirname+'/../../../data/fips.json');

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

fs.writeFileSync(__dirname+"/../../../data/counties_geo.json", JSON.stringify(geojson));
console.log("all done");

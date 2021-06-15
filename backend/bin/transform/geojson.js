#!/usr/bin/env nodejs
const fs = require('fs');
const config = require('../../config');

console.log("simplify and augment countyes_geo.json ...........................");

//const geojson = require(config.pubdir+"/raw/counties_geo.json");
//const geojson = require(config.pubdir+"/raw/counties_bea.geo.json");
const geojson = require(config.pubdir+"/raw/counties_geo.json");

const fips = require(config.pubdir+'/fips.json');
//const beamap = require(config.pubdir+'/beamap.json');

const fips_map = {};
fips.forEach(f=>{
    fips_map[f.statefips+f.countyfips] = f;
});

/*
//apply beafips mapping
beafips.forEach(f=>{
    const oldfips = fips_map[f.statefips+f.countyfips];
    const newfips = fips_map[f.statefips_new+f.countyfips_new];
    if(oldfips && !newfips) {
        //add new fips info 
        oldfips.newfips = f.statefips_new+f.countyfips_new;

        //add new fips mapping (I am not sure if it's used below.. but just in case..)
        fips_map[f.statefips_new+f.countyfips_new] = oldfips;
    }
});
*/

geojson.features.forEach(feature=>{

    //deal with geojson from logan
    /*
    if(feature.properties.FIPS_BEA) {
        const fips = feature.properties.FIPS_BEA;
        feature.properties.statefips = fips.substring(0,2);
        feature.properties.countyfips = fips.substring(2,5);
        feature.properties.fips = fips;
    } else {
        */
    feature.properties.statefips = feature.properties.STATE;
    feature.properties.countyfips = feature.properties.COUNTY;
    feature.properties.fips = feature.properties.STATE + feature.properties.COUNTY;
    let f = fips_map[feature.properties.fips];
    if(!f) {
        console.error("failed to find fips ("+feature.properties.fips+") - using fips as county");
        console.dir(feature);
        feature.properties.county = feature.properties.fips;
    } else {
        feature.properties.county = f.county;
        feature.properties.stabb = f.stabb;
        feature.properties.state = f.state;

        if(f.newfips) feature.properties.newfips = f.newfips;
    }

    //for old geojson
    delete feature.properties.STATE;
    delete feature.properties.COUNTY;
    delete feature.properties.NAME;
    delete feature.properties.GEO_ID;
    delete feature.properties.LSAD;

    //for bea geojson
    //delete feature.properties.FIPS_BEA;
    //console.dir(feature.properties);
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



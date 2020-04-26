#!/usr/bin/env nodejs
const fs = require('fs');

const geojson = require("../../../raw/counties_geo.json");
const disasters = require("../../../raw/statsamerica.disasters.2015-now.json");
const fips = require('../../../data/fips.json');
const eda2018 = require('../../../data/eda2018.json');

const output = "../../../data/counties_geo.json";

const fips_map = {};
fips.forEach(f=>{
    fips_map[f.statefips+f.countyfips] = f;
});

//figure out list of declared disasters for each county
let dd = {}; //keyed by fips
let statedd = {}; //keyed by statefips
let d2017 = new Date("2017-01-01");
let max = null;
disasters.forEach(rec=>{
    let date = new Date(rec.declarationDate);
    if(date > d2017) {
        if(rec.declaredCountyArea == "Statewide") {
            //TODO - I see only 2 records.. there are more than that according to fema
            if(!statedd[rec.statefips]) statedd[rec.statefips] = [];
            if(!statedd[rec.statefips].includes(rec.incidentType)) statedd[rec.statefips].push(rec.incidentType);
        } else {
            let fips = rec.statefips + rec.countyfips;
            if(!dd[fips]) dd[fips] = [];
            if(!dd[fips].includes(rec.incidentType)) dd[fips].push(rec.incidentType);
        }
    }
    if(max == null || max < date) max = date;
});

geojson.features.forEach(feature=>{
    /*
{ type: 'Feature',
  properties:
   { GEO_ID: '0500000US51001',
     STATE: '51',
     COUNTY: '001',
     NAME: 'Accomack',
     LSAD: 'County',
     CENSUSAREA: 449.496 },
  geometry:
   { type: 'MultiPolygon',
     coordinates: [ [Array], [Array], [Array] ] } }
     */
    let fips = feature.properties.STATE+feature.properties.COUNTY; 
    
    /* TODO - why do we need population?
    //sum population total
    if(demo[fips]) {
        let total = demo[fips].reduce((t,v)=>{ return t+v.value}, 0);
        feature.properties.population = total;
    } else {
        console.error("couldn't find demo info for", fips);
    }
    */
    if(dd[fips]) {
        //feature.properties.dd = dd[fips].join("|"); //mapbox can't handle property array
        for(let d of dd[fips]) {
            switch(d){
                case "Flood":
                    feature.properties.isFlood = true; break;
                case "Hurricane":
                    feature.properties.isHurricane = true; break;
                case "Severe Storm(s)":
                    feature.properties.isSevereStorm = true; break;
                case "Earthquake":
                    feature.properties.isEarthquake = true; break;
                case "Coastal Storm":
                    feature.properties.isCoastalStorm = true; break;
                case "Fire":
                    feature.properties.isFire = true; break;
                case "Snow":
                    feature.properties.isSnow = true; break;
                case "Tornado":
                    feature.properties.isTornado = true; break;
                case "Mud/Landslide":
                    feature.properties.isMudLandslide = true; break;
                case "Volcano":
                    feature.properties.isVolcano = true; break;
                case "Dam/Levee Break":
                    feature.properties.isDamLeveeBreak = true; break;
                case "Severe Ice Storm":
                    feature.properties.isSevereIceStorm = true; break;
                case "Biological":
                    feature.properties.isBiological = true; break;
                default: 
                    console.log("unknown disaster type", d);
                    process.exit(1);
            }
        }

        if(fips == "28163") {
            console.log("---------------28163----------------");
            console.dir(dd[fips]);
            console.dir(feature.properties);
        }
    }

    if(statedd[fips]) {
        //feature.properties.dd = dd[fips].join("|"); //mapbox can't handle property array
        for(let d of statedd[fips]) {
            switch(d){
                case "Flood":
                    feature.properties.isStateFlood = true; break;
                case "Hurricane":
                    feature.properties.isStateHurricane = true; break;
                case "Severe Storm(s)":
                    feature.properties.isStateSevereStorm = true; break;
                case "Earthquake":
                    feature.properties.isStateEarthquake = true; break;
                case "Coastal Storm":
                    feature.properties.isStateCoastalStorm = true; break;
                case "Fire":
                    feature.properties.isStateFire = true; break;
                case "Snow":
                    feature.properties.isStateSnow = true; break;
                case "Tornado":
                    feature.properties.isStateTornado = true; break;
                case "Mud/Landslide":
                    feature.properties.isStateMudLandslide = true; break;
                case "Volcano":
                    feature.properties.isStateVolcano = true; break;
                case "Dam/Levee Break":
                    feature.properties.isStateDamLeveeBreak = true; break;
                case "Severe Ice Storm":
                    feature.properties.isStateSevereIceStorm = true; break;
                case "Biological":
                    feature.properties.isStateBiological = true; break;
                default: 
                    console.log("unknown state disaster type", d);
                    process.exit(1);
            }
        }
    }

    feature.properties.statefips = feature.properties.STATE;
    feature.properties.countyfips = feature.properties.COUNTY;
    let f = fips_map[feature.properties.statefips + feature.properties.countyfips];
    if(!f) {
        console.error("failed to find fips - using NAME as county");
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

//add eda2018 award
let eda2018_map = {};
for(let fain in eda2018) {
    let rec = eda2018[fain];
    if(rec.statewide) {
        geojson.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [ rec.lon, rec.lat ],
            },
            properties: {
                award: rec.award_amount,
                eda2018: 'state',
                //awardStr: "$"+(rec.award_amount/1000000).toFixed(2)+"m",
            }
        });
    } else {
        geojson.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [ rec.lon, rec.lat ],
            },
            properties: {
                award: rec.award_amount,
                eda2018: 'county',
                //awardStr: "$"+(rec.award_amount/1000000).toFixed(2)+"m",
            }
        });
    }
}

//console.dir(max);
fs.writeFileSync(output, JSON.stringify(geojson));
console.log("all done");

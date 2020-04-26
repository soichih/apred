#!/usr/bin/env node

const fs = require('fs');
const geo = require('../../../data/counties_geo.json');
//const fips = require('../../../data/fips.json');

const counties = {}; //keyed by fips, then all information for that county

/*
console.log("load state names");
const fips_map = {};
fips.forEach(rec=>{
    let fips = rec.statefips+rec.countyfips;
    fips_map[rec.statefips+rec.countyfips] = rec;
});
*/

console.log("initializing counties");
geo.features.forEach(feature=>{
    let fips = feature.properties.statefips + feature.properties.countyfips;
    counties[fips] = {
        demo: null,
        population: null,
        cutter: null,
        statefips: feature.properties.statefips,
        countyfips: feature.properties.countyfips,
        county: feature.properties.county,
        state: feature.properties.state,
        area: feature.properties.CENSUSAREA,
        _dd: feature.properties.dd, 
        eda2018: [],
        disasters: [],
        storms: null,
        bvis: null, //keyed by each year
    } 
    //lookup state name
    /*
    let fips_info = fips_map[fips];
    if(!fips_info) {
        console.error("no fips info for", fips);
        console.dir(feature);
    } else {
        counties[fips].state = fips_info.state;
    }
    */
});


console.log("loading demographics");
const demo = require('../../../data/statsamerica.demo.json');
for(let fips in demo) {
    if(!counties[fips]) {
        console.error("odd fips in demo?", fips);
        //console.dir(demo[fips]);
        continue;
    }
    counties[fips].demo = demo[fips];
    counties[fips].population = demo[fips].reduce((t,v)=>{ return t+v.value }, 0);
}

//report counties with missing demo
for(let fips in counties) {
    if(!counties[fips].demo) {
        console.error("demo missing for", fips);
    }
}

console.log("loading cutter info");
const cutter = require('../../../data/cutter.json');
for(let fips in cutter.counties) {
    let tokens = fips.split(".");
    let statefips = tokens[0]; 
    let countyfips = tokens[1]; 
    sfips = statefips+countyfips;
    let county_measures = cutter.counties[fips];
    if(!counties[sfips]) {
        console.error("odd fips in cutter?", sfips);
        continue;
    }
    counties[sfips].cutter = JSON.parse(JSON.stringify(cutter.indicators));
    for(let indicator in counties[sfips].cutter) {

        //aggregate for the whole indicator
        let sum = {
            us: 0, 
            states: 0,
            county: 0,
        }
        let sumcount = 0;
        counties[sfips].cutter[indicator].sources.forEach(source=>{
            source.states = source.states[statefips];
            let measure = county_measures.find(m=>m.source == source.id);
            if(!measure) {
                //there are too many that are missing..
                //console.error("missing for source", source.id, "fips", sfips);
                source.county = null;
            } else {
                source.county = measure.value;

                sumcount++;
                sum.us += source.us;
                sum.states += source.states;
                sum.county += source.county;
            }
        });

        counties[sfips].cutter[indicator].aggregate = {
            us: sum.us / sumcount,
            state: sum.states / sumcount,
            county: sum.county / sumcount,
        };
    }
}

console.log("loading eda2018");
const eda2018 = require('../../../data/eda2018.json');
for(let fain in eda2018) {
    eda2018[fain].counties.forEach(county=>{
        let fips = county.statefips+county.countyfips;
        if(!counties[fips]) {
            console.error("odd/missing fips in eda2018", county);
            return;
        }
        counties[fips].eda2018.push(eda2018[fain]);
        //console.dir(fips, fain);
    });
    //console.log(JSON.stringify(counties["01003"], null, 4));
    //process.exit(1);
}

function handle_disaster(rec) {
    if(rec.declaredCountyArea == "Statewide") {
        //add it to all county in the state
        for(let fip in counties) {
            let county = counties[fip];
            if(fip.startsWith(rec.statefips)) {
                county.disasters.push(rec);
            }
        }
    } else {
        //county specific
        let fips = rec.statefips+rec.countyfips;
        if(!counties[fips]) {
            console.error("odd/missing fips in disaster rec", fips);
            return;
        }
        counties[fips].disasters.push(rec);
    }
}

console.log("loading past disasters");
const disasters_past = require("../../../raw/statsamerica.disasters.1953-2015.json");
disasters_past.forEach(handle_disaster);

console.log("loading recent disasters");
const disasters_recent = require("../../../raw/statsamerica.disasters.2015-now.json");
disasters_recent.forEach(handle_disaster);

console.log("loading storm counts");
const storm_counts = require("../../../data/storm_counts.json");
for(let fips in storm_counts) {
    let storms = storm_counts[fips];
    fips = fips.replace(".", "");
    if(!counties[fips]) {
        console.error("odd fips in storm counts?", fips);
        continue;
    }
    //console.log(fips, storms);
    counties[fips].storms = storms;
}

console.log("loading bvi.csv");
const csvParser = require('csv-parser');
fs.createReadStream('../../../raw/bvi.csv').pipe(csvParser({
    headers: [ 
        "year","county","estab_total","estab_vuln_total","estab_vuln_pct","mm_employees","emp_vuln_total","emp_vuln_pct"
    ],
    mapValues({header, index, value}) {
        if(header.match("_date")) return new Date(value);
        let i = parseInt(value);
        let f = parseFloat(value);
        if(i == value) return i;
        if(f == value) return f;
        return value;
    },
})).on('data', rec=>{
    delete rec.estab_vuln_pct;
    delete rec.emp_vuln_pct;
    /*
    { year: 2017,
  county: 55141,
  estab_total: 1781,
  estab_vuln_total: 167,
  mm_employees: 37082,
  emp_vuln_total: 2053 }
    */
    let fips = rec.county.toString()
    if(!counties[fips]) {
        console.error("odd fips in bvi (rec.county)", fips);
        console.dir(rec);
        return;
    }
    if(!counties[fips].bvis) counties[fips].bvis = [];
    counties[fips].bvis.push(rec);
}).on('end', ()=>{

    for(let fips in counties) {
        if(counties[fips].bvis) counties[fips].bvis.sort((a,b)=>a.year - b.year);
        if(counties[fips].disasters) counties[fips].disasters.sort((a,b)=>new Date(a.declarationDate) - new Date(b.declarationDate));
    }

    console.log("saving jsons");
    for(let fips in counties) {
        fs.writeFileSync("../../../data/counties/county."+fips+".json", JSON.stringify(counties[fips]));
    }
    console.log("all done");
});

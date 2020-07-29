#!/usr/bin/env nodejs

//const MongoClient = require('mongodb').MongoClient;
const csvParser = require('csv-parser');
const fs = require('fs');
const async = require('async');

console.log("cutters----------------------------------");

let data = {
    fips: [],
    cutter: {
        counties: {},
        indicators: {
            "SOC": {id: "1", name: "Social Resilience"},
            "ECON": {id: "2", name: "Economic Resilience"},
            "INST": {id: "3", name: "Institutional Resilience"},
            "IHFR": {id: "4", name: "Infrastructure Resilience"},
            "COMM": {id: "5", name: "Community Capital"},
            "FLOR": {id: "100", name: "Special/Custom"},
        },
    }
}; 

//create cutter source catalog with us/state average/sdev
async.series([
    load_fips,
    load_cutter_sources,

    //main disaster resilience
    load_dr,

], err=>{
    if(err) throw err;

    let recs = [];
    for(let fips in data.cutter.counties) {
      let fips_rec = data.fips.find(rec=>(rec.statefips+"."+rec.countyfips == fips));
      if(!fips_rec) throw "no such fip:"+fips;
      recs.push(Object.assign(data.cutter.counties[fips], {
          fips,
          state: fips_rec.state,
          stabb: fips_rec.stabb,
          county: fips_rec.county,
      }));
    }
    fs.writeFileSync(__dirname+"/../../../data/cutter.json", JSON.stringify(data.cutter));
});

function load_fips(cb) {
    console.debug("loading fips");
    data.fips = require(__dirname+"/../../../data/fips.json");
    data.fips.forEach(rec=>{
        let fips = rec.statefips+'.'+rec.countyfips;
        if(!data.cutter.counties[fips]) data.cutter.counties[fips] = [];
    });
    cb();
}

function load_cutter_sources(cb) {
    console.debug("loading cutter sources");
    fs.createReadStream(__dirname+'/../../../raw/cutters/source_export.csv').pipe(csvParser({
        mapHeaders({header, index}) {
            return header.toLowerCase();
        },
    })).on('data', async rec=>{
        let indicator = Object.values(data.cutter.indicators).find(i=>i.id == rec.indicator);
        if(!indicator.sources) indicator.sources = [];
        indicator.sources.push({id: rec.id, name: rec.name});
    }).on('end', ()=>{
        console.log(JSON.stringify(data.cutter.indicators, null, 4));
        cb();
    });
}

function load_dr(cb) {
    //create dictionary of all sources 
    let sources = {};
    for(let indicator in data.cutter.indicators) {
        data.cutter.indicators[indicator].sources.forEach(source=>{
            sources[source.id] = source;
            source.total = 0;
            source.count = 0;
            source.states = {};
        });
    }

    console.debug("loading dr_normalized");
    let count_missing = 0;
    let dr = require(__dirname+'/../../../raw/dr_normalized.json');

    dr.forEach(rec=>{
        if(rec.year != "2018") return; //let's use 2018 data for now
        let fips = rec.statefips+"."+rec.countyfips;
        if(!data.cutter.counties[fips]) {
            console.log("failed to find:"+fips);
            console.dir(rec);
            count_missing++;
            return;
        }
        data.cutter.counties[fips].push({
            source: rec.measure, 
            value: parseFloat(rec.measure_value_normalized),
        }); 
        //
        //aggregate average 
        let source = sources[rec.measure];
        if(!source) console.log("missing"+rec.measure);
        else {
            source.total += parseFloat(rec.measure_value_normalized);
            source.count++;
            if(!source.states[rec.statefips]) source.states[rec.statefips] = { total: 0, count: 0 };
            source.states[rec.statefips].total += parseFloat(rec.measure_value_normalized);
            source.states[rec.statefips].count++;
        }
    });
    console.log("missing", count_missing, "out of", dr.length);

    //convert total/count to average
    for(let indicator in data.cutter.indicators) {
        data.cutter.indicators[indicator].sources.forEach(source=>{
            source.us = +(source.total / source.count).toFixed(3);
            delete source.total;
            delete source.count;

            for(let statefip in source.states) {
                let total = source.states[statefip].total;
                let count = source.states[statefip].count;
                source.states[statefip] = +(total / count).toFixed(3);
            }
        });
    }
    cb();
}


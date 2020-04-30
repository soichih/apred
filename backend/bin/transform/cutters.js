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
    load_cutter_combined,
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

function load_cutter_combined(cb) {
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
    console.dir(sources);

    console.debug("loading cutter combined");
    let count_missing = 0;
    let count_recs = 0;
    fs.createReadStream(__dirname+'/../../../raw/cutters/measure_export.csv').pipe(csvParser({
        mapHeaders({header, index}) {
            return header.toLowerCase();
        },
    })).on('data', rec=>{
        count_recs++;
        let input_fip = rec.fips; //6029 > 06.029
        if(input_fip.length == 4) input_fip = "0"+input_fip;
        let state_fips = input_fip.substring(0,2);
        let county_fips = input_fip.substring(2,5);
        let fips = state_fips+"."+county_fips;
        if(!data.cutter.counties[fips]) {
            console.log("failed to find:"+fips);
            console.dir(rec);
            count_missing++;
            return;
        }
        data.cutter.counties[fips].push({source: rec.source, value: parseFloat(rec.value)/*, date: rec.date*/});

        //aggregate average 
        let source = sources[rec.source];
	if(!source) console.log("missing"+rec.source);
        source.total += parseFloat(rec.value);
        source.count++;
        if(!source.states[state_fips]) source.states[state_fips] = { total: 0, count: 0 };
        source.states[state_fips].total += parseFloat(rec.value);
        source.states[state_fips].count++;

    }).on('end', ()=>{

        console.log("missing", count_missing, "out of", count_recs);

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
    });
}


#!/usr/bin/env nodejs

const csvParser = require('csv-parser');
const fs = require('fs');
const async = require('async');

console.log("cutters----------------------------------");

//https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
function standardDeviation(avg, values){
  //var avg = average(values);

  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

let data = {
    fips: [],
    cutter: {
        counties: {},
        indicators: {
            "SOC": {id: "1", name: "Social Resilience"},
            "ECON": {id: "2", name: "Economic Resilience"},
            //"INST": {id: "3", name: "Institutional Resilience"},
            "IHFR": {id: "4", name: "Infrastructure Resilience"},
            "COMM": {id: "5", name: "Community Capital"},
            //"FLOR": {id: "100", name: "Special/Custom"},
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
    fs.writeFileSync(__dirname+"/../../../data/cutter2.json", JSON.stringify(data.cutter));
});

function load_fips(cb) {
    console.debug("loading fips");
    data.fips = require(__dirname+"/../../../data/fips.json");
    data.fips.forEach(rec=>{
        let fips = rec.statefips+'.'+rec.countyfips;
        if(!data.cutter.counties[fips]) data.cutter.counties[fips] = {}; 
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

    console.debug("loading dr");
    let count_missing = 0;
    
    let dr = require(__dirname+'/../../../raw/dr.json');

    dr.forEach(rec=>{
        /*
        {
          statefips: '30',
          countyfips: '059',
          measure: '11',
          measure_category: '1',
          year: '2018',
          measure_value: 4.8375, //from dr.json
          measure_value_normalized: null //from dr_normalize.json
        }
        */
        let v = rec.measure_value;

        let fips = rec.statefips+"."+rec.countyfips;
        if(!data.cutter.counties[fips]) {
            console.log("failed to find:"+fips);
            count_missing++;
            return;
        }
        if(!data.cutter.counties[fips][rec.measure]) data.cutter.counties[fips][rec.measure] = {};
        data.cutter.counties[fips][rec.measure][rec.year] = parseFloat(v);
        //aggregate average across whole country
        if(!sources[rec.measure]) sources[rec.measure] = {};
        if(!sources[rec.measure][rec.year]) sources[rec.measure][rec.year] = {
            vs: [], //all counties
            states: {}, //grouped by each state
        };
        let source = sources[rec.measure][rec.year];
        source.vs.push(parseFloat(v));

        //aggregate for each state
        if(!source.states[rec.statefips]) source.states[rec.statefips] = { vs: [] };
        source.states[rec.statefips].vs.push(parseFloat(v));
    });
    console.log("coudn't find fips for", count_missing, "out of", dr.length, "drs");

    for(let measure in sources) {
        for(let year in sources[measure]) {
            let source = sources[measure][year];

            //whole us avg/sdev
            let usavg = average(source.vs);
            source.us = {
                avg: usavg,
                sdev: standardDeviation(usavg, source.vs),
            }
            delete source.vs;

            //state specific avg/sdev
            for(let state in source.states) {
                let ssource = source.states[state];
                ssource.avg = average(ssource.vs);
                ssource.sdev = standardDeviation(ssource.avg, ssource.vs);

                delete ssource.vs;
            }
        }
    }
    
    //console.log(JSON.stringify(sources, null, 4));
    //process.exit(1);

    for(let indicator in data.cutter.indicators) {
        data.cutter.indicators[indicator].sources.forEach(source=>{
            source.stats = sources[source.id];
        })
    }

    cb();
}


#!/usr/bin/env nodejs

const csvParser = require('csv-parser');
const fs = require('fs');
const config = require('../../config');
const async = require('async');

console.log("cutters----------------------------------");

//https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
function standardDeviation(avg, values){
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

    //load fips info to each cutter counties
    for(let fips in data.cutter.counties) {
        let fips_rec = data.fips.find(rec=>(rec.statefips+"."+rec.countyfips == fips));
        if(!fips_rec) throw "no such fip:"+fips;
        Object.assign(data.cutter.counties[fips], {
            fips,
            state: fips_rec.state,
            stabb: fips_rec.stabb,
            county: fips_rec.county,
        });
    }
    fs.writeFileSync(config.pubdir+"/cutter2.json", JSON.stringify(data.cutter));

    //create cutter_long.json which contains summarized indices for each county 
    //aggregate measure into 4 big categories like..
    /*
  "56.029": {
    "SOC": [
      0.611,
      0.599,
      0.624,
      0.593,
      0.614,
      0.623,
      0.599
    ],
    "ECON": [
      0.721,
      0.726,
      0.726,
      0.706,
      0.694,
      0.677,
      0.68
    ],
    "IHFR": [
      0.531,
      0.512,
      0.54,
      0.596,
      0.601,
      0.595,
      0.651
    ],
    "COMM": [
      0.702,
      0.705,
      0.593,
      0.621,
      0.719,
      0.614,
      0.391
    ]
  },
    */
   
    //find min/max for each measure so we can normalize values
    let mins = {}; 
    let maxs = {}; 
    for(let fips in data.cutter.counties) {
        for(let id in data.cutter.counties[fips]) {
            let values = Object.values(data.cutter.counties[fips][id]);
            values = values.filter(v=>v !== undefined);
            let min = Math.min(...values);
            let max = Math.max(...values);
            if(mins[id] === undefined) mins[id] = min;
            else mins[id] = Math.min(mins[id], min);
            if(maxs[id] === undefined) maxs[id] = max;
            else maxs[id] = Math.max(maxs[id], max);
        }
    }

    //for each county
    let summaries = {};
    for(let fips in data.cutter.counties) {
        summaries[fips] = {};
        //iterate over indicator groups
        for(let indicator in data.cutter.indicators) {
            summaries[fips][indicator] = []; //contains years
            //we process each year separately
            for(let year = 2012; year <= 2018; ++year) {
                let total = 0;
                let counts = 0;
                //then iterate over measure id (source.id) and aggregate that year
                data.cutter.indicators[indicator].sources.forEach(source=>{
                    if(data.cutter.counties[fips][source.id]) {
                        const v = data.cutter.counties[fips][source.id][year.toString()]
                        if(v !== undefined) {
                            let normalized = (v - mins[source.id]) / (maxs[source.id] - mins[source.id]);
                            total += normalized;
                            counts++;
                        }
                    }
                });
                let avg = null;
                if(counts > 0) avg = total/counts;
                summaries[fips][indicator].push(avg);
            }
        }
    }

    fs.writeFileSync(config.pubdir+"/cutter_long.json", JSON.stringify(summaries));
});

function load_fips(cb) {
    console.debug("loading fips");
    data.fips = require(config.pubdir+"/fips.json");
    data.fips.forEach(rec=>{
        let fips = rec.statefips+'.'+rec.countyfips;
        if(!data.cutter.counties[fips]) data.cutter.counties[fips] = {}; 
    });
    cb();
}

function load_cutter_sources(cb) {
    console.debug("loading cutter sources");
    fs.createReadStream(__dirname+'/source_export.csv').pipe(csvParser({
        mapHeaders({header, index}) {
            return header.toLowerCase();
        },
    })).on('data', async rec=>{
        let indicator = Object.values(data.cutter.indicators).find(i=>i.id == rec.indicator);
        if(!indicator.sources) indicator.sources = [];
        indicator.sources.push({id: rec.id, name: rec.name});
    }).on('end', ()=>{
        //console.log(JSON.stringify(data.cutter.indicators, null, 4));
        cb();
    });
}

function load_dr(cb) {
    let sources = {};

    console.debug("loading dr");
    let count_missing = 0;
    
    let dr = require(config.pubdir+'/raw/dr.json');
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

    //compute average/sdev
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
    
    for(let indicator in data.cutter.indicators) {
        data.cutter.indicators[indicator].sources.forEach(source=>{
            source.stats = sources[source.id];
        })
    }
    cb();
}


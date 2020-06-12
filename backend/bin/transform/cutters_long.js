#!/usr/bin/env nodejs

//const MongoClient = require('mongodb').MongoClient;
const csvParser = require('csv-parser');
const fs = require('fs');
const async = require('async');

console.log("cutters----------------------------------");

let data = {
    fips: [],
    indicators: {
        "SOC": {id: "1", name: "Social Resilience"},
        "ECON": {id: "2", name: "Economic Resilience"},
        //"INST": {id: "3", name: "Institutional Resilience"},
        "IHFR": {id: "4", name: "Infrastructure Resilience"},
        "COMM": {id: "5", name: "Community Capital"},
        //"FLOR": {id: "100", name: "Special/Custom"},
    },
    cutter: {
        counties: {},
        counties_mean: {},
    }
}; 

function findClassFromMeasure(mid) {
    for(let c in data.indicators) {
        let source = data.indicators[c].sources.find(source=>source.id == mid);
        if(source) return c;
    }
    return null;
}

//create cutter source catalog with us/state average/sdev
async.series([
    load_fips,
    load_cutter_sources,

    //main disaster resilience
    load_dr,

], err=>{
    if(err) throw err;

    //aggregate values for each cutter indicators
    let recs = [];
    for(let fips in data.cutter.counties) {
        /*
      let fips_rec = data.fips.find(rec=>(rec.statefips+"."+rec.countyfips == fips));
      if(!fips_rec) throw "no such fip:"+fips;
      recs.push(Object.assign(data.cutter.counties[fips], {
          fips,
          state: fips_rec.state,
          stabb: fips_rec.stabb,
          county: fips_rec.county,
      }));
        */
        //console.dir(data.cutter.counties[fips]);
        /*
        {
          '11': [
            0.3842, 0.3726,
            0.3585, 0.3412,
             0.333, 0.3327,
            0.3291
          ],
          '12': [
            0.5799, 0.5787,
            0.5654, 0.5415,
            0.5354, 0.5135,
             0.515
          ],
        
        */

        //put all sets of values together for each county and each cutter classes
        let measures = data.cutter.counties[fips];
        for(let mid in measures) {
            let cid = findClassFromMeasure(mid);
            let values = measures[mid];
            if(!data.cutter.counties_mean[fips]) data.cutter.counties_mean[fips] = {};
            if(!data.cutter.counties_mean[fips][cid]) data.cutter.counties_mean[fips][cid] = [];
            data.cutter.counties_mean[fips][cid].push(values);
        }

        //then compute means
        let means = {};
        for(let cid in data.cutter.counties_mean[fips]) {
            let sets = data.cutter.counties_mean[fips][cid];

            if(!means[cid]) means[cid] = []; 
            for(let y = 0;y < sets[0].length; ++y) {
                let sum = 0;
                let count = 0;
                sets.forEach(set=>{
                    if(set[y]) {
                        sum += set[y];
                        count++;
                    }
                });
                if(count > 0) means[cid][y] = Number((sum/count).toFixed(3));
            }
        }
        data.cutter.counties_mean[fips] = means; //replace by means
    }
    fs.writeFileSync(__dirname+"/../../../data/cutter_long.json", JSON.stringify(data.cutter.counties_mean));
});

function load_fips(cb) {
    console.debug("loading fips");
    data.fips = require(__dirname+"/../../../data/fips.json");
    data.fips.forEach(rec=>{
        let fips = rec.statefips+'.'+rec.countyfips;
        if(!data.cutter.counties[fips]) data.cutter.counties[fips] = {}; //measures, then values for each years
    });
    cb();
}

function load_cutter_sources(cb) {
    console.debug("loading cutter sources");
    fs.createReadStream(__dirname+'/../../../raw/cutters/source_export.csv').pipe(csvParser({
        mapHeaders({header, index}) {
            return header.toLowerCase();
        },
    })).on('data', rec=>{
        let indicator = Object.values(data.indicators).find(i=>i.id == rec.indicator);
        if(!indicator) return; //we don't care about this anymore
        if(!indicator.sources) indicator.sources = [];
        indicator.sources.push({id: rec.id, name: rec.name});
    }).on('end', ()=>{
        cb();
    });
}

function load_dr(cb) {
    console.debug("loading dr_normalized");
    let count_missing = 0;
    let dr = require(__dirname+'/../../../raw/dr_normalized.json');
    dr.forEach(rec=>{
        //if(rec.year != "2018") return; //let's use 2018 data for now
        let fips = rec.statefips+"."+rec.countyfips;
        if(!data.cutter.counties[fips]) {
            console.log("failed to find:"+fips);
            console.dir(rec);
            count_missing++;
            return;
        }

        //initialize 
        if(!data.cutter.counties[fips][rec.measure]) {
            data.cutter.counties[fips][rec.measure] = []; //2012 - 
        }

        data.cutter.counties[fips][rec.measure][rec.year - 2012] = parseFloat(rec.measure_value_normalized.toFixed(4));
    });
    console.log("missing", count_missing, "out of", dr.length);
    cb();
}


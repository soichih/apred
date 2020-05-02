#!/usr/bin/env node

console.log("counties----------------------------");

const fs = require('fs');
const geo = require(__dirname+'/../../../data/counties_geo.json');
const csvParser = require('csv-parser');

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
const demo = require(__dirname+'/../../../raw/statsamerica.demo.json');
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
process.exit(1);

console.log("loading cutter info");
const cutter = require(__dirname+'/../../../data/cutter.json');
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
        //if(indicator == "INST" || indicator == "FLOR") continue; //ignore institutional or special/custerom index

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
const eda2018 = require(__dirname+'/../../../data/eda2018.json');
for(let fain in eda2018) {
    eda2018[fain].counties.forEach(county=>{
        let fips = county.statefips+county.countyfips;
        if(!counties[fips]) {
            console.error("odd/missing fips in eda2018", county);
            return;
        }
        counties[fips].eda2018.push(eda2018[fain]);
    });
    //console.log(JSON.stringify(counties["01003"], null, 4));
    //process.exit(1);
}

function handle_disaster(rec) {
    //if(rec.declaredCountyArea == "Statewide") {
    if(rec.designatedArea == "Statewide") {
        //add it to all county in the state
        for(let fip in counties) {
            let county = counties[fip];
            if(fip.startsWith(rec.fipsStateCode)) {
                county.disasters.push(rec);
            }
        }
    } else {
        //county specific
        let fips = rec.fipsStateCode+rec.fipsCountyCode;
        if(!counties[fips]) {
            console.error("odd/missing fips in disaster rec", fips);
            return;
        }
        counties[fips].disasters.push(rec);
    }
}

console.log("loading past disasters");
const disasters_past = require(__dirname+"/../../../raw/statsamerica.disasters.1953-2015.json");
disasters_past.forEach(handle_disaster);

console.log("loading recent disasters");
const disasters_recent = require(__dirname+"/../../../raw/statsamerica.disasters.2015-now.json");
disasters_recent.forEach(handle_disaster);

console.log("loading storm counts");
const storm_counts = require(__dirname+"/../../../data/storm_counts.json");
disasters_past.forEach(handle_disaster);

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

console.log("loading PublicAssistanceFundedProjectsDetails");
fs.createReadStream(__dirname+'/../../../raw/PublicAssistanceFundedProjectsDetails.csv').pipe(csvParser({
    mapValues({header, index, value}) {
        /*
disasterNumber,declarationDate,incidentType,pwNumber,applicationTitle,applicantId,damageCategoryCode,dcc,damageCategory,projectSize,county,countyCode,state,stateCode,stateNumberCode,projectAmount,federalShareObligated,totalObligated,obligatedDate,hash,lastRefresh,id
1239,1998-08-26T19:50:08.000Z,Severe Storm(s),35,Not Provided,463-99463-00,C - Roads and Bridges,C,Roads and Bridges,Small,Uvalde,463,Texas,TX,48,5322.68,3992.01,4193.21,1998-10-23T11:29:35.000Z,43e2970d712f048bafa5b0ee8850baf2,2020-01-10T02:34:41.169Z,5e17e2c1c3cdaf7453a4eda7
        */
        /*
        if(header.match("_date")) return new Date(value);
        let i = parseInt(value);
        let f = parseFloat(value);
        if(i == value) return i;
        if(f == value) return f;
        */
        if(header.match("declarationDate")) return new Date(value);
        if(header.match("projectAmount")) return Number(value);
        if(header.match("federalShareObligated")) return Number(value);
        if(header.match("totalObligated")) return Number(value);
        return value;
    },
    /*
    mapHeaders({header, index}) {
        return header.toLowerCase();
    },
    */
})).on('data', async rec=>{
    let fips = rec.stateNumberCode.padStart(2, '0')+rec.countyCode.padStart(3, '0');
    /*
{ disasterNumber: '1239',
  declarationDate: 1998-08-26T19:50:08.000Z,
  incidentType: 'Severe Storm(s)',
  pwNumber: '35',
  applicationTitle: 'Not Provided',
  applicantId: '463-99463-00',
  damageCategoryCode: 'C - Roads and Bridges',
  dcc: 'C',
  damageCategory: 'Roads and Bridges',
  projectSize: 'Small',
  county: 'Uvalde',
  countyCode: '463',
  state: 'Texas',
  stateCode: 'TX',
  stateNumberCode: '48',
  projectAmount: '5322.68',
  federalShareObligated: '3992.01',
  totalObligated: '4193.21',
  obligatedDate: '1998-10-23T11:29:35.000Z',
  hash: '43e2970d712f048bafa5b0ee8850baf2',
  lastRefresh: '2020-01-10T02:34:41.169Z',
  id: '5e17e2c1c3cdaf7453a4eda7' }
    */

    //look for county
    let county = counties[fips];
    if(!county) {
        return;
    }

    //look for disaster
    let disaster = county.disasters.find(disaster=>disaster.disasterNumber == rec.disasterNumber);
    if(!disaster) {
        return;
    }
    if(!disaster.pa) disaster.pa = [];
    disaster.pa.push({
        pwNumber: rec.pwNumber, 
        //damageCategoryCode: rec.damageCategoryCode,
        dcc: rec.dcc,
        damageCategory: rec.damageCategory,
        projectSize: rec.projectSize,
        projectAmount: rec.projectAmount,
        totalObligated: rec.totalObligated,
        federalShareObligated: rec.federalShareObligated,
        obligatedDate: rec.obligatedDate,
    });
    
    //console.dir(disaster.pa);
    /*
    let indicator = Object.values(data.cutter.indicators).find(i=>i.id == rec.indicator);
    if(!indicator.sources) indicator.sources = [];
    indicator.sources.push({id: rec.id, name: rec.name});
    */
}).on('end', ()=>{
    //console.log(JSON.stringify(data.cutter.indicators, null, 4));

    console.log("loading bvi.csv");
    fs.createReadStream(__dirname+'/../../../raw/bvi.csv').pipe(csvParser({
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

        //finalize!
        for(let fips in counties) {
            if(counties[fips].bvis) counties[fips].bvis.sort((a,b)=>a.year - b.year);
            if(counties[fips].disasters) counties[fips].disasters.sort((a,b)=>new Date(a.declarationDate) - new Date(b.declarationDate));
        }

        console.log("saving jsons");
        for(let fips in counties) {
            fs.writeFileSync(__dirname+"/../../../data/counties/county."+fips+".json", JSON.stringify(counties[fips]));
        }
        console.log("all done");
    });
});

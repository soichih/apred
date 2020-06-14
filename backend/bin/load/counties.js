#!/usr/bin/env node

console.log("counties----------------------------");

const fs = require('fs');
const geo = require(__dirname+'/../../../data/counties_geo.json');
const tribes = require(__dirname+'/../../../data/tribes.json');
const csvParser = require('csv-parser');

const counties = {}; //keyed by fips, then all information for that county

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
        gdp: null, 
        medianincome: null, 
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
        //console.error("odd fips in demo?", fips);
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

console.log("loading median income");
const medianincome = require(__dirname+'/../../../raw/statsamerica.acs.medianincome.json');
for(let rec of medianincome) {
    let fips = rec.geo_id.toString();
    if(fips.length > 6) continue; //ignore odd one
    if(fips.length == 6 && fips[0] == "1") fips = fips.substring(1);
    if(!counties[fips]) {
        //console.error("odd fips in medianincome?", fips);
        continue;
    }
    //{"geo_id":33647834,"time_id":2011,"code_id":307,"data":56404}
    //counties[fips].demo = demo[fips];
    //counties[fips].population = demo[fips].reduce((t,v)=>{ return t+v.value }, 0);
    counties[fips].medianincome = rec.data;
}


console.log("loading bea county gdb");
const gdps = require(__dirname+'/../../../raw/statsamerica.bea.gdp.json');
for(let gdp of gdps) {
    /*
    {
      statefips: '02',
      countyfips: '158',
      linecd: '0036',
      year: '2001',
      disc_c: '0',
      gcp_c: 3940,
      disc_r: '0',
      gcp_r: 4278,
      disc_idx: '0',
      gcp_idx: 90.032
    }
    GCP_C = GDP in current dollars
    GCP_R = Real GDP in chained dollars (2012 dollars)
    GCP_IDX = Quantity indexes for real GDP
    */
    let fips = gdp.statefips+gdp.countyfips;
    if(!counties[fips]) {
        //console.error("odd fips in gdp?", fips);
        //console.dir(gdp);
        continue;
    }
    //counties[fips].demo = demo[fips];
    //counties[fips].population = demo[fips].reduce((t,v)=>{ return t+v.value }, 0);
    counties[fips].gdp = gdp.gcp_c; //GDP in current dollars
}

console.log("loading cutter info");
const cutter = require(__dirname+'/../../../data/cutter.json');
for(let fips in cutter.counties) {
    let tokens = fips.split(".");
    let statefips = tokens[0]; 
    let countyfips = tokens[1]; 
    sfips = statefips+countyfips;
    let county_measures = cutter.counties[fips];
    if(!counties[sfips]) {
        //console.error("odd fips in cutter?", sfips);
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
            return;
        }
        counties[fips].eda2018.push(eda2018[fain]);
    });
}

//see if the record is actually tribe record and information exist in tribes.json
//1278 without this..
//507 with this matching (I think rest are islands?)
function checkTribes(rec) {
    console.log("looking for", rec.designatedArea);
    let longestMatch = null;
    let longestMatchCount = null;
    tribes.forEach(tribe=>{
        if(rec.designatedArea.includes(tribe.NAME)) {
            console.log("maybe..", tribe.NAME);
            if(longestMatchCount == null || longestMatchCount < tribe.NAME.length) {
                longestMatchCount = tribe.NAME.length;
                longestMatch = tribe.nearest_county;
            }
        }
    });
    if(longestMatch) {
        console.log("longest match is");
        console.dir(longestMatch);
        return longestMatch.STATE+longestMatch.COUNTY;
    }

    return null;
}

let odd_dr_count = 0;
function handle_disaster(rec) {
    if(rec.designatedArea == "Statewide") {
        //add it to all county in the state
        rec.statewide = true;
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
            console.error("odd/missing fips in disaster declarations:", fips);
            console.dir(rec);

            console.log("trying tribes fip");
            fips = checkTribes(rec);
            if(!fips) {
                console.log("no match..");
                odd_dr_count++;
                return;
            }
            console.log("found a match!", fips);
            rec.tribe = true;
            /*
            if(!counties[fips]) {
                console.log("but I can't find a county to put it");
            }
            */
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

console.log("number of odd dr", odd_dr_count);
//process.exit(1);

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

function handlePublicAssistances(cb) {
    console.log("loading PublicAssistanceFundedProjectsDetails");
    fs.createReadStream(__dirname+'/../../../raw/PublicAssistanceFundedProjectsDetails.csv').pipe(csvParser({
        mapValues({header, index, value}) {
            if(header.match("declarationDate")) return new Date(value);
            if(header.match("projectAmount")) return Number(value);
            if(header.match("federalShareObligated")) return Number(value);
            if(header.match("totalObligated")) return Number(value);
            return value;
        },
    })).on('data', async rec=>{
        let fips = rec.stateNumberCode.padStart(2, '0')+rec.countyCode.padStart(3, '0');
     
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
        
    }).on('end', ()=>{
        //console.log(JSON.stringify(data.cutter.indicators, null, 4));
        cb();
    });
}

handlePublicAssistances(err=>{
    if(err) throw err;

    console.log("loading bvi.csv");
    fs.createReadStream(__dirname+'/../../../raw/bvi.csv').pipe(csvParser({
        headers: [ 
            "year","county","estab_total","estab_vuln_total","estab_vuln_pct","mm_employees","emp_vuln_total","emp_vuln_pct"
        ],
        mapValues({header, index, value}) {
            if(header.match("_date")) return new Date(value);
            if(header.match("county")) return value;
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

        /*
        console.log(fips);
        if(fips == "04025") {
            console.log(".....test");
            process.exit(1);
        }
        */

    }).on('end', ()=>{
        //sort some arrays
        for(let fips in counties) {
            if(counties[fips].bvis) counties[fips].bvis.sort((a,b)=>a.year - b.year);
            if(counties[fips].disasters) counties[fips].disasters.sort((a,b)=>new Date(a.declarationDate) - new Date(b.declarationDate));
        }

        //create county/state summary json for each year
/*
 statefips: '10',
  countyfips: '001',
  county: 'Kent',
  state: 'Delaware',
  area: 586.179,
  _dd: undefined,
  eda2018: [],
  disasters: [
    {
      femaDeclarationString: 'DR-126-DE',
      disasterNumber: '126',
      state: 'DE',
      declarationType: 'DR',
      declarationDate: '1962-03-09T05:00:00.000Z',
      fyDeclared: '1962',
      incidentType: 'Flood',
      declarationTitle: 'SEVERE STORMS, HIGH TIDES & FLOODING',
      ihProgramDeclared: '0',
      iaProgramDeclared: '1',
      paProgramDeclared: '1',
      hmProgramDeclared: '1',
      incidentBeginDate: '1962-03-09T05:00:00.000Z',
      incidentEndDate: '1962-03-09T05:00:00.000Z',
      disasterCloseoutDate: null,
      fipsStateCode: '10',
      fipsCountyCode: '000',
      placeCode: '0',
      designatedArea: 'Statewide',
      declarationRequestNumber: '62011',
      hash: '00ba0f29d46437cbe75fcfdb67925ce3',
      lastRefresh: '2019-07-26T18:49:32.222Z',
      id: '5d1bceafd5b39c032f260362',
      statewide: true
    },
*/

        let years = {
            //keyed by year, then by disaster type, and array of county fips and state fips
        }; 
        for(let fips in counties) {
            //console.dir(counties[fips]);
            counties[fips].disasters.forEach(dr=>{
                let _fips = fips;
                if(dr.statewide) {
                    _fips = dr.fipsStateCode;
                }
                let date = new Date(dr.incidentBeginDate);
                let year = date.getFullYear();
                if(!years[year]) years[year] = {};
                if(!years[year][dr.incidentType]) years[year][dr.incidentType] = [];
                if(!years[year][dr.incidentType].includes(_fips)) years[year][dr.incidentType].push(_fips); 
            });
        }
        console.log("saving years.json");
        fs.writeFileSync(__dirname+"/../../../data/years.json", JSON.stringify(years));

        console.log("saving counties jsons");
        for(let fips in counties) {
            fs.writeFileSync(__dirname+"/../../../data/counties/county."+fips+".json", JSON.stringify(counties[fips]));
        }
        console.log("all done");
    });
});



#!/usr/bin/env node

console.log("counties----------------------------");

const fs = require('fs');
const config = require('../../config');

const geo = require(config.pubdir+'/counties_geo.json');
const tribes = require(config.pubdir+'/tribes.json');
const csvParser = require('csv-parser');

const counties = {}; //keyed by fips, then all information for that county

console.log("initializing counties", geo.features.length);
geo.features.forEach(feature=>{
    let fips = feature.properties.statefips + feature.properties.countyfips;
    counties[fips] = {
        //demo: null,
        population: null,
        popdensity: null,
        demo2: null, //object keyed by "code" then {years: [], population: []}
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
});

//deprecated again.. use acs
console.log("loading demographics2");
const demo2 = require(config.pubdir+'/raw/statsamerica.demo2.json');

for(let fips in demo2) {
    if(!counties[fips]) {
        continue;
    }

    for(code in demo2[fips]) {
        let years = [];
        let populations = [];
        demo2[fips][code].forEach(rec=>{
            years.push(rec.year);
            populations.push(rec.population);
        });
        demo2[fips][code] = {years, populations}; //override..
    }
    counties[fips].demo2 = demo2[fips];
}

console.log("loading acs");
const acs = require(config.pubdir+'/raw/statsamerica.acs.json');

acs.forEach(rec=>{
    const fips = rec.statefips+rec.countyfips;

    if(!counties[fips]) {
        return;
    }

    //find the current(2018) info
    if(rec.year == "2018") {
        counties[fips].population = rec.totpop;
        counties[fips].popdensity = rec.pop_density;
    }

    let pops = counties[fips].pops;
    if(!pops) pops = {
        years: [],
        groups: [
            {name: "0-17", y: []},
            {name: "18-24", y: []},
            {name: "25-64", y: []},
            {name: "65+", y: []},
        ],
    };
    pops.years.push(rec.year); //assume it's ordered by year..
    pops.groups[0].y.push(rec.pop_0to4 + rec.pop_5to17); //312, 313
    pops.groups[1].y.push(rec.pop_18to24); //314
    pops.groups[2].y.push(rec.pop_25to44 + rec.pop_45to64); //315, 316
    pops.groups[3].y.push(rec.pop_65plus); //317
    counties[fips].pops = pops;
});

//report counties with missing demo
for(let fips in counties) {
    if(!counties[fips].pops) {
        console.error("demo missing for", fips);
    }
}

console.log("loading median income");
const medianincome = require(config.pubdir+'/raw/statsamerica.acs.medianincome.json');
for(let rec of medianincome) {
    let fips = rec.geo_id.toString();
    if(fips.length > 6) continue; //ignore odd one
    if(fips.length == 6 && fips[0] == "1") fips = fips.substring(1);
    if(!counties[fips]) {
        continue;
    }
    counties[fips].medianincome = rec.data;
}


console.log("loading bea county gdb");
const gdps = require(config.pubdir+'/raw/statsamerica.bea.gdp.json');
for(let gdp of gdps) {
    let fips = gdp.statefips+gdp.countyfips;
    if(!counties[fips]) {
        continue;
    }
    counties[fips].gdp = gdp.gcp_c; //GDP in current dollars
}

const years = [];
for(let year = 2012; year <= 2018; ++year) years.push(year);

console.log("loading cutter2 info");
const cutter2 = require(config.pubdir+'/cutter2.json');
for(let fips in cutter2.counties) {
    let tokens = fips.split(".");
    let statefips = tokens[0]; 
    let countyfips = tokens[1]; 
    sfips = statefips+countyfips;
    let county_measures = cutter2.counties[fips];
    if(!counties[sfips]) continue;

    //use it as template
    counties[sfips].cutter2 = JSON.parse(JSON.stringify(cutter2.indicators));

    //iterate over all indicies
    for(let indicator in counties[sfips].cutter2) {
        counties[sfips].cutter2[indicator].sources.forEach(source=>{

            //aggregate for each county
            for(let year in source.stats) {
                if(!source.stats[year].states[statefips]) {
                    console.log(sfips, year, "missing states data");
                    continue; 
                }
                source.stats[year].states = source.stats[year].states[statefips]; //pick own states and discard the rest

                //we might be missing entire index for this county
                if(county_measures[source.id] && county_measures[source.id][year]) {
                    source.stats[year].county = county_measures[source.id][year];
                }
            }

            //re-org into years
            const stats = source.stats;
            /*stats
            {
  '2012': {
    states: { avg: 0.3786224802071696, sdev: 0.10973644025302756 },
    us: { avg: 0.48328084458313736, sdev: 0.1780448461403503 },
    county: 0.4614524554490938
  },
  '2013': {
    states: { avg: 0.37894686056400473, sdev: 0.10607603424959099 },
    us: { avg: 0.48355035592928164, sdev: 0.1766194754559502 },
    county: 0.45216770106871246
  },
  '2014': {
    states: { avg: 0.37570583687682724, sdev: 0.10564649192899263 },
    us: { avg: 0.4832299157937624, sdev: 0.18050912773821673 },
    county: 0.4597928599195731
  },
  '2015': {
    states: { avg: 0.3774499951981477, sdev: 0.1048616141994905 },
    us: { avg: 0.4834068475670536, sdev: 0.17878160940265264 },
    county: 0.4780337145349125
  },
  '2016': {
    states: { avg: 0.37629561726360133, sdev: 0.10574324860479793 },
    us: { avg: 0.4833447287224145, sdev: 0.1807313315677278 },
    county: 0.4873908753443335
  },
  '2017': {
    states: { avg: 0.3818032969715156, sdev: 0.10004956412267825 },
    us: { avg: 0.48408485605239177, sdev: 0.17596926328700668 },
    county: 0.4802867977541863
  },
  '2018': {
    states: { avg: 0.3819676194082908, sdev: 0.09898967807773418 },
    us: { avg: 0.4839368892124046, sdev: 0.1761433699241664 },
    county: 0.5130122679379003
  }
}
            */
            const data = {
                states: {
                    avg: [],
                    sdev: [],
                },
                us: {
                    avg: [],
                    sdev: [],
                },
                county: [],
            };
            let empty = true;
            years.forEach(year=>{
                if(stats && stats[year]) {
                    data.states.avg.push(stats[year].states.avg);
                    data.states.sdev.push(stats[year].states.sdev);
                    data.us.avg.push(stats[year].us.avg);
                    data.us.sdev.push(stats[year].us.sdev);
                    data.county.push(stats[year].county);
                    empty = false;
                } else {
                    data.states.avg.push(null);
                    data.states.sdev.push(null);
                    data.us.avg.push(null);
                    data.us.sdev.push(null);
                    data.county.push(null);
                }
            });
            source.stats = data; //overwrite
            if(empty) delete source.stats;
        });
    }
}

console.log("loading eda2018");
const eda2018 = require(config.pubdir+'/eda2018.json');
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
        }
        if(counties[fips]) counties[fips].disasters.push(rec);
    }
}

console.log("loading past disasters");
const disasters_past = require(config.pubdir+"/raw/statsamerica.disasters.1953-2015.json");
disasters_past.forEach(handle_disaster);

console.log("loading recent disasters");
const disasters_recent = require(config.pubdir+"/raw/statsamerica.disasters.2015-now.json");
disasters_recent.forEach(handle_disaster);

console.log("loading storm counts");
const storm_counts = require(config.pubdir+"/storm_counts.json");
disasters_past.forEach(handle_disaster);

console.log("number of odd dr", odd_dr_count);

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
    fs.createReadStream(config.pubdir+'/raw/PublicAssistanceFundedProjectsDetails.csv').pipe(csvParser({
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

/*
//deprecated by handleBVINaics
function handleBVI(cb) {
    console.log("loading bvi.csv");
    fs.createReadStream(config.pubdir+'/raw/bvi.csv').pipe(csvParser({
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
        let fips = rec.county.toString()
        if(!counties[fips]) {
            console.error("odd fips in bvi (rec.county)", fips);
            console.dir(rec);
            return;
        }
        if(!counties[fips].bvis) counties[fips].bvis = [];
        counties[fips].bvis.push(rec);
    }).on('end', ()=>{
          cb();
    });
}
*/

function handleBVINaics(cb) {
    console.log("loading bvi.json");
    const recs = require(config.pubdir+'/raw/bvi.json');

    //organize into fips / naics / year
    recs.forEach(rec=>{
        if(!counties[rec.fips]) {
            console.error("odd fips in bvi.json (rec.county)", rec.fips);
            console.dir(rec);
            return;
        }
        if(!counties[rec.fips].bvis2) counties[rec.fips].bvis2 = {}; 
        if(!counties[rec.fips].bvis2[rec.naics_code]) counties[rec.fips].bvis2[rec.naics_code] = {}//years
        counties[rec.fips].bvis2[rec.naics_code][rec.year] = {
            estab: rec.estab_total,
            estab_v: rec.estab_vuln_total,
            emp: rec.mm_employees,
            emp_v: rec.emp_vuln_total,
        }
    });

    //reoirg into fips / naics / {years, etc..}
    for(let fips in counties) {
        for(let naics in counties[fips].bvis2) {
            let years = Object.keys(counties[fips].bvis2[naics]);
            years.sort();
            let info = {
                years,
                estab: [],
                estab_v: [],
                emp: [],
                emp_v: [],
            }
            for(let year of years) {
                let o = counties[fips].bvis2[naics][year];
                info.estab.push(o.estab);
                info.estab_v.push(o.estab_v);
                info.emp.push(o.emp);
                info.emp_v.push(o.emp_v);
            }
            counties[fips].bvis2[naics] = info;
        }
    }

    cb();
}

handleBVINaics(err=>{
    if(err) throw err;

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
        counties[fips].disasters.forEach(dr=>{
            let _fips = fips;
            if(dr.statewide) _fips = dr.fipsStateCode;
            let date = new Date(dr.incidentBeginDate);
            let year = date.getFullYear();
            if(!years[year]) years[year] = {};
                if(!years[year][dr.incidentType]) years[year][dr.incidentType] = [];
                if(!years[year][dr.incidentType].includes(_fips)) years[year][dr.incidentType].push(_fips); 
        });
    }
    console.log("saving years.json");
    fs.writeFileSync(config.pubdir+"/years.json", JSON.stringify(years));

    console.log("saving counties jsons");
    for(let fips in counties) {
        fs.writeFileSync(config.pubdir+"/counties/county."+fips+".json", JSON.stringify(counties[fips]));
    }
    console.log("all done");
});


#!/usr/bin/env node

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
        //demo2: null, //object keyed by "code" then {years: [], population: []}
        population: null,
        popdensity: null,
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
        percapitaincome: null, 
        biggestIndustry: null, //naics: 62, naics_title: 'title', empl: 'num'
        industries: [], 

        households: null,  //number of household from acs
        householdsBroadband: null, //number of hosuehold with broadband access

        //measure_distress timeseries
        distress_pcm: {years: [], est: [], moe: []}, //percapitamoney
        distress_pcp: {years: [], data: []}, //percapitapersonal
        distress_ur: {date: [], employed: [], unemp: [], rate: []}, //percapitapersonal

        //cost of disasters
        costDisasters: {}, //for entire states. keyed by linecd
        gdpPerSector: {}, //gcp_r for each sector(linecd)
    } 
});

console.log("loading linecodes");
const linecodesArray = require(config.pubdir+"/raw/linecodes.json");
const linecodes = {};
linecodesArray.forEach(r=>{
    linecodes[r.code] = r.description;
});

console.log("loading estimated_state_cost.json");
const stateCostArray = require(config.pubdir+"/raw/estimated_cost.json");
const statesCost = {}; //key by edd_id
stateCostArray.forEach(r=>{
    if(!statesCost[r.statefips]) statesCost[r.statefips] = [];
    statesCost[r.statefips].push({
        code:r.linecd,
        z: r.z,
        chg_pct: r.chg_pct,
        result: r.result,
        desc: linecodes[r.linecd],
    });
});
for(let statefip in statesCost) {
    statesCost[statefip].sort((a,b)=>{
        return a.code - b.code;
    });
}
for(let fips in counties) {
    const statefips = fips.substring(0, 2);
    counties[fips].costDisasters = statesCost[statefips];
}

console.log("loading gdp per sector");
const gdpPerSectors = require(config.pubdir+"/raw/statsamerica.bea.gdp-per-sector.json");
gdpPerSectors.forEach(rec=>{
    if(!counties[rec.fips]) {
        console.error("can't find", rec.fips, "to put the gdpPerSector record", rec);
        return;
    }
    counties[rec.fips].gdpPerSector[rec.linecd] = rec.gcp_r;
});

console.log("loading industries");
const industries = require(config.pubdir+"/raw/industries.json");
for(let fips in counties) {
    let max = null;
    counties[fips].industries = industries.filter(r=>r.statefips+r.countyfips == fips).map(r=>{
        return {
            //year: r.year, //should be all the same!
            empl: r.empl,
            naics: r.naics,
            name: r.naics_title,
        }
    })
}
//console.dir(counties["20095"].biggestIndustry);
console.log("loading broadband");
const broadband = require(config.pubdir+'/raw/statsamerica.broadband.json');
broadband.forEach(rec=>{
    if(!counties[rec.fips]) return;

    //find the current(2018) info
    counties[rec.fips].households = rec.total_households;
    counties[rec.fips].householdsBroadband = rec.total_households_broadband;
});

console.log("loading acs");
const acs = require(config.pubdir+'/raw/statsamerica.acs.json');
acs.forEach(rec=>{
    const fips = rec.statefips+rec.countyfips;

    if(!counties[fips]) return;

    //find the current(2018) info
    if(rec.year == "2019") {
        counties[fips].population = rec.totpop;
        counties[fips].popdensity = rec.pop_density;
    }

    //load population 
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

    //load race
    let or = counties[fips].or;
    if(!or) or = {
        years: [],
        groups: {
            white: [],
            black: [],
            aian: [],
            asian: [],
            hawaiian: [],
            mixed: [],
            non_hisp: [],
            hispanic: [],
        }
    };
    or.years.push(rec.year); //assume it's ordered by year..
    or.groups.white.push(rec.white_alone);
    or.groups.black.push(rec.black_alone);
    or.groups.aian.push(rec.aian_alone);
    or.groups.asian.push(rec.asian_alone);
    or.groups.hawaiian.push(rec.hawaiian_alone);
    or.groups.mixed.push(rec.two_or_more_races);
    or.groups.non_hisp.push(rec.non_hisp);
    or.groups.hispanic.push(rec.hispanic);
    /*
     what about these?
      race_tom: 514,
      hispanic: 36344,
      mexican: 35,
      cuban: 27,
      pr: 36089,
      oth_hisp: 193,
      tot_nh: 95,
      nh_orwhite: 48,
    */
    counties[fips].or = or;
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
    if(!counties[fips]) continue;
    counties[fips].medianincome = rec.data;
}

console.log("loading percapita income");
const pcincome = require(config.pubdir+'/raw/statsamerica.acs.percapitaincome.json');
for(let rec of pcincome) {
    let fips = rec.statefips + rec.countyfips;
    if(!counties[fips]) continue;
    counties[fips].percapitaincome = rec.DATA;
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

console.log("loading percapitamoney_ACS time series for each county");
const distress_pcm = require(config.pubdir+'/raw/measuring_distress_percapitamoney_ACS.json');
distress_pcm.forEach(rec=>{
    let fips = rec.statefips+rec.countyfips;
    if(!counties[fips]) return;
    counties[fips].distress_pcm.years.push(rec.year);
    counties[fips].distress_pcm.est.push(rec.est);
    counties[fips].distress_pcm.moe.push(rec.moe);
});

console.log("loading percapitapersonal_BEA time series for each county");
const distress_pcp = require(config.pubdir+'/raw/measuring_distress_percapitapersonal_BEA.json');
distress_pcp.forEach(rec=>{
    let fips = rec.statefips+rec.countyfips;
    if(!counties[fips]) return;
    counties[fips].distress_pcp.years.push(rec.year);
    counties[fips].distress_pcp.data.push(rec.data);
});

console.log("loading distress_24month_UR time series for each county");
const distress_ur = require(config.pubdir+'/raw/measuring_distress_24month_UR.json');

//load us rate
const unemp_us = {date: [], rate: [], unemp: [], employed: []}
distress_ur.forEach(rec=>{
    let fips = rec.statefips+rec.countyfips;
    if(fips != 0) return; //pull us data
    unemp_us.date.push(new Date(rec.year+"/"+rec.month));
    unemp_us.employed.push(rec.employed);
    unemp_us.unemp.push(rec.unemp);
    unemp_us.rate.push(rec.rate);
});

distress_ur.forEach(rec=>{
    let fips = rec.statefips+rec.countyfips;
    if(!counties[fips]) return;

    //only pull data quaterly
    //if(rec.month%4 == 1) {
        counties[fips].distress_ur.date.push(new Date(rec.year+"/"+rec.month));
        counties[fips].distress_ur.employed.push(rec.employed);
        counties[fips].distress_ur.unemp.push(rec.unemp);
        counties[fips].distress_ur.rate.push(rec.rate);
    //}
});

//compute histogram of all medianincome (state and for each state)
function createHistogram(counties, min, max, bucket, field) {
    let histogram = {min, max, bucket, hists: {_us: []} }; //hists is a dictionary of statefips and array of histogram. "_us" contains the whole US

    function incHist(fips, b) {
        if(!histogram.hists[fips]) histogram.hists[fips] = [];
        if(!histogram.hists[fips][b]) histogram.hists[fips][b] = 1;
        else histogram.hists[fips][b]++;
    }

    for(let fip in counties) {
        let county = counties[fip];
        let v = county[field];
        if(v > max) v = max; //clip at the top bucket
        let b = Math.floor((v-min)/bucket);
        incHist(county.statefips, b);
        incHist("_us", b);
    }
    return histogram;
}

let histograms = {};
histograms.medianIncome = createHistogram(counties, 0, 200000, 5000, 'medianincome');
histograms.perCapitaIncome = createHistogram(counties, 0, 200000, 5000, 'percapitaincome');
histograms.gdp = createHistogram(counties, 0, 200000000, 5000000, 'gdp');
histograms.population = createHistogram(counties, 0, 2000000, 50000, 'population');
histograms.popdensity = createHistogram(counties, 0, 5000, 100, 'popdensity');

//store common data among all states
fs.writeFileSync(config.pubdir+"/common.json", JSON.stringify({histograms, unemp_us}));

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
for(let fips in storm_counts) {
    let storms = storm_counts[fips];
    fips = fips.replace(".", "");
    if(!counties[fips]) {
        console.error("odd fips in storm counts?", fips);
        continue;
    }
    counties[fips].storms = storms;
}

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
            estab_v_pct: rec.estab_vuln_pct,
            //emp: rec.mm_employees,
            emp: rec.emp_total,
            emp_v: rec.emp_vuln_total,
            emp_v_pct: rec.emp_vuln_pct,
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
                estab_v_pct: [],
                emp: [],
                emp_v: [],
                emp_v_pct: [],
            }
            for(let year of years) {
                let o = counties[fips].bvis2[naics][year];
                info.estab.push(o.estab);
                info.estab_v.push(o.estab_v);
                info.estab_v_pct.push(o.estab_v_pct);
                info.emp.push(o.emp);
                info.emp_v.push(o.emp_v);
                info.emp_v_pct.push(o.emp_v_pct);
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

    //debug break
    //console.dir(counties["47003"]);
    //process.exit(1);

    console.log("saving years.json");
    fs.writeFileSync(config.pubdir+"/years.json", JSON.stringify(years));

    console.log("saving counties jsons");
    for(let fips in counties) {
        fs.writeFileSync(config.pubdir+"/counties/county."+fips+".json", JSON.stringify(counties[fips]));
    }
    console.log("all done");
});




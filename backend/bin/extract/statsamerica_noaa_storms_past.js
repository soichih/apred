#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

//const fips = require('../data/fips.json');
console.log("statsamerica_noaa_storms--------------------------------");
const today = new Date();
//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    console.log("connected");
    load(pool);
});

function load(pool) {
    let yearsToLoad = [];
    for(let year = 1950; year < today.getFullYear(); ++year) {
        yearsToLoad.push(year);
    }

    async.eachSeries(yearsToLoad, (year, next_year)=>{
    //for(let year = 2010; year < 2011; ++year) {
        let zones = [];
        let counties = [];

        console.log("loading data for "+year);

        const request = pool.request();
        request.stream = true;
        request.query(`SELECT * from NOAA_StormEvents WHERE YEAR>=`+year+` and YEAR < `+(year+1));
        request.on('row', rec=>{
            switch(rec.CZ_TYPE) {
            case "Z": 
                zones.push(rec);
                break;
            case "C": 
                counties.push(rec);
                break;
            default:
                console.error("unknown CZ_TYPE:", rec.CZ_TYPE);
                console.dir(rec);
            }
        });
        request.on('error', next_year);
        request.on('done', res=>{
            console.dir(res);
            console.log("writing json "+year);
            fs.writeFileSync(config.pubdir+"/raw/statsamerica.noaa_storms_zones."+year+".json", JSON.stringify(zones));
            fs.writeFileSync(config.pubdir+"/raw/statsamerica.noaa_storms_counties."+year+".json", JSON.stringify(counties));
            next_year();
        });
    }, err=>{
        if(err) throw err;
        console.log("all done");
    });
}


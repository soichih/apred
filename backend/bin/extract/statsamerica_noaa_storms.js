#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

//const fips = require('../data/fips.json');

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    console.log("connected");
    load(pool);
});

function load(pool) {

    //years to pull data for
    let years = [];
    for(let year = 2020/*1950*/; year <= 2020; ++year) {
        years.push(year); 
    }

    async.eachSeries(years, (year, next_year)=>{
	    let zones = [];
	    let counties = [];

	    console.log("loading data for "+year);

	    const request = pool.request();
	    request.stream = true;
	    request.query(`SELECT * from NOAA_StormEvents WHERE YEAR>=`+year+` and YEAR < `+(year+1));
	    /*
	    request.on('recordset', columns=>{
		console.dir(columns);
	    });
	    */
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
	    request.on('error', err=>{
		throw err;
	    });
	    request.on('done', res=>{
		console.dir(res);
		console.log("writing json");
		//if(year == 2019) year = "2019-now";
		fs.writeFileSync("../../../raw/statsamerica.noaa_storms_zones."+year+".json", JSON.stringify(zones));
		fs.writeFileSync("../../../raw/statsamerica.noaa_storms_counties."+year+".json", JSON.stringify(counties));
		next_year();
	    });
    }, err=>{
        if(err) throw err;
        pool.close();
    });

}


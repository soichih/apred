#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

//const fips = require('../data/fips.json');
<<<<<<< HEAD
console.log("statsamerica_noaa_storms--------------------------------");

const today = new Date();
=======

>>>>>>> 28eac27be053040e551db1f4ba43e1e7cd6a2d44
//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    console.log("connected");
    load(pool);
});

function load(pool) {

<<<<<<< HEAD
    //years to pull data for
    let years = [];
    for(let year = today.getFullYear() /*1950*/; year <= today.getFullYear(); ++year) {
=======

    /*
    //years to pull data for
    let years = [];
    for(let year = 2019; year <= 2020; ++year) {
>>>>>>> 28eac27be053040e551db1f4ba43e1e7cd6a2d44
        years.push(year); 
    }

    async.eachSeries(years, (year, next_year)=>{
<<<<<<< HEAD
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
		fs.writeFileSync(__dirname+"/../../../raw/statsamerica.noaa_storms_zones."+year+".json", JSON.stringify(zones));
		fs.writeFileSync(__dirname+"/../../../raw/statsamerica.noaa_storms_counties."+year+".json", JSON.stringify(counties));
		next_year();
	    });
=======
    */
    let zones = [];
    let counties = [];

    console.log("loading data since 2019");

    const request = pool.request();
    request.stream = true;
    request.query(`SELECT * from NOAA_StormEvents WHERE YEAR>=2019`);
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
        }
    });
    request.on('error', err=>{
        throw err;
    });
    request.on('done', res=>{
        console.dir(res);
        console.log("writing json");
        fs.writeFileSync("../../../raw/statsamerica.noaa_storms_zones.2019-now.json", JSON.stringify(zones));
        fs.writeFileSync("../../../raw/statsamerica.noaa_storms_counties.2019-now.json", JSON.stringify(counties));
        //next_year();
        pool.close();
    });
    /*
>>>>>>> 28eac27be053040e551db1f4ba43e1e7cd6a2d44
    }, err=>{
        if(err) throw err;
        pool.close();
    });
<<<<<<< HEAD
=======
    */
>>>>>>> 28eac27be053040e551db1f4ba43e1e7cd6a2d44

}


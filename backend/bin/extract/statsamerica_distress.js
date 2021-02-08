#!/usr/bin/env node

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

console.log("statsamerica.measuring_distress -----------------------------------");

/*
-rw-rw-r-- 1 hayashis hayashis   13819666 Jan 25 16:26 measuring_distress_percapitamoney_ACS.json
-rw-rw-r-- 1 hayashis hayashis    5683492 Jan 25 16:26 measuring_distress_percapitapersonal_BEA.json
-rw-rw-r-- 1 hayashis hayashis  141148459 Jan 25 16:26 measuring_distress_24month_UR.json
*/

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_red_dr).then(async pool=>{

    console.log("loading measuring_distress_percapitamoney_ACS"); //13MB
    let ret = await pool.request().query(`
        SELECT * FROM measuring_distress_percapitamoney_ACS WHERE sumlev = '050' ORDER by year
    `);
    ret.recordset.forEach(rec=>{
        //rec.statefips = rec.statefips.trim();
        //rec.countyfips = rec.countyfips.trim();
        //rec.year = rec.year.trim();
        //console.dir(rec);
        //if(rec.statefips == "18" && rec.countyfips == "105" && rec.measure == "16") console.dir(rec);
    });
    fs.writeFileSync(config.pubdir+"/raw/measuring_distress_percapitamoney_ACS.json", JSON.stringify(ret.recordset));

    console.log("loading measuring_distress_percapitapersonal_BEA"); //6MB
    ret = await pool.request().query(`
        SELECT * FROM measuring_distress_percapitapersonal_BEA WHERE disc = 0 ORDER BY year
    `);
    ret.recordset.forEach(rec=>{
        //rec.statefips = rec.statefips.trim();
        //rec.countyfips = rec.countyfips.trim();
        //rec.year = rec.year.trim();
        //console.dir(rec);
        //if(rec.statefips == "18" && rec.countyfips == "105" && rec.measure == "16") console.dir(rec);
    });
    fs.writeFileSync(config.pubdir+"/raw/measuring_distress_percapitapersonal_BEA.json", JSON.stringify(ret.recordset));

    console.log("loading measuring_distress_24month_UR"); //141MB
    ret = await pool.request().query(`
        SELECT * FROM measuring_distress_24month_UR ORDER BY year,month
    `);
    ret.recordset.forEach(rec=>{
        //rec.statefips = rec.statefips.trim();
        //rec.countyfips = rec.countyfips.trim();
        //rec.year = rec.year.trim();
        //console.dir(rec);
        //if(rec.statefips == "18" && rec.countyfips == "105" && rec.measure == "16") console.dir(rec);
        delete rec.labor; //redundant with employed and unemployed
    });
    fs.writeFileSync(config.pubdir+"/raw/measuring_distress_24month_UR.json", JSON.stringify(ret.recordset));

    pool.close();
});


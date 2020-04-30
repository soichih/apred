#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

<<<<<<< HEAD
console.log("statsamerica_eda2018-----------------------------------");

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_red_dr).then(async pool=>{
=======
//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_red_dr).then(async pool=>{
    console.log("connected");
>>>>>>> 28eac27be053040e551db1f4ba43e1e7cd6a2d44
    const supp = await pool.request().query(`
        SELECT * FROM eda_disaster_supp;
    `);
    //console.dir(supp.recordsets[0].length);

    const supp_counties = await pool.request().query(`
        SELECT * FROM eda_disaster_supp_counties;
    `);
    //console.dir(supp_counties.recordsets[0].length);

    const supp_fema = await pool.request().query(`
        SELECT * FROM eda_disaster_supp_fema;
    `);
    //console.dir(supp_fema.recordsets[0].length);

    let fains = {};
    supp.recordsets[0].forEach(rec=>{
        rec.counties = [];
        fains[rec.fain] = rec;
    });
    supp_counties.recordsets[0].forEach(rec=>{
        fains[rec.fain].counties.push({county: rec.county, stateadd: rec.stateabb});
    });
    supp_fema.recordsets[0].forEach(rec=>{
        fains[rec.fain].fema_id = rec.fema_id;
    });

    //console.dir(fains);
<<<<<<< HEAD
    fs.writeFileSync(__dirname+"/../../../raw/statsamerica.eda2018.json", JSON.stringify(fains));
=======
    fs.writeFileSync("../../../raw/statsamerica.eda2018.json", JSON.stringify(fains));
>>>>>>> 28eac27be053040e551db1f4ba43e1e7cd6a2d44
    pool.close();
});


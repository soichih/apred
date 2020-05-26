#!/usr/bin/env node

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

console.log("statsamerica_resilience -----------------------------------");

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_red_dr).then(async pool=>{
    console.log("loading dr_data / Resilience values for individual indices per county.");
    const dr_data_norm = await pool.request().query(`
        SELECT * FROM dr_data_norm
    `);
    dr_data_norm.recordset.forEach(rec=>{
        /*
        {
          statefips: '51        ',
          countyfips: '171       ',
          measure: '11        ',
          measure_category: '1         ',
          year: '2016      ',
          measure_value: 1.359882,
          measure_value_normalized: null
        },
        */
        rec.statefips = rec.statefips.trim();
        rec.countyfips = rec.countyfips.trim();
        rec.measure = rec.measure.trim();
        rec.measure_category = rec.measure_category.trim();
        rec.year = rec.year.trim();
    });
    //console.dir(dr_data_norm.recordset);
    fs.writeFileSync(__dirname+"/../../../raw/dr_normalized.json", JSON.stringify(dr_data_norm.recordset));

    console.log("loading dr_measure (will be populated in the future)");
    const dr_measure = await pool.request().query(`
        SELECT * FROM dr_measure
    `);
    dr_measure.recordset.forEach(rec=>{
        //TODO?
    });
    fs.writeFileSync(__dirname+"/../../../raw/dr_measure.json", JSON.stringify(dr_measure.recordset));

    console.log("loading dr_measure_category (will be populated in the future)");
    const dr_measure_category = await pool.request().query(`
        SELECT * FROM dr_measure_category
    `);
    dr_measure_category.recordset.forEach(rec=>{
        //TODO?
    });
    fs.writeFileSync(__dirname+"/../../../raw/dr_measure_category.json", JSON.stringify(dr_measure_category.recordset));

    /*

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
    fs.writeFileSync(__dirname+"/../../../raw/statsamerica.eda2018.json", JSON.stringify(fains));
    pool.close();
    */
    pool.close();
});


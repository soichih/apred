#!/usr/bin/env node

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_red_dr).then(async pool=>{

    console.log("loading estimated cost data point");
    const cost = await pool.request().query(`
        SELECT statefips, linecd, z, result FROM dbo.ecd_gdp_fixed_results_sig_z
    `);
    cost.recordset.forEach(rec=>{
        //This is by state (the state fips code) and linecd (the sector). The result column contains one of three values: 
        //  INSIG meaning insignificant difference, 
        //  SIG-GROWTH which means there was an increase, and 
        //  SIG-LOSS which means there was a statistically-significant decrease. 
        //
        //  The SIG-GROWTH controls if it is green and the SIG-GROWTH should control if it is red.
        /*
        {
          statefips: '48',
          linecd: '0079',
          z: 0.5554474777005738,
          result: 'INSIG'
        }
        */
        /*
        rec.statefips = rec.statefips.trim();
        rec.countyfips = rec.countyfips.trim();
        rec.measure = rec.measure.trim();
        rec.measure_category = rec.measure_category.trim();
        rec.year = rec.year.trim();

        //if(rec.statefips == "18" && rec.countyfips == "105" && rec.measure == "16") console.dir(rec);
        */
    });
    fs.writeFileSync(config.pubdir+"/raw/estimated_cost.json", JSON.stringify(cost.recordset));

    console.log("loading dr_data / Resilience values for individual indices per county.");
    const dr_data = await pool.request().query(`
        SELECT * FROM dr_data
    `);
    dr_data.recordset.forEach(rec=>{
        rec.statefips = rec.statefips.trim();
        rec.countyfips = rec.countyfips.trim();
        rec.measure = rec.measure.trim();
        rec.measure_category = rec.measure_category.trim();
        rec.year = rec.year.trim();

        //if(rec.statefips == "18" && rec.countyfips == "105" && rec.measure == "16") console.dir(rec);
    });
    fs.writeFileSync(config.pubdir+"/raw/dr.json", JSON.stringify(dr_data.recordset));

    console.log("loading dr_data_norm / Resilience values for individual indices per county.");
    const dr_data_norm = await pool.request().query(`
        SELECT statefips, countyfips, measure, measure_category, year FROM dr_data_norm
    `);
    console.log("done loading from sql");
    dr_data_norm.recordset.forEach(rec=>{
        rec.statefips = rec.statefips.trim();
        rec.countyfips = rec.countyfips.trim();
        rec.measure = rec.measure.trim();
        rec.measure_category = rec.measure_category.trim();
        rec.year = rec.year.trim();
    });
    console.log("now saving to disk");
    fs.writeFileSync(config.pubdir+"/raw/dr_normalized.json", JSON.stringify(dr_data_norm.recordset));

    console.log("loading dr_measure");
    const dr_measure = await pool.request().query(`
        SELECT * FROM dr_measure
    `);
    fs.writeFileSync(config.pubdir+"/raw/dr_measure.json", JSON.stringify(dr_measure.recordset));

    console.log("loading dr_measure_category");
    const dr_measure_category = await pool.request().query(`
        SELECT * FROM dr_measure_category
    `);
    fs.writeFileSync(config.pubdir+"/raw/dr_measure_category.json", JSON.stringify(dr_measure_category.recordset));

    pool.close();
});


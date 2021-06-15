#!/usr/bin/env node

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_red_dr).then(async pool=>{

    console.log("loading estimated cost data point");
    //takes more than >30 seconds..
    const cost = await pool.request().query(`
        SELECT a.[statefips]
            ,a.[linecd]
            ,a.[z]
            ,a.[result]
            , b.[disaster_avg] - b.[no_avg] [chg_pct]
            , b.[disaster_avg]
            , b.[disaster_stdev]
            , b.[no_avg]
            , b.[no_stdev]
         FROM [RED_DR].[dbo].[ecd_gdp_fixed_results_sig_z_v2] a
         JOIN [RED_DR].[dbo].[ecd_gdp_fixed_results_pivot_v2] b ON a.[statefips] = b.[statefips] AND a.[linecd] = b.[linecd]
    `);
    cost.recordset.forEach(rec=>{
        //This is by state (the state fips code) and linecd (the sector). The result column contains one of three values: 
        //  INSIG meaning insignificant difference, 
        //  SIG-GROWTH which means there was an increase, and 
        //  SIG-LOSS which means there was a statistically-significant decrease. 
        //
        //  The SIG-GROWTH controls if it is green and the SIG-GROWTH should control if it is red.
        //{
        //  statefips: '48',
        //  linecd: '0079',
        //  z: 0.5554474777005738,
        //  result: 'INSIG'
        //}
        /*
        {
          statefips: '40',
          linecd: '0070',
          z: 0.01536921044438044,
          result: 'INSIG',
          chg_pct: 0.008892572293593748,
          disaster_avg: 0.18483012018401582,
          disaster_stdev: 0.7424760140928791,
          no_avg: 0.17593754789042207,
          no_stdev: 0.8221914981576122
        }
        */
    });
    fs.writeFileSync(config.pubdir+"/raw/estimated_cost.json", JSON.stringify(cost.recordset));

    //TODO deprecated by dr_data_norm?
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
        SELECT * FROM dr_data_norm WHERE year < 2019
    `);
    console.log("done loading from sql");
    dr_data_norm.recordset.forEach(rec=>{
        rec.statefips = rec.statefips.trim();
        rec.countyfips = rec.countyfips.trim();
        rec.measure = rec.measure.trim();
        rec.measure_category = rec.measure_category.trim();
        rec.year = rec.year.trim();
        /*
        {
          statefips: '27',
          countyfips: '009',
          measure: '57',
          measure_category: '5',
          year: '2015',
          measure_value_normalized: 0.44557485640489813
        }
        */
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


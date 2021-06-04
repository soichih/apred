#!/usr/bin/env node

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_red_dr).then(async pool=>{

    console.log("loading estimated cost data point");

    //old query
    //SELECT statefips, linecd, z, result FROM dbo.ecd_gdp_fixed_results_sig_z

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
        FROM [RED_DR].[dbo].[ecd_gdp_fixed_results_sig_z] a
        JOIN [RED_DR].[dbo].[ecd_gdp_fixed_results_pivot] b ON a.[statefips] = b.[statefips] AND a.[linecd] = b.[linecd]
    `);
    cost.recordset.forEach(rec=>{
        console.dir(rec);
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
          statefips: '06',
          linecd: '0070',
          z: 4.965638361556237, //could be null..
          result: 'SIG-GROWTH',
          chg_pct: 24.982051452535423, //this is what we need to use (expected gpu/pct change in disaster-stricken counties one year prior to one year after a disaster.)
          disaster_avg: 24.681436668746237,
          disaster_stdev: 200.48894727967058,
          no_avg: -0.300614783789185,
          no_stdev: 18.45538009964918
        }
        */
    });
    fs.writeFileSync(config.pubdir+"/raw/estimated_cost.json", JSON.stringify(cost.recordset));

    /*
    const cost_avg = await pool.request().query(`
        SELECT [statefips], [linecd], [disaster_avg] - [no_avg] [change_pct] FROM [RED_DR].[dbo].[ecd_gdp_fixed_results_pivot]
    `);
    cost_avg.recordset.forEach(rec=>{
        //{
        //  statefips: '42',
        //  linecd: '0083',
        //  change_pct: -1.1355823088808508
        //}
    });
    fs.writeFileSync(config.pubdir+"/raw/estimated_cost_avg.json", JSON.stringify(cost_avg.recordset));
    */

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


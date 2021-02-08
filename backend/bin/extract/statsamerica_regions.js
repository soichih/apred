#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

console.log("statsamerica regions_eda --------------------------");

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    load(pool);
});

function load(pool) {
    let density = {};

    pool.request().query(`
        SELECT * from regions_eda
    `).then(res=>{
        fs.writeFileSync(config.pubdir+"/raw/regions_eda.json", JSON.stringify(res.recordset));
        pool.close();
    });
}


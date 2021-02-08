#!/usr/bin/env node

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

console.log("connecting to", config.stats_america.db_red_dr.server);

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_red_dr).then(async pool=>{
    const supp = await pool.request().query(`
        SELECT * FROM INFORMATION_SCHEMA.TABLES;
    `);
    supp.recordsets[0].forEach(rec=>{
        console.dir(rec);
    });
    pool.close();
});


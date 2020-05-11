#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

//I can only connect from IU VPN connected IPs - not dev1
console.log("connecting to db --------------------------");
mssql.connect(config.stats_america.db_stats_dms5).then(pool=>{
    load(pool);
});

function load(pool) {
    async.series([
        next=>{
            console.log("loading acs.medianincome --------------------------");
            pool.request().query(`SELECT * FROM acs_common_items_extract WHERE code_id = '307' and time_id = 2018`).then(res=>{
                fs.writeFileSync(__dirname+"/../../../raw/statsamerica.acs.medianincome.json", JSON.stringify(res.recordset));
                next();
            });
        },

        next=>{
            console.log("loading acs.poverty_universe --------------------------");
            pool.request().query(`SELECT * FROM acs_common_items_extract WHERE code_id = '385' and time_id = 2018`).then(res=>{
                fs.writeFileSync(__dirname+"/../../../raw/statsamerica.acs.poverty_universe.json", JSON.stringify(res.recordset));
                next();
            });
        },
        
        next=>{
            console.log("loading acs.poverty_individuals --------------------------");
            pool.request().query(`SELECT * FROM acs_common_items_extract WHERE code_id = '364' and time_id = 2018`).then(res=>{
                fs.writeFileSync(__dirname+"/../../../raw/statsamerica.acs.poverty_individuals.json", JSON.stringify(res.recordset));
                next();
            });
        },

        next=>{
            console.log("loading acs.under18 --------------------------");
            pool.request().query(`SELECT * FROM acs_common_items_extract WHERE code_id = '411' and time_id = 2018`).then(res=>{
                fs.writeFileSync(__dirname+"/../../../raw/statsamerica.acs.under18.json", JSON.stringify(res.recordset));
                next();
            });
        },

        next=>{
            console.log("loading acs.over65 --------------------------");
            pool.request().query(`SELECT * FROM acs_common_items_extract WHERE code_id = '365' and time_id = 2018`).then(res=>{
                fs.writeFileSync(__dirname+"/../../../raw/statsamerica.acs.over65.json", JSON.stringify(res.recordset));
                next();
            });
        },
    ], err=>{
        if(err) throw err;
        pool.close();
    });
}




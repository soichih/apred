#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

console.log("beafips_match--------------------------");

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    load(pool);
});

function load(pool) {

    async.series([
        next=>{
            pool.request().query(`SELECT * FROM bea_fips_match_ii`).then(res=>{
                console.dir(res);
                /*
                {
                  match_id: 1,
                  statefips: '02',
                  countyfips: '105',
                  statefips_new: '02',
                  countyfips_new: '232'
                },
                */
                //TODO - what to do with the mapping? apply the county code update?
                next();
            });
        },

        next=>{
            pool.request().query(`SELECT * FROM bea_gdp_uscnty WHERE YEAR = 2018`).then(res=>{
                /*
                {
                    "statefips": "02",
                    "countyfips": "158",
                    "linecd": "0056",
                    "year": "2011",
                    "disc_c": "0",
                    "gcp_c": 20638,
                    "disc_r": "0",
                    "gcp_r": 20974,
                    "disc_idx": "0",
                    "gcp_idx": 101.645
                },
                */
                fs.writeFileSync(__dirname+"/../../../raw/statsamerica.bea.gdp.json", JSON.stringify(res.recordset));
                next();
            });
        },

    ], err=>{
        if(err) throw err;
        pool.close();
    });
}


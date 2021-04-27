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
            console.log("loading dbo.bea_gdp_uscnty_linecodes");
            //To get the GDP values for each county and sector, you can ingest the following. We would want to grab the most recent year for each county when tabulating things on the platform.

            pool.request().query(`
                SELECT * FROM bea_gdp_uscnty_linecodes
            `).then(res=>{
                /*
                {
                  fips: '01079',
                  year: '2019',
                  gcp_r: 97451,
                  linecd: '0083',
                  description: 'Government and government enterprises'
                },
                */
                res.recordset.forEach(rec=>{
                    rec.description = rec.description.trim();
                });
                fs.writeFileSync(config.pubdir+"/raw/linecodes.json", JSON.stringify(res.recordset));
                next();
            });
        },
        /*
        next=>{
            pool.request().query(`SELECT * FROM bea_fips_match_ii`).then(res=>{
                console.dir(res);
                //{
                //  match_id: 1,
                //  statefips: '02',
                //  countyfips: '105',
                //  statefips_new: '02',
                //  countyfips_new: '232'
                //},
                //TODO - what to do with the mapping? apply the county code update?
                next();
            });
        },
        */

        next=>{
            console.log("loading bea.gdp-per-sector");
            //To get the GDP values for each county and sector, you can ingest the following. We would want to grab the most recent year for each county when tabulating things on the platform.
            pool.request().query(`
                SELECT CONCAT(A.[statefips], A.[countyfips]) [fips], A.[year], A.[gcp_r], A.[linecd], B.[description]
                FROM [stats4].[dbo].[bea_gdp_uscnty] A
                JOIN [stats4].[dbo].[bea_gdp_uscnty_linecodes] B ON B.[code] = A.[linecd]
                WHERE A.year > 2018
            `).then(res=>{
                /*
                {
                  fips: '01079',
                  year: '2019',
                  gcp_r: 97451,
                  linecd: '0083',
                  description: 'Government and government enterprises'
                },
                */

                //for each fip/linecd, find the biggest year
                let maxs = {};
                res.recordset.forEach(rec=>{
                    const key = rec.fips+"."+rec.linecd;
                    if(!maxs[key] || maxs[key].year < rec.year) maxs[key] = rec;
                });

                fs.writeFileSync(config.pubdir+"/raw/statsamerica.bea.gdp-per-sector.json", 
                    JSON.stringify(Object.values(maxs))
                );
                next();
            });
        },

        next=>{
            console.log("loading bea.gdp");
            pool.request().query(`SELECT * FROM bea_gdp_uscnty WHERE linecd = 0001 AND YEAR = 2018`).then(res=>{
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
                fs.writeFileSync(config.pubdir+"/raw/statsamerica.bea.gdp.json", JSON.stringify(res.recordset));
                next();
            });
        },

    ], err=>{
        if(err) throw err;
        pool.close();
    });
}


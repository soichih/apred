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

        //this table maps census fips code to bea fips code (most statsamerica entities are mapped to it)
        next=>{
            pool.request().query(`SELECT * FROM bea_fips_match_ii`).then(res=>{
                //{
                //  match_id: 1,
                //  statefips: '02',
                //  countyfips: '105',
                //  statefips_new: '02',
                //  countyfips_new: '232'
                //},
                /*
                {
                  match_id: 67,
                  statefips: '02',
                  countyfips: '270',
                  statefips_new: '02',
                  countyfips_new: '158'
                }
                */
                const beamap = {};
                res.recordset.forEach(rec=>{
                    const fips = rec.statefips+"."+rec.countyfips;
                    const newfips = rec.statefips_new+"."+rec.countyfips_new;
                    if(!beamap[newfips]) {
                        beamap[newfips] = [];
                    }
                    beamap[newfips].push(fips);
                })
                /*
                {
                  '12086': [ '12025' ],
                  '15901': [ '15005', '15009' ],
                  '46102': [ '46113' ],
                  '51019': [ '51019', '51515', '51909' ],
                  '51901': [ '51003', '51540' ],
                  '51903': [ '51005', '51560', '51580' ],
                  '51907': [ '51015', '51790', '51820' ],
                  '51911': [ '51031', '51680' ],
                  '51913': [ '51035', '51640' ],
                  '51918': [ '51053', '51570', '51730' ],
                  '51919': [ '51059', '51600', '51610' ],
                  '51921': [ '51069', '51840' ],
                  '51923': [ '51081', '51595' ],
                  '51929': [ '51089', '51690' ],
                  '51931': [ '51095', '51830' ],
                  '51933': [ '51121', '51750' ],
                  '51939': [ '51143', '51590' ],
                  '51941': [ '51149', '51670' ],
                  '51942': [ '51153', '51683', '51685' ],
                  '51944': [ '51161', '51775' ],
                  '51945': [ '51163', '51530', '51678' ],
                  '51947': [ '51165', '51660' ],
                  '51949': [ '51175', '51620' ],
                  '51951': [ '51177', '51630' ],
                  '51953': [ '51191', '51520' ],
                  '51955': [ '51195', '51720' ],
                  '51958': [ '51199', '51735' ],
                  '02232': [ '02105', '02230' ],
                  '02901': [ '02130', '02198', '02201' ],
                  '02280': [ '02195', '02275' ],
                  '02158': [ '02270' ]
                }
                */
                fs.writeFileSync(config.pubdir+"/beamap.json", JSON.stringify(beamap));
                next();
            });
        },

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


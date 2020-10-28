#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

console.log("statsamerica c2k_uscnty_acs --------------------------");

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    load_population(pool);
    load_medianincome(pool);
    load_percapitaincome(pool);
});
function load_population(pool) {
    //pool.request().query(` SELECT * FROM [stats_dms5].[dbo].[c2k_uscnty_acs] `).then(res=>{
    pool.request().query(`SELECT * FROM stats4.dbo.poparo_uscnty`).then(res=>{
        //res.recordset
        /*
        {
          statefips: '72',
          countyfips: '153',
          year: '2018',
          totpop: 36439,
          pop_0to4: 1618,
          pop_5to17: 5609,
          pop_18to24: 3236,
          pop_25to44: 8598,
          pop_45to64: 9985,
          pop_65plus: 7393,
          medage: 43,
          onerace: 35342,
          or_black: 1300,
          or_amind: 152,
          or_asian: 5,
          or_white: 28189,
          or_haw: 0,
          or_other: 6279,
          race_tom: 514,
          hispanic: 36344,
          mexican: 35,
          cuban: 27,
          pr: 36089,
          oth_hisp: 193,
          tot_nh: 95,
          nh_orwhite: 48,
          tothh: 10790,
          tot_famhh: 6912,
          fhh_mwc: 873,
          fhh_mnc: 3663,
          fhh_singlepar: 826,
          hh_nonfam: 3878,
          hh_unmarpart: 202,
          hh_livalone: 3533,
          hh_avgsize: 3.35,
          fhh_avgsize: 4.62,
          housunits: 17427,
          hu_occ: 10790,
          hu_ownocc: 8143,
          hu_rentocc: 2647,
          vacant: 6637,
          vacant_seas: 231,
          land_sqmi: 68.2,
          pop_density: 534.3,
          a_c: 'a',
          c_e: 'e',
          geo_id: 72153,
          time_id: 2018,
          code_id: 0
        }
        */
        fs.writeFileSync(config.pubdir+"/raw/statsamerica.acs.json", JSON.stringify(res.recordset));
        pool.close();
    });
}

function load_medianincome(pool) {
    pool.request().query(` SELECT * FROM [stats_dms5].[dbo].[acs_common_items_extract] WHERE code_id = '307' and time_id = '2018'`).then(res=>{
        /*
          {
            "geo_id": 11000,
            "time_id": 2017,
            "code_id": 307,
            "data": 77649
          },

        */
        fs.writeFileSync(config.pubdir+"/raw/statsamerica.acs.medianincome.json", JSON.stringify(res.recordset));
        pool.close();
    });
}


function load_percapitaincome(pool) {
    pool.request().query(`
        select * from stats4.dbo.pcpi_uscnty WHERE year = (SELECT TOP (1) year FROM stats4.dbo.pcpi_uscnty ORDER BY year DESC) AND countyfips <> '000' AND LINECODE = '0030'
    `).then(res=>{
        /*
        {
          statefips: '55',
          LINECODE: '0030',
          countyfips: '087',
          REGION: null,
          DATA: 51230,
          YEAR: '2018',
          DISC: 0,
          naics: null
        },
        */
        fs.writeFileSync(config.pubdir+"/raw/statsamerica.acs.percapitaincome.json", JSON.stringify(res.recordset));
        pool.close();
    });
}

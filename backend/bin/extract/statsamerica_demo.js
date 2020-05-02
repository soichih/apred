#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

console.log("statsamerica_demo--------------------------");

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    load_gemographics(pool);
});

function padfront(str, pad, len) {
    while(str.length < len) {
        str = pad + str;
    }
    return str;
}

function load_gemographics(pool) {
    let groups = [
	     { code_id: 312, description: 'Population 0 to 4' },
	     { code_id: 313, description: 'Population 5 to 17' },
	     { code_id: 314, description: 'Population 18 to 24' },
	     { code_id: 315, description: 'Population 25 to 44' },
	     { code_id: 316, description: 'Population 45 to 64' },
	     { code_id: 317, description: 'Population 65 and Over' },
    ];

    let demo = {};

    async.eachSeries(groups, (group, next_group)=>{
        console.log("querying");
        console.log(group);

        pool.request().query(`
        SELECT 
            A.[geo_id] ,A.[time_id] ,A.[code_id] ,A.[data]
            FROM [stats_dms5].[dbo].[ACS_common_items_extract] A
            JOIN [stats_dms5].[dbo].[GEOGRAPHY_NAME] G ON G.[sumlev]='050' AND G.[geo_id] = A.[geo_id]
            WHERE A.[time_id] = '2018' AND A.[code_id]='${group.code_id}'
        `).then(res=>{
            /*
{ geo_id: 13029, time_id: 2018, code_id: 317, data: 3653 },
{ geo_id: 13031, time_id: 2018, code_id: 317, data: 8175 },
{ geo_id: 13033, time_id: 2018, code_id: 317, data: 3299 },
{ geo_id: 13035, time_id: 2018, code_id: 317, data: 3579 },
{ geo_id: 13037, time_id: 2018, code_id: 317, data: 934 },
{ geo_id: 13039, time_id: 2018, code_id: 317, data: 6436 },
            */
            res.recordset.forEach(rec=>{
                let geo_id = rec.geo_id.toString();
                if(geo_id.length == 6) {
                    geo_id = geo_id.substring(1);
                }
                if(!demo[geo_id]) demo[geo_id] = [];
                demo[geo_id].push({group: rec.code_id, value: rec.data});
            });
            next_group();
        });
    }, err=>{
        if(err) throw err;
        fs.writeFileSync(__dirname+"/../../../raw/statsamerica.demo.json", JSON.stringify(demo));
        pool.close();
    });
}


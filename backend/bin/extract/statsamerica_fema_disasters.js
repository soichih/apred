#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

console.log("statsamerica_fema_disasters-----------------------------------");

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    load(pool);
});

function load(pool) {
    let dds = [];
    pool.request().query(`SELECT * from FEMA_disasters WHERE declarationType = 'DR' AND fyDeclared >= '2015'`).then(res=>{

        res.recordset.forEach(rec=>{
            if(!rec.fipsStateCode) {
                console.log(rec.disasterNumber, "statfips missing");
                console.dir(rec);
            }
            if(!rec.fipsCountyCode) {
                console.log(rec.disasterNumber, "countyfip missing");
                console.dir(rec);
            }
            if(rec.incidentType.startsWith("\"")) {
                console.dir(rec);
                console.log("incidentType should not start with double quote");
                process.exit(1);
            }
            dds.push(rec);
        });

        //console.log(dds.length);
        fs.writeFileSync(config.pubdir+"/raw/statsamerica.disasters.2015-now.json", JSON.stringify(dds));
        pool.close();
    });

}


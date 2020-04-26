#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const config = require('../../config');
const mssql = require('mssql');

//I can only connect from IU VPN connected IPs - not dev1
mssql.connect(config.stats_america.db_stats4).then(pool=>{
    console.log("connected");
    load(pool);
});

function load(pool) {
    let dds = [];

    pool.request().query(`SELECT * from FEMA_disasters WHERE fyDeclared >= '2015'`).then(res=>{

        res.recordset.forEach(rec=>{
            /*
            { disasterNumber: 4026,
              ihProgramDeclared: 1,
              iaProgramDeclared: 0,
              paProgramDeclared: 1,
              hmProgramDeclared: 1,
              state: 'NH',
              statefips: '33',
              declarationDate: '2011-09-03T00:00:00.000Z',
              fyDeclared: '2011',
              disasterType: 'DR',
              incidentType: 'Hurricane',
              title: 'TROPICAL STORM IRENE',
              incidentBeginDate: '2011-08-26T00:00:00.000Z',
              incidentEndDate: '2011-09-06T00:00:00.000Z',
              disasterCloseOutDate: null,
              declaredCountyArea: 'Carroll (County)',
              placeCode: '99003',
              countyfips: '003',
              hash: 'd1162bba60cf9948d9b532003355e0c8',
              latRefresh: '2019-10-10T19:57:04.115Z' }
            */

            /*
            //search for state fips
            let fips_rec = null;
            for(let fip in fips) {
                let info = fips[fip];
                if(rec.state == info.stabb) {
                    rec.statefips = info.statefips;
                    break;
                }
            }
            if(!rec.statefips && rec.state) {
                console.log("failed to find statefips:", rec.state);
            }
            */
            if(!rec.statefips) {
                console.log(rec.disasterNumber, "statfips missing");
                console.dir(rec);
            }
            if(!rec.countyfips) {
                console.log(rec.disasterNumber, "countyfip missing");
                console.dir(rec);
            }

            /*
            if(rec.incidentType == "Biological") {
                console.dir(rec);
            }
            */

            dds.push(rec);
        });

        console.log("writing json");
        fs.writeFileSync("../../../raw/statsamerica.disasters.2015-now.json", JSON.stringify(dds));
        pool.close();
    });

}


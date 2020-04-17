#!/usr/bin/env nodejs

const fs = require('fs');
const axios = require('axios');
const csvParser = require('csv-parser');

const fips = require('../data/fips.json');

axios({
    method: "get",
    url: "https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries.csv",
    responseType: 'stream'
}).then(res=>{
    let recs = [];
    let fipsmiss = 0;
    res.data.pipe(csvParser({})).on('data', rec=>{
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

        //search for county fips
        if(rec.declaredCountyArea) {
            //rec.declearedCountyArea contains a lot of verbose names strip them
            let county = rec.declaredCountyArea.substring(0, rec.declaredCountyArea.length-9)
                .toLowerCase().replace(/(\s|\.|\')/g, '');
            let oppos = county.indexOf("(");
            if(~oppos) county = county.substring(0,oppos).trim();

            for(let fip in fips) {
                let info = fips[fip];
                let info_county = info.county
                if(typeof info.county != 'string') return; //some record is "Function" wtf!?
                info_county = info_county.toLowerCase().replace(/(\s|\.|\')/g, '')
                //if(rec.state == info.stabb && info_county.includes(county)) {
                if(rec.state == info.stabb && info_county.startsWith(county)) {
                    rec.countyfips = info.countyfips;
                    break;
                }
            }
        }

        if(!rec.countyfips && rec.declaredCountyArea) {
            console.log("failed to find countyfips:", res.disasterNumber, rec.state, rec.declaredCountyArea);
            console.dir(rec);
            fipsmiss++;
        }

        //type cast
        rec.ihProgramDeclared = (rec.ihProgramDeclared == "1");
        rec.iaProgramDeclared = (rec.iaProgramDeclared == "1");
        rec.paProgramDeclared = (rec.paProgramDeclared == "1");
        rec.hmProgramDeclared = (rec.hmProgramDeclared == "1");

        rec.declarationDate = new Date(rec.declarationDate);
        rec.incidentBeginDate = new Date(rec.incidentBeginDate);
        if(rec.incidentEndDate) {
            rec.incidentEndDate = new Date(rec.incidentEndDate);
        } else {
            delete rec.incidentEndDate;
        }
        if(rec.disasterCloseOutDate) {
            rec.disasterCloseOutDate = new Date(rec.disasterCloseOutDate);
        } else {
            delete rec.disasterCloseOutDate;
        }
        rec.lastRefresh = new Date(rec.lastRefresh);
        recs.push(rec);
    }).on('end', err=>{
        console.log("fipsmiss", fipsmiss, "in", recs.length);
        fs.writeFileSync("../../../raw/DisasterDeclarationsSummaries.json", JSON.stringify(recs));
    });

});

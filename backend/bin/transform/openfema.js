#!/usr/bin/env nodejs

const csvParser = require('csv-parser');
const fs = require('fs');
const async = require('async');

//TODO - maybe I can just load this while I process counties directly.. not transofmration necessary?

console.debug("loading openfema");
fs.createReadStream(__dirname+'/../../../raw/PublicAssistanceFundedProjectsDetails.csv').pipe(csvParser({
    mapValues({header, index, value}) {
        /*
disasterNumber,declarationDate,incidentType,pwNumber,applicationTitle,applicantId,damageCategoryCode,dcc,damageCategory,projectSize,county,countyCode,state,stateCode,stateNumberCode,projectAmount,federalShareObligated,totalObligated,obligatedDate,hash,lastRefresh,id
1239,1998-08-26T19:50:08.000Z,Severe Storm(s),35,Not Provided,463-99463-00,C - Roads and Bridges,C,Roads and Bridges,Small,Uvalde,463,Texas,TX,48,5322.68,3992.01,4193.21,1998-10-23T11:29:35.000Z,43e2970d712f048bafa5b0ee8850baf2,2020-01-10T02:34:41.169Z,5e17e2c1c3cdaf7453a4eda7
        */
        /*
        if(header.match("_date")) return new Date(value);
        let i = parseInt(value);
        let f = parseFloat(value);
        if(i == value) return i;
        if(f == value) return f;
        */
        return value;
    },
    /*
    mapHeaders({header, index}) {
        return header.toLowerCase();
    },
    */
})).on('data', async rec=>{
    console.dir(rec);
    /*
    let indicator = Object.values(data.cutter.indicators).find(i=>i.id == rec.indicator);
    if(!indicator.sources) indicator.sources = [];
    indicator.sources.push({id: rec.id, name: rec.name});
    */
}).on('end', ()=>{
    //console.log(JSON.stringify(data.cutter.indicators, null, 4));
    console.log("done");
});

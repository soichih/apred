#!/usr/bin/env nodejs
const fs = require('fs');
const config = require('../../config');

console.log("creating regions.json");

const regions = require(config.pubdir+"/raw/regions_eda.json");

const regionList = {}; //key by edd_id
regions.forEach(r=>{
    if(!regionList[r.edd_id]) regionList[r.edd_id] = {
        fips: [],
        name: r["District Name"],
        RO: r.RO,
    };
    regionList[r.edd_id].fips.push(r.FIPS);
});
console.dir(regionList);
fs.writeFileSync(config.pubdir+"/regionlist.json", JSON.stringify(regionList));

console.log("all done");



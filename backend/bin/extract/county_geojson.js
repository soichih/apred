#!/usr/bin/env nodejs
const axios = require('axios')
const fs = require('fs');

//https://eric.clst.org/tech/usgeojson/
let url = "https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_20m.json"; //smallest
//let url = "https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_5m.json"; //medium
//let url = "https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_500k.json"; //largest (most detailed)
axios.get(url).then(res=>{
    fs.writeFileSync("../../../raw/counties_geo.json", JSON.stringify(res.data));
});
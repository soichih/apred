#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const axios = require('axios');

<<<<<<< HEAD
console.log("eda2018-----------------------------------");

const fips = require(__dirname+'/../../../data/fips.json');
const geocodes = require(__dirname+'/../../../data/fain_geocodes.json');

const eda2018 = require(__dirname+'/../../../raw/statsamerica.eda2018.json');
=======
const fips = require('../../../data/fips.json');
/*
  { _id: { '$oid': '5e581c899c2c301b17c0c12f' },
    county: 'Northwest Arctic',
    stabb: 'AK',
    statefips: '02',
    countyfips: '188',
    state: 'Alaska' },
*/

const geocodes = require('../../../data/fain_geocodes.json');

const eda2018 = require('../../../raw/statsamerica.eda2018.json');
>>>>>>> 28eac27be053040e551db1f4ba43e1e7cd6a2d44

let need_geocode = [];

for(let fain in eda2018) {
    let rec = eda2018[fain];

    //check to see if geocoded
    let geocode = geocodes[fain];
    if(!geocode) {
        need_geocode.push(fain);
        console.log("need to lookup geocode");
        console.dir(rec);
    } else {
        rec.lat = geocode.lat;
        rec.lon = geocode.lon;
    }

    //lookup county fips
    rec.counties.forEach(c=>{
        //  { county: ' Lee', stateadd: 'TX' },
        c.county = c.county.trim();

        let fi = fips.find(f=>{
            let county = c.county;
            county = county.replace(".", "");
            county = county.replace("Ft ", "Fort ");
            if(f.stabb == c.stateadd && f.county == county) return true;
            return false;
        });
        if(fi) {
            c.statefips = fi.statefips;
            c.countyfips = fi.countyfips;
        } else {
            console.log("couldn't find fips for", c, fain);
        }
    });
}

async.eachSeries(need_geocode, (fain, next_fain)=>{
    //http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address=1600+Amphitheatre+Parkway,+Mountain+View,+CA
    let rec = eda2018[fain];
    let address = rec.grantee_name+", "+rec.grantee_city+", "+rec.grantee_state;
    console.log("looking up address for", address, fain);
    axios.get('http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address='+address).then(res=>{
        if(res.data.status == "OK") {
            let result = res.data.results[0]
            console.dir(result);
            /*
            { types: [ 'administrative_area_level_1', 'political' ],
              address_components:
               [ { types: [Array], short_name: 'U', long_name: 'U' },
                 { types: [Array], short_name: 'se', long_name: 'Sweden' } ],
              geometry:
               { location_type: 'APPROXIMATE',
                 location: { lat: 59.8, lng: 15.55 },
                 viewport: { northeast: [Object], southwest: [Object] } } }
            */
            rec.lat = result.geometry.location.lat;
            rec.lon = result.geometry.location.lng;
            geocodes[fain] = rec;
            console.dir(rec);
        } else {
            console.error(res.data);
        }
        next_fain();
    });
}, err=>{
    if(err) throw err;
    console.log("done");

    //store previously coded geocode
    fs.writeFileSync('../../../data/fain_geocodes.json', JSON.stringify(geocodes));

    fs.writeFileSync('../../../data/eda2018.json', JSON.stringify(eda2018));
});

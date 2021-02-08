#!/usr/bin/env nodejs

const fs = require('fs');
const async = require('async');
const axios = require('axios');
const config = require('../../config');
const NodeGeocoder = require('node-geocoder');

console.log("eda2018-----------------------------------");

const fips = require(config.pubdir+'/fips.json');
const geocodes = require(__dirname+'/fain_geocodes.json');

const eda2018 = require(config.pubdir+'/raw/statsamerica.eda2018.json');
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

const options = {
  provider: 'google',
  //fetch: customFetchImplementation,
  apiKey: config.google_geocode_api,
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

async.eachSeries(need_geocode, async (fain, next_fain)=>{
    //http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address=1600+Amphitheatre+Parkway,+Mountain+View,+CA
    let rec = eda2018[fain];
    let address = rec.grantee_name+", "+rec.grantee_city+", "+rec.grantee_state;
    console.log("looking up address for", address, fain);
    try {
        let results = await geocoder.geocode(address);
        /*
        [ { formattedAddress: '420 Broadway, Kingston, NY 12401, USA',
            latitude: 41.9271216,
            longitude: -73.99614749999999,
            extra:
             { googlePlaceId: 'ChIJhyjt3QMP3YkR-k6SVkQLbN0',
               confidence: 1,
               premise: null,
               subpremise: null,
               neighborhood: 'Kingston',
               establishment: null },
            administrativeLevels:
             { level2long: 'Ulster County',
               level2short: 'Ulster County',
               level1long: 'New York',
               level1short: 'NY' },
            streetNumber: '420',
            streetName: 'Broadway',
            city: 'Kingston',
            country: 'United States',
            countryCode: 'US',
            zipcode: '12401',
            provider: 'google' } ]
        */
        let result = results[0]

        rec.lat = result.latitude;
        rec.lon = result.longitude;
        console.dir(rec);
        geocodes[fain] = rec;
    } catch(err) {
        console.error(error);
    }

    /*
    axios.get('http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address='+address).then(res=>{
        if(res.data.status == "OK") {
            let result = res.data.results[0]
            console.dir(result);
            rec.lat = result.geometry.location.lat;
            rec.lon = result.geometry.location.lng;
            geocodes[fain] = rec;
            //console.dir(rec);
        } else {
            console.error(res.data);
        }
        next_fain();
    }).catch(err=>{
        console.error(err);
        next_fain();
    });
    */

}, err=>{
    if(err) throw err;
    console.log("done");

    //store previously coded geocode
    fs.writeFileSync(__dirname+'/fain_geocodes.json', JSON.stringify(geocodes));
    fs.writeFileSync(config.pubdir+'/eda2018.json', JSON.stringify(eda2018));

    //convert eda2018 to geojson
    const geojson = {type: "FeatureCollection", features: []};
    for(const recid in eda2018) {
        const rec = eda2018[recid];
        geojson.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [ rec.lon, rec.lat ],
            },
            properties: {
                awardStr: "$"+rec.award_amount,
                date: new Date(rec.grant_award_date).getTime(),
                purpose: rec.grant_purpose, //Infrastructure / Construction / Non-Construction / Technical.. / Disaster.. Revolving

            }
        });

        const ep = 0.15;
        geojson.features.push({
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [ 
                    [   [ rec.lon-ep, rec.lat-ep ],
                        [ rec.lon-ep, rec.lat+ep ],
                        [ rec.lon+ep, rec.lat+ep ],
                        [ rec.lon+ep, rec.lat-ep ],
                        [ rec.lon-ep, rec.lat-ep ], ]
                ]
            },
            properties: {
                height: Math.max(25000, rec.award_amount/10),
                date: new Date(rec.grant_award_date).getTime(),
                color: rec.statewide?'#00ff00':'#0066ff',
                purpose: rec.grant_purpose, //Infrastructure / Construction / Non-Construction / Technical.. / Disaster.. Revolving
            }
        });
    }

    fs.writeFileSync(config.pubdir+'/eda2018.geojson', JSON.stringify(geojson));

});



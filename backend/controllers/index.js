const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const async = require('async');
const fs = require('fs');

const config = require('../config');

router.get('/health', (req, res, next)=>{
    let db = req.app.get('db');

    let status = "unknown";
    res.json({status, db_connected: db.serverConfig.isConnected()});
});

//curl localhost:12701/county_counts/48.47
router.get('/county/:fips', (req, res, next)=>{
    let db = req.app.get('db');

    const col = db.collection('county');
    col.findOne({fips: req.params.fips}, (err, rec)=>{
        if(err) return next(err);
        res.json(rec);
    });
});

router.get('/eda2018/:statefips', (req, res, next)=>{
    let db = req.app.get('db');

    const col = db.collection('eda2018_state');
    col.find({statefips: req.params.statefips}).toArray((err, recs)=>{
        if(err) return next(err);
        res.json(recs);
    });
});

router.get('/eda2018/:statefips/:countyfips', (req, res, next)=>{
    let db = req.app.get('db');

    const col = db.collection('eda2018');
    col.find({statefips: req.params.statefips, countyfips: req.params.countyfips}).toArray((err, recs)=>{
        if(err) return next(err);
        res.json(recs);
    });
});

//curl localhost:12701/search_fips?q=monroe
router.get('/search_fips', (req, res, next)=>{
    let db = req.app.get('db');

    const col = db.collection('fips');
    col.find({$text: { $search: req.query.q }}).toArray((err, recs)=>{
        if(err) return next(err);
        res.json(recs);
    });
});

router.get('/storm/histogram', (req, res, next)=>{
    let db = req.app.get('db');
    const col = db.collection('storm_histogram');
    col.find({}).toArray((err, recs)=>{
        if(err) return next(err);
        res.json(recs);
    });
});

router.get('/storm/query/:fips', (req, res, next)=>{
    let db = req.app.get('db');

    let fips = req.params.fips.split(".");
    db.collection('storm_data').find({
        //query
        state_fips: fips[0], 
        cz_fips: fips[1] 
    }).project({
        //get rid of tthings we don't need
        state: false,
        state_fips: false,
        cz_type: false,
        cz_fips: false,
        cz_name: false,
    }).toArray((err, recs)=>{
        //console.dir(recs[0]);
        if(err) return next(err);
        res.json(recs);
    });
});

/*
//search currently open disaster declarations
router.get('/currentdd/:statefips/:statefips?', async (req, res, next)=>{
    let db = req.app.get('db');

    let statefips = req.params.statefips;
    let countyfips = req.params.countyfips;

    let state_dds = await db.collection('disaster_declarations').find({statefips}).toArray();

    let county_dds = null;
    if(countyfips) {
        county_dds = await db.collection('disaster_declarations').find({statefips, countyfips}).toArray();
    }

    res.json({state_dds, county_dds});
});
*/

router.get('/currentdd', async (req, res, next)=>{
    let db = req.app.get('db');
    let dds = await db.collection('disaster_declarations').find({
        disasterType: "DR",
        incidentEndDate: "",
    }).toArray();
    res.json(dds);
});

router.get('/dd/:statefips/:countyfips', async (req, res, next)=>{
    let db = req.app.get('db');
    /*
    let county_dds = await db.collection('disaster_declarations').find({
        statefips: req.params.statefips, 
        countyfips: req.params.countyfips
    }).toArray();

    let state_dds = await db.collection('disaster_declarations').find({
        statefips: req.params.statefips, 
        countyfips: {$exists: false}, 
    }).toArray();

    res.json({county: county_dds, state: state_dds});
    */
    let dds = await db.collection('disaster_declarations').find({
        disasterType: "DR",
        statefips: req.params.statefips, 
        $or: [
            {countyfips: {$exists: false}}, //statewide
            {countyfips: req.params.countyfips},
        ]
    }).toArray();
    res.json(dds);

});

router.get('/bvi/:statefips/:countyfips', async (req, res, next)=>{
    let db = req.app.get('db');
    let county = parseFloat(req.params.statefips+req.params.countyfips);
    let recs = await db.collection('bvi').find({
        county,
    }).toArray();
    res.json(recs);
});

router.get('/covid19/tweets/states/:block', async (req, res, next)=>{
    let block = req.params.block;
    if(!block.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) return next("bad block");
    let path = "/home/hayashis/git/apred/data/covid19/"+block+"/tweets_state.csv";
    let csv = fs.readFileSync(path, "ascii");
    let lines = csv.split("\n");
    let headers = lines.shift();
    let data = [];
    lines.forEach(line=>{
        let cols = line.split(",");
        data.push({
            state: cols[0], 
            total: parseInt(cols[1]),
            virus: parseInt(cols[2]),
            virus_p: parseFloat(cols[3]),
        });
    });
    res.json(data);
});

const geocode = require("/home/hayashis/git/apred/data/geocode.json");
//store in dict of state/city for quick lookup
const geocode_lookup = {};
geocode.forEach(city=>{
    geocode_lookup[city.state_code+"/"+city.city] = [city.longitude, city.latitude];
});

//preload blocks
const tweets_city_20200307 = loadTweetsCity("/home/hayashis/git/apred/data/covid19/2020-03-07/tweets_city.csv");
console.log("done loading", tweets_city_20200307.features[0]);
    
function loadTweetsCity(path) {
    console.log("loading", path);
    let csv = fs.readFileSync(path, "ascii");
    let lines = csv.split("\n");
    let headers = lines.shift();

    let features = [];

    //parse csv
    lines.forEach(line=>{
        if(line == "") return;
        let cols = line.split(",");

        let city = cols[0];
        let state_code = cols[1];
        let total = parseInt(cols[2]);
        let total_user = parseInt(cols[3]);
        let total_p = parseFloat(cols[4]);
        let virus = parseFloat(cols[5]);
        let user_virus = parseFloat(cols[6]);
        let virus_p = parseFloat(cols[7]);
        let virus_rel_p = parseFloat(cols[8]);
        let user_virus_p = parseFloat(cols[9]);

        //lookup geocode
        let coordinates = geocode_lookup[state_code+"/"+city];
        if(!coordinates) {
            console.error("unknown city", state_code, city);
            return;
        }


        features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates,
            },
            properties: {
                city,state_code,total,total_user,total_p,virus,user_virus,virus_p,virus_rel_p,user_virus_p
            }
        });

        if(city == "San Antonio") {
            console.log("San Antonio dump");
            console.dir(features[features.length-1]);
        }
    });

    return {
        type: "FeatureCollection",
        features,
    }
}


//we need to convert a large geojson to vector layer using a tool like..
//https://github.com/mapbox/geojson-vt
router.get('/covid19/tweets/cities/:block', async (req, res, next)=>{
    let block = req.params.block;
    if(!block.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) return next("bad block");
    switch(block) {
    case "2020-03-07":
        res.json(tweets_city_20200307);
        break;
    default:
        next("no found");
    }
});
/*
router.use('/project', require('./project'));
router.use('/dataset', require('./dataset'));
router.use('/app', require('./app'));
router.use('/pub', require('./pub'));
router.use('/datatype', require('./datatype'));
router.use('/event', require('./event'));
router.use('/rule', require('./rule'));
router.use('/datalad', require('./datalad'));
*/

module.exports = router;


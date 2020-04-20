#!/usr/bin/env nodejs

const MongoClient = require('mongodb').MongoClient;
const csvParser = require('csv-parser');
const fs = require('fs');
const assert = require('assert');
const xml = require("xml-parse");
const async = require('async');
const elasticsearch = require('@elastic/elasticsearch');
const NodeGeocoder = require('node-geocoder');
const axios = require('axios');

const config = require('../../../config');

// Use connect method to connect to the server
MongoClient.connect(config.mongo.url, {useUnifiedTopology: true}, function(err, client) {
    if(err) throw err;
    console.log("connected to mongo");
    let db = client.db("apred");

    let geocodes = {}; 
    const collection_state = db.collection('eda2018_state');
    collection_state.find().toArray((err, recs)=>{
        if(err) throw err;
        recs.forEach(rec=>{
            geocodes[rec.fain] = rec;
            console.dir(rec);
        });

        const collection_state = db.collection('eda2018');
        collection_state.find().toArray((err, recs)=>{
            if(err) throw err;
            recs.forEach(rec=>{
                geocodes[rec.fain] = rec;
                console.dir(rec);
            });

            console.log("saving");
            fs.writeFileSync("fain_geocodes.json", JSON.stringify(geocodes));
            console.log("done");
            client.close();
        });
    });

});


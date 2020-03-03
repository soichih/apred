const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
//const bodyParser = require('body-parser');
//const compression = require('compression');
const cors = require('cors');
//const nocache = require('nocache');

const config = require('./config');
const MongoClient = require('mongodb').MongoClient;

//init express
const app = express();
app.use(cors());
app.use(morgan('dev'));

//app.use(compression());
//app.use(nocache());

//app.use(bodyParser.json({limit: '2mb'}));  //default is 100kb
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(expressWinston.logger(config.logger.winston));

app.use('/', require('./controllers'));

//error handling
//app.use(expressWinston.errorLogger(config.logger.winston)); 

console.debug("initializing database...");
MongoClient.connect(config.mongo.url, {useUnifiedTopology: true}, function(err, mongo_client) {
    if(err) return cb(err);
    db = mongo_client.db("apred");

    let fips = db.collection('fips');
    fips.createIndex({state: "text", county: "text", stabb: "text"});

    app.set("db", db);
    var server = app.listen(config.express.port, "localhost", function() {
        console.info("apred data server started", config.express.port);
    });
});


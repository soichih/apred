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

const config = require('../config');

const es = new elasticsearch.Client({node: 'http://localhost:9200'});

var geocoder = NodeGeocoder({
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: config.google_api.key,
  formatter: null         // 'gpx', 'string', ...
});

// raw data loaded from various datasources 
let data = {
    /*
    { description,geocode,geotype,partial,stabb,statefips,countyfips }
     * Abbeville, 050,    County, 0,      SC,   45,       001  //all strings
    */
    fips: [],
    abbs: {},//ab: AR, name: "Arkanas"

    edaid: [],

    //key: fips "state.county"
    //{ counts: {} }
    counties: {},

    storm_histogram: {}, //keyed by storm name, then array of buckets

    cutter: {
        indicators: {
            "SOC": {id: "1", name: "Social Resilience"},
            "ECON": {id: "2", name: "Economic Resilience"},
            "INST": {id: "3", name: "Institutional Resilience"},
            "IHFR": {id: "4", name: "Infrastructure Resilience"},
            "COMM": {id: "5", name: "Community Capital"},
            "FLOR": {id: "100", name: "Special/Custom"},
        },

        //combined: [], //for each sources/fips
    }

    /*
    //key: fips "state"
    states: {
        events: [
        ],
        counts: {
            Tornado: 0,
        }
    },
    */
}; 

let county_events = {
    //code: county code <fips>
    //events: []
    //  date: //timestamp for events
    //  type: //type of event
}

let db;

// Use connect method to connect to the server
MongoClient.connect(config.mongo.url, {useUnifiedTopology: true}, function(err, client) {
    if(err) throw err;
    console.log("connected to mongo");

    db = client.db("apred");

    //load_noaa, //same data as storm_data

    /*
    async.series([
        
        load_fips,
        load_abbs,
        load_edaid,

        store_fips, //load_fips / load_abbs
        
        //load_storm_data,
        //load_storm_data_es,
        count_storm_data,

        
        load_cutter_sources,
        load_cutter_combined,
        
        store_county,

        store_storm_histogram,

        load_eda2018,

    ], err=>{
        if(err) throw err;
        console.log("all done");
        client.close();
    });
    */

    /*
    async.series([
        load_fips,
        load_abbs,
        load_and_store_disasterdeclarations,

    ], err=>{
        if(err) throw err;
        console.log("all done");
        client.close();
    });
    */

    /*
    async.series([
        load_fips,
        load_abbs,
        load_edaid,

        load_eda2018,

    ], err=>{
        if(err) throw err;
        console.log("all done");
        client.close();
    });
    */

    //load_covid19states();

    /*
    const collection = db.collection('bvi');
    fs.createReadStream('/home/hayashis/Downloads/bvi.csv').pipe(csvParser({
        headers: [ 
            "year","county","estab_total","estab_vuln_total","estab_vuln_pct","mm_employees","emp_vuln_total","emp_vuln_pct"
        ],
        mapValues({header, index, value}) {
            if(header.match("_date")) return new Date(value);
            let i = parseInt(value);
            let f = parseFloat(value);
            if(i == value) return i;
            if(f == value) return f;
            return value;
        },
    })).on('data', rec=>{
        delete rec.estab_vuln_pct;
        delete rec.emp_vuln_pct;
        collection.insert(rec, function(err, result) {
            console.log(rec);
        });
    }).on('end', ()=>{
        console.log("done");
        client.disconnect();
    });
    */

    /*
    let svg = fs.readFileSync('/mnt/scratch/hayashis/apred/CountyMapSvg.svg', 'utf-8');
    var convert = require('xml-js');
    var json = convert.xml2json(svg);
    var data = JSON.parse(json);
    const collection = db.collection('countyid');
    let recs = [];
    data.elements[0].elements[1].elements.forEach(path=>{
        let id = path.attributes.id;
        if(!path.elements) {
            console.log("no child elements for ", id);
            return;
        }
        let title = path.elements[0].elements[0].text;
        let cs = title.split(", ");
        //console.dir(cs);
        recs.push({id, county: cs[0], state: cs[1]});
    });
    collection.insertMany(recs, function(err, result) {
        console.log(result);
    });
    */

});

function load_fips(cb) {
    console.debug("loading fips");
    let recs = fs.readFileSync(__dirname+"/data/fips.tsv", "ascii").split("\n");
    recs.forEach(rec=>{
        if(rec == "") return;
        let tokens = rec.split("\t");
        let statefips = tokens[0].substring(0, 2);
        let countyfips = tokens[0].substring(2, 6);

        let fiprec = {county: tokens[1], stabb: tokens[2], statefips, countyfips};
        data.fips.push(fiprec);

        let fips = statefips+'.'+countyfips;
        if(!data.counties[fips]) data.counties[fips] = {storm_counts: {}, cutter_measures: []};
    })
    cb();
}

function load_and_store_disasterdeclarations(cb) {
    console.debug("loading disasterdeclerations");

    console.debug("streaming the latest disaster declaration.csv to /tmp (ASK fema to create daily report?)");
    axios({
        method: "get", 
        url: "https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries.csv",
        responseType: 'stream'
    }).then(res=>{
        //res.data.pipe(fs.createWriteStream('/tmp/DisasterDeclarationsSummaries.csv'));
        //fs.createReadStream(__dirname+'/data/DisasterDeclarationsSummaries.csv').pipe(csvParser({})).on('data', rec=>{
        let recs = [];
        res.data.pipe(csvParser({})).on('data', rec=>{
            console.log(rec.disasterNumber);

            //search for state fips
            let fips_rec = null;
            for(let fip in data.fips) {
                let info = data.fips[fip];
                if(rec.state == info.stabb) {
                    rec.statefips = info.statefips;
                    break;
                }
            }

            //search for county fips
            if(rec.declaredCountyArea) {
                for(let fip in data.fips) {
                    let info = data.fips[fip];
                    //rec.declearedCountyArea contains a lot of verbose names
                    let county = rec.declaredCountyArea.substring(0, rec.declaredCountyArea.length-9)
                        .toLowerCase().replace(/(\s|\.|\')/g, '');
                    let oppos = county.indexOf("(");
                    if(~oppos) county = county.substring(0,oppos).trim();
                            
                    let info_county = info.county
                    if(typeof info.county != 'string') return; //some record is "Function" wtf!?
                    info_county = info_county.toLowerCase().replace(/(\s|\.|\')/g, '')
                    if(rec.state == info.stabb && county == info_county) {
                        rec.countyfips = info.countyfips;
                        break;
                    }
                }
            }
            if(!rec.countyfips && rec.declaredCountyArea) {
                console.log("failed to find", rec);
            }

            //type case
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
            const collection = db.collection('disaster_declarations');
            collection.remove({}, function(err, results) {
                collection.insertMany(recs, function(err, result) {
                    cb(err);
                });
            });
        });
    }).catch(cb);

    //fs.createReadStream(__dirname+'/data/DisasterDeclarationsSummaries.csv').pipe(csvParser({})).on('data', rec=>{
}

function load_edaid(cb) {
    console.debug("loading fips");
    fs.createReadStream(__dirname+'/data/counties_EDA_DS_2018.csv').pipe(csvParser({
        mapHeaders({header, index}) {
            if(header == 'description') return 'county';
            return header;
        },
    })).on('data', rec=>{
        //data.fips.push(rec);
        rec.county = rec.county.trim();
        rec.stateabb = rec.stateabb.trim();

        data.edaid.push(rec);

        /*
        let fip = data.fips.find(fip=>(fip.county == rec.county && fip.stabb == rec.stateabb))
        if(!fip) console.log("not found in fips", rec);
        else {
            fip.edaid = rec.eda_id;
        }
        */

    }).on('end', cb);
}


function load_abbs(cb) {
    console.debug("loading abbs");
    let txt = fs.readFileSync(__dirname+'/data/state_abbs.txt', 'ascii');
    let lines = txt.split("\n");
    lines.forEach(line=>{
        if(line == "") return;
        let tokens = line.split("\t");
        data.abbs[tokens[1]] = tokens[0];
    });
    data.abbs["PR"] = "Puerto Rico";
    
    //add fullname for state abbs
    data.fips.forEach(fip=>{
        fip.state = data.abbs[fip.stabb];
        if(!fip.state) throw "couldn't resolve:"+fip.stabb;
    });

    cb();
}

function store_fips(cb) {
    const collection = db.collection('fips');
    collection.remove({}, function(err, results) {
        collection.insertMany(data.fips, function(err, result) {
            //console.log(result);
            cb(err);
        });
    });
}

let storm_data_parser = csvParser({
    mapHeaders({header, index}) {
        return header.toLowerCase();
    },
    mapValues({header, index, value}) {
        if(header.match("_date_time$")) return new Date(value);
        if(header.match("_lat$")) return parseFloat(value)+Number.EPSILON;
        if(header.match("_lon$")) return parseFloat(value)+Number.EPSILON;
        if(header.match("state_fips")) return value.padStart(2, '0');
        if(header.match("cz_fips")) return value.padStart(3, '0');
        if(header.match("^damage_")) {
            //convert 5K to 5000
            if(value[value.length-1] == "K") value = value.substring(0, value.length-1)*1000;
            return parseInt(value);
        }
        let i = parseInt(value);
        let f = parseFloat(value);
        if(i == value) return i;
        if(f == value) return f;
        return value; //string
    },
});

function clean_storm_data(rec) {
    for(let k in rec) {
        if(Number.isNaN(rec[k])) {
            rec[k] = undefined;
        }
    }

    delete rec.begin_yearmonth;
    delete rec.begin_day;
    delete rec.begin_time;

    delete rec.end_yearmonth;
    delete rec.end_day;
    delete rec.end_time;

    delete rec.year;
    delete rec.month_name;
}

function load_storm_data_es(cb) {
    console.debug("loading storm_data to es");
    let index = "apred.storm_data";
    es.indices.delete({index, ignoreUnavailable: true}, err=>{
        if(err) throw err;
        console.log("removed apred.storm_data index");
        fs.createReadStream(__dirname+'/data/storm_data.csv').pipe(storm_data_parser)
        .on('data', async rec=>{
            clean_storm_data(rec);
            try {
                await es.index({ index, body: rec });
            } catch (err) {
                console.dir(rec);
                console.dir(err);
            }
        }).on('end', ()=>{
            console.log("done");
            cb();
        });
    });
}

function load_storm_data(cb) {
    console.debug("loading storm_data to mongo");
    const collection = db.collection('storm_data');
    let recs = [];
    collection.remove({}, function(err, results) {
        let instream = fs.createReadStream(__dirname+'/data/storm_data.csv');
        instream.pipe(storm_data_parser).on('data', rec=>{
            clean_storm_data(rec);
            recs.push(rec);
            if(recs.length > 10000) {
                instream.pause();
                console.log("inserting");
                collection.insertMany(recs, function(err, result) {
                    if(err) throw err;
                    instream.resume();
                });
                recs = [];
            }

        }).on('end', ()=>{
            console.log("inserting the last batch");
            collection.insertMany(recs, function(err, result) {
                if(err) throw err;
                console.log("all done!");
                cb();
            });
        });
    });
}

function count_storm_data(cb) {
    let notFound = 0;
    console.debug("counting storm_data for each county");
    fs.createReadStream(__dirname+'/data/storm_data.csv').pipe(storm_data_parser)
    .on('data', rec=>{
        clean_storm_data(rec);

        let type = rec.event_type;
        let fips = rec.state_fips+'.'+rec.cz_fips;
        /* console.log(fips, data.counties[fips]); */

        if(!data.counties[fips]) {
            //probably mistaken data?
            //console.dir(rec);
            
            //cz_name === "000" statewide?
            console.log("not found("+notFound+"):"+fips, rec.cz_name, rec.state, rec.begin_date_time, rec.data_source);
            notFound++;
            return;
        }

        if(!data.counties[fips].storm_counts[type]) data.counties[fips].storm_counts[type] = 0;
        data.counties[fips].storm_counts[type]++;
        //console.log(fips, data.counties[fips])
    }).on('end', ()=>{
        console.log("done counting");

        //create histogram of storm counts
        for(let fip in data.counties) {
            let storm_counts = data.counties[fip].storm_counts;
            for(let storm in storm_counts) {
                let count = storm_counts[storm];
                if(!data.storm_histogram[storm]) data.storm_histogram[storm] = [];
                if(!data.storm_histogram[storm][count]) data.storm_histogram[storm][count] = 0;
                data.storm_histogram[storm][count]++;
            }
        }
       
        //console.log(JSON.stringify(data.counties["48.419"], null, 4));
        cb();
    });
}

function store_county(cb) {

    console.debug("storing county counts");
    let recs = [];
    for(let fips in data.counties) {
      let fips_rec = data.fips.find(rec=>(rec.statefips+"."+rec.countyfips == fips));
      if(!fips_rec) throw "no such fip:"+fips;
      recs.push(Object.assign(data.counties[fips], {
      fips,
      state: fips_rec.state,
      stabb: fips_rec.stabb,
      county: fips_rec.county,
      }));
    }

    //add fullname for state abbs
    const collection = db.collection('county');
    collection.remove({}, function(err, results) {
        collection.insertMany(recs, function(err, result) {
            //console.log(result);
            cb(err);
        });
    });
}

function store_storm_histogram(cb) {

    console.debug("storing storm histogram");
    let recs = [];
    for(let storm in data.storm_histogram) {
        recs.push({storm, histogram: data.storm_histogram[storm]});
    }
    //console.dir(recs);

    //add fullname for state abbs
    const collection = db.collection('storm_histogram');
    collection.remove({}, function(err, results) {
        collection.insertMany(recs, function(err, result) {
            cb(err);
        });
    });
}

/*
function load_noaa(cb) {
    console.debug("loading noaa csv to mongo");
    const collection = db.collection('noaa');
    let recs = [];
    collection.remove({}, function(err, results) {
        let instream = fs.createReadStream('/mnt/scratch/hayashis/apred/Noaa.csv');
        instream.pipe(csvParser({
            mapHeaders({header, index}) {
                return header.toLowerCase();
            },
            mapValues({header, index, value}) {
                if(header.match("_date_time$")) return new Date(value);
                let i = parseInt(value);
                let f = parseFloat(value);
                if(i == value) return i;
                if(f == value) return f;
                return value;
            },
        })).on('data', rec=>{

            //redundant
            delete rec.begin_yearmonth;
            delete rec.begin_day;
            delete rec.begin_time;
            delete rec.end_yearmonth;
            delete rec.end_day;
            delete rec.end_time;

            console.log(rec.begin_date_time, rec.event_type);
            recs.push(rec);

            if(recs.length > 10000) {
                instream.pause();
                console.log("inserting");
                collection.insertMany(recs, function(err, result) {
                    if(err) throw err;
                    instream.resume();
                });
                recs = [];
            }

        }).on('end', ()=>{
            console.log("inserting the last batch");
            collection.insertMany(recs, function(err, result) {
                if(err) throw err;
                console.log("all done!");
                cb();
            });
        });
    });
}
*/

//const cutter_base = ++"INFODER Data Aquarium/Projects/Cutter Implementation";

function load_cutter_sources(cb) {
    console.debug("loading cutter sources");
    fs.createReadStream(__dirname+'/data/INFODER Data Aquarium/Projects/Cutter Implementation/Production Files/source_export.csv').pipe(csvParser({
        mapHeaders({header, index}) {
            return header.toLowerCase();
        },
    })).on('data', async rec=>{
        let indicator = Object.values(data.cutter.indicators).find(i=>i.id == rec.indicator);
        if(!indicator.sources) indicator.sources = [];
        indicator.sources.push({id: rec.id, name: rec.name});
    }).on('end', ()=>{
        console.log(JSON.stringify(data.cutter.indicators, null, 4));
        fs.writeFileSync("cutter_indicators.json", JSON.stringify(data.cutter.indicators, null, 4));
        cb();
    });
}

function load_cutter_combined(cb) {
    console.debug("loading cutter combined");
    fs.createReadStream(__dirname+'/data/INFODER Data Aquarium/Projects/Cutter Implementation/Production Files/measure_export.csv').pipe(csvParser({
        mapHeaders({header, index}) {
            return header.toLowerCase();
        },
    })).on('data', rec=>{
        let input_fip = rec.fips; //6029 > 06.029
        if(input_fip.length == 4) input_fip = "0"+input_fip;
        let state_fips = input_fip.substring(0,2);
        let county_fips = input_fip.substring(2,5);
        let fips = state_fips+'.'+county_fips;
        //data.cutter.combined.push({fips, measure: rec.measure, source: rec.source});
        
        //if(!data.counties[fips]) data.counties[fips] = {};
        //if(!data.counties[fips].cutter_measures) data.counties[fips].cutter_measures = [];

        //find source to set the measure
        /*
        for(let indicator in data.counties[fips].cutter.indicators) {
            data.counties[fips].cutter.indicators[indicator].sources.forEach(source=>{
                if(source.id == rec.source) {
                    source.value = parseFloat(rec.value);
                }
            });
        }
        */
        if(!data.counties[fips]) {
            console.log("failed to find:"+fips);
            console.dir(rec);
            return;
        }
        data.counties[fips].cutter_measures.push({source: rec.source, value: parseFloat(rec.value), date: rec.date});
    }).on('end', ()=>{
        //console.log(JSON.stringify(data.counties["48.419"], null, 4));
        cb();
    });
}

/*
const insertDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('noaa');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}
*/

function load_eda2018(cb) {
    let recs = [];
    let recs_state = [];
    fs.createReadStream(__dirname+'/data/EDA_Disaster_Supplemental_2018.csv').pipe(csvParser({
        headers: [ 
            "file","eda_regional_office","fain","grantee_name","grantee_city","grantee_state","project_state","grant_purpose","grant_award_date","award","total_project_funding","footnote","statewide"
        ],
        mapValues({header, index, value}) {
            if(header.match("_date")) return new Date(value);
            let i = parseInt(value);
            let f = parseFloat(value);
            if(i == value) return i;
            if(f == value) return f;
            return value;
        },
    })).on('data', rec=>{
        delete rec.file;
        delete rec.footnote;

        if(rec.statewide) {
            //lookup stat fip
            let fips_rec = data.fips.find(frec=>(frec.state == rec.project_state));
            if(!fips_rec) {
                console.error("project_state:"+rec.project_state+" not found in fips");
                console.dir(rec);
                return;
            }
            rec.statefips = fips_rec.statefips;
            recs_state.push(rec);
        } else {
            //lookup edaid
            let eda = data.edaid.find(eid=>(eid.eda_id == rec.fain));
            if(!eda) throw "edaid recrod not found "+JSON.stringify(rec);

            //lookup fips
            let fips_rec = data.fips.find(frec=>(frec.county == eda.county && frec.stabb == eda.stateabb));
            if(!fips_rec) {
                console.error("fips record not found "+JSON.stringify(eda)+" going to skip this");
                console.dir(rec);
                return;
            }

            rec.statefips = fips_rec.statefips;
            rec.countyfips = fips_rec.countyfips;
            recs.push(rec);
        }
    }).on('end', ()=>{
        console.log("done loading csv - now geocoding");

        let places = recs.map(rec=>{
            return rec.grantee_name+", "+rec.grantee_city+", "+rec.grantee_state;
        });
	    geocoder.batchGeocode(places, function(err, res) {
            if(err) throw err;
            for(let i = 0;i < places.length; ++i) {
                if(res[i].error) {
                    console.error("failed to geocode", places[i]);
                    continue;
                }
                //console.dir(res[i].value);
                let info = res[i].value[0];
                console.dir(info);
                recs[i].lat = info.latitude;
                recs[i].lon = info.longitude;
            }

            const collection = db.collection('eda2018');
            collection.remove({}, function(err, results) {
                collection.insertMany(recs, function(err, result) {
                    if(err) throw err;
                    cb();
                });
            });
        });

        let places_state = recs_state.map(rec=>{
            return rec.grantee_name+", "+rec.grantee_city+", "+rec.grantee_state;
        });
	    geocoder.batchGeocode(places_state, function(err, res) {
            if(err) throw err;
            for(let i = 0;i < places_state.length; ++i) {
                if(res[i].error) {
                    console.error("failed to geocode", places[i]);
                    continue;
                }
                let info = res[i].value[0];
                console.dir(info);
                recs_state[i].lat = info.latitude;
                recs_state[i].lon = info.longitude;
            }

            const collection_state = db.collection('eda2018_state');
            collection_state.remove({}, function(err, results) {
                collection_state.insertMany(recs_state, function(err, result) {
                    if(err) throw err;
                    //console.log(result);
                    cb();
                });
            });
        });

    });
}

function load_covid19states(cb) {
    axios.get("https://raw.githubusercontent.com/mapbox/mapboxgl-jupyter/master/examples/data/us-states.geojson").then(res=>{
        console.debug("loading covid19states csv");
        let geojson = res.data;

        let csv = fs.readFileSync(__dirname+'/data/covid19states.csv', "ascii").split("\n");
        csv.forEach(line=>{
            if(line == "") return;
            let cols = [];
            let buf = "";
            for(let i = 0;i < line.length; ++i) {
                if(line[i] == ",") {
                    cols.push(buf);
                    buf = "";
                } else {
                    if(line[i] == "\"") {
                        i++;
                        while(line[i] != "\"") {
                            buf = buf + line[i];
                            i++;
                        }
                    } else {
                        buf = buf + line[i];
                    }
                }
            }

            let state = cols[0];

            //search features
            let feature = geojson.features.find(feature=>{
                if(state.includes(feature.properties.name)) return true;
            });
            /*
            [ 'State',
              'Emergency Declaration',
              'National Guard Activation',
              'State Employee Travel Restrictions',
              'Statewide Limits on Gatherings',
              'Statewide School Closures',
              'Statewide Closure of Nonb\u0000\u0010Essential Businesses (could indicate specifics',
              'Statewide Curfew',
              '1135 Waiver Status' ]
            */

            if(feature) {
                feature.properties.emergency_declaration  = (cols[1]=="Yes");
                feature.properties.national_guard_activation = (cols[2]=="Yes");
                feature.properties.state_employee_travel_restrictions = (cols[3]=="Yes");
                feature.properties.statewide_limits_on_gatherings = cols[4];
                feature.properties.statewide_closure_scrhool = cols[5]; ///Yes or Local
                feature.properties.statewide_closure_nonessential = cols[6];
                feature.properties.statewide_curfew = cols[7]; //Yes or Local
                feature.properties.waiver1135 = cols[8];
                console.log(feature.properties);
            }
        });
        fs.writeFileSync(__dirname+"/data/covid19states.geojson", JSON.stringify(geojson, null, 4));
        console.log("done");
    });
}



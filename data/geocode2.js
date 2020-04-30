const request = require('request');
const token = "65b58b80d69cc9";
const async = require('async');
const fs = require('fs');

const dict = {}; //already geocoded 
const dict_lines = fs.readFileSync("eucities.csv", "ascii").split("\n");

const eucities_lines = fs.readFileSync("eucities.geocoded.csv", "ascii").split("\n");
eucities_lines.forEach(line=>{
    if(!line) return;
    let columns = line.split(',');
    let city1 = columns[0];
    let city2 = columns[1];
    let lat = columns[2];
    let lon = columns[3];

    if(!lat || !lon) return; //invalid

    city1 = city1.substring(1);
    city2 = city2.substring(1, city2.length-1);
    lat = lat.substring(1, lat.length-1);
    lon = lon.substring(1, lon.length-1);
    let city = city1+", "+city2;
    dict[city] = { lat, lon };
});

console.dir(dict);
process.exit(1);

function handle_next() {

    let city = eucities_lines.shift().trim();
    if(!city) {
        console.error("all done");
        return; 
    }
    
//async.eachLimit(eucities_lines, 1, (city, next_city)=>{
    if(dict[city]) {
        console.log('"'+city+'","'+dict[city].lat+'","'+dict[city].lon+'"');
        return handle_next();
    }

    request("https://locationiq.org/v1/search.php?key=65b58b80d69cc9&q="+escape(city)+"&format=json", 
        {json: true}, (err, res, body)=>{
        if(err) {
            console.error(city, err);
            return handle_next();
        }
        //console.dir(body);
        if(body.error) {
            console.error(city, body.error);
            return handle_next();
        }
        if(body.length == 0) {
            return next_city("no result:"+city);
        }
        dict[city] = body[0];
        //geocoded.push('"'+city+'","'+dict[city].lat+'","'+dict[city].lon+'"');
        eucities_lines.unshift(city);
        setTimeout(handle_next, 500); //2 qps for free
    });
}

handle_next();


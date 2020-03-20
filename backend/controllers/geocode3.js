const async = require('async');
const fs = require('fs');

const dict = {}; //already geocoded 
const dict_lines = fs.readFileSync("european_cities_us_standard.csv", "ascii").split("\n");

dict_lines.forEach(line=>{
    if(!line) return;
    let columns = line.split(',');
    let city = columns[0];
    let country = columns[1];
    let lat = parseFloat(columns[2].trim());
    let lon = parseFloat(columns[3].trim());
    dict[city+"/"+country] = { lat, lon };
});

//city-country,tweet count,users,virus tweets,virus tweet users,% of users talking about coronavirus
const eucities_lines = fs.readFileSync("covid19/2020-03-07/eu_city.csv", "ascii").split("\n");
eucities_lines.forEach(line=>{
    if(!line) return;
    let columns = line.split(',');
    let city = columns[0].substring(1).trim();
    let country = columns[1].substring(0, columns[1].length-1).trim();
    let tweet_count = columns[2];
    let users = columns[3];
    let virus_tweets = columns[4];
    let virus_tweet_users = columns[5];
    let virus_p = columns[6];

    let info = dict[city+"/"+country];

    if(info) {
        console.log("city,state_code,total,total_user,total_p,virus,user_virus,virus_p,virus_rel_p,user_virus_p");
        console.log([city, country, info]);
    }
});


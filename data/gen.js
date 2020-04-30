const fs = require('fs');
const geocodes = require("./geocode.json");

let lines = [];
lines.push("city,state_code,total,virus,virus_p");

let states = [];

geocodes.forEach(city=>{
    let total = parseInt(Math.random()*10000);
    let virus = parseInt(total*Math.random());
    let virus_p = (virus/total).toFixed(3);
    lines.push(city.city+","+city.state_code+","+total+","+virus+","+virus_p);
    
    //group by state
    if(!states[city.state_code]) states[city.state_code] = {total: 0, virus: 0};
    states[city.state_code].total += total;
    states[city.state_code].virus += virus;
});

fs.writeFileSync("covid19/2020-03-07/tweets_city.csv", lines.join("\n"));

let state_lines = [];
state_lines.push("state_code,total,virus,virus_p");
for(let state in states) {
    states[state].virus_p = states[state].virus / states[state].total;
    state_lines.push(state+","+states[state].total+","+states[state].virus+","+states[state].virus_p);
}

fs.writeFileSync("covid19/2020-03-07/tweets_state.csv", state_lines.join("\n"));

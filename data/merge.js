const fs = require('fs');
const async = require('async');

/*
  {
    "city": "Mount Croghan",
    "state_code": "SC",
    "zip": "29727",
    "latitude": "34.743895",
    "longitude": "-80.242791",
    "county": "Chesterfield"
  },
*/
let dict = require('./geocode.json');

//remove entry with no city/state_code
console.log(dict.length);
dict = dict.filter(rec=>rec.city && rec.state_code);
console.log(dict.length);

const coded = require('./new.json');
coded.forEach(res=>{
	if(res.error) return;
	let info = res.value[0];
	if(!info) return;
	//console.dir(res);
	let rec = {
		city: res.city,
		state_code: res.state_code,
		zip: info.zipcode,
		latitude: info.latitude,
		longitude: info.longitude,
		county: info.administrativeLevels.level2long,
		zip: info.zipcode,
	}
	console.dir(rec);
	dict.push(rec);
});

//dedupe 
let dict_uniq = [];
let dict_uniq_cs = [];
dict.forEach(rec=>{
	let key = rec.city+"/"+rec.state_code;
	if(dict_uniq_cs.includes(key)) return; //already found it
	dict_uniq_cs.push(key);
	dict_uniq.push(rec);
});

fs.writeFileSync("geocode.json", JSON.stringify(dict_uniq));



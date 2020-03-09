const fs = require('fs');
const NodeGeocoder = require('node-geocoder');
const async = require('async');

var geocoder = NodeGeocoder({
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyD0spiJcQwhDLJeXDhqjLCVyZV7se5uiDU', //only works in dev1
  formatter: null         // 'gpx', 'string', ...
});

/*
const codes = fs.readFileSync("cities_extended.csv", "ascii")
const lines = codes.split("\n");
const header = lines.shift();
const dict = [];
lines.forEach(line=>{
	let tokens = line.split(",").map(t=>t.trim());
	tokens = tokens.map(t=>t.substring(1, t.length-1));
	dict.push({
		city: tokens[0],
		state_code: tokens[1],
		zip: tokens[2],
		latitude: parseFloat(tokens[3]),
		longitude: parseFloat(tokens[4]),
		county: tokens[5],
	});
});
*/
const dict = require('./geocode.json');

const checks = fs.readFileSync("allcity.csv", "ascii");
const checklines = checks.split("\n");
const checklines_header = checklines.shift();
//console.log(dict[0]);
var count = 0;
let missing_cs = [];
async.eachSeries(checklines, (line, next_line)=>{
	let tokens = line.split(",").map(t=>t.trim());
	let city = tokens[2];
	let state = tokens[3];

	count++;
	//console.log(city, state, count, "of", checklines.length);

	//look for city / state
	let match = dict.find(d=>{
		if(d.city == city && d.state_code == state) return true;
		return false;
	});
	if(match) return next_line();

	missing_cs.push({city, state});
	next_line();
	
}, err=>{
	if(err) throw err;

	console.log("geocoding", missing_cs.length);
	console.dir(missing_cs);

	geocoder.batchGeocode(missing_cs.map(cs=>cs.city+", "+cs.state), function(err, res) {
		/*
		[ { formattedAddress: 'Abells Corners, WI 53121, USA',
		    latitude: 42.7261251,
		    longitude: -88.5426004,
		    extra:
		     { googlePlaceId: 'ChIJIeJP28XtBYgRzsthVZ9aLHo',
		       confidence: 0.5,
		       premise: null,
		       subpremise: null,
		       neighborhood: 'Abells Corners',
		       establishment: null },
		    administrativeLevels:
		     { level3long: 'Lafayette',
		       level3short: 'Lafayette',
		       level2long: 'Walworth County',
		       level2short: 'Walworth County',
		       level1long: 'Wisconsin',
		       level1short: 'WI' },
		    city: 'Abells Corners',
		    country: 'United States',
		    countryCode: 'US',
		    zipcode: '53121',
		    provider: 'google' } ]

		 */
		if(err) throw err;
		for(let i = 0;i < missing_cs.length; ++i) {
			res[i].city = missing_cs[i].city;
			res[i].state_code = missing_cs[i].state;
		}
		fs.writeFileSync("new.json", JSON.stringify(res));
	});
});


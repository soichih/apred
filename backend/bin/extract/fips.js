#!/usr/bin/env nodejs

const fs = require('fs');
const config = require('../../config');

//I lost the script that loaded this..
const fips = require('./fips.json');
fs.writeFileSync(config.pubdir+"/fips.json", JSON.stringify(fips));


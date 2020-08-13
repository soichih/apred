#!/usr/bin/env nodejs
const axios = require('axios')
const fs = require('fs');

//https://www.fema.gov/about/openfema/data-sets#public

//summary only contains number of project and total funded amount
//let url = "//www.fema.gov/api/open/v1/PublicAssistanceFundedProjectsSummaries.csv";

//around 11M
let url = "https://www.fema.gov/api/open/v1/HazardMitigationAssistanceProjects.csv";
axios({method: 'get', url, responseType: 'stream'}).then(res=>{
    res.data.pipe(fs.createWriteStream("../../../raw/HazardMitigationAssistanceProjects.csv"));
});

//WARNING... this is huge! around 1.7G!
url = "https://www.fema.gov/api/open/v1/IndividualsAndHouseholdsProgramValidRegistrations.csv";
axios({method: 'get', url, responseType: 'stream'}).then(res=>{
    res.data.pipe(fs.createWriteStream("../../../raw/IndividualsAndHouseholdsProgramValidRegistrations.csv"));
});

//around 28M
url = "https://www.fema.gov/api/open/v1/PublicAssistanceFundedProjectsDetails.csv";
axios({method: 'get', url, responseType: 'stream'}).then(res=>{
    res.data.pipe(fs.createWriteStream("../../../raw/PublicAssistanceFundedProjectsDetails.csv"));
});



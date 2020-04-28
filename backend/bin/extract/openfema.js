#!/usr/bin/env nodejs
const axios = require('axios')
const fs = require('fs');

//https://www.fema.gov/openfema-dataset-public-assistance-funded-projects-details-v1
let url = "https://www.fema.gov/api/open/v1/PublicAssistanceFundedProjectsDetails.csv";
axios({method: 'get', url, responseType: 'stream'}).then(res=>{
    res.data.pipe(fs.createWriteStream("../../../raw/PublicAssistanceFundedProjectsDetails.csv"));
    /*
    disasterNumber,declarationDate,incidentType,pwNumber,applicationTitle,applicantId,damageCategoryCode,dcc,damageCategory,projectSize,county,countyCode,state,stateCode,stateNumberCode,projectAmount,federalShareObligated,totalObligated,obligatedDate,hash,lastRefresh,id
    1239,1998-08-26T19:50:08.000Z,Severe Storm(s),35,Not Provided,463-99463-00,C - Roads and Bridges,C,Roads and Bridges,Small,Uvalde,463,Texas,TX,48,5322.68,3992.01,4193.21,1998-10-23T11:29:35.000Z,43e2970d712f048bafa5b0ee8850baf2,2020-01-10T02:34:41.169Z,5e17e2c1c3cdaf7453a4eda7
    1239,1998-08-26T19:50:08.000Z,Severe Storm(s),29,Not Provided,465-062A0-00,E - Public Buildings,E,Public Buildings,Small,Val Verde,465,Texas,TX,48,-16554,-12415.5,-12810.32,2000-05-10T20:51:59.000Z,568b6d6a1078569f7c534e46962d4ec0,2020-01-10T02:34:41.174Z,5e17e2c1c3cdaf7453a4eda8
    ...
    4482,2020-03-22T23:06:00.000Z,Biological,24,Expedited - 135861 - Mendocino County - NCS 30 Days,045-99045-00,B - Protective Measures,B,Protective Measures,Large,Mendocino,45,California,CA,6,150000,112500,112500,2020-04-26T00:39:00.000Z,c79795855342f50e76cf9d5fb42e1231,2020-04-26T16:43:12.777Z,5ea5ba20d7f69950eb5cef24
    4494,2020-03-28T02:10:00.000Z,Biological,1,136188'SEOC - PPE/Durable Medical Equipment & Supplies,000-UV5E7-00,B - Protective Measures,B,Protective Measures,Large,Statewide,0,Michigan,MI,26,166139755.5,124604816.63,124604816.63,2020-04-25T03:01:54.000Z,8c7e6b7a8e5b1ead21404f4676447f7b,2020-04-26T16:43:12.785Z,5ea5ba20d7f69950eb5cef25
    */
});

/*
//https://www.fema.gov/openfema-dataset-public-assistance-funded-projects-details-v1
let url = "https://www.fema.gov/api/open/v1/PublicAssistanceFundedProjectsDetails.json";
axios({method: 'get', url, responseType: 'stream'}).then(res=>{
    res.data.pipe(fs.createWriteStream("../../../raw/PublicAssistanceFundedProjectsDetails.json"));
    {
      "disasterNumber": 1283,
      "declarationDate": "1999-07-28T21:30:00.000Z",
      "incidentType": "Severe Storm(s)",
      "pwNumber": 110,
      "applicationTitle": "AGGREGATE ROAD WASHOUTS",
      "applicantId": "021-65776-00",
      "damageCategoryCode": "C - Roads and Bridges",
      "dcc": "C",
      "damageCategory": "Roads and Bridges",
      "projectSize": "Small",
      "county": "Cass",
      "countyCode": "21",
      "state": "Minnesota",
      "stateCode": "MN",
      "stateNumberCode": "27",
      "projectAmount": 5056,
      "federalShareObligated": 3792,
      "totalObligated": 3963.4,
      "obligatedDate": "1999-10-20T20:29:55.000Z",
      "hash": "f855cc6d47e00b97364b4af846293cce",
      "lastRefresh": "2020-01-10T02:34:58.278Z",
      "__v": 0,
      "id": "5e17e2d2c3cdaf7453a51913"
    }
});
*/

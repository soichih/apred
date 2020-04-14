# Analysis Platform for Risk, Resilience and Expenditure in Disasters (APRED) App

APRED will provide historical insights from the 2011 disaster data, 
as well as a predictive capability that will be used to improve future
funding decisions by local, state and federal agencies.

## Dataflow

### Raw Data Caching

All raw data is cached under /raw directory. The following scripts are used to load the cache

#### [StatsAmerica] County Demographics

`backend/bin/extract/statsamerica_demo.js` > raw/statsamerica.demo.json

```
{ geo_id: 13029, time_id: 2018, code_id: 317, data: 3653 },
{ geo_id: 13031, time_id: 2018, code_id: 317, data: 8175 },
{ geo_id: 13033, time_id: 2018, code_id: 317, data: 3299 },
...
```

#### [StatsAmerica] EDA 2018 Supplemental Data

`backend/bin/extract/statsamerica_eda2018.js` > raw/statsamerica.eda2018.json

```
{
  "4790726601": {
    "source_file": "2018DisasterSupp",
    "eda_regional_office": "Atlanta",
    "fain": "4790726601",
    "grantee_name": "Florida Department of Economic Opportunity",
    "grantee_city": "Tallahassee",
    "grantee_state": "Florida",
    "project_state": "Florida",
    "grant_purpose": "Technical Assistance Program",
    "grant_award_date": "2018-08-28T00:00:00.000Z",
    "award_amount": 52800,
    "total_project_funding": 66000,
    "statewide": 1,
    "counties": []
  },
...
  "4790715701": {
    "source_file": "2018DisasterSupp",
    "eda_regional_office": "Atlanta",
    "fain": "4790715701",
    "grantee_name": "Industrial Development Board of Daphne",
    "grantee_city": "Daphne",
    "grantee_state": "Alabama",
    "project_state": "Alabama",
    "grant_purpose": "Infrastructure",
    "grant_award_date": "2018-07-26T00:00:00.000Z",
    "award_amount": 1539502,
    "total_project_funding": 1539502,
    "statewide": 0,
    "counties": [
      {
        "county": "Baldwin",
        "stateadd": "AL"
      },
      {
        "county": " Mobile",
        "stateadd": "AL"
      },
      {
        "county": " Escambia",
        "stateadd": "AL"
      }
    ],
    "fema_id": "4349"
  }
}
```

Some fain doesn't have fema_id, and some counties are empty [].

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

#### [StatsAmerica] FEMA Disasters

`backend/bin/extract/statsamerica_fema_disasters.js`

> raw/statsamerica.disasters.2015-now.json

```
  {
    "disasterNumber": 1845,
    "ihProgramDeclared": 0,
    "iaProgramDeclared": 0,
    "paProgramDeclared": 1,
    "hmProgramDeclared": 1,
    "state": "AR",
    "statefips": "05",
    "declarationDate": "2009-06-16T18:26:00.000Z",
    "fyDeclared": "2009",
    "disasterType": "DR",
    "incidentType": "Severe Storm(s)",
    "title": "SEVERE STORMS, TORNADOES, AND FLOODING",
    "incidentBeginDate": "2009-04-27T00:00:00.000Z",
    "incidentEndDate": "2009-05-23T00:00:00.000Z",
    "disasterCloseOutDate": "2019-04-08T23:59:00.000Z",
    "declaredCountyArea": "Polk (County)",
    "placeCode": "99113",
    "countyfips": "113",
    "hash": "58bc7d3e007d9723d21751ddbde010cd",
    "latRefresh": "2019-07-26T18:09:18.283Z"
  },

```

#### NOAA Storms

`backend/bin/extract/statsamerica_noaa_storms.js`

> raw/statsamerica.noaa_storms_zones.2019-now.json
> raw/statsamerica.noaa_storms_counties.2019-now.json

```
{ BEGIN_YEARMONTH: 198408,
  BEGIN_DAY: 22,
  BEGIN_TIME: 1815,
  END_YEARMONTH: 198408,
  END_DAY: 22,
  END_TIME: 1815,
  EPISODE_ID: 0,
  EVENT_ID: 10144936,
  STATE: 'TEXAS',
  STATE_FIPS: 48,
  YEAR: 1984,
  MONTH_NAME: 'August',
  EVENT_TYPE: 'Thunderstorm Wind',
  CZ_TYPE: 'C',
  CZ_FIPS: 441,
  CZ_NAME: 'TAYLOR',
  WFO: 'MT',
  BEGIN_DATE_TIME: 1984-08-22T18:15:00.000Z,
  CZ_TIMEZONE: 'CST',
  END_DATE_TIME: 1984-08-22T18:15:00.000Z,
  INJURIES_DIRECT: 0,
  INJURIES_INDIRECT: 0,
  DEATHS_DIRECT: 0,
  DEATHS_INDIRECT: 0,
  DAMAGE_PROPERTY: '0.0',
  DAMAGE_CROPS: '0',
  SOURCE: '0',
  MAGNITUDE: '50.0',
  MAGNITUDE_TYPE: '0',
  FLOOD_CAUSE: '0',
  CATEGORY: '0',
  TOR_F_SCALE: '0',
  TOR_LENGTH: '0.0',
  TOR_WIDTH: '0',
  TOR_OTHER_WFO: '0',
  TOR_OTHER_CZ_STATE: '0',
  TOR_OTHER_CZ_FIPS: '0',
  TOR_OTHER_CZ_NAME: '0',
  BEGIN_RANGE: 0,
  BEGIN_AZIMUTH: '0',
  BEGIN_LOCATION: '0',
  END_RANGE: 0,
  END_AZIMUTH: '0',
  END_LOCATION: '0',
  BEGIN_LAT: 32.45,
  BEGIN_LON: -99.73,
  END_LAT: 0,
  END_LON: 0,
  EPISODE_NARRATIVE: '0',
  EVENT_NARRATIVE: '0',
  DATA_SOURCE: 'PUB' }

```

'use strict';

exports.express = {
    port: 12701,
}

exports.mongo = {
    url: 'mongodb://localhost:27017',
}

exports.google_api = {
    key: 'AIzaSyD0spiJcQwhDLJeXDhqjLCVyZV7se5uiDU', //only works in dev1
}

exports.cutter_sources = {
    "SOC": {
        "id": "1",
        "name": "Social Resilience",
        "sources": [
            {
                "id": "11",
                "name": "Educational Equity"
            },
            {
                "id": "12",
                "name": "Age"
            },
            {
                "id": "13",
                "name": "Transportation Access"
            },
            {
                "id": "14",
                "name": "Communication Capacity"
            },
            {
                "id": "15",
                "name": "Language Capacity"
            },
            {
                "id": "16",
                "name": "Special Needs"
            },
            {
                "id": "17",
                "name": "Health Coverage"
            }
        ]
    },
    "ECON": {
        "id": "2",
        "name": "Economic Resilience",
        "sources": [
            {
                "id": "21",
                "name": "Housing Capital"
            },
            {
                "id": "22",
                "name": "Employment"
            },
            {
                "id": "23",
                "name": "Income and Equality (GINI Coeffecient)"
            },
            {
                "id": "24",
                "name": "Single Sector Employment Dependence"
            },
            {
                "id": "25",
                "name": "Employment (Female)"
            },
            {
                "id": "26",
                "name": "Business Size"
            },
            {
                "id": "27",
                "name": "Health Access"
            }
        ]
    },
    "INST": {
        "id": "3",
        "name": "Institutional Resilience",
        "sources": [
            {
                "id": "31",
                "name": "Mitigation - Hazard Mitigation Plan Coverage"
            },
            {
                "id": "32",
                "name": "Flood Coverage"
            },
            {
                "id": "33",
                "name": "Municipal Services"
            },
            {
                "id": "34",
                "name": "Mitigation - CRS Flood"
            },
            {
                "id": "35",
                "name": "Political Fragmentation"
            },
            {
                "id": "36",
                "name": "Previous Disaster Experience"
            },
            {
                "id": "37",
                "name": "Mitigation and Social Connectivity"
            },
            {
                "id": "38",
                "name": "Mitigation - Storm Ready Communities"
            }
        ]
    },
    "IHFR": {
        "id": "4",
        "name": "Infrastructure Resilience",
        "sources": [
            {
                "id": "41",
                "name": "Housing Type"
            },
            {
                "id": "42",
                "name": "Shelter Capacity"
            },
            {
                "id": "43",
                "name": "Medical Capacity"
            },
            {
                "id": "44",
                "name": "Access/Evacuation Potential"
            },
            {
                "id": "45",
                "name": "Housing Age"
            },
            {
                "id": "46",
                "name": "Sheltering Need"
            },
            {
                "id": "47",
                "name": "Recovery (Schools)"
            }
        ]
    },
    "COMM": {
        "id": "5",
        "name": "Community Capital",
        "sources": [
            {
                "id": "51",
                "name": "Place Attachment - Migration"
            },
            {
                "id": "52",
                "name": "Place Attachment - Born"
            },
            {
                "id": "53",
                "name": "Political Engagement"
            },
            {
                "id": "54",
                "name": "Social Capital - Religion"
            },
            {
                "id": "55",
                "name": "Social Capital - Civic Involvement"
            },
            {
                "id": "56",
                "name": "Social Capital - Advocacy"
            },
            {
                "id": "57",
                "name": "Innovation"
            }
        ]
    },
    "FLOR": {
        "id": "100",
        "name": "Special/Custom",
        "sources": [
            {
                "id": "101",
                "name": "Business Vulnerability"
            },
            {
                "id": "102",
                "name": "Flood Zone"
            },
            {
                "id": "103",
                "name": "Commuting"
            },
            {
                "id": "104",
                "name": "Housing Construction"
            },
            {
                "id": "105",
                "name": "Second Stage Businesses"
            },
            {
                "id": "106",
                "name": "Households with Broadband Access"
            }
        ]
    }
}


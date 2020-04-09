<template>
<div>
    <ctilbanner/>
    <div id="covid19map"/>
    <h3>Number of twitter users who tweeted (size) and percentage of users who tweeted about virus (color) in the last 35 days.</h3>
    <div class="legend">
        <div class="legend-color"/>
        <span class="tick">0%</span>     
        <span class="tick" style="float: right;">7%</span>     
    </div>
    <el-select v-model="block" class="block-selecter">
        <el-option v-for="block in blocks" :key="block" :label="block" :value="block"/>
    </el-select>
    <div class="info" v-if="info">
        <p>{{info.city}} {{info.state_code}} {{info.country_code}}</p>
        <pre>{{info}}</pre>
    </div>
</div>
</template>

<script>
// @ is an alias to /src
import ctilbanner from '@/components/CTILBanner.vue';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

import stateData from '@/assets/stateData.json';

const abbsSrc = `Alabama	AL
Alaska	AK
Arizona	AZ
Arkansas	AR
California	CA
Colorado	CO
Connecticut	CT
Delaware	DE
Florida	FL
Georgia	GA
Hawaii	HI
Idaho	ID
Illinois	IL
Indiana	IN
Iowa	IA
Kansas	KS
Kentucky	KY
Louisiana	LA
Maine	ME
Maryland	MD
Massachusetts	MA
Michigan	MI
Minnesota	MN
Mississippi	MS
Missouri	MO
Montana	MT
Nebraska	NE
Nevada	NV
New Hampshire	NH
New Jersey	NJ
New Mexico	NM
New York	NY
North Carolina	NC
North Dakota	ND
Ohio	OH
Oklahoma	OK
Oregon	OR
Pennsylvania	PA
Rhode Island	RI
South Carolina	SC
South Dakota	SD
Tennessee	TN
Texas	TX
Utah	UT
Vermont	VT
Virginia	VA
Washington	WA
West Virginia	WV
Wisconsin	WI
Wyoming	WY
District of Columbia	DC
Marshall Islands	MH
Armed Forces Africa	AE
Armed Forces Americas	AA
Armed Forces Canada	AE
Armed Forces Europe	AE
Armed Forces Middle East	AE
Armed Forces Pacific	AP
AMERICAN SAMOA	AS
GUAM	GU
Puerto Rico	PR
Virgin Islands	VI
Northern Marianas	MP`;

const abbsLines = abbsSrc.split("\n");
const abbs = {};
abbsLines.forEach(line=>{
    const cols = line.split("\t");
    abbs[cols[1].trim()] = cols[0].trim();
});

export default {
    name: 'Covid19',
    components: { ctilbanner },

    data() { return {
        //tweetsStates: null,
        blocks: [
            "2020-03-07",
        ],
        block: "2020-03-07",
        map: null,
        info: null,

        cities: {}, //cities geojson for each blocks
    }},

    mounted() {

        this.map = new mapboxgl.Map({
            container: 'covid19map', // HTML container id
            style: 'mapbox://styles/mapbox/dark-v10', // style URL
            //style: 'mapbox://styles/mapbox/streets-v11',
            //center: [-98.35, 39.5], // starting position as [lng, lat]
            center: [-40, 34.7], // starting position as [lng, lat]
            minZoom: 2,
            //pitch: 30, // pitch in degrees
            //bearing: -10, // bearing in degrees
            zoom: 2,
        });

        //const zoomThreshold = 4;

        this.map.on('load', ()=>{

            this.updateData(); //set to initial block

            this.map.on('mousemove', 'tweets.layer', (e)=> {
                this.map.getCanvas().style.cursor = 'pointer';
                this.info = e.features[0].properties;
            });

            this.map.on('mouseleave', 'tweets.layer', ()=>{
                this.info = null;
            });
        });
    },

    watch: {
        block() {
            this.updateData();
            this.map.getSource('states').setData(stateData);
        }
    },

    methods: {
        updateData() {
            const source = this.map.getSource("tweets");
            if(source) {
                //TODO - switch to it..
            } else {
                //not yet loaded.. load now
                //console.log("loading cities source");
                this.map.addSource("tweets", {
                    type: "geojson",
                    data: "https://dev1.soichi.us/api/apred/covid19/tweets/cities/"+this.block
                });
                this.map.addLayer({
                    "id": "tweets.layer",
                    "source": "tweets",
                    //'minzoom': 6,
                    "type": "circle",
                    "paint": {
                        //"circle-radius": 10,
                        'circle-radius': {
                            //'base': 1.75,
                            property: 'total_user', 
                            /*
                            stops: [
                                [0, 3],
                                [800000, 30],
                            ]
                            */
                            /*
                            stops:[
                                [{zoom: 4, value: 0}, 0],
                                [{zoom: 4, value: 800000}, 12],
                                [{zoom: 8, value: 0}, 0],
                                [{zoom: 8, value: 800000}, 24],
                                [{zoom: 12, value: 0}, 0],
                                [{zoom: 12, value: 800000}, 48]
                            ]
                            */
                            stops:[
                                [{zoom: 4, value: 0}, 1],
                                [{zoom: 4, value: 8000}, 12],
                                [{zoom: 8, value: 0}, 2],
                                [{zoom: 8, value: 8000}, 24],
                                [{zoom: 12, value: 0}, 4],
                                [{zoom: 12, value: 8000}, 48]
                            ]
                        },
                        'circle-color': {
                            property: 'user_virus_p', 
                            stops: [
                                [0, '#48f'],
                                [3.5, '#fc4'],
                                [7, '#f44'],
                            ]
                        },
                        "circle-opacity": 0.9,
                        "circle-stroke-width": 0,
                    },
                    //"filter": ["==", "modelId", 1],
                });

            }
        }
    }
}
</script>

<style scoped>
#covid19map {
    position: fixed;
    top: 80px;
    bottom: 0;
    width: 100%;
}
h3 {
    position: fixed;
    top: 80px;
    left: 30px;
    color: #fffa;
    font-size: 11pt;
}
.block-selecter {
    top: 20px;
    padding: 20px;
    float: right;
}
.info {
    display: inline-block;
    position: fixed;
    top: 200px;
    font-size: 85%;
    background-color: #fff9;
    padding: 10px;
    color: white;
}
.legend {
    position: fixed;
    top: 120px;
    left: 20px;
    width: 200px;
    background-color: #fff3;
    padding: 10px;
}
.legend .tick {
    font-size: 80%;
    color: white;
}
.legend .legend-color {
    background-image: linear-gradient(to right, #48f, #fc4, #f44); 
    height: 20px;
    width: 100%;
    margin-bottom: 5px;
}
</style>

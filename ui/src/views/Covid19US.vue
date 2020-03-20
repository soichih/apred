<template>
<div>
    <div id="covid19map"/>
    <h3>From https://www.nga.org/coronavirus/</h3>
    <div class="legend">
        <div class="legend-color"/>
        <span class="tick">0%</span>     
        <span class="tick" style="float: right;">15%</span>     
    </div>
    <div class="info" v-if="info">
        <p>{{info.city}} {{info.state_code}} {{info.country_code}}</p>
        <pre>{{info}}</pre>
    </div>
</div>
</template>

<script>
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
    components: {},

    data() { return {
        //tweetsStates: null,
        blocks: [
            "2020-03-07",
        ],
        block: "2020-03-07",
        map: null,
        info: null,
        popup: null,

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

        this.popup = new mapboxgl.Popup({
            closeButton: false,
            offset: [0, -20],
        });

        //const zoomThreshold = 4;

        this.map.on('load', ()=>{

            this.updateData(); //set to initial block

            this.map.on('mousemove', 'main.layer', (e)=> {
                // Change the cursor style as a UI indicator.
                this.map.getCanvas().style.cursor = 'pointer';
                
                // Display a popup with the name of the county
                this.popup
                    .setLngLat(e.lngLat)
                    .setText(JSON.stringify(e.features[0].properties, null, 4))
                    .addTo(this.map);
            });

            this.map.on('mouseleave', 'main.layer', ()=>{
                this.popup.remove();
             });
        });
    },

    watch: {
        block() {
            //console.log("block updated");
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
                this.map.addSource("states", {
                    type: "geojson",
                    data: "https://raw.githubusercontent.com/soichih/apred/master/data/covid19states.geojson",
                });

                this.map.loadImage('https://www.nationalguard.mil/portals/31/Images/Image%20Gallery/Graphics/ARNG-small.png', (err, image)=>{
                    if(err) throw err;
                    this.map.addImage('soldier', image);
                    this.map.addLayer({
                        'id': 'points',
                        'type': 'symbol',
                        'source': 'states',
                        'filter': ['==', 'national_guard_activation', true],
                        'layout': {
                            'icon-image': 'soldier',
                            'icon-size': 0.1,
                        }
                    });
                });

                this.map.addLayer({
                    'id': 'main.layer',
                    'source': 'states',
                    'type': 'fill',
                });

                this.map.addLayer({
                    'id': 'state_employee_travel_restrictions',
                    'source': 'states',
                    'type': 'fill',
                    'filter': ['==', 'state_employee_travel_restrictions', true],
                    'paint': {
                        'fill-color': '#0f0',
                        'fill-opacity': 0.5,
                    }
                });

                this.map.addLayer({
                    'id': 'statewide_closure_scrhool_state',
                    'source': 'states',
                    'type': 'fill',
                    'filter': ['==', 'statewide_closure_scrhool', 'Yes'],
                    'paint': {
                        'fill-color': '#00f',
                        'fill-opacity': 0.8,
                    }
                });

                this.map.addLayer({
                    'id': 'statewide_closure_scrhool_local',
                    'source': 'states',
                    'type': 'fill',
                    'filter': ['==', 'statewide_closure_scrhool', 'Local'],
                    'paint': {
                        'fill-color': '#00f',
                        'fill-opacity': 0.5,
                    }
                });

                this.map.addLayer({
                    'id': 'statewide_limits_on_gatherings',
                    'source': 'states',
                    'type': 'fill',
                    'filter': ['!=', 'statewide_limits_on_gatherings', ''],
                    'paint': {
                        'fill-color': '#f0f',
                        'fill-opacity': 0.5,
                    }
                });

                this.map.addLayer({
                    'id': 'statewide_closure_nonessential',
                    'source': 'states',
                    'type': 'fill',
                    'filter': ['!=', 'statewide_closure_nonessential', ''],
                    'paint': {
                        'fill-color': '#0cf',
                        'fill-opacity': 0.5,
                    }
                });

                this.map.addLayer({
                    'id': 'statewide_curfew',
                    'source': 'states',
                    'type': 'fill',
                    'filter': ['!=', 'statewide_curfew', ''],
                    'paint': {
                        'fill-color': '#c0f',
                        'fill-opacity': 0.5,
                    }
                });



            }
        }
    }
}
</script>

<style scoped>
#covid19map {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 10;
}
h3 {
    position: fixed;
    left: 20px;
    color: #fffa;
    font-size: 11pt;
}
.block-selecter {
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
    top: 100px;
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

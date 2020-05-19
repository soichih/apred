<template>
<div>
    <TopMenu/>
    <div>
        <div style="position: relative;">
            <div class="page">
                <h2 style="margin-bottom: 0px">FEMA Disaster&nbsp;Declarations
                    <span style="opacity: 0.8; font-size: 70%; font-weight: normal; text-transform: none;">between 2017 - <time v-if="updatedDate">{{new Date(updatedDate).toLocaleDateString()}}</time></span>
                </h2>
                <div class="legend">
                    <div v-for="(info, layer) in layers" :key="layer" class="legend-item" :class="{hidden: hiddenLayers.includes(layer)}" @click.stop="toggleLayer(layer)" style="clear: both;" :title="info.title">
                        <input type="checkbox" :checked="!hiddenLayers.includes(layer)" style="float: right;"/>
                        <span class="legend-color" :style="{backgroundColor: info.color}">&nbsp;</span>&nbsp;{{layer}}
                    </div>
                    <!--
                    <span class="legend-eda"/> EDA Award ($)
                    -->
                </div>
                <div class="county-selecter" style="width: 230px">
                    <CountySelecter style="width: 230px" @selected="countySelected" :options="countyList"/>
                </div>
            </div>

            <div id="map"/>
            <footer>
                <div class="page">
                    <p style="line-height: 200%; margin-top: 5px;">
                        This platform brings data science to decision-makers dealing with the economics of 
                        disaster mitigation, analysis, and recovery activities.
                        Made by <b>CTIL Crisis Technologies Innovation Lab</b> at Indiana University
                    </p>
                </div>
            </footer>
        </div>

        <CountyDetail v-if="selected && geojson" :detail="selected" :layers="layers" :geojson="geojson"/>
    </div>
    <div class="tutorial">
        <div class="tutorial-text tutorial-text-legend" @click="showTutorial('selecter')">
            <i class="el-icon-top-left" style="float: left; font-size: 150%;"></i>
            <p style="margin: 0 0 0 40px;">
                Welcome to APRED! Just a few notes about our platform.<br> 
                Here, you can select the disaster types to show on the map.
                <br>
                <br>
                <el-button type="primary" size="small">Next</el-button>
            </p>
        </div> 
        <div class="tutorial-text tutorial-text-selecter" @click="showTutorial()">
            <i class="el-icon-top-right" style="float: right; font-size: 150%;"></i>
            <p style="margin: 0 40px 0 0 0;">
                Search and select a county here, or you can click a county on the map to show details.
                <br>
                <br>
                <el-button type="primary" size="small">Start!</el-button>
            </p>
        </div> 
    </div>
</div>
</template>

<script>

import { Component, Vue, Watch } from 'vue-property-decorator'

import CountySelecter from '@/components/CountySelecter.vue'
import TopMenu from '@/components/TopMenu.vue'
import CountyDetail from '@/components/CountyDetail.vue'

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1Ijoic29pY2hpaCIsImEiOiJjazVqdnBsM2cwN242M2psdjAwZXhhaTFuIn0.o3koWlzx1Tup8CJ1B_KaEA";

@Component({
    components: { CountySelecter, TopMenu, CountyDetail },
})
export default class Disaster extends Vue {

    popup;
    selected = null;
    geojson = null;

    hiddenLayers = [];
    countyList = [];

    updatedDate = null;
    //tutorial = false;

    layers = {
        "biological": {
            color: "#396",
            opacity: 0.5,
            filter: ["any", 
                ["==", "isBiological", true],
            ],
            statefilter: ["any", 
                ["==", "isStateBiological", true],
            ]
        },
        "other": {
            title: "EarthQuake, Coastal Storm, Snow, Mud/Landslide, Volcane, Dam/Levee Break, Severe Ice Storm",
            color: "#999",
            filter: ["any", 
                ["==", "isEarthquake", true],
                ["==", "isCoastalStorm", true],
                ["==", "isSnow", true],
                ["==", "isMudLandslide", true],
                ["==", "isVolcano", true],
                ["==", "isDamLeveeBreak", true],
                ["==", "isSevereIceStorm", true],
            ],
            statefilter: ["any", 
                ["==", "isStateEarthquake", true],
                ["==", "isStateCoastalStorm", true],
                ["==", "isStateSnow", true],
                ["==", "isStateMudLandslide", true],
                ["==", "isStateVolcano", true],
                ["==", "isStateDamLeveeBreak", true],
                ["==", "isStateSevereIceStorm", true],
            ]
        }, 

        "hurricane": {
            color: "#0af", 
            filter: ["any", 
                ["==", "isHurricane", true],
            ],
            statefilter: ["any", 
                ["==", "isStateHurricane", true],
            ]
        },
        "tornado": {
            color: "#f6f", 
            filter: ["any", 
                ["==", "isTornado", true],
            ],
            statefilter: ["any", 
                ["==", "isStateTornado", true],
            ]
        },
        "severe storm": { 
            color: "#fa0", 
            filter: ["any", 
                ["==", "isSevereStorm", true],
            ],
            statefilter: ["any", 
                ["==", "isStateSevereStorm", true],
            ]
        },
        "flood": {
            color: "#06f",
            filter: ["any", 
                ["==", "isFlood", true],
            ],
            statefilter: ["any", 
                ["==", "isStateFlood", true],
            ]
        },
        "fire": {
            color: "#f00", 
            filter: ["any", 
                ["==", "isFire", true],
            ],
            statefilter: ["any", 
                ["==", "isStateFire", true],
            ]
        },
    };

    @Watch('$route')
    onRouteChange(to, from) {
        this.loadCounty(this.$route.params.fips);
    }
    
    created() {
        const h = window.localStorage.getItem("hiddenLayers");
        if(h) {
            this.hiddenLayers = JSON.parse(h);
        }
    }

    mounted() {
        this.loadCounty(this.$route.params.fips);

        this.map = new mapboxgl.Map({
            container: 'map', // HTML container id
            style: 'mapbox://styles/mapbox/light-v10', // style URL
            center: [-110, 41.5], // starting position as [lng, lat]
            minZoom: 2,
            pitch: 30, // pitch in degrees
            //bearing: 10, // bearing in degrees
            zoom: 3,
        });

        // disable map zoom when using scroll
        //this.map.scrollZoom.disable();

        // Add zoom and rotation controls to the map.
        this.map.addControl(new mapboxgl.NavigationControl());

        this.popup = new mapboxgl.Popup({
            closeButton: false,
            offset: [0, -20],
        });

        this.map.on('load', ()=>{
            //fetch("https://ctil.iu.edu/projects/apred-data/counties_geo.json").then(res=>res.json()).then(data=>{
            fetch("https://gpu1-pestillilab.psych.indiana.edu/apred/counties_geo.json").then(res=>{ 
                this.updatedDate = res.headers.get("last-modified")
                return res.json()
            }).then(data=>{
                this.geojson = data;
                data.features.forEach(feature=>{
                    const props = feature.properties;
                    if(props.countyfips) {
                        this.countyList.push({value: props.statefips+props.countyfips, label: props.county+", "+props.state});
                    }

                    if(props.award) {
                        props.awardStr = "$"+this.$options.filters.formatNumber(props.award/1000)+"k";
                    }
                });

                this.map.addSource('counties', { type: "geojson", data });
                this.map.addLayer({
                    "id": "counties",
                    "type": "fill",
                    "source": "counties",
                    "paint": {
                        //"fill-outline-color": "rgba(0,0,0.5,0.1)",
                        "fill-color": "rgba(0,0,0,0.1)"
                    }
                });

                for(const t in this.layers) {
                    const layer = this.layers[t];

                    this.map.addLayer({
                        id: 'county_disaster_'+t,
                        type: 'fill',
                        source: 'counties',
                        paint: {
                            'fill-color': layer.color,
                            'fill-opacity': (layer.opacity||1)*0.75
                        },
                        filter: layer.filter,
                        layout: {
                            visibility: this.hiddenLayers.includes(t)?'none':'visible',
                        }
                    });

                    this.map.addLayer({
                        'id': 'state_disaster_'+t,
                        'type': 'fill',
                        'source': 'counties',
                        'paint': {
                            'fill-color': layer.color,
                            'fill-opacity': (layer.opacity||1)*0.2,
                        },
                        'filter': layer.statefilter,
                        layout: {
                            visibility: this.hiddenLayers.includes(t)?'none':'visible',
                        }
                    });
                }

                /*
                this.map.addLayer({
                    'id': 'eda-circles-state',
                    'type': 'circle',
                    "source": "counties",
                    filter: ['==', 'eda2018', 'state'],    
                    'paint': {
                        'circle-stroke-color': 'rgba(0,0,0,0)',
                        'circle-stroke-width': 2,
                        //'circle-color': 'rgba(103,194,58,0.8)',
                        'circle-color': 'rgba(200,255,100,0.9)',
                        'circle-opacity': 0.75,
                        'circle-radius': {
                            base: 1.75,
                            property: 'award', 
                            stops:[
                                [{zoom: 4, value: 0}, 2],
                                [{zoom: 4, value: 10000000}, 20],
                                [{zoom: 8, value: 0}, 4],
                                [{zoom: 8, value: 10000000}, 40],
                                [{zoom: 12, value: 0}, 8],
                                [{zoom: 12, value: 10000000}, 60]
                
                            ]
                        },              
                    }
                });

                this.map.addLayer({
                    'id': 'eda-circles-county',
                    'type': 'circle',
                    "source": "counties",
                    filter: ['==', 'eda2018', 'county'],    
                    'paint': {
                        //'circle-stroke-color': 'rgba(103,194,58,0.8)',
                        'circle-stroke-color': 'rgba(200,255,100,0.9)',
                        'circle-stroke-width': 2,
                        'circle-color': 'rgba(0,0,0,0)',
                        'circle-opacity': 0.75,
                        'circle-radius': {
                            base: 1.75,
                            property: 'award', 
                            stops:[
                                [{zoom: 4, value: 0}, 2],
                                [{zoom: 4, value: 10000000}, 20],
                                [{zoom: 8, value: 0}, 4],
                                [{zoom: 8, value: 10000000}, 40],
                                [{zoom: 12, value: 0}, 8],
                                [{zoom: 12, value: 10000000}, 60]
                
                            ]
                        },              
                    }
                });
                */

                this.map.addLayer({
                    'id': 'eda-labels',
                    'type': 'symbol',
                    "source": "counties",
                    'minzoom': 4,
                    filter: ['any', 
                        ['==', 'eda2018', 'county'],    
                        ['==', 'eda2018', 'state'],    
                    ],
                    'layout': {
                        'text-field': 
                            ['get', 'awardStr'],
                        /*
                        'text-font': [
                            'Open Sans',
                            'Arial Unicode MS Bold'
                        ],
                        */
                        'text-size': [
                            "interpolate", 
                            [ "linear" ],
                            [ "zoom" ], 
                            2,
                            [ "interpolate", [ "linear" ], [ "get", "award" ], 500, 3, 5000, 6 ],
                            9,
                            [ "interpolate", [ "linear" ], [ "get", "award" ], 500, 10, 5000, 30 ]
                        ]
                    },
                    'paint': {
                        'text-color': 'rgba(0,0,0,1)'
                        //'text-color': 'rgba(255,255,255,1)'
                    }
                });
            });

            this.map.on('click', e=>{
                const features = this.map.queryRenderedFeatures(e.point, {
                    layers: ['counties']
                });
                if(features.length > 0) {
                    this.countySelected(features[0].properties.statefips+features[0].properties.countyfips);
                }
            });

            this.map.on('mousemove', 'counties', (e)=> {
                // Change the cursor style as a UI indicator.
                this.map.getCanvas().style.cursor = 'pointer';
                
                // Single out the first found feature.
                const feature = e.features[0];
                
                // Display a popup with the name of the county
                let text = feature.properties.county+", "+feature.properties.state;
                for(const key in feature.properties) {
                    if(key.startsWith("is")) {
                        text += " | "+key.substring(2);
                    }
                }

                this.popup.setLngLat(e.lngLat).setText(text).addTo(this.map);
            });

            this.map.on('mouseleave', 'counties', ()=>{
                this.popup.remove();
            });

            this.map.on('idle', ()=>{
                const tutorialPlayed = localStorage.getItem("tutorial-played");
                if(!tutorialPlayed && !this.selected && window.innerWidth > 800) {
                    localStorage.setItem("tutorial-played", new Date());

                    //need to reset display from default(none) to block for smooth animation initially
                    const tutorial = document.getElementsByClassName("tutorial")[0];
                    tutorial.style.display = "block";

                    this.$nextTick(()=>{
                        this.showTutorial('legend');
                    });
                }
            });
        })
    }

    showTutorial(page) {

        const tutorial = document.getElementsByClassName("tutorial")[0];

        //close previously opened tutorial
        let item = document.getElementsByClassName("tutorial-focus")[0];
        if(item) item.classList.remove("tutorial-focus");
        let text = document.getElementsByClassName("tutorial-text-show")[0];
        if(text) text.classList.remove("tutorial-text-show");

        switch(page) {
        case "legend":
            item = document.getElementsByClassName("legend")[0];
            text = document.getElementsByClassName("tutorial-text-legend")[0];
            text.style["top"] = (item.offsetTop + 240)+"px";
            text.style["left"] = (item.offsetLeft + 220)+"px";
            break;
        case "selecter":
            item = document.getElementsByClassName("county-selecter")[0];
            text = document.getElementsByClassName("tutorial-text-selecter")[0];
            text.style["top"] = (item.offsetTop + 100)+"px";
            text.style["left"] = (item.offsetLeft - 500)+"px";
            break;
        default:
            tutorial.classList.remove("tutorial-active");
            tutorial.style.opacity = "0";
            setTimeout(()=>{
                tutorial.style.display = "none";
            }, 1000);
            return;
        }

        //activate tutorial
        tutorial.classList.add("tutorial-active");
        item.classList.add("tutorial-focus");
        text.classList.add("tutorial-text-show");
    }

    loadCounty(fips) {
        if(!fips) {
            this.selected = null;
            return;
        }

        this.showTutorial(); //hiding tutorial

        //fetch("https://ctil.iu.edu/projects/apred-data/counties/county."+fips+".json").then(res=>res.json()).then(data=>{
        const loading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(255, 255, 255, 0.3)'
        });
        fetch("https://gpu1-pestillilab.psych.indiana.edu/apred/counties/county."+fips+".json").then(res=>res.json()).then(data=>{
            delete data.cutter.INST;
            delete data.cutter.FLOR;
            this.selected = data;
            loading.close();
        });
    }

    countySelected(fips) {
        this.$router.push('/county/'+fips);
    }

    toggleLayer(layer) {
        const pos = this.hiddenLayers.indexOf(layer);
        if(~pos) this.hiddenLayers.splice(pos, 1);
        else this.hiddenLayers.push(layer);
        this.map.setLayoutProperty('county_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');
        this.map.setLayoutProperty('state_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');

        window.localStorage.setItem("hiddenLayers", JSON.stringify(this.hiddenLayers));
    }
}
</script>
<style lang="scss" scoped> 
p {
    margin-top: 0px;
    line-height: 150%;
    color: #666;
}
h2 {
    font-size: 15pt;
    padding: 20px 0;
    color: #0006;
    text-transform: uppercase;
}

h3 {
    padding: 20px 0 0px 0;
    color: #0006;
    text-transform: uppercase;
}

h4 {
    opacity: 0.7;
}

#map {
    position: fixed;
    width: 100%;
    top: 110px;
    bottom: 75px;
}

.map-overlay {
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    position: absolute;
    width: 25%;
    top: 10px;
    left: 10px;
    padding: 10px;
    display: none;
}
.sub-heading {
    opacity: 0.8;
    font-weight: bold;
    font-size: 90%;
    color: black;
}
.primary {
    font-weight: bold;
    font-size: 175%;
    color: #409EFF;
}
.legend {
    background-color: #fff9;
    padding: 10px;
    text-transform: uppercase;
    font-size: 80%;
    border-radius: 5px;
    
    margin-top: 10px; 
    float: left; 
    z-index: 1; 
    position: relative; 
    width: 230px;

    .legend-color {
        display: inline-block;
        width: 10px;
        height: 10px;
    }

    .legend-eda {
        display: inline-block;
        width: 8px;
        height: 8px;   
        border-radius: 50%;
        border: 2px solid #67c23a;
    }

    .legend-item {
        width: 200px;
        height: 20px;
        margin-right: 10px;
        cursor: pointer;
        &.hidden {
            color: #999;
        }
    }
    
}
footer {
position: fixed;
bottom: 0;
width: 100%;
height: 75px;
max-height: 75px;
background-color: #333;
}
.county-selecter {
    margin-top: 10px; 
    float: right; 
    z-index: 1; 
    position: relative; 
}

@media (max-width: 600px) {
    .county-selecter {
        display: none;
    }
}
.tutorial {
    display: none;
    opacity: 0;
    position: fixed;
    background-color: #0009;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 2;
    transition: opacity 1s;

    &.tutorial-active {
        opacity: 1;
    }
    .tutorial-text {
        position: fixed;
        width: 500px;
        color: white;
        opacity: 0;
        transition: opacity 1s;
        font-size: 110%;
        p { 
            color: white;
        }

        &.tutorial-text-show {
            opacity: 1;
        }
    }
}

.tutorial-focus {
    position: relative;
    z-index: 3;
    transition: box-shadow 1s;
    box-shadow: 0 0 20px black;
}
</style>



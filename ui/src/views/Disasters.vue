<template>
<div>
    <TopMenu/>
    <div>
        <div style="position: relative;">
            <div class="page">
                <p class="secondary">FEMA delared disasters since 2017</p>
                <h2 style="margin-bottom: 0px">Disaster&nbsp;Declarations</h2>
                <p><i class="el-icon-caret-right"/> Select a county to show detail</p>

                <CountySelecter style="float: left; top: 15px; z-index: 1; width: 230px;" @selected="countySelected" :options="countyList"/>
                <div class="legend">
                    <div v-for="(info, layer) in layers" :key="layer" class="legend-item" :class="{hidden: hiddenLayers.includes(layer)}" @click.stop="toggleLayer(layer)" style="clear: both;">
                        <input type="checkbox" :checked="!hiddenLayers.includes(layer)" style="float: right;"/>
                        <span class="legend-color" :style="{backgroundColor: info.color}">&nbsp;</span>&nbsp;{{layer}}
                    </div>
                    <span class="legend-eda"/> EDA Award ($)
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
        /*
        "tornado": {
            color: "#c60", 
            filter: ["any", 
                ["==", "isTornado", true],
            ],
            statefilter: ["any", 
                ["==", "isStateTornado", true],
            ]
        },
        */
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
            fetch("https://gpu1-pestillilab.psych.indiana.edu/apred/counties_geo.json").then(res=>res.json()).then(data=>{
                this.geojson = data;
                data.features.forEach(feature=>{
                    const props = feature.properties;
                    if(props.countyfips) {
                        this.countyList.push({value: props.statefips+props.countyfips, label: props.county+", "+props.state});
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
                            'fill-opacity': (layer.opacity||1)*0.1,
                        },
                        'filter': layer.statefilter,
                        layout: {
                            visibility: this.hiddenLayers.includes(t)?'none':'visible',
                        }
                    });
                }

                this.map.addLayer({
                    'id': 'eda-circles-state',
                    'type': 'circle',
                    "source": "counties",
                    filter: ['==', 'eda2018', 'state'],    
                    'paint': {
                        'circle-stroke-color': 'rgba(0,0,0,0)',
                        'circle-stroke-width': 2,
                        'circle-color': 'rgba(103,194,58,0.8)',
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
                        'circle-stroke-color': 'rgba(103,194,58,0.8)',
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
                            ['get', 'award'],
                        'text-font': [
                            'Open Sans Bold',
                            'Arial Unicode MS Bold'
                        ],
                        'text-size': 11,
                    },
                    'paint': {
                        'text-color': 'rgba(0,0,0,1)'
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
        })
    }

    loadCounty(fips) {
        if(!fips) {
            this.selected = null;
            return;
        }

        //fetch("https://ctil.iu.edu/projects/apred-data/counties/county."+fips+".json").then(res=>res.json()).then(data=>{
        fetch("https://gpu1-pestillilab.psych.indiana.edu/apred/counties/county."+fips+".json").then(res=>res.json()).then(data=>{
            delete data.cutter.INST;
            delete data.cutter.FLOR;
            this.selected = data;
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
    top: 160px;
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
    position: absolute;
    display: block;
    z-index: 1;
    top: 180px;
    background-color: #fff9;
    padding: 10px;
    text-transform: uppercase;
    font-size: 80%;
    border-radius: 5px;

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
.secondary {
opacity: 0.4; 
float: right; 
margin-top: 25px;
}
@media (max-width: 800px) {
    .secondary {
        display: none;
    }
}

</style>

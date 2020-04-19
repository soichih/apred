<template>
<div>
    <TopMenu/>
    <div class="page" style="position: relative;">
        <p style="opacity: 0.4; float: right; margin-top: 25px;">FEMA delared disasters since 2017</p>
        <h2 style="margin-bottom: 0px">Disaster Declarations</h2>
        <p><i class="el-icon-caret-right"/> Select a county to show detail</p>

        <CountySelecter style="float: left; top: 15px; z-index: 1; width: 230px;" v-model="searchFip"/>
        <div class="legend">
            <div v-for="(color, layer) in layers" :key="layer" class="legend-item" :class="{hidden: hiddenLayers.includes(layer)}" @click.stop="toggleLayer(layer)">
                <input type="checkbox" :checked="!hiddenLayers.includes(layer)" style="float: right;"/>
                <span class="legend-color" :style="{backgroundColor: color}">&nbsp;</span>&nbsp;{{layer}}
            </div>
            <span class="legend-eda"/> EDA Award ($)
        </div>
    </div>

    <div id="map"/>

    <footer>
        <div class="page">
            <p style="line-height: 200%; margin-top: 5px;">
                APRED: The Analysis Platform for Risk, Resilience and Expenditure for Disasters (APRED) project 
                brings data science to decision-makers dealing with the economics of 
                disaster mitigation, analysis, and recovery activities.
            </p>
        </div>
    </footer>
</div>
</template>

<script>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Action, Mutation, namespace } from 'vuex-class'
import CountySelecter from '@/components/CountySelecter.vue'
import TopMenu from '@/components/TopMenu.vue'

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import axios from 'axios'

mapboxgl.accessToken = "pk.eyJ1Ijoic29pY2hpaCIsImEiOiJjazVqdnBsM2cwN242M2psdjAwZXhhaTFuIn0.o3koWlzx1Tup8CJ1B_KaEA";
const pCurrentDD = axios.get("https://dev1.soichi.us/api/apred/currentdd");
const pEDA2018 = axios.get("https://dev1.soichi.us/api/apred/eda2018");
const map = null;

@Component({
    components: { CountySelecter, TopMenu },
})
export default class Disaster extends Vue {

    popup = null;

    //overlay;
    selectedFip = null;
    searchFip = null;
    selectedProperty = null;

    layers = {
        "fire": "#f00",
        "hurricane": "#84a",
        "tornado": "#c60",
        "severe storm": "#fa0",
        "flood": "#06f",
        "other": "#f0f", //volcano, mud/landslide, snow, "coastal storm", typhoon, earthquake, snow
    };
    hiddenLayers = [];

    addLayer(color) {

        function rawColorValue(color) {
            // color looks like #123456
            //   strip off the '#'
            return color.split('#')[1];
        }

        const colorValue = rawColorValue(color);

        const layer = {
            "id": "counties-highlighted-" + colorValue,
            "type": "fill",
            "source": "counties",
            "source-layer": "original",
            "paint": {
                "fill-outline-color": "#888888",
                "fill-color": color,
                "fill-opacity": 0.75
            },
            "filter": [
                "in",
                "COUNTY",
                ""
            ]
        };

        return layer;
    }

    @Watch('searchFip')
    onSearched(to) {
        this.selectedFip = to.replace(".", "");
    }

    @Watch('selectedFip')
    onFipChange(to) {
        if(!to) return;
        this.$router.push('/disasters/'+to);
    }

    created() {
        const h = window.localStorage.getItem("hiddenLayers");
        if(h) {
            this.hiddenLayers = JSON.parse(h);
        }
    }

    mounted() {

        //load map
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
            this.map.addSource('counties', {
                "type": "vector",
                "url": "mapbox://mapbox.82pkq93d"
            });

            this.map.addLayer({
                "id": "counties",
                "type": "fill",
                "source": "counties",
                "source-layer": "original",
                "paint": {
                    "fill-outline-color": "rgba(0,0,0,0.1)",
                    "fill-color": "rgba(0,0,0,0.1)"
                }
            });

            for(const t in this.layers) {
                const color = this.layers[t];

                this.map.addLayer({
                    'id': 'county_disaster_'+t,
                    'type': 'fill',
                    'source': 'counties',
                    'source-layer': 'original',
                    'paint': {
                        //'fill-outline-color': '#f80',
                        'fill-color': color,
                        'fill-opacity': 0.75
                    },
                    'filter': ['in', 'FIPS', ''],
                    layout: {
                        visibility: this.hiddenLayers.includes(t)?'none':'visible',
                    }
                });

                this.map.addLayer({
                    'id': 'state_disaster_'+t,
                    'type': 'fill',
                    'source': 'counties',
                    'source-layer': 'original',
                    'paint': {
                        //'fill-outline-color': '#f80',
                        'fill-color': color,
                        'fill-opacity': 0.3
                    },
                    'filter': ['in', 'FIPS', ''],
                    layout: {
                        visibility: this.hiddenLayers.includes(t)?'none':'visible',
                    }
                });
            }

            this.map.addLayer({
                'id': 'counties-highlighted',
                'type': 'fill',
                'source': 'counties',
                'source-layer': 'original',
                'paint': {
                    //'fill-outline-color': '#484896',
                    'fill-color': '#fff',
                    'fill-opacity': 1,
                },
                'filter': ['in', 'FIPS', '']
            });

            this.map.on('click', e=>{
                // set bbox as 5px reactangle area around clicked point
                const features = this.map.queryRenderedFeatures(e.point, {
                    layers: ['counties']
                });

                if(features.length == 1) {
                    this.selectedFip = features[0].properties.FIPS;
                }
            });

            this.map.on('mousemove', 'counties', (e)=> {
                // Change the cursor style as a UI indicator.
                this.map.getCanvas().style.cursor = 'pointer';
                
                // Single out the first found feature.
                const feature = e.features[0];
                
                const filter = ['in', 'FIPS', feature.properties.FIPS];
                if(this.selectedFip) filter.push(this.selectedFip);
                this.map.setFilter('counties-highlighted', filter);
                
                // Display a popup with the name of the county
                this.popup
                    .setLngLat(e.lngLat)
                    .setText(feature.properties.COUNTY)
                    .addTo(this.map);
            });

            this.map.on('mouseleave', 'counties', ()=>{
                this.popup.remove();
                const filter = ['in', 'FIPS'];
                if(this.selectedFip) filter.push(this.selectedFip);
                this.map.setFilter('counties-highlighted', filter);
            });
            this.map.once('idle',()=>{
                console.log("idleing..");
                this.loadCurrentdd();
            });
        })
    }

    toggleLayer(layer) {
        const pos = this.hiddenLayers.indexOf(layer);
        if(~pos) this.hiddenLayers.splice(pos, 1);
        else this.hiddenLayers.push(layer);
        this.map.setLayoutProperty('county_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');
        this.map.setLayoutProperty('state_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');

        window.localStorage.setItem("hiddenLayers", JSON.stringify(this.hiddenLayers));
    }

    loadCurrentdd() {
        pCurrentDD.then(res=>{
            const fips = {};
            const counties = this.map.queryRenderedFeatures({layers: ['counties']});
            res.data.forEach(rec=>{
                let type = rec.incidentType.toLowerCase();
                if(type.includes('(')) type = type.substring(0, type.indexOf('('));
                if(!this.layers[type]) {
                    //console.error("unknown incident type", type);
                    type = "other";
                }
                if(!fips[type]) fips[type] = { county: [], state: [] };

                if(rec.countyfips) {
                    //see if have county declerations
                    let fip = rec.statefips+rec.countyfips;
                    if(!fips[type].county.includes(fip)) fips[type].county.push(fip);
                    
                    //bug in geojson source? some counties are listed as number (so I have to filter as number too)
                    fip = parseInt(fip);
                    if(!fips[type].county.includes(fip)) fips[type].county.push(fip);
                } else {
                    //see if have state-wide declrations
                    counties.forEach(crec=>{
                        const rfips = (crec.properties.FIPS+"").substring(0,2); //pull first 2 digit of fips
                        if(rec.statefips == rfips) {
                            fips[type].state.push(crec.properties.FIPS);

                            //bug in geojson source? some counties are listed as number (so I have to filter as number too)
                            fips[type].state.push(parseInt(crec.properties.FIPS));

                        }
                    });
                }
            });          

            for(const type in fips) {
                this.map.setFilter('county_disaster_'+type, ['in', 'FIPS', ...fips[type].county]);
                this.map.setFilter('state_disaster_'+type, ['in', 'FIPS', ...fips[type].state]);
            }
        })

        pEDA2018.then(res=>{
            const edaFeatures = [];
            res.data.states.forEach(rec=>{
                edaFeatures.push({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [ rec.lon, rec.lat ],
                    },
                    properties: {
                        award: rec.award, 
                        edatype: 'state',
                        awardStr: "$"+(rec.award/1000000).toFixed(2)+"m",
                    }
                });
            });

            res.data.counties.forEach(rec=>{
                edaFeatures.push({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [ rec.lon, rec.lat ],
                    },
                    properties: {
                        award: rec.award, 
                        edatype: 'county',
                        awardStr: "$"+(rec.award/1000000).toFixed(2)+"m",
                    } 
                });
            });

            this.map.addSource('eda2018', {
                'type': 'geojson',
                data: {type: "FeatureCollection", features: edaFeatures},
            });
            this.map.addLayer({
                'id': 'eda-circles',
                'type': 'circle',
                'source': 'eda2018',
                'paint': {
                    'circle-stroke-color': {
                        property: 'edatype',
                        type: 'categorical',
                        stops: [
                            ['state', 'rgba(0,0,0,0)'],
                            ['county', 'rgba(103,194,58,0.8)'],
                        ]
                    },
                    'circle-stroke-width': 2,
                    'circle-color': {
                        property: 'edatype',
                        type: 'categorical',
                        stops: [
                            ['state', 'rgba(103,194,58,0.8)'],
                            ['county', 'rgba(0,0,0,0)'],
                        ]
                    },
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
                'source': 'eda2018',
                'minzoom': 4,
                'layout': {
                    'text-field': 
                        ['get', 'awardStr'],
                        //['concat', '$', ['to-string', ['get', 'award']]]
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
background-color: #333; 
color: #999; 
height: 75px;
bottom: 0;
width: 100%;
}
</style>

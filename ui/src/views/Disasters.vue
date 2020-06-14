<template>
<div>
    <TopMenu/>
    <div>
        <div id="map"/>
        <CountyDetail v-if="selected && geojson" :detail="selected" :layers="layers" :geojson="geojson"/>
        <div v-else style="position: relative;">
            <div class="page">
                <p style="padding-top: 10px;">
                    <el-tabs v-model="mode">
                        <el-tab-pane name="dr" label="FEMA Disaster Declarations"></el-tab-pane>
                        <el-tab-pane name="resilience" label="Disaster Resilience"></el-tab-pane>
                        <el-tab-pane name="eda2018" label="EDA Supplemental Awards"></el-tab-pane>
                    </el-tabs>
                </p>
                <div class="legend" v-if="mode == 'dr'">
                    <p>
                        <b>Date Range</b>
                        <el-select v-model="drRange" placeholder="Select" size="mini">
                            <el-option v-for="item in drRanges" :key="item.value" :label="item.label" :value="item.value"/>
                        </el-select>
                    </p>
                    <p>
                        <b>Disaster Types</b>
                    </p>
                    <div class="legend-item" style="border-bottom: 1px solid #0002; margin-bottom: 8px; padding-bottom: 3px;">
                        <input type="checkbox" v-model="layersAll" @change="handleAll"/>
                        All
                    </div>
                    <div v-for="(info, layer) in layers" :key="layer" class="legend-item" :class="{hidden: hiddenLayers.includes(layer)}" @click.stop="toggleLayer(layer)" style="clear: both;" :title="info.types.join(', ')">
                        <input type="checkbox" :checked="!hiddenLayers.includes(layer)"/>
                        <span class="legend-color" :style="{backgroundColor: info.color}">&nbsp;</span>&nbsp;{{layer}}
                    </div>
                    <!--
                    <span class="legend-eda"/> EDA Award ($)
                    -->
                </div>
                <div class="legend" v-if="mode == 'resilience'">
                    <p>
                        <b>Year</b>
                        <el-select v-model="drRange" placeholder="Select" size="mini">
                            <el-option v-for="item in [{value: 'recent', label:'2018'}]" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                        </el-select>
                    </p>
                    <p>
                        <b>Resiliences</b>
                    </p>
                    <div v-for="(info, cid) in cutterIndicators" :key="cid" class="legend-item" :class="{hidden: hiddenDRLayers.includes(cid)}" @click.stop="toggleDRLayer(cid)" style="clear: both;">
                        <input type="checkbox" :checked="!hiddenDRLayers.includes(cid)"/>
                        <span class="legend-color" :style="{'background-color': info.color}">&nbsp;</span>&nbsp;{{info.name}}
                    </div>
                </div>
                <div class="legend" v-if="mode == 'eda2018'">
                    <!--
                    <p>
                        <b>EDA2018 Awards</b>
                    </p>
                    -->
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #00ff00">&nbsp;</span>&nbsp;Statewide Awards
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #0066ff">&nbsp;</span>&nbsp;County Awards
                    </div>
                </div>

                <div class="county-selecter" style="width: 230px">
                    <CountySelecter style="width: 230px" @selected="countySelected" :options="countyList"/>
                </div>
            </div>

            <!--
            <footer>
                <div class="page">
                    <p style="line-height: 200%; margin-top: 5px;">
                        This platform brings data science to decision-makers dealing with the economics of 
                        disaster mitigation, analysis, and recovery activities.
                        Made by <b>CTIL Crisis Technologies Innovation Lab</b> at Indiana University
                    </p>
                </div>
            </footer>
            -->
        </div>
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
    <div class="contextmenu" ref="contextmenu">
        <p class="menu-item" @click="openContextMenuCounty">Open this county ({{contextMenuCounty}}) in a new tab</p>
    </div>
</div>
</template>

<script>

import { Component, Vue, Watch } from 'vue-property-decorator'

import CountySelecter from '@/components/CountySelecter.vue'
import TopMenu from '@/components/TopMenu.vue'
import CountyDetail from '@/components/CountyDetail.vue'
import Footer from '@/components/Footer.vue'

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1Ijoic29pY2hpaCIsImEiOiJjazVqdnBsM2cwN242M2psdjAwZXhhaTFuIn0.o3koWlzx1Tup8CJ1B_KaEA";

@Component({
    components: { CountySelecter, TopMenu, CountyDetail, Footer },
})
export default class Disaster extends Vue {

    popup;
    selected = null;
    geojson = null;

    cutters = null;

    hiddenLayers = [];
    hiddenDRLayers = [];
    countyList = [];
    layersAll = true;

    contextMenuCounty = null;

    updatedDate = null;

    mode = null;
    drRange = null;
    drRanges = [
        {value: 'recent', label: '2017 - Now'},
    ];
    yearsDR = null;

    cutterIndicators = {
        "SOC": {
            name: "Social",
            color: "#c00",
        },
        "ECON": {
            name: "Economical",
            color: "#0c0",
        },
        "IHFR": {
            name: "Infrastructure",
            color: "#00c",
        },
        "COMM": {
            name: "Community Capital",
            color: "#666",
        },
    }
     

    layers = {
        "biological": {
            color: "#396",
            opacity: 0.5,
            types: ["Biological"],
        },
        "other": {
            color: "#999",
            types: ["EarthQuake", "Coastal Storm", "Snow", "Mud/Landslide", "Volcano", "Dam/Levee Break", "Severe Ice Storm"],
        }, 
        "hurricane": {
            color: "#0af", 
            types: ["Hurricane"],
        },
        "tornado": {
            color: "#f6f", 
            types: ["Tornado"],
        },
        "severe storm": { 
            color: "#fa0", 
            types: ["Severe Storm(s)"],
        },
        "flood": {
            color: "#06f",
            types: ["Flood"],
        },
        "fire": {
            color: "#f00", 
            types: ["Fire"],
        },
    };

    @Watch('$route')
    onRouteChange() {
        this.loadCounty(this.$route.params.fips);
    }

    @Watch('drRange')
    onRangeChange() {
        //apply to each layers
        for(const key in this.layers) {
            //works
            //this.map.setFilter('county_disaster_'+key, ['in', 'fips', '18093', '18101']);
            const types = this.layers[key].types;
            if(!types) continue;
            let filter = ['in', 'fips'];
            let stateFilter = ['in', 'statefips'];
            const years = [];
            if(this.drRange == "recent") {
                const now = new Date();
                for(let y = 2017; y < now.getFullYear(); ++y) years.push(y);
            } else years.push(this.drRange);
            console.dir(years);

            years.forEach(year=>{ 
                types.forEach(type=>{
                    if(this.yearsDR[year][type]) {
                        filter = filter.concat(this.yearsDR[year][type].filter(fip=>fip.length == 5));
                        stateFilter = stateFilter.concat(this.yearsDR[year][type].filter(fip=>fip.length == 2));
                    }
                }); 
            });
            this.map.setFilter('county_disaster_'+key, filter);
            //console.dir(stateFilter);
            this.map.setFilter('state_disaster_'+key, stateFilter);
        }
    }
    
    created() {
        let h = window.localStorage.getItem("hiddenLayers");
        if(h) {
            this.hiddenLayers = JSON.parse(h);
            this.layersAll = (this.hiddenLayers.length == 0);
        }

        h = window.localStorage.getItem("hiddenDRLayers");
        if(h) {
            this.hiddenDRLayers = JSON.parse(h);
            //this.layersAll = (this.hiddenDRLayers.length == 0);
        }

        for(let year = 2020; year > 1960; --year) {
            this.drRanges.push(
                {value: year.toString(), label: year.toString()},
            );
        }
    }

    @Watch('mode')
    onModeChange() {

        this.hideDDLayers();
        this.hideDRLayers();
        this.hideEDA2018Layers();

        //show layers that belongs to mode
        switch(this.mode) {
        case "dr":
            this.showDDLayers();
            break;
        case "resilience":
            this.showDRLayers();
            break;
        case "eda2018":
            this.showEDA2018Layers();
            break;
        }
    }

    hideDDLayers() {
        for(const t in this.layers) {
            this.map.setLayoutProperty('county_disaster_'+t, 'visibility', 'none');
            this.map.setLayoutProperty('state_disaster_'+t, 'visibility', 'none');
        }
    }

    showDDLayers() {
        for(const t in this.layers) {
            this.map.setLayoutProperty('county_disaster_'+t, 'visibility', this.hiddenLayers.includes(t)?'none':'visible');
            this.map.setLayoutProperty('state_disaster_'+t, 'visibility', this.hiddenLayers.includes(t)?'none':'visible');
        }
    }

    hideDRLayers() {
        if(!this.cutters) return; //DR not yet loaded
        for(const t in this.cutterIndicators) {
            this.map.setLayoutProperty('dr'+t, 'visibility', 'none');
        }
    }

    showDRLayers() {
        for(const t in this.cutterIndicators) {
            this.map.setLayoutProperty('dr'+t, 'visibility', this.hiddenDRLayers.includes(t)?'none':'visible');
        }
    }
    hideEDA2018Layers() {
        this.map.setLayoutProperty('eda-labels', 'visibility', 'none');
        this.map.setLayoutProperty('eda2018', 'visibility', 'none');
    }

    showEDA2018Layers() {
        this.map.setLayoutProperty('eda-labels', 'visibility', 'visible');
        this.map.setLayoutProperty('eda2018', 'visibility', 'visible');
    }

    loadCutters(year, measure) {

        //load specified year / cutter measure
        const values = {};
        for(const fip in this.cutters) {
            const cutter = this.cutters[fip];
            if(cutter[measure]) values[fip] = cutter[measure][year-2012];
        }   

        //apply to geojson 
        this.geojson.features.forEach(feature=>{
            const fips = feature.properties["statefips"]+"."+feature.properties["countyfips"];
            feature.properties["resilience"] = values[fips]||0;
        });

        //create source / layer
        this.map.addSource('dr'+measure, { type: "geojson", data: this.geojson });

        this.map.addLayer({
            "id": "dr"+measure,
            "type": "fill",
            "source": "dr"+measure,
            "paint": {
                "fill-opacity": ['get', 'resilience'],
                "fill-color": this.cutterIndicators[measure].color,
            },
            layout: {
                visibility: 'none',
            }
        });
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

            //TODO - allow user to specify this year to show for dr

            //I can try..
            //this.map.getSource('counties').setData(new_geojson); 
            //or maybe better to somehow update the prop values on the fly? can I do that?

            //TODO - I should separate DR information from counties_geo.. so we can load data for each year ranges
            //counties_geo should just contain counties_geo
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

                });

                //all counties
                this.map.addSource('counties', { type: "geojson", data });
                console.log(data);
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
                        //filter: layer.filter,
                        filter: ['in', 'fips', ''],
                        layout: {
                            visibility: 'none',
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
                        //'filter': layer.statefilter,
                        filter: ['in', 'statefips', ''],
                        layout: {
                            visibility: 'none',
                        }
                    });
                }

                fetch("https://gpu1-pestillilab.psych.indiana.edu/apred/years.json").then(res=>{ 
                    //this.drYearsUpdated = res.headers.get("last-modified")
                    return res.json()
                }).then(data=>{
                    this.yearsDR = data;
                    this.drRange = "recent";

                    //ready to show DR map now
                    this.mode = "dr";
                });


                fetch("https://gpu1-pestillilab.psych.indiana.edu/apred/cutter_long.json").then(res=>{ 
                    return res.json()
                }).then(data=>{
                    this.cutters = data;
                    for(const cid in this.cutterIndicators) {
                        this.loadCutters(2018, cid);
                    }
                });
            });

            fetch("https://gpu1-pestillilab.psych.indiana.edu/apred/eda2018.json").then(res=>{ 
                return res.json()
            }).then(data=>{
                const geojson = {type: "FeatureCollection", features: []};

                for(const recid in data) {
                    const rec = data[recid];
                    const ep = 0.15;
                    geojson.features.push({
                        type: "Feature",
                        geometry: {
                            type: "Polygon",
                            coordinates: [ 
                            [    [ rec.lon-ep, rec.lat-ep ],
                                [ rec.lon-ep, rec.lat+ep ],
                                [ rec.lon+ep, rec.lat+ep ],
                                [ rec.lon+ep, rec.lat-ep ],
                                [ rec.lon-ep, rec.lat-ep ], ]
                            ]
                        },
                        properties: {
                            height: rec.award_amount/50,
                            //awardStr: "$"+this.$options.filters.formatNumber(rec.award_amount/1000)+"k",
                            color: rec.statewide?'#00ff00':'#0066ff',
                        }
                    });
                }
                this.map.addSource('eda2018', { type: "geojson", data: geojson });
                this.map.addLayer({
                    'id': 'eda2018',
                    'type': 'fill-extrusion',
                    "source": "eda2018",
                    "paint": {
                        "fill-extrusion-color": ['get', 'color'],
                        "fill-extrusion-height": ['get', 'height'],
                    },
                    layout: {
                        visibility: 'none', 
                    }
                });

                const geojsonPoint = {type: "FeatureCollection", features: []};
                for(const recid in data) {
                    const rec = data[recid];
                    geojsonPoint.features.push({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [ rec.lon, rec.lat ],
                        },
                        properties: {
                            //award: rec.award_amount,
                            awardStr: "$"+this.$options.filters.formatNumber(rec.award_amount/1000)+"k",
                            type: rec.statewide?'state':'county',
                        }
                    });
                }
                this.map.addSource('eda2018-point', { type: "geojson", data: geojsonPoint });

                this.map.addLayer({
                    'id': 'eda-labels',
                    'type': 'symbol',
                    "source": "eda2018-point",
                    layout: {
                        visibility: 'none', 
                        'text-field': ['get', 'awardStr'],
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
            this.map.on('contextmenu', e=>{
                const features = this.map.queryRenderedFeatures(e.point, {
                    layers: ['counties']
                });
                if(features.length > 0) {
                    e.preventDefault();
                    const mapel = document.getElementById("map");
                    this.$refs["contextmenu"].style.display = "block";
                    this.$refs["contextmenu"].style.left = (e.point.x-20)+"px";
                    this.$refs["contextmenu"].style.top = (mapel.offsetTop + e.point.y - 10)+"px";
                    this.contextMenuCounty = features[0].properties.statefips+features[0].properties.countyfips;
                }
            });

            //close context menu as soon as user leaves it
            this.$refs["contextmenu"].addEventListener("mouseleave", ()=>{
                this.$refs["contextmenu"].style.display = "none";
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
            this.$ga.page('/map')
            return;
        }
        this.$ga.page('/county/'+fips)

        this.showTutorial(); //hiding tutorial

        //fetch("https://ctil.iu.edu/projects/apred-data/counties/county."+fips+".json").then(res=>res.json()).then(data=>{
        const loading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(255, 255, 255, 0.3)'
        });
        fetch("https://gpu1-pestillilab.psych.indiana.edu/apred/counties/county."+fips+".json").then(res=>res.json()).then(data=>{
            if(data.cutter) {
                delete data.cutter.INST;
                delete data.cutter.FLOR;
            }
            this.selected = data;
            loading.close();
        });
    }

    countySelected(fips) {
        this.$router.push('/county/'+fips);
    }
    openContextMenuCounty() {
        window.open("#/county/"+this.contextMenuCounty, "apred-"+this.contextMenuCounty);
    }

    toggleLayer(layer) {
        const pos = this.hiddenLayers.indexOf(layer);
        if(~pos) this.hiddenLayers.splice(pos, 1);
        else this.hiddenLayers.push(layer);
        this.map.setLayoutProperty('county_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');
        this.map.setLayoutProperty('state_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');
        this.layersAll = (this.hiddenLayers.length == 0);

        window.localStorage.setItem("hiddenLayers", JSON.stringify(this.hiddenLayers));
    }

    toggleDRLayer(layer) {
        const pos = this.hiddenDRLayers.indexOf(layer);
        if(~pos) this.hiddenDRLayers.splice(pos, 1);
        else this.hiddenDRLayers.push(layer);
        this.map.setLayoutProperty('dr'+layer, 'visibility', this.hiddenDRLayers.includes(layer)?'none':'visible');
        this.map.setLayoutProperty('dr'+layer, 'visibility', this.hiddenDRLayers.includes(layer)?'none':'visible');
        //this.layersAll = (this.hiddenDRLayers.length == 0);

        window.localStorage.setItem("hiddenDRLayers", JSON.stringify(this.hiddenDRLayers));
    }

    handleAll() {
        if(this.layersAll) {
            this.hiddenLayers = [];
        } else {
            this.hiddenLayers = [];
            for(const key in this.layers) {
                this.hiddenLayers.push(key);
            }
        }
        window.localStorage.setItem("hiddenLayers", JSON.stringify(this.hiddenLayers));

        //apply layer state
        for(const layer in this.layers) {
            this.map.setLayoutProperty('county_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');
            this.map.setLayoutProperty('state_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');
        }
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
    bottom: 0;
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
    width: 170px;

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
        width: 170px;
        height: 20px;
        margin-right: 10px;
        cursor: pointer;
        &.hidden {
            color: #999;
        }
        input[type='checkbox'] {
            float: right;
            position: relative;
            height: 15px;
            top: -5px;
        }
    }
    
}
.county-selecter {
    margin-top: 10px; 
    margin-right: 30px;
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
.contextmenu {
    z-index: 10;
    position: fixed;
    top: 50px;
    left: 50px;
    width: 300px;
    background-color: white;
    box-shadow: 2px 2px 5px #0003;
    display: none;
    padding: 10px 0;

    .menu-item {
        font-size: 90%;
        padding: 5px 10px;
        margin-bottom: 0px;
    }
    .menu-item:hover {
        cursor: pointer;
        background-color: #eee;
    }
}
</style>



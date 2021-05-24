<template>
<div :class="{sidebarHidden: hideSidebar}">
    <div id="map"/>
    
    <div class="search-control">
        <div style="margin: 20px; opacity: 0.6; display: inline-block;">
        <span style="opacity: 0.5; margin-left: 10px;"></span></div>
        <CountySelecter @select="countySelected" placeholder="Search county name here" style="width: 300px"/>
    </div>
    <div class="showSide" v-if="hideSidebar">
        <el-button icon="el-icon-arrow-right" type="primary" size="mini" @click="collapse" style="position: fixed; top: 65px; left: -4px; "></el-button>
    </div>
    <div class="side" :class="{sidebarHidden: hideSidebar}">
        <div class="legend" v-if="mode">
            <el-button icon="el-icon-arrow-left" type="primary" size="mini" @click="collapse" style="float: right; position: relative; top: -5px; z-index: 1;"></el-button>
            <p class="heading">
                <b>Map Type</b>
            </p>
            <p>
                <el-select v-model="mode" placeholder="Select" size="small" style="width: 100%;">
                    <el-option v-for="item in modes" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
            </p>            
            <div v-if="mode" class="map-description">
                <p v-if="mode == 'dr'">
                    This map shows counties with <a href="https://www.fema.gov/disasters/disaster-declarations">FEMA Disaster Declarations</a>. Enter a specific county name in search box to view in-depth information.
                </p>
                <p v-if="mode == 'eda'">
                    This map shows locations and amounts of EDA (U.S. Economic Development Administration) fundings awarded in the specified time range. EDA assists communities experiencing economic distress or harm resulting from federally-declared natural disasters.
                </p>
                <p v-if="mode == 'resilience'">
                    This map shows disaster resilience score for each counties in the specified year aggregated into 4 major categories (Social, Economic, Infrastructure, and Community Capital).  Disaster resilience scores are calculated using data from U.S. Census using formulas defined by [Cuter et al. 2020].
                </p>
            </div>

            <div v-if="mode == 'dr'">
                <p class="heading">
                    <br>
                    <b>Date Range</b>
                </p>
                <p>
                    <el-row :gutter="5">
                        <el-col :span="4">
                             <el-button icon="el-icon-back" size="mini" @click="drPrevious" :disabled="drRange == '1961'"></el-button>
                        </el-col>
                        <el-col :span="16">
                            <el-select v-model="drRange" placeholder="Select" size="mini">
                                <el-option v-for="item in drRanges" :key="item.value" :label="item.label" :value="item.value"/>
                            </el-select>
                        </el-col>
                        <el-col :span="4">
                             <el-button icon="el-icon-right" size="mini" @click="drNext" :disabled="drRange == 'recent'"></el-button>
                        </el-col>
                    </el-row>
                </p>
                <p class="heading">
                    <br>
                    <b>Disaster Types</b>
                </p>
                <div class="legend-item" style="border-bottom: 1px solid #0002; margin-bottom: 8px; padding-bottom: 3px;">
                    <input type="checkbox" v-model="layersAll" @change="handleAll"/>
                    All
                </div>
                <div v-for="(info, layer) in $root.layers" :key="layer" class="legend-item" :class="{hidden: hiddenLayers.includes(layer)}" style="clear: right;">
                    <input type="checkbox" @click.stop="toggleLayer(layer)" :checked="!hiddenLayers.includes(layer)"/>
                    <span class="legend-color" :style="{backgroundColor: info.color}">&nbsp;</span>&nbsp;{{layer.toUpperCase()}}
                    <!--
                    <span v-if="info.tooltip" :title="info.tooltip">
                        <i class="el-icon-question"></i>

                    </span>
                    -->
                    <el-popover placement="top-start" trigger="hover" v-if="info.tooltip || info.types.length > 1" :content="info.tooltip || info.types.join(', ')">
                        <el-button slot="reference" size="mini" type="info" style="padding: 3px;">?</el-button>
                    </el-popover>
                    <!--
                    <span v-if="info.types.length > 1" :title="info.types.join(', ')">
                        <i class="el-icon-question"></i>
                    </span>
                    -->
                </div>
            </div>

            <div v-if="mode == 'eda'">
                <p class="heading">
                    <b>Year</b>
                </p>
                <p>
                    <el-row :gutter="5">
                        <el-col :span="4">
                             <el-button icon="el-icon-back" size="mini" @click="edaPrevious" :disabled="edaYear == '2012'"></el-button>
                        </el-col>
                        <el-col :span="16">
                            <el-select v-model="edaYear" placeholder="Select" size="mini">
                                <el-option v-for="item in edaYears" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="4">
                             <el-button icon="el-icon-right" size="mini" @click="edaNext" :disabled="edaYear == 'all'"></el-button>
                        </el-col>
                    </el-row>
                </p>
                <p class="heading">
                    <b>Grant Purpose</b>
                    <br>
                </p>
                <ul style="list-style: none; padding: 0;">

                    <p style="margin-bottom: 5px">
                        <el-radio v-model="edaType" label="All">All</el-radio>
                    </p>

                    <p style="margin-bottom: 5px;">
                        <small><b>2012 Supplemental</b></small>
                    </p>
                    <li style="margin-bottom: 3px;" v-for="type in edaTypes['2012']" :key="type">
                        <el-radio v-model="edaType" :label="type">
                            {{type.split(" ").slice(0, 2).join(" ")}}
                        </el-radio>
                    </li>

                    <p style="margin-bottom: 5px">
                        <small><b>2018 Supplemental</b></small>
                    </p>
                    <li style="margin-bottom: 3px;" v-for="type in edaTypes['2018']" :key="type">
                        <el-radio v-model="edaType" :label="type">
                            {{type.split(" ").slice(0, 2).join(" ")}}
                        </el-radio>
                    </li>
                    <br>
                </ul>
            </div>

            <div v-if="mode == 'resilience'">
                <p class="heading">
                    <b>Year</b>
                </p>
                <p>
                    <el-row :gutter="5">
                        <el-col :span="4">
                             <el-button icon="el-icon-back" size="mini" @click="resPrevious" :disabled="resYear == '2012'"></el-button>
                        </el-col>
                        <el-col :span="16">
                            <el-select v-model="resYear" placeholder="Select" size="mini">
                                <el-option v-for="item in resYears" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="4">
                             <el-button icon="el-icon-right" size="mini" @click="resNext" :disabled="resYear == '2018'"></el-button>
                        </el-col>
                    </el-row>
                </p>
                <p class="heading">
                    <b>Resilience Indicators</b>
                </p>
                <div v-for="(info, cid) in cutterIndicators" :key="cid" class="legend-item">
                    <el-radio v-model="drLayer" :label="cid" @change="showDRLayers" :style="{color: info.color}">{{info.name}}</el-radio>
                </div>
                <br>
                <div style="background-image: linear-gradient(to right, red, yellow, green); width: 100%; height: 5px;">&nbsp;</div>
                <span style="float: left;">Low</span>
                <span style="float: right">High</span>
                <br>
            </div>
        </div>
    </div>

    <div class="contextmenu" ref="contextmenu">
        <p class="menu-item" @click="openContextMenuCounty">Open ({{contextMenuCounty}}) in a new tab</p>
    </div>
</div>
</template>

<script>

import { Component, Vue, Watch } from 'vue-property-decorator'

import CountySelecter from '@/components/CountySelecter.vue'

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

import numeral from "numeral";

const today = new Date();
const thisYear = today.getFullYear();

mapboxgl.accessToken = "pk.eyJ1Ijoic29pY2hpaCIsImEiOiJjazVqdnBsM2cwN242M2psdjAwZXhhaTFuIn0.o3koWlzx1Tup8CJ1B_KaEA";

@Component({
    components: { CountySelecter,/*TopMenu, CountyDetail, Footer*/ },
})
export default class Disaster extends Vue {

    modes = [];

    popup;
    selected = null;
    selectedFips = null;
    geojson = null;

    cutters = null;

    hiddenLayers = ["biological"];
    drLayer = "SOC";
    layersAll = true;

    contextMenuCounty = null;
    contextMenuFips = null;

    updatedDate = null;

    mode = null; //will be init to "dr" once we are ready to show dr map

    drRange = null;
    drRanges = [
        {value: 'recent', label: '2017 - Now'},
    ];
    yearsDR = null;
    eda2018 = null;

    resYear = null; //will be set to "2018" once cutter info is loaded
    resYears = [];

    edaYear = null; //will be set to "all" once eda layers area loaded
    edaYears = [];
    edaType = "All";
    edaTypes = {"2012": [], "2018": []};

    cutterIndicators = {
        "SOC": {
            name: "Social",
            color: "#444",
        },
        "ECON": {
            name: "Economic",
            color: "#444",
        },
        "IHFR": {
            name: "Infrastructure",
            color: "#444",
        },
        "COMM": {
            name: "Community Capital",
            color: "#444",
        },
    }

    awardIcon = require('@/assets/pin.png');

    @Watch('drRange')
    onRangeChange() {
        //apply to each layers
        for(const key in this.$root.layers) {
            const types = this.$root.layers[key].types;
            if(!types) continue;
            let filter = ['in', 'fips'];
            let stateFilter = ['in', 'statefips'];
            const years = [];
            if(this.drRange == "recent") {
                const now = new Date();
                for(let y = 2017; y <= now.getFullYear(); ++y) years.push(y);
            } else years.push(this.drRange);

            years.forEach(year=>{ 
                types.forEach(type=>{
                    if(this.yearsDR[year] && this.yearsDR[year][type]) {
                        filter = filter.concat(this.yearsDR[year][type].filter(fip=>fip.length == 5));
                        stateFilter = stateFilter.concat(this.yearsDR[year][type].filter(fip=>fip.length == 2));
                    }
                }); 
            });

            //they contain duplicates from different year - let's dedupe
            const filterDeduped = [...new Set(filter)];
            const stateFilterDeduped = [...new Set(stateFilter)];

            this.map.setFilter('county_disaster_'+key, filterDeduped);
            this.map.setFilter('state_disaster_'+key, stateFilterDeduped);
        }
    }

    @Watch('resYear')
    onResChange(v) {
        if(!v) return;
        const year = parseInt(this.resYear);
        for(const cid in this.cutterIndicators) {
            //load specified year / cutter measure
            const values = {};
            for(const fip in this.cutters) {
                const cutter = this.cutters[fip];
                //fip contains .(dot) between state and county
                //to make it compatible with albers.geojson, let's remove it
                const numfip = fip.replace(".", "");
                if(cutter[cid]) values[numfip] = cutter[cid][year-2012];
            }   

            //apply to geojson 
            this.geojson.features.forEach(feature=>{
                const fips = feature.properties["fips"];
                feature.properties["resilience"] = values[fips]||0;
            });

            this.map.getSource('dr'+cid).setData(this.geojson);
        }
    }
    
    @Watch('edaYear')
    onEdaYearChange(v) {
        if(!v) return;
        this.updateEda();
    }

    @Watch('edaType')
    onEdaTypeChange(v) {
        if(!v) return;
        this.updateEda();
    }

    updateEda() {
        //eda county labels
        const filter = ['in', 'fips'];
        this.eda2018.forEach(rec=>{
            if(this.edaYear != "all" && rec.year != this.edaYear) return;
            if(this.edaType != "All" && rec.data.grant_purpose != this.edaType) return;
            if(!filter.includes(rec.fips)) filter.push(rec.fips);
        });
        this.map.setFilter('eda', filter);
    }
 
    created() {
        this.modes.push({value: "dr", label: "FEMA Disaster Declarations"});
        if(this.$root.user) this.modes.push({value: "eda", label: "EDA Awards"});
        this.modes.push({value: "resilience", label: "Disaster Resilience"});

        const h = window.localStorage.getItem("hiddenLayers");
        if(h) {
            this.hiddenLayers = JSON.parse(h);
            this.layersAll = (this.hiddenLayers.length == 0);
        }

        const drLayer = window.localStorage.getItem("drLayer");
        if(drLayer) this.drLayer = drLayer;

        for(let year = thisYear; year > 1960; --year) {
            this.drRanges.push(
                {value: year.toString(), label: year.toString()},
            );
        }
        for(let year = 2018; year >= 2012; --year) {
            this.resYears.push(
                {value: year.toString(), label: year.toString()},
            );
        }
        this.edaYears.push({value: 'all', label: 'All'});
        for(let year = thisYear; year >= 2012; --year) {
            this.edaYears.push({value: year.toString(), label: year.toString()});
        }
    }

    @Watch('mode')
    onModeChange(v) {
        if(!v) return;
        if(v == 0) return; //where does this come from?

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
        case "eda":
            this.showEDA2018Layers();
            break;
        }
    }

    hideDDLayers() {
        for(const t in this.$root.layers) {
            this.map.setLayoutProperty('county_disaster_'+t, 'visibility', 'none');
            this.map.setLayoutProperty('state_disaster_'+t, 'visibility', 'none');
        }
    }

    showDDLayers() {
        for(const t in this.$root.layers) {
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
            this.map.setLayoutProperty('dr'+t, 'visibility', this.drLayer==t?'visible':'none');
        }
    }
    hideEDA2018Layers() {
        if(!this.edaYear) return; //not loaded yet
        this.map.setLayoutProperty('eda', 'visibility', 'none');
    }

    showEDA2018Layers() {
        this.map.setLayoutProperty('eda', 'visibility', 'visible');
    }

    loadCutters(year, measure) {
        //create source / layer
        this.map.addSource('dr'+measure, { type: "geojson", data: this.geojson });
        this.map.addLayer({
            "id": "dr"+measure,
            "type": "fill",
            "source": "dr"+measure,
            "paint": {
                "fill-opacity": 0.75,
                //"fill-color": this.cutterIndicators[measure].color,
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    [ "get", "resilience" ],
                    0,
                    'red',
                    0.5,
                    'yellow',
                    1,
                    'green'
                ]
            },
            layout: {
                visibility: 'none',
            }
        }, 'map');
        this.resYear = '2018';
    }

    mounted() {
        this.map = new mapboxgl.Map({
            container: 'map', // HTML container id
            style: 'mapbox://styles/soichih/ckig6p3ph51e719pcdusqyd1o', 
            center: [0, 0], // starting position as [lng, lat]
            minZoom: 4,
            pitch: 30, // pitch in degrees
            //bearing: 10, // bearing in degrees
            zoom: 1,
        });
        this.$root.map = this.map; //hack to work around mapbox resizing bug

        // disable map zoom when using scroll
        //this.map.scrollZoom.disable();

        // Add zoom and rotation controls to the map.
        this.map.addControl(new mapboxgl.NavigationControl());

        this.popup = new mapboxgl.Popup({
            closeButton: false,
            offset: [0, -20],
            maxWidth: 400,
        });

        this.map.on('load', ()=>{

            //TODO - allow user to specify this year to show for dr

            //I can try..
            //this.map.getSource('counties').setData(new_geojson); 
            //or maybe better to somehow update the prop values on the fly? can I do that?

            //TODO - I should separate DR information from counties_geo.. so we can load data for each year ranges
            //counties_geo should just contain counties_geo
            fetch(this.$root.dataUrl+"/counties_geo.albers.geojson").then(res=>{ 
                this.updatedDate = res.headers.get("last-modified")
                return res.json()
            }).then(data=>{
                this.geojson = data;

                //all counties
                this.map.addSource('counties', { type: "geojson", data });
                this.map.addLayer({
                    id: "map",
                    type: "fill",
                    source: "counties",
                    paint: {
                        "fill-color": "rgba(255,255,255,0.1)"
                    }
                });

                const layers = [];
                for(const t in this.$root.layers) {
                    const layer = this.$root.layers[t];
                    layer.id = t; 
                    layers.push(layer);
                }
                layers.sort((a,b)=>{
                    return a.zIndex - b.zIndex;
                });

                layers.forEach(layer=>{
                    this.map.addLayer({
                        id: 'county_disaster_'+layer.id,
                        type: 'fill',
                        source: 'counties',
                        paint: {
                            'fill-color': layer.color,
                            'fill-opacity': (layer.opacity||1)*0.75
                        },
                        filter: ['in', 'fips', ''],
                        layout: {
                            visibility: 'none',
                        }
                    }, 'map');

                    this.map.addLayer({
                        id: 'state_disaster_'+layer.id,
                        type: 'fill',
                        source: 'counties',
                        paint: {
                            'fill-color': layer.color,
                            'fill-opacity': (layer.opacity||1)*0.2,
                        },
                        filter: ['in', 'fips', ''],
                        layout: {
                            visibility: 'none',
                        }
                    }, 'map');
                });

                fetch(this.$root.dataUrl+"/years.json").then(res=>{ 
                    return res.json()
                }).then(data=>{
                    this.yearsDR = data;
                    this.drRange = "recent";

                    //ready to show DR map now
                    this.mode = "dr";
                });

                fetch(this.$root.dataUrl+"/cutter_long.json").then(res=>{ 
                    return res.json()
                }).then(data=>{
                    this.cutters = data;
                    for(const cid in this.cutterIndicators) {
                        this.loadCutters(2018, cid);
                    }
                });

                //load eda awards
                fetch(this.$root.dataUrl+"/eda2018.json").then(res=>{ 
                    return res.json()
                }).then(data=>{
                    this.eda2018 = [];
                    //pull year/county and orignal rec
                    for(const fain in data) {
                        const rec = data[fain];
                        rec.counties.forEach(county=>{
                            this.eda2018.push({
                                year: new Date(rec.grant_award_date).getFullYear(),
                                fips: county.statefips+county.countyfips,
                                data: rec,
                            })
                        });
                    }

                    //create edatype catalog
                    for(const fain in data) {
                        const rec = data[fain];

                        //some purposes are for 2012supp
                        let year = "2018";
                        switch(rec.grant_purpose) {
                        case "Construction":
                        case "Non-Construction":
                            year = "2012";
                        }

                        if(!this.edaTypes[year].includes(rec.grant_purpose)) {
                            this.edaTypes[year].push(rec.grant_purpose)
                        }
                    }

                    this.map.addLayer({
                        id: 'eda',
                        type: 'fill',
                        source: 'counties',
                        paint: {
                            'fill-color': '#00f',
                            'fill-opacity': 0.5,
                        },
                        filter: ['in', 'fips', ''],
                        layout: {
                            visibility: 'none',
                        }
                    }, 'map');

                    //load pins where eda is awareded (ike wants to remove this)
                    this.edaYear = 'all';
                });
            });

            this.map.on('click', e=>{
                const features = this.map.queryRenderedFeatures(e.point, {
                    layers: ['counties']
                });
                if(features.length > 0) {
                    //this.countySelected(features[0].properties.state_fips+features[0].properties.county_fips);
                    this.countySelected(features[0].properties.county_fips);
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
                    this.contextMenuCounty = features[0].properties.county_name+", "+features[0].properties.state_name;
                    this.contextMenuFips = features[0].properties.county_fips;
                }
            });

            //close context menu as soon as user leaves it
            this.$refs["contextmenu"].addEventListener("mouseleave", ()=>{
                this.$refs["contextmenu"].style.display = "none";
            });

            this.map.on('mousemove', 'counties', (e)=> {
                clearTimeout(this.popupTimeout);
                this.popup.remove();

                const feature = e.features[0];
                const lngLat = e.lngLat;
                this.popupTimeout = setTimeout(()=>{
                    this.showPopup(feature, lngLat);
                }, 300)
            });

            this.map.on('mouseleave', 'counties', ()=>{
                clearTimeout(this.popupTimeout);
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
                        this.showTutorial('tab');
                    });
                }
            });
        })
    }

    popupTimeout = null;

    showPopup(feature, lngLat) {
        //WATCH OUT - mapbox popup won't display the popup if it's too tall to fit in a screen

        // Change the cursor style as a UI indicator.
        this.map.getCanvas().style.cursor = 'pointer';
        
        // Single out the first found feature.
        //const feature = e.features[0];
        
        // Display a popup with the name of the county
        let html = "<div class='popup'>";
        html += "<h2>"+feature.properties.county_name+"<small>, "+feature.properties.state_name+"</small></h2>";
        const fips = feature.properties.county_fips;
        const stateFips = feature.properties.state_fips;

        //figure out which DR are present on current view
        if(this.mode == 'dr') {

            //county drs
            const drs = [];
            for(const t in this.$root.layers) {
                const filter = this.map.getFilter('county_disaster_'+t);
                if(filter.includes(fips)) drs.push(t);
            }

            html += "<div class='drs'>";
            html += "<small>County Disaster Declarations</small><br>";
            if(drs.length == 0) html += "<span class='no-dr'>No county disaster declared during specified period</span>";
            else {
                drs.forEach(dr=>{
                    const inf = this.$root.layers[dr];
                    //html += "<div style='background-color: "+inf.color+"' class='dr-dot'>&nbsp;</div>";
                    html += "<span class='dr' style='color: "+inf.color+"'>"+dr+"</span>\n";
                });
            }
            html += "</div>";

            //state drs
            const stateDrs = [];
            for(const t in this.$root.layers) {
                const stateFilter = this.map.getFilter('state_disaster_'+t);
                if(stateFilter.includes(stateFips)) stateDrs.push(t);
            }

            html += "<div class='drs'>";
            html += "<small>State Disaster Declarations</small><br>";
            if(stateDrs.length == 0) html += "<span class='no-dr'>No state disaster declared during specified period</span>";
            else {
                stateDrs.forEach(dr=>{
                    const inf = this.$root.layers[dr];
                    //html += "<div style='background-color: "+inf.color+"' class='dr-dot'>&nbsp;</div>";
                    html += "<span class='dr' style='color: "+inf.color+"'>"+dr+"</span>\n";
                });
            }
            html += "</div>";

        }

        if(this.mode == 'eda') {
            let count = 0;
            this.eda2018.forEach(rec=>{
                if(this.edaYear != "all" && rec.year != this.edaYear) return;
                if(this.edaType != "All" && rec.data.grant_purpose != this.edaType) return;
                if(rec.fips != fips) return;
                count++;

                html += "<div class='eda-award'>";

                //there are so small number of statewide award.. let's ignore for now?
                //console.dir(rec.data.statewide);

                html += "<h4>";
                html += numeral(rec.data.total_project_funding).format("$0,0");
                html += "<time>"+new Date(rec.data.grant_award_date).toLocaleDateString()+"</time>";
                html += "</h4>";
                //multi county award

                html += "<p>";
                if(rec.data.counties.length > 1) {
                    html += " <span style='opacity: 0.7;'>Multi-county("+rec.data.counties.length+") award</span>"
                    /*
                    html += "<div>";
                    rec.data.counties.forEach(county=>{
                        html += "<span class='eda-county'>"+county.county+","+county.stateadd+"</span> ";
                    });
                    html += "</div>";
                    */
                }
                if(this.edaType == "All") html += " <span style='opacity: 0.7; font-size: 80%'>For</span> "+rec.data.grant_purpose;
                html += "</p>";

                html += "</div>";
            });

            if(count == 0) html += "<small>No EDA Awards with matching criteria</small>";
        }

        if(this.mode == 'resilience') {
            const year = parseInt(this.resYear);
            for(const cid in this.cutterIndicators) {
                const info = this.cutterIndicators[cid];
                const fipswithdot = fips.substring(0,2)+"."+fips.substring(2);
                const cutter = this.cutters[fipswithdot];
                html += "<h4>"+info.name+"</h4> ";
                if(!cutter || !cutter[cid]) {
                    html += "<small>No resilience scores available for this county</small>";
                } else {
                    const v = cutter[cid][year-2012];
                    html +=numeral(v).format("0.123");
                }
            }
        }

        html += "</div>";

        this.popup.setLngLat(lngLat);
        this.popup.setHTML(html);
        this.popup.addTo(this.map);
    }

    showTutorial(page) {

        const tutorial = document.getElementsByClassName("tutorial")[0];

        //close previously opened tutorial
        let item = document.getElementsByClassName("tutorial-focus")[0];
        if(item) item.classList.remove("tutorial-focus");
        let text = document.getElementsByClassName("tutorial-text-show")[0];
        if(text) text.classList.remove("tutorial-text-show");

        switch(page) {
        case "tab":
            item = document.getElementsByClassName("tabs")[0];
            text = document.getElementsByClassName("tutorial-text-tab")[0];
            text.style["top"] = (item.offsetTop + 110)+"px";
            text.style["left"] = (item.offsetLeft + 20)+"px";
            break;
        case "legend":
            item = document.getElementsByClassName("legend")[0];
            text = document.getElementsByClassName("tutorial-text-legend")[0];
            text.style["top"] = (item.offsetTop + 60)+"px";
            text.style["left"] = (item.offsetLeft - 420)+"px";
            break;
        case "county":
            item = document.getElementsByClassName("county-selecter")[0];
            text = document.getElementsByClassName("tutorial-text-county")[0];
            text.style["top"] = (item.offsetTop + 50)+"px";
            text.style["left"] = (item.offsetLeft - 420)+"px";
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

    countySelected(fips) {
        //this.$router.push('/county/'+fips);
        this.$emit("select", fips);
    }
    openContextMenuCounty() {
        window.open("#/county/"+this.contextMenuFips, "apred-"+this.contextMenuFips);
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

    handleAll() {
        if(this.layersAll) {
            this.hiddenLayers = [];
        } else {
            this.hiddenLayers = [];
            for(const key in this.$root.layers) {
                this.hiddenLayers.push(key);
            }
        }
        window.localStorage.setItem("hiddenLayers", JSON.stringify(this.hiddenLayers));

        //apply layer state
        for(const layer in this.$root.layers) {
            this.map.setLayoutProperty('county_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');
            this.map.setLayoutProperty('state_disaster_'+layer, 'visibility', this.hiddenLayers.includes(layer)?'none':'visible');
        }
    }

    resPrevious() {
        this.resYear = (parseInt(this.resYear)-1).toString();
    }

    resNext() {
        this.resYear = (parseInt(this.resYear)+1).toString();
    }

    edaPrevious() {
        if(this.edaYear == "all") {
            this.edaYear = thisYear.toString();
            return;
        }
        this.edaYear = (parseInt(this.edaYear)-1).toString();
    }

    edaNext() {
        if(this.edaYear == thisYear.toString()) this.edaYear = "all";
        else this.edaYear = (parseInt(this.edaYear)+1).toString();
    }

    findIndexDrRange(range) {
        let idx = null;
        this.drRanges.forEach((i, _idx)=>{
            if(i.value == range) idx = _idx;
        });
        return idx;
    }

    drPrevious() {
        const idx = this.findIndexDrRange(this.drRange);
        this.drRange = this.drRanges[idx+1].value;
    }

    drNext() {
        const idx = this.findIndexDrRange(this.drRange);
        this.drRange = this.drRanges[idx-1].value;
    }

    hideSidebar = false;
    collapse() {
        this.hideSidebar = !this.hideSidebar;
    }
    @Watch('hideSidebar')
    onHideSidebar() {
        this.$nextTick(()=>{
            this.map.resize();
        });
    }

}
</script>
<style lang="scss" scoped> 
p {
    margin-top: 0px;
    line-height: 150%;
    color: #333;
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
    left: 350px;
    right: 0;
    top: 50px;
    bottom: 0;
}
.sidebarHidden #map {
    left: 0;
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

.heading {
    margin-bottom: 5px;
    opacity: 0.7;
}

.side {
    position: fixed;
    top: 50px;
    left: 0;
    width: 350px;
    bottom: 0;
    background-color: #f9f9f9;
    transition: left 0.3s;
    border-right: 1px solid #ccc;
    overflow: auto;
    padding-top: 10px;
}
.sidebarHidden .side {
    left: -350px;
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
    padding: 10px;
    font-size: 90%;
    margin: 0;

    .map-description {
        font-size: 90%;
    }
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
        margin-right: 10px;
        font-size: 10pt;
        &.hidden {
            color: #999;
        }
        input[type='checkbox'] {
            float: right;
            position: relative;
            height: 15px;
            top: -5px;
        }
        line-height: 175%;
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
        width: 400px;
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
.el-button--mini {
    padding: 7px;
}
.search-control {
    position: fixed;
    top: 50px;
    left: 330px;
    right: 0;
    padding-top: 10px;
}
.sidebarHidden .search-control {
    left: 20px;
}
</style>

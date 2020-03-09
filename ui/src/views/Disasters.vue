<template>
<div>
    <div class="page">
        <br>
        <h2>Disaster Declarations</h2>
        <CountySelecter style="float: right; top: -10px;" v-model="searchFip"/>
        <p><i class="el-icon-caret-right"/> Select a county to show detail</p>
    </div>

    <div id="map"/>
    <div class="page">
        <p>This map is showing currently declared FEMA disasters</p>
    </div>

    <div v-if="countyDetail" style="background-color: #eee" ref="county-detail">
        <div class="page">
            <br>
            <h3 style="font-size: 150%;">{{countyDetail.county}} county, {{countyDetail.state}}</h3>
            <el-row>
                <el-col :span="8">
                    <!--placeholder-->
                </el-col>
                <el-col :span="8">
                    <span class="sub-heading">Population</span><br>
                    <span class="primary"> {{selectedProperty['population'] | formatNumber}}</span>
                </el-col>
                <el-col :span="8">
                    <span class="sub-heading">Median Income</span><br>
                    <span class="primary">${{selectedProperty['median-income'] | formatNumber}}</span>
                </el-col>
            </el-row>
            <br><br>
            <h4>Current Disaster Declarations</h4>
            <p v-if="currentDDs.length == 0">No declared disasters! :)</p>
            <div v-for="dd in currentDDs" :key="dd._id" class="dd dd-margin-bottom" :class="{'dr-state': !dd.countyfips, 'dr-county': dd.countyfips}">
                <el-tag v-if="!dd.countyfips" size="small" type="danger">Statewide</el-tag>&nbsp;
                <b>{{dd.title}}</b>
                <span style="float: right">
                    <el-tag size="small" type="danger">{{dd.incidentType}}</el-tag>&nbsp;
                    <el-tag size="small" effect="light" type="info">Disaster # {{dd.disasterNumber}}</el-tag>&nbsp;
                    <el-tag size="small" effect="dark" type="warning" v-if="dd.hmProgramDeclared == 1" title="hmProgramDeclared">hm</el-tag>&nbsp;
                    <el-tag size="small" effect="dark" type="danger" v-if="dd.ihProgramDeclared == 1" title="ihProgramDeclared">ih</el-tag>&nbsp;
                    <el-tag size="small" effect="dark" type="success" v-if="dd.iaProgramDeclared == 1" title="iaProgramDeclared">ia</el-tag>&nbsp;
                    <el-tag size="small" effect="dark" type="" v-if="dd.paProgramDeclared == 1" title="paProgramDeclared">pa</el-tag>&nbsp;
                </span>
                <br>
                <span style="opacity: 0.6; font-size: 85%;">
                    <time>Declared: {{new Date(dd.declarationDate).toLocaleDateString()}}</time>
                    &nbsp;&bull;&nbsp;
                    <time>Incident Begin: {{new Date(dd.incidentBeginDate).toLocaleDateString()}}</time>
                </span>
            </div>
            <br>
            <div v-if="currentDDs.length > 0" style="background-color: white; padding: 20px; border: 2px solid #ddd;">
                <p>TODO - show which EDA grant opportunity might be available under this county.</p>
                <h5>2018 Disaster Supplemental Potential Eligibility</h5>
                <p>2017 Disasters - a project located in or serving one or more communities or regions impacted by Hurricanes Harvey, 
                Irma, Maria, or wildfires, or other major Presidentially-declared natural disasters occurring in calendar year 2017.</p>  
                <h5>2019 Disaster Supplemental Potential Eligibility</h5>
                <p>2018 Disasters - a proposed project located in or serving one or more communities or regions impacted by major 
                    Presidentially-declared natural disasters in calendar year 2018 as a result of Hurricanes Florence, Michael, and Lane, 
                    Typhoons Yutu and Mangkhut, and wildfires, volcanic eruptions, earthquakes, and other natural disasters.</p>
                <p>2019 Disasters - only areas impacted by major Presidentially-declared disasters in calendar year 2019 involving tornadoes 
                    or floods.  This includes incident types where floods or tornadoes are part of the descriptive field (i.e. “SEVERE STORMS, 
                    STRAIGHT-LINE WINDS, TORNADOES, FLOODS”).</p>  

            </div>
            <br>
        </div>
    </div>

    <div v-if="edaEvents && edaEvents.state && edaEvents.county">
        <div class="page">
            <br>
            <h3>Disaster / EDA History</h3>
            <p>This county has had the following disasters declared and EDA grants awarded in the past</p>

            <div v-for="event in history" :key="event._id" class="history">
                <div class="eventdetail">
                    <span class="event-date">{{event.date.toLocaleDateString()}}</span>
                    <div v-if="event.type == 'dr'" class="dd" :class="{'dr-state': !event.countyfips, 'dr-county': event.countyfips}">
                        <div style="float: left; width: 40px; font-size: 200%; position: relative; top: 0px; padding-left: 3px;">
                            <i class="el-icon-warning"/>
                        </div>
                        <div style="margin-left: 50px">
                            <el-tag v-if="!event.countyfips" size="small" type="danger">Statewide</el-tag>
                            {{event.title}}&nbsp;
                            <span style="float: right;">
                                <el-tag size="small" type="danger">{{event.incidentType}}</el-tag>&nbsp;
                                <el-tag size="small" effect="light" type="info">Disaster # {{event.disasterNumber}}</el-tag>&nbsp;
                                <el-tag size="small" effect="dark" type="warning" v-if="event.hmProgramDeclared == 1" title="hmProgramDeclared">hm</el-tag>&nbsp;
                                <el-tag size="small" effect="dark" type="danger" v-if="event.ihProgramDeclared == 1" title="ihProgramDeclared">ih</el-tag>&nbsp;
                                <el-tag size="small" effect="dark" type="success" v-if="event.iaProgramDeclared == 1" title="iaProgramDeclared">ia</el-tag>&nbsp;
                                <el-tag size="small" effect="dark" type="" v-if="event.paProgramDeclared == 1" title="paProgramDeclared">pa</el-tag>&nbsp;
                            </span>
                            <br>
                            <span style="opacity: 0.6; font-size: 85%;">
                                <!--Declared: <time>{{new Date(event.declarationDate).toLocaleDateString()}}</time>&nbsp;
                                &bull;-->
                                Incident <time>{{new Date(event.incidentBeginDate).toLocaleDateString()}}</time>
                                - <time>{{new Date(event.incidentEndDate).toLocaleDateString()}}</time>
                            </span>
                        </div>
                    </div>
                    <div v-else-if="event.type == 'eda2018'" class="eda2018" :class="{'eda2018-state': event.subtype == 'state', 'eda2018-county': event.subtype == 'county'}">

                        <div style="float: right; text-align: right;">
                            <p>
                                <el-tag size="small" effect="dark" type="success">fain: {{event.fain}}</el-tag>
                            </p>
                            <!--
                            <div style="width: 150px; float: right;">
                                <b>Awared Date:</b><br>
                                <time>{{new Date(event.grant_award_date).toLocaleDateString()}}</time>&nbsp;
                            </div>
                            -->
                            <div>
                                <br>
                                <b>Award:</b><br>
                                <span class="primary" style="color: #67c23a">${{event.award | formatNumber}}</span>
                            </div>
                        </div>
                        <b>
                            <i class="el-icon-money"/>&nbsp;
                            <span v-if="event.subtype == 'state'">EDA 2018 Statewide Award</span>
                            <span v-if="event.subtype == 'county'">EDA 2018 County Award</span>
                        </b>
                        <br>
                        Regional Office: {{event.eda_regional_office}}<br>

                        <br>
                        <b>Grantee:</b> <!--{{event.grantee}},-->{{event.grantee_name}},
                        {{event.grantee_city}}, {{event.grantee_state}}<br>
                    
                        <br>

                        <b>Purpose:</b> {{event.grant_purpose}} 
                        <span style="font-size: 85%">(Project Funding: ${{event.total_project_funding | formatNumber}})</span>
                    </div>
                    <div v-else>
                        {{event}}
                    </div>
                </div>
                <div class="connecter"/>
            </div>
            <br>
            <br>
    
        </div>
    </div>

    <div v-if="bvi.length > 0" style="background-color: #eee">
        <div class="page">
            <br>
            <h3>Business Vulnerability</h3>
            <p>
                <b>Business Vulnerability Index (BVI)</b> is a percentage of businesses in a county
                that are believed to be <i>vulnerable</i> to various natural disasters.
            </p>
            <p>
                To calculate the BVI, we isolated businesses by NAICS[1] code from the U.S. Census’ most recent County Business Patterns based on their vulnerability to a disaster.
                Businesses that were identified to be especially vulnerable to a disaster are those which are dependent on supply chains,
                have a high reliance on public utilities like water and electricity, or have a large infrastructure footprint and low infrastructure mobility.
            </p>

            <Plotly :data="bviEstData" :layout="bviEstLayout" :display-mode-bar="false"></Plotly>
            <br>
            <Plotly :data="bviEmpData" :layout="bviEmpLayout" :display-mode-bar="false"></Plotly>
            <br>
        </div>
    </div>

    <div v-if="stormEvents && countyDetail">
        <div class="page">
            <br>
            <h3>Natural Events Frequencies</h3>
            <p>
                This section shows the number of various natural events recorded by NOAA since 1950s.
            </p>
            <p>
                You can see how this county compares to other counties in terms of number of similar natural events.
                Higher event counts means more frequent events (bad)
            </p>
            <div v-for="(count, storm) in countyDetail.storm_counts" :key="storm">
                <!--<h3 style="margin: 10px 20px;">{{storm}}</h3>-->
                <el-collapse v-if="count > 5">
                    <el-collapse-item name="1">  
                        <template slot="title">
                            <span style="opacity: 0.8; padding-left: 20px">{{storm}}</span> <i class="el-icon-caret-right"/> <b>{{count}}</b>
                        </template>
                        <el-table
                        :data="stormEvents[storm]"
                        style="width: 100%">

                        <el-table-column fixed width="150"
                            prop="date"
                            label="Date">
                        </el-table-column>
                        
                        <el-table-column label="Damage ($)">
                            <el-table-column width="80"
                                prop="damage_property"
                                label="Property">
                            </el-table-column>
                            <el-table-column width="80"
                                prop="crop_property"
                                label="Crop">
                            </el-table-column>
                        </el-table-column>

                        <el-table-column width="80"
                            prop="deaths"
                            label="Death">
                        </el-table-column>

                        <el-table-column v-if="storm == 'Tornado'" label="Tornado">
                            <el-table-column width="80"
                                prop="tor_f_scale"
                                label="F">
                            </el-table-column>
                            <el-table-column width="80"
                                prop="tor_length"
                                label="Length">
                            </el-table-column>
                            <el-table-column width="80"
                                prop="tor_width"
                                label="Width">
                            </el-table-column>
                            <el-table-column width="80"
                                prop="tor_other_wfo"
                                label="wfo">
                            </el-table-column>

                        </el-table-column>

                        <el-table-column width="500"
                            prop="event_narrative"
                            label="Description">
                        </el-table-column>
                        </el-table>
                    </el-collapse-item>
                </el-collapse>

                <Histogram v-if="histograms[storm]" ylabel="# of Counties" xlabel="Event Counts" :value="count" :histogram="histograms[storm]"/>
            </div>
            <br>
            <!--TODO - if there are no histogram info, show that we don't have the info-->
            <br>
        </div>
    </div>

    <div class="page" v-if="cutterMeasures && countyDetail">
       
        <h3>Disaster Resilience</h3>
        <p style="margin: 20px;">TODO Describe what resilience means, and how it's computed.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

        <el-collapse>
            <el-collapse-item v-for="incode in Object.keys(indicators)" :key="incode" :title="indicators[incode].name" style="padding: 10px;">
                <template slot="title">
                    <span style="float: left; min-width: 300px; position: relative; top: -5px; font-size: 125%;">{{indicators[incode].name}}</span>
                    <BarGraph style="margin-right: 30px;" :value="computeIndicator(incode)" :min="0" :max="1" :height="20"/>
                </template>
                <p class="help">TODO Describe what {{indicators[incode].name}} means and purpose of this indicator. 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                </p>

                <el-collapse accordion>
                    <el-collapse-item v-for="source in indicators[incode].sources" :key="source.id">
                        <template slot="title">
                            <span style="float: left; min-width: 325px">{{source.name}}</span>
                            <BarGraph style="margin-right: 30px;" :value="cutterMeasures[source.id]" :min="0" :max="1" />
                        </template>
                        <p>TODO - Describe what this measure means. What it means to be 0, what it means to be 1, and how it's computed, 
                            the impact of this value, and what investiment would improve it?</p>
                    </el-collapse-item>
                </el-collapse>
               
            </el-collapse-item>

        </el-collapse>
    </div>

    <br>
    <br>
    <br>   
    <br>    
    <br>  
    <!--
    <div style="background-color: gray">
        <div class="page">
            <h3>Debug</h3>
            <el-collapse>
                <el-collapse-item title="Debug / countyDetail">
                    <pre>{{countyDetail}}</pre>
                </el-collapse-item>
            </el-collapse>
            <el-collapse>
                <el-collapse-item title="Debug / edaEvents">
                    <pre>{{edaEvents}}</pre>
                </el-collapse-item>
            </el-collapse>
            <el-collapse>
                <el-collapse-item title="Debug / stormEvents">
                    <pre>{{stormEvents}}</pre>
                </el-collapse-item>
            </el-collapse>
            <el-collapse>
                <el-collapse-item title="Debug / currentDDs">
                    <pre>{{currentDDs}}</pre>
                </el-collapse-item>
            </el-collapse>
            <el-collapse>
                <el-collapse-item title="Debug / history">
                    <pre>{{history}}</pre>
                </el-collapse-item>
            </el-collapse>
        </div>
        <br>
        <br>
    </div>
    -->
    <footer style="background-color: #333; color: #999; padding: 50px 0px; padding-top: 50px; padding-bottom: 100px;">
        <div class="page">
            <p style="line-height: 200%;">
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
import CountySelecter from '@/components/CountySelecter.vue'
import Histogram from '@/components/Histogram.vue'
import BarGraph from '@/components/BarGraph.vue'

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

import { Plotly } from 'vue-plotly';

import cutterIndicators from '@/assets/cutter_indicators.json'

const layers = {
    "fire": "#f00",
    "earthquake": "#0f0",
    "hurricane": "#00c",
    "typhoon": "#00c",
    "other": "#000",
    "severe storm": "#06f"
};

mapboxgl.accessToken = "pk.eyJ1Ijoic29pY2hpaCIsImEiOiJjazVqdnBsM2cwN242M2psdjAwZXhhaTFuIn0.o3koWlzx1Tup8CJ1B_KaEA";

@Component({
  components: { CountySelecter, BarGraph, Histogram, Plotly},
})
export default class County extends Vue {

    map = null;
    popup = null;
    //overlay;
    selectedFip = null;
    searchFip = null;
    selectedProperty = null;

    //county data
    countyDetail = null; 
    stormEvents = null;

    edaEvents = null;
    history = [];
    histograms = {};

    indicators = cutterIndicators;
    cutterMeasures = null;

    currentDDs = [];
    //pastDDs = [];

    bvi = [];
    bviEstData = null;
    bviEmpData = null;
    bviEstLayout = null;
    bviEmpLayout = null;

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
        //console.log(to);
        this.selectedFip = to.replace(".", "");

        //TODO fit mapt to selected fip
        //            const counties = this.map.queryRenderedFeatures({layers: ['counties']});
        /*
        map.fitBounds([
        [32.958984, -5.353521],
        [43.50585, 5.615985]
        ]);
        */
    }

    @Watch('selectedFip')
    onFipChange(to) {
        if(!to) {
            //TODO clear data?
            return;
        }

        //console.log("selected", to);

        let fip = to.toString(); //mapbox map's fip is sometimes number
        const statefip = fip.substring(0,2);
        const countyfip = fip.substring(2);
        
        fip = statefip+"."+countyfip;

        //console.log("loading county");
        this.countyDetail = null;

        this.axios.get("https://dev1.soichi.us/api/apred/county/"+fip).then(res=>{
            this.countyDetail = res.data;
            if(!this.countyDetail) {
                //console.error("failed load county data");
                return;
            }
            this.cutterMeasures = {};
            this.countyDetail.cutter_measures.forEach(m=>{
                this.cutterMeasures[m.source] = m.value;
            });

            this.$nextTick(()=>{
                const top = this.$refs['county-detail'].offsetTop-50;
                //console.log(top);
                window.scrollTo(0, top);
            });
        });

        this.axios.get("https://dev1.soichi.us/api/apred/storm/query/"+fip).then(res=>{
            this.stormEvents = {};
            if(res.data.length == 0) {
                this.stormEvents = null;
                return;
            }
            res.data.forEach(rec=>{
                if(!this.stormEvents[rec.event_type]) this.stormEvents[rec.event_type] = [];
                rec.narrative = rec.event_narrative + " "+rec.episode_narrative;
                rec.date = new Date(rec.begin_date_time);
                //rec.date = rec.begin_date_time.substring(0, 10);
                rec.deaths = rec.deaths_direct + rec.deaths_indirect;
                this.stormEvents[rec.event_type].push(rec);
            });
            //console.dir(this.stormEvents);
        });
    
        this.edaEvents = {};
        this.history = [];
        const pStateEda = this.axios.get("https://dev1.soichi.us/api/apred/eda2018/"+statefip).then(res=>{
            this.edaEvents.state = [];
            res.data.forEach(rec=>{
                rec.grantee = rec.grantee_name+", "+rec.grantee_city+", "+rec.grantee_state;
                //rec.date = rec.grant_award_date.toLocaleString();
                rec.date = new Date(rec.grant_award_date);
                this.edaEvents.state.push(rec);
                rec.type = "eda2018";
                rec.subtype = "state";
                this.history.push(rec);
            });
        });

        const pCountyEda = this.axios.get("https://dev1.soichi.us/api/apred/eda2018/"+statefip+"/"+countyfip).then(res=>{
            this.edaEvents.county = res.data;
            res.data.forEach(rec=>{
                rec.type = "eda2018";
                rec.subtype = "county";
                rec.date = new Date(rec.grant_award_date);
                this.history.push(rec);
            });
        });
        
        this.currentDDs = [];
        const pDD = this.axios.get("https://dev1.soichi.us/api/apred/dd/"+statefip+"/"+countyfip).then(res=>{
            //console.dir(res.data);
            res.data.forEach(rec=>{
                if(rec.incidentEndDate == "") this.currentDDs.push(rec);
                else {
                    rec.type = "dr";
                    rec.date = new Date(rec.declarationDate);
                    this.history.push(rec);
                }
            })
        }); 

        this.bvi = [];
        this.axios.get("https://dev1.soichi.us/api/apred/bvi/"+statefip+"/"+countyfip).then(res=>{
            this.bvi = res.data;
            this.bviEstLayout = {
                margin: {
                    l: 80,
                    //r: 20,
                    //b: 30,
                    //t: 20,
                    //pad: 10,
                },
                'paper_bgcolor': '#0000',
                'plot_bgcolor': '#fff',
                height: 400,
                title: 'Business Establishments',
                xaxis: {tickfont: {
                    size: 14,
                    color: 'rgb(107, 107, 107)'
                }},
                yaxis: {
                    //title: 'Establishments',
                    titlefont: {
                        size: 16,
                        color: 'rgb(107, 107, 107)'
                    },
                    tickfont: {
                        size: 13,
                        color: 'rgb(107, 107, 107)'
                    }
                },
                legend: {
                    //x: 0,
                    //y: 1.0,
                    bgcolor: 'rgba(255, 255, 255, 0)',
                    bordercolor: 'rgba(255, 255, 255, 0)'
                },
                barmode: 'group',
                //bargap: 0.15,
                bargroupgap: 0.1
            }

            this.bviEmpLayout = {
                margin: {
                    l: 80,
                    //r: 20,
                    //b: 30,
                    //t: 20,
                    //pad: 10,
                },
                'paper_bgcolor': '#0000',
                'plot_bgcolor': '#fff',
                height: 400,
                title: 'Employees',
                xaxis: {tickfont: {
                    size: 14,
                    color: 'rgb(107, 107, 107)'
                }},
                yaxis: {
                    //title: 'Establishments',
                    titlefont: {
                        size: 16,
                        color: 'rgb(107, 107, 107)'
                    },
                    tickfont: {
                        size: 13,
                        color: 'rgb(107, 107, 107)'
                    }
                },
                legend: {
                    //x: 0,
                    //y: 1.0,
                    bgcolor: 'rgba(255, 255, 255, 0)',
                    bordercolor: 'rgba(255, 255, 255, 0)'
                },
                barmode: 'group',
                //bargap: 0.15,
                bargroupgap: 0.1
            }

            const x = [];
            const bviBt = []; //establishment total
            const bviBtV = []; //vulnerable establishment
            const bviEt = []; //employee total
            const bviEtV = []; //vulnerable total
            res.data.forEach(rec=>{
                x.push(rec.year);
                bviBt.push(rec.estab_total);
                bviBtV.push(rec.estab_vuln_total);
                bviEt.push(rec.mm_employees);
                bviEtV.push(rec.emp_vuln_total);
            })
            const traceBt = {
                x,y: bviBt,
                name: 'Total',
                marker: {color: 'rgb(100, 100, 100)'},
                type: 'bar'
            }
            const traceBtV = {
                x, y: bviBtV,
                name: 'Vulnerable',
                marker: {color: '#f56c6c'},
                type: 'bar'
            }
            this.bviEstData = [traceBt, traceBtV];

            const traceEt = {
                x,y: bviEt,
                name: 'Total',
                marker: {color: 'rgb(100, 100, 100)'},
                type: 'bar'
            }
            const traceEtV = {
                x, y: bviEtV,
                name: 'Vulnerable',
                marker: {color: '#f56c6c'},
                type: 'bar'
            }
            this.bviEmpData = [traceEt, traceEtV];
        });        

        Promise.all([pStateEda, pCountyEda, pDD]).then(()=>{
            //process data.
            //sort history by date.
            this.history.sort((a,b)=>{
                return (a.date - b.date);
            });
            //console.dir(this.history);
        })

    }

    mounted() {

        this.axios.get("https://dev1.soichi.us/api/apred/storm/histogram").then(res=>{
            res.data.forEach(rec =>{
                this.histograms[rec.storm] = rec.histogram;
            });
            //console.dir(this.histograms);
        })

        this.map = new mapboxgl.Map({
            container: 'map', // HTML container id
            //style: 'mapbox://styles/mapbox/light-v10', // style URL
            style: 'mapbox://styles/mapbox/streets-v11',
            //style: 'mapbox://styles/mapbox/light-v10',
            center: [-110, 44], // starting position as [lng, lat]
            minZoom: 2,
            pitch: 30, // pitch in degrees
            bearing: -10, // bearing in degrees
            zoom: 2,
        });

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
            }, 'settlement-label'); 

            for(const t in layers) {
                const color = layers[t];

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
                    'filter': ['in', 'FIPS', '']   
                }, 'settlement-label');

                this.map.addLayer({
                    'id': 'state_disaster_'+t,
                    'type': 'fill',
                    'source': 'counties',
                    'source-layer': 'original',
                    'paint': {
                        //'fill-outline-color': '#f80',
                        'fill-color': color,
                        'fill-opacity': 0.4
                    },
                    'filter': ['in', 'FIPS', '']   
                }, 'settlement-label');

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
            }, 'settlement-label');

            this.map.on('click', e=>{
                // set bbox as 5px reactangle area around clicked point

                const features = this.map.queryRenderedFeatures(e.point, {
                    layers: ['counties']
                });

                if(features.length == 1) {
                    this.selectedFip = features[0].properties.FIPS;
                    this.selectedProperty = features[0].properties;
                    const filter = ['in', 'FIPS', this.selectedFip];
                    this.map.setFilter('counties-highlighted', filter);

                    /*
                    this.$nextTick(()=>{
                        location.hash = "#county-detail"
                    })
                    */
                }
            });

            this.map.on('mousemove', 'counties', (e)=> {
                // Change the cursor style as a UI indicator.
                this.map.getCanvas().style.cursor = 'pointer';
                
                // Single out the first found feature.
                const feature = e.features[0];
                
                const filter = ['in', 'FIPS', feature.properties.FIPS];
                if(this.selectedFip) filter.push(this.selectedFip);
                //console.dir(filter);
                this.map.setFilter('counties-highlighted', filter);
                
                // Display a popup with the name of the county
                this.popup
                    .setLngLat(e.lngLat)
                    .setText(feature.properties.COUNTY)
                    .addTo(this.map);
            });

            this.map.on('mouseleave', 'counties', ()=>{
                //this.map.getCanvas().style.cursor = '';
                
                this.popup.remove();
                const filter = ['in', 'FIPS'];
                if(this.selectedFip) filter.push(this.selectedFip);
                this.map.setFilter('counties-highlighted', filter);
                //this.overlay.style.display = 'none';
            });
        })

        this.map.on('idle',()=>{
            if(!this.currentdd) {
                this.loadCurrentdd();
            }
        });
    }

    currentdd = false;

    loadCurrentdd() {
        this.currentdd = true;
        //console.log("loading currentdd");

        this.axios.get("https://dev1.soichi.us/api/apred/currentdd").then(res=>{

//key by incidenType, and storing {county: [], state: []}
            const fips = {};
            const counties = this.map.queryRenderedFeatures({layers: ['counties']});

            res.data.forEach(rec=>{
                let type = rec.incidentType.toLowerCase();
                if(type.includes('(')) type = type.substring(0, type.indexOf('('));
                if(!fips[type]) fips[type] = { county: [], state: [] };

                if(rec.countyfips) {
                    //county declerations
                    let fip = rec.statefips+rec.countyfips;
                    if(!fips[type].county.includes(fip)) fips[type].county.push(fip);
                    
                    //bug in geojson source? some counties are listed as number (so I have to filter as number too)
                    fip = parseInt(fip);
                    if(!fips[type].county.includes(fip)) fips[type].county.push(fip);
                } else {
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

            //console.dir(fips);
            for(const type in fips) {
                let layerType = type;
                if(!layers[type]) {
                    //console.error("unknown incident type", type);
                    layerType = "other";
                }
                this.map.setFilter('county_disaster_'+layerType, ['in', 'FIPS', ...fips[type].county]);
                this.map.setFilter('state_disaster_'+layerType, ['in', 'FIPS', ...fips[type].state]);
                //console.log(fips[type].state);
            }
        })
    }

    computeIndicator(incode) {
        let deno = 0;
        const sum = this.indicators[incode].sources.reduce((sum,source)=>{
            if(!this.cutterMeasures[source.id]) return sum;
            deno++;
            return sum+this.cutterMeasures[source.id];
        }, 0);
        return sum / deno;
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
    width: 100%;
    height: 500px;
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
.dd {
    background-color: white;
    box-shadow: 1px 1px 2px #0001;
    padding: 10px;
    border-radius: 4px;

    &.dr-county {
        border-left: 3px solid gray;
        color: gray;
    }
    &.dr-state {
        border-left: 3px solid #f56c6c;
        color: #f56c6c;
    }
    &.dd-margin-bottom {
        margin-bottom: 5px;
    }
}
.eda2018 {
    padding: 10px;
    border-radius: 10px;    

    &.eda2018-state {
        background-color: #e1f3d8;
    }
    &.eda2018-county {
        background-color: #e9e9eb;
    }
}

.history {
    .event-date {
        color: gray;
        font-size: 95%;
        padding: 5px 0;
        display: inline-block;
    }
    .connecter {
        background-color: #d9d9d9;
        box-shadow: 0 0 2px #0003;
        height: 20px;
        width: 4px;
        margin-left: 30px;
    }
}
</style>

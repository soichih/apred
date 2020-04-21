<template>
<div class="countydetail" v-if="detail">
    <div class="header">
        <div class="page">
            <h3 style="position: relative;">
                <el-button type="primary" circle icon="el-icon-back" @click="goback()" class="back-button"/>
                &nbsp;
                &nbsp;
                <span class="important"><b>{{detail.county}}</b> county,</span>
                {{detail.state}}
            </h3>
        </div>
    </div>

    <div style="background-color: #eee;" id="header">
    <div class="page">
        <el-row>
            <el-col :span="11">
                <div id="statemap"/>
            </el-col>
            <el-col :span="8" class="border-left demo">
                <p>
                    <span class="sub-heading">Population</span><br>
                    <span class="primary" v-if="detail.demo"> {{detail.population | formatNumber}}</span>
                    <span v-else style="padding: 10px 0; opacity: 0.5;">No information</span>
                </p>

                <vue-bar-graph v-if="detail.demo"
                    :points="populationPoints(detail.demo)"
                    :width="200"
                    :height="90"
                    :show-x-axis="true" 
                    :show-values="true"
                    bar-color="#999"
                    text-color="#666"
                    text-alt-color="white"
                />
            </el-col>
            <el-col :span="5" class="border-left">
                <p class="sub-heading">
                    Disaster Resilience
                    <i @click="goto('cutter')" class="el-icon-warning-outline"/>
                </p>
                <Plotly :data="[drSpyderData]" :layout="drSpyderLayout" :display-mode-bar="false"/>
            </el-col>
        </el-row>
    </div>
    </div>

    <div class="page navigator">
        <div style="position: absolute; right: -250px; width: 200px; margin: 20px;">
            <el-button circle icon="el-icon-arrow-up" @click="goto('header')"/>
            <h5><a href="javascript:void(0);" @click="goto('disaster')">Recent Disaster Declarations</a></h5>
            <h5 v-if="detail.bvis"><a href="javascript:void(0);" @click="goto('bvi')">Business Vulnerability</a></h5>
            <h5><a href="javascript:void(0);" @click="goto('cutter')">Disaster Resilience</a></h5>
            <h5><a href="javascript:void(0);" @click="goto('storms')">Storm History</a></h5>
        </div>
    </div>

    <div class="page" id="disaster">
        <h3>Recent Disaster Declarations / EDA Awards</h3>
        <p>EDIT ME. The following disasters has been declared and EDA grants awarded in the past.</p>

        <p v-if="recentHistory.length == 0" style="opacity: 0.8;">No disaster declared since 2017</p>
        <div v-for="(event, idx) in recentHistory" :key="event._id" class="history">
            <Event :event="event" :layers="layers">
                <div class="connecter" v-if="idx < recentHistory.length">
                    <Eligibility2018 v-if="is2018Eligible(event)"/>
                    <Eligibility2019 v-if="is2019Eligible(event)"/>
                </div>
            </Event>
        </div>

        <div v-if="!showPastHistory" style="border-top: 2px solid #f3f3f3;">
            <br>
            <el-button round @click="showPastHistory = !showPastHistory">
                <i class="el-icon-caret-right"/> Show Past Disasters ({{pastHistory.length}})
            </el-button>
        </div>
        <div v-if="showPastHistory">
            <Event :event="event" :layers="layers" v-for="event in pastHistory" :key="event._id" class="history"/>
        </div>
        <br>
        <br>
    </div>

    <div style="background-color: #eee" v-if="detail.bvis" id="bvi">
    <div class="page">
        <br>
        <h3>Business Vulnerability</h3>
        <p>
            <b>Business Vulnerability Index (BVI)</b> is a percentage of businesses in a county
            that are believed to be <i>vulnerable</i> to various natural disasters.
        </p>
        <p>
            To calculate the BVI, we isolated businesses by NAICS[1] code from the U.S. Census’ most recent County Business Patterns (part of Census: https://www.census.gov/econ/overview/mu0800.html)
            based on their vulnerability to natural disaster (farmers, transportation companies, etc..)
            Businesses that were identified to be especially vulnerable to a disaster are those which are dependent on supply chains,
            have a high reliance on public utilities like water and electricity, or have a large infrastructure footprint and low infrastructure mobility.
        </p>

        <el-row>
            <el-col :span="12">
                <Plotly :data="bviEstData" :layout="bviEstLayout" :display-mode-bar="false"></Plotly>
            </el-col>
            <el-col :span="12">
                <Plotly :data="bviEmpData" :layout="bviEmpLayout" :display-mode-bar="false"></Plotly>
            </el-col>
        </el-row>
    </div>
    </div>

    <div class="page" id="cutter">
        <h3>Disaster Resilience</h3>
        <p style="margin: 20px 0;">
            TODO Describe what resilience means, and how it's computed.

            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

            The score you see is the average of all sub-indecies for this indicators.
        </p>
    
        <p style="font-size: 85%; opacity: 0.8; margin-left: 355px; padding: 0 10px;">
            <span>
                <i class="el-icon-arrow-left"/> Low Resilience
            </span>
            <span style="float: right; margin-right: 50px;">
                High Resilience
                <i class="el-icon-arrow-right"/>
            </span>
        </p>

        <div v-for="(indicator, incode) in detail.cutter" :key="incode" :title="indicator.name" style="padding: 10px; clear: both;">
            <div class="indicator-head">
                <div style="float: left; width: 325px;">
                    {{indicator.name}} <el-tag type="info" size="small">{{incode}}</el-tag>
                </div>
                <div style="position: relative; margin-left: 355px; margin-right: 50px;">
                    <span style="position: absolute; left: -100px; font-size: 85%;">This County</span>
                    <BarGraph :value="indicator.aggregate.county" :min="0" :max="1" :height="15"/>

                    <span style="position: absolute; left: -100px; font-size: 85%;">This State</span>
                    <BarGraph :value="indicator.aggregate.state" :min="0" :max="1" :height="15" style="opacity: 0.7"/>

                    <span style="position: absolute; left: -100px; font-size: 85%;">US Average</span>
                    <BarGraph :value="indicator.aggregate.us" :min="0" :max="1" :height="15" style="opacity: 0.4;"/>
                </div>
                <br> 

                <p style="float: right; margin-right: 50px">
                    <el-button round @click="toggleIndicator(incode)" plain size="small" style="width: 150px">
                        <span v-if="!shownIndicators.includes(incode)">
                            <i class="el-icon-caret-right"/> Show Sub-Indices
                        </span>
                        <span v-else>
                            <i class="el-icon-caret-bottom"/> Hide Sub-Indices
                        </span>
                    </el-button>
                </p>
                <IndicatorInfo :id="incode" style="margin-right: 175px; opacity: 0.8; font-size: 90%"/>
            </div>
            <div class="indicator-detail" v-if="shownIndicators.includes(incode)">
                <el-collapse>
                    <div v-for="source in detail.cutter[incode].sources" :key="source.id">
                        <el-collapse-item v-if="source.us">
                            <template slot="title">
                                <i class="el-icon-caret-right" style="padding-left: 10px; opacity: 0.5;"/>
                                <span style="float: left; min-width: 330px">{{source.name}}</span>
                                <BarGraph style="margin-right: 30px; width: 100%;" :value="source.county" :min="0" :max="1" />
                            </template>

                            <MeasureInfo :id="source.id" style="padding: 0 10px;"/>

                            <div style="padding: 10px; padding-right: 50px; background-color: #f7f7f7;">
                                <span style="float: left; width: 265px; text-align: right; padding-right: 60px;">State Average</span>
                                <BarGraph style="margin-left: 343px;" :value="source.states" :min="0" :max="1" color="#8e8e8e"/>
                                <br>
                                <span style="float: left; width: 265px; text-align: right; padding-right: 60px;">US Average</span>
                                <BarGraph style="margin-left: 343px;" :value="source.us" :min="0" :max="1" color="#8e8e8e"/>
                            </div>
                        </el-collapse-item>
                    </div>
                </el-collapse>
            </div>
        </div>
    </div>

    <div class="page" id="storms">
        <h3>Storm History</h3>
        <p>This graph shows the counts of storm event published by NOAA since 1965.</p>
        
        <Plotly :data="stormData" :layout="stormLayout" :display-mode-bar="true"></Plotly>
    </div>
    
    <Footer/>
</div>
</template>

<script>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Histogram from '@/components/Histogram.vue'
import BarGraph from '@/components/BarGraph.vue'
import Event from '@/components/Event.vue'
import IndicatorInfo from '@/components/IndicatorInfo.vue'
import MeasureInfo from '@/components/MeasureInfo.vue'
import Footer from '@/components/Footer.vue'

import Eligibility2018 from '@/components/Eligibility2018.vue'
import Eligibility2019 from '@/components/Eligibility2019.vue'

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

import { Plotly } from 'vue-plotly'
import VueBarGraph from 'vue-bar-graph'

@Component({
    components: { 
        BarGraph, 
        Histogram, 
        Plotly, 
        Event, 
        Eligibility2018, 
        Eligibility2019,
        VueBarGraph,
        IndicatorInfo,
        MeasureInfo,
        Footer,
    },
})

export default class CountyDetail extends Vue {

    @Prop() detail;
    @Prop() geojson;
    @Prop() layers;

    popup;
    statemap;

    history = [];

    bvi = [];
    bviEstData = null;
    bviEmpData = null;
    bviEstLayout = null;
    bviEmpLayout = null;

    stormLayout = null;
    stormData = null;

    showPastHistory = false;
    shownIndicators = [];

    /*
    layers = {
        "fire": "#f00",
        //"earthquake": "#0f0",
        "hurricane": "#84a",
        //"snow": "#fff",
        "tornado": "#c60",
        //"typhoon": "#00c",
        "severe storm": "#fa0",
        "flood": "#06f",

        "other": "#f0f", //volcano, mud/landslide, snow, "coastal storm", typhoon, earthquake, snow
    };
    */

    drSpyderData = {
      type: 'scatterpolar',
      r: [],
      theta: [],
      fill: 'toself'
    }

    drSpyderLayout = {
      polar: {
        radialaxis: {
          visible: false,
          range: [0, 1]
        },
        bgcolor: '#fff9'
      },
        //showlegend: false,
        'paper_bgcolor': '#0000',
        //'plot_bgcolor': '#ffffff99',
        width: 160,
        height: 110,
        margin: {
            l: 10,
            r: 10,
            b: 20,
            t: 20,
        },
    }

    @Watch('detail')
    onDetailChange() {
        this.update();
        this.showPastHistory = false;
    }

    toggleIndicator(incode) {
        const pos = this.shownIndicators.indexOf(incode);
        if(~pos) this.shownIndicators.splice(pos, 1);
        else this.shownIndicators.push(incode);
    }  
    update() {
        this.processSpyder();
        this.processHistory();
        this.processBVI();
        this.processStorms();
        this.processMap();
    }

    goto(id) {
        const e = document.getElementById(id);
        e.scrollIntoView();
    }

    processSpyder() {
        //console.log("processing detail");

        this.drSpyderData.r = [];
        this.drSpyderData.theta = [];

        //Object.keys(this.detail.cutter).forEach(incode=>{
        for(const incode in this.detail.cutter) {
            const value = this.detail.cutter[incode].aggregate.county;
            this.drSpyderData.r.push(value);
            this.drSpyderData.theta.push(incode);
        }

        //I need to add the first incode to *close* the loop
        this.drSpyderData.r.push(this.drSpyderData.r[0]);
        this.drSpyderData.theta.push(this.drSpyderData.theta[0]);
    }

    processHistory() {
        this.history = [];

        this.detail.eda2018.forEach(rec=>{
            rec.grantee = rec.grantee_name+", "+rec.grantee_city+", "+rec.grantee_state;
            rec.date = new Date(rec.grant_award_date);
            rec.type = "eda2018";
            this.history.push(rec);
        });
        
        this.detail.disasters.forEach(rec=>{
            rec.type = "dr";
            rec.date = new Date(rec.declarationDate);
            this.history.push(rec);
        }); 

        this.history.sort((a,b)=>{
            return (b.date - a.date);
        });
    }

    processBVI() {
        if(!this.detail.bvis) return;
        this.bviEstLayout = {
            margin: {
                l: 30,
                r: 30,
                t: 30,
                //b: 30,
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
                bordercolor: 'rgba(255, 255, 255, 0)',
                orientation: 'h',
            },
            //barmode: 'group',
            //bargroupgap: 0.1
        }

        this.bviEmpLayout = {
            margin: {
                l: 30,
                r: 30,
                t: 30,
                //b: 30,
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
                bordercolor: 'rgba(255, 255, 255, 0)',
                orientation: 'h',
            },
            //type: 'scatter',
            //mode: 'lines+markers',
            //barmode: 'group',
            //bargroupgap: 0.1
        }

        const x = [];
        const bviBt = []; //establishment total
        const bviBtV = []; //vulnerable establishment
        const bviEt = []; //employee total
        const bviEtV = []; //vulnerable total
        this.detail.bvis.forEach(rec=>{
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
        this.bviEstData = [traceBt, traceBtV ];

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
    }

    processStorms() {
        this.stormLayout = {
            margin: {
                l: 30,
                r: 30,
                t: 30,
                //b: 30,
                //pad: 10,
            },
            /*
            'paper_bgcolor': '#0000',
            'plot_bgcolor': '#fff',
            height: 400,
            title: 'Storm History',
            xaxis: {tickfont: {
                size: 14,
                color: 'rgb(107, 107, 107)'
            }},
            yaxis: {
                titlefont: {
                    size: 16,
                    color: 'rgb(107, 107, 107)'
                },
                tickfont: {
                    size: 13,
                    color: 'rgb(107, 107, 107)'
                }
            },
            */
            legend: {
                //x: 0,
                //y: 1.0,
                bgcolor: 'rgba(255, 255, 255, 0)',
                bordercolor: 'rgba(255, 255, 255, 0)',
                orientation: 'h',
            },
            //barmode: 'group',
            //bargroupgap: 0.1
        }

        this.stormData = [];
        for(const type in this.detail.storms) {
            const x = [];
            const y = [];
            for(const year in this.detail.storms[type]) {
                x.push(year);
                y.push(this.detail.storms[type][year]);
            }
            this.stormData.push({
                x,
                y,
                name: type,
                //marker: {color: 'rgb(100, 100, 100)'},
                type: 'bar'
            });
        }
    }

    initStateMap() {
        this.map = new mapboxgl.Map({container: 'statemap'});
        this.map.scrollZoom.disable();
        this.map.addSource('counties', { type: "geojson", data: this.geojson });

        //calculate mapbound
        const bounds = {};
        this.geojson.features.forEach(feature=>{
            if(feature.properties.statefips == this.detail.statefips) {
                feature.geometry.coordinates.forEach(coordinates=>{
                    coordinates.forEach(points=>{
                        if(feature.geometry.type == "Polygon") {
                            points = [points]; 
                        } else if(feature.geometry.type == "MultiPolygon") {
                            //nothing to do..
                        } else {
                            //console.error("unknown feature geometry type", feature.geometry.type);
                        }
                        points.forEach(point=>{
                            const longitude = point[0];
                            const latitude = point[1];
                            bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
                            bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
                            bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
                            bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
                        });
                    });
                });
            }
        });
        this.map.fitBounds([[bounds.xMin, bounds.yMin], [bounds.xMax, bounds.yMax]]);

        this.map.addLayer({
            "id": "counties",
            "type": "fill",
            "source": "counties",
            "paint": {
                "fill-color": "rgba(100,100,100,0.3)"
            },
            filter: ['==', 'statefips', this.detail.statefips], 
        });
        this.map.addLayer({
            "id": "selected-county",
            "type": "fill",
            "source": "counties",
            "paint": {
                "fill-color": "#409EFF",
                "fill-outline-color": "white",
            },
            filter: ['==', 'statefips', 'tbd'],
        });

        this.map.on('click', e=>{
            const features = this.map.queryRenderedFeatures(e.point, {
                layers: ['counties']
            });
            if(features.length > 0) {
                const fips = features[0].properties.statefips+features[0].properties.countyfips;
                this.$router.push('/county/'+fips);
            }
        });

        this.popup = new mapboxgl.Popup({
            closeButton: false,
            //offset: [0, -20],
        });

        this.map.on('mousemove', 'counties', (e)=> {
            this.map.getCanvas().style.cursor = 'pointer';
            const feature = e.features[0];
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
    }

    processMap() {
        this.map.setFilter('selected-county', ['all',
            ['==', 'statefips', this.detail.statefips],
            ['==', 'countyfips', this.detail.countyfips],
        ]);
    }

    mounted() {
        this.initStateMap();
        this.update();
    }

    populationPoints(demo) { 
        return [
            {label: '0-4', value: demo[0].value},
            {label: '5-17', value: demo[1].value},
            {label: '18-24', value: demo[2].value},
            {label: '25-44', value: demo[3].value},
            {label: '45-64', value: demo[4].value},
            {label: '>65', value: demo[5].value},
        ];
    }

    get recentHistory() {
        return this.history.filter(h=>(h.date >= new Date("2017-01-01")));
    }
    get pastHistory() {
        return this.history.filter(h=>(h.date < new Date("2017-01-01")));
    }

    goback() {
        this.$router.replace("/");
    }

    is2018Eligible(event) {
        const begin = new Date(event.incidentBeginDate);
        if( begin > new Date("2016-12-31") && begin < new Date("2018-01-01") ) {
            // ignore some incidentType 
            switch(event.incidentType) {
            case "Chemical":
            case "Human Cause":
            case "Terrorist":
            case "Toxic Substances":
                break;
            default:
                //all other are eligible
                return true;
            }

            return true;
        }
        return false;
    }

    is2019Eligible(event) {
        const begin = new Date(event.incidentBeginDate);
        if( begin > new Date("2017-12-31") && begin < new Date("2019-01-01") ) {
            // ignore some incidentType 
            switch(event.incidentType) {
            case "Chemical":
            case "Human Cause":
            case "Terrorist":
            case "Toxic Substances":
                break;
            default:
                //all other are eligible
                return true;
            }

        }

        if( begin > new Date("2018-12-31") && begin < new Date("2020-01-01") ) {
            //console.dir(event);
            switch(event.incidentType) {
            case "Severe Storm(s)":
            case "Tornado":
            case "Flood":
                return true;
            }

            // it also qualifies if incidentTitle includes those names
            if( event.title.toLowerCase().includes("tornado") ||
                event.title.toLowerCase().includes("flood") ||
                event.title.toLowerCase().includes("severe storms")) return true;
        }

        return false;
    }
}

</script>

<style lang="scss" scoped> 
p {
    margin-top: 0px;
    line-height: 170%;
    color: #666;
}
h2 {
    padding: 20px 0;
    color: #0006;
    text-transform: uppercase;
}

h3 {
    padding: 20px 0 0 0;
    color: #0006;
    text-transform: uppercase;
    font-size: 23px;
    font-weight: normal;
}

h4 {
    opacity: 0.7;
}

.sub-heading {
    opacity: 0.8;
    font-weight: bold;
    font-size: 90%;
    color: black;
    white-space: nowrap;
}
.primary {
    font-weight: bold;
    font-size: 175%;
}

.important, 
.primary {
    color: #409EFF;
}
.legend {
    position: absolute;
    display: block;
    z-index: 1;
    top: 120px;
    //width: 150px;
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
        width: 10px;
        height: 10px;   
        border-radius: 50%;
        background-color: #67c23a;
    }

    .legend-item {
        display: inline-block; 
        margin-right: 10px;
    }
}
.border-left {
    border-left: 1px solid #ddd;
    height: 200px;
    padding-left: 20px;
    padding-top: 10px;
}
@media only screen and (max-width: 700px) {
    .demo {
        display: none;
    }
}
</style>

<style lang="scss"> 
.countydetail {
    position: fixed;
    top: 120px;
    bottom: 0;
    z-index: 1;
    scroll-behavior: smooth;
    overflow: auto;
    left: 0;
    right: 0;
    background-color: white;
}
.el-collapse,
.el-collapse-item__header {
    border: none;
}
.header {
    position: fixed;
    top: 50px;
    width: 100%;
    background-color: white;
    z-index: 1;
    height: 70px;
    box-shadow: 0 0 3px #ddd;
}
.header h3 {
    margin: 0;
}
.header .back-button {
    position: relative;
    float: left;
    top: -10px;
    font-size: 100%;
    margin-right: 20px;
}
.navigator {
position: sticky; 
top: 10px;
}
@media only screen and (max-width: 1500px) {
    .navigator {
        display: none;
    }
}
#statemap {
    position: relative;
    width: 100%;
    height: 200px;
}
canvas:focus {
    outline: none;
}
.indicator-detail {
border-left: 3px solid #ddd;
clear: both;
}
</style>

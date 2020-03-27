<template>
<div>
    <!--
    <div class="page" style="position: relative;">
        <p style="opacity: 0.4; float: right; margin-top: 25px;">FEMA delared disasters since 2017</p>
        <h2 style="margin-bottom: 0px">Disaster Declarations</h2>
    </div>
    -->
    
    <div v-if="loading">
        <div class="page">
            <h3 style="font-size: 150%; padding: 30px 0; margin: 0px;">
                Loading..
            </h3>
        </div>
    </div>

    <div v-else>
        <div v-if="countyDetail" style="background-color: #eee; position: sticky; top: 50px; z-index: 1; box-shadow: 0 2px 2px #0002;" ref="county-detail">
            <div class="page">
                <h3 style="font-size: 150%; padding: 30px 0; margin: 0px;">
                    <el-button type="info" circle icon="el-icon-back" style="float: left; position: relative; top: -8px; margin-right: 20px;" @click="goback()"/>
                    {{countyDetail.county}} county, {{countyDetail.state}}
                </h3>
                <el-row v-if="selectedProperty">
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
                <br>
                <br>
            </div>
        </div>

        <div v-if="edaEvents && edaEvents.state && edaEvents.county">
            <div class="page">
                <h3>Recent Disaster Declarations / EDA Awards</h3>
                <!--<p>This county has had the following disasters declared and EDA grants awarded in the past</p>-->

                <p v-if="recentHistory.length == 0" style="opacity: 0.8;">No disaster declared since 2017</p>
                <div v-for="(event, idx) in recentHistory" :key="event._id" class="history">
                    <Event :event="event" :colors="layers"/>
                    <div class="connecter" v-if="idx < recentHistory.length">
                        <Eligibility2018 v-if="is2018Eligible(event)"/>
                        <Eligibility2019 v-if="is2019Eligible(event)"/>
                    </div>
                </div>
                <br>
                <el-collapse>
                    <el-collapse-item>
                        <template slot="title">
                            <h3><i class="el-icon-caret-right"/> Past Disasters</h3>
                        </template>
                        <div v-for="event in pastHistory" :key="event._id" class="history">
                            <Event :event="event" :colors="layers"/>
                            <div class="connecter">
                                <!--<i class="el-icon-caret-top"/>-->
                            </div>
                        </div>
                    </el-collapse-item>
                </el-collapse>

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
                    <div v-if="count > 5">
                        <!--<h3 style="margin: 10px 20px;">{{storm}}</h3>-->
                        <el-collapse>
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
                    </div><!--v-if count-->
                </div>
                <br>
                <!--TODO - if there are no histogram info, show that we don't have the info-->
                <br>
            </div>
            <br>
            <br>
        </div>

        <div class="page" v-if="cutterMeasures && countyDetail">
           
            <h3>Disaster Resilience</h3>
            <p style="margin: 20px;">TODO Describe what resilience means, and how it's computed.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        
            <p style="font-size: 85%; opacity: 0.8; margin-left: 300px; margin-right: 50px; padding: 0 10px;">
                <span>Low Resilience</span>
                <span style="float: right">High Resilience</span>
            </p>

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
            <br>
            <br>
            <br>
        </div>
    </div>

    <footer style="background-color: #333; color: #999; padding: 50px 0px; padding-top: 50px; padding-bottom: 150px;">
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

import { Component, Vue } from 'vue-property-decorator'
import CountySelecter from '@/components/CountySelecter.vue'
import Histogram from '@/components/Histogram.vue'
import BarGraph from '@/components/BarGraph.vue'
import Event from '@/components/Event.vue'

import Eligibility2018 from '@/components/Eligibility2018.vue'
import Eligibility2019 from '@/components/Eligibility2019.vue'

import { Plotly } from 'vue-plotly';

import cutterIndicators from '@/assets/cutter_indicators.json'

@Component({
    components: { CountySelecter, BarGraph, Histogram, Plotly, Event, Eligibility2018, Eligibility2019 },
})
export default class County extends Vue {

    loading = true;
    popup = null;

    //overlay;
    selectedProperty = null;

    //county data
    countyDetail = null; 
    stormEvents = null;

    edaEvents = null;
    history = [];
    histograms = {};

    indicators = cutterIndicators;
    cutterMeasures = null;

    bvi = [];
    bviEstData = null;
    bviEmpData = null;
    bviEstLayout = null;
    bviEmpLayout = null;

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

    mounted() {
        const fips = this.$route.params.fips.toString();
        const statefips = fips.substring(0,2);
        const countyfips = fips.substring(2);

        const pStormHistogram = this.axios.get("https://dev1.soichi.us/api/apred/storm/histogram").then(res=>{
            res.data.forEach(rec =>{
                this.histograms[rec.storm] = rec.histogram;
            });
        })

        const pCountydata = this.axios.get("https://dev1.soichi.us/api/apred/county/"+statefips+"."+countyfips).then(res=>{
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
                window.scrollTo(0, top);
            });
        });

        const pStatestorm = this.axios.get("https://dev1.soichi.us/api/apred/storm/query/"+statefips+"."+countyfips).then(res=>{
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
        });
    
        this.edaEvents = {};
        this.history = [];
        const pStateEda = this.axios.get("https://dev1.soichi.us/api/apred/eda2018/"+statefips).then(res=>{
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

        const pCountyEda = this.axios.get("https://dev1.soichi.us/api/apred/eda2018/"+statefips+"/"+countyfips).then(res=>{
            this.edaEvents.county = res.data;
            res.data.forEach(rec=>{
                rec.type = "eda2018";
                rec.subtype = "county";
                rec.date = new Date(rec.grant_award_date);
                this.history.push(rec);
            });
        });
        
        //this.currentDDs = [];
        const pDD = this.axios.get("https://dev1.soichi.us/api/apred/dd/"+statefips+"/"+countyfips).then(res=>{
            res.data.forEach(rec=>{
                /*
                if(rec.incidentEndDate == "") this.currentDDs.push(rec);
                else {
                    rec.type = "dr";
                    rec.date = new Date(rec.declarationDate);
                    this.history.push(rec);
                }
                */
                rec.type = "dr";
                rec.date = new Date(rec.declarationDate);
                this.history.push(rec);
            })
        }); 

        this.bvi = [];
        this.axios.get("https://dev1.soichi.us/api/apred/bvi/"+statefips+"/"+countyfips).then(res=>{
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

        this.loading = true;
        Promise.all([pStormHistogram, pCountydata, pStatestorm, pStateEda, pCountyEda, pDD]).then(()=>{
            //process data.
            //sort history by date.
            this.loading = false;
            this.history.sort((a,b)=>{
                return (b.date - a.date);
            });
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

    get recentHistory() {
        return this.history.filter(h=>(h.date >= new Date("2017-01-01")));
    }
    get pastHistory() {
        return this.history.filter(h=>(h.date < new Date("2017-01-01")));
    }

    goback() {
        this.$router.go(-1);
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
        }

        return false;
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

.history {
    .event-date {
        //color: black;
        font-size: 95%;
        padding: 5px 0;
        display: inline-block;
    }
    .connecter {
        border-left: 4px solid #d9d9d9;
        min-height: 20px;
        margin-left: 30px;

        i {
            color: #d9d9d9;
            font-size: 175%;
            position: relative;
            left: -11.5px;
            top: -12px;
        }
    }
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
</style>

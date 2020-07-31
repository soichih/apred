<template>
<div class="countydetail" ref="scrolled-area" @scroll="handleScroll">
    <div class="header">
        <div class="page">
            <h3 style="position: relative; font-weight: normal;">
                <el-button type="primary" circle icon="el-icon-back" @click="goback()" class="back-button"/>
                &nbsp;
                &nbsp;
                <span class="important"><b>{{detail.county}}</b> county,</span>
                {{detail.state}}
            </h3>
        </div>
    </div>

    <div id="info-header">
        <div class="page">
            <el-row>
                <el-col :span="10">
                    <div id="statemap"/>
                </el-col>
                <el-col :span="9" class="border-left demo">
                    <p style="margin: 0">
                        <span class="sub-heading">Population</span><br>
                        <span class="primary" v-if="detail.demo"> {{detail.population | formatNumber}}</span>
                        <span v-else style="padding: 10px 0; opacity: 0.5;">No information</span>
                    </p>
                    <Plotly :data="demo2GraphData" :layout="demo2GraphLayout" :display-mode-bar="false"/>
                </el-col>
                <el-col :span="5" class="border-left gdp">
                    <p>
                        <span class="sub-heading">GDP</span> <small>(BEA 2018)</small><br>
                        <span class="primary" v-if="detail.gdp"> ${{(detail.gdp/1000) | formatNumber}} M</span>
                        <span v-else style="padding: 10px 0; opacity: 0.5;">No information</span>
                    </p>
                    <p>
                        <span class="sub-heading">Median Income</span> <small>(BEA 2018)</small><br>
                        <span class="primary" v-if="detail.medianincome"> ${{detail.medianincome | formatNumber}}</span>
                        <span v-else style="padding: 10px 0; opacity: 0.5;">No information</span>
                    </p>
                </el-col>
            </el-row>
        </div>
    </div>

    <div class="page sidebar">
        <div style="position: absolute; right: -250px; width: 200px; margin: 20px;">
            <el-button circle icon="el-icon-arrow-up" @click="goto('info-header')"/>
            <div class="navigator">
                <h5 ref="nav-disaster" class="navigator-item navigator-item-active" @click="goto('disaster')">Disaster Declarations</h5>
                <h5 ref="nav-bvi" class="navigator-item" v-if="detail.bvis" @click="goto('bvi')">Business Vulnerability</h5>
                <h5 ref="nav-cutter" class="navigator-item" @click="goto('cutter')">Disaster Resilience</h5>
                <h5 ref="nav-storms" class="navigator-item" @click="goto('storms')">Storm History</h5>
            </div>
        </div>
    </div>

    <div class="page" id="disaster">

        <h3>Disaster Declarations / EDA Awards</h3>
        <p>
        This section provides information on Major Disaster Declarations declared under the Robert T. Stafford Disaster Relief and Emergency Assistance Act that may support eligibility for investment assistance from <a href="https://www.eda.gov/">EDA</a> (the U.S. Economic Development Administration) under the agency’s Public Works and Economic Adjustment Assistance Programs.
        Through these Programs, EDA provides investment assistance to communities and regions to devise and implement long-term economic recovery strategies through a variety of non-construction and construction projects. 
        </p>

        <p v-if="recentHistory.length == 0" style="opacity: 0.8;">No disaster declared since 2017</p>
        <div v-for="(event, idx) in recentHistory" :key="idx" class="history">
            <Event :event="event" :layers="layers">
                <div class="connecter" v-if="idx < recentHistory.length">
                    <Eligibility2018 v-if="is2018Eligible(event)"/>
                    <Eligibility2019 v-if="is2019Eligible(event) || is2019FloodEligible(event)"/>
                </div>
            </Event>
        </div>

        <div v-if="!showPastHistory" style="border-top: 2px solid #f3f3f3;">
            <br>
            <el-button round @click="showPastHistory = !showPastHistory">
                <i class="el-icon-caret-right"/> Show Past Disasters ({{pastHistory.length}})
            </el-button>
        </div>

        <!-- don't use slide-down.. it will be slow :active="showPastHistory" :duration="1000"-->
        <div v-if="showPastHistory">
            <Event :event="event" :layers="layers" v-for="(event, idx) in pastHistory" :key="idx" class="history"/>
        </div>
        <br>
        <br>
    </div>

    <div style="background-color: #f0f0f0" v-if="detail.bvis" id="bvi">
    <div class="page">
        <br>
        <h3>Business Vulnerability</h3>
        <p>
            <b>Business Vulnerability Index (BVI)</b> is a percentage of businesses in a county
            that are believed to be <i>vulnerable</i> to various natural disasters.
        </p>
        <p>
            To calculate the BVI, we isolated businesses by NAICS code from the U.S. Census' most recent <a href="https://www.census.gov/econ/overview/mu0800.html">County Business Patterns</a>  based on their vulnerability to natural disaster (farmers, transportation companies, etc..)
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
        <p>
            Disaster resilience measures the capacity of a community to recover from disaster events without losing their socioeconomic and infrastructural viability <a href="https://gsdrc.org/topic-guides/disaster-resilience/concepts/what-is-disaster-resilience/">[Combaz, 2015]</a> <a href="https://www.unisdr.org/2005/wcdr/intergover/official-doc/L-docs/Hyogo-framework-for-action-english.pdf">[UNISDR, 2005]</a>. Using the framework provided by <a href="http://resiliencesystem.com/sites/default/files/Cutter_jhsem.2010.7.1.1732.pdf">[Cutter et al. 2010]</a>, this section merges the resilient and vulnerable variables of a city into a unified set of indices - to produce aggregated information on disaster resilience levels. Expand each measure to show more detail.
        </p>

        <div v-for="(indicator, incode) in detail.cutter2" :key="incode" style="margin-bottom: 15px; clear: both;">
            <div class="indicator-header">
                <b class="indicator-name">{{indicator.name}}</b>
                <p class="indicator-detail">
                    <IndicatorInfo :id="incode"/>
                </p>
            </div>
            <div class="measure-info" v-for="source in detail.cutter2[incode].sources.filter(s=>s.stats)" :key="source.id">
                <p style="margin: 0">
                    <!--
                    <small style="float: right">Cutter ID:{{source.id}}</small>
                    -->
                    <b>{{source.name}}</b>
                </p>
                <MeasureInfo :id="source.id">
                    <CompositePlot v-if="detail" :cutters="source.stats" :edaAwards="detail.eda2018"/>
                </MeasureInfo>
            </div>
            <br clear="both"> 
        </div>
    </div>

    <div id="storms" style="background-color: #f0f0f0;">
        <div class="page">
            <h3>Storm History</h3>
            <p>This graph shows the counts of storm event published by NOAA since 1950s.</p>
            <p>Storm Data has gone through many changes and versions over the years. The source data ingested into the database are widely varied and leads to many questions about the precision and accuracy of the location data. Please see <a href="https://www.ncdc.noaa.gov/stormevents/details.jsp" target="noaa">https://www.ncdc.noaa.gov/stormevents/faq.jsp</a> for more detail</p>
            <Plotly :data="stormData" :layout="stormLayout" :display-mode-bar="false"></Plotly>
            <br>
            <br>
            <br>
        </div>
    </div>
    <Footer/>
    <div class="contextmenu" ref="contextmenu">
        <p class="menu-item" @click="openContextMenuCounty">Open this county ({{contextMenuCounty}}) in a new tab</p>
    </div>
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
import CompositePlot from '@/components/CompositePlot.vue'

import Eligibility2018 from '@/components/Eligibility2018.vue'
import Eligibility2019 from '@/components/Eligibility2019.vue'

import SlideUpDown from 'vue-slide-up-down'

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

import { Plotly } from 'vue-plotly'

Vue.directive('scroll', {
  inserted: function (el, binding) {
    const f = function (evt) {
      if (binding.value(evt, el)) {
        window.removeEventListener('scroll', f)
      }
    }
    window.addEventListener('scroll', f)
  }
})

@Component({
    components: { 
        BarGraph, 
        Histogram, 
        Plotly, 
        Event, 
        Eligibility2018, 
        Eligibility2019,
        //VueBarGraph,
        IndicatorInfo,
        MeasureInfo,
        Footer,
        SlideUpDown,
        CompositePlot,
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

    demo2GraphData = [];
    demo2GraphLayout = {
        width: 290,
        height: 140,
        margin: {
            l: 0,
            r: 0,
            t: 0,
            b: 15,
        },
        barmode: 'stack',
        'plot_bgcolor': '#0000',
        'paper_bgcolor': '#0000',
    }

    cuttersData = {}; //group by incode then {states: {avg, sdev}, us: {avg, sdev}, county} 

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
        this.processHistory();
        this.processBVI();
        this.processStorms();
        this.processMap();
        this.processDemo2();
    }

    goto(id) {
        const e = document.getElementById(id);
        e.scrollIntoView();
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
            rec.date = new Date(rec.incidentBeginDate);
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
                t: 100,
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
                y: 1.15,
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
                t: 100,
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
                y: 1.15,
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
            name: 'Total Businesses',
            marker: {color: 'rgb(100, 100, 100)'},
            type: 'bar'
        }
        const traceBtV = {
            x, y: bviBtV,
            name: 'Vulnerable Businesses',
            marker: {color: '#f56c6c'},
            type: 'bar'
        }
        this.bviEstData = [traceBt, traceBtV ];

        const traceEt = {
            x,y: bviEt,
            name: 'Total Employees',
            marker: {color: 'rgb(100, 100, 100)'},
            type: 'bar'
        }
        const traceEtV = {
            x, y: bviEtV,
            name: 'Vulnerable Employees',
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
                t: 10,
                b: 30,
                //pad: 10,
            },
            legend: {
                //x: 0,
                y: 1.15,
                bgcolor: 'rgba(255, 255, 255, 0)',
                bordercolor: 'rgba(255, 255, 255, 0)',
                orientation: 'h',
            },
            barmode: 'stack',

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

                //for bar graph
                type: 'bar',

                //for line chart
                /*
                stackgroup: 'one',
                line: {
                    width: 0,
                    shape: 'spline',
                    smoothing: 0.8,
                },
                */
            });
        }
    }

    processDemo2() {
        this.demo2GraphData = [];

        const years = [];
        for(let year = 2009; year <= 2018; ++year) {
            years.push(year);
        }

        function merge(codes) {
            const populations = [];
            codes.forEach(code=>{
                years.forEach((year, idx)=>{
                    let v = 0;
                    const group = this.detail.demo2[code];
                    if(group) {
                        const p = group.populations[idx];
                        if(p) v = p;
                    }
                    if(!populations[idx]) populations[idx] = v;
                    else populations[idx] += v;
                });
            });
            return populations;
        }        

        const template = {
            x: years,
            stackgroup: 'one',
            line: {
                width: 0,
                shape: 'spline',
                smoothing: 0.8,
            },
            mode: 'lines',
        }

        this.demo2GraphData.push(Object.assign({ 
            y: merge.call(this, [312, 313]), 
            name: "0-17"
        }, template));
        this.demo2GraphData.push(Object.assign({ 
            y: merge.call(this, [314]), 
            name: "18-24"
        }, template));
        this.demo2GraphData.push(Object.assign({ 
            y: merge.call(this, [315, 316]), 
            name: "25-44"
        }, template));
        this.demo2GraphData.push(Object.assign({ 
            y: merge.call(this, [317]), 
            name: "65+"
        }, template));
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
        this.map.fitBounds([[bounds.xMin, bounds.yMin-0.2], [bounds.xMax, bounds.yMax+0.2]]);

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

    handleScroll() {
        const targets = ["disaster", "bvi", "cutter", "storms"];

        //clear active
        targets.forEach(id=>{
            const e = this.$refs["nav-"+id];
            if(e) e.classList.remove("navigator-item-active");
        });

        //set current active
        const e = this.$refs["scrolled-area"];
        const pagemid = e.scrollTop + e.clientHeight/2;
        targets.forEach(id=>{
            const target = document.getElementById(id);
            if(!target) return;
            if(target.offsetTop < pagemid && (target.offsetTop + target.scrollHeight) > pagemid) { 
                this.$refs["nav-"+id].classList.add("navigator-item-active");
            }
        });
    }

    /*
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
    */

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

        // some incidentType is not eligible
        switch(event.incidentType) {
        case "Chemical":
        case "Human Cause":
        case "Terrorist":
        case "Toxic Substances":
        case "Biological": //TODO confirm with Jason
            return false;
        }

        const eligBegin = new Date("2017-01-01");
        const eligEnd = new Date("2018-01-01");

        // check data range
        let begin = new Date();
        if(event.incidentBeginDate) begin = new Date(event.incidentBeginDate);
        let end = new Date();
        if(event.incidentEndDate) end = new Date(event.incidentEndDate);
        if( !(begin >= eligBegin && begin < eligEnd) &&
            !(end >= eligBegin && end < eligEnd) ) return false;

        return true;
    }

    is2019Eligible(event) {
        // ignore some incidentType 
        switch(event.incidentType) {
        case "Chemical":
        case "Human Cause":
        case "Terrorist":
        case "Toxic Substances":
        case "Biological": //TODO confirm with Jason
            return false;
        }

        const eligBegin = new Date("2018-01-01");
        const eligEnd = new Date("2019-01-01");

        //check date range
        let begin = new Date();
        if(event.incidentBeginDate) begin = new Date(event.incidentBeginDate);
        let end = new Date();
        if(event.incidentEndDate) end = new Date(event.incidentEndDate);
        if( !(begin >= eligBegin && begin < eligEnd) &&
            !(end >= eligBegin && end < eligEnd) ) return false;


        return true;
    }

    is2019FloodEligible(event) {
        switch(event.incidentType) {
        case "Tornado":
        case "Flood":
        case "Severe Storm(s)":
            //good
            break;
        default:
            // also qualifies if incidentTitle includes those names
            if( 
                event.incidentTitle &&
                !event.incidentTitle.toLowerCase().includes("tornado") &&
                !event.incidentTitle.toLowerCase().includes("flood") &&
                !event.incidentTitle.toLowerCase().includes("severe storms")) return false;
        }

        const eligBegin = new Date("2019-01-01");
        const eligEnd = new Date("2020-01-01");

        //check date range
        let begin = new Date();
        if(event.incidentBeginDate) begin = new Date(event.incidentBeginDate);
        let end = new Date();
        if(event.incidentEndDate) end = new Date(event.incidentEndDate);
        if( !(begin >= eligBegin && begin < eligEnd) &&
            !(end >= eligBegin && end < eligEnd) ) return false;

        return true;
    }

    contextMenuCounty = null;
    openContextMenuCounty() {
        window.open("#/county/"+this.contextMenuCounty, "apred-"+this.contextMenuCounty);
    }
}

</script>

<style lang="scss" scoped> 
.indicator-header {
    border-top: 1px solid #0002;
    position: relative; 

    margin-top: 20px;
    padding-top: 20px;
    margin-bottom: 20px;

    .indicator-name {
        font-size: 130%;
    }
    .indicator-detail {
        opacity: 0.9;
    }
}
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
    font-weight: bold;
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
    font-size: 150%;
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
    border-left: 1px solid #0001;
    height: 200px;
    padding-left: 20px;
    padding-top: 10px;
}
@media only screen and (max-width: 500px) {
    .demo {
        display: none;
    }
}
@media only screen and (max-width: 1000px) {
    .gdp {
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

#info-header {
    background-color: #eee;
    height: 220px;
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
.sidebar {
position: sticky; 
top: 10px;
}
.navigator {
    margin-top: 20px;
    .navigator-item {
        color: gray;
        cursor: pointer;
        padding: 10px 10px;
        margin: 0;
        border-left: 3px solid #0000;
    }
    .navigator-item:hover {
        background-color: #eee;
    }
    .navigator-item-active {
        color: #409EFF;
        border-color: #409EFF;
    }
}
@media only screen and (max-width: 1500px) {
    .sidebar {
        display: none;
    }
}
#statemap {
    position: relative;
    width: 100%;
    height: 220px;
}
canvas:focus {
    outline: none;
}
.indicator-detail {
    clear: both;
}
small {
    opacity: 0.5;
}
.measure-info {
display: inline-block;
float: left;
width: 475px;
margin-right: 20px;
margin-bottom: 10px;
}
.measure-info:nth-child(even) {
clear: both;
}
</style>

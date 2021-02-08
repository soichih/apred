<template>
<div ref="scrolled-area" @scroll="handleScroll" v-if="detail">

    <div class="header">
        <div class="page">
            <div style="float: right; width: 300px; padding-top: 15px;">
                <CountySelecter @select="fips = $event"/>
            </div>
            <h3 style="font-weight: normal; margin-right: 300px;">
                <el-button type="primary" circle icon="el-icon-back" @click="goback()" class="back-button"/>
                &nbsp;
                &nbsp;
                <span class="important"><b>{{detail.county}}</b> county,</span>
                {{detail.state}}
            </h3>
            <br clear="both">
            <el-tabs v-model="tab">
                <el-tab-pane name="info" label="County Detail"></el-tab-pane>
                <el-tab-pane name="disaster" :label="'Disaster Declarations/EDA Awards ('+history.length+')'"></el-tab-pane>
                <el-tab-pane v-if="detail.bvis2" name="bvi" label="Business Vulnerability"></el-tab-pane>
                <el-tab-pane name="resilience" label="Disaster Resilience"></el-tab-pane>
                <el-tab-pane name="storms" label="Storm History"></el-tab-pane>
            </el-tabs>
        </div>
    </div>

    <div class="page" v-if="tab == 'info'">
        <br>
        <br>
        <el-row :gutter="20">
            <el-col :span="5">
                <h4>Population<br>
                    <small><a href="https://www.census.gov/programs-surveys/acs" target="acs">(ACS 2018)</a></small>
                </h4>
                <span class="primary" v-if="detail.population"> {{detail.population | formatNumber}}</span>
                <span v-else style="padding: 10px 0; opacity: 0.5;">No information</span>
            </el-col>
            <el-col :span="19">
                <Histogram v-if="$root.commonReady" :value="detail.population" :histogram="$root.populationHistogram" :fips="fips" :state="detail.state"/>
                <br>
                <br>
            </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="5">
                <h4>Population Density</h4>
                <span class="primary" v-if="detail.popdensity"> {{detail.popdensity | formatNumber}} people per sq. mile</span>
                <span v-else style="padding: 10px 0; opacity: 0.5;">No information</span>
            </el-col>
            <el-col :span="19">
                <Histogram v-if="$root.commonReady" :value="detail.popdensity" :histogram="$root.popdensityHistogram" :fips="fips" :state="detail.state"/>
                <br>
                <br>
            </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="5">
                <h4>Population History<br>
                    <small><a href="https://www.census.gov/programs-surveys/acs" target="acs">(ACS 2018)</a></small>
                </h4>
            </el-col>
            <el-col :span="19">
                <Plotly :data="demoGraphData" :layout="demoGraphLayout" :display-mode-bar="false"/>
                <br>
                <br>
            </el-col>
        </el-row>

        <hr>

        <el-row :gutter="20">
            <el-col :span="5">
                <h4>GDP<br>
                    <small><a href="https://www.bea.gov/" target="bea">(BEA)</a></small>
                </h4>
                <span class="primary" v-if="detail.gdp"> ${{(detail.gdp/1000) | formatNumber}} M</span>
                <span v-else style="padding: 10px 0; opacity: 0.5;">No information</span>
                <br>
            </el-col>
            <el-col :span="19">
                <Histogram v-if="$root.commonReady" :value="detail.gdp" :histogram="$root.gdpHistogram" :fips="fips" :state="detail.state"/>
                <br>
                <br>
            </el-col>
        </el-row>


        <el-row :gutter="20">
            <el-col :span="5">
                <h4>Per Capita Income<br>
                    <small><a href="https://www.census.gov/programs-surveys/acs" target="acs">(ACS 2018)</a></small>
                </h4>
                <span class="primary" v-if="detail.percapitaincome"> ${{detail.percapitaincome | formatNumber}}</span>
                <span v-else style="padding: 10px 0; opacity: 0.5;">No information</span>
            </el-col>
            <el-col :span="19">
                <Histogram v-if="$root.commonReady" :value="detail.percapitaincome" :histogram="$root.perCapitaIncomeHistogram" :fips="fips" :state="detail.state"/>
                <br>
                <br>
            </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="5">
                <h4>Median Household Income<br>
                    <small title="US Census Bureau"><a href="https://www.census.gov/programs-surveys/acs" target="acs">(ACS 2018)</a></small>
                </h4>
                <span class="primary" v-if="detail.medianincome"> ${{detail.medianincome | formatNumber}}</span>
                <span v-else style="padding: 10px 0; opacity: 0.5;">No information</span>
            </el-col>
            <el-col :span="19">
                <Histogram v-if="$root.commonReady" :value="detail.medianincome" :histogram="$root.medianIncomeHistogram" :fips="fips" :state="detail.state"/>
                <br>
                <br>
            </el-col>
        </el-row>

        <hr>

        <el-row :gutter="20">
            <el-col :span="5">
                <h4>Per Capita Money Income<br>
                    <small><a href="https://www.census.gov/programs-surveys/acs" target="acs">(5-year ACS)</a></small>
                </h4>
            </el-col>
            <el-col :span="19">
                <p>
                    <Plotly :data="pcmGraphData" :layout="pcmGraphLayout" :display-mode-bar="false"/>
                    <small>The amount of money (only cash sources) earned per person. Released annually in December.</small>
                </p>
                <br>
                <br>
            </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="5">
                <h4>Per Capita Personal Income<small><a href="https://www.bea.gov/" target="bea">(BEA)</a></small></h4>
            </el-col>
            <el-col :span="19">
                <p>
                    <Plotly :data="pcpGraphData" :layout="pcpGraphLayout" :display-mode-bar="false"/>
                    <small>An estimate of income per person that includes not only cash sources of income, but also insurance, transfer payments, dividends, interest, and rent. Released annually in the spring.</small>
                </p>
                <br>
            </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="5">
                <h4>
                    Unemployment Rate<br>
                    <small>(24-month avg. BLS)</small>
                </h4>

                <div>
                    <h5>US Average</h5>
                    <span class="primary" style="color: gray;"> {{unempRateUS}}%</span>
                </div>

                <div>
                    <h5><b>{{detail.county}}</b> County</h5>
                    <span class="primary"> {{unempRateCounty}}%</span>
                    <br>
                    <el-tag type="danger" size="mini" v-if="unempRateUS < unempRateCounty">Above US Rate</el-tag>
                </div>

                <div style="opacity: 0.6">
                    <h5>Report Date</h5>
                    {{new Date(unempRateDate).toLocaleDateString()}}
                </div>

            </el-col>
            <el-col :span="19">
                <p v-if="$root.commonReady">
                    <Plotly :data="urGraphData" :layout="urGraphLayout" :display-mode-bar="false"/>
                    <small>Calculated by taking the sum of unemployed persons for one geography for the previous 24 months divided by the sum of the labor force for that geography for the previous 24 months. Released monthly as part of the Local Area Unemployment Statistics (LAUS) program.</small>
                </p>

                <p>
                    <el-button round @click="showEmploymentHistory = !showEmploymentHistory" size="small">
                        <i class="el-icon-caret-right" v-if="!showEmploymentHistory"/> 
                        <i class="el-icon-caret-bottom" v-if="showEmploymentHistory"/> 
                        Show Employment History
                    </el-button>

                    <Plotly v-if="$root.commonReady && showEmploymentHistory" :data="uGraphData" :layout="uGraphLayout" :display-mode-bar="false"/>
                </p>
                <br>
            </el-col>
        </el-row>

        <br>

        <hr>

        <div style="margin: 20px; padding: 20px;">
            <el-link type="primary" :target="'json.'+fips" :href="$root.dataUrl+'/counties/county.'+fips+'.json'">Download County Detail (.json)</el-link>
        </div>

    </div>

    <div class="page" v-if="tab == 'disaster'">
        <br>
        <p>
        Major Disaster Declarations declared under the Robert T. Stafford Disaster Relief and Emergency Assistance Act that may support eligibility for 
        investment assistance from <a href="https://www.eda.gov/">EDA</a> (the U.S. Economic Development Administration) under the agency’s Public Works 
        and Economic Adjustment Assistance Programs.
        Through these programs, EDA provides investment assistance to communities and regions to devise and implement long-term economic recovery 
        strategies through a variety of non-construction and construction projects. Only the FEMA Disaster Declarations (not Emergency Declarations) are 
        displayed. 
        </p>

        <p v-if="recentHistory.length == 0" style="opacity: 0.8;">No disaster declared since 2017</p>
        <div v-for="(event, idx) in recentHistory" :key="idx" class="history">
            <Event :event="event">
                <div class="connecter" v-if="idx < recentHistory.length" style="float: right;">
                    <Eligibility2018 v-if="$root.user && is2018Eligible(event)"/>
                    <Eligibility2019 v-if="$root.user && (is2019Eligible(event) || is2019FloodEligible(event))"/>
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
            <Event :event="event" v-for="(event, idx) in pastHistory" :key="idx" class="history"/>
        </div>
        <br>
        <br>
    </div>

    <div v-if="tab == 'bvi'" class="page">
        <br>
        <p>
            <b>Business Vulnerability Index (BVI)</b> is a percentage of businesses in a county that are believed to be <i>vulnerable</i> to various natural disasters. 
        </p>
        <p>
            To calculate the BVI, we isolated businesses by NAICS code from the U.S. Census' most recent <a href="https://www.census.gov/econ/overview/mu0800.html">County Business Patterns</a> 
            based on their vulnerability to natural disaster (farmers, transportation companies, etc.).
        </p>
        <p>
            Businesses that were identified to be especially vulnerable to a disater are..
            <ul>
                <li>dependent on supply chains</li>
                <li>have a high reliance on public utilities like water and electricity</li>
                <li>or have a large infrastructure footprint and low infrastructure mobility.</li>
            </ul>
        </p>
        <div class="plot-legend">
            <div class="color-box" style="height: 4px; background-color: #999"/> Total
            <div class="color-box" style="height: 4px; background-color: #900"/> Vulnerable
        </div>
        <br clear="both">

        <br>
        <br>
        <div v-for="(data, naics) in bvi2" :key="naics">
            <p>
                <b><NaicsInfo :id="naics"/></b>
            </p>
            <el-row>
                <el-col :span="12">
                    <h4 style="margin: 0"><small>Establishments</small></h4>
                    <!--<BVIPlot :data="data.est"/>-->
                    <Plotly :data="data.estPlotly" :layout="bviLayout" :display-mode-bar="false"></Plotly>
                </el-col>
                <el-col :span="12">
                    <h4 style="margin: 0"><small>Employment</small></h4>
                    <!-- <BVIPlot :data="data.emp"/> -->
                    <Plotly :data="data.empPlotly" :layout="bviLayout" :display-mode-bar="false"></Plotly>
                </el-col>
            </el-row>
        </div>

        <div v-if="!showNonvBVI && Object.keys(bvi2_nonv).length > 0" style="border-top: 2px solid #f3f3f3;">
            <br>
            <el-button round @click="showNonvBVI = !showNonvBVI">
                <i class="el-icon-caret-right"/> Show Non-vulnerable Sectors ({{Object.keys(bvi2_nonv).length}})
            </el-button>
        </div>

        <!-- don't use slide-down.. it will be slow :active="showPastHistory" :duration="1000"-->
        <div v-if="showNonvBVI" style="border-top: 2px solid #f3f3f3;">
            <br>
            <div v-for="(data, naics) in bvi2_nonv" :key="naics">
                <p>
                    <b><NaicsInfo :id="naics"/></b>
                </p>
                <el-row>
                    <el-col :span="12">
                        <h4 style="margin: 0"><small>Establishments</small></h4>
                        <!--<BVIPlot :data="data.est"/>-->
                        <Plotly :data="data.estPlotly" :layout="bviLayout" :display-mode-bar="false"></Plotly>
                    </el-col>
                    <el-col :span="12">
                        <h4 style="margin: 0"><small>Employment</small></h4>
                        <!--<BVIPlot :data="data.emp"/>-->
                        <Plotly :data="data.empPlotly" :layout="bviLayout" :display-mode-bar="false"></Plotly>
                    </el-col>
                </el-row>
            </div>
        </div>
        <br clear="both">
    </div>

    <div class="page" v-if="tab == 'resilience'">
        <br>
        <p>
            Disaster resilience measures the capacity of a community to recover from disaster events without losing their socioeconomic and 
            infrastructural viability <a href="https://gsdrc.org/topic-guides/disaster-resilience/concepts/what-is-disaster-resilience/">[Combaz, 2015]</a> 
            <a href="https://www.unisdr.org/2005/wcdr/intergover/official-doc/L-docs/Hyogo-framework-for-action-english.pdf">[UNISDR, 2005]</a> (the higher, the better). 
            Using the framework provided by <a href="http://resiliencesystem.com/sites/default/files/Cutter_jhsem.2010.7.1.1732.pdf">[Cutter et al. 2010]</a>, 
            this section merges the resilient and vulnerable variables of a county into a unified set of indices - to produce aggregated 
            information on disaster resilience levels. Expand each measure to show more detail.
        </p>
        <p>
        The resilience scores are calculated using information collected by the <a href="https://data.census.gov/cedsci/">U.S. Census</a> using formulas defined by Cutters, et all.
        </p>        
        <div v-for="(indicator, incode) in detail.cutter2" :key="incode" style="margin-bottom: 15px; clear: both;">
            <div class="indicator-header">
                <b class="indicator-name">{{indicator.name}}</b>
                <p class="indicator-detail">
                    <IndicatorInfo :id="incode"/>
                </p>
            </div>

            <div class="plot-legend">
                <div class="color-box" style="height: 4px; background-color: #409eff"/> This County
                <div class="color-box" style="background-color: #09f5"/> State Average(+standard deviation) 
                <div class="color-box" style="background-color: #0003"/> US Average(+standard deviation) 
            </div>
            <br clear="both">

            <div class="measure-info" v-for="source in detail.cutter2[incode].sources.filter(s=>s.stats)" :key="source.id">
                <p style="margin: 0">
                    <b>{{source.name}}</b>
                </p>

                <p style="min-height: 50px; margin: 0">
                    {{$root.drMeasures[source.id].desc}}
                </p>
                <CompositePlot v-if="detail" :cutters="source.stats" :edaAwards="detail.eda2018"/>
                <br>

                <p>
                    <el-button size="mini" @click="toggleMeasureDetail(source)" round>
                        <span v-if="source.showDetail">Hide</span>
                        <span v-else>Show</span>
                        Detail
                    </el-button>
                </p>
                <slide-up-down :active="source.showDetail">
                    <small>
                        {{$root.drMeasures[source.id].calcDesc}}
                    </small>
                </slide-up-down>
            </div>
            <br clear="both"> 
        </div>
    </div>

    <div v-if="tab == 'storms'" class="page">
        <br>
        <div v-if="stormData && stormData.length > 0">
            <p>This graph shows the counts of storm events published by NOAA since 1950s.</p>
            <p>Storm data has gone through many changes and versions over the years. The source data ingested into the database are widely varied and leads to many questions about the precision and accuracy of the location data. Please see <a href="https://www.ncdc.noaa.gov/stormevents/details.jsp" target="noaa">https://www.ncdc.noaa.gov/stormevents/faq.jsp</a> for more detail.</p>
            <p>You can click on the chart legend to select or deselect which storm events to show on the graph.</p>
            <Plotly :data="stormData" :layout="stormLayout" :display-mode-bar="false"></Plotly>
        </div>
        <p v-else>No storm data</p>
        <br>
        <br>
        <br>
    </div>

    <Footer/>
</div>
</template>

<script>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Event from '@/components/Event.vue'
import IndicatorInfo from '@/components/IndicatorInfo.vue'
import Footer from '@/components/Footer.vue'
import CompositePlot from '@/components/CompositePlot.vue'
import BVIPlot from '@/components/BVIPlot.vue'
import NaicsInfo from '@/components/NaicsInfo.vue'
import CountySelecter from '@/components/CountySelecter.vue'

import Eligibility2018 from '@/components/Eligibility2018.vue'
import Eligibility2019 from '@/components/Eligibility2019.vue'
import Histogram from '@/components/Histogram.vue'

import SlideUpDown from 'vue-slide-up-down'

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
        Plotly, 
        Event, 
        Eligibility2018, 
        Eligibility2019,
        IndicatorInfo,
        Footer,
        SlideUpDown,
        CompositePlot,
        BVIPlot,
        NaicsInfo,
        CountySelecter,
        Histogram,
    },
})
export default class CountyDetail extends Vue {

    @Prop() fips;

    popup;
    statemap;
    detail = null;

    tab = "info";

    history = [];

    bvi2Layout = {
        height: 100,
        margin: {
            l: 50,
            r: 0,
            t: 10,
            b: 30,
            pad: 10,
        },
        'paper_bgcolor': '#0000',
        'plot_bgcolor': '#0000',
    }

    bvi2 = {}; //keyed by naics code, then {years, estab, estab_v, emp, emp_v} 
    bvi2_nonv = {}; //bvi2 with all-0 vulnerablility
    showNonvBVI = false;
    bviLayout = null;

    stormLayout = null;
    stormData = null;

    showPastHistory = false;
    shownIndicators = [];

    demoGraphData = [];
    demoGraphLayout = {
        height: 200,
        margin: {
            //l: 50,
            r: 30,
            t: 10,
            b: 20,
        },
        //barmode: 'stack',
        'plot_bgcolor': '#0000',
        'paper_bgcolor': '#0000',
    }

    pcmGraphData = [];
    pcmGraphLayout = {
        height: 150,
        margin: {
            //l: 30,
            //r: 30,
            t: 10,
            b: 30,
        },
        //'plot_bgcolor': '#0000',
        //'paper_bgcolor': '#0000',
        
        //TODO - I should add annotation like this > https://plotly.com/javascript/line-charts/#labelling-lines-with-annotations
        annotations: [],
    }

    pcpGraphData = [];
    pcpGraphLayout = {
        height: 150,
        margin: {
            //l: 30,
            //r: 30,
            t: 10,
            b: 30,
        },
        //'plot_bgcolor': '#0000',
        //'paper_bgcolor': '#0000',
    }

    urGraphLayout = {
        height: 200,
        margin: {
            //l: 30,
            //r: 30,
            t: 10,
            b: 20,
        },
        //'plot_bgcolor': '#0000',
        //'paper_bgcolor': '#0000',
        legend: {orientation: 'h', side: 'bottom'},
        yaxis: {title: 'Unemployment Rate'},
    }

    uGraphLayout = {
        height: 200,
        margin: {
            //l: 30,
            //r: 30,
            t: 10,
            b: 20,
        },
        //'plot_bgcolor': '#0000',
        //'paper_bgcolor': '#0000',
        legend: {orientation: 'h', side: 'bottom'},
        yaxis: {title: 'Employment'},
        yaxis2: {
            title: 'US Employment',
            //titlefont: {color: 'rgb(148, 103, 189)'},
            //tickfont: {color: 'rgb(148, 103, 189)'},
            overlaying: 'y',
            side: 'right'
        }
    }
    showEmploymentHistory = false;

    cuttersData = {}; //group by incode then {states: {avg, sdev}, us: {avg, sdev}, county} 

    @Watch('fips')
    onDetailChange() {
        this.load();
    }

    toggleIndicator(incode) {
        const pos = this.shownIndicators.indexOf(incode);
        if(~pos) this.shownIndicators.splice(pos, 1);
        else this.shownIndicators.push(incode);
    }  

    toggleMeasureDetail(source) {
        Vue.set(source, "showDetail", !source.showDetail);
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

    processBVI2() {
        this.bviLayout = {
            height: 150,
            margin: {
                l: 30,
                r: 30,
                t: 10,
                b: 30,
            },
            legend: {
                y: 1.15,
                bgcolor: 'rgba(255, 255, 255, 0)',
                bordercolor: 'rgba(255, 255, 255, 0)',
                orientation: 'h',
            },
            barmode: 'stack',
            xaxis: {
                type: 'category', //show all years
            },
        }

        if(!this.detail.bvis2) return;
        for(const naics in this.detail.bvis2) {
            const data = this.detail.bvis2[naics];

            //see if there is any non-0 vulnerability values
            let vuln = false;
            data.estab_v.forEach(v=>{
                if(v != 0) vuln = true;
            });
            data.emp_v.forEach(v=>{
                if(v != 0) vuln = true;
            });

            const traces = {
                estPlotly: [
                    //non vulnerable
                    {
                        x: data.years,
                        y: data.estab.map((nv, i)=>nv - data.estab_v[i]),
                        name: 'Non Vulnerable',
                        showlegend: false,
                        type: 'bar',
                        marker: {
                            color: '#0004',
                        },
                        
                    },

                    //vul
                    {
                        x: data.years,
                        y: data.estab_v,
                        name: 'Vulnerable',
                        showlegend: false,
                        type: 'bar',
                        marker: {
                            color: '#6008',
                        },
                    }
                ],

                empPlotly: [
                    //non vulnerable
                    {
                        x: data.years,
                        y: data.emp.map((nv, i)=>nv - data.emp_v[i]),
                        name: 'Non Vulnerable',
                        showlegend: false,
                        type: 'bar',
                        marker: {
                            color: '#0004',
                        },
                    },

                    //vul
                    {
                        x: data.years,
                        y: data.emp_v,
                        name: 'Vulnerable',
                        showlegend: false,
                        type: 'bar',
                        marker: {
                            color: '#6008',
                        },
                    }
                ]
            }

            if(vuln) this.bvi2[naics] = traces;
            else this.bvi2_nonv[naics] = traces;
        }
    }

    processStorms() {
        this.stormLayout = {
            margin: {
                l: 30,
                r: 30,
                t: 10,
                b: 30,
            },
            legend: {
                y: 1.15,
                bgcolor: 'rgba(255, 255, 255, 0)',
                bordercolor: 'rgba(255, 255, 255, 0)',
                orientation: 'h',
            },
            barmode: 'stack',
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
                type: 'bar',
            });
        }
    }

    processDemo() {
        this.demoGraphData = [];

        const template = {
            x: this.detail.pops.years,
            stackgroup: 'one',
            line: {
                width: 0,
                shape: 'spline',
                smoothing: 0.8,
            },
            mode: 'lines',
        }

        this.detail.pops.groups.forEach(group=>{
            this.demoGraphData.push(Object.assign({ 
                y: group.y,
                name: group.name,
                hoverinfo: 'y+text',
            }, template));
        });

        //compute percentages
        for(let y = 0;y < this.detail.pops.years.length; ++y) {
            const total = this.demoGraphData.reduce((sum, v)=>sum+v.y[y], 0);
            this.demoGraphData.forEach(v=>{
                if(!v.hovertext) v.hovertext = [];
                if(total == 0) v.hovertext.push(null);
                else v.hovertext.push((v.y[y]/total*100).toFixed(1)+"%");
            });
        }
    }

    processDistress() {
        this.pcmGraphData = [
        {
            x: this.detail.distress_pcm.years,
            y: this.detail.distress_pcm.est,
            'error_y': {
                type: 'data',
                array: this.detail.distress_pcm.moe,
                visible: true,
            },
            name: 'EST'
        },
        /*
        {
            x: this.detail.distress_pcm.years,
            y: this.detail.distress_pcm.moe,
            name: 'MOE'
        }
        */
        ];
        
        this.pcpGraphData = [
        {
            x: this.detail.distress_pcp.years,
            y: this.detail.distress_pcp.data,
            title: 'MOE'
        }];
    }

    get urGraphData() {
        return [
            //county 
            /*
            */
            {
                x: this.detail.distress_ur.date,
                y: this.detail.distress_ur.rate,
                //yaxis: 'y2',
                name: 'County Unempl. Rate',
                line: {
                    color: '#409EFF',
                },
            },

            {
                x: this.$root.unempUS.date,
                y: this.$root.unempUS.rate,
                //yaxis: 'y2',
                name: 'US Unempl. Rate',
                line: {
                    color: '#999',
                },
            }
        ];
    }

    get uGraphData() {
        return [
            //county
            {
                x: this.detail.distress_ur.date,
                y: this.detail.distress_ur.employed,
                stackgroup: 'county',
                name: 'Employed',
                fillcolor: 'rgba(0,0,0,0.1)',
                line: {
                    width: 0,
                },
            },
            {
                x: this.detail.distress_ur.date,
                y: this.detail.distress_ur.unemp,
                stackgroup: 'county',
                name: 'Unemployed',
                fillcolor: 'rgba(153, 30, 30, 0.4)',
                line: {
                    width: 0,
                },
            },

            /*
            //US
            {
                x: this.$root.unempUS.date,
                y: this.$root.unempUS.employed,
                stackgroup: 'us',
                yaxis: 'y2',
                name: 'US Employed',
                fillcolor: 'rgba(0, 0, 0, 0.1)',
                line: {
                    width: 0,
                },
            },
            {
                x: this.$root.unempUS.date,
                y: this.$root.unempUS.unemp,
                stackgroup: 'us',
                yaxis: 'y2',
                name: 'US Unemployed',
                fillcolor: 'rgba(153, 30, 30, 0.2)',
                line: {
                    width: 0,
                },
            },
            */
        ];
    }

    get unempRateDate() {
        const l = this.detail.distress_ur.date.length;
        return this.detail.distress_ur.date[l-1];
    }
    get unempRateCounty() {
        const l = this.detail.distress_ur.rate.length;
        return this.detail.distress_ur.rate[l-1];
    }
    get unempRateUS() {
        const l = this.$root.unempUS.rate.length;
        return this.$root.unempUS.rate[l-1];
    }

    mounted() {
        if(this.fips) this.load();
    }

    load() {
        this.showPastHistory = false;
        this.showNonvBVI = false;

        fetch(this.$root.dataUrl+"/counties/county."+this.fips+".json").then(res=>res.json()).then(data=>{
            this.detail = data;

            //remove some categories that are not calculated
            delete this.detail.cutter2["INST"];
            delete this.detail.cutter2["FLOR"];

            this.processHistory();
            this.processBVI2();
            this.processStorms();
            this.processDemo();
            this.processDistress();
        });
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

    //computed properties
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
    margin-bottom: 10px;
}
h5 {
    margin-bottom: 5px;
}

.sub-heading {
    opacity: 0.6;
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
.border-left {
    border-left: 1px solid #0001;
    height: 200px;
    padding-left: 20px;
    padding-top: 10px;
}
@media only screen and (max-width: 650px) {
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
.el-collapse,
.el-collapse-item__header {
    border: none;
}
.header {
    position: sticky;
    top: 50px;
    width: 100%;
    background-color: white;
    z-index: 3;
    box-shadow: 0 0 3px #ddd;
}

/*
#info-header {
    background-color: #eee;
    height: 220px;
}
*/

.header h3 {
    margin: 0;
    padding-top: 10px;
}
.header .back-button {
    position: relative;
    font-size: 100%;
    margin-right: 20px;
}
/*
.sidebar {
    position: sticky; 
    top: 10px;
}
*/
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
/*
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
*/
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
.bvi {
display: inline-block;
float: left;
width: 475px;
margin-right: 20px;
margin-bottom: 10px;
}
.measure-info:nth-child(even) {
clear: both;
}
.plot-legend {
    text-align: center;
    font-size: 85%;
    .color-box {
        margin-left: 20px;
        display: inline-block; 
        width: 16px; 
        height: 16px; 
    }
}
h4 {
    margin-top: 0;    
}
hr {
    opacity: 0.3;
    margin-bottom: 30px;
}
</style>

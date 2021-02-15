<template>
<div>
    <TopMenu/>
    <div class="page">
        <br>
        <div class="county-selecter">
            <p>
                List counties you'd like to compare<br>
                <MultipleCountySelecter v-model="fips" placeholder="Enter counties to compare"/>
            </p>
            <p>
                Or.. select multiple counties from an EDA region<br>
                <RegionSelecter @select="regionSelected"/>
            </p>
        </div>


        <!-- when fips number are low, show some detail number side by side in table-->
        <br>
        <table class="table" v-if="fips.length > 0 && fips.length <= 6">
        <thead>
        <tr>
            <th v-for="fip in fips" :key="fip">
                <h3 v-if="counties[fip] && !counties[fip].loading">
                    {{counties[fip].county}}<small v-if="stateDiffers">, {{counties[fip].state}}</small>
                </h3>
            </th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td v-for="fip in fips" :key="fip">
                <div v-if="counties[fip] && !counties[fip].loading">
                    <h4>Population</h4> 
                    <span class="primary">{{counties[fip].population | formatNumber}}</span>

                    <h4>Population Density</h4>
                    <span class="primary">{{counties[fip].popdensity | formatNumber}}</span> 
                    people per sq. mile.
                    
                    <h4>GDP</h4>
                    <span class="primary">${{counties[fip].gdp/1000 | formatNumber}}</span> M

                    <h4>Per Capita Income</h4> 
                    <span class="primary">${{counties[fip].percapitaincome | formatNumber}}</span>

                    <h4>Median Household Income</h4> 
                    <span class="primary">${{counties[fip].medianincome | formatNumber}}</span>
                </div>
                <br>
                <br>
                <hr>
            </td>
        </tr>
        </tbody>
        </table>


        <!--
        <h4>Unemployment Rate</h4>
        -->
        <ExportablePlotly :data="uGraphData" :layout="uGraphLayout"/>

        <!--
        <h4>Population</h4>
        -->
        <ExportablePlotly :data="popGraphData" :layout="popGraphLayout"/>

        <h4>Business Vulnerability</h4>
        <el-alert type="info" v-for="(error, idx) in errors.bvis" :key="idx">{{error}}</el-alert>
        <div v-for="bvi in bvis" :key="bvi.naics">
            <p>
                <b><NaicsInfo :id="bvi.naics"/></b>
            </p>
            <el-row>
                <el-col :span="12">
                    <h4 style="margin: 0"><small>Vulnerable Establishments</small></h4>
                    <ExportablePlotly :data="bvi.estTraces" :layout="bviLayout"/>
                </el-col>
                <el-col :span="12">
                    <h4 style="margin: 0"><small>Vulnerable Employment</small></h4>
                    <ExportablePlotly :data="bvi.empTraces" :layout="bviLayout"/>
                </el-col>
            </el-row>
        </div>

        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
    </div>
    <Footer/>
</div>
</template>

<script>

import { Component, /*Prop,*/ Vue, Watch } from 'vue-property-decorator';

import TopMenu from '@/components/TopMenu.vue'
import CountySelecter from '@/components/CountySelecter.vue'
import MultipleCountySelecter from '@/components/MultipleCountySelecter.vue'
import RegionSelecter from '@/components/RegionSelecter.vue'
import ExportablePlotly from '@/components/ExportablePlotly.vue'
import NaicsInfo from '@/components/NaicsInfo.vue'

import Footer from '@/components/Footer.vue'

@Component({
    components: { 
        TopMenu, 
        CountySelecter, 
        RegionSelecter, 
        ExportablePlotly, 
        MultipleCountySelecter,
        NaicsInfo,
        Footer,
    }
})
export default class Compare extends Vue {

    fips = []; //list of fips selected

    counties = {};//county details loaded for comparision

    //list of aggregation errors
    errors = {
        bvis: [],
    }

    uGraphLayout = {
        title: {
            text: 'Unemployment Rate',
            font: {
                family: 'Avenir,Helvetica,Arial,sans-serif',
                size: 17,
                bold: true,
                color: '#666',
            },
            x: 0,
            y: 0.7,
        },
        height: 350,
        margin: {
            l: 30,
            r: 20,
            //t: 10,
            //b: 30,
        },
        legend: {orientation: 'h', x: 0, y: 2.2},
        yaxis: {rangemode: 'tozero', ticksuffix: "%"},
    }

    get stateDiffers() {
        let differ = false;
        let state = null;
        this.fips.forEach(fip=>{
            if(state == null) state = this.counties[fip].state;
            if(this.counties[fip].state != state) differ = true;
        });
        return differ;
    }

    get uGraphData() {
        const traces = [];
        this.fips.forEach(fip=>{
            if(!this.counties[fip]) return; //not yet loaded?
            const detail = this.counties[fip];
            if(detail.loading) return;
            traces.push({
                x: detail.distress_ur.date,
                y: detail.distress_ur.rate,
                name: detail.county+","+detail.state,
                line: { width: 1, },
                showlegend: true,
            })
        });
        return traces;
    }

    popGraphLayout = {
        title: {
            text: 'Population',
            font: {
                family: 'Avenir,Helvetica,Arial,sans-serif',
                size: 17,
                bold: true,
                color: '#666',
            },
            x: 0,
        },
        height: 175,
        margin: {
            l: 30,
            r: 20,
            t: 30,
            b: 20,
        },
        //legend: {orientation: 'h', side: 'bottom'},
        showlegend: false,
        yaxis: {rangemode: 'tozero',/*ticksuffix: "%"*/},
    }

    get popGraphData() {

        /*
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
        */

        const traces = [];
        this.fips.forEach(fip=>{
            if(!this.counties[fip]) return; //not yet loaded?
            const detail = this.counties[fip];
            if(detail.loading) return;

            //aggreage all groups into total..
            const y = [];
            detail.pops.groups.forEach(group=>{
                group.y.forEach((v,idx)=>{
                    if(!y[idx]) y[idx] = 0;
                    y[idx] += v;
                });
            });

            //then create a graph for each county
            traces.push({
                x: detail.pops.years,
                y,
                name: detail.county+","+detail.state,
                line: { width: 1, },
            });
        });
        return traces;
    }

    @Watch('$route')
    onRouteChange(nv, ov) {
        if(ov == nv) return;
    }

    @Watch('fips')
    onFipsChange() {
        //load fips that we haven't loaded yet
        this.fips.forEach(fip=>{
            if(!this.counties[fip]) {
                Vue.set(this.counties, fip, {loading: true});
                fetch(this.$root.dataUrl+"/counties/county."+fip+".json").then(res=>res.json()).then(data=>{
                    Vue.set(this.counties, fip, data);
                });
            }
        });
    }

    regionSelected({id, fips}) {
        this.fips = fips;
    }

    /*
    init(fips) {
        this.fips = fips;
    }
    removeCounty(county) {
        this.counties.splice(this.counties.indexOf(county), 1);
    }

    addCounty(fips) {
        const entry = {
            fips, detail: null,
        };
        fetch(this.$root.dataUrl+"/counties/county."+fips+".json").then(res=>res.json()).then(data=>{
            //console.log("finished loading", fips);
            entry.detail = data;
        });
        this.counties.push(entry);
    }
    */

    mounted() {
        //console.log("initial selection from params", this.$route.params.fips)
        this.fips = this.$route.params.fips.split(",");
    }
    
    selectRegion({fips, id}) {
        //console.log("selected region", fips, id);
    }

    bviLayout = {
        height: 175,
        margin: {
            l: 30,
            r: 30,
            t: 10,
            b: 30,
        },
        /*
        legend: {
            y: 1.15,
            bgcolor: 'rgba(255, 255, 255, 0)',
            bordercolor: 'rgba(255, 255, 255, 0)',
            orientation: 'h',
            font: { size: 10 },
        },
        */
        showlegend: false,

        //barmode: 'stack',
        xaxis: {
            type: 'category', //show all years
        },
        yaxis: {rangemode: 'tozero'},
    }

    get bvis() {
        this.errors.bvis = [];

        //find sectors that has non-0 vulnerability in any counties
        const vulnNaics = []
        //let minyear = Infinity;
        //let maxyear = -Infinity;
        const allYears = [];
        this.fips.forEach(fip=>{
            if(!this.counties[fip]) return; //not yet loaded?
            const detail = this.counties[fip];
            if(detail.loading) return;

            for(const naics in detail.bvis2) {
                const data = detail.bvis2[naics];
                if(!data) {
                    //this.errors.bvis.push("No BVI("+naics+") information for "+detail.county);
                    return;
                }
                let vuln = false;
                data.estab_v.forEach(v=>{
                    if(v != 0) vuln = true;
                });
                data.emp_v.forEach(v=>{
                    if(v != 0) vuln = true;
                });
                if(vuln && !vulnNaics.includes(naics)) vulnNaics.push(naics);

                //if(minyear > data.years[0]) minyear = data.years[0];
                //if(maxyear < data.years[data.years.length-1]) maxyear = data.years[data.years.length-1];
                data.years.forEach(y=>{
                    if(!allYears.includes(y)) allYears.push(y);
                })
            }
        });

        allYears.sort();

        const bvis = [];
        /*
            {
                naics: "20",
                data: "todo",
            }    
        */

        //now create graphs for naics code with vulnerable businesses
        vulnNaics.forEach(naics=>{
            const estTraces = []; //for each county
            const empTraces = []; //for each county
            this.fips.forEach(fip=>{
                if(!this.counties[fip]) return; //not yet loaded?
                const detail = this.counties[fip];
                if(detail.loading) return;
                const data = detail.bvis2[naics];
                if(!data) {
                    this.errors.bvis.push("No BVI("+naics+") information for "+detail.county);
                    return;
                }

                //make sure data has all years between min/max
                const estabV = [];
                const empV = [];
                allYears.forEach(y=>{
                    const idx = data.years.indexOf(y);
                    if(~idx) {
                        estabV.push(data.estab_v[idx]);
                        empV.push(data.emp_v[idx]);
                    } else {
                        //value missing.. add 0
                        estabV.push(0);
                        empV.push(0);
                    }
                });

                estTraces.push({
                    //x: data.years,
                    x: allYears,
                    //y: data.estab_v,
                    y: estabV,
                    name: detail.county+","+detail.state,
                    //mode: 'lines',
                    mode: 'lines',
                    line: { width: 1, /*shape: 'spline'*/},
                    fill: "tozeroy",
                    fillcolor: 'rgba(0,0,0,0.02)',
                    //opacity: 0.1,
                    //type: 'bar',
                    //marker: { color: '#6008', },
                });
                empTraces.push({
                    //x: data.years,
                    x: allYears,
                    //y: data.emp_v,
                    y: empV,
                    name: detail.county+","+detail.state,
                    mode: 'lines',
                    line: { width: 1, },
                    fill: "tozeroy",
                    fillcolor: 'rgba(0,0,0,0.02)'
                    //type: 'bar',
                    //marker: { color: '#6008', },
                });
            });
            bvis.push({naics, estTraces, empTraces})
        });
        return bvis;
    }

}
</script>

<style scoped lang="scss">
.header {
position: sticky;
top: 50px;
box-shadow: none;
background-color: white;
}
h3 {
    margin: 0;
}
h4 {
    opacity: 0.7;
    margin: 20px 0 5px 0;
}
table h4, table h3 {
    font-size: 90%;
}
h5 {
    margin-bottom: 5px;
}
.primary {
    color: #409EFF;
    font-weight: bold;
    font-size: 130%;
}
.county {
    border-left: 1px solid #ddd;
}
.table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
}
thead {
    border-bottom: 1px solid #eee;
}
thead th {
    text-align: left;
    padding-bottom: 10px;
}
tbody th {
    text-align: right;
    padding-right: 10px;
}
.county-selecter {
    border: 3px solid #eee;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 10px;
    p {
        margin: 5px 0;
        margin-bottom: 10px;
        line-height: 200%;
    }
}
</style>

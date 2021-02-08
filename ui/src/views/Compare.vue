<template>
<div>
    <TopMenu/>
    <div class="page">
        <div class="header">
            <el-row :gutter="10">
                <el-col v-for="county in counties" :key="county.fips" :span="8">
                    <div v-if="county.detail">
                        <br>
                        <h4>{{county.detail.county}}, {{county.detail.state}}
                        <el-button type="info-circle" icon="el-icon-delete" size="mini" circle 
                            @click="removeCounty(county)"></el-button>
                        </h4>
                    </div>
                    <div v-else style="padding: 10px;"><small>Loading...</small></div>
                </el-col>
                <el-col :span="8" v-if="counties.length < 3">
                    <CountySelecter @select="addCounty($event)" placeholder="Add County to compare"/>
                </el-col>
            </el-row>
            <br>
        </div>

        Test..
        <RegionSelecter @select="selectRegion($event)" placeholder="Add Region to compare to"/>

        <br>
        <el-row :gutter="10">
            <el-col v-for="county in counties" :key="county.fips" :span="8">
                <div v-if="county.detail">
                    <h4>Population</h4>
                    <p>
                        <span class="primary">{{county.detail.population | formatNumber}}</span>
                    </p>

                    <h4>Population Density</h4>
                    <p>
                        <span class="primary">{{county.detail.popdensity | formatNumber}}</span> people per sq. mile.
                    </p>

                    <h4>Area</h4>
                    <p>
                        <span class="primary">{{county.detail.area}}</span> sq. miles
                    </p>

                    <h4>GDP</h4>
                    <p>
                        <span class="primary">${{county.detail.gdp/1000 | formatNumber}}</span> M
                    </p>

                    <h4>Per Capita Income</h4>
                    <p>
                        <span class="primary">${{county.detail.percapitaincome | formatNumber}}</span>
                    </p>

                    <h4>Median Household Income</h4>
                    <p>
                        <span class="primary">${{county.detail.medianincome | formatNumber}}</span>
                    </p>
                </div>
                <div v-else style="padding: 10px;"><small>Loading...</small></div>
            </el-col>
            <el-col :span="8" v-if="counties.length < 2"><!--placeholder--></el-col>
        </el-row>
    </div>
</div>
</template>

<script>

import { Component, /*Prop,*/ Vue, Watch } from 'vue-property-decorator';

import TopMenu from '@/components/TopMenu.vue'
import CountySelecter from '@/components/CountySelecter.vue'
import RegionSelecter from '@/components/RegionSelecter.vue'

@Component({
    components: { TopMenu, CountySelecter, RegionSelecter }
})
export default class Compare extends Vue {

    counties = []; 

    @Watch('$route')
    onRouteChange(nv, ov) {
        if(ov == nv) return;
    }

    init(fips) {
        fips.forEach(fip=>{
            this.addCounty(fip);
        });
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

    mounted() {
        //console.log("initial selection from params", this.$route.params.fips)
        const fips = this.$route.params.fips.split(",");
        this.init(fips);
    }
    
    selectRegion({fips, id}) {
        console.log("selected region", fips, id);
    }
}
</script>

<style scoped lang="scss">
.header {
position: sticky;
top: 50px;
box-shadow: none;
border-bottom: 1px solid #ddd;
background-color: white;
}
h4 {
    opacity: 0.7;
    margin-bottom: 10px;
}
h5 {
    margin-bottom: 5px;
}
.primary {
    color: #409EFF;
    font-weight: bold;
    font-size: 150%;
}
</style>

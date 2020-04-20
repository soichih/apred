<template>
<div>
    <br>
    <el-button type="primary" plain @click="showDetail = true" v-if="!showDetail">
        <i class="el-icon-caret-right"/> This incident maybe eligible for 2018 disaster supplemental funding
    </el-button>

    <div v-if="showDetail">
        <p>
            Applicants who are affected by this disaster may be eligible for <a href="https://www.grants.gov/web/grants/view-opportunity.html?oppId=302953">2018 EDA Disaster Supplemental</a> funding ($587 million). This investment assistance will help communities and regions devise and implement long-term economic recovery strategies through a variety of non-construction and construction projects, as appropriate, to address economic challenges.
        </p>
        <p style="background-color: #eee; padding: 10px;">
            <b>Eligible Applicants</b> 
            <ul>
                <li>Nonprofits</li>
                <li>Public and State controlled institutions of higher education</li>
                <li>City or township governments</li>
                <li>State governments</li>
                <li>County governments</li>
                <li>Special district governments</li>
                <li>Native American tribal governments (Federally recognized)</li>
                <li>Private institutions of higher education</li>
                <li>Others</li>
            </ul>
        </p>
        <p>
            <el-button @click="apply" type="primary" style="width: 100%;"><i class="el-icon-caret-right"/> Apply</el-button>
        </p>
    </div>
</div>
</template>

<script>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Eligibility2018 extends Vue {
    showDetail = false;

    apply() {
        document.location = "https://www.grants.gov/web/grants/view-opportunity.html?oppId=302953";
    }
}
</script>

<style scoped lang="scss">
.title:hover {
color: #409EFF;
}
.el-collapse {
border: none;
}
</style>

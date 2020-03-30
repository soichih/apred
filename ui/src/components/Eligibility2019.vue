<template>
<div class="eligibility">
    <el-collapse>
      <el-collapse-item>
        <template slot="title">
            <div class="title">
                <i class="el-icon-caret-right"/> Maybe eligible for 2019 disaster supplemental funding
            </div>
        </template>
        <p>
            Applicants who are affected by this disaster may be eligible for <a href="https://www.grants.gov/web/grants/view-opportunity.html?oppId=319126">2019 EDA Disaster Supplemental</a> funding ($587 million). This investment assistance will help communities and regions devise and implement long-term economic recovery strategies through a variety of non-construction and construction projects, as appropriate, to address economic challenges.
        </p>
        <p style="background-color: #eee; padding: 10px;">
            <b>Eligible Applicants</b> 
            <ul>
                <li>Nonprofits</li>
                <li>City or township governments</li>
                <li>Special district governments</li>
                <li>County governments</li>
                <li>Public and State controlled institutions of higher education</li>
                <li>Private institutions of higher education</li>
                <li>State governments</li>
                <li>Native American tribal governments (Federally recognized)</li>
                <li>Others</li>
            </ul>
        </p>
        <p>
            <el-button @click="apply" type="primary">Apply</el-button>
        </p>
        <br>
      </el-collapse-item>
    </el-collapse>
</div>
</template>

<script>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Eligibility2019 extends Vue {
/*
    @Prop({default: 0, type: Number}) min;
    @Prop({default: 1, type: Number}) max;
    @Prop({default: 10, type: Number}) height;
    @Prop({type: Number}) value;
*/
    apply() {
        document.location = "https://www.grants.gov/web/grants/view-opportunity.html?oppId=319126";
    }

    /*
    mounted() {
    }
    */

}
</script>

<style scoped lang="scss">
.eligibility {
padding: 10px;
}
.title:hover {
color: #409EFF;
}
.el-collapse {
border: none;
}
</style>

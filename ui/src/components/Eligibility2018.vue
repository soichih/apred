<template>
<div class="eligibility">
    <el-collapse>
      <el-collapse-item title="Elibible for 2018 Disaster Supplemental Funding">
        <p>
            Applicants who are affected by this disaster may be eligible for <a href="https://www.grants.gov/web/grants/view-opportunity.html?oppId=302953">2018 EDA Disaster Supplemental</a> funding ($587 million). This investment assistance will help communities and regions devise and implement long-term economic recovery strategies through a variety of non-construction and construction projects, as appropriate, to address economic challenges.
        </p>
        <p>
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
export default class Eligibility2018 extends Vue {
/*
    @Prop({default: 0, type: Number}) min;
    @Prop({default: 1, type: Number}) max;
    @Prop({default: 10, type: Number}) height;
    @Prop({type: Number}) value;
*/
    apply() {
        document.location = "https://www.grants.gov/web/grants/view-opportunity.html?oppId=302953";
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
</style>

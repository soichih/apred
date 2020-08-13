<template>
<div :class="eventClass">
    <div class="event-header">
        <div class="event-icon">
            <div v-if="event.type == 'dr'" :style="eventIconStyle">
                <i class="el-icon-warning"/>
            </div>
            <div v-else-if="event.type == 'eda2018'" class="eda2018" :class="{'eda2018-state': event.statewide, 'eda2018-county': !event.statewide}">
                <i class="el-icon-money" style="background-color: green; border-radius: 50%; color: white;"/>
            </div>
        </div>

        <h3 v-if="event.type == 'dr'" :style="eventIconStyle">
            <span style="float: right;">
                <el-tag class="program-tag" size="small" type="warning" v-if="event.hmProgramDeclared" title="Hazard Mitigation Program">
                    <a href="https://www.fema.gov/media-library/assets/documents/107704" target="fema">⚠️ </a>
                </el-tag>&nbsp;
                <el-tag class="program-tag" size="small" type="danger" v-if="event.ihProgramDeclared" title="Individuals and Households Program">
                    <a href="https://www.fema.gov/media-library/assets/documents/24945" target="fema"><i class="el-icon-house"/></a>
                </el-tag>&nbsp;
                <el-tag class="program-tag" size="small" v-if="event.iaProgramDeclared" title="Individual Assistance Progra">
                    <a href="https://www.fema.gov/media-library/assets/documents/133744" target="fema"><i class="el-icon-user"/></a>
                </el-tag>&nbsp;
                <a :href="'https://www.fema.gov/disaster/'+event.disasterNumber" target="fema">
                    <el-tag size="small" effect="plain" type="info">Disaster # {{event.disasterNumber}}</el-tag>&nbsp;
                </a>
            </span>
            <el-tag type="info" style="position: relative; top: -2px;" v-if="event.statewide">STATEWIDE</el-tag> &nbsp;
            <el-tag type="info" style="position: relative; top: -2px;" v-if="event.tribe">{{event.designatedArea}}</el-tag> &nbsp;
            <b>{{event.incidentType}}</b> &nbsp;
            <br>
        </h3>

        <h3 v-else-if="event.type == 'eda2018'" class="eda2018" :class="{'eda2018-state': event.statewide, 'eda2018-county': !event.statewide}">
            <el-tag size="small" effect="dark" type="success" style="float: right;">fain: {{event.fain}}</el-tag>
            <b v-if="event.statewide">Statewide</b>
            EDA 2018 Disaster Supplemental Award
            <span style="opacity: 0.5;"> | </span>
            ${{event.award_amount | formatNumber}}
        </h3>
    </div>

    <div class="event-body">
        <div v-if="event.type == 'dr'">
            <div class="event-date">
                <small style="opacity: 0.6;">Incident date from </small>
                &nbsp;
                <time title="Incident Begin Date">{{new Date(event.incidentBeginDate).toLocaleDateString()}}</time>
                <small>
                    <time v-if="event.incidentEndDate" title="Incident End Date"> to {{new Date(event.incidentEndDate).toLocaleDateString()}}</time>
                    <span v-else> - ongoing</span>
                </small>
            </div>
            <span style="opacity: 0.9; font-style: italic;">{{event.declarationTitle}}</span> &nbsp;
            <small style="opacity: 0.6;">
                declared on {{event.date.toLocaleDateString()}}
            </small>
            <slot/>
        
            <p style="line-height: 200%; margin-bottom: 0;">
                <!-- https://www.fema.gov/openfema-dataset-disaster-declarations-summaries-v1 -->

                <el-tag class="program-tag" size="small" effect="plain" type="info" style="cursor: pointer"
                    title="Total project amount"
                    v-if="event.paProgramDeclared" @click="show_pa = !show_pa">
                    <i class="el-icon-caret-right" v-if="!show_pa"/> 
                    <i class="el-icon-caret-bottom" v-if="show_pa"/> 
                    Public Assistance Program 
                    <span v-if="event.pa">({{event.pa.length}} projects | ${{totalPA(event.pa)|formatNumber}})</span>
                </el-tag>&nbsp;
            </p>

            <slide-up-down :active="show_pa" style="background-color: #eee; padding: 10px;">
                <div v-if="!event.pa">
                    <p>
                        There are no funded PA project associated with this disaster.
                    </p>
                </div>
                <div v-if="event.pa">
                    <p style="font-size: 95%; opacity: 0.7">FEMA funded Public-Assistance projects associated with this disaster declaration.</p>
                    <el-table border :data="event.pa" style="width: 100%" :default-sort="{prop: 'obligatedDate', order: 'ascending'}" height="400">
                        <el-table-column prop="pwNumber" label="PW" width="60"/>
                        <el-table-column prop="dcc" label="" width="40"/>
                        <el-table-column sortable prop="damageCategory" label="Damage Category" width="175"/>
                        <el-table-column sortable prop="projectSize" label="Project Size"/>
                        <el-table-column sortable prop="projectAmount" label="Project Amount">
                            <template slot-scope="scope">
                                ${{scope.row.projectAmount|formatNumber}}
                            </template>
                        </el-table-column>
                        <el-table-column sortable prop="totalObligated" label="Total Obligated">
                            <template slot-scope="scope">
                                ${{scope.row.totalObligated|formatNumber}}
                            </template>
                        </el-table-column>
                        <el-table-column sortable prop="federalShareObligated" label="Federal Share Obligated">
                            <template slot-scope="scope">
                                ${{scope.row.federalShareObligated|formatNumber}}
                            </template>
                        </el-table-column>
                        <el-table-column sortable prop="obligatedDate" label="Obligated Date">
                            <template slot-scope="scope">
                                {{new Date(scope.row.obligatedDate).toLocaleDateString()}}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <p>
                    For more information, please see 
                    <a href="https://www.fema.gov/media-library/assets/documents/90743" target="fema">Public Assistance Program</a>
                </p>
            </slide-up-down>
        </div>

        <div v-else-if="event.type == 'eda2018'">
            <div class="event-date">
                <small style="opacity: 0.6;">grant awarded on </small>
                &nbsp;
                <time title="Grant Award Date">{{new Date(event.grant_award_date).toLocaleDateString()}}</time>
            </div>

            <b>To:</b> <!--{{event.grantee}},-->{{event.grantee_name}},
            {{event.grantee_city}}, {{event.grantee_state}}<br>
        
            <br>

            <b>For:</b> {{event.grant_purpose}} 
            <br>
            <br>
            <b>Regional Office:</b> {{event.eda_regional_office}}
            <slot/>
        </div>

        <!--other things?-->
        <div v-else>
            {{event}}
        </div>

    </div>

</div>
</template>


<script>
import { Component, Prop, Vue } from 'vue-property-decorator';

import SlideUpDown from 'vue-slide-up-down'

@Component({
    components: {
        SlideUpDown,
    }
})
export default class Event extends Vue {
    @Prop({type: Object}) event;
    @Prop({type: Object}) layers;

    show_pa = false;

    get eventClass() {
        const c = [];
        if(this.event.type == "dr") {
            if(this.event.statewide) c.push('dr-state');
            if(this.event.tribe) c.push('dr-tribe');
            else c.push('dr-county');
        }

        return c;
    }

    get eventDateTitle() {
        if(this.event.type == "eda2018") return "Grant Award Date";
        else return "Incident Date";
    }

    get eventIconStyle() {
        let color = this.layers['other'].color;

        //use incident specific color if available
        let type = this.event.incidentType.toLowerCase();
        if(~type.indexOf("(")) type = type.substring(0, type.indexOf("(")); 
        type = type.trim();
        if(this.layers[type]) color = this.layers[type].color;

        return { color };
    }

    totalPA(pas) {
        return pas.reduce((a,v)=>{
            return a + v.projectAmount;
        }, 0);
    }
}
</script>

<style scoped lang="scss">
h3 {
margin: 0;
padding-top: 8px;
}
.primary {
    font-weight: bold;
    font-size: 170%;
    color: #409EFF;
}
.event-date {
    padding-top: 8px;
    margin-bottom: 20px;
}
.event-header {
    .event-icon {
        float: left;
        display: inline-block;
        width: 50px;
        font-size: 225%;
        position: relative;
        top: 2px;
    }
}
.event-body {
    padding-bottom: 10px;
    border-left: 3px solid #0001;
    margin-left: 17px;
    padding-left: 30px;
}
.eda2018 {
color: green;
}
.program-tag a {
color: gray;
}
.dr-state {
background-color: #eee;
padding: 5px 10px;
margin: -5px -10px;
border-radius: 5px;
margin-bottom: 10px;
}
.dr-tribe {
background-color: #cdd;
padding: 5px 10px;
margin: -5px -10px;
border-radius: 5px;
margin-bottom: 10px;
}
</style>

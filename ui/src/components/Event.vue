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
                <el-tag size="small" effect="light" type="info">Disaster # {{event.disasterNumber}}</el-tag>&nbsp;
            </span>
            <el-tag type="info" style="position: relative; top: -2px;" v-if="event.declaredCountyArea == 'Statewide'">STATEWIDE</el-tag> &nbsp;
            <b>{{event.incidentType}}</b> &nbsp;
            <br>
        </h3>

        <h3 v-else-if="event.type == 'eda2018'" class="eda2018" :class="{'eda2018-state': event.statewide, 'eda2018-county': !event.statewide}">
            <el-tag size="small" effect="dark" type="success" style="float: right;">fain: {{event.fain}}</el-tag>
            <b v-if="event.statewide">Statewide</b>
            EDA 2018 Award
            <span style="opacity: 0.5;"> | </span>
            ${{event.award_amount | formatNumber}}
        </h3>
    </div>

    <div class="event-body">
        <div class="event-date" :title="eventDateTitle">{{event.date.toLocaleDateString()}}</div>
        <div v-if="event.type == 'dr'">
            <span style="font-size: 85%;">{{event.title}}</span> &nbsp;
            <span style="opacity: 0.6; font-size: 85%;">
                <!--Declared: <time>{{new Date(event.declarationDate).toLocaleDateString()}}</time>&nbsp; &bull;-->
                Incident <time>{{new Date(event.incidentBeginDate).toLocaleDateString()}}</time>
                - <time v-if="event.incidentEndDate">{{new Date(event.incidentEndDate).toLocaleDateString()}}</time>
                <span v-else>On Going</span>
            </span>
        
            <p style="line-height: 200%; margin-bottom: 0;">
                <!-- https://www.fema.gov/openfema-dataset-disaster-declarations-summaries-v1 -->
                <el-tag class="program-tag" size="small" effect="plain" type="info" v-if="event.hmProgramDeclared">
                    <a href="https://www.fema.gov/media-library/assets/documents/107704">Hazard Mitigation Program</a>
                </el-tag>&nbsp;
                <el-tag class="program-tag" size="small" effect="plain" type="info" v-if="event.ihProgramDeclared">
                    <a href="https://www.fema.gov/media-library/assets/documents/24945">Individuals and Households Program</a>
                </el-tag>&nbsp;
                <el-tag class="program-tag" size="small" effect="plain" type="info" v-if="event.iaProgramDeclared">
                    <a href="https://www.fema.gov/media-library/assets/documents/133744">Individual Assistance Program</a>
                </el-tag>&nbsp;
                <el-tag class="program-tag" size="small" effect="plain" type="info" v-if="event.paProgramDeclared">
                    <a href="https://www.fema.gov/media-library/assets/documents/90743">Public Assistance Program</a>
                </el-tag>&nbsp;
            </p>

            <div v-if="event.pa">
                <br>
                <div style="margin-bottom: 5px">
                    <el-button type="success" size="mini" @click="show_pa = true" v-if="!show_pa">
                        <i class="el-icon-caret-right"/> Show Funded Projects
                    </el-button>
                    <el-button type="success" size="mini" @click="show_pa = false" v-if="show_pa">
                        <i class="el-icon-caret-bottom"/> Hide Funded Projects
                    </el-button>
                </div>
                <div v-if="show_pa">
                    <p style="font-size: 95%; opacity: 0.7">This table shows FEMA funded Public-Assistance projects associated with this disaster declaration.</p>
                    <el-table border :data="event.pa" style="width: 100%" :default-sort="{prop: 'obligatedDate', order: 'ascending'}">
                        <el-table-column prop="pwNumber" label="PW" width="60"/>
                        <el-table-column prop="dcc" label="" width="40"/>
                        <el-table-column sortable prop="damageCategory" label="Damage Category" width="175"/>
                        <el-table-column sortable prop="projectSize" label="Project Size"/>
                        <el-table-column sortable prop="projectAmount" label="Project Amount">
                            <template slot-scope="scope">
                                ${{scope.row.projectAmount.toFixed(2)}}
                            </template>
                        </el-table-column>
                        <el-table-column sortable prop="totalObligated" label="Total Obligated">
                            <template slot-scope="scope">
                                ${{scope.row.totalObligated.toFixed(2)}}
                            </template>
                        </el-table-column>
                        <el-table-column sortable prop="federalShareObligated" label="Federal Share Obligated">
                            <template slot-scope="scope">
                                ${{scope.row.federalShareObligated.toFixed(2)}}
                            </template>
                        </el-table-column>
                        <el-table-column sortable prop="obligatedDate" label="Obligated Date">
                            <template slot-scope="scope">
                                {{new Date(scope.row.obligatedDate).toLocaleDateString()}}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>

        <div v-else-if="event.type == 'eda2018'">

            <b>To:</b> <!--{{event.grantee}},-->{{event.grantee_name}},
            {{event.grantee_city}}, {{event.grantee_state}}<br>
        
            <br>

            <b>For:</b> {{event.grant_purpose}} 
            <span>&gt; Project Funding: ${{event.total_project_funding | formatNumber}}</span>
    j
            <br>
            <br>
            <b>Regional Office:</b> {{event.eda_regional_office}}
        </div>

        <!--other things?-->
        <div v-else>
            {{event}}
        </div>

        <slot/>
    </div>

</div>
</template>


<script>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Event extends Vue {
    @Prop({type: Object}) event;
    @Prop({type: Object}) layers;

    show_pa = false;

    get eventClass() {
        const c = [];
        if(this.event.type == "dr") {
            if(this.event.declaredCountyArea == 'Statewide') c.push('dr-state');
            else c.push('dr-county');
        }

        return c;
    }

    get eventDateTitle() {
        if(this.event.type == "eda2018") return "Grant Award Date";
        else return "Disaster Declaration Date";
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
    border-left: 3px solid #eee;
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
margin-bottom: 5px;
}
</style>

<template>
<div>
    <div class="event-header">
        <div class="event-icon">
            <div v-if="event.type == 'dr'" class="dd" :class="eventClass" :style="eventStyle">
                <i class="el-icon-warning"/>
            </div>
            <div v-else-if="event.type == 'eda2018'" class="eda2018" :class="{'eda2018-state': event.statewide, 'eda2018-county': !event.statewide}">
                <i class="el-icon-money" style="background-color: green; border-radius: 50%; color: white;"/>
            </div>
        </div>

        <h3 v-if="event.type == 'dr'" class="dd" :class="eventClass" :style="eventStyle">
            <span style="float: right;">
                <el-tag size="small" effect="light" type="info">Disaster # {{event.disasterNumber}}</el-tag>&nbsp;

            </span>
            <b v-if="!event.countyfips">STATEWIDE <i class="el-icon-arrow-right"/> </b> &nbsp;
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
            <div>
                <span style="font-size: 85%;">{{event.title}}</span> &nbsp;
                <span style="opacity: 0.6; font-size: 85%;">
                    <!--Declared: <time>{{new Date(event.declarationDate).toLocaleDateString()}}</time>&nbsp; &bull;-->
                    Incident <time>{{new Date(event.incidentBeginDate).toLocaleDateString()}}</time>
                    - <time>{{new Date(event.incidentEndDate).toLocaleDateString()}}</time>
                </span>
            
                <p style="line-height: 200%; margin-bottom: 0;">
                    <!-- https://www.fema.gov/openfema-dataset-disaster-declarations-summaries-v1 -->
                    <el-tag size="small" effect="plain" type="info" v-if="event.hmProgramDeclared" title="hmProgramDeclared">
                        <a href="https://www.fema.gov/media-library/assets/documents/107704">Hazard Mitigation Program</a>
                    </el-tag>&nbsp;
                    <el-tag size="small" effect="plain" type="info" v-if="event.ihProgramDeclared" title="ihProgramDeclared">
                        <a href="https://www.fema.gov/media-library/assets/documents/24945">Individuals and Households Program</a>
                    </el-tag>&nbsp;
                    <el-tag size="small" effect="plain" type="info" v-if="event.iaProgramDeclared" title="iaProgramDeclared">
                        <a href="https://www.fema.gov/media-library/assets/documents/133744">Individual Assistance Program</a>
                    </el-tag>&nbsp;
                    <el-tag size="small" effect="plain" type="info" v-if="event.paProgramDeclared" title="paProgramDeclared">
                        <a href="https://www.fema.gov/media-library/assets/documents/90743">Public Assistance Program</a>
                    </el-tag>&nbsp;
                </p>
            </div>
        </div>

        <div v-else-if="event.type == 'eda2018'">

            <b>To:</b> <!--{{event.grantee}},-->{{event.grantee_name}},
            {{event.grantee_city}}, {{event.grantee_state}}<br>
        
            <br>

            <b>For:</b> {{event.grant_purpose}} 
            <span>&gt; Project Funding: ${{event.total_project_funding | formatNumber}}</span>

            <br>
            <br>
            <b>Regional Office:</b> {{event.eda_regional_office}}
        </div>
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
export default class BarGraph extends Vue {
    @Prop({type: Object}) event;
    @Prop({type: Object}) layers;

    get eventClass() {
        const c = [];
        //TODO - I should use declaredCountyArea == 'Statewide' instead?
        if(this.event.countyfips) c.push('dr-county');
        else c.push('dr-state');

        return c;
    }

    get eventDateTitle() {
        if(this.event.type == "eda2018") return "Grant Award Date";
        else return "Disaster Declaration Date";
    }

    get eventStyle() {
        let color = this.layers['other'].color;

        //use incident specific color if available
        let type = this.event.incidentType.toLowerCase();
        if(~type.indexOf("(")) type = type.substring(0, type.indexOf("(")); 
        //type = type.replace(/\s/g, '');
        type = type.trim();
        if(this.layers[type]) color = this.layers[type].color;

        const s = {
            //borderLeft: 'solid 3px '+color, 
            color: color,
        }

        return s;
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

</style>

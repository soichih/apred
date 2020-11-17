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

        <h3 :style="eventIconStyle" v-if="event.type == 'dr'">
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
            <el-tag size="small" type="warning" v-if="event.counties.length">Multi-county({{event.counties.length}}) Award</el-tag>
        </h3>
    </div>

    <div class="event-body">
        <div v-if="event.type == 'dr'">
            <slot/>
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

            <h3 :style="eventIconStyle">
                <span>
                    <el-tag class="program-tag" size="mini" type="warning" v-if="event.hmProgramDeclared">
                        <a href="https://www.fema.gov/grants/mitigation/hazard-mitigation" target="fema">Hazard Mitigation</a>
                    </el-tag>&nbsp;
                    <el-tag class="program-tag" size="mini" type="danger" v-if="event.ihProgramDeclared">
                        <a href="https://www.fema.gov/assistance/individual/program" target="fema">Individuals and Households</a>
                    </el-tag>&nbsp;
                    <el-tag class="program-tag" size="mini" v-if="event.iaProgramDeclared" title="Individual Assistance Program">
                        <a href="https://www.fema.gov/assistance/individual" target="fema">Individual Assistance</a>
                    </el-tag>&nbsp;
                    <a :href="'https://www.fema.gov/disaster/'+event.disasterNumber" target="fema">
                        <el-tag size="mini" effect="plain" type="info">Disaster # {{event.disasterNumber}}</el-tag>&nbsp;
                    </a>
                </span>
            </h3>
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
        let color = this.$root.layers['other'].color;

        //use incident specific color if available
        let type = this.event.incidentType.toLowerCase();
        if(~type.indexOf("(")) type = type.substring(0, type.indexOf("(")); 
        type = type.trim();
        if(this.$root.layers[type]) color = this.$root.layers[type].color;

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

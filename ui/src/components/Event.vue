<template>
<div :class="eventClass" class="event">

    <div class="event-header">
        <div class="left-content">
            <div v-if="event.type == 'eda2018'" class="event-date">
                <small style="opacity: 0.6;">grant awarded on </small>
                &nbsp;
                <time title="Grant Award Date">{{new Date(event.grant_award_date).toLocaleDateString()}}</time>
            </div>

            <div v-if="event.type == 'dr'">
                <div class="event-date">
                    <time title="Incident Begin Date">{{new Date(event.incidentBeginDate).toLocaleDateString()}}</time>
                    <small>
                        <time v-if="event.incidentEndDate" title="Incident End Date"> to {{new Date(event.incidentEndDate).toLocaleDateString()}}</time>
                        <span v-else> - ongoing</span>
                    </small>
                </div>
                <p style="float: right;">
                    <el-tag type="info" v-if="event.statewide">STATEWIDE</el-tag>
                    <el-tag type="info" v-if="event.tribe">{{event.designatedArea}}</el-tag>
                </p>
            </div>
        </div>

        <div style="margin-left: 200px;">
            <div class="event-icon">
                <span v-if="event.type == 'dr'" :style="eventIconStyle">
                    <i class="el-icon-warning"/>
                </span>
                <span v-else-if="event.type == 'eda2018'" class="eda2018" :class="{'eda2018-state': event.statewide, 'eda2018-county': !event.statewide}">
                    <i class="el-icon-money" style="background-color: green; border-radius: 50%; color: white;"/>
                </span>
            </div>

            <div style="float: right; margin-top: 8px">
                <a v-if="event.type == 'dr'" :href="'https://www.fema.gov/disaster/'+event.disasterNumber" target="fema">
                    <el-tag size="small" effect="plain" type="info">Disaster # {{event.disasterNumber}}</el-tag>&nbsp;
                </a>
                <a v-if="event.type == 'eda2018'">
                    <el-tag size="small" effect="dark" type="success" style="float: right;">FAIN {{event.fain}}</el-tag>
                </a>
            </div>

            <h3 :style="eventIconStyle" v-if="event.type == 'dr'" class="event-type">
                <b>{{event.incidentType}}</b> &nbsp;
                <br>
            </h3>

            <h3 v-else-if="event.type == 'eda2018'" class="eda2018 event-type" :class="{'eda2018-state': event.statewide, 'eda2018-county': !event.statewide}">
                <b v-if="event.statewide">Statewide</b>
                EDA 2018 Disaster Supplemental Award
                <span style="opacity: 0.5;"> | </span>
                ${{event.award_amount | formatNumber}}
                <el-tag type="info" effect="plain" v-if="event.counties.length" size="small">Multi-county({{event.counties.length}})</el-tag>
            </h3>
        </div>
    </div>

    <div class="event-body">
        <div v-if="event.type == 'dr'">
            <p style="opacity: 0.9; font-style: italic; margin: 0; padding: 10px 0;">{{event.declarationTitle}}</p>

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
                </span>
            </h3>

            <slot/>
        </div>

        <div v-else-if="event.type == 'eda2018'" style="margin-top: 8px;">

            <small>To</small> <!--{{event.grantee}},-->{{event.grantee_name}},
            {{event.grantee_city}}, {{event.grantee_state}}<br>
            <br>

            <small>For</small> {{event.grant_purpose}} 
            <br>
            <br>

            <small>Regional Office</small> {{event.eda_regional_office}}
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
    display: inline-block;
    font-size: 15pt;
}
.primary {
    font-weight: bold;
    font-size: 170%;
    color: #409EFF;
}
.left-content {
    display: inline-block;
    width: 200px;
    padding-right: 10px;
    padding-top: 10px;
    font-size: 90%;
    float: left;

    .event-date {
        text-align: right;
    }
}
.event-header {
    .event-icon {
        display: inline-block;
        width: 50px;
        font-size: 170%;

        position: relative;
        top: 3px;
        left: 2px;
    }
}
.event-body {
    margin-left: 224px;

    border-left: 3px solid #0001;

    padding-bottom: 10px;
    padding-left: 24px;
}
.event-type {
    position: relative;
    left: -8px;
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
    background-color: #eee;
    padding: 5px 10px;
    margin: -5px -10px;
    border-radius: 5px;
    margin-bottom: 10px;
}
</style>

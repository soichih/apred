<template>
<div class="eventdetail">
    <span class="event-date">{{event.date.toLocaleDateString()}}</span>
    <div v-if="event.type == 'dr'" class="dd" :class="eventClass" :style="eventStyle">
        <div style="float: left; width: 40px; font-size: 200%; position: relative; top: 0px; padding-left: 3px;">
            <i class="el-icon-warning"/>
        </div>
        <span style="float: right;">
            <!--
            <el-tag size="small" type="danger">{{event.incidentType}}</el-tag>&nbsp;
            -->
            <el-tag size="small" effect="light" type="info">Disaster # {{event.disasterNumber}}</el-tag>&nbsp;
            <el-tag size="small" effect="dark" type="warning" v-if="event.hmProgramDeclared" title="hmProgramDeclared">hm</el-tag>&nbsp;
            <el-tag size="small" effect="dark" type="danger" v-if="event.ihProgramDeclared" title="ihProgramDeclared">ih</el-tag>&nbsp;
            <el-tag size="small" effect="dark" type="success" v-if="event.iaProgramDeclared" title="iaProgramDeclared">ia</el-tag>&nbsp;
            <el-tag size="small" effect="dark" type="" v-if="event.paProgramDeclared" title="paProgramDeclared">pa</el-tag>&nbsp;
        </span>
        <div style="margin-left: 50px; margin-right: 200px;">
            <!--<el-tag v-if="!event.countyfips" size="small" type="info">Statewide</el-tag>-->
            <b v-if="!event.countyfips">Statewide</b>
            {{event.title}}&nbsp;
            <br>
            <span style="opacity: 0.6; font-size: 85%;">
                <!--Declared: <time>{{new Date(event.declarationDate).toLocaleDateString()}}</time>&nbsp; &bull;-->
                Incident <time>{{new Date(event.incidentBeginDate).toLocaleDateString()}}</time>
                - <time>{{new Date(event.incidentEndDate).toLocaleDateString()}}</time>
            </span>
        </div>
    </div>
    <div v-else-if="event.type == 'eda2018'" class="eda2018" :class="{'eda2018-state': event.subtype == 'state', 'eda2018-county': event.subtype == 'county'}">

        <div style="float: left; width: 40px; font-size: 200%; position: relative; top: 0px; padding-left: 3px;">
            <i class="el-icon-money"/>
        </div>
        <div style="margin-left: 50px">
            <div style="float: right; text-align: right;">
                <p>
                    <el-tag size="small" effect="dark" type="success">fain: {{event.fain}}</el-tag>
                </p>
                <!--
                <div style="width: 150px; float: right;">
                    <b>Awared Date:</b><br>
                    <time>{{new Date(event.grant_award_date).toLocaleDateString()}}</time>&nbsp;
                </div>
                -->
                <div>
                    Award:<br>
                    <span class="primary" style="color: #67c23a">${{event.award | formatNumber}}</span>
                </div>
            </div>
            <div>
                <b v-if="event.subtype == 'state'">Statewide</b>
                EDA 2018 Award
            </div>
            <br>
            <span style="font-size: 90%">Regional Office: {{event.eda_regional_office}}</span>
            <br>

            <br>
            <b>To:</b> <!--{{event.grantee}},-->{{event.grantee_name}},
            {{event.grantee_city}}, {{event.grantee_state}}<br>
        
            <br>

            <b>For:</b> {{event.grant_purpose}} 
            <span style="font-size: 85%">(Project Funding: ${{event.total_project_funding | formatNumber}})</span>
        </div>
    </div>
    <div v-else>
        {{event}}
    </div>
</div>
</template>


<script>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BarGraph extends Vue {
    @Prop({type: Object}) event;
    @Prop({type: Object}) colors;

    get eventClass() {
        const c = [];
        if(this.event.countyfips) c.push('dr-county');
        else c.push('dr-state');

        return c;
    }

    get eventStyle() {
        let color = this.colors['other'];

        //use incident specific color if available
        let type = this.event.incidentType.toLowerCase();
        if(~type.indexOf("(")) type = type.substring(0, type.indexOf("(")); 
        //type = type.replace(/\s/g, '');
        type = type.trim();
        if(this.colors[type]) color = this.colors[type];

        const s = {
            borderLeft: 'solid 3px '+color, 
            color: color,
        }

        if(!this.event.countyfips) s.backgroundColor = color+'2'; //statewide

        return s;
    }
}
</script>

<style scoped lang="scss">
/*
.eventdetail {
    font-size: 16px;
}
*/
.dd {
    background-color: white;
    box-shadow: 1px 1px 2px #0001;
    padding: 10px;
    border-radius: 4px;

    //default
    border-left: 3px solid gray;
    color: gray;

    &.dr-state {
        color: #f56c6c;
    }
    &.dd-margin-bottom {
        margin-bottom: 5px;
    }
}
.eda2018 {
    padding: 10px;
    border-radius: 4px;    
    box-shadow: 1px 1px 2px #0001;

    &.eda2018-state {
        border-left: 3px solid #67c23a;
        background-color: #e1f3d8;
        color: #67c23a;
    }
    &.eda2018-county {
        border-left: 3px solid #67c23a;
        background-color: white;
        color: #67c23a;
    }
}
.primary {
    font-weight: bold;
    font-size: 175%;
    color: #409EFF;
}
</style>

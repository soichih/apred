<template>
<div style="position: relative;">
    <svg width="100%" :height="height.toString()+'px'">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%" spreadMethod="padded">
                <stop offset="0%" :style="{'stop-color':color1, 'stop-opacity':1}" />
                <stop offset="100%" :style="{'stop-color':color2, 'stop-opacity':1}" />
            </linearGradient>
        </defs>
        <rect v-if="value" x="0" y="0" width="100%" :height="height" style="fill:url(#grad1)" />
        <rect :x="(value*100)+'%'" y="0" width="100%" :height="height" style="fill:rgb(220,220,220)" />
    </svg>
    <span v-if="value" style="position: absolute; font-size: 85%; font-weight: bold;" :style="{left: 'calc('+(value*100)+'% + 5px)'}">{{value.toFixed(2)}}</span>
    <!--
    <span v-if="us_avg" class="us-avg" :style="{left: 'calc('+(us_avg*100)+'% - 25px)'}">
        US {{us_avg.toFixed(2)}}<br>
        <i class="el-icon-caret-bottom"/>
    </span>
    -->
    <!--
    <span v-if="state" style="position: absolute; top: -2px; opacity: 0.6; font-size: 80%; line-height: 100%; text-align: center;" :style="{left: (state*100)+'%'}">
        State {{state.toFixed(2)}}<br>
        <i class="el-icon-caret-bottom"/>
    </span>
    -->
</div>
</template>

<script>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BarGraph extends Vue {
    @Prop({default: 0, type: Number}) min;
    @Prop({default: 1, type: Number}) max;
    @Prop({default: 10, type: Number}) height;
    @Prop({type: Number}) value;
    @Prop({default: "rgb(255,60,0)", type: String}) color1;
    @Prop({default: "rgb(0,255,60)", type: String}) color2;
    //@Prop({type: Number}) us_avg;
}
</script>

<style scoped lang="scss">
.us-avg {
position: absolute; 
top: -15px; 
opacity: 0.6; 
font-size: 80%; 
line-height: 100%; 
text-align: center;
background-color: white;
padding: 0 5px;
}

</style>

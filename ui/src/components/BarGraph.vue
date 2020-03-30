<template>
<div style="position: relative;">
    <svg width="100%" :height="height.toString()+'px'">
        <rect x="0" y="0" width="100%" :height="height" style="fill:rgb(200,200,200)" />
        <rect v-if="value" x="0" y="0" :width="(value*100)+'%'" :height="height" :style="{fill: color}" />
    </svg>
    <span v-if="value" style="position: absolute; top: 13px; opacity: 0.8; font-weight: bold;" :style="{left: 'calc('+(value*100)+'% - 25px)'}">{{value.toFixed(2)}}</span>
    <span v-if="us_avg" class="us-avg" :style="{left: 'calc('+(us_avg*100)+'% - 25px)'}">
        US {{us_avg.toFixed(2)}}<br>
        <i class="el-icon-caret-bottom"/>
    </span>
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
    @Prop({default: "rgb(60,100,255)", type: String}) color;
    @Prop({type: Number}) us_avg;
    //@Prop({type: Number}) state;
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

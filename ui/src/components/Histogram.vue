<template>
    <div style="position: relative; line-height: 100%; overflow: hidden;">
        <svg xmlns="http://www.w3.org/2000/svg" height="120px" width="100%">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgb(0,200,0);stop-opacity:0.1" />
                <stop offset="50%" style="stop-color:rgb(200,200,0);stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:rgb(200,0,0);stop-opacity:0.1" />
                </linearGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="120" style="fill:url(#grad1);"/>
            <line x1="20" y1="80.5" x2="100%" y2="80.5" style="stroke:rgb(255,255,255);stroke-width: 0.5" />
            <rect v-for="(h, idx) in histogram" :key="idx" :x="idx*8+20" :y="80-60*(h/histMax)" width="6" :height="60*(h/histMax)" 
                style="fill:rgb(255,255,255)"/>
                <!--
            <rect :x="value*8+20" :y="80-60*(histogram[value]/histMax)" width="6" :height="60*(histogram[value]/histMax)" 
                style="fill:rgb(60,100,255)"/>
                -->
        </svg>
        <span v-for="tick in ticks" :key="tick"
            style="position: absolute; top: 80px; opacity: 0.5; font-size: 60%;" 
            :style="{left: (tick*8+22)+'px'}">{{tick}}
        </span>
        <span style="position: absolute; top: 80px; font-size: 110%; font-weight: bold; line-height: 50%; text-align: center;" 
            :style="{left: (value*8+13)+'px', color: 'hsl('+(120-value)+', 30%, 50%)'}">
            <i class="el-icon-caret-top"/><br>
            {{value}}
        </span>
        <span style="position: absolute; top: 10px; left: 8px; opacity: 0.5; font-size: 60%;">{{histMax}}</span>
        <span v-if="ylabel" style="position: absolute; top: 60px; left: -20px; opacity: 0.7; font-size: 70%; transform: rotate(-90deg);">{{ylabel}}</span>
        <span v-if="xlabel" style="position: absolute; top: 95px; left: 50%; opacity: 0.7; font-size: 70%; text-align: center;">{{xlabel}}</span>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BarGraph extends Vue {
    @Prop() readonly histogram!: number[];
    @Prop() readonly value!: number;
    @Prop() readonly ylabel: string|undefined;
    @Prop() readonly xlabel: string|undefined;

    mounted() {
        //console.log("histogram mounted", this.ylabel);
    }

    get ticks() {
        const ts = [];
        for(let i = 0;i < 200; i+=10) {
            ts.push(i);
        }
        return ts;
    }

    get histMax() {
        let max = 1;
        this.histogram.forEach(v=>{
            if(max < v) max = v;
        });
        return max;
    }
}
</script>

<style scoped lang="scss">

</style>
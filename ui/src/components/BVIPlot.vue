<template>
<div>
    <svg viewBox="0 0 1000 270" height="150px" width="450px">
        <!--grid lines-->
        <g>
            <line v-for="(year, idx) in data.years" :key="year" :x1="itox(idx)" y1="20" :x2="itox(idx)" :y2="ptoy(ymin)" style="stroke:rgb(175,175,175);stroke-width:0.5" /> 
            <line v-for="(y, idx) in yticks" :key="idx" :x1="120" :y1="ptoy(y)" :x2="1000" :y2="ptoy(y)" style="stroke:rgb(175, 175, 175);stroke-width: 0.5"/>
        </g>

        <!--x axis / ticks-->
        <g>
            <line :x1="120" :y1="ptoy(ymin)" :x2="1000" :y2="ptoy(ymin)" style="stroke:rgb(100,100,100);" /> 
            <text v-for="(year, idx) in data.years" :key="year" :x="itox(idx)-25" :y="height" class="ticks">{{year}}</text>
        </g>

        <!--y axix / ticks-->
        <g>
            <line x1="120" :y1="ptoy(ymin)" x2="120" :y2="ptoy(ymax)" style="stroke:rgb(100,100,100);" /> 
            <text v-for="(y, idx) in yticks" :key="idx" :x="100" :y="ptoy(y)+8" text-anchor="end" class="ticks">{{y|formatNumber}}</text>
        </g>

        <g>
            <path :d="fillPath(data.total, lineCommand)" fill="rgba(0, 0, 0, 0.2)" stroke="none"/>
            <path :d="linePath(data.total, lineCommand)" fill="none" stroke="#666" stroke-width="3"/>

            <path :d="fillPath(data.vul, lineCommand)" fill="#f403" stroke="none"/>
            <path :d="linePath(data.vul, lineCommand)" fill="none" stroke="#c00" stroke-width="3"/>

            <g v-for="(p, idx) in data.vul" :key="'v-'+idx" class="with-tooltip">
                <circle :cx="itox(idx)" :cy="ptoy(p)" r="12" stroke="#900" stroke-width="4" fill="white"/>
            </g>

            <g v-for="(p, idx) in data.total" :key="'t-'+idx" class="with-tooltip">
                <circle :cx="itox(idx)" :cy="ptoy(p)" r="12" stroke="#666" stroke-width="4" fill="white"/>
      
            </g>

            <g v-for="(p, idx) in data.vul" :key="'vt-'+idx" class="with-tooltip">
                <text :x="itox(idx)" :y="ptoy(p)-20" class="tooltip" text-anchor="middle" fill="#900">{{p|formatNumber}}</text>
            </g>

            <g v-for="(p, idx) in data.total" :key="'tt-'+idx" class="with-tooltip">
                <text :x="itox(idx)" :y="ptoy(p)-20" class="tooltip" text-anchor="middle" fill="#666">{{p|formatNumber}}</text>
            </g>

        </g>

    </svg>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BviPlot extends Vue {

    height = 200;
    ymax: (number|null) = null;
    ymin: (number|null) = null;
    fixed = 0;

    @Prop() readonly data: any;

    mounted() {
        this.ymax = this.data.total.reduce((a: number,v: number)=>Math.max(a,v));

        //round to the next nearest 50
        if(this.ymax) this.ymax = Math.floor(this.ymax / 50) * 50 + 50;
        this.ymin = 0;
    }

    lineCommand = (point: number, i: number) => `L ${this.itox(i)} ${this.ptoy(point)}`

    ptoy(p: number) {
        if(this.ymin == null) return;
        if(this.ymax == null) return;

        const per = (p - this.ymin)/(this.ymax - this.ymin);
        return (this.height-40) - (this.height - 50)*per;
    }

    itox(y: number) {
        return ((1000-200)/(this.data.total.length-1))*y+150;
    }

    t2x(date: string) {
        const d = new Date(date);
        const begin = new Date("2012-01-01").getTime();
        const end = new Date("2020-01-01").getTime();
        const duration = end - begin;
        const x = ((1000-150)/duration)*(d.getTime()-begin)+100;
        return x;
    }

    a2h(amount: number) {
        return amount/100000+1;
    }

    fillPath(points: number[], command: any) {
        let d = "";

        //top
        for(let i = 0;i < points.length; ++i) {
            if(i == 0) d += 'M '+this.itox(i)+','+this.ptoy(points[i]);
            else d+= command(points[i], i);
        } 
        //bottom
        for(let i = points.length-1;i >= 0; --i) {
            d+= command(0, i);
        } 
        return d;
    }

    linePath(points: number[], command: any) {
        const d = points.reduce((acc: string, point: number, i: number)=>{
            if(i === 0) return `M ${this.itox(i)},${this.ptoy(point)}`
            else return `${acc} ${command(point, i)}`
        }, '')
        return d;
    }

    get yticks() {
        if(this.ymin == null) return [];
        if(this.ymax == null) return [];

        const ticks: number[] = [];

        //compute optimal min/max step
        const range = this.ymax - this.ymin;

        const step = range/2.5;
        //if(range < 0.025) this.fixed = 2;

        const min = Math.round(this.ymin/step)*step;
        const max = this.ymax;
        for(let p = min;p <= max;p+=step) {
            const y = this.ptoy(p);
            if(y !== undefined && y > this.height-30) continue;
            ticks.push(p);
        }
        return ticks;
    }
}
</script>

<style scoped lang="scss">
svg {
}
.legend,
.ticks {
    color: gray;
    font-size: 25px;
    text-align: right;
}
.with-tooltip .tooltip {
    font-size: 25px;
    text-align: center;
    opacity: 1;
}
</style>

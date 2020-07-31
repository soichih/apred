<template>
<div>
    <svg :viewBox="'0 0 1000 '+height" :height="height">
        <!--grid lines-->
        <g>
            <line v-for="(year, idx) in years" :key="year" :x1="itox(idx)" y1="20" :x2="itox(idx)" :y2="ptoy(ymin)" style="stroke:rgb(200,200,200);stroke-width:0.5" /> 
            <line v-for="(y, idx) in yticks" :key="idx" :x1="70" :y1="ptoy(y)" :x2="1000" :y2="ptoy(y)" style="stroke:rgb(200, 200, 200);stroke-width: 0.5"/>
        </g>

        <!--legend-->
        <g>
            <rect x="900" y="5" width="25" height="5" fill="#409EFF"/>
            <text x="930" y="12" class="legend">This County</text>

            <rect x="750" y="0" width="25" height="15" fill="#09f5"/>
            <text x="780" y="12" class="legend">State Avg/std</text>

            <rect x="600" y="0" width="25" height="15" fill="#0003"/>
            <text x="630" y="12" class="legend">US Avg/std</text>

            <!--
            <rect x="450" y="0" width="25" height="15" fill="green"/>
            <text x="480" y="12" class="legend">EDA Awards</text>
            -->
        </g>

        <!--x axis / ticks-->
        <g>
            <line :x1="70" :y1="ptoy(ymin)" :x2="1000" :y2="ptoy(ymin)" style="stroke:rgb(100,100,100);stroke-width:0.5" /> 
            <text v-for="(year, idx) in years" :key="year" :x="itox(idx)-15" :y="height" class="ticks">{{year}}</text>
        </g>

        <!--y axix / ticks-->
        <g>
            <line x1="70" :y1="ptoy(ymin)" x2="70" :y2="ptoy(ymax)" style="stroke:rgb(100,100,100);stroke-width:0.5" /> 
            <text v-for="(y, idx) in yticks" :key="idx" :x="60" :y="ptoy(y)+3" text-anchor="end" class="ticks">{{(y*100).toFixed(2)}}%</text>
        </g>

        <!-- us avg/sdev-->
        <g>
            <path :d="sdevPath(cutters.us.avg, cutters.us.sdev, lineCommand)" fill="#0002" stroke="none"/>
            <path :d="svgPath(cutters.us.avg, lineCommand)" fill="none" stroke="#0005"/>
            <!--
            <circle v-for="(p, idx) in cutters.us.avg" :key="idx" :cx="itox(idx)" :cy="ptoy(p)" r="4" stroke="#0505" stroke-width="1" fill="white" />
            -->
        </g>

        <!-- state avg/sdev-->
        <g>
            <path :d="sdevPath(cutters.states.avg, cutters.states.sdev, lineCommand)" fill="#09f4" stroke="none"/>
            <path :d="svgPath(cutters.states.avg, lineCommand)" fill="none" stroke="#09f8"/>
            <!--
            <circle v-for="(p, idx) in cutters.states.avg" :key="idx" :cx="itox(idx)" :cy="ptoy(p)" r="4" stroke="#0045" stroke-width="1" fill="white" />
            -->
        </g>

        <!-- county-->
        <g>
            <path :d="svgPath(cutters.county, lineCommand)" fill="none" stroke="#409EFF" stroke-width="3"/>
            <circle v-for="(p, idx) in cutters.county" :key="idx" :cx="itox(idx)" :cy="ptoy(p)" r="5" stroke="#409EFF" stroke-width="2" fill="white" />
        </g>

        <!--eda awards-->
        <!--
        <g>
            <g v-for="award in edaAwards" :key="award.fain">
                <rect
                    :x="t2x(award.grant_award_date)" 
                    :y="height - a2h(award.award_amount) - 20" 
                    width="8" 
                    :height="a2h(award.award_amount)" 
                    fill="green">
                </rect>
                <circle :cx="t2x(award.grant_award_date) + 4" :cy="height - a2h(award.award_amount) - 20" r="6" stroke="green" stroke-width="2" fill="white" />
                <title>EDA Award (fain: {{award.fain}}) ${{award.award_amount|formatNumber}} for {{award.grant_purpose}}</title>
            </g>
        </g>
        -->
    </svg>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class CompositePlot extends Vue {

    height = 300;
    ymax: (number|null) = null;
    ymin: (number|null) = null;

    years: number[] = [];

    @Prop() readonly edaAwards: any;
    @Prop() readonly cutters: any;

    constructor() {
        super();

        for(let year = 2012; year <= 2020; ++year) {
            this.years.push(year);
        }

        //find ymin/max
        const findMinMax = (vs: number[], sdevs?: number[])=>{
            vs.forEach((v, index)=>{
                if(v == null) return;
                let vmin = v;
                let vmax = v;
                if(sdevs) {
                    vmin -= sdevs[index];
                    vmax += sdevs[index];
                }
                if(this.ymin === null || this.ymin > vmin) this.ymin = vmin;
                if(this.ymax === null || this.ymax < vmax) this.ymax = vmax;
            });
        }

        findMinMax(this.cutters.county);
        findMinMax(this.cutters.states.avg, this.cutters.states.sdev);
        findMinMax(this.cutters.us.avg, this.cutters.us.sdev);

        if(this.ymin == null) return;
        if(this.ymax == null) return;

        //add a bit of space top/bottom
        const r = this.ymax - this.ymin;
        this.ymax += r/5;
        this.ymin -= r/5;

        //console.dir(this.cutters);
        //console.log(this.ymin, this.ymax);
    }

    lineCommand = (point: number, i: number) => `L ${this.itox(i)} ${this.ptoy(point)}`

    ptoy(p: number) {
        if(this.ymin == null) return;
        if(this.ymax == null) return;

        const per = (p - this.ymin)/(this.ymax - this.ymin);
        return (this.height-30) - (this.height - 40)*per;
    }

    itox(y: number) {
        return ((1000-150)/(this.years.length-1))*y+100;
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

    sdevPath(points: number[], sdev: number[], command: any) {
        let d = "";

        //top
        for(let i = 0;i < points.length; ++i) {
            if(i == 0) d += 'M '+this.itox(i)+','+this.ptoy(points[i]+sdev[i]);
            else d+= command(points[i]+sdev[i], i);
        } 
        //bottom
        for(let i = points.length-1;i >= 0; --i) {
            d+= command(points[i]-sdev[i], i);
        } 
        return d;
    }

    svgPath(points: number[], command: any) {
        const d = points.reduce((acc: string, point: number, i: number)=>{
            if(i === 0) return `M ${this.itox(i)},${this.ptoy(point)}`
            else return `${acc} ${command(point, i)}`
        }, '')
        //return `<path d="${d}" fill="none" stroke="grey" />`
        return d;
    }

    get yticks() {
        if(this.ymin == null) return [];
        if(this.ymax == null) return [];

        const ticks: number[] = [];
        for(let y = this.ymin;y <= this.ymax;y+=(this.ymax-this.ymin)/4) {
            ticks.push(y);
        }
        return ticks;
    }
}
</script>

<style scoped lang="scss">
svg {
    /*
    background-color: #f0f0f0;
    */
}
.legend,
.ticks {
    color: gray;
    font-size: 13px;
    text-align: right;
}
</style>

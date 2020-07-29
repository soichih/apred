<template>
<div>
    <svg :viewBox="'0 0 1000 '+height" :height="height">
        <!--grid lines-->
        <g>
            <line v-for="(year, idx) in years" :key="year" :x1="itox(idx)" y1="20" :x2="itox(idx)" :y2="ptoy(0)" style="stroke:rgb(200,200,200);stroke-width:0.5" /> 
            <line v-for="(y, idx) in yticks" :key="idx" :x1="50" :y1="ptoy(y)" :x2="1000" :y2="ptoy(y)" style="stroke:rgb(200, 200, 200);stroke-width: 0.5"/>
        </g>

        <!--legend-->
        <g>
            <rect x="900" y="5" width="25" height="5" fill="#409EFF"/>
            <text x="930" y="12" class="legend">This County</text>

            <rect x="750" y="0" width="25" height="15" fill="#0043"/>
            <text x="780" y="12" class="legend">State Avg/std</text>

            <rect x="600" y="0" width="25" height="15" fill="#0506"/>
            <text x="630" y="12" class="legend">US Avg/std</text>

            <!--
            <rect x="450" y="0" width="25" height="15" fill="green"/>
            <text x="480" y="12" class="legend">EDA Awards</text>
            -->
        </g>

        <!--x axis / ticks-->
        <g>
            <line :x1="50" :y1="ptoy(0)" :x2="1000" :y2="ptoy(0)" style="stroke:rgb(100,100,100);stroke-width:0.5" /> 
            <text v-for="(year, idx) in years" :key="year" :x="itox(idx)-15" :y="height" class="ticks">{{year}}</text>
        </g>

        <!--y axix / ticks-->
        <g>
            <line x1="50" :y1="ptoy(0)" x2="50" :y2="ptoy(ymax)" style="stroke:rgb(100,100,100);stroke-width:0.5" /> 
            <text v-for="(y, idx) in yticks" :key="idx" :x="40" :y="ptoy(y)+3" text-anchor="end" class="ticks">{{y}}</text>
        </g>

        <!-- us avg/sdev-->
        <g>
            <path :d="sdevPath(cutters.us.avg, cutters.us.sdev, lineCommand)" fill="#0502" stroke="none"/>
            <path :d="svgPath(cutters.us.avg, lineCommand)" fill="none" stroke="#0505"/>
            <circle v-for="(p, idx) in cutters.us.avg" :key="idx" :cx="itox(idx)" :cy="ptoy(p)" r="4" stroke="#0505" stroke-width="1" fill="white" />
        </g>

        <!-- state avg/sdev-->
        <g>
            <path :d="sdevPath(cutters.states.avg, cutters.states.sdev, lineCommand)" fill="#0042" stroke="none"/>
            <path :d="svgPath(cutters.states.avg, lineCommand)" fill="none" stroke="#0045"/>
            <circle v-for="(p, idx) in cutters.states.avg" :key="idx" :cx="itox(idx)" :cy="ptoy(p)" r="4" stroke="#0045" stroke-width="1" fill="white" />
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
    /*
    @Prop() readonly histogram!: number[];
    @Prop() readonly value!: number;
    @Prop() readonly ylabel: string|undefined;
    @Prop() readonly xlabel: string|undefined;
    */

    //width = 500;
    height = 300;
    ymax = 1;
    ymin = 0;

    years: number[] = [];

    /*
    us_avg = [12.4, 13.2, 14.5, 15.3, 14.4, 14.2, 15.1];
    us_sdev= [1.9, 1.5, 1.7, 2.2, 2.4, 2.2, 2.1];

    state_avg = [15.2, 17.3, 16.5, 15.1, 16.2, 17.4, 19.1];
    state_sdev= [1.2, 1.5, 2.2, 1.4, 1.2, 1.1, 1.8];

    county = [10.4, 16.2, 15.5, 15.0, 15.4, 15.2, 16.1];
    */

    @Prop() readonly edaAwards: any;
    @Prop() readonly cutters: any;

    constructor() {
        super();
        //console.log("histogram mounted", this.ylabel);
        for(let year = 2012; year <= 2020; ++year) {
            this.years.push(year);
        }
    }

    /*
    mounted() {
    }
    */

    /*
    // Properties of a line 
    // I:  - pointA (array) [x,y]: coordinates
    //     - pointB (array) [x,y]: coordinates
    // O:  - (object) { length: l, angle: a }: properties of the line
    const line = (pointA, pointB) => {
        const lengthX = pointB[0] - pointA[0];
        const lengthY = pointB[1] - pointA[1];
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        }
    }
    */
    lineCommand = (point: number, i: number) => `L ${this.itox(i)} ${this.ptoy(point)}`

    ptoy(p: number) {
        return (this.height-20) - (this.height-40)/(this.ymax - this.ymin)*p;
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
        //console.log("running svgpath", points, command);
        const d = points.reduce((acc: string, point: number, i: number)=>{
            //console.log(i, this.years[i]);
            if(i === 0) return `M ${this.itox(i)},${this.ptoy(point)}`
            else return `${acc} ${command(point, i)}`
        }, '')
        //return `<path d="${d}" fill="none" stroke="grey" />`
        return d;
    }

    /*
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
    */

    get yticks() {
        const ticks: number[] = [];
        for(let y = 0;y <= this.ymax;y+=0.25) {
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
    margin: 10px;
}
.legend,
.ticks {
    color: gray;
    font-size: 13px;
    text-align: right;
}
</style>

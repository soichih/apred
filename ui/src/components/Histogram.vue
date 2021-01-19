<template>
<Plotly :data="data" :layout="layout" :display-mode-bar="false"/>
</template>

<script>

import { Component, Vue, Prop } from 'vue-property-decorator'

import { Plotly } from 'vue-plotly' 

/*
interface HistogramType {
    min: number;
    max: number;
    bucket: number;
    hists: {
        [key: string]: number[];
    };
}
*/

@Component({
    components: {
        Plotly,
    }
})
export default class Histogram extends Vue {
    @Prop() value;
    @Prop() histogram;
    @Prop() fips;
    @Prop() state;

    data = null;
    layout = null;

    mounted() {
        
        const us = {
            x: [],
            y: [],
            marker:{ color: [], },
            name: 'US',
            type: 'bar'
        }
        const usValues = this.histogram.hists['_us'];
        const bucketSize = this.histogram.bucket;
        let x = this.histogram.min;
        usValues.forEach(v=>{
            us.x.push(x);
            us.y.push(v);
            let color = "#ccc"
            if(this.value > x && this.value <= x+bucketSize) color = "#999";
            us.marker.color.push(color);
            x += bucketSize;
        })

        const statefips = this.fips.substring(0,2);
        const state = {
            x: [],
            y: [],
            marker:{ color: [], },
            name: this.state,
            type: 'bar'
        }
        const stateValues = this.histogram.hists[statefips];
        x = this.histogram.min;
        stateValues.forEach(v=>{
            state.x.push(x);
            state.y.push(v);
            let color = "#66b1ff";
            if(this.value > x && this.value <= x+bucketSize) color = "#3090f0";
            state.marker.color.push(color);
            x += bucketSize;
        })

        this.data = [ state, us ];
        this.layout = {
            height: 200,
            margin: {
                l: 50,
                r: 30,
                t: 10,
                b: 30,
            },
            barmode: 'stack',
            xaxis: {
                title: 'Population ('+this.histogram.bucket+' people per sq. mile for each bar)',
                range: [this.histogram.min-this.histogram.bucket, this.histogram.max + this.histogram.bucket],
            },
            yaxis: {
                type: 'log',
                autorange: true,
                title: '# of Counties'
            }
        }
    }
}
</script>

<style scoped lang="scss">
</style>

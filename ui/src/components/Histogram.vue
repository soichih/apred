<template>
<ExportablePlotly ref="plotly" :data="data" :layout="layout"/>
</template>

<script>

import { Component, Vue, Prop } from 'vue-property-decorator'

//import { Plotly } from 'vue-plotly' 
import ExportablePlotly from '@/components/ExportablePlotly'

//import util from '@/util'

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
        ExportablePlotly,
    }
})
export default class Histogram extends Vue {
    @Prop() value;
    @Prop() histogram;
    @Prop() fips;
    @Prop() state;

    data = null;
    layout = null;

    //add svg export button
    buttons = [
        /*
        {
            name: 'Save as SVG',
            icon: util.svgIcon,
            click: ()=>{
                util.createSVG(this.$refs.plotly);
            },
        }
        */
        /*
        {
            name: 'Save as SVG',
            icon: {
              'width': 500,
              'height': 600,
              'path': 'M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z'
            },
            direction: 'up',
            click: ()=>{
                const p = this.$refs.plotly;
                console.log(p);
                p.toImage({format: 'svg', width: p.$el.clientWidth, height: p.$el.clientHeight}).then(url=>{
                    const a = document.createElement("a"); //Create <a>
                    a.href = url;
                    a.download = "graph.svg"; //File name Here
                    a.click(); //Downloaded file
                })
            }
        }
        */
    ];

    mounted() {
        
        const us = {

            //plotly uses the first marker color for legend, so I have to add some bogus value
            x: [0],
            y: [-1],
            marker:{ color: ['#ccc'], },

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
            if(this.value > x && this.value <= x+bucketSize) color = "#666";
            us.marker.color.push(color);
            x += bucketSize;
        })

        const statefips = this.fips.substring(0,2);
        const state = {
            //plotly uses the first marker color for legend, so I have to add some bogus value
            x: [0],
            y: [-1],
            marker:{ color: ['#66b1ff'], },

            name: this.state,
            type: 'bar',
        }
        const stateValues = this.histogram.hists[statefips];
        x = this.histogram.min;
        stateValues.forEach(v=>{
            state.x.push(x);
            state.y.push(v);
            let color = "#66b1ff";
            if(this.value > x && this.value <= x+bucketSize) color = "#26c";
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

<template>
<div>
    <Plotly ref="plot" :data="data" :layout="layout" :mode-bar-buttons-to-add="buttons"/>
    <p style="border-top: 1px solid #eee; padding-top: 10px; margin: 0; margin-top: 8px;">
        <a href="javascript:void(0);" style="float: right; font-size: 85%;" @click="exportSVG">Download SVG</a>
    </p>
    <br clear="left">
</div>
</template>

<script>
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Plotly } from 'vue-plotly' 
@Component({
    components: {
        Plotly,
    }
})
export default class ExportablePlotly extends Vue {
    @Prop() data;
    @Prop() layout;

    //add svg export button
    buttons = [
        {
            name: 'Save as SVG',
            icon: {
              'width': 500,
              'height': 600,
              'path': 'M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z'

            },
            click: this.exportSVG,
        }
    ];

    exportSVG() {
        const plot = this.$refs.plot;
        plot.toImage({format: 'svg', width: plot.$el.clientWidth, height: plot.$el.clientHeight}).then(url=>{
            const a = document.createElement("a"); //Create <a>
            a.href = url;
            a.download = "graph.svg"; //File name Here
            a.click(); //Downloaded file
        })
    }

}
 
</script>

<style scoped>
</style>

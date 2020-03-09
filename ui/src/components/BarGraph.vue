<template>
<div style="width: 100%; position: relative;">
    <svg width="100%" :height="height.toString()+'px'">
        <rect x="0" y="0" width="100%" :height="height" style="fill:rgb(200,200,200)" />
        <rect v-if="value" x="0" y="0" :width="(value*100)+'%'" :height="height" style="fill:rgb(60,100,255)" />
    </svg>
    <span v-if="value" style="position: absolute; top: 13px; opacity: 0.7; font-size: 80%;" :style="{left: (value*100)+'%'}">{{value.toFixed(2)}}</span>
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

    /*
    mounted() {
    }
    */

}
</script>

<style scoped lang="scss">

</style>

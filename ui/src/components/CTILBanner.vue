<template>
<div id="topmenu">
    <a href="/"><img src="//ctil.iu.edu/images/ctil-logo.png"/></a>
    <h1 style="float: right"><a href="https://ctil.iu.edu/projects/covid19/" style="text-decoration: none; color: inherit;">COVID19 Social Media Analytics</a></h1>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class CTILBanner extends Vue {
}
</script>

<style scoped lang="scss">
/*
#topmenu {
    position: fixed;
    z-index: 3;
    left: 0;
    right: 0;
    top: 0;
    height: 50px;
    box-shadow: 0 0 2px #0003;
    background-color: white;
}
*/
#topmenu { 
    position: fixed;
    top: 0;
    width: 100%;
	border-bottom: 1px solid black;
}
#topmenu img { 
	max-height: 5em; 
	border: 0px solid blue;
	margin-bottom: -4px;
	max-width: 100%;
}

#topmenu h1 {
	margin-right: 1em;
	margin-top: .7em;
	margin-bottom: .7em;
	padding: 0px;
}

.title {
    color:#999;
    font-weight: bold;
    margin: 13px 0;
    font-size: 16pt;
}
.title a {
    color: inherit;
}
.user {
    float: right;
    font-size: 150%;
    opacity: 0.7;
    position: relative;
    top: -2px;
    color: #999;
}
.apred {
    float: right;
    font-weight: bold;
    position: relative;
    top: 4px;
    margin-right: 20px;
    opacity: 0.7;
}
</style>

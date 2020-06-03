<template>
  <div id="topmenu">
    <div class="page">
        <!--
        <span class="user">
            <i class="el-icon-user-solid"/>
        </span>
        -->
        <a href="https://iu.edu">
            <img src="../assets/trident-large.png" height="50px" class="trident"/>
        </a>
        <span class="apred">
            <a href="https://ctil.iu.edu/" style="color: inherit;">CTIL</a>
        </span>
        <p class="title">
            <el-tag effect="dark" type="info" class="beta" size="mini"><b>BETA</b></el-tag>
            <b style="color: #900;">APRED</b>
            <i class="sub-title">Analysis Platform for Risk, Resilience and Expenditure in Disasters</i>
        </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TopMenu extends Vue {
}
</script>

<style scoped lang="scss">
#topmenu {
    position: fixed;
    z-index: 3;
    left: 0;
    right: 0;
    top: 0;
    height: 50px;
    box-shadow: 0 0 2px #0003;
    background-color: white;
    min-width: 400px;
}
.title {
    color:#999;
    margin: 13px 0;
    font-size: 16pt;
    position: relative;
}
.sub-title {
    font-size: 12pt;
    padding-left: 10px;
}
@media only screen and (max-width: 700px) {
    .sub-title {
        display: none;
    }
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
.trident {
margin-right: 10px; 
position: relative; 
float: right;
top: -13px;
}
.beta {
margin-left: 10px;
position: absolute;
top: -3px;
left: -45px;
transform: rotate(-25deg);
opacity: 0.5;
z-index: -1;
}
</style>

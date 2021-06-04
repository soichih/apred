<template>
<div id="topmenu">
    <a href="https://iu.edu">
        <img src="../assets/trident-large.png" class="trident"/>
    </a>

    <el-button class="pull-right" v-if="!$root.user" @click="login" size="small">Log In</el-button>
    <el-button class="pull-right" v-if="!$root.user" @click="signup" size="small" type="primary">Sign Up</el-button>

    <el-button class="pull-right" v-if="$root.user" @click="signout" size="small">Sign Out</el-button>
    <el-button class="pull-right" v-if="$root.user" @click="settings" size="small" type="success">Settings</el-button>

    <span class="pull-right" style="font-weight: bold; top: 18px;"> 
        <a href="https://ctil.iu.edu/" style="color: inherit;">CTIL</a>
    </span>
    <span class="pull-right" style="font-weight: bold; top: 18px;"> 
        <a href="javascript:window.print();"><i class="el-icon-printer"/></a>
    </span>
    <p class="title">
        <!--<el-tag effect="dark" type="info" class="beta" size="mini"><b>BETA</b></el-tag>-->
        <a href="https://ctil.iu.edu/projects/apred-landing"><b style="color: #900;">APRED</b></a>
        <span class="sub-title">Analysis Platform for Risk, Resilience and Expenditure in Disasters</span>
    </p>
    <!-- <small>For testing purposes only. Not for public use or for supporting current EDA applications.</small>-->
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TopMenu extends Vue {
    //nothing much going on here..

    app = "prod";
    constructor() {
        super();
        if(document.location.hostname == "localhost") this.app = "dev";
    }

    signup() {
        //alert('Sign up is only applicable for EDA staff. Please con^tact APRED team for more information.');
        document.location.href = "https://api.ctil.iu.edu/auth/#!/signup?app="+this.app;
    }

    login() {
        document.location.href = "https://api.ctil.iu.edu/auth/#!/login?app="+this.app;
    }

    settings() {
        document.location.href = "https://api.ctil.iu.edu/auth/#!/settings/account?app="+this.app;
    }

    signout() {
        //document.location.href = "https://api.ctil.iu.edu/auth/#!/signout?app="+this.app;
        (this.$root as any).signout();
    }
}
</script>

<style scoped lang="scss">
#topmenu {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    height: 50px;
    padding: 0;
    margin: 0;
    box-shadow: 0 0 3px #0003;
    background-color: white;
    min-width: 400px;
    overflow: hidden;
    z-index: 4;
}
#topmenu .page {
    height: 50px;
}
.title {
    color:#666;
    margin: 10px 10px;
    font-size: 20pt;
    position: relative;
    display: inline-block;
}
.sub-title {
    font-size: 12pt;
    padding-left: 10px;
    top: -5px;
    opacity: 0.7;
    position: relative;
}
.disclaimer {
    font-size: 75%;
    position: relative;
    top: -34px;
    left: 150px;
    color: #999;
    font-style: italic;
    display: inline-block;

}
@media only screen and (max-width: 950px) {
    .sub-title {
        display: none;
    }
    .disclaimer {
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
.pull-right {
    float: right;
    position: relative;
    top: 10px;
    margin-right: 10px;
    opacity: 0.7;
}
.trident {
    margin-right: 10px; 
    float: right;
    height: 50px;
}
.beta {
    margin-left: 10px;
    position: absolute;
    top: -3px;
    left: -45px;
    transform: rotate(-25deg);
    opacity: 0.3;
    z-index: -1;
}
.pull-right a:hover {
    color: #409EFF;
}
</style>

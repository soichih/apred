<template>
  <div id="topmenu">
    <div class="page">
        <span class="user">
            <i class="el-icon-user-solid"/>
        </span>
        <span class="apred">
            APRED
        </span>
        <p class="title">
            <router-link to="/">
                <img src="../assets/favicon-32x32.png" height="20px" style="margin-right: 10px; position: relative; top: 2px;"/>
                Predictive Insights
            </router-link>
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

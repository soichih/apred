<template>
  <div id="app">
    <!--
    <div :style="{'margin-left': (isSideMenuCollapsed?'61px':'240px')}">
      <el-radio-group v-model="isSideMenuCollapsed" style="margin-bottom: 20px;">
        <el-radio-button :label="false">expand</el-radio-button>
        <el-radio-button :label="true">collapse</el-radio-button>
      </el-radio-group>
    </div>
    -->
    <TopMenu/>
    <!--<SideMenu :active="active"/>-->
    <router-view/>
  </div>
</template>

<script>
import SideMenu from '@/components/SideMenu.vue'
import TopMenu from '@/components/TopMenu.vue'

import numeral from "numeral";

import { Component, Watch, Vue } from 'vue-property-decorator';

Vue.filter("formatNumber", (value)=>{
    return numeral(value).format("0,0"); // displaying other groupings/separators is possible, look at the docs
});


@Component({
  components: { SideMenu, TopMenu },
})
export default class App extends Vue {
  //isSideMenuCollapsed = false;
  active = '';

  mounted() {
    //console.log("app mounted", this.$route.meta);
    this.active = this.$route.meta.menu;
  }
  
  @Watch('$route')
  onChangeRoute(to, from) {
    //console.log("route changed");
    //console.dir(this.$route.meta);
    if(this.$route.meta.menu) this.active = this.$route.meta.menu;
  }
  
}

</script>

<style lang="scss">
html, body {
padding: 0;
margin: 0;
font-family: Avenir, Helvetica, Arial, sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
/*background-color: #f0f0f0;*/
color: #555;
scroll-behavior: smooth;
}
a {
  text-decoration: none;
}
#app {
margin-top: 50px;
}
p.small {
    font-size: 90%;
    opacity: 0.8;
}
.page {
width: 1000px;
margin: auto;
}
@media only screen and (max-width: 1100px) {
    .page {
        width: 95%;
        margin: auto;
    }
}

/*
.el-collapse-item__header {
    background-color: inherit;
    border-bottom: 1px solid #0001;
}
*/
</style>

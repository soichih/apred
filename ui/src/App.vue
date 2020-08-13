<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
//import SideMenu from '@/components/SideMenu.vue'

import numeral from "numeral";

import { Component, Watch, Vue, State } from 'vue-property-decorator';

Vue.filter("formatNumber", (value)=>{
    return numeral(value).format("0,0"); // displaying other groupings/separators is possible, look at the docs
});

/*
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        count: 0,
    },
    mutations: {
        increment (state) {
            state.count++
        },
    }
})
*/

export default {
    name: 'App',
    //store,
    //data() { },

    mounted() {
        this.active = this.$route.meta.menu;
        //store.commit('increment');
        //console.log("App mounted", store.state.count);

    },
    watch: {
        '$route'() {
            //console.log("route changed");
            if(this.$route.meta.menu) this.active = this.$route.meta.menu;
        }
    },
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
min-width: 400px;
}
a {
  text-decoration: none;
  color: #409EFF;
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
.el-tabs__header {
    background-color: white;
    margin: 0;
}
.contextmenu {
    z-index: 10;
    position: fixed;
    top: 50px;
    left: 50px;
    width: 300px;
    background-color: white;
    box-shadow: 2px 2px 5px #0003;
    display: none;
    padding: 10px 0;

    .menu-item {
        font-size: 90%;
        padding: 5px 10px;
        margin-bottom: 0px;
    }
    .menu-item:hover {
        cursor: pointer;
        background-color: #eee;
    }
}

</style>

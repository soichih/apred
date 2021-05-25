<template>
<div id="app">
    <router-view/>
</div>
</template>

<script>
//import SideMenu from '@/components/SideMenu.vue'

import numeral from "numeral";

import { Vue} from 'vue-property-decorator';

//for format .. see http://numeraljs.com/
Vue.filter("formatNumber", (value, f="0,0")=>{
    return numeral(value).format(f); // displaying other groupings/separators is possible, look at the docs
});

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
    color: #555;
    scroll-behavior: smooth;
    min-width: 400px;
    height: 100%;
}
a {
    text-decoration: none;
    color: #409EFF;
}

#app {
    padding-top: 50px;
}

p.small {
    font-size: 90%;
    opacity: 0.8;
}
.page {
    width: 1100px;
    margin: auto;
}
@media only screen and (max-width: 1100px) {
    .page {
        width: 95%;
        margin: auto;
    }
}

@media print {
    body {
        margin: 40px;
    }
    #topmenu, .toolset {
       display: none; 
    }
    #app {
        padding-top: 0;
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
.mapboxgl-popup-tip,
.mapboxgl-popup-content {
    opacity: 1;
}

.popup {
    padding: 0 5px;

    h2 {
        font-size: 15px;
        background-color: #900;
        color: white;
        margin: -15px;
        padding: 10px 15px;
        margin-bottom: 10px;
        border-radius: 5px 5px 0 0;
    }
    h3 {
        font-size: 11px;
    }
    h4 {
        margin-bottom: 0;
    }
    p {
        margin-top: 5px;
    }
}

.drs {
    margin-bottom: 10px;

    .dr {
        padding-right: 10px;
        text-transform: uppercase;
        font-weight: bold;
        white-space: nowrap;
    }
    .no-dr {
        font-size: 80%;
        opacity: 0.8;
    }
}
.eda-award {
    time {
        font-size: 80%;
        opacity: 0.9;
        margin: 0 5px;
    }
    .eda-county {
        font-size: 80%;
        margin-right: 5px;
    }
}
</style>

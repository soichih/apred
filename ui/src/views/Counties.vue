<template>
<div style="position: relative;">
    <TopMenu/>
    <!--<CountySelecter :fips="fips" @select="changeFips"/>-->
    <CountyDetail v-if="fips" :fips="fips"/>
    <CountyMap v-if="mountmap" v-show="showmap" @select="changeFips"/>
</div>
</template>

<script>

import { Component, Vue, Watch } from 'vue-property-decorator'

import TopMenu from '@/components/TopMenu.vue'
import CountyDetail from '@/components/CountyDetail.vue'
import CountyMap from '@/components/CountyMap.vue'

@Component({
    components: { TopMenu, CountyDetail, CountyMap },
})

export default class CountiesView extends Vue {

    fips = null;
    mountmap = false;
    showmap = false;

    @Watch('$route')
    onRouteChange() {
        this.fips = this.$route.params.fips;
        this.togglemap();
    }

    /*
    @Watch('fips')
    onFipsChange(v) {
        console.log("onFipsChange called");
        this.fips = this.$route.params.fips;
    } 
    */

    changeFips(v) {
        this.$router.push('/county/'+v);
    }
    
    mounted() {
        this.fips = this.$route.params.fips;
        this.togglemap();
    }

    togglemap() {
        if(!this.fips) {
            this.mountmap = true; //should only happen once
            this.showmap = true;
            this.$nextTick(()=>{
                if(this.$root.map) this.$root.map.resize();
            });
        }
        if(this.fips) {
            //hiding map causes mapbox to resize to a default size??
            //if I don't hide it, page will be screwed up
            this.showmap = false;
        }
    }
}

</script>

import Vue from 'vue'

import 'element-ui/lib/theme-chalk/index.css';

import locale from 'element-ui/lib/locale/lang/en';

//import { Row, Col, Button, Select } from 'element-ui';
import ElementUI from 'element-ui';

import App from './App.vue'
import router from './router'

Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 };
/*
//https://github.com/ElemeFE/element/blob/master/components.json
Vue.use(Row)
Vue.use(Col)
Vue.use(Button)
Vue.use(Select)
*/
Vue.use(ElementUI, { locale });

Vue.config.productionTip = false

import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

import VueAnalytics from 'vue-analytics'

Vue.use(VueAnalytics, {
    id: 'UA-161425227-2'
})

interface RawDrMeasureRec {
    measure: string;
    measure_name: string;
    measure_desc: string;
    measure_calculation_desc: string;
}
interface DrMeasure {
    name: string;
    desc: string;
    calcDesc: string;
}
interface DrMeasures {
    [key: string]: DrMeasure;
}

new Vue({
    data() {
        return {
            //dataUrl: "https://ctil.iu.edu/projects/apred-data/",
            dataUrl: "https://gpu1-pestillilab.psych.indiana.edu/apred",
            drMeasures: {} as DrMeasures, 

            layers: {
                "biological": {
                    color: "#396",
                    opacity: 0.5,
                    types: ["Biological"],
                },
                "other": {
                    color: "#999",
                    types: ["EarthQuake", "Coastal Storm", "Snow", "Mud/Landslide", "Volcano", "Dam/Levee Break", "Severe Ice Storm"],
                }, 
                "hurricane": {
                    color: "#0af", 
                    types: ["Hurricane"],
                },
                "tornado": {
                    color: "#f6f", 
                    types: ["Tornado"],
                },
                "severe storm": { 
                    color: "#fa0", 
                    types: ["Severe Storm(s)"],
                },
                "flood": {
                    color: "#06f",
                    types: ["Flood"],
                },
                "fire": {
                    color: "#f00", 
                    types: ["Fire"],
                },
            },
        }
    },
    mounted() {
        fetch(this.dataUrl+"/raw/dr_measure.json").then(res=>res.json()).then((data: RawDrMeasureRec[])=>{
            data.forEach(rec=>{
                this.drMeasures[rec.measure] = {
                    name: rec["measure_name"],
                    desc: rec["measure_desc"],
                    calcDesc: rec["measure_calculation_desc"],
                }
            });
        });
    },
    router,
    render: h => h(App)
}).$mount('#app')

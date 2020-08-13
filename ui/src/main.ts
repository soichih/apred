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

new Vue({
    data() {
        return {
            //dataUrl: "https://ctil.iu.edu/projects/apred-data/",
            dataUrl: "https://gpu1-pestillilab.psych.indiana.edu/apred",
            drMeasures: {}, //keyed by measure code, then {name, desc, calcDesc}
        }
    },
    mounted() {
        fetch(this.dataUrl+"/dr_measure.json").then(res=>res.json()).then(data=>{
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

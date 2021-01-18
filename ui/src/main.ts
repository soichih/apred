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

import JwtDecode from 'jwt-decode'

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

interface Histogram {
    min: number;
    max: number;
    bucket: number;
    hists: {
        [key: string]: number[];
    };
}

interface Histograms {
    medianIncome: Histogram;
    perCapitaIncome: Histogram;
    gdp: Histogram;
}

new Vue({
    data() {
        return {
            // $root content

            //dataUrl: "https://ctil.iu.edu/projects/apred-data/",
            dataUrl: "https://gpu1-pestillilab.psych.indiana.edu/apred",
            //dataUrl: "https://api.ctil.iu.edu/pub",
            drMeasures: {} as DrMeasures, 

            medianIncomeHistogram: {} as Histogram, 
            perCapitaIncomeHistogram: {} as Histogram, 
            gdpHistogram: {} as Histogram, 
            populationHistogram: {} as Histogram, 
            popdensityHistogram: {} as Histogram, 

            histogramReady: false,

            user: null,
            
            map: null,

            layers: {
                "hurricane": {
                    color: "#0af", 
                    types: ["Hurricane"],
                    zIndex: 5,
                },
                "tornado": {
                    color: "#f6f", 
                    types: ["Tornado"],
                    zIndex: 6,
                },
                "severe storm": { 
                    color: "#fa0", 
                    types: ["Severe Storm(s)"],
                    zIndex: 7,
                },
                "flood": {
                    color: "#06f",
                    types: ["Flood"],
                    zIndex: 8,
                },
                "fire": {
                    color: "#f00", 
                    types: ["Fire"],
                    zIndex: 9,
                },
                "biological": {
                    color: "#396",
                    opacity: 0.5,
                    types: ["Biological"],
                    zIndex: 0,
                },
                "other": {
                    color: "#999",
                    types: ["EarthQuake", "Coastal Storm", "Snow", "Mud/Landslide", "Volcano", "Dam/Levee Break", "Severe Ice Storm"],
                    zIndex: 1,
                }, 
            },
        }
    },

    mounted() {
        //intercept jwt send from auth service
        const urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has('jwt')) {
            localStorage.setItem("jwt", urlParams.get('jwt'));
            window.location.search = ""; //remove "jwt=" from the url (will cause refresh.. but)
        }

        // warning - jwt_decode just decode any jwt token. it doesn't validate it
        // so we can't really trust that user is who they say they are on the client side.
        // we just assume that user is trustworthy on the client side and pass jwt to 
        // server so that we can do a real jwt validation there
        const jwt = localStorage.getItem("jwt"); 
        if(jwt) {
            this.user = JwtDecode(jwt); 

            //check expiration (again.. user can generate whatever the exp they want.. this is just for client niceness)
            if(this.user.exp < (new Date().getTime()/1000)) {
                //console.error("jwt expired", this.user.exp, new Date().getTime());
                localStorage.removeItem("jwt");
                this.user = null; 
            } else {
                //TODO - maybe I should keep refreshing like warehouse?
                axios.defaults.headers.common['Authorization'] = 'Bearer '+jwt;
                //console.dir(this.user);
            }
        }

        fetch(this.dataUrl+"/raw/dr_measure.json").then(res=>res.json()).then((data: RawDrMeasureRec[])=>{
            data.forEach(rec=>{
                this.drMeasures[rec.measure] = {
                    name: rec["measure_name"],
                    desc: rec["measure_desc"],
                    calcDesc: rec["measure_calculation_desc"],
                }
            });
        });

        fetch(this.dataUrl+"/histograms.json").then(res=>res.json()).then((data: Histograms)=>{
            this.medianIncomeHistogram = data.medianIncome;
            this.perCapitaIncomeHistogram = data.perCapitaIncome;
            this.gdpHistogram = data.gdp;
            this.populationHistogram = data.population;
            this.popdensityHistogram = data.popdensity;

            this.histogramReady = true;
            this.$forceUpdate();
        });

    },

    methods: {
        signout() {
            localStorage.removeItem("jwt");
            this.user = null;
        },
    },

    router,
    render: h => h(App)
}).$mount('#app')

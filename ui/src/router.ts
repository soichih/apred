import Vue from 'vue'
import VueRouter from 'vue-router'

//import Disasters from '@/views/Disasters.vue'
import Counties from '@/views/Counties.vue'
//import DisastersCounty from '@/views/DisastersCounty.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        component: Counties,
        meta: {
            //menu: "disasters"
        }
    },
    {
        path: '/county/:fips',
        component: Counties,
        meta: {
            //menu: "disasters_county"
        }
    },
]


const router = new VueRouter({
    //mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router



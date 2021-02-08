import Vue from 'vue'
import VueRouter from 'vue-router'

import Counties from '@/views/Counties.vue'
import Compare from '@/views/Compare.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        component: Counties,
    },
    {
        path: '/county/:fips',
        component: Counties,
    },
    {
        path: '/compare/:field/:fips',
        component: Compare,
    },
]


const router = new VueRouter({
    base: process.env.BASE_URL,
    routes
})

export default router



import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Disasters from '../views/Disasters.vue'
import DisastersCounty from '../views/DisastersCounty.vue'
import Covid19 from '../views/Covid19.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            menu: "home"
        }
    },
    {
        path: '/disasters',
        name: 'Disaster Declerations',
        component: Disasters,
        meta: {
            menu: "disasters"
        }
    },
    {
        path: '/disasters/:fips',
        name: 'Disaster Declerations (County)',
        component: Disasters,
        meta: {
            menu: "disasters_county"
        }
    },
    {
        path: '/covid19',
        name: 'COVID19',
        component: Covid19,
        meta: {
            menu: "covid19"
        }
    },
    /*
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/About.vue'),
    meta: {
      menu: "about"
    }
  },
  
  {
    path: '/county/:fips?',
    name: 'Counties',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/County.vue'),
    meta: {
      menu: "county"
    }
  },

  {
    path: '/playground',
    name: 'Playground',
    component: () => import('../views/Playground.vue'),
    meta: {
      menu: "playground"
    }
  },
  */

]


const router = new VueRouter({
    //mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router



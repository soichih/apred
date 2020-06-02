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
  router,
  render: h => h(App)
}).$mount('#app')

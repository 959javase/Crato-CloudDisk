import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import store from '@/store/index.js'
import globalFunction from '@/utils/globalFunction.js'
import * as filters from '@/filters/index.js'

import "echarts";


import '@/assets/styles/css/base.css'
import '@/assets/styles/css/border.css'
import '@/assets/styles/css/element-cover.css'
import '@/assets/styles/iconfont/iconfont.css'
import '@/assets/styles/css/mediaScreen.styl'
import '@/router/before.js'
import 'element-ui/lib/theme-chalk/index.css'
import Pagination from '@/components/Pagination'
import element from './element.js'
// import decoo from '@decooio/sdk'

/**
 * vue-simple-uploader 中文官方文档 https://github.com/simple-uploader/vue-uploader/blob/master/README_zh-CN.md
 * simple-uploader.js 中文官方文档 https://github.com/simple-uploader/Uploader/blob/develop/README_zh-CN.md
 */
import uploader from 'vue-simple-uploader'
// collapse 展开折叠
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'

Vue.component(CollapseTransition.name, CollapseTransition)
Vue.component('Pagination', Pagination)
Vue.config.productionTip = false

for (let key in globalFunction) {
  Vue.prototype[key] = globalFunction[key]
}

Vue.use(element)
Vue.use(uploader)
// Vue.use(decoo)
Vue.prototype.$EventBus = new Vue()

Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key])
})

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')

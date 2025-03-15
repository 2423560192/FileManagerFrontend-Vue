import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

Vue.config.productionTip = false

// 配置全局Axios，直接指向后端API地址
axios.defaults.baseURL = 'http://localhost:8080/api'
Vue.prototype.$axios = axios

// 路由守卫，检查是否已登录
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', { from: from.path, to: to.path });
  const isLoggedIn = localStorage.getItem('userId')
  
  // 修改这里，允许访问登录和注册页面
  if (to.path !== '/login' && to.path !== '/register' && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app') 
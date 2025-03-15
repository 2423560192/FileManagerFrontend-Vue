import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

Vue.config.productionTip = false

// 配置全局Axios，直接指向后端API地址
axios.defaults.baseURL = 'http://localhost:8080/api'
Vue.prototype.$axios = axios

// 路由守卫，检查是否已登录
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.state.isLoggedIn
  
  // 如果是登录或注册页面
  if (to.path === '/login' || to.path === '/register') {
    if (isLoggedIn) {
      // 已登录时访问登录/注册页面，重定向到文件列表
      next({ path: '/files', replace: true })
    } else {
      // 未登录时允许访问登录/注册页面
      next()
    }
  } else {
    // 访问其他页面时检查登录状态
    if (!isLoggedIn) {
      // 未登录时重定向到登录页面
      next({ path: '/login', replace: true })
    } else {
      // 已登录允许访问
      next()
    }
  }
})

// 创建Vue实例时使用事件总线
const app = new Vue({
  router,
  store,
  data: {
    // 添加事件总线
    eventBus: new Vue()
  },
  render: h => h(App)
}).$mount('#app')

// 导出事件总线，供其他组件使用
export const eventBus = app.eventBus 
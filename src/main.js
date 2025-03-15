import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

Vue.use(ElementUI)

Vue.config.productionTip = false

// 配置全局Axios，直接指向后端API地址
axios.defaults.baseURL = 'http://localhost:8000/api'
Vue.prototype.$axios = axios

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('userId') // 直接从 localStorage 获取登录状态
  store.state.isLoggedIn = isLoggedIn // 同步 store 状态
  
  // 定义需要登录才能访问的路由
  const requiresAuth = !['Login', 'Register'].includes(to.name)
  
  if (requiresAuth) {
    // 需要登录的页面
    if (!isLoggedIn) {
      next({ 
        name: 'Login',
        replace: true
      })
    } else {
      next()
    }
  } else {
    // 登录/注册页面
    if (isLoggedIn) {
      next({ 
        name: 'FileList',
        replace: true
      })
    } else {
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
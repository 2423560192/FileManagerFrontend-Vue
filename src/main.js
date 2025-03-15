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
  
  // 如果要去登录或注册页面
  if (to.path === '/login' || to.path === '/register') {
    // 如果已登录，重定向到文件列表页
    if (isLoggedIn) {
      next('/files')
    } else {
      next()
    }
  } else {
    // 如果要去其他页面，检查是否登录
    if (!isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  }
})

// 创建Vue实例时使用事件总线
const app = new Vue({
  router,
  data: {
    // 添加事件总线
    eventBus: new Vue()
  },
  render: h => h(App)
}).$mount('#app')

// 导出事件总线，供其他组件使用
export const eventBus = app.eventBus 
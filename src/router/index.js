import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import FileList from '../components/FileList.vue'
import FileDetail from '../components/FileDetail.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/files',
    name: 'FileList',
    component: FileList
  },
  {
    path: '/file/:id',
    name: 'FileDetail',
    component: FileDetail,
    props: true
  },
  {
    // 捕获所有未匹配路由
    path: '*',
    redirect: '/files'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router 
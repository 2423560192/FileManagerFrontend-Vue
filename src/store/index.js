import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLoggedIn: !!localStorage.getItem('userId'),
    username: localStorage.getItem('username') || ''
  },
  mutations: {
    setLoginState(state, { status, username, userId }) {
      state.isLoggedIn = status
      state.username = username || ''
      
      if (status) {
        localStorage.setItem('userId', userId)
        localStorage.setItem('username', username)
      } else {
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
      }
    }
  },
  actions: {
    login({ commit }, { username, userId }) {
      commit('setLoginState', { 
        status: true, 
        username,
        userId
      })
    },
    logout({ commit }) {
      return new Promise((resolve) => {
        commit('setLoginState', { 
          status: false, 
          username: '',
          userId: null
        })
        resolve()
      })
    }
  }
}) 
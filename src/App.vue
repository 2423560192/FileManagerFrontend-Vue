<template>
  <div id="app">
    <!-- 登录后显示完整导航栏 -->
    <header v-if="isLoggedIn">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">📁</div>
          <h1>文件管理模拟系统</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-icon">👤</span>
            <span class="username">{{ username }}</span>
          </div>
          <button @click="handleLogout" class="logout-btn">
            <span class="logout-icon">🚪</span>
            退出登录
          </button>
        </div>
      </div>
    </header>
    
    <!-- 未登录时显示简单导航栏 -->
    <header v-else class="simple-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">📁</div>
          <h1>文件管理模拟系统</h1>
        </div>
      </div>
    </header>
    
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapState(['isLoggedIn', 'username'])
  },
  methods: {
    ...mapActions(['logout']),
    async handleLogout() {
      try {
        await this.logout()
        // 强制刷新路由守卫
        await this.$router.replace({ 
          name: 'Login',
          replace: true
        })
        // 强制刷新页面以确保状态完全清除
        window.location.reload()
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #2c3e50;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%);
  color: white;
  padding: 0.8rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-size: 1.8rem;
  animation: float 3s ease-in-out infinite;
}

.header-left h1 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.15);
}

.user-icon {
  font-size: 1.2rem;
}

.username {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(231, 76, 60, 0.9);
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #e74c3c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.logout-btn:active {
  transform: translateY(0);
}

.logout-icon {
  font-size: 1.1rem;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .header-left h1 {
    font-size: 1.1rem;
  }
  
  .user-info {
    display: none;
  }
  
  .logout-btn {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .logo {
    display: none;
  }
  
  .header-left h1 {
    font-size: 1rem;
  }
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(0);
}

input, textarea, select {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

input:focus, textarea:focus, select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  outline: none;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05),
              0 10px 20px rgba(0, 0, 0, 0.03);
  padding: 2rem;
  margin-bottom: 2rem;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #34495e;
}

.error {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.success {
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1rem 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #edf2f7;
}

th {
  background: #f8fafc;
  font-weight: 600;
  color: #2d3748;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: #f8fafc;
}

/* 简单导航栏样式 */
.simple-header {
  background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%);
  color: white;
  padding: 0.8rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.simple-header .header-left h1 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
}
</style> 
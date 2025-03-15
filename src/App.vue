<template>
  <div id="app">
    <header v-if="isLoggedIn">
      <div class="header-content">
        <h1>文件管理模拟系统</h1>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </header>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    isLoggedIn() {
      return localStorage.getItem('userId') !== null;
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('userId');
      this.$router.push('/login');
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
  font-family: "Microsoft YaHei", sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #2980b9;
}

.logout-btn {
  background-color: #e74c3c;
}

.logout-btn:hover {
  background-color: #c0392b;
}

input, textarea, select {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.error {
  color: #e74c3c;
  margin-top: 0.5rem;
}

.success {
  color: #2ecc71;
  margin-top: 0.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

tr:hover {
  background-color: #f8f9fa;
}
</style> 
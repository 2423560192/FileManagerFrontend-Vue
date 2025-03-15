<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">📁</div>
        <h2>文件管理系统</h2>
        <p class="subtitle">请登录您的账号</p>
      </div>
      
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <div class="input-wrapper">
            <i class="icon">👤</i>
            <input 
              v-model="username" 
              type="text" 
              placeholder="请输入用户名"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="input-wrapper">
            <i class="icon">🔒</i>
            <input 
              v-model="password" 
              type="password" 
              placeholder="请输入密码"
              required
            />
          </div>
        </div>
        
        <div v-if="error" class="error">{{ error }}</div>
        
        <button type="submit" :disabled="loading" class="login-btn">
          <span class="btn-content">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '登录中...' : '登录' }}
          </span>
        </button>
        
        <div class="register-link">
          <span>还没有账号？</span>
          <router-link to="/register" class="register-btn">立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: '',
      
      showRegisterForm: false,
      regUsername: '',
      regPassword: '',
      regLoading: false,
      regError: '',
      regSuccess: ''
    }
  },
  created() {
    // 如果已登录则跳转到文件列表页
    if (localStorage.getItem('userId')) {
      this.$router.push('/files');
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await this.$axios.post('/user/login', {
          username: this.username,
          password: this.password
        });
        
        if (response.data.success) {
          // 使用实际的userId
          await this.$store.dispatch('login', {
            username: this.username,
            userId: response.data.userId
          });
          this.$router.push('/files');
        } else {
          this.error = response.data.message || '登录失败';
        }
      } catch (error) {
        console.error('登录失败:', error);
        this.error = error.response?.data?.message || '登录失败，请稍后再试';
      } finally {
        this.loading = false;
      }
    },
    
    async register() {
      this.regLoading = true;
      this.regError = '';
      this.regSuccess = '';
      
      try {
        const response = await this.$axios.post('/user/register', {
          username: this.regUsername,
          password: this.regPassword
        });
        
        // 检查API返回的success字段
        if (response.data.success) {
          // 注册成功，根据API直接获取userId
          localStorage.setItem('userId', response.data.userId);
          localStorage.setItem('username', this.regUsername);
          
          this.regSuccess = '注册成功，正在为您自动登录...';
          
          // 延迟跳转，给用户时间看到成功消息
          setTimeout(() => {
            this.$router.push('/files');
          }, 1000);
        } else {
          // API返回了success=false
          this.regError = response.data.message || '注册失败，可能用户名已存在';
        }
      } catch (error) {
        console.error('注册错误:', error);
        // 详细错误日志
        if (error.response) {
          console.error('错误状态:', error.response.status);
          console.error('错误数据:', error.response.data);
          this.regError = error.response.data.message || '注册失败，服务器错误';
        } else if (error.request) {
          console.error('没有收到响应');
          this.regError = '无法连接到服务器，请检查网络连接';
        } else {
          console.error('请求错误:', error.message);
          this.regError = '注册请求错误';
        }
      } finally {
        this.regLoading = false;
      }
    },
    
    goToRegister() {
      this.$router.push('/register');
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
}

.login-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
}

.logo {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.5rem;
}

.login-form {
  padding: 2rem;
}

.input-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-style: normal;
  color: #94a3b8;
}

input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.register-link {
  margin-top: 1.5rem;
  text-align: center;
  color: #64748b;
}

.register-btn {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.5rem;
  transition: color 0.3s ease;
}

.register-btn:hover {
  color: #2980b9;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error::before {
  content: "⚠️";
}
</style> 
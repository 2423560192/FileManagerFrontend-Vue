<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo">📝</div>
        <h2>创建新账号</h2>
        <p class="subtitle">欢迎加入文件管理系统</p>
      </div>
      
      <form @submit.prevent="register" class="register-form">
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
        
        <div class="form-group">
          <div class="input-wrapper">
            <i class="icon">🔐</i>
            <input 
              v-model="confirmPassword" 
              type="password" 
              placeholder="请确认密码"
              required
            />
          </div>
        </div>
        
        <div v-if="error" class="error">{{ error }}</div>
        
        <button type="submit" :disabled="loading" class="register-btn">
          <span class="btn-content">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '注册中...' : '注册' }}
          </span>
        </button>
        
        <div class="login-link">
          <span>已有账号？</span>
          <router-link to="/login" class="login-btn">立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1rem;
}

.register-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.register-card:hover {
  transform: translateY(-5px);
}

.register-header {
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

.register-form {
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
  outline: none;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.register-btn:disabled {
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

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  color: #64748b;
}

.login-btn {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.5rem;
  transition: color 0.3s ease;
}

.login-btn:hover {
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

/* 添加密码强度指示器样式 */
.password-strength {
  margin-top: -1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #64748b;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  background: #e2e8f0;
  margin-top: 0.5rem;
  overflow: hidden;
}

.strength-bar-fill {
  height: 100%;
  width: 0;
  transition: all 0.3s ease;
}

.strength-weak .strength-bar-fill {
  width: 33.33%;
  background: #e74c3c;
}

.strength-medium .strength-bar-fill {
  width: 66.66%;
  background: #f39c12;
}

.strength-strong .strength-bar-fill {
  width: 100%;
  background: #2ecc71;
}
</style>

<script>
export default {
  name: 'Register',
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async register() {
      if (this.password !== this.confirmPassword) {
        this.error = '两次输入的密码不一致';
        return;
      }
      
      this.loading = true;
      this.error = '';
      
      try {
        const response = await this.$axios.post('/user/register', {
          username: this.username,
          password: this.password
        });
        
        if (response.data.success) {
          // 注册成功后自动登录
          localStorage.setItem('userId', response.data.userId);
          this.$router.push('/files');
        } else {
          this.error = response.data.message || '注册失败，请稍后再试';
        }
      } catch (error) {
        console.error('注册失败:', error);
        this.error = error.response?.data?.message || '注册失败，请稍后再试';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script> 
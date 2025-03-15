<template>
  <div class="register-container">
    <div class="register-card card">
      <h2>创建新账号</h2>
      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-wrapper">
            <input 
              id="username" 
              v-model="username" 
              type="text" 
              placeholder="请输入用户名" 
              required
            />
            <span class="input-icon">👤</span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper">
            <input 
              id="password" 
              v-model="password" 
              type="password" 
              placeholder="请输入密码" 
              required
            />
            <span class="input-icon">🔒</span>
          </div>
        </div>
        
        <div class="error" v-if="error">{{ error }}</div>
        <div class="success" v-if="success">{{ success }}</div>
        
        <button type="submit" class="register-btn" :disabled="loading">
          {{ loading ? '注册中...' : '注册账号' }}
        </button>
        
        <div class="login-link">
          <p>已有账号？</p>
          <router-link to="/login" class="login-btn">返回登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: '',
      success: ''
    }
  },
  methods: {
    async register() {
      this.loading = true;
      this.error = '';
      this.success = '';
      
      try {
        const response = await this.$axios.post('/user/register', {
          username: this.username,
          password: this.password
        });
        
        if (response.data.success) {
          localStorage.setItem('userId', response.data.userId);
          localStorage.setItem('username', this.username);
          
          this.success = '注册成功，正在为您自动登录...';
          
          setTimeout(() => {
            this.$router.push('/files');
          }, 1000);
        } else {
          this.error = response.data.message || '注册失败，可能用户名已存在';
        }
      } catch (error) {
        console.error('注册错误:', error);
        if (error.response) {
          this.error = error.response.data.message || '注册失败，服务器错误';
        } else if (error.request) {
          this.error = '无法连接到服务器，请检查网络连接';
        } else {
          this.error = '注册请求错误';
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.register-card h2 {
  margin-bottom: 2rem;
  text-align: center;
  color: #2c3e50;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #6e8efb;
  box-shadow: 0 0 0 3px rgba(110, 142, 251, 0.1);
  outline: none;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 142, 251, 0.2);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  margin: 1rem 0;
  padding: 10px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 6px;
}

.success {
  color: #27ae60;
  margin: 1rem 0;
  padding: 10px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 6px;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.login-btn {
  color: #6e8efb;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-btn:hover {
  color: #a777e3;
}
</style> 
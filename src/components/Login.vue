<template>
  <div class="login-container">
    <div class="login-card card">
      <h2>文件管理系统登录</h2>
      <form @submit.prevent="login">
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
        
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="register-section">
        <span>没有账号？</span>
        <a 
          href="javascript:void(0)" 
          class="register-link-btn"
          @click="goToRegister"
        >
          注册新账号
        </a>
      </div>
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
        
        // 检查API返回的success字段
        if (response.data.success) {
          // 登录成功，保存userId到localStorage
          localStorage.setItem('userId', response.data.userId);
          localStorage.setItem('username', this.username);
          this.$router.push('/files');
        } else {
          // API返回了success=false
          this.error = response.data.message || '登录失败，请检查用户名和密码';
        }
      } catch (error) {
        console.error('登录错误:', error);
        // 详细错误日志
        if (error.response) {
          console.error('错误状态:', error.response.status);
          console.error('错误数据:', error.response.data);
          this.error = error.response.data.message || '登录失败，服务器错误';
        } else if (error.request) {
          console.error('没有收到响应');
          this.error = '无法连接到服务器，请检查网络连接';
        } else {
          console.error('请求错误:', error.message);
          this.error = '登录请求错误';
        }
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.login-card h2 {
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

.login-btn {
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

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 142, 251, 0.2);
}

.login-btn:disabled {
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

.register-section {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.register-section span {
  color: #666;
  margin-right: 0.5rem;
}

.register-link-btn {
  color: #ff4081;
  text-decoration: none;
  font-weight: 600;
  padding: 4px 12px;
  border: 2px solid #ff4081;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.register-link-btn:hover {
  background-color: #ff4081;
  color: white;
}
</style> 
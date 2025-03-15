<template>
  <div class="file-detail">
    <div class="back-link">
      <button @click="goBack" class="back-btn">
        <span class="back-icon">←</span>
        返回文件列表
      </button>
    </div>
    
    <div class="content-card">
      <div class="file-header">
        <h2 class="file-title">
          <span class="file-icon">📄</span>
          {{ file.filename }}
        </h2>
        <div class="file-meta">
          <span class="meta-item">
            <span class="meta-icon">📏</span>
            大小：{{ file.size }} B
          </span>
          <span class="meta-item">
            <span class="meta-icon">🔒</span>
            权限：{{ getPermissionText(file.permission) }}
          </span>
          <span class="meta-item">
            <span class="meta-icon">🕒</span>
            创建时间：{{ formatDate(file.createTime) }}
          </span>
        </div>
      </div>
      
      <div class="file-content">
        <h3>文件内容</h3>
        <div class="content-viewer">
          <pre>{{ formatContent(file.content) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileDetail',
  data() {
    return {
      file: {
        filename: '',
        content: '',
        size: 0,
        permission: '',
        createTime: ''
      }
    }
  },
  methods: {
    goBack() {
      this.$router.push('/files')
    },
    getPermissionText(permission) {
      const map = {
        'read': '只读',
        'write': '只写',
        'readwrite': '读写'
      }
      return map[permission] || permission
    },
    formatDate(date) {
      return new Date(date).toLocaleString('zh-CN')
    },
    formatContent(content) {
      // 每50个字符换行
      return content.replace(/(.{50})/g, '$1\n')
    }
  }
}
</script>

<style scoped>
.file-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.back-link {
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.2);
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05),
              0 10px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.file-header {
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #edf2f7;
}

.file-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.file-icon {
  font-size: 2rem;
}

.file-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  font-size: 1.2rem;
}

.file-content {
  padding: 2rem;
}

.file-content h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.content-viewer {
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  overflow: auto;
  max-height: 500px;
}

.content-viewer pre {
  margin: 0;
  padding: 1.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-detail {
    padding: 1rem;
  }
  
  .file-meta {
    gap: 1rem;
    flex-direction: column;
  }
  
  .content-viewer {
    max-height: 300px;
  }
}
</style>
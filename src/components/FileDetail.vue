<template>
  <div class="file-detail">
    <div class="back-link">
      <button @click="goBack" class="back-btn">返回文件列表</button>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="error" class="error-card card">
      <h3>无法访问文件</h3>
      <p class="error-message">{{ error }}</p>
      <button @click="goBack" class="back-btn">返回文件列表</button>
    </div>
    
    <div v-else class="file-detail-content">
      <!-- 文件信息 -->
      <div class="card file-info">
        <h2>文件信息</h2>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">文件名:</span>
            <div class="editable-field" v-if="!editFilename">
              <span>{{ file.filename }}</span>
              <button @click="editFilename = true" class="edit-btn" v-if="canWrite">编辑</button>
            </div>
            <div class="edit-form" v-else>
              <input 
                v-model="newFilename" 
                type="text" 
                @keydown.enter="updateFilename"
              />
              <button @click="updateFilename" :disabled="updateFilenameLoading">保存</button>
              <button @click="cancelFilenameEdit" class="cancel-btn">取消</button>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-label">大小:</span>
            <span>{{ formatFileSize(file.size) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">类型:</span>
            <span>{{ file.fileType || file.type || '文本文件' }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">权限:</span>
            <div class="editable-field" v-if="!editPermission">
              <span>{{ translatePermission(file.permission) }}</span>
              <button @click="editPermission = true" class="edit-btn" v-if="canWrite">编辑</button>
            </div>
            <div class="edit-form" v-else>
              <select v-model="newPermission">
                <option value="read">只读</option>
                <option value="write">只写</option>
                <option value="readwrite">读写</option>
              </select>
              <button @click="updatePermission" :disabled="updatePermissionLoading">保存</button>
              <button @click="cancelPermissionEdit" class="cancel-btn">取消</button>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-label">创建时间:</span>
            <span>{{ formatDate(file.createTime) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">修改时间:</span>
            <span>{{ formatDate(file.updateTime) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 文件内容 -->
      <div class="card file-content-card">
        <h3>文件内容</h3>
        
        <!-- 只写权限 -->
        <div v-if="!canRead && canWrite" class="write-only-editor">
          <p class="edit-warning">此文件为只写权限，您可以更新内容但无法查看当前内容</p>
          <textarea 
            v-model="newContent" 
            rows="10"
            placeholder="请输入新的文件内容"
          ></textarea>
          <div class="content-actions">
            <button @click="updateContent" :disabled="updateContentLoading">
              {{ updateContentLoading ? '保存中...' : '保存内容' }}
            </button>
          </div>
        </div>
        
        <!-- 只读权限 -->
        <div v-else-if="canRead && !canWrite">
          <div class="formatted-content">
            <template v-for="(line, index) in formattedContent">
              <div :key="index" class="content-line">{{ line }}</div>
            </template>
          </div>
        </div>
        
        <!-- 读写权限 -->
        <div v-else-if="canRead && canWrite">
          <div v-if="!editContent" class="content-display">
            <div class="formatted-content">
              <template v-for="(line, index) in formattedContent">
                <div :key="index" class="content-line">{{ line }}</div>
              </template>
            </div>
            <button @click="startEditContent" class="edit-content-btn">
              编辑内容
            </button>
          </div>
          
          <div v-else class="content-editor">
            <textarea 
              v-model="newContent" 
              rows="10"
              placeholder="请输入文件内容"
            ></textarea>
            <div class="content-actions">
              <button @click="updateContent" :disabled="updateContentLoading">
                {{ updateContentLoading ? '保存中...' : '保存内容' }}
              </button>
              <button @click="cancelContentEdit" class="cancel-btn">取消</button>
            </div>
          </div>
        </div>
        
        <!-- 无权限 -->
        <div v-else class="edit-warning">
          您没有读写此文件的权限
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: '',
      file: {},
      userId: localStorage.getItem('userId'),
      
      // 编辑文件名
      editFilename: false,
      newFilename: '',
      updateFilenameLoading: false,
      
      // 编辑权限
      editPermission: false,
      newPermission: '',
      updatePermissionLoading: false,
      
      // 编辑内容
      editContent: false,
      newContent: '',
      updateContentLoading: false
    }
  },
  computed: {
    formattedContent() {
      if (!this.file.content) return [''];
      
      // 每50个字符分割成一行
      const content = this.file.content;
      const lines = [];
      for (let i = 0; i < content.length; i += 50) {
        lines.push(content.substring(i, i + 50));
      }
      return lines;
    },
    canRead() {
      // 只有 'read' 或 'readwrite' 权限才能读取
      const permission = this.file.permission;
      console.log('当前文件权限:', permission); // 添加调试日志
      return permission === 'read' || permission === 'readwrite';
    },
    canWrite() {
      // 只有 'write' 或 'readwrite' 权限才能写入
      const permission = this.file.permission;
      console.log('当前文件权限:', permission); // 添加调试日志
      return permission === 'write' || permission === 'readwrite';
    }
  },
  created() {
    this.fetchFileDetails();
  },
  methods: {
    async fetchFileDetails() {
      this.loading = true;
      try {
        const response = await this.$axios.get(`/file/${this.id}`);
        
        if (response.data.success) {
          this.file = response.data.file;
          this.newFilename = this.file.filename;
          this.newPermission = this.file.permission;
          this.newContent = this.file.content;
        } else {
          // 显示后端返回的错误信息
          this.error = response.data.message;
          this.file = {}; // 清空文件数据
        }
      } catch (error) {
        console.error('获取文件详情失败:', error);
        // 如果是后端返回的错误信息，则显示该信息
        if (error.response && error.response.data) {
          this.error = error.response.data.message;
        } else {
          this.error = '获取文件详情失败，可能文件不存在或已被删除';
        }
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.push('/files');
    },
    
    // 文件名编辑
    cancelFilenameEdit() {
      this.editFilename = false;
      this.newFilename = this.file.filename;
    },
    
    async updateFilename() {
      if (!this.newFilename || this.newFilename === this.file.filename) {
        this.editFilename = false;
        return;
      }
      
      this.updateFilenameLoading = true;
      try {
        const response = await this.$axios.put(`/file/name/${this.id}`, {
          filename: this.newFilename
        });
        if (response.data.success) {
          this.file = response.data.file;  // 使用返回的 file 数据
          this.editFilename = false;
        } else {
          throw new Error(response.data.message || '更新文件名失败');
        }
      } catch (error) {
        console.error('更新文件名失败:', error);
        alert(error.message || '更新文件名失败，请稍后再试');
      } finally {
        this.updateFilenameLoading = false;
      }
    },
    
    // 权限编辑
    cancelPermissionEdit() {
      this.editPermission = false;
      this.newPermission = this.file.permission;
    },
    
    async updatePermission() {
      if (this.newPermission === this.file.permission) {
        this.editPermission = false;
        return;
      }
      
      this.updatePermissionLoading = true;
      try {
        const response = await this.$axios.put(`/file/permission/${this.id}`, {
          permission: this.newPermission
        });
        if (response.data.success) {
          this.file = response.data.file;  // 使用返回的 file 数据
          this.editPermission = false;
        } else {
          throw new Error(response.data.message || '更新文件权限失败');
        }
      } catch (error) {
        console.error('更新文件权限失败:', error);
        alert(error.message || '更新文件权限失败，请稍后再试');
      } finally {
        this.updatePermissionLoading = false;
      }
    },
    
    // 内容编辑
    startEditContent() {
      this.editContent = true;
      this.newContent = this.file.content || '';
    },
    
    cancelContentEdit() {
      this.editContent = false;
      this.newContent = this.file.content;
    },
    
    async updateContent() {
      this.updateContentLoading = true;
      try {
        const response = await this.$axios.put(`/file/content/${this.id}`, {
          content: this.newContent
        });
        if (response.data.success) {
          this.file = response.data.file;  // 使用返回的 file 数据
          this.editContent = false;
        } else {
          throw new Error(response.data.message || '更新文件内容失败');
        }
      } catch (error) {
        console.error('更新文件内容失败:', error);
        alert(error.message || '更新文件内容失败，请稍后再试');
      } finally {
        this.updateContentLoading = false;
      }
    },
    
    formatFileSize(size) {
      const fileSize = size || this.file.fileSize;
      if (!fileSize && fileSize !== 0) return '未知';
      if (fileSize < 1024) {
        return `${fileSize} B`;
      } else if (fileSize < 1024 * 1024) {
        return `${(fileSize / 1024).toFixed(2)} KB`;
      } else {
        return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
      }
    },
    
    formatDate(timestamp) {
      if (!timestamp) return '未知';
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN');
    },
    
    translatePermission(permission) {
      const permMap = {
        'read': '只读',
        'write': '只写',
        'readwrite': '读写'
      };
      return permMap[permission] || permission;
    }
  }
}
</script>

<style scoped>
.file-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.back-link {
  margin-bottom: 1.5rem;
}

.back-btn {
  background-color: #7f8c8d;
  display: flex;
  align-items: center;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.file-detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.file-info {
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #7f8c8d;
}

.editable-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.edit-btn {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  background-color: #95a5a6;
}

.edit-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.edit-form input, .edit-form select {
  flex: 1;
  margin-bottom: 0;
}

.cancel-btn {
  background-color: #95a5a6;
}

.file-content-card h3 {
  margin-bottom: 1rem;
}

.formatted-content {
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 200px;
  white-space: pre-wrap;
  margin-bottom: 1rem;
  font-family: monospace;
}

.content-line {
  margin-bottom: 0.25rem;
}

.edit-content-btn {
  width: 100%;
}

.content-editor textarea {
  width: 100%;
  resize: vertical;
  min-height: 200px;
  font-family: monospace;
}

.content-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.edit-warning {
  color: #e67e22;
  margin-bottom: 1rem;
  font-weight: bold;
  padding: 0.5rem;
  background-color: #fff3e0;
  border-radius: 4px;
}

.write-only-editor {
  margin-top: 1rem;
}

.error-card {
  text-align: center;
  padding: 2rem;
}

.error-card h3 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-message {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.back-btn {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background-color: #7f8c8d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #6c7a7d;
}
</style> 
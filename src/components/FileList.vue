<template>
  <div class="file-list">
    <!-- 页面标题和统计信息 -->
    <div class="page-header">
      <div class="header-content">
        <h2>我的文件</h2>
        <div class="file-stats">
          <div class="stat-item">
            <span class="stat-icon">📄</span>
            <span class="stat-value">{{ files.length }}</span>
            <span class="stat-label">个文件</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 创建新文件表单 -->
    <div class="card create-file-card">
      <div class="card-header">
        <h3>
          <span class="card-icon">✨</span>
          创建新文件
        </h3>
      </div>
      
      <form @submit.prevent="createFile">
        <div class="form-grid">
          <div class="form-group">
            <label for="filename">
              <span class="label-icon">📝</span>
              文件名
            </label>
            <input 
              id="filename" 
              v-model="newFile.filename" 
              type="text" 
              placeholder="请输入文件名" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="permission">
              <span class="label-icon">🔒</span>
              文件权限
            </label>
            <select id="permission" v-model="newFile.permission" required>
              <option value="read">只读</option>
              <option value="write">只写</option>
              <option value="readwrite">读写</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="content">
            <span class="label-icon">📄</span>
            文件内容
          </label>
          <textarea 
            id="content" 
            v-model="newFile.content" 
            rows="4" 
            placeholder="请输入文件内容"
          ></textarea>
        </div>
        
        <div class="error" v-if="createError">{{ createError }}</div>
        <div class="success" v-if="createSuccess">{{ createSuccess }}</div>
        
        <button type="submit" :disabled="creating" class="create-btn">
          <span class="btn-content">
            <span v-if="creating" class="loading-spinner"></span>
            {{ creating ? '创建中...' : '创建文件' }}
          </span>
        </button>
      </form>
    </div>
    
    <!-- 文件列表 -->
    <div class="card file-table-card">
      <div class="card-header">
        <h3>
          <span class="card-icon">📋</span>
          文件列表
        </h3>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="error" class="error-state">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="fetchFiles" class="retry-btn">重试</button>
      </div>
      
      <div v-else-if="files.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>您还没有创建任何文件</p>
      </div>
      
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>文件名</th>
              <th>大小</th>
              <th>权限</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files" :key="file.id">
              <td class="filename-cell">
                <span class="file-icon">📄</span>
                {{ file.filename }}
              </td>
              <td>{{ formatFileSize(file) }}</td>
              <td>
                <span class="permission-tag" :class="file.permission">
                  {{ translatePermission(file.permission) }}
                </span>
              </td>
              <td>{{ formatDate(file.createTime) }}</td>
              <td class="actions">
                <button @click="viewFile(file.id)" class="action-btn view-btn" title="查看">
                  👁️
                </button>
                <button @click="editFile(file)" class="action-btn edit-btn" title="修改">
                  ✏️
                </button>
                <button 
                  v-if="!file.isOpen" 
                  @click="openFile(file)" 
                  class="action-btn open-btn"
                  :disabled="opening === file.id"
                  title="打开"
                >
                  📂
                </button>
                <button 
                  v-else 
                  @click="closeFile(file)" 
                  class="action-btn close-btn"
                  :disabled="closing === file.id"
                  title="关闭"
                >
                  📁
                </button>
                <button @click="confirmDelete(file)" class="action-btn delete-btn" title="删除">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 删除确认对话框 -->
    <transition name="fade">
      <div v-if="showDeleteConfirm" class="delete-modal">
        <div class="delete-modal-content card">
          <h3>确认删除</h3>
          <p>您确定要删除文件 <strong>{{ selectedFile.filename }}</strong> 吗？</p>
          <p class="warning">此操作不可撤销！</p>
          <div class="modal-actions">
            <button @click="deleteFile" class="confirm-delete">确认删除</button>
            <button @click="showDeleteConfirm = false" class="cancel-delete">取消</button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 添加修改文件的模态框 -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content card">
        <h3>修改文件</h3>
        <form @submit.prevent="updateFile">
          <div class="form-group">
            <label for="edit-filename">文件名</label>
            <input 
              id="edit-filename" 
              v-model="editingFile.filename" 
              type="text" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="edit-content">文件内容</label>
            <textarea 
              id="edit-content" 
              v-model="editingFile.content" 
              rows="6"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="edit-permission">文件权限</label>
            <select id="edit-permission" v-model="editingFile.permission">
              <option value="read">只读</option>
              <option value="write">只写</option>
              <option value="readwrite">读写</option>
            </select>
          </div>
          
          <div class="error" v-if="editError">{{ editError }}</div>
          
          <div class="modal-actions">
            <button type="submit" :disabled="updating">
              {{ updating ? '保存中...' : '保存修改' }}
            </button>
            <button type="button" @click="cancelEdit" class="cancel-btn">取消</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 添加打开文件的模态框 -->
    <transition name="fade">
      <div v-if="openedFile" class="file-modal">
        <div class="file-modal-content card">
          <div class="file-modal-header">
            <h3 style="color: aqua;">{{ openedFile.filename }}</h3>
            <button class="close-modal-btn" @click="closeOpenedFile">×</button>
          </div>
          
          <div class="file-info-bar">
            <span>大小: {{ formatFileSize(openedFile) }}</span>
            <span>权限: {{ translatePermission(openedFile.permission) }}</span>
            <span>创建时间: {{ formatDate(openedFile.createTime) }}</span>
          </div>
          
          <div class="file-content-viewer">
            <pre>{{ openedFile.content }}</pre>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'FileList',
  data() {
    return {
      loading: true,
      files: [],
      error: '',
      userId: localStorage.getItem('userId'),
      
      // 新文件表单
      newFile: {
        filename: '',
        content: '',
        permission: 'read'
      },
      creating: false,
      createError: '',
      createSuccess: '',
      
      // 删除确认
      showDeleteConfirm: false,
      selectedFile: null,
      deleting: false,
      
      // 添加编辑相关的数据
      showEditModal: false,
      editingFile: null,
      editError: '',
      updating: false,
      
      // 记录打开的文件ID列表
      openFiles: new Set(JSON.parse(localStorage.getItem('openFiles') || '[]')),
      opening: null,
      closing: null,
      openedFile: null, // 当前打开的文件
    }
  },
  created() {
    this.fetchFiles();
  },
  methods: {
    async fetchFiles() {
      this.loading = true;
      this.error = '';
      
      try {
        const userId = localStorage.getItem('userId');
        const response = await this.$axios.get(`/file/list/${userId}`);
        
        if (response.data.success) {
          // 为每个文件添加打开状态
          this.files = (response.data.files || []).map(file => ({
            ...file,
            isOpen: this.openFiles.has(file.id)
          }));
        } else {
          this.error = '获取文件列表失败';
        }
      } catch (error) {
        console.error('获取文件列表失败:', error);
        if (error.response) {
          console.error('错误响应:', error.response.data);
          this.error = error.response.data.message || '获取文件列表失败，服务器错误';
        } else if (error.request) {
          this.error = '无法连接到服务器，请检查网络连接';
        } else {
          this.error = '获取文件列表失败，请稍后再试';
        }
      } finally {
        this.loading = false;
      }
    },
    
    async createFile() {
      this.creating = true;
      this.createError = '';
      this.createSuccess = '';
      
      try {
        const userId = localStorage.getItem('userId');
        await this.$axios.post('/file/create', {
          userId: parseInt(userId),
          filename: this.newFile.filename,
          content: this.newFile.content || '',
          permission: this.newFile.permission
        });
        
        this.createSuccess = '文件创建成功！';
        // 重置表单
        this.newFile = {
          filename: '',
          content: '',
          permission: 'read'
        };
        // 刷新文件列表
        await this.fetchFiles();
      } catch (error) {
        console.error('创建文件失败:', error);
        if (error.response) {
          this.createError = error.response.data.message || '创建文件失败，服务器错误';
        } else if (error.request) {
          this.createError = '无法连接到服务器，请检查网络连接';
        } else {
          this.createError = '创建文件失败，请稍后再试';
        }
      } finally {
        this.creating = false;
      }
    },
    
    viewFile(fileId) {
      this.$router.push(`/file/${fileId}`);
    },
    
    confirmDelete(file) {
      this.selectedFile = file;
      this.showDeleteConfirm = true;
    },
    
    async deleteFile() {
      if (!this.selectedFile || this.deleting) return;
      
      this.deleting = true;
      try {
        await this.$axios.delete(`/file/${this.selectedFile.id}`);
        await this.fetchFiles();
        this.showDeleteConfirm = false;
        this.selectedFile = null;
      } catch (error) {
        console.error('删除文件失败:', error);
        if (error.response) {
          alert(error.response.data.message || '删除文件失败，服务器错误');
        } else {
          alert('删除文件失败，请稍后再试');
        }
      } finally {
        this.deleting = false;
      }
    },
    
    formatFileSize(file) {
      const size = file.fileSize || 0;
      if (size < 1024) {
        return `${size} B`;
      } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
      } else {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      }
    },
    
    formatDate(timestamp) {
      if (!timestamp) return '未知';
      try {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (e) {
        console.error('日期格式化错误:', e);
        return '日期格式错误';
      }
    },
    
    translatePermission(permission) {
      const permissionMap = {
        'read': '只读',
        'write': '只写',
        'readwrite': '读写'
      };
      return permissionMap[permission] || permission;
    },
    
    editFile(file) {
      this.editingFile = {
        id: file.id,
        filename: file.filename,
        content: file.content,
        permission: file.permission
      };
      this.showEditModal = true;
    },
    
    cancelEdit() {
      this.showEditModal = false;
      this.editingFile = null;
      this.editError = '';
    },
    
    async updateFile() {
      if (!this.editingFile) return;
      
      this.updating = true;
      this.editError = '';
      
      try {
        // 更新文件名
        await this.$axios.put(`/file/name/${this.editingFile.id}`, {
          filename: this.editingFile.filename
        });
        
        // 更新文件内容
        await this.$axios.put(`/file/content/${this.editingFile.id}`, {
          content: this.editingFile.content
        });
        
        // 更新文件权限
        await this.$axios.put(`/file/permission/${this.editingFile.id}`, {
          permission: this.editingFile.permission
        });
        
        // 刷新文件列表
        await this.fetchFiles();
        this.showEditModal = false;
        this.editingFile = null;
      } catch (error) {
        console.error('更新文件失败:', error);
        if (error.response && error.response.data) {
          this.editError = error.response.data.message;
        } else {
          this.editError = '更新文件失败，请稍后再试';
        }
      } finally {
        this.updating = false;
      }
    },
    
    async openFile(file) {
      this.opening = file.id;
      try {
        // 获取最新的文件内容
        const response = await this.$axios.get(`/file/${file.id}`);
        if (response.data.success) {
          this.openedFile = response.data.file;
          this.openFiles.add(file.id);
          localStorage.setItem('openFiles', JSON.stringify([...this.openFiles]));
          const index = this.files.findIndex(f => f.id === file.id);
          if (index !== -1) {
            this.files[index].isOpen = true;
          }
        } else {
          throw new Error(response.data.message || '获取文件内容失败');
        }
      } catch (error) {
        console.error('打开文件失败:', error);
        alert(error.message || '打开文件失败，请稍后再试');
      } finally {
        this.opening = null;
      }
    },
    
    async closeFile(file) {
      this.closing = file.id;
      try {
        this.openFiles.delete(file.id);
        localStorage.setItem('openFiles', JSON.stringify([...this.openFiles]));
        const index = this.files.findIndex(f => f.id === file.id);
        if (index !== -1) {
          this.files[index].isOpen = false;
        }
      } catch (error) {
        console.error('关闭文件失败:', error);
        alert('关闭文件失败，请稍后再试');
        this.openFiles.add(file.id);
      } finally {
        this.closing = null;
      }
    },
    
    // 关闭打开的文件
    closeOpenedFile() {
      if (this.openedFile) {
        const file = this.files.find(f => f.id === this.openedFile.id);
        if (file) {
          this.closeFile(file);
        }
        this.openedFile = null;
      }
    }
  }
}
</script>

<style scoped>
.file-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
}

.file-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.stat-label {
  color: #64748b;
}

.card {
  margin-bottom: 2rem;
}

.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #edf2f7;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.card-icon {
  font-size: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.label-icon {
  margin-right: 0.5rem;
}

.create-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  width: 100%;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
}

.filename-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-icon {
  font-size: 1.2rem;
}

.permission-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.permission-tag.read {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.permission-tag.write {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.permission-tag.readwrite {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 1.2rem;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  border-color: #3498db;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(52, 152, 219, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .file-stats {
    display: none;
  }
  
  .actions {
    flex-wrap: wrap;
  }
}

.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.delete-modal-content {
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.delete-modal-content h3 {
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.warning {
  color: #e74c3c;
  margin: 1rem 0;
  font-weight: bold;
}

.confirm-delete {
  background-color: #e74c3c;
}

.cancel-delete {
  background-color: #7f8c8d;
}

/* 添加表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: 600;
  background-color: #f8f9fa;
}

.error {
  color: #e74c3c;
  padding: 1rem;
  background-color: #fdf3f2;
  border-radius: 4px;
  margin: 1rem 0;
  text-align: center;
}

.retry-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #c0392b;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-list {
  text-align: center;
  padding: 2rem;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.view-btn, .delete-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-btn {
  background-color: #3498db;
}

.view-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #e74c3c;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  padding: 2rem;
}

.modal-content h3 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.edit-btn {
  background-color: #2ecc71;
}

.edit-btn:hover {
  background-color: #27ae60;
}

.open-btn {
  background-color: #f39c12;
}

.open-btn:hover:not(:disabled) {
  background-color: #d68910;
}

.close-btn {
  background-color: #95a5a6;
}

.close-btn:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.open-btn:disabled,
.close-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.file-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.file-modal-content {
  width: 90%;
  max-width: 800px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.file-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  border-radius: 12px 12px 0 0;
}

.file-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: white;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
}

.close-modal-btn:hover {
  color: #d3d3d3;
}

.file-info-bar {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.file-content-viewer {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #fafafa;
}

.file-content-viewer pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  line-height: 1.6;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #edf2f7;
}

/* 美化创建文件表单 */
.card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #edf2f7;
}

/* 添加动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style> 
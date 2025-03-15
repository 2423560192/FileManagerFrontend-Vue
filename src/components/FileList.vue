<template>
  <div class="file-list">
    <h2>我的文件</h2>
    
    <!-- 创建新文件表单 -->
    <div class="card">
      <h3>创建新文件</h3>
      <form @submit.prevent="createFile">
        <div class="form-group">
          <label for="filename">文件名</label>
          <input 
            id="filename" 
            v-model="newFile.filename" 
            type="text" 
            placeholder="请输入文件名" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="content">文件内容</label>
          <textarea 
            id="content" 
            v-model="newFile.content" 
            rows="4" 
            placeholder="请输入文件内容"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="permission">文件权限</label>
          <select id="permission" v-model="newFile.permission" required>
            <option value="read">只读</option>
            <option value="write">只写</option>
            <option value="readwrite">读写</option>
          </select>
        </div>
        
        <div class="error" v-if="createError">{{ createError }}</div>
        <div class="success" v-if="createSuccess">{{ createSuccess }}</div>
        
        <button type="submit" :disabled="creating">
          {{ creating ? '创建中...' : '创建文件' }}
        </button>
      </form>
    </div>
    
    <!-- 文件列表 -->
    <div class="card file-table-card">
      <h3>文件列表</h3>
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="error" class="error">
        {{ error }}
        <button @click="fetchFiles" class="retry-btn">重试</button>
      </div>
      
      <div v-else-if="files.length === 0" class="empty-list">
        您还没有创建任何文件
      </div>
      
      <div v-else>
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
              <td>{{ file.filename }}</td>
              <td>{{ formatFileSize(file) }}</td>
              <td>{{ translatePermission(file.permission) }}</td>
              <td>{{ formatDate(file.createTime) }}</td>
              <td class="actions">
                <button @click="viewFile(file.id)" class="view-btn">查看</button>
                <button @click="editFile(file)" class="edit-btn">修改</button>
                <button 
                  v-if="!file.isOpen" 
                  @click="openFile(file)" 
                  class="open-btn"
                  :disabled="opening === file.id"
                >
                  {{ opening === file.id ? '打开中...' : '打开' }}
                </button>
                <button 
                  v-else 
                  @click="closeFile(file)" 
                  class="close-btn"
                  :disabled="closing === file.id"
                >
                  {{ closing === file.id ? '关闭中...' : '关闭' }}
                </button>
                <button @click="confirmDelete(file)" class="delete-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 删除确认对话框 -->
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
    <div v-if="openedFile" class="file-modal">
      <div class="file-modal-content card">
        <div class="file-modal-header">
          <h3>{{ openedFile.filename }}</h3>
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
.file-list h2 {
  margin-bottom: 1.5rem;
}

.file-table-card {
  margin-top: 2rem;
}

.loading, .empty-list {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.actions {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.actions button {
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
}

.view-btn {
  background-color: #3498db;
}

.delete-btn {
  background-color: #e74c3c;
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
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.file-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.file-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
}

.close-modal-btn:hover {
  color: #333;
}

.file-info-bar {
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.file-content-viewer {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.file-content-viewer pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  line-height: 1.5;
}
</style> 
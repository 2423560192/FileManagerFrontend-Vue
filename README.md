# 文件管理模拟系统前端 - File ManagerFrontend-Vue

## 项目概述

`file-manager-frontend` 是一个基于 Vue2 的前端项目，为操作系统课程设计中的文件管理模拟系统提供可视化界面。该系统通过与后端 `file-manager-backend`（运行在 `http://localhost:8080`）交互，实现用户管理（注册、登录）和文件管理（创建、删除、修改、查看文件属性等功能）。前端使用 Vue Router 管理页面路由，Axios 处理 API 请求，界面简洁直观，支持文件内容每50字符换行显示。

## 功能特性

- **用户管理**
  - 用户登录：输入用户名和密码，验证后跳转文件列表页。
  - 用户注册（可选）：创建新用户。
- **文件管理**
  - 文件列表：展示当前用户的所有文件，支持创建、删除和查看详情。
  - 文件创建：输入文件名、内容和权限，提交至后端。
  - 文件详情：显示文件内容（50字符换行）、属性，支持修改内容、文件名和权限。
- **其他**
  - 响应式界面，适配基本操作需求。
  - 跨域支持，通过代理调用后端 API。

## 技术栈

- **框架**: Vue2 (2.6.14)
- **路由**: Vue Router (3.5.1)
- **HTTP 请求**: Axios (1.6.0)
- **构建工具**: Vue CLI
- **依赖**: core-js

## 项目结构

复制

```
file-manager-frontend/
├── public/
│   ├── index.html           # 入口 HTML 文件
│   └── favicon.ico          # 图标
├── src/
│   ├── assets/              # 静态资源
│   ├── components/          # 组件
│   │   ├── Login.vue        # 登录组件
│   │   ├── FileList.vue     # 文件列表组件
│   │   └── FileDetail.vue   # 文件详情组件
│   ├── router/
│   │   └── index.js         # 路由配置
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── package.json             # 项目依赖和脚本
└── vue.config.js            # Vue CLI 配置
```

## 安装与运行

### 前置条件

- Node.js 14+（推荐使用 LTS 版本）
- npm 6+ 或 yarn
- Git
- 后端项目 `file-manager-backend` 已运行在 `http://localhost:8080`

### 步骤

1. **克隆仓库**

   ```bash
   git clone https://github.com/[你的用户名]/file-manager-frontend.git
   cd file-manager-frontend
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **配置代理** 检查 `vue.config.js`，确保代理正确配置：

   ```javascript
   module.exports = {
     devServer: {
       proxy: {
         '/api': {
           target: 'http://localhost:8080',
           changeOrigin: true
         }
       }
     }
   };
   ```

4. **运行项目**

   ```bash
   npm run serve
   ```

   项目启动后，默认访问 [http://localhost:8080](http://localhost:8080/)（若端口冲突，可修改 `vue.config.js`）。

5. **验证** 打开浏览器，访问 [http://localhost:8080](http://localhost:8080/)，应显示登录页面。 输入用户名和密码（如 testuser / 123456），登录后查看文件列表。

## 使用说明

- **登录** 在登录页面输入用户名和密码，点击“登录”按钮。 成功后跳转至文件列表页面，userId 存储在 localStorage。

- **文件管理**

  - 列表页面: 查看当前用户文件，点击“创建文件”输入信息，点击“删除”移除文件。
  - 详情页面: 查看文件内容（50字符换行），修改内容、文件名或权限后提交。

- **API 交互** 前端通过 `/api` 前缀调用后端接口，代理自动转发至 <http://localhost:8080/api>。 详细接口见后端仓库的 `openapi.yaml`。

- **示例界面** （建议添加截图，例如登录页面和文件列表页面）

  登录页面:

  文件列表页面:

## 相关项目

- 后端仓库: [file-manager-backend](https://github.com/2423560192/file-manager-backend)
# 项目架构说明

## 技术架构

### 1. 前端框架层
- **Vue 3.5+** - 使用 Composition API 和 `<script setup>` 语法
- **TypeScript 5.x** - 严格模式，提供完整类型安全
- **Vite 7.x** - 快速的开发服务器和构建工具

### 2. UI组件层
- **Element Plus** - 提供完整的UI组件
- **@element-plus/icons-vue** - Element Plus图标库
- **自定义组件** - 基于Element Plus封装的业务组件

### 3. 数据可视化层
- **ECharts 5.x** - 核心可视化引擎
- **BaseChart.vue** - ECharts封装组件，统一管理图表实例

### 4. 状态管理层
- **Pinia** - Vue官方推荐的状态管理库
  - `dataStore` - 管理舆情数据（网媒、微博）
  - `warningStore` - 管理预警规则和记录

### 5. 数据持久化层
- **Dexie.js** - IndexedDB封装
  - 支持大数据量本地存储
  - 提供索引和高效查询
  - 表结构：
    - `webmedia` - 网媒数据表
    - `weibo` - 微博数据表
    - `warningRules` - 预警规则表
    - `warningRecords` - 预警记录表

### 6. 网络请求层
- **Axios** - HTTP客户端
- 统一请求/响应拦截
- 错误处理和重试机制
- Token自动注入

### 7. 路由层
- **Vue Router 4.x** - 单页应用路由
- 路由懒加载
- 路由守卫

## 目录结构详解

```
src/
├── api/                    # API接口定义
│   └── ai.ts              # AI相关API（情感分析、关键词提取等）
│
├── assets/                # 静态资源
│   └── images/           # 图片资源
│
├── components/            # 公共组件
│   ├── charts/           # 图表组件
│   │   └── BaseChart.vue # ECharts基础封装
│   └── common/           # 通用组件
│       └── AppLayout.vue # 应用主布局
│
├── composables/          # Vue组合式函数
│   └── useXxx.ts        # 自定义Hooks
│
├── db/                   # 数据库层
│   └── index.ts         # Dexie数据库配置和操作
│
├── router/              # 路由配置
│   └── index.ts        # 路由定义和守卫
│
├── stores/             # Pinia状态管理
│   ├── index.ts       # Pinia实例
│   ├── dataStore.ts   # 数据状态（网媒+微博）
│   └── warningStore.ts # 预警状态
│
├── styles/            # 全局样式
│   └── main.scss     # 主样式文件
│
├── types/            # TypeScript类型定义
│   └── index.ts     # 全局类型（数据模型、接口等）
│
├── utils/           # 工具函数
│   ├── index.ts    # 通用工具（日期、格式化等）
│   ├── request.ts  # Axios封装
│   └── excel.ts    # Excel解析和导出
│
├── views/          # 页面组件
│   ├── dashboard/      # 实时分析大屏
│   ├── data-import/    # 数据导入
│   ├── analysis/       # 智能分析
│   └── warning/        # 预警管理
│
├── App.vue        # 根组件
└── main.ts       # 应用入口
```

## 数据流

### 1. 数据导入流程
```
用户上传Excel
  ↓
Excel解析 (utils/excel.ts)
  ↓
数据验证
  ↓
存储到IndexedDB (db/index.ts)
  ↓
更新Pinia状态 (stores/dataStore.ts)
  ↓
界面更新
```

### 2. AI分析流程
```
用户触发分析
  ↓
调用AI API (api/ai.ts)
  ↓
获取分析结果（情感、关键词、摘要）
  ↓
更新数据库记录 (db/index.ts)
  ↓
更新Pinia状态
  ↓
界面更新显示分析结果
```

### 3. 预警流程
```
数据变化 / 定时检查
  ↓
预警规则匹配 (stores/warningStore.ts)
  ↓
触发预警
  ↓
AI生成建议 (api/ai.ts)
  ↓
存储预警记录 (db/index.ts)
  ↓
通知用户（Toast/Modal）
```

## 核心功能实现

### 1. IndexedDB数据管理
使用Dexie.js封装，提供以下功能：
- 批量数据插入
- 分页查询
- 索引查询
- 全文搜索（基于字段包含）
- 统计聚合

### 2. 状态管理
使用Pinia的Composition API风格：
- 使用`ref`和`computed`定义响应式状态
- 异步操作直接在action中处理
- 模块化管理不同业务状态

### 3. 图表封装
BaseChart组件特性：
- 自动初始化和销毁
- 响应式尺寸调整
- 主题切换支持
- 配置深度监听自动更新

### 4. 路径别名
配置`@`别名指向`src`目录：
- vite.config.ts中配置resolve.alias
- tsconfig.app.json中配置paths
- 支持智能提示和路径跳转

## 性能优化策略

### 1. 路由懒加载
所有页面组件使用动态导入：
```typescript
component: () => import('@/views/dashboard/index.vue')
```

### 2. 代码分割
通过Vite配置将第三方库分割：
- element-plus独立打包
- echarts独立打包
- vue系列库打包到vue-vendor

### 3. 虚拟滚动
大数据列表使用虚拟滚动技术，仅渲染可见区域

### 4. 图表懒加载
图表组件按需加载，不可见时不初始化

## 开发工作流

### 1. 开发环境
```bash
npm run dev  # 启动开发服务器（http://localhost:3000）
```

### 2. 生产构建
```bash
npm run build  # 构建生产版本到dist目录
```

### 3. 类型检查
```bash
npm run type-check  # TypeScript类型检查
```

## 环境变量

### .env.development
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

### .env.production
```
VITE_API_BASE_URL=/api
VITE_APP_ENV=production
```

## 浏览器兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge最新版）
- 需要IndexedDB支持
- 需要ES6+支持

## 未来扩展

### 1. WebSocket实时推送
可在vite.config.ts中添加WebSocket服务器插件

### 2. PWA支持
使用vite-plugin-pwa添加离线支持

### 3. 单元测试
集成Vitest进行单元测试

### 4. E2E测试
使用Playwright进行端到端测试

# 互联网内容分析系统

基于 Vue 3 + TypeScript + Element Plus + ECharts 的舆情分析平台

## 技术栈

### 核心技术
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - JavaScript的超集，提供类型安全
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue官方状态管理库

### UI & 可视化
- **Element Plus** - 基于Vue 3的组件库
- **ECharts 5.x** - 强大的数据可视化库

### 数据管理
- **Dexie.js** - IndexedDB封装库，用于本地数据存储
- **Axios** - HTTP客户端

### 工具库
- **Day.js** - 轻量级日期处理库
- **Lodash** - JavaScript实用工具库
- **xlsx** - Excel文件解析库

## 项目结构

```
sentiment-analysis-system/
├── src/
│   ├── api/              # API接口
│   │   └── ai.ts         # AI分析API
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   │   ├── charts/       # 图表组件
│   │   └── common/       # 通用组件
│   ├── db/               # Dexie数据库配置
│   │   └── index.ts      # 数据库实例和操作
│   ├── router/           # 路由配置
│   │   └── index.ts      # 路由定义
│   ├── stores/           # Pinia状态管理
│   │   ├── index.ts      # Pinia实例
│   │   ├── dataStore.ts  # 数据状态
│   │   └── warningStore.ts # 预警状态
│   ├── types/            # TypeScript类型定义
│   │   └── index.ts      # 全局类型
│   ├── utils/            # 工具函数
│   │   ├── index.ts      # 通用工具
│   │   ├── request.ts    # Axios封装
│   │   └── excel.ts      # Excel处理
│   ├── views/            # 页面组件
│   │   ├── dashboard/    # 实时大屏
│   │   ├── data-import/  # 数据导入
│   │   ├── analysis/     # 智能分析
│   │   └── warning/      # 预警管理
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── .env                  # 环境变量
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── vite.config.ts        # Vite配置
├── tsconfig.json         # TypeScript配置
└── package.json          # 项目依赖
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动

### 生产构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 功能模块

### 1. 数据导入 (Data Import)
- 支持导入网媒数据和微博数据Excel文件
- 数据格式校验与错误提示
- 拖拽上传和点击上传
- 数据存储到IndexedDB

### 2. 实时分析大屏 (Dashboard)
- 实时数据流展示
- 多维度数据可视化
- 情感分布统计
- 热词词云图
- 趋势分析图表

### 3. 智能分析 (Analysis)
- AI情感分析
- 关键词提取
- 内容摘要生成
- 舆情分类与话题识别

### 4. 预警管理 (Warning)
- 预警规则配置
- 预警记录管理
- AI辅助决策
- 预警通知

## 数据模型

### 网媒数据 (WebMediaData)
- id: 唯一标识
- title: 新闻标题
- content: 新闻正文
- source: 来源媒体
- publishTime: 发布时间
- 等...

### 微博数据 (WeiboData)
- id: 唯一标识
- content: 微博内容
- userId: 用户ID
- userName: 用户昵称
- publishTime: 发布时间
- likeCount: 点赞数
- commentCount: 评论数
- repostCount: 转发数
- 等...

## 开发规范

### 代码风格
- 使用TypeScript严格模式
- 遵循Vue 3 Composition API风格
- 组件使用`<script setup>`语法

### 命名规范
- 组件：PascalCase (如 `BaseChart.vue`)
- 文件夹：kebab-case (如 `data-import`)
- 函数/变量：camelCase (如 `loadData`)
- 常量：UPPER_SNAKE_CASE (如 `API_BASE_URL`)

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具链相关

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## License

MIT

## 作者

Generated with Claude Code

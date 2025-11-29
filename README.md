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

### 1. 数据导入 (Data Import) ✅ 已实现

#### 数据源管理
- **左侧边栏**：数据源列表管理
  - 创建新数据源
  - 选择和切换数据源
  - 查看数据源统计（条数、时间范围）
  - 删除数据源

#### Excel文件导入
- **拖拽上传**：支持拖拽Excel文件到上传区域
- **点击上传**：点击选择文件上传
- **格式支持**：.xlsx、.xls格式
- **自动识别数据类型**：
  - 根据"媒体渠道"字段自动识别网媒/微博数据
  - 网媒数据：包含标题、来源、浏览量等字段
  - 微博数据：包含用户信息、互动数据等字段
- **数据转换**：Excel数据自动转换为系统数据模型
- **存储**：数据保存到IndexedDB，支持离线访问

#### 数据管理
- **筛选功能**：
  - 按数据类型筛选（全部/网媒/微博）
  - 按日期范围筛选
  - 按关键词搜索（标题、内容）
- **数据列表**：
  - 网媒：显示标题、来源、发布时间、浏览量、分享量
  - 微博：显示内容、用户、发布时间、互动数据
- **批量操作**：
  - 批量选择
  - 批量删除
  - 单条删除

#### 数据统计
- **总览统计**：
  - 数据总条数
  - 网媒数据条数
  - 微博数据条数
  - 时间范围（最早-最新）
- **情感分布饼图**：正面/中性/负面情感占比
- **媒体来源分布**（网媒）：Top 10来源媒体柱状图
- **用户活跃度**（微博）：Top 10活跃用户柱状图
- **时间趋势图**：按天统计数据发布趋势
- **互动数据**（微博）：点赞、评论、转发总数统计
- **对比统计**：
  - 网媒与微博情感分布对比
  - 网媒与微博热度对比（浏览量 vs 互动量）

**注意**：所有统计图表会根据筛选条件实时更新

### 2. 实时分析大屏 (Dashboard) ✅ 已实现

#### 布局设计
- **三列布局**：
  - 左侧：网媒数据专区（400px）
  - 中间：综合分析区（自适应）
  - 右侧：微博数据专区（400px）
- **全屏显示**：
  - 点击导航菜单"实时大屏"在新窗口打开
  - 基于1920x1080分辨率设计
  - 响应式缩放适配不同屏幕

#### 顶部统计卡片
- 总舆情数量
- 网媒数据量
- 微博数据量
- 正面/中性/负面情感分布

#### 网媒数据专区（左侧）
- **实时数据流**：
  - 最新10条网媒数据
  - 滚动展示标题、来源、时间
  - 自动刷新（10秒间隔）
- **情感趋势图**：
  - 24小时/7天/30天趋势
  - 正面/中性/负面情感折线图
- **情感分布饼图**：网媒情感占比
- **热门报道列表**：
  - Top 10热门网媒（按浏览量排序）
  - 显示标题、来源、浏览量

#### 微博数据专区（右侧）
- **实时数据流**：
  - 最新10条微博数据
  - 滚动展示内容、用户、时间
  - 自动刷新（10秒间隔）
- **情感趋势图**：
  - 24小时/7天/30天趋势
  - 正面/中性/负面情感折线图
- **情感分布饼图**：微博情感占比
- **热门话题列表**：
  - Top 10热门微博（按互动量排序）
  - 显示内容、用户、互动数

#### 综合分析区（中间）
- **热词词云**：
  - 提取所有数据的关键词
  - 词频越高字体越大
  - 彩色渐变显示
- **数据源对比图**：
  - 网媒与微博数量对比柱状图
  - 分正面/中性/负面对比
- **关联分析图**：
  - 情感与互动量关系散点图
  - 分析不同情感的传播效果

**特性**：所有图表每30秒自动刷新数据

### 3. 智能分析 (Analysis) 🚧 规划中
- AI情感分析（待接入AI API）
- 关键词提取
- 内容摘要生成
- 舆情分类与话题识别

### 4. 预警管理 (Warning) ✅ 已实现

#### 统计仪表盘
- **4个关键指标卡片**：
  - 未处理预警数量（红色高亮）
  - 严重预警数量
  - 启用规则数量
  - 今日预警数量

#### 预警规则管理
- **规则列表**：
  - 表格展示所有预警规则
  - 显示规则名称、类型、级别、配置、状态
- **规则类型**（4种）：
  - **关键词预警**：监控特定关键词出现
  - **情感阈值预警**：负面情感占比超过阈值
  - **舆情量激增预警**：短时间内数据量激增
  - **传播速度预警**：转发/评论速度异常
- **预警级别**：严重（红）、警告（橙）、提示（蓝）
- **规则操作**：
  - 新增规则
  - 编辑规则
  - 启用/禁用规则（开关切换）
  - 删除规则
- **规则配置**：
  - 关键词：多个关键词用逗号分隔
  - 情感阈值：负面情感占比百分比
  - 数量阈值：舆情数量上限
  - 速度阈值：传播速度上限

#### 预警记录管理
- **筛选功能**：
  - 按状态筛选：全部/未处理/处理中/已解决
  - 按级别筛选：全部/严重/警告/提示
- **记录列表**：
  - 触发时间
  - 规则名称
  - 预警级别
  - 预警原因
  - 处理状态
- **记录操作**：
  - 查看详情
  - 标记为处理中
  - 标记为已解决
  - 忽略预警
- **详情对话框**：
  - 完整预警信息
  - AI建议（如有）
  - 快速处理按钮

#### 预警统计
- **4个可视化图表**：
  - **预警趋势图**：最近7天预警数量折线图
  - **预警级别分布**：严重/警告/提示饼图
  - **预警类型分布**：各类型预警数量柱状图
  - **处理状态分布**：未处理/处理中/已解决/已忽略环形图

#### 导航栏预警提示
- **红色徽章**：显示未处理预警数量
- **快捷入口**："未处理预警"按钮直达预警页面

**技术实现**：
- 数据存储：IndexedDB（Dexie.js）
- 状态管理：Pinia warningStore
- 图表渲染：ECharts 5.x
- 表单验证：Element Plus Form Validation

## 技术架构

### 数据持久化
- **IndexedDB（Dexie.js）**：
  - 数据库名称：`SentimentAnalysisDB`
  - 表结构：
    - `webmedia`：网媒数据表
    - `weibo`：微博数据表
    - `warningRules`：预警规则表
    - `warningRecords`：预警记录表
  - 支持离线访问和大数据量存储

- **LocalStorage**：
  - 存储数据源配置信息
  - 映射数据源到具体数据ID

### 状态管理架构
- **dataStore**：
  - 管理网媒和微博数据
  - 提供数据CRUD操作
  - 计算统计数据
  - 支持数据筛选

- **warningStore**：
  - 管理预警规则和记录
  - 提供规则配置接口
  - 计算预警统计指标
  - 处理预警状态流转

### 路由设计
```
/ → /data-import (默认页面)
/data-import → 数据导入和管理
/dashboard/fullscreen → 全屏实时大屏（新窗口）
/analysis → AI智能分析
/warning → 预警管理
```

### 组件架构
- **布局组件**：
  - `AppLayout.vue`：主布局（导航栏 + 主内容区）
  - 条件布局：全屏页面隐藏导航栏

- **页面组件**：
  - `views/data-import/index.vue`：数据导入页（910行）
  - `views/dashboard/fullscreen.vue`：全屏大屏（850行）
  - `views/warning/index.vue`：预警管理页（930行）

- **图表组件**：
  - 基于 ECharts 5.x
  - 自动适配响应式
  - 支持实时数据更新

## 数据模型

### 网媒数据 (WebMediaData)
```typescript
interface WebMediaData {
  // 基础信息
  id: string                  // 唯一标识（格式：WM_timestamp_random）
  title: string               // 新闻标题
  content: string             // 新闻正文
  source: string              // 来源媒体
  author: string              // 作者
  publishTime: string         // 发布时间（ISO格式）
  url: string                 // 原文链接

  // 互动数据
  viewCount: number           // 浏览量
  shareCount: number          // 分享量

  // 分类信息
  mediaType: string           // 媒体类型
  category: string            // 新闻分类
  keywords: string            // 关键词（逗号分隔）

  // AI分析结果（可选）
  sentiment?: SentimentType   // 情感标签：positive/neutral/negative
  sentimentScore?: number     // 情感分数（0-100）
  aiKeywords?: string[]       // AI提取的关键词
  aiSummary?: string          // AI生成的摘要
  aiCategory?: string         // AI分类
  isWarning?: boolean         // 是否触发预警
  warningLevel?: WarningLevel // 预警级别
}
```

### 微博数据 (WeiboData)
```typescript
interface WeiboData {
  // 基础信息
  id: string                  // 唯一标识（格式：WB_timestamp_random）
  content: string             // 微博内容
  publishTime: string         // 发布时间（ISO格式）

  // 用户信息
  userId: string              // 用户ID
  userName: string            // 用户昵称
  isVerified: boolean         // 是否认证用户
  userFollowers: number       // 粉丝数

  // 互动数据
  likeCount: number           // 点赞数
  commentCount: number        // 评论数
  repostCount: number         // 转发数

  // 其他信息
  location: string            // 发布地点
  topicTags: string           // 话题标签（逗号分隔）

  // AI分析结果（可选）
  sentiment?: SentimentType   // 情感标签
  sentimentScore?: number     // 情感分数
  aiKeywords?: string[]       // AI关键词
  aiSummary?: string          // AI摘要
  aiCategory?: string         // AI分类
  isWarning?: boolean         // 是否预警
  warningLevel?: WarningLevel // 预警级别
}
```

### 预警规则 (WarningRule)
```typescript
interface WarningRule {
  id: string                  // 规则ID
  name: string                // 规则名称
  type: 'keyword' | 'sentiment' | 'volume' | 'speed'
  level: 'high' | 'medium' | 'low'  // 预警级别
  enabled: boolean            // 是否启用
  config: {
    keywords?: string[]       // 关键词列表
    sentimentThreshold?: number  // 情感阈值
    volumeThreshold?: number     // 数量阈值
    speedThreshold?: number      // 速度阈值
  }
  createdAt: string           // 创建时间
  updatedAt: string           // 更新时间
}
```

### 预警记录 (WarningRecord)
```typescript
interface WarningRecord {
  id: string                  // 记录ID
  ruleId: string              // 触发的规则ID
  ruleName: string            // 规则名称
  level: WarningLevel         // 预警级别
  dataId: string              // 相关数据ID
  dataType: 'webmedia' | 'weibo'
  reason: string              // 预警原因
  aiSuggestion?: string       // AI建议
  status: 'unhandled' | 'processing' | 'resolved' | 'ignored'
  createdAt: string           // 触发时间
  updatedAt: string           // 更新时间
}
```

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

## 核心特性

### ✨ 已实现功能
1. **完整的数据导入流程**：
   - Excel文件解析和自动类型识别
   - 数据源管理和切换
   - 批量数据操作
   - 实时筛选和搜索

2. **强大的数据可视化**：
   - 1920x1080全屏大屏展示
   - 三列布局设计（网媒/综合/微博）
   - 12+种图表类型（折线图、饼图、柱状图、词云、散点图等）
   - 自动刷新机制

3. **智能预警系统**：
   - 4种预警规则类型
   - 完整的预警生命周期管理
   - 可视化统计分析
   - 导航栏实时提醒

4. **离线优先架构**：
   - IndexedDB本地存储
   - 无需服务器即可运行
   - 支持大数据量存储

### 🚀 技术亮点
- **TypeScript严格模式**：全项目类型安全
- **响应式设计**：支持多种屏幕分辨率
- **性能优化**：
  - ECharts图表实例管理，防止内存泄漏
  - Vue响应式对象正确处理，避免IndexedDB克隆错误
  - 图表按需渲染，提升性能
- **代码质量**：
  - 单页面组件超过900行的完整实现
  - 统一的错误处理和用户提示
  - 完善的表单验证

### 📊 数据流程
```
Excel文件 → 文件解析 → 数据转换 → IndexedDB存储
    ↓
数据源管理 ← Pinia Store ← IndexedDB查询
    ↓
数据展示（列表/图表）
    ↓
数据筛选 → 统计计算 → 可视化渲染
```

### 🔧 已解决的技术难点
1. **IndexedDB DataCloneError**：
   - 问题：Vue响应式对象无法被IndexedDB克隆
   - 解决：使用`JSON.parse(JSON.stringify())`转换为普通对象

2. **ECharts图表不显示**：
   - 问题：Tab切换时图表DOM不可见
   - 解决：添加watch监听+图表实例管理

3. **大屏布局溢出**：
   - 问题：1080p分辨率下组件被遮挡
   - 解决：精确计算高度分配（232px header）

4. **数据统计与筛选联动**：
   - 问题：统计数据需要响应筛选条件
   - 解决：使用computed计算属性+watch监听

### 📝 项目统计
- **总代码行数**：约10,000+行
- **核心页面**：3个（数据导入、实时大屏、预警管理）
- **数据表**：4个（webmedia、weibo、warningRules、warningRecords）
- **图表数量**：20+个可视化图表
- **组件数量**：15+个Vue组件

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 未来规划

### 🔮 待实现功能
1. **AI智能分析**：
   - 接入AI API进行情感分析
   - 自动关键词提取
   - 内容摘要生成
   - 话题聚类分析

2. **增强预警功能**：
   - 实时监控和自动触发
   - 邮件/短信通知
   - 预警规则智能推荐

3. **报表导出**：
   - PDF报告生成
   - Excel数据导出
   - 图表截图保存

4. **协作功能**：
   - 多用户管理
   - 权限控制
   - 评论和批注

## License

MIT

## 作者

Generated with Claude Code

---

**最后更新时间**: 2025-11-29
**当前版本**: v1.0.0
**项目状态**: ✅ 核心功能已完成

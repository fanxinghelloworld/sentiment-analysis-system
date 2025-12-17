/**
 * 应用入口文件
 *
 * 初始化 Vue 应用，配置全局插件和组件
 */

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import pinia from './stores'
import App from './App.vue'
import './style.scss'

// ============ dayjs 配置 ============

/**
 * 配置 dayjs 中文语言包和插件
 *
 * - relativeTime: 支持相对时间（如：3小时前）
 * - zh-cn: 中文语言包
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// ============ 创建应用实例 ============

const app = createApp(App)

// ============ 注册全局组件 ============

/**
 * 注册所有 Element Plus 图标为全局组件
 *
 * 可以在模板中直接使用，如：<el-icon-search />
 */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// ============ 安装插件 ============

/**
 * 安装 Element Plus UI 库
 * 配置中文语言包
 */
app.use(ElementPlus, {
  locale: zhCn,
})

/** 安装 Vue Router 路由 */
app.use(router)

/** 安装 Pinia 状态管理 */
app.use(pinia)

// ============ 挂载应用 ============

app.mount('#app')

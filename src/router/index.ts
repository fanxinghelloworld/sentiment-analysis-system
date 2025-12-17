/**
 * 路由配置模块
 *
 * 定义应用的路由规则和导航守卫
 * 使用 Hash 模式以兼容静态部署
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由配置数组
 *
 * 定义所有页面路由及其元信息
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/data-import'
  },
  // 实时分析大屏（已注释，可能暂未启用）
  // {
  //   path: '/dashboard',
  //   name: 'Dashboard',
  //   component: () => import('@/views/dashboard/index.vue'),
  //   meta: {
  //     title: '实时分析大屏'
  //   }
  // },
  {
    path: '/dashboard/fullscreen',
    name: 'DashboardFullscreen',
    component: () => import('@/views/dashboard/fullscreen.vue'),
    meta: {
      title: '实时分析大屏',
      hideLayout: true // 隐藏布局，全屏显示
    }
  },
  {
    path: '/data-import',
    name: 'DataImport',
    component: () => import('@/views/data-import/index.vue'),
    meta: {
      title: '数据导入'
    }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('@/views/analysis/index.vue'),
    meta: {
      title: '智能分析'
    }
  },
  {
    path: '/warning',
    name: 'Warning',
    component: () => import('@/views/warning/index.vue'),
    meta: {
      title: '预警管理'
    }
  }
]

/**
 * 创建路由实例
 *
 * 使用 Hash 模式（URL 带 #）
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ============ 路由守卫 ============

/**
 * 全局前置守卫
 *
 * 在路由跳转前设置页面标题
 */
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 互联网内容分析系统`
  }
  next()
})

export default router

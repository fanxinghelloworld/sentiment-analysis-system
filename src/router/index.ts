import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/data-import'
  },
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
      hideLayout: true
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

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 互联网内容分析系统`
  }
  next()
})

export default router

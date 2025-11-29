<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <div class="header-left">
        <div class="logo">
          <h2>互联网内容分析系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="nav-menu"
        >
          <el-menu-item index="/dashboard/fullscreen">
            <div @click.stop="handleDashboardClick($event)" class="menu-item-inner">
              <el-icon><DataAnalysis /></el-icon>
              <span>实时大屏</span>
            </div>
          </el-menu-item>
          <el-menu-item index="/data-import">
            <el-icon><Upload /></el-icon>
            <span>数据导入</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <el-icon><MagicStick /></el-icon>
            <span>智能分析</span>
          </el-menu-item>
          <el-menu-item index="/warning">
            <el-icon><Warning /></el-icon>
            <span>预警管理</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <el-badge v-if="unhandledCount > 0" :value="unhandledCount" type="danger">
          <el-button type="danger" size="small" @click="handleWarningClick">
            未处理预警
          </el-button>
        </el-badge>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWarningStore } from '@/stores/warningStore'
import { DataAnalysis, Upload, MagicStick, Warning } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const warningStore = useWarningStore()

const activeMenu = computed(() => route.path)
const unhandledCount = computed(() => warningStore.unhandledCount)

const handleWarningClick = () => {
  router.push('/warning')
}

const handleDashboardClick = (e?: Event | string) => {
  // 这个 handler 可能会被两种调用方式触发：
  // - 我们现在从内层元素传入原生事件 ($event) => e 是 Event
  // - 也可能被外部意外触发并传入 index 字符串 => 处理为路径

  // 如果是原生事件，阻止默认行为并停止冒泡已经通过模板修饰符处理了。
  // 兼容两种情况：如果传入字符串就把它当作路径；否则使用固定路径。
  const path = typeof e === 'string' ? e : '/dashboard/fullscreen'

  const url = router.resolve({ path })
  // 使用完整的 href（相对路径也可），在新窗口打开
  window.open(url.href, '_blank')
}
</script>

<style lang="scss" scoped>
.app-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  width: 100%;

  .header-left {
    display: flex;
    align-items: center;
    gap: 30px;
    flex: 1;
  }

  .logo {
    h2 {
      margin: 0;
      font-size: 20px;
      color: #409eff;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  .nav-menu {
    border: none;
    background: transparent;
    flex: 1;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
  }
}

.app-main {
  flex: 1;
  background-color: #f0f2f5;
  padding: 20px;
  width: 100%;
  overflow-y: auto;
}
</style>

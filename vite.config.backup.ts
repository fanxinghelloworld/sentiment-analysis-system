import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// ======================================
// 备用配置：完全移除代码分割（最简单）
// 如果方案 1 还有问题，使用这个配置
// ======================================

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    // 移除所有手动代码分割，让 Vite 自动处理
    // rollupOptions: {
    //   output: {
    //     manualChunks: undefined  // 禁用手动分割
    //   }
    // }
  }
})

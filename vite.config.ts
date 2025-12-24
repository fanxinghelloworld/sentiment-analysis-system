import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
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
    rollupOptions: {
      output: {
        // 使用更安全的代码分割策略
        manualChunks(id) {
          // node_modules 中的依赖根据包名自动分割
          if (id.includes('node_modules')) {
            // ECharts 单独分割（体积大）
            if (id.includes('echarts')) {
              return 'echarts'
            }
            // Element Plus 和 Vue 放在一起，避免循环依赖
            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'element-plus'
            }
            // Vue 生态系统放在一起
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            // 其他第三方库
            return 'vendor'
          }
        }
      }
    }
  }
})

<template>
  <div class="analysis-container">
    <el-card>
      <h2>智能分析</h2>
      <p>AI情感分析、关键词提取、内容摘要生成</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Analysis mounted')
})
</script>

<style lang="scss" scoped>
.analysis-container {
  width: 100%;
  height: 100%;
}
</style>

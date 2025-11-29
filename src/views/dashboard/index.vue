<template>
  <div class="dashboard-container">
    <el-card>
      <h2>实时分析大屏</h2>
      <p>这里将展示实时数据流和可视化图表</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Dashboard mounted')
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
}
</style>

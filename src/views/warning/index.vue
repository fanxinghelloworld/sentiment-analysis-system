<template>
  <div class="warning-container">
    <el-card>
      <h2>预警管理</h2>
      <p>预警规则配置、预警记录管理</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Warning mounted')
})
</script>

<style lang="scss" scoped>
.warning-container {
  width: 100%;
  height: 100%;
}
</style>

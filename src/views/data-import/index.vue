<template>
  <div class="data-import-container">
    <el-card>
      <h2>数据导入</h2>
      <p>支持导入网媒数据和微博数据Excel文件</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('DataImport mounted')
})
</script>

<style lang="scss" scoped>
.data-import-container {
  width: 100%;
  height: 100%;
}
</style>

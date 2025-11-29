<template>
  <router-view v-if="hideLayout" />
  <AppLayout v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/common/AppLayout.vue'

const route = useRoute()
const hideLayout = computed(() => route.meta.hideLayout === true)
</script>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WarningRule, WarningRecord } from '@/types'
import { dbHelper } from '@/db'

export const useWarningStore = defineStore('warning', () => {
  // 状态
  const rules = ref<WarningRule[]>([])
  const records = ref<WarningRecord[]>([])
  const loading = ref(false)

  // 计算属性
  const activeRules = computed(() => rules.value.filter(rule => rule.enabled))

  const unhandledRecords = computed(() =>
    records.value.filter(record => record.status === 'unhandled')
  )

  const unhandledCount = computed(() => unhandledRecords.value.length)

  const recordsByLevel = computed(() => {
    return {
      high: records.value.filter(r => r.level === 'high'),
      medium: records.value.filter(r => r.level === 'medium'),
      low: records.value.filter(r => r.level === 'low')
    }
  })

  // 方法
  async function loadRules() {
    loading.value = true
    try {
      rules.value = await dbHelper.getWarningRules()
    } catch (error) {
      console.error('加载预警规则失败：', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loadRecords() {
    loading.value = true
    try {
      records.value = await dbHelper.getWarningRecords()
    } catch (error) {
      console.error('加载预警记录失败：', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loadAll() {
    await Promise.all([loadRules(), loadRecords()])
  }

  async function addRule(rule: WarningRule) {
    try {
      await dbHelper.addWarningRule(rule)
      await loadRules()
    } catch (error) {
      console.error('添加预警规则失败：', error)
      throw error
    }
  }

  async function updateRule(id: string, updates: Partial<WarningRule>) {
    try {
      await dbHelper.updateWarningRule(id, updates)
      await loadRules()
    } catch (error) {
      console.error('更新预警规则失败：', error)
      throw error
    }
  }

  async function deleteRule(id: string) {
    try {
      await dbHelper.deleteWarningRule(id)
      await loadRules()
    } catch (error) {
      console.error('删除预警规则失败：', error)
      throw error
    }
  }

  async function toggleRule(id: string) {
    const rule = rules.value.find(r => r.id === id)
    if (rule) {
      await updateRule(id, { enabled: !rule.enabled })
    }
  }

  async function addRecord(record: WarningRecord) {
    try {
      await dbHelper.addWarningRecord(record)
      await loadRecords()
    } catch (error) {
      console.error('添加预警记录失败：', error)
      throw error
    }
  }

  async function updateRecord(id: string, updates: Partial<WarningRecord>) {
    try {
      await dbHelper.updateWarningRecord(id, updates)
      await loadRecords()
    } catch (error) {
      console.error('更新预警记录失败：', error)
      throw error
    }
  }

  async function handleRecord(id: string, status: WarningRecord['status']) {
    await updateRecord(id, {
      status,
      updatedAt: new Date().toISOString()
    })
  }

  return {
    // 状态
    rules,
    records,
    loading,
    // 计算属性
    activeRules,
    unhandledRecords,
    unhandledCount,
    recordsByLevel,
    // 方法
    loadRules,
    loadRecords,
    loadAll,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    addRecord,
    updateRecord,
    handleRecord
  }
})

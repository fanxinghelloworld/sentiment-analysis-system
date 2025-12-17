/**
 * 预警管理 Store
 *
 * 管理预警规则和预警记录的全局状态
 * 提供规则的 CRUD 操作和记录处理功能
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WarningRule, WarningRecord } from '@/types'
import { dbHelper } from '@/db'

export const useWarningStore = defineStore('warning', () => {
  // ============ 状态定义 ============

  /** 预警规则列表 */
  const rules = ref<WarningRule[]>([])

  /** 预警记录列表 */
  const records = ref<WarningRecord[]>([])

  /** 加载状态 */
  const loading = ref(false)

  // ============ 计算属性 ============

  /** 已启用的预警规则 */
  const activeRules = computed(() => rules.value.filter(rule => rule.enabled))

  /** 未处理的预警记录 */
  const unhandledRecords = computed(() =>
    records.value.filter(record => record.status === 'unhandled')
  )

  /** 未处理记录数量 */
  const unhandledCount = computed(() => unhandledRecords.value.length)

  /** 按级别分组的预警记录 */
  const recordsByLevel = computed(() => {
    return {
      high: records.value.filter(r => r.level === 'high'),
      medium: records.value.filter(r => r.level === 'medium'),
      low: records.value.filter(r => r.level === 'low')
    }
  })

  // ============ 方法 ============

  /**
   * 加载预警规则
   *
   * 从数据库加载所有预警规则到 store
   */
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

  /**
   * 加载预警记录
   *
   * 从数据库加载所有预警记录到 store
   */
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

  /**
   * 加载所有数据
   *
   * 并行加载预警规则和预警记录
   */
  async function loadAll() {
    await Promise.all([loadRules(), loadRecords()])
  }

  /**
   * 添加预警规则
   *
   * @param rule - 预警规则对象
   */
  async function addRule(rule: WarningRule) {
    try {
      // 确保传递的是普通对象，而非 Vue 响应式对象
      const plainRule = JSON.parse(JSON.stringify(rule))
      await dbHelper.addWarningRule(plainRule)
      await loadRules()
    } catch (error) {
      console.error('添加预警规则失败：', error)
      throw error
    }
  }

  /**
   * 更新预警规则
   *
   * @param id - 预警规则ID
   * @param updates - 要更新的字段
   */
  async function updateRule(id: string, updates: Partial<WarningRule>) {
    try {
      // 确保传递的是普通对象，而非 Vue 响应式对象
      const plainUpdates = JSON.parse(JSON.stringify(updates))
      await dbHelper.updateWarningRule(id, plainUpdates)
      await loadRules()
    } catch (error) {
      console.error('更新预警规则失败：', error)
      throw error
    }
  }

  /**
   * 删除预警规则
   *
   * @param id - 预警规则ID
   */
  async function deleteRule(id: string) {
    try {
      await dbHelper.deleteWarningRule(id)
      await loadRules()
    } catch (error) {
      console.error('删除预警规则失败：', error)
      throw error
    }
  }

  /**
   * 切换预警规则启用状态
   *
   * @param id - 预警规则ID
   */
  async function toggleRule(id: string) {
    const rule = rules.value.find(r => r.id === id)
    if (rule) {
      await updateRule(id, { enabled: !rule.enabled })
    }
  }

  /**
   * 添加预警记录
   *
   * @param record - 预警记录对象
   */
  async function addRecord(record: WarningRecord) {
    try {
      // 确保传递的是普通对象，而非 Vue 响应式对象
      const plainRecord = JSON.parse(JSON.stringify(record))
      await dbHelper.addWarningRecord(plainRecord)
      await loadRecords()
    } catch (error) {
      console.error('添加预警记录失败：', error)
      throw error
    }
  }

  /**
   * 更新预警记录
   *
   * @param id - 预警记录ID
   * @param updates - 要更新的字段
   */
  async function updateRecord(id: string, updates: Partial<WarningRecord>) {
    try {
      // 确保传递的是普通对象，而非 Vue 响应式对象
      const plainUpdates = JSON.parse(JSON.stringify(updates))
      await dbHelper.updateWarningRecord(id, plainUpdates)
      await loadRecords()
    } catch (error) {
      console.error('更新预警记录失败：', error)
      throw error
    }
  }

  /**
   * 处理预警记录
   *
   * 更新预警记录的处理状态
   *
   * @param id - 预警记录ID
   * @param status - 新的状态
   */
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

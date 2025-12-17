/**
 * 数据管理 Store
 *
 * 管理网媒数据和微博数据的全局状态
 * 提供数据的 CRUD 操作和统计功能
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WebMediaData, WeiboData, DataStatistics } from '@/types'
import { dbHelper } from '@/db'
import dayjs from 'dayjs'

export const useDataStore = defineStore('data', () => {
  // ============ 状态定义 ============

  /** 网媒数据列表 */
  const webmediaList = ref<WebMediaData[]>([])

  /** 微博数据列表 */
  const weiboList = ref<WeiboData[]>([])

  /** 加载状态 */
  const loading = ref(false)

  /** 当前数据源过滤器 */
  const currentDataSource = ref<'all' | 'webmedia' | 'weibo'>('all')

  // ============ 计算属性 ============

  /**
   * 所有数据
   *
   * 根据当前数据源过滤器返回对应的数据
   */
  const allData = computed(() => {
    if (currentDataSource.value === 'webmedia') return webmediaList.value
    if (currentDataSource.value === 'weibo') return weiboList.value
    return [...webmediaList.value, ...weiboList.value]
  })

  /**
   * 数据统计
   *
   * 计算各种统计指标，包括：
   * - 总数、网媒数、微博数
   * - 情感分布（正面/中性/负面）
   * - 今日、昨日、本周数据量
   */
  const statistics = computed<DataStatistics>(() => {
    const now = dayjs()
    const todayStart = now.startOf('day')
    const yesterdayStart = now.subtract(1, 'day').startOf('day')
    const weekStart = now.subtract(7, 'day').startOf('day')

    let todayCount = 0
    let yesterdayCount = 0
    let weekCount = 0

    const sentimentDistribution = {
      positive: 0,
      neutral: 0,
      negative: 0
    }

    const allDataArray = [...webmediaList.value, ...weiboList.value]

    allDataArray.forEach(item => {
      const publishTime = dayjs(item.publishTime)

      if (publishTime.isAfter(todayStart)) {
        todayCount++
      }
      if (publishTime.isAfter(yesterdayStart) && publishTime.isBefore(todayStart)) {
        yesterdayCount++
      }
      if (publishTime.isAfter(weekStart)) {
        weekCount++
      }

      if (item.sentiment === 'positive') sentimentDistribution.positive++
      else if (item.sentiment === 'neutral') sentimentDistribution.neutral++
      else if (item.sentiment === 'negative') sentimentDistribution.negative++
    })

    return {
      total: allDataArray.length,
      webmediaCount: webmediaList.value.length,
      weiboCount: weiboList.value.length,
      sentimentDistribution,
      todayCount,
      yesterdayCount,
      weekCount
    }
  })

  // ============ 方法 ============

  /**
   * 加载网媒数据
   *
   * 从数据库加载所有网媒数据到 store
   */
  async function loadWebMediaData() {
    loading.value = true
    try {
      webmediaList.value = await dbHelper.getWebMediaData()
    } catch (error) {
      console.error('加载网媒数据失败：', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载微博数据
   *
   * 从数据库加载所有微博数据到 store
   */
  async function loadWeiboData() {
    loading.value = true
    try {
      weiboList.value = await dbHelper.getWeiboData()
    } catch (error) {
      console.error('加载微博数据失败：', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载所有数据
   *
   * 并行加载网媒数据和微博数据
   */
  async function loadAllData() {
    await Promise.all([loadWebMediaData(), loadWeiboData()])
  }

  /**
   * 添加网媒数据
   *
   * @param data - 网媒数据数组
   */
  async function addWebMediaData(data: WebMediaData[]) {
    try {
      await dbHelper.addWebMediaData(data)
      await loadWebMediaData()
    } catch (error) {
      console.error('添加网媒数据失败：', error)
      throw error
    }
  }

  /**
   * 添加微博数据
   *
   * @param data - 微博数据数组
   */
  async function addWeiboData(data: WeiboData[]) {
    try {
      await dbHelper.addWeiboData(data)
      await loadWeiboData()
    } catch (error) {
      console.error('添加微博数据失败：', error)
      throw error
    }
  }

  /**
   * 更新网媒数据
   *
   * @param id - 网媒数据ID
   * @param updates - 要更新的字段
   */
  async function updateWebMediaData(id: string, updates: Partial<WebMediaData>) {
    try {
      await dbHelper.updateWebMediaData(id, updates)
      await loadWebMediaData()
    } catch (error) {
      console.error('更新网媒数据失败：', error)
      throw error
    }
  }

  /**
   * 更新微博数据
   *
   * @param id - 微博数据ID
   * @param updates - 要更新的字段
   */
  async function updateWeiboData(id: string, updates: Partial<WeiboData>) {
    try {
      await dbHelper.updateWeiboData(id, updates)
      await loadWeiboData()
    } catch (error) {
      console.error('更新微博数据失败：', error)
      throw error
    }
  }

  /**
   * 删除网媒数据
   *
   * @param id - 网媒数据ID
   */
  async function deleteWebMediaData(id: string) {
    try {
      await dbHelper.deleteWebMediaData(id)
      await loadWebMediaData()
    } catch (error) {
      console.error('删除网媒数据失败：', error)
      throw error
    }
  }

  /**
   * 批量删除网媒数据
   *
   * @param ids - 网媒数据ID数组
   */
  async function bulkDeleteWebMediaData(ids: string[]) {
    try {
      await dbHelper.bulkDeleteWebMediaData(ids)
      await loadWebMediaData()
    } catch (error) {
      console.error('批量删除网媒数据失败：', error)
      throw error
    }
  }

  /**
   * 删除微博数据
   *
   * @param id - 微博数据ID
   */
  async function deleteWeiboData(id: string) {
    try {
      await dbHelper.deleteWeiboData(id)
      await loadWeiboData()
    } catch (error) {
      console.error('删除微博数据失败：', error)
      throw error
    }
  }

  /**
   * 批量删除微博数据
   *
   * @param ids - 微博数据ID数组
   */
  async function bulkDeleteWeiboData(ids: string[]) {
    try {
      await dbHelper.bulkDeleteWeiboData(ids)
      await loadWeiboData()
    } catch (error) {
      console.error('批量删除微博数据失败：', error)
      throw error
    }
  }

  /**
   * 清空所有数据
   *
   * 清空网媒数据和微博数据
   */
  async function clearAllData() {
    try {
      await dbHelper.clearWebMediaData()
      await dbHelper.clearWeiboData()
      webmediaList.value = []
      weiboList.value = []
    } catch (error) {
      console.error('清空数据失败：', error)
      throw error
    }
  }

  /**
   * 设置数据源过滤器
   *
   * @param source - 数据源类型 'all' | 'webmedia' | 'weibo'
   */
  function setDataSource(source: 'all' | 'webmedia' | 'weibo') {
    currentDataSource.value = source
  }

  return {
    // 状态
    webmediaList,
    weiboList,
    loading,
    currentDataSource,
    // 计算属性
    allData,
    statistics,
    // 数据别名（为了向后兼容）
    webmediaData: webmediaList,
    weiboData: weiboList,
    // 方法
    loadWebMediaData,
    loadWeiboData,
    loadAllData,
    addWebMediaData,
    addWeiboData,
    updateWebMediaData,
    updateWeiboData,
    deleteWebMediaData,
    deleteWeiboData,
    bulkDeleteWebMediaData,
    bulkDeleteWeiboData,
    clearAllData,
    setDataSource
  }
})

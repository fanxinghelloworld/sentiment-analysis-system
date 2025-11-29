import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WebMediaData, WeiboData, DataStatistics } from '@/types'
import { dbHelper } from '@/db'
import dayjs from 'dayjs'

export const useDataStore = defineStore('data', () => {
  // 状态
  const webmediaList = ref<WebMediaData[]>([])
  const weiboList = ref<WeiboData[]>([])
  const loading = ref(false)
  const currentDataSource = ref<'all' | 'webmedia' | 'weibo'>('all')

  // 计算属性
  const allData = computed(() => {
    if (currentDataSource.value === 'webmedia') return webmediaList.value
    if (currentDataSource.value === 'weibo') return weiboList.value
    return [...webmediaList.value, ...weiboList.value]
  })

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

  // 方法
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

  async function loadAllData() {
    await Promise.all([loadWebMediaData(), loadWeiboData()])
  }

  async function addWebMediaData(data: WebMediaData[]) {
    try {
      await dbHelper.addWebMediaData(data)
      await loadWebMediaData()
    } catch (error) {
      console.error('添加网媒数据失败：', error)
      throw error
    }
  }

  async function addWeiboData(data: WeiboData[]) {
    try {
      await dbHelper.addWeiboData(data)
      await loadWeiboData()
    } catch (error) {
      console.error('添加微博数据失败：', error)
      throw error
    }
  }

  async function updateWebMediaData(id: string, updates: Partial<WebMediaData>) {
    try {
      await dbHelper.updateWebMediaData(id, updates)
      await loadWebMediaData()
    } catch (error) {
      console.error('更新网媒数据失败：', error)
      throw error
    }
  }

  async function updateWeiboData(id: string, updates: Partial<WeiboData>) {
    try {
      await dbHelper.updateWeiboData(id, updates)
      await loadWeiboData()
    } catch (error) {
      console.error('更新微博数据失败：', error)
      throw error
    }
  }

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
    // 方法
    loadWebMediaData,
    loadWeiboData,
    loadAllData,
    addWebMediaData,
    addWeiboData,
    updateWebMediaData,
    updateWeiboData,
    clearAllData,
    setDataSource
  }
})

<template>
  <div class="fullscreen-wrapper" ref="wrapperRef">
    <div class="dashboard-container" :style="scaleStyle">
      <!-- 顶部标题 -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">互联网内容实时分析大屏</h1>
        <div class="dashboard-time">{{ currentTime }}</div>
      </div>

      <!-- 顶部统计卡片 -->
      <div class="stats-row">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">舆情总量</div>
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-trend">
                <span class="trend-up">+{{ stats.todayCount }} 今日新增</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon webmedia">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">网媒数据</div>
              <div class="stat-value">{{ stats.webmediaCount }}</div>
              <div class="stat-trend">
                <span>占比 {{ webmediaPercent }}%</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon weibo">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">微博数据</div>
              <div class="stat-value">{{ stats.weiboCount }}</div>
              <div class="stat-trend">
                <span>占比 {{ weiboPercent }}%</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon sentiment">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">情感分布</div>
              <div class="stat-distribution">
                <span class="sentiment-item positive">正面 {{ stats.sentimentDistribution.positive }}</span>
                <span class="sentiment-item neutral">中性 {{ stats.sentimentDistribution.neutral }}</span>
                <span class="sentiment-item negative">负面 {{ stats.sentimentDistribution.negative }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 主要内容区域 - 三列布局 -->
      <div class="main-content">
        <!-- 左侧：网媒数据专区 -->
        <div class="left-section webmedia-section">
          <div class="section-header">
            <el-icon><Document /></el-icon>
            <span>网媒数据专区</span>
          </div>

          <!-- 网媒趋势图 -->
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">网媒趋势分析</span>
                <el-radio-group v-model="webmediaPeriod" size="small" @change="updateWebmediaTrend">
                  <el-radio-button label="24h">24h</el-radio-button>
                  <el-radio-button label="7d">7d</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="webmediaTrendRef" class="chart-container-medium"></div>
          </el-card>

          <!-- 网媒情感分布 -->
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">网媒情感分布</span>
              </div>
            </template>
            <div ref="webmediaSentimentRef" class="chart-container-small"></div>
          </el-card>

          <!-- 热门报道 -->
          <el-card class="list-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon><Reading /></el-icon>
                  热门报道
                </span>
              </div>
            </template>
            <vue3-seamless-scroll
              v-if="hotWebmedia.length > 0"
              :list="hotWebmedia"
              :class-option="scrollOption"
              class="scroll-container"
            >
              <div class="hot-list">
                <div
                  v-for="(item, index) in hotWebmedia"
                  :key="index"
                  class="hot-item"
                >
                  <div class="hot-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
                  <div class="hot-info">
                    <div class="hot-title">{{ item.title }}</div>
                    <div class="hot-meta">
                      <span>{{ item.source }}</span>
                      <span>{{ item.viewCount }} 阅读</span>
                    </div>
                  </div>
                </div>
              </div>
            </vue3-seamless-scroll>
          </el-card>
        </div>

        <!-- 中间：综合对比分析区 -->
        <div class="center-section analysis-section">
          <div class="section-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>综合对比分析</span>
          </div>

          <!-- 热词词云 -->
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon><Management /></el-icon>
                  热词词云
                </span>
              </div>
            </template>
            <div ref="wordCloudRef" class="chart-container-large"></div>
          </el-card>

          <!-- 数据源对比 -->
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon><PieChart /></el-icon>
                  数据源对比
                </span>
              </div>
            </template>
            <div ref="dataCompareRef" class="chart-container-medium"></div>
          </el-card>

          <!-- 关联分析 -->
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon><Connection /></el-icon>
                  情感关联分析
                </span>
              </div>
            </template>
            <div ref="correlationRef" class="chart-container-medium"></div>
          </el-card>
        </div>

        <!-- 右侧：微博数据专区 -->
        <div class="right-section weibo-section">
          <div class="section-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>微博数据专区</span>
          </div>

          <!-- 微博趋势图 -->
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">微博趋势分析</span>
                <el-radio-group v-model="weiboPeriod" size="small" @change="updateWeiboTrend">
                  <el-radio-button label="24h">24h</el-radio-button>
                  <el-radio-button label="7d">7d</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="weiboTrendRef" class="chart-container-medium"></div>
          </el-card>

          <!-- 微博情感分布 -->
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">微博情感分布</span>
              </div>
            </template>
            <div ref="weiboSentimentRef" class="chart-container-small"></div>
          </el-card>

          <!-- 热门话题 -->
          <el-card class="list-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon><Lightning /></el-icon>
                  热门话题
                </span>
              </div>
            </template>
            <vue3-seamless-scroll
              v-if="hotTopics.length > 0"
              :list="hotTopics"
              :class-option="scrollOption"
              class="scroll-container"
            >
              <div class="hot-list">
                <div
                  v-for="(topic, index) in hotTopics"
                  :key="index"
                  class="hot-item"
                >
                  <div class="hot-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
                  <div class="hot-info">
                    <div class="hot-title">{{ topic.keyword }}</div>
                    <div class="hot-meta">
                      <span>{{ topic.count }} 条相关</span>
                      <el-icon v-if="topic.trend === 'up'" color="#f56c6c" style="margin-left: 8px;">
                        <CaretTop />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </vue3-seamless-scroll>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  DataLine,
  Document,
  ChatDotRound,
  TrendCharts,
  Connection,
  Lightning,
  PieChart,
  Management,
  DataAnalysis,
  CaretTop,
  Reading
} from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/dataStore'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import 'echarts-wordcloud'
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'

const dataStore = useDataStore()

// 自适应缩放相关
const wrapperRef = ref<HTMLElement>()
const scaleStyle = ref({})
const BASE_WIDTH = 1920
const BASE_HEIGHT = 1080

// 计算缩放比例
const updateScale = () => {
  if (!wrapperRef.value) return

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  const scaleX = windowWidth / BASE_WIDTH
  const scaleY = windowHeight / BASE_HEIGHT
  const scale = Math.min(scaleX, scaleY)

  const offsetX = (windowWidth - BASE_WIDTH * scale) / 2
  const offsetY = (windowHeight - BASE_HEIGHT * scale) / 2

  scaleStyle.value = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    left: `${offsetX}px`,
    top: `${offsetY}px`
  }

  nextTick(() => {
    renderAllCharts()
  })
}

// 时间显示
const currentTime = ref('')
let timeInterval: number | null = null

// 统计数据
const stats = computed(() => dataStore.statistics)

// 百分比计算
const webmediaPercent = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.webmediaCount / stats.value.total) * 100)
})

const weiboPercent = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.weiboCount / stats.value.total) * 100)
})

// 图表周期
const webmediaPeriod = ref('24h')
const weiboPeriod = ref('24h')

// 热门内容
const hotWebmedia = ref<Array<{ title: string; source: string; viewCount: number }>>([])
const hotTopics = ref<Array<{ keyword: string; count: number; trend: 'up' | 'down' | 'stable' }>>([])

// 滚动配置
const scrollOption = computed(() => ({
  step: 0.5,
  limitMoveNum: 2,
  hoverStop: true,
  direction: 1,
  openWatch: true,
  singleHeight: 0,
  waitTime: 1000
}))
const hotTopicsScroll = ref(true)
const hotWebmediaScroll = ref(true)

// 图表refs
const webmediaTrendRef = ref()
const webmediaSentimentRef = ref()
const weiboTrendRef = ref()
const weiboSentimentRef = ref()
const wordCloudRef = ref()
const dataCompareRef = ref()
const correlationRef = ref()

// 图表实例
let webmediaTrendChart: echarts.ECharts | null = null
let webmediaSentimentChart: echarts.ECharts | null = null
let weiboTrendChart: echarts.ECharts | null = null
let weiboSentimentChart: echarts.ECharts | null = null
let wordCloudChart: echarts.ECharts | null = null
let dataCompareChart: echarts.ECharts | null = null
let correlationChart: echarts.ECharts | null = null

// 更新当前时间
const updateTime = () => {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// 提取热门网媒
const extractHotWebmedia = () => {
  const webmediaData = dataStore.webmediaData
  console.log('网媒数据数量:', webmediaData.length)

  if (webmediaData.length === 0) {
    hotWebmedia.value = []
    return
  }

  const sorted = [...webmediaData]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 8)

  hotWebmedia.value = sorted.map(item => ({
    title: item.title,
    source: item.source,
    viewCount: item.viewCount || 0
  }))

  console.log('热门网媒:', hotWebmedia.value.length)
}

// 提取热门话题
const extractHotTopics = () => {
  const weiboData = dataStore.weiboData
  console.log('微博数据数量:', weiboData.length)

  if (weiboData.length === 0) {
    hotTopics.value = []
    return
  }

  const keywordMap = new Map<string, number>()

  weiboData.forEach(item => {
    if (Array.isArray(item.topicTags) && item.topicTags.length > 0) {
      item.topicTags.forEach((tag: string) => {
        keywordMap.set(tag, (keywordMap.get(tag) || 0) + 1)
      })
    }
  })

  if (keywordMap.size === 0) {
    weiboData.forEach(item => {
      const words = item.content.match(/[\u4e00-\u9fa5]{2,}/g) || []
      words.forEach(word => {
        keywordMap.set(word, (keywordMap.get(word) || 0) + 1)
      })
    })
  }

  const trends = ['up', 'down', 'stable'] as const
  const sortedTopics = Array.from(keywordMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([keyword, count]) => {
      const t = trends[Math.floor(Math.random() * trends.length)] as typeof trends[number]
      return { keyword, count, trend: t }
    })

  hotTopics.value = sortedTopics
  console.log('热门话题:', hotTopics.value.length)
}

// 渲染网媒趋势图
const renderWebmediaTrend = () => {
  if (!webmediaTrendRef.value) {
    console.warn('网媒趋势图容器未找到')
    return
  }

  const webmediaData = dataStore.webmediaData
  console.log('渲染网媒趋势图 - 数据量:', webmediaData.length)

  const now = dayjs()
  // 怀留注: 计算周期，暂不使用具体变量

  const timePoints: string[] = []
  const positiveData: number[] = []
  const neutralData: number[] = []
  const negativeData: number[] = []

  if (webmediaPeriod.value === '24h') {
    for (let i = 23; i >= 0; i--) {
      const time = now.subtract(i, 'hour')
      timePoints.push(time.format('HH:mm'))

      const hourData = webmediaData.filter(item => {
        const itemTime = dayjs(item.publishTime)
        return itemTime.isSame(time, 'hour')
      })

      positiveData.push(hourData.filter(item => item.sentiment === 'positive').length)
      neutralData.push(hourData.filter(item => item.sentiment === 'neutral').length)
      negativeData.push(hourData.filter(item => item.sentiment === 'negative').length)
    }
  } else {
    for (let i = 6; i >= 0; i--) {
      const time = now.subtract(i, 'day')
      timePoints.push(time.format('MM-DD'))

      const dayData = webmediaData.filter(item => {
        const itemTime = dayjs(item.publishTime)
        return itemTime.isSame(time, 'day')
      })

      positiveData.push(dayData.filter(item => item.sentiment === 'positive').length)
      neutralData.push(dayData.filter(item => item.sentiment === 'neutral').length)
      negativeData.push(dayData.filter(item => item.sentiment === 'negative').length)
    }
  }

  if (!webmediaTrendChart) {
    webmediaTrendChart = echarts.init(webmediaTrendRef.value)
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['正面', '中性', '负面'],
      top: '5%',
      textStyle: { color: '#fff', fontSize: 11 }
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '22%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timePoints,
      axisLabel: { color: '#fff', fontSize: 10 },
      axisLine: { lineStyle: { color: '#4a5568' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff', fontSize: 10 },
      axisLine: { lineStyle: { color: '#4a5568' } },
      splitLine: { lineStyle: { color: '#2d3748' } }
    },
    series: [
      {
        name: '正面',
        type: 'line',
        data: positiveData,
        smooth: true,
        itemStyle: { color: '#67c23a' },
        lineStyle: { width: 2 }
      },
      {
        name: '中性',
        type: 'line',
        data: neutralData,
        smooth: true,
        itemStyle: { color: '#909399' },
        lineStyle: { width: 2 }
      },
      {
        name: '负面',
        type: 'line',
        data: negativeData,
        smooth: true,
        itemStyle: { color: '#f56c6c' },
        lineStyle: { width: 2 }
      }
    ]
  }
  webmediaTrendChart.setOption(option)
}

// 更新网媒趋势
const updateWebmediaTrend = () => {
  nextTick(() => {
    renderWebmediaTrend()
  })
}

// 渲染网媒情感分布
const renderWebmediaSentiment = () => {
  if (!webmediaSentimentRef.value) {
    console.warn('网媒情感分布图容器未找到')
    return
  }

  const webmediaData = dataStore.webmediaData
  console.log('渲染网媒情感分布 - 数据量:', webmediaData.length)

  const positive = webmediaData.filter(item => item.sentiment === 'positive').length
  const neutral = webmediaData.filter(item => item.sentiment === 'neutral').length
  const negative = webmediaData.filter(item => item.sentiment === 'negative').length

  console.log('网媒情感分布 - 正面:', positive, '中性:', neutral, '负面:', negative)

  if (!webmediaSentimentChart) {
    webmediaSentimentChart = echarts.init(webmediaSentimentRef.value)
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#fff', fontSize: 11 }
    },
    series: [
      {
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['40%', '50%'],
        data: [
          { value: positive, name: '正面', itemStyle: { color: '#67c23a' } },
          { value: neutral, name: '中性', itemStyle: { color: '#909399' } },
          { value: negative, name: '负面', itemStyle: { color: '#f56c6c' } }
        ],
        label: {
          color: '#fff',
          fontSize: 11
        }
      }
    ]
  }
  webmediaSentimentChart.setOption(option)
}

// 渲染微博趋势图
const renderWeiboTrend = () => {
  if (!weiboTrendRef.value) return

  const weiboData = dataStore.weiboData
  const now = dayjs()

  const timePoints: string[] = []
  const positiveData: number[] = []
  const neutralData: number[] = []
  const negativeData: number[] = []

  if (weiboPeriod.value === '24h') {
    for (let i = 23; i >= 0; i--) {
      const time = now.subtract(i, 'hour')
      timePoints.push(time.format('HH:mm'))

      const hourData = weiboData.filter(item => {
        const itemTime = dayjs(item.publishTime)
        return itemTime.isSame(time, 'hour')
      })

      positiveData.push(hourData.filter(item => item.sentiment === 'positive').length)
      neutralData.push(hourData.filter(item => item.sentiment === 'neutral').length)
      negativeData.push(hourData.filter(item => item.sentiment === 'negative').length)
    }
  } else {
    for (let i = 6; i >= 0; i--) {
      const time = now.subtract(i, 'day')
      timePoints.push(time.format('MM-DD'))

      const dayData = weiboData.filter(item => {
        const itemTime = dayjs(item.publishTime)
        return itemTime.isSame(time, 'day')
      })

      positiveData.push(dayData.filter(item => item.sentiment === 'positive').length)
      neutralData.push(dayData.filter(item => item.sentiment === 'neutral').length)
      negativeData.push(dayData.filter(item => item.sentiment === 'negative').length)
    }
  }

  if (!weiboTrendChart) {
    weiboTrendChart = echarts.init(weiboTrendRef.value)
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['正面', '中性', '负面'],
      top: '5%',
      textStyle: { color: '#fff', fontSize: 11 }
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '22%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timePoints,
      axisLabel: { color: '#fff', fontSize: 10 },
      axisLine: { lineStyle: { color: '#4a5568' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff', fontSize: 10 },
      axisLine: { lineStyle: { color: '#4a5568' } },
      splitLine: { lineStyle: { color: '#2d3748' } }
    },
    series: [
      {
        name: '正面',
        type: 'line',
        data: positiveData,
        smooth: true,
        itemStyle: { color: '#67c23a' },
        lineStyle: { width: 2 }
      },
      {
        name: '中性',
        type: 'line',
        data: neutralData,
        smooth: true,
        itemStyle: { color: '#909399' },
        lineStyle: { width: 2 }
      },
      {
        name: '负面',
        type: 'line',
        data: negativeData,
        smooth: true,
        itemStyle: { color: '#f56c6c' },
        lineStyle: { width: 2 }
      }
    ]
  }
  weiboTrendChart.setOption(option)
}

// 更新微博趋势
const updateWeiboTrend = () => {
  nextTick(() => {
    renderWeiboTrend()
  })
}

// 渲染微博情感分布
const renderWeiboSentiment = () => {
  if (!weiboSentimentRef.value) return

  const weiboData = dataStore.weiboData
  const positive = weiboData.filter(item => item.sentiment === 'positive').length
  const neutral = weiboData.filter(item => item.sentiment === 'neutral').length
  const negative = weiboData.filter(item => item.sentiment === 'negative').length

  if (!weiboSentimentChart) {
    weiboSentimentChart = echarts.init(weiboSentimentRef.value)
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#fff', fontSize: 11 }
    },
    series: [
      {
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['40%', '50%'],
        data: [
          { value: positive, name: '正面', itemStyle: { color: '#67c23a' } },
          { value: neutral, name: '中性', itemStyle: { color: '#909399' } },
          { value: negative, name: '负面', itemStyle: { color: '#f56c6c' } }
        ],
        label: {
          color: '#fff',
          fontSize: 11
        }
      }
    ]
  }
  weiboSentimentChart.setOption(option)
}

// 渲染热词词云
const renderWordCloud = () => {
  if (!wordCloudRef.value) {
    console.warn('词云容器未找到')
    return
  }

  const allData = dataStore.allData
  console.log('渲染词云 - 总数据量:', allData.length)

  const keywordMap = new Map<string, number>()

  allData.forEach(item => {
    if (item.aiKeywords && item.aiKeywords.length > 0) {
      item.aiKeywords.forEach(keyword => {
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1)
      })
    }
  })

  if (keywordMap.size === 0) {
    const mockKeywords = ['互联网', '数据分析', '人工智能', '社交媒体', '新闻', '科技', '用户体验', '产品', '服务', '创新']
    mockKeywords.forEach(keyword => {
      keywordMap.set(keyword, Math.floor(Math.random() * 50) + 10)
    })
  }

  const data = Array.from(keywordMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50)

  if (!wordCloudChart) {
    wordCloudChart = echarts.init(wordCloudRef.value)
  }

  const option: EChartsOption = {
    tooltip: {
      show: true
    },
    series: [
      {
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '100%',
        height: '100%',
        sizeRange: [14, 45],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 10,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: (): string => {
            const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
            return String(colors[Math.floor(Math.random() * colors.length)] ?? colors[0])
          }
        },
        emphasis: {
          textStyle: {
          }
        },
        data: data
      }
    ]
  }
  wordCloudChart.setOption(option)
}

// 渲染数据源对比
const renderDataCompare = () => {
  if (!dataCompareRef.value) return

  if (!dataCompareChart) {
    dataCompareChart = echarts.init(dataCompareRef.value)
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['网媒', '微博'],
      top: '5%',
      textStyle: { color: '#fff', fontSize: 12 }
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '22%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['正面', '中性', '负面'],
      axisLabel: { color: '#fff', fontSize: 11 },
      axisLine: { lineStyle: { color: '#4a5568' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff', fontSize: 10 },
      axisLine: { lineStyle: { color: '#4a5568' } },
      splitLine: { lineStyle: { color: '#2d3748' } }
    },
    series: [
      {
        name: '网媒',
        type: 'bar',
        data: [
          dataStore.webmediaData.filter(item => item.sentiment === 'positive').length,
          dataStore.webmediaData.filter(item => item.sentiment === 'neutral').length,
          dataStore.webmediaData.filter(item => item.sentiment === 'negative').length
        ],
        itemStyle: { color: '#409eff' }
      },
      {
        name: '微博',
        type: 'bar',
        data: [
          dataStore.weiboData.filter(item => item.sentiment === 'positive').length,
          dataStore.weiboData.filter(item => item.sentiment === 'neutral').length,
          dataStore.weiboData.filter(item => item.sentiment === 'negative').length
        ],
        itemStyle: { color: '#67c23a' }
      }
    ]
  }
  dataCompareChart.setOption(option)
}

// 渲染关联分析
const renderCorrelation = () => {
  if (!correlationRef.value) return

  if (!correlationChart) {
    correlationChart = echarts.init(correlationRef.value)
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#fff', fontSize: 11 }
    },
    series: [
      {
        type: 'pie',
        radius: '65%',
        center: ['40%', '50%'],
        data: [
          { value: stats.value.webmediaCount, name: '网媒数据', itemStyle: { color: '#409eff' } },
          { value: stats.value.weiboCount, name: '微博数据', itemStyle: { color: '#67c23a' } }
        ],
        label: {
          color: '#fff',
          fontSize: 11
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  correlationChart.setOption(option)
}

// 渲染所有图表
const renderAllCharts = () => {
  nextTick(() => {
    renderWebmediaTrend()
    renderWebmediaSentiment()
    renderWeiboTrend()
    renderWeiboSentiment()
    renderWordCloud()
    renderDataCompare()
    renderCorrelation()

    // 调整图表大小
    webmediaTrendChart?.resize()
    webmediaSentimentChart?.resize()
    weiboTrendChart?.resize()
    weiboSentimentChart?.resize()
    wordCloudChart?.resize()
    dataCompareChart?.resize()
    correlationChart?.resize()
  })
}

// 初始化
onMounted(async () => {
  console.log('=== 大屏初始化开始 ===')

  // 加载数据
  await dataStore.loadAllData()
  console.log('数据加载完成 - 网媒:', dataStore.webmediaData.length, '微博:', dataStore.weiboData.length)
  console.log('统计数据:', stats.value)

  // 更新时间
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  // 提取热门内容
  extractHotWebmedia()
  extractHotTopics()

  // 初始化缩放
  updateScale()

  // 等待DOM更新后渲染图表
  await nextTick()
  console.log('开始渲染图表...')
  renderAllCharts()

  // 定期更新热门内容
  setInterval(() => {
    extractHotWebmedia()
    extractHotTopics()
  }, 30000)

  // 监听窗口大小变化
  window.addEventListener('resize', updateScale)

  console.log('=== 大屏初始化完成 ===')
})

// 清理
onBeforeUnmount(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }

  // 销毁图表实例
  webmediaTrendChart?.dispose()
  webmediaSentimentChart?.dispose()
  weiboTrendChart?.dispose()
  weiboSentimentChart?.dispose()
  wordCloudChart?.dispose()
  dataCompareChart?.dispose()
  correlationChart?.dispose()

  // 移除事件监听
  window.removeEventListener('resize', updateScale)
})
</script>

<style lang="scss" scoped>
.fullscreen-wrapper {
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%);
  position: relative;
}

.dashboard-container {
  width: 1920px;
  height: 1080px;
  position: absolute;
  padding: 20px;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 10px;

    .dashboard-title {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(90deg, #409eff, #67c23a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .dashboard-time {
      font-size: 18px;
      color: #fff;
      font-family: monospace;
    }
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .stat-content {
        display: flex;
        gap: 16px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #fff;

          &.total {
            background: linear-gradient(135deg, #667eea, #764ba2);
          }

          &.webmedia {
            background: linear-gradient(135deg, #409eff, #5cacee);
          }

          &.weibo {
            background: linear-gradient(135deg, #67c23a, #85ce61);
          }

          &.sentiment {
            background: linear-gradient(135deg, #e6a23c, #f56c6c);
          }
        }

        .stat-info {
          flex: 1;

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #fff;
            margin-bottom: 4px;
          }

          .stat-trend {
            font-size: 12px;
            color: #67c23a;

            .trend-up {
              color: #67c23a;
            }
          }

          .stat-distribution {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .sentiment-item {
              font-size: 13px;
              padding: 2px 8px;
              border-radius: 4px;

              &.positive {
                color: #67c23a;
                background: rgba(103, 194, 58, 0.1);
              }

              &.neutral {
                color: #909399;
                background: rgba(144, 147, 153, 0.1);
              }

              &.negative {
                color: #f56c6c;
                background: rgba(245, 108, 108, 0.1);
              }
            }
          }
        }
      }
    }
  }

  .main-content {
    display: grid;
    grid-template-columns: 400px 1fr 400px;
    gap: 14px;
    height: calc(1080px - 232px);

    .section-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      border-left: 3px solid;

      &:has(.webmedia-section) {
        border-color: #409eff;
      }
    }

    .webmedia-section .section-header {
      border-color: #409eff;
    }

    .weibo-section .section-header {
      border-color: #67c23a;
    }

    .analysis-section .section-header {
      border-color: #e6a23c;
    }

    .left-section,
    .center-section,
    .right-section {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .el-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      flex-shrink: 0;

      :deep(.el-card__header) {
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 10px 14px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }
      }
    }

    .chart-card {
      margin-bottom: 10px;
      overflow: hidden;

      :deep(.el-card__body) {
        padding: 10px;
        height: 100%;
      }
    }

    .list-card {
      flex: 1;
      overflow: hidden;

      :deep(.el-card__body) {
        padding: 0;
        height: 100%;
        overflow: hidden;
      }

      .scroll-container {
        height: 100%;
        overflow: hidden;
      }

      .hot-list {
        padding: 8px;

        .hot-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          &:last-child {
            border-bottom: none;
          }

          .hot-rank {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            flex-shrink: 0;

            &.rank-1 {
              background: linear-gradient(135deg, #f56c6c, #ff8787);
            }

            &.rank-2 {
              background: linear-gradient(135deg, #e6a23c, #f0b86e);
            }

            &.rank-3 {
              background: linear-gradient(135deg, #409eff, #66b1ff);
            }
          }

          .hot-info {
            flex: 1;
            min-width: 0;

            .hot-title {
              font-size: 13px;
              font-weight: 500;
              color: #fff;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .hot-meta {
              font-size: 11px;
              color: #909399;
              display: flex;
              align-items: center;
              gap: 12px;
            }
          }
        }
      }
    }

    .chart-container-large {
      width: 100%;
      height: 290px;
    }

    .chart-container-medium {
      width: 100%;
      height: 190px;
    }

    .chart-container-small {
      width: 100%;
      height: 170px;
    }

    // 左侧区域高度分配
    .left-section {
      .chart-card:nth-child(2) {
        height: 240px;
      }

      .chart-card:nth-child(3) {
        height: 210px;
      }

      .list-card {
        height: calc(100% - 240px - 210px - 20px - 40px);
      }
    }

    // 中间区域高度分配
    .center-section {
      .chart-card:nth-child(2) {
        height: 330px;
      }

      .chart-card:nth-child(3) {
        height: 225px;
      }

      .chart-card:nth-child(4) {
        height: 225px;
      }
    }

    // 右侧区域高度分配
    .right-section {
      .chart-card:nth-child(2) {
        height: 240px;
      }

      .chart-card:nth-child(3) {
        height: 210px;
      }

      .list-card {
        height: calc(100% - 240px - 210px - 20px - 40px);
      }
    }
  }
}

// 滚动条样式
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>

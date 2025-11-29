<template>
  <div class="dashboard-container">
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
            <div class="stat-label">数据总量</div>
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
            <div class="stat-label">情感分析</div>
            <div class="stat-distribution">
              <span class="sentiment-item positive">正面 {{ stats.sentimentDistribution.positive }}</span>
              <span class="sentiment-item neutral">中性 {{ stats.sentimentDistribution.neutral }}</span>
              <span class="sentiment-item negative">负面 {{ stats.sentimentDistribution.negative }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧区域 -->
      <div class="left-section">
        <!-- 实时数据流 -->
        <el-card class="data-stream-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon class="streaming-icon"><Connection /></el-icon>
                实时数据流
              </span>
              <el-tag :type="isStreaming ? 'success' : 'info'" size="small">
                {{ isStreaming ? '推送中' : '已暂停' }}
              </el-tag>
              <el-switch
                v-model="isStreaming"
                active-text="推送"
                inactive-text="暂停"
                @change="handleStreamToggle"
              />
            </div>
          </template>
          <div class="data-stream">
            <TransitionGroup name="stream-item" tag="div" class="stream-list">
              <div
                v-for="item in streamData"
                :key="item.id"
                class="stream-item"
              >
                <div class="stream-item-header">
                  <el-tag :type="isWebMedia(item) ? 'primary' : 'success'" size="small">
                    {{ isWebMedia(item) ? '网媒' : '微博' }}
                  </el-tag>
                  <el-tag
                    v-if="item.sentiment"
                    :type="getSentimentType(item.sentiment)"
                    size="small"
                  >
                    {{ getSentimentText(item.sentiment) }}
                  </el-tag>
                  <span class="stream-time">{{ formatStreamTime(item.streamTime) }}</span>
                </div>
                <div class="stream-item-content">
                  {{ isWebMedia(item) ? item.title : item.content.substring(0, 80) }}...
                </div>
                <div class="stream-item-meta">
                  <span>来源: {{ isWebMedia(item) ? item.source : item.userName }}</span>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </el-card>

        <!-- 热点话题 -->
        <el-card class="hot-topics-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Lightning /></el-icon>
                热点话题
              </span>
            </div>
          </template>
          <div class="hot-topics">
            <div
              v-for="(topic, index) in hotTopics"
              :key="index"
              class="topic-item"
            >
              <div class="topic-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="topic-info">
                <div class="topic-keyword">{{ topic.keyword }}</div>
                <div class="topic-count">{{ topic.count }} 条相关</div>
              </div>
              <div class="topic-trend">
                <el-icon v-if="topic.trend === 'up'" color="#f56c6c"><CaretTop /></el-icon>
                <el-icon v-else-if="topic.trend === 'down'" color="#67c23a"><CaretBottom /></el-icon>
                <el-icon v-else color="#909399"><Minus /></el-icon>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中间区域 -->
      <div class="center-section">
        <!-- 情感趋势图 -->
        <el-card class="sentiment-trend-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                情感分析趋势
              </span>
              <el-radio-group v-model="trendPeriod" size="small" @change="updateSentimentTrend">
                <el-radio-button label="24h">24小时</el-radio-button>
                <el-radio-button label="7d">7天</el-radio-button>
                <el-radio-button label="30d">30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="sentimentTrendRef" class="chart-container"></div>
        </el-card>

        <!-- 数据类型分布 -->
        <el-card class="data-type-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><PieChart /></el-icon>
                数据类型分布
              </span>
            </div>
          </template>
          <div ref="dataTypeRef" class="chart-container-small"></div>
        </el-card>
      </div>

      <!-- 右侧区域 -->
      <div class="right-section">
        <!-- 关键词云 -->
        <el-card class="keywords-cloud-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Management /></el-icon>
                关键词云
              </span>
            </div>
          </template>
          <div ref="keywordsCloudRef" class="chart-container"></div>
        </el-card>

        <!-- 情感分布饼图 -->
        <el-card class="sentiment-pie-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><DataAnalysis /></el-icon>
                情感分布
              </span>
            </div>
          </template>
          <div ref="sentimentPieRef" class="chart-container-small"></div>
        </el-card>
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
  CaretBottom,
  Minus
} from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/dataStore'
import { isWebMedia } from '@/types'
import type { SentimentData } from '@/types'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import 'echarts-wordcloud'

const dataStore = useDataStore()

// 时间显示
const currentTime = ref('')
let timeInterval: number | null = null

// 实时数据流
const streamData = ref<(SentimentData & { streamTime: number })[]>([])
const isStreaming = ref(true)
let streamInterval: number | null = null

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

// 热点话题
const hotTopics = ref<Array<{ keyword: string; count: number; trend: 'up' | 'down' | 'stable' }>>([])

// 图表周期
const trendPeriod = ref('24h')

// 图表refs
const sentimentTrendRef = ref()
const dataTypeRef = ref()
const keywordsCloudRef = ref()
const sentimentPieRef = ref()

// 更新当前时间
const updateTime = () => {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// 格式化流式时间
const formatStreamTime = (timestamp: number) => {
  const now = Date.now()
  const diff = Math.floor((now - timestamp) / 1000)

  if (diff < 60) return `${diff}秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return dayjs(timestamp).format('MM-DD HH:mm')
}

// 获取情感类型
const getSentimentType = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'success'
    case 'negative':
      return 'danger'
    case 'neutral':
      return 'info'
    default:
      return 'info'
  }
}

// 获取情感文本
const getSentimentText = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return '正面'
    case 'negative':
      return '负面'
    case 'neutral':
      return '中性'
    default:
      return '未知'
  }
}

// 模拟实时推送
const simulateRealTimeStream = () => {
  if (!isStreaming.value) return

  const allData = dataStore.allData
  if (allData.length === 0) return

  // 随机选择1-3条数据
  const count = Math.floor(Math.random() * 3) + 1
  const newItems: (SentimentData & { streamTime: number })[] = []

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allData.length)
    const item = allData[randomIndex]
    newItems.push({
      ...(item as any),
      streamTime: Date.now() + i * 100 // 添加微小的时间差
    })
  }

  // 添加到流数据开头
  streamData.value = [...newItems, ...streamData.value].slice(0, 20)
}

// 处理推送开关
const handleStreamToggle = (value: boolean) => {
  if (value) {
    startStreaming()
  } else {
    stopStreaming()
  }
}

// 开始推送
const startStreaming = () => {
  if (streamInterval) return

  // 立即推送一次
  simulateRealTimeStream()

  // 每2-5秒推送一次
  const scheduleNext = () => {
    const delay = Math.random() * 3000 + 2000 // 2-5秒
    streamInterval = setTimeout(() => {
      simulateRealTimeStream()
      if (isStreaming.value) {
        scheduleNext()
      }
    }, delay)
  }

  scheduleNext()
}

// 停止推送
const stopStreaming = () => {
  if (streamInterval) {
    clearTimeout(streamInterval)
    streamInterval = null
  }
}

// 提取热点话题
const extractHotTopics = () => {
  const allData = dataStore.allData
  const keywordMap = new Map<string, number>()

  // 统计关键词出现次数
  allData.forEach(item => {
    if (item.aiKeywords && item.aiKeywords.length > 0) {
      item.aiKeywords.forEach(keyword => {
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1)
      })
    }
  })

  // 如果没有关键词，使用内容中的词
  if (keywordMap.size === 0) {
    allData.forEach(item => {
      const content = isWebMedia(item) ? item.title : item.content
      const words = content.match(/[\u4e00-\u9fa5]{2,}/g) || []
      words.forEach(word => {
        keywordMap.set(word, (keywordMap.get(word) || 0) + 1)
      })
    })
  }

  // 排序并取前10
  const trends = ['up', 'down', 'stable'] as const
  const sortedTopics = Array.from(keywordMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => {
      const t = trends[Math.floor(Math.random() * trends.length)] as typeof trends[number]
      return { keyword, count, trend: t }
    })

  hotTopics.value = sortedTopics
}

// 渲染情感趋势图
const renderSentimentTrend = () => {
  if (!sentimentTrendRef.value) return

  const allData = dataStore.allData
  const now = dayjs()
  let days = 1
  let format = 'HH:mm'

  if (trendPeriod.value === '7d') {
    days = 7
    format = 'MM-DD'
  } else if (trendPeriod.value === '30d') {
    days = 30
    format = 'MM-DD'
  }

  // 生成时间点
  const timePoints: string[] = []
  const positiveData: number[] = []
  const neutralData: number[] = []
  const negativeData: number[] = []

  if (trendPeriod.value === '24h') {
    // 24小时，按小时统计
    for (let i = 23; i >= 0; i--) {
      const time = now.subtract(i, 'hour')
      timePoints.push(time.format(format))

      const hourData = allData.filter(item => {
        const itemTime = dayjs(item.publishTime)
        return itemTime.isSame(time, 'hour')
      })

      positiveData.push(hourData.filter(item => item.sentiment === 'positive').length)
      neutralData.push(hourData.filter(item => item.sentiment === 'neutral').length)
      negativeData.push(hourData.filter(item => item.sentiment === 'negative').length)
    }
  } else {
    // 7天或30天，按天统计
    for (let i = days - 1; i >= 0; i--) {
      const time = now.subtract(i, 'day')
      timePoints.push(time.format(format))

      const dayData = allData.filter(item => {
        const itemTime = dayjs(item.publishTime)
        return itemTime.isSame(time, 'day')
      })

      positiveData.push(dayData.filter(item => item.sentiment === 'positive').length)
      neutralData.push(dayData.filter(item => item.sentiment === 'neutral').length)
      negativeData.push(dayData.filter(item => item.sentiment === 'negative').length)
    }
  }

  const chart = echarts.init(sentimentTrendRef.value)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['正面', '中性', '负面'],
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timePoints,
      axisLabel: {
        color: '#fff',
        rotate: trendPeriod.value === '24h' ? 0 : 45
      },
      axisLine: {
        lineStyle: { color: '#4a5568' }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#fff'
      },
      axisLine: {
        lineStyle: { color: '#4a5568' }
      },
      splitLine: {
        lineStyle: { color: '#2d3748' }
      }
    },
    series: [
      {
        name: '正面',
        type: 'line',
        data: positiveData,
        smooth: true,
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      },
      {
        name: '中性',
        type: 'line',
        data: neutralData,
        smooth: true,
        itemStyle: { color: '#909399' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(144, 147, 153, 0.3)' },
            { offset: 1, color: 'rgba(144, 147, 153, 0.05)' }
          ])
        }
      },
      {
        name: '负面',
        type: 'line',
        data: negativeData,
        smooth: true,
        itemStyle: { color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

// 更新情感趋势
const updateSentimentTrend = () => {
  nextTick(() => {
    renderSentimentTrend()
  })
}

// 渲染数据类型分布
const renderDataType = () => {
  if (!dataTypeRef.value) return

  const chart = echarts.init(dataTypeRef.value)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        data: [
          { value: stats.value.webmediaCount, name: '网媒数据', itemStyle: { color: '#409eff' } },
          { value: stats.value.weiboCount, name: '微博数据', itemStyle: { color: '#67c23a' } }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 渲染关键词云
const renderKeywordsCloud = () => {
  if (!keywordsCloudRef.value) return

  const allData = dataStore.allData
  const keywordMap = new Map<string, number>()

  // 统计关键词
  allData.forEach(item => {
    if (item.aiKeywords && item.aiKeywords.length > 0) {
      item.aiKeywords.forEach(keyword => {
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1)
      })
    }
  })

  // 如果没有关键词，生成模拟数据
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

  const chart = echarts.init(keywordsCloudRef.value)
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
        sizeRange: [12, 40],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
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
  chart.setOption(option)
}

// 渲染情感分布饼图
const renderSentimentPie = () => {
  if (!sentimentPieRef.value) return

  const chart = echarts.init(sentimentPieRef.value)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        center: ['35%', '50%'],
        data: [
          { value: stats.value.sentimentDistribution.positive, name: '正面', itemStyle: { color: '#67c23a' } },
          { value: stats.value.sentimentDistribution.neutral, name: '中性', itemStyle: { color: '#909399' } },
          { value: stats.value.sentimentDistribution.negative, name: '负面', itemStyle: { color: '#f56c6c' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          color: '#fff'
        }
      }
    ]
  }
  chart.setOption(option)
}

// 渲染所有图表
const renderAllCharts = () => {
  nextTick(() => {
    renderSentimentTrend()
    renderDataType()
    renderKeywordsCloud()
    renderSentimentPie()
  })
}

// 初始化
onMounted(async () => {
  // 加载数据
  await dataStore.loadAllData()

  // 更新时间
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  // 提取热点话题
  extractHotTopics()

  // 渲染图表
  renderAllCharts()

  // 开始实时推送
  startStreaming()

  // 定期更新热点话题
  setInterval(() => {
    extractHotTopics()
  }, 30000) // 30秒更新一次
})

// 清理
onBeforeUnmount(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  stopStreaming()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%);
  padding: 20px;
  overflow-y: auto;

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
    grid-template-columns: 350px 1fr 400px;
    gap: 16px;
    height: calc(100vh - 260px);

    .left-section,
    .center-section,
    .right-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .el-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;

      :deep(.el-card__header) {
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 12px 16px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;

          .streaming-icon {
            animation: pulse 2s ease-in-out infinite;
          }
        }
      }
    }

    // 实时数据流
    .data-stream-card {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        overflow: hidden;
        padding: 0;
      }

      .data-stream {
        height: 100%;
        overflow-y: auto;
        padding: 12px;

        .stream-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stream-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px;
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateX(5px);
          }

          .stream-item-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;

            .stream-time {
              margin-left: auto;
              font-size: 12px;
              color: #909399;
            }
          }

          .stream-item-content {
            font-size: 14px;
            color: #fff;
            line-height: 1.6;
            margin-bottom: 8px;
          }

          .stream-item-meta {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    // 热点话题
    .hot-topics-card {
      height: 400px;
      overflow: hidden;

      .hot-topics {
        max-height: 340px;
        overflow-y: auto;

        .topic-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          &:last-child {
            border-bottom: none;
          }

          .topic-rank {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;

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

          .topic-info {
            flex: 1;

            .topic-keyword {
              font-size: 14px;
              font-weight: 500;
              color: #fff;
              margin-bottom: 4px;
            }

            .topic-count {
              font-size: 12px;
              color: #909399;
            }
          }

          .topic-trend {
            font-size: 18px;
          }
        }
      }
    }

    // 图表容器
    .chart-container {
      width: 100%;
      height: 300px;
    }

    .chart-container-small {
      width: 100%;
      height: 250px;
    }

    .sentiment-trend-card {
      flex: 1;
    }

    .data-type-card {
      height: 320px;
    }

    .keywords-cloud-card {
      flex: 1;
    }

    .sentiment-pie-card {
      height: 320px;
    }
  }
}

// 动画效果
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.stream-item-enter-active {
  transition: all 0.5s ease;
}

.stream-item-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.stream-item-leave-active {
  transition: all 0.5s ease;
}

.stream-item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>

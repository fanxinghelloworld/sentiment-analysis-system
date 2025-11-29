// 情感类型
export type SentimentType = 'positive' | 'neutral' | 'negative'

// 数据源类型
export type DataSourceType = 'webmedia' | 'weibo'

// 预警级别
export type WarningLevel = 'high' | 'medium' | 'low'

// 网媒数据接口
export interface WebMediaData {
  // 原始数据（来自Excel）
  id: string
  title: string
  content: string
  source: string
  author: string
  publishTime: string
  url: string
  viewCount: number
  shareCount: number
  mediaType: string
  category: string
  keywords: string

  // AI分析结果（需要调用AI API生成）
  sentiment?: SentimentType
  sentimentScore?: number
  aiKeywords?: string[]
  aiSummary?: string
  aiCategory?: string
  isWarning?: boolean
  warningLevel?: WarningLevel
}

// 微博数据接口
export interface WeiboData {
  // 原始数据（来自Excel）
  id: string
  content: string
  userId: string
  userName: string
  publishTime: string
  likeCount: number
  commentCount: number
  repostCount: number
  isVerified: boolean
  userFollowers: number
  topicTags: string
  location: string

  // AI分析结果（需要调用AI API生成）
  sentiment?: SentimentType
  sentimentScore?: number
  aiKeywords?: string[]
  aiSummary?: string
  aiCategory?: string
  isWarning?: boolean
  warningLevel?: WarningLevel
}

// 统一舆情数据类型
export type SentimentData = WebMediaData | WeiboData

// 类型守卫
export function isWebMedia(data: SentimentData): data is WebMediaData {
  return 'title' in data
}

export function isWeibo(data: SentimentData): data is WeiboData {
  return 'userId' in data
}

// AI分析结果接口
export interface AIAnalysisResult {
  dataId: string
  dataType: DataSourceType
  sentiment: {
    label: SentimentType
    score: number // 0-100
    confidence: number // 0-1
  }
  keywords: Array<{
    word: string
    weight: number
  }>
  summary: string
  category: string
  topics: string[]
  suggestions?: string[]
  analyzedAt: string
}

// 预警规则接口
export interface WarningRule {
  id: string
  name: string
  type: 'keyword' | 'sentiment' | 'volume' | 'speed'
  level: WarningLevel
  enabled: boolean
  config: {
    keywords?: string[]
    sentimentThreshold?: number
    volumeThreshold?: number
    speedThreshold?: number
  }
  createdAt: string
  updatedAt: string
}

// 预警记录接口
export interface WarningRecord {
  id: string
  ruleId: string
  ruleName: string
  level: WarningLevel
  dataId: string
  dataType: DataSourceType
  reason: string
  aiSuggestion?: string
  status: 'unhandled' | 'processing' | 'resolved' | 'ignored'
  createdAt: string
  updatedAt: string
}

// 数据统计接口
export interface DataStatistics {
  total: number
  webmediaCount: number
  weiboCount: number
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  todayCount: number
  yesterdayCount: number
  weekCount: number
}

// 热词接口
export interface HotKeyword {
  word: string
  count: number
  weight: number
  dataType?: DataSourceType
}

// 图表数据接口
export interface ChartDataItem {
  name: string
  value: number
  [key: string]: any
}

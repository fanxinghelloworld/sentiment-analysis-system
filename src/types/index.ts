/**
 * 类型定义模块
 *
 * 定义了整个应用的 TypeScript 类型和接口
 * 包括数据模型、API 响应、统计信息等
 */

// ============ 基础类型 ============

/** 情感类型：正面 | 中性 | 负面 */
export type SentimentType = 'positive' | 'neutral' | 'negative'

/** 数据源类型：网媒 | 微博 */
export type DataSourceType = 'webmedia' | 'weibo'

/** 预警级别：严重 | 警告 | 提示 */
export type WarningLevel = 'high' | 'medium' | 'low'

// ============ 数据模型 ============

/**
 * 网媒数据接口
 *
 * 存储网络媒体文章的原始数据和 AI 分析结果
 */
export interface WebMediaData {
  // 原始数据字段（来自 Excel 导入）
  /** 唯一标识符 */
  id: string
  /** 文章标题 */
  title: string
  /** 文章正文 */
  content: string
  /** 来源站点名称 */
  source: string
  /** 作者 */
  author: string
  /** 发布时间（ISO 字符串） */
  publishTime: string
  /** 文章链接 */
  url: string
  /** 阅读量 */
  viewCount: number
  /** 分享量 */
  shareCount: number
  /** 媒体渠道类型 */
  mediaType: string
  /** 分类 */
  category: string
  /** 关键词（逗号分隔） */
  keywords: string

  // AI 分析结果字段（可选，需要调用 AI API 生成）
  /** 情感倾向 */
  sentiment?: SentimentType
  /** 情感得分（0-100） */
  sentimentScore?: number
  /** AI 提取的关键词 */
  aiKeywords?: string[]
  /** AI 生成的摘要 */
  aiSummary?: string
  /** AI 分类结果 */
  aiCategory?: string
  /** 是否触发预警 */
  isWarning?: boolean
  /** 预警级别 */
  warningLevel?: WarningLevel
}

/**
 * 微博数据接口
 *
 * 存储微博帖子的原始数据和 AI 分析结果
 */
export interface WeiboData {
  // 原始数据字段（来自 Excel 导入）
  /** 唯一标识符 */
  id: string
  /** 微博正文 */
  content: string
  /** 用户ID */
  userId: string
  /** 用户名 */
  userName: string
  /** 发布时间（ISO 字符串） */
  publishTime: string
  /** 点赞数 */
  likeCount: number
  /** 评论数 */
  commentCount: number
  /** 转发数 */
  repostCount: number
  /** 是否认证用户 */
  isVerified: boolean
  /** 粉丝数 */
  userFollowers: number
  /** 话题标签（逗号分隔） */
  topicTags: string
  /** IP 属地 */
  location: string

  // AI 分析结果字段（可选，需要调用 AI API 生成）
  /** 情感倾向 */
  sentiment?: SentimentType
  /** 情感得分（0-100） */
  sentimentScore?: number
  /** AI 提取的关键词 */
  aiKeywords?: string[]
  /** AI 生成的摘要 */
  aiSummary?: string
  /** AI 分类结果 */
  aiCategory?: string
  /** 是否触发预警 */
  isWarning?: boolean
  /** 预警级别 */
  warningLevel?: WarningLevel
}

/**
 * 统一舆情数据类型
 *
 * 网媒数据或微博数据的联合类型
 */
export type SentimentData = WebMediaData | WeiboData

// ============ 类型守卫函数 ============

/**
 * 判断数据是否为网媒类型
 *
 * @param data - 舆情数据
 * @returns 是否为网媒数据
 */
export function isWebMedia(data: SentimentData): data is WebMediaData {
  return 'title' in data
}

/**
 * 判断数据是否为微博类型
 *
 * @param data - 舆情数据
 * @returns 是否为微博数据
 */
export function isWeibo(data: SentimentData): data is WeiboData {
  return 'userId' in data
}

// ============ AI 分析相关 ============

/**
 * AI 分析结果接口
 *
 * 存储 AI 对单条数据的完整分析结果
 */
export interface AIAnalysisResult {
  /** 数据ID */
  dataId: string
  /** 数据类型 */
  dataType: DataSourceType
  /** 情感分析结果 */
  sentiment: {
    /** 情感标签 */
    label: SentimentType
    /** 情感得分（0-100） */
    score: number
    /** 置信度（0-1） */
    confidence: number
  }
  /** 关键词列表 */
  keywords: Array<{
    /** 关键词 */
    word: string
    /** 权重 */
    weight: number
  }>
  /** 内容摘要 */
  summary: string
  /** 内容分类 */
  category: string
  /** 话题列表 */
  topics: string[]
  /** AI 建议（可选） */
  suggestions?: string[]
  /** 分析时间（ISO 字符串） */
  analyzedAt: string
}

// ============ 预警相关 ============

/**
 * 预警规则接口
 *
 * 定义预警规则的配置和触发条件
 */
export interface WarningRule {
  /** 唯一标识符 */
  id: string
  /** 规则名称 */
  name: string
  /** 规则类型：关键词 | 情感 | 数量 | 速度 */
  type: 'keyword' | 'sentiment' | 'volume' | 'speed'
  /** 预警级别 */
  level: WarningLevel
  /** 是否启用 */
  enabled: boolean
  /** 规则配置 */
  config: {
    /** 关键词列表（关键词规则） */
    keywords?: string[]
    /** 情感阈值（情感规则） */
    sentimentThreshold?: number
    /** 数量阈值（数量规则） */
    volumeThreshold?: number
    /** 速度阈值（速度规则） */
    speedThreshold?: number
  }
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 预警记录接口
 *
 * 记录触发的预警事件
 */
export interface WarningRecord {
  /** 唯一标识符 */
  id: string
  /** 触发的规则ID */
  ruleId: string
  /** 触发的规则名称 */
  ruleName: string
  /** 预警级别 */
  level: WarningLevel
  /** 关联的数据ID */
  dataId: string
  /** 数据类型 */
  dataType: DataSourceType
  /** 预警原因 */
  reason: string
  /** AI 建议（可选） */
  aiSuggestion?: string
  /** 处理状态：未处理 | 处理中 | 已解决 | 已忽略 */
  status: 'unhandled' | 'processing' | 'resolved' | 'ignored'
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

// ============ 统计相关 ============

/**
 * 数据统计接口
 *
 * 存储各种统计指标
 */
export interface DataStatistics {
  /** 总数据条数 */
  total: number
  /** 网媒数据条数 */
  webmediaCount: number
  /** 微博数据条数 */
  weiboCount: number
  /** 情感分布统计 */
  sentimentDistribution: {
    /** 正面数量 */
    positive: number
    /** 中性数量 */
    neutral: number
    /** 负面数量 */
    negative: number
  }
  /** 今日数据量 */
  todayCount: number
  /** 昨日数据量 */
  yesterdayCount: number
  /** 本周数据量 */
  weekCount: number
}

/**
 * 热词接口
 *
 * 存储高频关键词信息
 */
export interface HotKeyword {
  /** 关键词 */
  word: string
  /** 出现次数 */
  count: number
  /** 权重 */
  weight: number
  /** 数据类型（可选） */
  dataType?: DataSourceType
}

/**
 * 图表数据项接口
 *
 * 用于图表渲染的通用数据格式
 */
export interface ChartDataItem {
  /** 名称 */
  name: string
  /** 数值 */
  value: number
  /** 其他自定义字段 */
  [key: string]: any
}

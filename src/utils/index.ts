import dayjs from 'dayjs'
import _ from 'lodash'

// 日期格式化
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).format(format)
}

// 相对时间
export const fromNow = (date: string | Date) => {
  return dayjs(date).fromNow()
}

// 生成唯一ID
export const generateId = (prefix = '') => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `${prefix}${timestamp}${random}`
}

// 数字格式化
export const formatNumber = (num: number, decimals = 0) => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// 百分比格式化
export const formatPercent = (num: number, total: number, decimals = 1) => {
  if (total === 0) return '0%'
  const percent = (num / total) * 100
  return `${percent.toFixed(decimals)}%`
}

// 文件大小格式化
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 截断文本
export const truncateText = (text: string, maxLength: number, suffix = '...') => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

// 防抖
export const debounce = _.debounce

// 节流
export const throttle = _.throttle

// 深拷贝
export const cloneDeep = _.cloneDeep

// 数组去重
export const uniq = _.uniq

// 随机获取数组元素
export const sample = _.sample

// 随机获取多个数组元素
export const sampleSize = _.sampleSize

// 延迟执行
export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 获取情感颜色
export const getSentimentColor = (sentiment?: 'positive' | 'neutral' | 'negative') => {
  switch (sentiment) {
    case 'positive':
      return '#67C23A'
    case 'negative':
      return '#F56C6C'
    case 'neutral':
      return '#909399'
    default:
      return '#909399'
  }
}

// 获取情感文本
export const getSentimentText = (sentiment?: 'positive' | 'neutral' | 'negative') => {
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

// 获取预警级别颜色
export const getWarningLevelColor = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high':
      return '#F56C6C'
    case 'medium':
      return '#E6A23C'
    case 'low':
      return '#409EFF'
  }
}

// 获取预警级别文本
export const getWarningLevelText = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high':
      return '严重'
    case 'medium':
      return '警告'
    case 'low':
      return '提示'
  }
}

// 下载文件
export const downloadFile = (content: string, filename: string, type = 'text/plain') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 复制到剪贴板
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('复制失败：', error)
    return false
  }
}

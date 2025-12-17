/**
 * 通用工具函数模块
 *
 * 提供日期格式化、数字格式化、文本处理、情感/预警相关工具等
 */

import dayjs from 'dayjs'
import _ from 'lodash'

// ============ 日期时间工具 ============

/**
 * 日期格式化
 *
 * @param date - 日期对象或 ISO 字符串
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).format(format)
}

/**
 * 相对时间
 *
 * 返回相对于当前时间的描述（如：3小时前）
 *
 * @param date - 日期对象或 ISO 字符串
 * @returns 相对时间描述
 */
export const fromNow = (date: string | Date) => {
  return dayjs(date).fromNow()
}

// ============ ID 生成 ============

/**
 * 生成唯一ID
 *
 * 基于时间戳和随机数生成唯一标识符
 *
 * @param prefix - ID 前缀，默认为空
 * @returns 唯一ID字符串
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `${prefix}${timestamp}${random}`
}

// ============ 数字格式化 ============

/**
 * 数字格式化
 *
 * 按中文习惯格式化数字（千分位）
 *
 * @param num - 要格式化的数字
 * @param decimals - 小数位数，默认0
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number, decimals = 0) => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * 百分比格式化
 *
 * 将数值转换为百分比字符串
 *
 * @param num - 分子
 * @param total - 分母
 * @param decimals - 小数位数，默认1
 * @returns 百分比字符串（如：75.5%）
 */
export const formatPercent = (num: number, total: number, decimals = 1) => {
  if (total === 0) return '0%'
  const percent = (num / total) * 100
  return `${percent.toFixed(decimals)}%`
}

/**
 * 文件大小格式化
 *
 * 将字节数转换为人类可读的文件大小
 *
 * @param bytes - 字节数
 * @returns 格式化后的文件大小（如：1.23 MB）
 */
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// ============ 文本处理 ============

/**
 * 截断文本
 *
 * 超过指定长度时截断并添加后缀
 *
 * @param text - 原始文本
 * @param maxLength - 最大长度
 * @param suffix - 后缀，默认 '...'
 * @returns 截断后的文本
 */
export const truncateText = (text: string, maxLength: number, suffix = '...') => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

// ============ Lodash 工具导出 ============

/** 防抖函数 */
export const debounce = _.debounce

/** 节流函数 */
export const throttle = _.throttle

/** 深拷贝 */
export const cloneDeep = _.cloneDeep

/** 数组去重 */
export const uniq = _.uniq

/** 随机获取数组元素 */
export const sample = _.sample

/** 随机获取多个数组元素 */
export const sampleSize = _.sampleSize

// ============ 异步工具 ============

/**
 * 延迟执行
 *
 * 返回一个 Promise，在指定毫秒后 resolve
 *
 * @param ms - 延迟时间（毫秒）
 * @returns Promise
 */
export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============ 情感分析工具 ============

/**
 * 获取情感颜色
 *
 * 根据情感类型返回对应的颜色值
 *
 * @param sentiment - 情感类型
 * @returns 十六进制颜色值
 */
export const getSentimentColor = (sentiment?: 'positive' | 'neutral' | 'negative') => {
  switch (sentiment) {
    case 'positive':
      return '#67C23A' // 绿色
    case 'negative':
      return '#F56C6C' // 红色
    case 'neutral':
      return '#909399' // 灰色
    default:
      return '#909399'
  }
}

/**
 * 获取情感文本
 *
 * 根据情感类型返回中文描述
 *
 * @param sentiment - 情感类型
 * @returns 中文描述
 */
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

// ============ 预警工具 ============

/**
 * 获取预警级别颜色
 *
 * 根据预警级别返回对应的颜色值
 *
 * @param level - 预警级别
 * @returns 十六进制颜色值
 */
export const getWarningLevelColor = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high':
      return '#F56C6C' // 红色（严重）
    case 'medium':
      return '#E6A23C' // 橙色（警告）
    case 'low':
      return '#409EFF' // 蓝色（提示）
  }
}

/**
 * 获取预警级别文本
 *
 * 根据预警级别返回中文描述
 *
 * @param level - 预警级别
 * @returns 中文描述
 */
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

// ============ 文件操作 ============

/**
 * 下载文件
 *
 * 创建并触发文件下载
 *
 * @param content - 文件内容
 * @param filename - 文件名
 * @param type - MIME 类型，默认 'text/plain'
 */
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

/**
 * 复制到剪贴板
 *
 * 使用 Clipboard API 复制文本
 *
 * @param text - 要复制的文本
 * @returns 是否成功
 */
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('复制失败：', error)
    return false
  }
}

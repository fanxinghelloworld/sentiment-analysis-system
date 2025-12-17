/**
 * Excel 文件处理工具模块
 *
 * 提供 Excel 文件的解析、验证、数据转换和导出功能
 * 支持网媒数据和微博数据的导入导出
 */

import * as XLSX from 'xlsx'
import type { WebMediaData, WeiboData } from '@/types'
import { generateId } from './index'

// ============ Excel 解析 ============

/**
 * Excel 文件解析
 *
 * 读取 Excel 文件并转换为 JSON 对象数组
 *
 * @param file - Excel 文件对象
 * @returns Promise<any[]> - 解析后的数据数组
 */
export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          // 没有表格，返回空数组
          resolve([])
          return
        }

        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) {
          resolve([])
          return
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsBinaryString(file)
  })
}

// ============ 数据验证 ============

/**
 * 验证网媒数据格式
 *
 * 检查数据是否包含必填字段
 *
 * @param data - 待验证的数据数组
 * @returns 验证结果对象，包含 valid 和 errors
 */
export const validateWebMediaData = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  const requiredFields = ['title', 'content', 'source', 'publishTime']

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('数据为空')
    return { valid: false, errors }
  }

  data.forEach((item, index) => {
    requiredFields.forEach(field => {
      if (!item[field]) {
        errors.push(`第${index + 1}行缺少必填字段: ${field}`)
      }
    })
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证微博数据格式
 *
 * 检查数据是否包含必填字段
 *
 * @param data - 待验证的数据数组
 * @returns 验证结果对象，包含 valid 和 errors
 */
export const validateWeiboData = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  const requiredFields = ['content', 'userId', 'userName', 'publishTime']

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('数据为空')
    return { valid: false, errors }
  }

  data.forEach((item, index) => {
    requiredFields.forEach(field => {
      if (!item[field]) {
        errors.push(`第${index + 1}行缺少必填字段: ${field}`)
      }
    })
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

// ============ 数据转换 ============

/**
 * 转换为网媒数据格式
 *
 * 将 Excel 原始数据转换为标准的 WebMediaData 格式
 * 自动映射中文列名到英文字段名
 *
 * @param rawData - Excel 原始数据数组
 * @returns 网媒数据数组
 */
export const convertToWebMediaData = (rawData: any[]): WebMediaData[] => {
  console.log(rawData, 'rawData')
  return rawData.map(item => ({
    id: item.id || generateId('WM'),
    title: item.标题 || '',
    content: item.正文 || '',
    source: item.站点名称 || '',
    author: item.文章作者 || '',
    publishTime: item.发布时间 || new Date().toISOString(),
    url: item.文章链接 || '',
    viewCount: Number(item.阅读量) || 0,
    shareCount: Number(item.转发量) || 0,
    mediaType: item.媒体渠道 || '',
    category: item.category || '',
    keywords: item.keywords || ''
  }))
}

/**
 * 转换为微博数据格式
 *
 * 将 Excel 原始数据转换为标准的 WeiboData 格式
 * 自动映射中文列名到英文字段名，处理数组字段
 *
 * @param rawData - Excel 原始数据数组
 * @returns 微博数据数组
 */
export const convertToWeiboData = (rawData: any[]): WeiboData[] => {
  return rawData.map(item => ({
    id: item.id || generateId('WB'),
    content: item.正文 || '',
    userId: item.userId || '',
    userName: item.文章作者 || '',
    publishTime: item.发布时间 || new Date().toISOString(),
    likeCount: Number(item.点赞量) || 0,
    commentCount: Number(item.评论量) || 0,
    repostCount: Number(item.转发量) || 0,
    isVerified: Boolean(item.isVerified),
    userFollowers: Number(item.userFollowers) || 0,
    topicTags: Array.isArray(item.topicTags) ? item.topicTags : (item.topicTags ? String(item.topicTags).split(/[,;，；]/).map(s => s.trim()).filter(Boolean) : []),
    location: item.ip属地 || ''
  }))
}

// ============ Excel 导出 ============

/**
 * 导出为 Excel
 *
 * 将数据数组导出为 Excel 文件
 *
 * @param data - 要导出的数据数组
 * @param filename - 导出的文件名
 */
export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, filename)
}

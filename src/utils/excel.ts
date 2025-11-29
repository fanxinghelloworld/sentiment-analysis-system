import * as XLSX from 'xlsx'
import type { WebMediaData, WeiboData } from '@/types'
import { generateId } from './index'

// Excel文件解析
export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
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

// 验证网媒数据格式
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

// 验证微博数据格式
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

// 转换为网媒数据格式
export const convertToWebMediaData = (rawData: any[]): WebMediaData[] => {
  return rawData.map(item => ({
    id: item.id || generateId('WM'),
    title: item.title || '',
    content: item.content || '',
    source: item.source || '',
    author: item.author || '',
    publishTime: item.publishTime || new Date().toISOString(),
    url: item.url || '',
    viewCount: Number(item.viewCount) || 0,
    shareCount: Number(item.shareCount) || 0,
    mediaType: item.mediaType || '',
    category: item.category || '',
    keywords: item.keywords || ''
  }))
}

// 转换为微博数据格式
export const convertToWeiboData = (rawData: any[]): WeiboData[] => {
  return rawData.map(item => ({
    id: item.id || generateId('WB'),
    content: item.content || '',
    userId: item.userId || '',
    userName: item.userName || '',
    publishTime: item.publishTime || new Date().toISOString(),
    likeCount: Number(item.likeCount) || 0,
    commentCount: Number(item.commentCount) || 0,
    repostCount: Number(item.repostCount) || 0,
    isVerified: Boolean(item.isVerified),
    userFollowers: Number(item.userFollowers) || 0,
    topicTags: item.topicTags || '',
    location: item.location || ''
  }))
}

// 导出为Excel
export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, filename)
}

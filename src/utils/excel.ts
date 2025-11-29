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

// 转换为微博数据格式
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
    topicTags: item.topicTags || '',
    location: item.ip属地 || ''
  }))
}

// 导出为Excel
export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, filename)
}

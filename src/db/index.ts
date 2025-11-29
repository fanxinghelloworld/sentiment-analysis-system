import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { WebMediaData, WeiboData, WarningRecord, WarningRule } from '@/types'

// 定义数据库类
export class SentimentDatabase extends Dexie {
  // 表定义
  webmedia!: Table<WebMediaData, string>
  weibo!: Table<WeiboData, string>
  warningRules!: Table<WarningRule, string>
  warningRecords!: Table<WarningRecord, string>

  constructor() {
    super('SentimentAnalysisDB')

    // 定义数据库版本和表结构
    this.version(1).stores({
      webmedia: 'id, source, publishTime, sentiment, category, mediaType, *keywords',
      weibo: 'id, userId, publishTime, sentiment, location, *topicTags',
      warningRules: 'id, type, enabled',
      warningRecords: 'id, ruleId, dataId, level, status, createdAt'
    })
  }
}

// 创建数据库实例
export const db = new SentimentDatabase()

// 数据库操作辅助函数
export const dbHelper = {
  // 网媒数据操作
  async addWebMediaData(data: WebMediaData[]) {
    return await db.webmedia.bulkAdd(data)
  },

  async getWebMediaData(limit?: number, offset?: number) {
    let query = db.webmedia.orderBy('publishTime').reverse()
    if (limit) {
      if (offset) {
        query = query.offset(offset)
      }
      return await query.limit(limit).toArray()
    }
    return await query.toArray()
  },

  async getWebMediaById(id: string) {
    return await db.webmedia.get(id)
  },

  async updateWebMediaData(id: string, updates: Partial<WebMediaData>) {
    return await db.webmedia.update(id, updates)
  },

  async deleteWebMediaData(id: string) {
    return await db.webmedia.delete(id)
  },

  async clearWebMediaData() {
    return await db.webmedia.clear()
  },

  // 微博数据操作
  async addWeiboData(data: WeiboData[]) {
    return await db.weibo.bulkAdd(data)
  },

  async getWeiboData(limit?: number, offset?: number) {
    let query = db.weibo.orderBy('publishTime').reverse()
    if (limit) {
      if (offset) {
        query = query.offset(offset)
      }
      return await query.limit(limit).toArray()
    }
    return await query.toArray()
  },

  async getWeiboById(id: string) {
    return await db.weibo.get(id)
  },

  async updateWeiboData(id: string, updates: Partial<WeiboData>) {
    return await db.weibo.update(id, updates)
  },

  async deleteWeiboData(id: string) {
    return await db.weibo.delete(id)
  },

  async clearWeiboData() {
    return await db.weibo.clear()
  },

  // 预警规则操作
  async addWarningRule(rule: WarningRule) {
    return await db.warningRules.add(rule)
  },

  async getWarningRules() {
    return await db.warningRules.toArray()
  },

  async updateWarningRule(id: string, updates: Partial<WarningRule>) {
    return await db.warningRules.update(id, updates)
  },

  async deleteWarningRule(id: string) {
    return await db.warningRules.delete(id)
  },

  // 预警记录操作
  async addWarningRecord(record: WarningRecord) {
    return await db.warningRecords.add(record)
  },

  async getWarningRecords(limit?: number) {
    let query = db.warningRecords.orderBy('createdAt').reverse()
    if (limit) {
      return await query.limit(limit).toArray()
    }
    return await query.toArray()
  },

  async updateWarningRecord(id: string, updates: Partial<WarningRecord>) {
    return await db.warningRecords.update(id, updates)
  },

  async deleteWarningRecord(id: string) {
    return await db.warningRecords.delete(id)
  },

  // 统计查询
  async getWebMediaCount() {
    return await db.webmedia.count()
  },

  async getWeiboCount() {
    return await db.weibo.count()
  },

  async getTotalCount() {
    const webmediaCount = await this.getWebMediaCount()
    const weiboCount = await this.getWeiboCount()
    return webmediaCount + weiboCount
  },

  // 按情感分类统计
  async getSentimentStats() {
    const webmediaData = await db.webmedia.toArray()
    const weiboData = await db.weibo.toArray()
    const allData = [...webmediaData, ...weiboData]

    const stats = {
      positive: 0,
      neutral: 0,
      negative: 0
    }

    allData.forEach(item => {
      if (item.sentiment === 'positive') stats.positive++
      else if (item.sentiment === 'neutral') stats.neutral++
      else if (item.sentiment === 'negative') stats.negative++
    })

    return stats
  },

  // 搜索功能
  async searchData(keyword: string, dataType?: 'webmedia' | 'weibo') {
    const results: any[] = []

    if (!dataType || dataType === 'webmedia') {
      const webmediaResults = await db.webmedia
        .filter(item =>
          item.title?.includes(keyword) ||
          item.content?.includes(keyword) ||
          item.keywords?.includes(keyword)
        )
        .toArray()
      results.push(...webmediaResults)
    }

    if (!dataType || dataType === 'weibo') {
      const weiboResults = await db.weibo
        .filter(item =>
          item.content?.includes(keyword) ||
          item.topicTags?.includes(keyword)
        )
        .toArray()
      results.push(...weiboResults)
    }

    return results
  }
}

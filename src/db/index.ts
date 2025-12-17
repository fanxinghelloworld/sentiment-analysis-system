/**
 * 数据库配置模块
 *
 * 基于 Dexie.js (IndexedDB 封装) 的数据库配置
 * 提供网媒数据、微博数据、预警规则和预警记录的存储和查询功能
 */

import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { WebMediaData, WeiboData, WarningRecord, WarningRule } from '@/types'

// ============ 数据库类定义 ============

/**
 * 情感分析系统数据库类
 *
 * 继承自 Dexie，提供类型安全的数据库操作
 * 数据库名称: SentimentAnalysisDB
 */
export class SentimentDatabase extends Dexie {
  /** 网媒数据表 */
  webmedia!: Table<WebMediaData, string>

  /** 微博数据表 */
  weibo!: Table<WeiboData, string>

  /** 预警规则表 */
  warningRules!: Table<WarningRule, string>

  /** 预警记录表 */
  warningRecords!: Table<WarningRecord, string>

  constructor() {
    super('SentimentAnalysisDB')

    /**
     * 定义数据库版本和表结构
     *
     * 索引说明：
     * - 单列索引：用于查询和排序（如 id, publishTime）
     * - 多值索引（*前缀）：用于数组字段（如 *keywords, *topicTags）
     */
    this.version(1).stores({
      webmedia: 'id, source, publishTime, sentiment, category, mediaType, *keywords',
      weibo: 'id, userId, publishTime, sentiment, location, *topicTags',
      warningRules: 'id, type, enabled',
      warningRecords: 'id, ruleId, dataId, level, status, createdAt'
    })
  }
}

/** 数据库实例 */
export const db = new SentimentDatabase()

// ============ 数据库操作辅助函数 ============

/**
 * 数据库操作辅助对象
 * 提供对所有表的 CRUD 操作和统计查询功能
 */
export const dbHelper = {
  // ============ 网媒数据操作 ============

  /**
   * 批量添加网媒数据
   *
   * @param data - 网媒数据数组
   */
  async addWebMediaData(data: WebMediaData[]) {
    return await db.webmedia.bulkAdd(data)
  },

  /**
   * 获取网媒数据列表
   *
   * @param limit - 限制返回数量（可选）
   * @param offset - 偏移量，用于分页（可选）
   * @returns 网媒数据数组，按发布时间倒序排列
   */
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

  /**
   * 根据ID获取单条网媒数据
   *
   * @param id - 网媒数据ID
   * @returns 网媒数据对象，不存在时返回 undefined
   */
  async getWebMediaById(id: string) {
    return await db.webmedia.get(id)
  },

  /**
   * 更新网媒数据
   *
   * @param id - 网媒数据ID
   * @param updates - 要更新的字段
   */
  async updateWebMediaData(id: string, updates: Partial<WebMediaData>) {
    return await db.webmedia.update(id, updates)
  },

  /**
   * 删除单条网媒数据
   *
   * @param id - 网媒数据ID
   */
  async deleteWebMediaData(id: string) {
    return await db.webmedia.delete(id)
  },

  /**
   * 批量删除网媒数据
   *
   * @param ids - 网媒数据ID数组
   */
  async bulkDeleteWebMediaData(ids: string[]) {
    return await db.webmedia.bulkDelete(ids)
  },

  /**
   * 清空所有网媒数据
   */
  async clearWebMediaData() {
    return await db.webmedia.clear()
  },

  // ============ 微博数据操作 ============

  /**
   * 批量添加微博数据
   *
   * @param data - 微博数据数组
   */
  async addWeiboData(data: WeiboData[]) {
    return await db.weibo.bulkAdd(data)
  },

  /**
   * 获取微博数据列表
   *
   * @param limit - 限制返回数量（可选）
   * @param offset - 偏移量，用于分页（可选）
   * @returns 微博数据数组，按发布时间倒序排列
   */
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

  /**
   * 根据ID获取单条微博数据
   *
   * @param id - 微博数据ID
   * @returns 微博数据对象，不存在时返回 undefined
   */
  async getWeiboById(id: string) {
    return await db.weibo.get(id)
  },

  /**
   * 更新微博数据
   *
   * @param id - 微博数据ID
   * @param updates - 要更新的字段
   */
  async updateWeiboData(id: string, updates: Partial<WeiboData>) {
    return await db.weibo.update(id, updates)
  },

  /**
   * 删除单条微博数据
   *
   * @param id - 微博数据ID
   */
  async deleteWeiboData(id: string) {
    return await db.weibo.delete(id)
  },

  /**
   * 批量删除微博数据
   *
   * @param ids - 微博数据ID数组
   */
  async bulkDeleteWeiboData(ids: string[]) {
    return await db.weibo.bulkDelete(ids)
  },

  /**
   * 清空所有微博数据
   */
  async clearWeiboData() {
    return await db.weibo.clear()
  },

  // ============ 预警规则操作 ============

  /**
   * 添加预警规则
   *
   * @param rule - 预警规则对象
   */
  async addWarningRule(rule: WarningRule) {
    return await db.warningRules.add(rule)
  },

  /**
   * 获取所有预警规则
   *
   * @returns 预警规则数组
   */
  async getWarningRules() {
    return await db.warningRules.toArray()
  },

  /**
   * 更新预警规则
   *
   * @param id - 预警规则ID
   * @param updates - 要更新的字段
   */
  async updateWarningRule(id: string, updates: Partial<WarningRule>) {
    return await db.warningRules.update(id, updates)
  },

  /**
   * 删除预警规则
   *
   * @param id - 预警规则ID
   */
  async deleteWarningRule(id: string) {
    return await db.warningRules.delete(id)
  },

  // ============ 预警记录操作 ============

  /**
   * 添加预警记录
   *
   * @param record - 预警记录对象
   */
  async addWarningRecord(record: WarningRecord) {
    return await db.warningRecords.add(record)
  },

  /**
   * 获取预警记录列表
   *
   * @param limit - 限制返回数量（可选）
   * @returns 预警记录数组，按创建时间倒序排列
   */
  async getWarningRecords(limit?: number) {
    let query = db.warningRecords.orderBy('createdAt').reverse()
    if (limit) {
      return await query.limit(limit).toArray()
    }
    return await query.toArray()
  },

  /**
   * 更新预警记录
   *
   * @param id - 预警记录ID
   * @param updates - 要更新的字段
   */
  async updateWarningRecord(id: string, updates: Partial<WarningRecord>) {
    return await db.warningRecords.update(id, updates)
  },

  /**
   * 删除预警记录
   *
   * @param id - 预警记录ID
   */
  async deleteWarningRecord(id: string) {
    return await db.warningRecords.delete(id)
  },

  // ============ 统计查询 ============

  /**
   * 获取网媒数据总数
   *
   * @returns 网媒数据条数
   */
  async getWebMediaCount() {
    return await db.webmedia.count()
  },

  /**
   * 获取微博数据总数
   *
   * @returns 微博数据条数
   */
  async getWeiboCount() {
    return await db.weibo.count()
  },

  /**
   * 获取所有数据总数（网媒 + 微博）
   *
   * @returns 所有数据条数
   */
  async getTotalCount() {
    const webmediaCount = await this.getWebMediaCount()
    const weiboCount = await this.getWeiboCount()
    return webmediaCount + weiboCount
  },

  /**
   * 按情感分类统计
   *
   * 统计所有数据（网媒 + 微博）的情感分布
   *
   * @returns 情感统计对象，包含 positive、neutral、negative 三个字段
   */
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

  /**
   * 搜索功能
   *
   * 在数据中搜索包含关键词的条目
   * 网媒数据搜索范围：标题、正文、关键词
   * 微博数据搜索范围：正文、话题标签
   *
   * @param keyword - 搜索关键词
   * @param dataType - 数据类型，'webmedia' | 'weibo'，不指定则搜索全部
   * @returns 匹配的数据数组
   */
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

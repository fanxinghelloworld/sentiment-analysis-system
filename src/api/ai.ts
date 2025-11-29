import { request } from '@/utils/request'
import type { AIAnalysisResult } from '@/types'

// AI分析API
export const aiApi = {
  // 情感分析
  analyzeSentiment(content: string, dataType: 'webmedia' | 'weibo') {
    return request.post<AIAnalysisResult>('/ai/sentiment', { content, dataType })
  },

  // 批量情感分析
  batchAnalyzeSentiment(items: Array<{ id: string; content: string; dataType: 'webmedia' | 'weibo' }>) {
    return request.post<AIAnalysisResult[]>('/ai/sentiment/batch', { items })
  },

  // 关键词提取
  extractKeywords(content: string, topK: number = 10) {
    return request.post<Array<{ word: string; weight: number }>>('/ai/keywords', { content, topK })
  },

  // 生成摘要
  generateSummary(content: string, maxLength: number = 200) {
    return request.post<{ summary: string }>('/ai/summary', { content, maxLength })
  },

  // 内容分类
  categorizeContent(content: string) {
    return request.post<{ category: string; confidence: number }>('/ai/categorize', { content })
  },

  // AI对话
  chat(message: string, context?: any) {
    return request.post<{ reply: string }>('/ai/chat', { message, context })
  },

  // 生成舆情报告
  generateReport(dateRange: { start: string; end: string }, reportType: 'daily' | 'weekly' | 'monthly') {
    return request.post<{ report: string }>('/ai/report', { dateRange, reportType })
  }
}

// 模拟AI响应（用于开发阶段，如果没有真实API）
export const mockAiApi = {
  // 模拟情感分析
  async analyzeSentiment(content: string): Promise<AIAnalysisResult> {
    // 简单的情感分析模拟逻辑
    await new Promise(resolve => setTimeout(resolve, 500))

    const negativeWords = ['问题', '投诉', '差', '烂', '失望', '糟糕', '不满']
    const positiveWords = ['好', '优秀', '满意', '棒', '赞', '支持', '喜欢']

    let score = 50
    negativeWords.forEach(word => {
      if (content.includes(word)) score -= 10
    })
    positiveWords.forEach(word => {
      if (content.includes(word)) score += 10
    })

    score = Math.max(0, Math.min(100, score))

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
    if (score >= 60) sentiment = 'positive'
    else if (score <= 40) sentiment = 'negative'

    return {
      dataId: '',
      dataType: 'webmedia',
      sentiment: {
        label: sentiment,
        score,
        confidence: 0.85
      },
      keywords: [],
      summary: content.substring(0, 100) + '...',
      category: '其他',
      topics: [],
      analyzedAt: new Date().toISOString()
    }
  },

  // 模拟关键词提取
  async extractKeywords(content: string, topK: number = 10): Promise<Array<{ word: string; weight: number }>> {
    await new Promise(resolve => setTimeout(resolve, 300))

    // 简单的关键词提取
    const words = content.match(/[\u4e00-\u9fa5]{2,}/g) || []
    const wordCount = new Map<string, number>()

    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })

    return Array.from(wordCount.entries())
      .map(([word, count]) => ({ word, weight: count }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, topK)
  },

  // 模拟生成摘要
  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '')
  }
}

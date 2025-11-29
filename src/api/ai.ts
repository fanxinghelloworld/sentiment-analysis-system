import type { AIAnalysisResult, SentimentType } from '@/types'
import axios from 'axios'

// 智谱清言API配置
const ZHIPU_API_KEY = '01139fd97f82059497ae23d12302e0a7.rA0Hz8YR2HLxSfyp'
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

// 调用智谱AI
async function callZhipuAI(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      ZHIPU_API_URL,
      {
        model: 'glm-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${ZHIPU_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('智谱AI调用失败:', error)
    throw new Error('AI分析服务暂时不可用')
  }
}

// AI分析API
export const aiApi = {
  // 情感分析
  async analyzeSentiment(content: string, dataType: 'webmedia' | 'weibo'): Promise<AIAnalysisResult> {
    const prompt = `请分析以下${dataType === 'webmedia' ? '新闻报道' : '微博内容'}的情感倾向，返回JSON格式：
{
  "sentiment": "positive/neutral/negative",
  "score": 0-100的分数,
  "confidence": 0-1的置信度,
  "reason": "判断理由"
}

内容：${content.substring(0, 500)}`

    const result = await callZhipuAI(prompt)
    const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')

    return {
      dataId: '',
      dataType,
      sentiment: {
        label: parsed.sentiment as SentimentType,
        score: parsed.score || 50,
        confidence: parsed.confidence || 0.8
      },
      keywords: [],
      summary: '',
      category: '',
      topics: [],
      analyzedAt: new Date().toISOString()
    }
  },

  // 批量情感分析
  async batchAnalyzeSentiment(
    items: Array<{ id: string; content: string; dataType: 'webmedia' | 'weibo' }>
  ): Promise<AIAnalysisResult[]> {
    const results: AIAnalysisResult[] = []

    for (const item of items.slice(0, 5)) { // 限制一次分析5条
      try {
        const result = await this.analyzeSentiment(item.content, item.dataType)
        results.push({ ...result, dataId: item.id })
        // 延迟避免API限流
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`分析失败 (${item.id}):`, error)
      }
    }

    return results
  },

  // 关键词提取
  async extractKeywords(content: string, topK: number = 10): Promise<Array<{ word: string; weight: number }>> {
    const prompt = `请从以下内容中提取${topK}个最重要的关键词，返回JSON数组格式：
[
  {"word": "关键词1", "weight": 权重1-10},
  {"word": "关键词2", "weight": 权重1-10}
]

内容：${content.substring(0, 800)}`

    const result = await callZhipuAI(prompt)
    const parsed = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || '[]')

    return parsed
  },

  // 生成摘要
  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    const prompt = `请将以下内容总结成${maxLength}字以内的摘要，要求简洁、准确、包含核心信息：

${content.substring(0, 1000)}`

    const summary = await callZhipuAI(prompt)
    return summary.substring(0, maxLength)
  },

  // 内容分类
  async categorizeContent(content: string): Promise<{ category: string; confidence: number }> {
    const prompt = `请将以下内容分类到以下类别之一：投诉、建议、咨询、表扬、中性报道、其他
返回JSON格式：
{
  "category": "分类名称",
  "confidence": 0-1的置信度
}

内容：${content.substring(0, 500)}`

    const result = await callZhipuAI(prompt)
    const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')

    return {
      category: parsed.category || '其他',
      confidence: parsed.confidence || 0.7
    }
  },

  // 综合分析（一次性完成多个任务）
  async comprehensiveAnalysis(content: string, dataType: 'webmedia' | 'weibo'): Promise<{
    sentiment: { label: SentimentType; score: number; confidence: number }
    keywords: Array<{ word: string; weight: number }>
    summary: string
    category: string
  }> {
    const prompt = `请对以下${dataType === 'webmedia' ? '新闻报道' : '微博内容'}进行综合分析，返回JSON格式：
{
  "sentiment": {
    "label": "positive/neutral/negative",
    "score": 0-100,
    "confidence": 0-1
  },
  "keywords": [
    {"word": "关键词", "weight": 1-10}
  ],
  "summary": "100字以内摘要",
  "category": "投诉/建议/咨询/表扬/中性报道/其他"
}

内容：${content.substring(0, 1000)}`

    const result = await callZhipuAI(prompt)
    const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')

    return {
      sentiment: {
        label: parsed.sentiment?.label || 'neutral',
        score: parsed.sentiment?.score || 50,
        confidence: parsed.sentiment?.confidence || 0.8
      },
      keywords: parsed.keywords || [],
      summary: parsed.summary || '',
      category: parsed.category || '其他'
    }
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

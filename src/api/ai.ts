/**
 * AI 分析服务模块
 *
 * 提供智谱AI集成功能，包括情感分析、关键词提取、内容摘要和分类等
 * 支持网媒和微博两种数据源的智能分析
 */

import type { AIAnalysisResult, SentimentType } from '@/types'
import axios from 'axios'

// ============ API 配置 ============

/** 智谱清言 API 密钥 */
const ZHIPU_API_KEY = '01139fd97f82059497ae23d12302e0a7.rA0Hz8YR2HLxSfyp'

/** 智谱清言 API 地址 */
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

// ============ 核心函数 ============

/**
 * 调用智谱AI接口
 *
 * @param systemPrompt - 系统角色定义
 * @param userPrompt - 用户提示词
 * @returns AI返回的文本内容
 * @throws 当API调用失败时抛出错误
 */
async function callZhipuAI(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const response = await axios.post(
      ZHIPU_API_URL,
      {
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
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

// ============ API 导出 ============

/**
 * AI分析API服务对象
 * 提供各种AI分析功能的接口
 */
export const aiApi = {
  /**
   * 情感分析
   *
   * 分析文本内容的情感倾向（正面/中性/负面）
   *
   * @param content - 待分析的文本内容
   * @param dataType - 数据类型（'webmedia' 网媒 | 'weibo' 微博）
   * @returns AI分析结果，包含情感标签、得分和置信度
   */
  async analyzeSentiment(content: string, dataType: 'webmedia' | 'weibo'): Promise<AIAnalysisResult> {
    const systemPrompt = `你是一位专业的舆情分析专家，擅长情感分析和舆论监测。你需要对${dataType === 'webmedia' ? '新闻报道' : '社交媒体内容'}进行客观、准确的情感倾向分析。

你的分析标准：
- positive（正面）：表达积极、肯定、支持、赞扬等正向情感
- neutral（中性）：客观陈述事实，没有明显情感倾向
- negative（负面）：表达消极、批评、抱怨、不满等负向情感

返回格式要求：
1. 必须严格按照 JSON 格式返回，不要包含任何其他文字
2. sentiment 字段必须是 "positive"、"neutral" 或 "negative" 之一
3. score 字段为 0-100 的整数，分数越高表示情感越积极
4. confidence 字段为 0-1 之间的小数，表示分析的置信度
5. reason 字段简要说明判断依据（50字以内）`

    const userPrompt = `请分析以下${dataType === 'webmedia' ? '新闻报道' : '微博内容'}的情感倾向：

内容：
${content.substring(0, 500)}

请严格按照以下 JSON 格式返回结果：
{
  "sentiment": "positive/neutral/negative",
  "score": 0,
  "confidence": 0.0,
  "reason": "判断理由"
}`

    const result = await callZhipuAI(systemPrompt, userPrompt)
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

  /**
   * 批量情感分析
   *
   * 批量分析多条数据的情感倾向，限制一次最多分析5条
   * 为避免API限流，每条分析间隔1秒
   *
   * @param items - 待分析的数据数组，每项包含id、content和dataType
   * @returns AI分析结果数组
   */
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

  /**
   * 关键词提取
   *
   * 从文本中提取最重要的关键词
   *
   * @param content - 待提取关键词的文本内容
   * @param topK - 提取关键词的数量，默认10个
   * @returns 关键词数组，每项包含词语和权重（1-10）
   */
  async extractKeywords(content: string, topK: number = 10): Promise<Array<{ word: string; weight: number }>> {
    const systemPrompt = `你是一位专业的文本分析专家，擅长从文本中提取关键词和核心主题。

你的工作职责：
1. 识别文本中的核心关键词和主题词
2. 筛选出最能代表文本内容的词汇
3. 为每个关键词评估其重要程度（权重）

权重评分标准（1-10分）：
- 9-10分：文本的核心主题词，出现频率高且意义重要
- 7-8分：重要的支撑词汇，对理解文本很有帮助
- 5-6分：相关度中等的词汇
- 3-4分：次要相关词汇
- 1-2分：略有关联的词汇

返回格式要求：
1. 必须严格按照 JSON 数组格式返回，不要包含任何其他文字
2. 每个关键词对象包含 word 和 weight 两个字段
3. weight 必须是 1-10 之间的整数
4. 按权重从高到低排序
5. 关键词应该是有意义的名词、动词或专业术语，避免停用词`

    const userPrompt = `请从以下内容中提取 ${topK} 个最重要的关键词：

内容：
${content.substring(0, 800)}

请严格按照以下 JSON 数组格式返回结果：
[
  {"word": "关键词1", "weight": 10},
  {"word": "关键词2", "weight": 9}
]`

    const result = await callZhipuAI(systemPrompt, userPrompt)
    const parsed = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || '[]')

    return parsed
  },

  /**
   * 生成摘要
   *
   * 将长文本内容总结成简短摘要
   *
   * @param content - 待生成摘要的文本内容
   * @param maxLength - 摘要最大字数，默认200字
   * @returns 摘要文本
   */
  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    const systemPrompt = `你是一位专业的内容编辑和摘要撰写专家，擅长从长文本中提炼核心信息。

你的工作职责：
1. 快速识别文本的核心要点和关键信息
2. 使用简洁、准确的语言概括文本主旨
3. 保留最重要的事实、数据和观点
4. 确保摘要逻辑清晰、易于理解

摘要撰写原则：
- 保持客观中立，不添加个人观点
- 优先保留 5W1H（何人、何事、何时、何地、为何、如何）
- 使用完整的句子，避免破碎的短语
- 语言流畅自然，符合中文表达习惯
- 如果有数据，优先保留关键数据

返回格式要求：
1. 直接返回摘要文本，不需要任何前缀或后缀
2. 不要使用"本文"、"该内容"等指代词开头
3. 不要添加"摘要："等标签`

    const userPrompt = `请将以下内容总结成 ${maxLength} 字以内的摘要：

内容：
${content.substring(0, 1000)}

要求：
- 字数不超过 ${maxLength} 字
- 提炼核心信息
- 语言简洁准确`

    const summary = await callZhipuAI(systemPrompt, userPrompt)
    return summary.substring(0, maxLength)
  },

  /**
   * 内容分类
   *
   * 将内容分类到预定义类别中
   *
   * @param content - 待分类的文本内容
   * @returns 分类结果，包含类别名称和置信度（0-1）
   */
  async categorizeContent(content: string): Promise<{ category: string; confidence: number }> {
    const systemPrompt = `你是一位专业的内容分类专家，擅长舆情分析和文本分类。

你需要将内容分类到以下类别之一：

1. 投诉：表达不满、问题反馈、服务质量差、产品缺陷等负面诉求
2. 建议：提出改进意见、优化建议、功能需求等建设性反馈
3. 咨询：询问信息、寻求帮助、了解详情等问询类内容
4. 表扬：表达赞赏、肯定成绩、分享好评等正面评价
5. 中性报道：客观陈述事实、新闻报道、信息传递等中立内容
6. 其他：无法明确归类到以上类别的内容

分类原则：
- 优先根据内容的主要意图和目的进行分类
- 如果内容包含多种意图，选择最主要的意图
- 置信度反映分类的确定程度，0.8以上表示非常确定

返回格式要求：
1. 必须严格按照 JSON 格式返回，不要包含任何其他文字
2. category 字段必须是上述六个类别之一（使用中文）
3. confidence 字段为 0-1 之间的小数，保留2位小数`

    const userPrompt = `请对以下内容进行分类：

内容：
${content.substring(0, 500)}

请严格按照以下 JSON 格式返回结果：
{
  "category": "类别名称",
  "confidence": 0.00
}`

    const result = await callZhipuAI(systemPrompt, userPrompt)
    const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')

    return {
      category: parsed.category || '其他',
      confidence: parsed.confidence || 0.7
    }
  },

  /**
   * 综合分析
   *
   * 一次性完成情感分析、关键词提取、摘要生成和内容分类
   * 相比单独调用各个API，这种方式更高效
   *
   * @param content - 待分析的文本内容
   * @param dataType - 数据类型（'webmedia' 网媒 | 'weibo' 微博）
   * @returns 综合分析结果，包含情感、关键词、摘要和分类
   */
  async comprehensiveAnalysis(content: string, dataType: 'webmedia' | 'weibo'): Promise<{
    sentiment: { label: SentimentType; score: number; confidence: number }
    keywords: Array<{ word: string; weight: number }>
    summary: string
    category: string
  }> {
    const systemPrompt = `你是一位资深的舆情分析专家，同时精通情感分析、关键词提取、内容总结和文本分类。你需要对${dataType === 'webmedia' ? '新闻报道' : '社交媒体内容'}进行全方位的综合分析。

你的分析任务包括：

1. 情感分析：
   - positive（正面）：积极、肯定、支持、赞扬
   - neutral（中性）：客观陈述、无明显倾向
   - negative（负面）：消极、批评、抱怨、不满
   - score：0-100，分数越高越积极
   - confidence：0-1，分析的置信度

2. 关键词提取：
   - 提取5-10个核心关键词
   - 权重范围 1-10，权重越高越重要
   - 按权重降序排列

3. 内容摘要：
   - 100字以内
   - 概括核心信息
   - 语言简洁准确

4. 内容分类：
   - 投诉、建议、咨询、表扬、中性报道、其他
   - 选择最符合的类别

返回格式要求：
1. 必须严格按照 JSON 格式返回，不要包含任何其他文字
2. 所有字段都是必填的
3. 数值字段必须是数字类型，不要使用字符串
4. keywords 数组至少包含3个元素
5. summary 不超过100字`

    const userPrompt = `请对以下${dataType === 'webmedia' ? '新闻报道' : '微博内容'}进行综合分析：

内容：
${content.substring(0, 1000)}

请严格按照以下 JSON 格式返回结果：
{
  "sentiment": {
    "label": "positive/neutral/negative",
    "score": 0,
    "confidence": 0.0
  },
  "keywords": [
    {"word": "关键词1", "weight": 10},
    {"word": "关键词2", "weight": 9}
  ],
  "summary": "摘要内容",
  "category": "类别"
}`

    const result = await callZhipuAI(systemPrompt, userPrompt)
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

// ============ 模拟 API（用于开发测试） ============

/**
 * 模拟AI响应服务
 *
 * 用于开发阶段测试，提供简单的规则基于的分析功能
 * 不需要真实API即可进行功能验证
 */
export const mockAiApi = {
  /**
   * 模拟情感分析
   *
   * 基于简单的关键词匹配规则判断情感倾向
   *
   * @param content - 待分析的文本内容
   * @returns 模拟的AI分析结果
   */
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

  /**
   * 模拟关键词提取
   *
   * 基于中文词频统计提取关键词
   *
   * @param content - 待提取关键词的文本内容
   * @param topK - 提取关键词的数量，默认10个
   * @returns 关键词数组，按出现频次排序
   */
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

  /**
   * 模拟生成摘要
   *
   * 简单截取文本前N个字符作为摘要
   *
   * @param content - 待生成摘要的文本内容
   * @param maxLength - 摘要最大字数，默认200字
   * @returns 摘要文本
   */
  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '')
  }
}

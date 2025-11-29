<template>
  <div class="analysis-container">
    <!-- 顶部操作栏 -->
    <el-card class="operation-card">
      <div class="operation-header">
        <h3>AI 智能分析</h3>
        <div class="operation-actions">
          <el-select v-model="selectedDataType" placeholder="选择数据类型" style="width: 150px">
            <el-option label="全部" value="all" />
            <el-option label="网媒数据" value="webmedia" />
            <el-option label="微博数据" value="weibo" />
          </el-select>
          <el-button
            type="primary"
            :icon="MagicStick"
            :loading="batchAnalyzing"
            :disabled="selectedItems.length === 0"
            @click="handleBatchAnalysis"
          >
            批量分析 ({{ selectedItems.length }})
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="data-list-card">
      <el-table
        :data="displayData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag v-if="isWebMedia(row)" type="primary" size="small">网媒</el-tag>
            <el-tag v-else type="success" size="small">微博</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="300">
          <template #default="{ row }">
            <div class="content-preview">
              {{ isWebMedia(row) ? row.title : row.content.substring(0, 100) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="AI分析状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.sentiment" type="success" size="small">已分析</el-tag>
            <el-tag v-else type="info" size="small">未分析</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="情感" width="100">
          <template #default="{ row }">
            <el-tag
              v-if="row.sentiment"
              :type="getSentimentType(row.sentiment)"
              size="small"
            >
              {{ getSentimentText(row.sentiment) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :icon="View"
              @click="handleViewDetail(row)"
            >
              查看
            </el-button>
            <el-button
              link
              type="primary"
              :icon="MagicStick"
              :loading="analyzingIds.has(row.id)"
              @click="handleAnalyzeOne(row)"
            >
              分析
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="filteredData.length"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="AI 分析详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentItem" class="detail-content">
        <!-- 原始内容 -->
        <el-divider content-position="left">原始内容</el-divider>
        <div class="original-content">
          <p v-if="isWebMedia(currentItem)"><strong>标题：</strong>{{ currentItem.title }}</p>
          <p><strong>内容：</strong>{{ currentItem.content }}</p>
          <p><strong>发布时间：</strong>{{ formatDate(currentItem.publishTime) }}</p>
        </div>

        <!-- AI分析结果 -->
        <el-divider content-position="left">AI 分析结果</el-divider>
        <div v-if="currentItem.sentiment" class="analysis-results">
          <!-- 情感分析 -->
          <div class="result-section">
            <h4>情感分析</h4>
            <div class="sentiment-info">
              <el-tag :type="getSentimentType(currentItem.sentiment)" size="large">
                {{ getSentimentText(currentItem.sentiment) }}
              </el-tag>
              <span class="score">分数: {{ currentItem.sentimentScore || 'N/A' }}</span>
            </div>
          </div>

          <!-- 关键词 -->
          <div v-if="currentItem.aiKeywords && currentItem.aiKeywords.length > 0" class="result-section">
            <h4>关键词</h4>
            <div class="keywords">
              <el-tag
                v-for="keyword in currentItem.aiKeywords"
                :key="keyword"
                type="info"
                style="margin: 4px"
              >
                {{ keyword }}
              </el-tag>
            </div>
          </div>

          <!-- 摘要 -->
          <div v-if="currentItem.aiSummary" class="result-section">
            <h4>内容摘要</h4>
            <p class="summary-text">{{ currentItem.aiSummary }}</p>
          </div>

          <!-- 分类 -->
          <div v-if="currentItem.aiCategory" class="result-section">
            <h4>内容分类</h4>
            <el-tag type="primary">{{ currentItem.aiCategory }}</el-tag>
          </div>
        </div>
        <el-empty v-else description="暂无AI分析结果" />

        <!-- 分析按钮 -->
        <div class="analysis-actions">
          <el-button
            type="primary"
            :icon="MagicStick"
            :loading="analyzing"
            @click="handleAnalyzeCurrent"
          >
            {{ currentItem.sentiment ? '重新分析' : '开始分析' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, View } from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/dataStore'
import { aiApi } from '@/api/ai'
import { isWebMedia } from '@/types'
import { formatDate } from '@/utils'
import type { SentimentData } from '@/types'

const dataStore = useDataStore()

// 状态
const loading = ref(false)
const analyzing = ref(false)
const batchAnalyzing = ref(false)
const analyzingIds = ref(new Set<string>())
const selectedDataType = ref<'all' | 'webmedia' | 'weibo'>('all')
const selectedItems = ref<SentimentData[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const showDetailDialog = ref(false)
const currentItem = ref<SentimentData | null>(null)

// 过滤后的数据
const filteredData = computed(() => {
  let data = dataStore.allData

  if (selectedDataType.value === 'webmedia') {
    data = data.filter(item => isWebMedia(item))
  } else if (selectedDataType.value === 'weibo') {
    data = data.filter(item => !isWebMedia(item))
  }

  return data
})

// 显示的数据（分页）
const displayData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 选择变化
const handleSelectionChange = (selection: SentimentData[]) => {
  selectedItems.value = selection
}

// 查看详情
const handleViewDetail = (item: SentimentData) => {
  currentItem.value = item
  showDetailDialog.value = true
}

// 分析单条数据
const handleAnalyzeOne = async (item: SentimentData) => {
  analyzingIds.value.add(item.id)

  try {
    const content = isWebMedia(item) ? `${item.title}\n${item.content}` : item.content
    const dataType = isWebMedia(item) ? 'webmedia' : 'weibo'

    ElMessage.info('AI分析中，请稍候...')

    const result = await aiApi.comprehensiveAnalysis(content, dataType)

    // 更新数据
    const updates = {
      sentiment: result.sentiment.label,
      sentimentScore: result.sentiment.score,
      aiKeywords: result.keywords.map(k => k.word),
      aiSummary: result.summary,
      aiCategory: result.category
    }

    if (isWebMedia(item)) {
      await dataStore.updateWebMediaData(item.id, updates)
    } else {
      await dataStore.updateWeiboData(item.id, updates)
    }

    ElMessage.success('分析完成！')

    // 如果正在查看详情，更新当前项
    if (currentItem.value?.id === item.id) {
      currentItem.value = { ...item, ...updates }
    }
  } catch (error: any) {
    console.error('AI分析失败:', error)
    ElMessage.error(error.message || 'AI分析失败')
  } finally {
    analyzingIds.value.delete(item.id)
  }
}

// 分析当前查看的数据
const handleAnalyzeCurrent = async () => {
  if (!currentItem.value) return

  analyzing.value = true
  try {
    await handleAnalyzeOne(currentItem.value)
  } finally {
    analyzing.value = false
  }
}

// 批量分析
const handleBatchAnalysis = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要分析的数据')
    return
  }

  if (selectedItems.value.length > 5) {
    ElMessage.warning('一次最多分析5条数据')
    return
  }

  batchAnalyzing.value = true

  try {
    ElMessage.info(`开始批量分析 ${selectedItems.value.length} 条数据...`)

    let successCount = 0
    for (const item of selectedItems.value) {
      try {
        await handleAnalyzeOne(item)
        successCount++
      } catch (error) {
        console.error(`分析失败 (${item.id}):`, error)
      }
    }

    ElMessage.success(`批量分析完成！成功 ${successCount}/${selectedItems.value.length} 条`)
  } finally {
    batchAnalyzing.value = false
  }
}

// 获取情感类型
const getSentimentType = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'success'
    case 'negative':
      return 'danger'
    case 'neutral':
      return 'info'
    default:
      return 'info'
  }
}

// 获取情感文本
const getSentimentText = (sentiment: string) => {
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

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    await dataStore.loadAllData()
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.analysis-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .operation-card {
    .operation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }

      .operation-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }

  .data-list-card {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .content-preview {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pagination {
      display: flex;
      justify-content: center;
      padding: 16px 0;
    }
  }

  .detail-content {
    .original-content {
      background: #f5f7fa;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;

      p {
        margin: 8px 0;
        line-height: 1.6;

        strong {
          color: #606266;
          margin-right: 8px;
        }
      }
    }

    .analysis-results {
      .result-section {
        margin-bottom: 20px;

        h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #606266;
        }

        .sentiment-info {
          display: flex;
          align-items: center;
          gap: 16px;

          .score {
            font-size: 14px;
            color: #909399;
          }
        }

        .keywords {
          display: flex;
          flex-wrap: wrap;
        }

        .summary-text {
          padding: 12px;
          background: #f5f7fa;
          border-radius: 4px;
          line-height: 1.8;
          margin: 0;
        }
      }
    }

    .analysis-actions {
      margin-top: 24px;
      text-align: center;
    }
  }
}
</style>

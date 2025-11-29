<template>
  <div class="data-import-container">
    <!-- 主内容区域 -->
    <div class="content-area">
      <!-- 左侧：数据源管理 -->
      <div class="left-panel">
        <el-card class="data-source-card">
          <template #header>
            <div class="source-header">
              <span>数据源列表</span>
              <el-button type="primary" size="small" :icon="Plus" @click="showAddSourceDialog = true">
                添加
              </el-button>
            </div>
          </template>

          <!-- 数据源列表 -->
          <div class="data-source-list">
            <div
              v-for="source in dataSources"
              :key="source.id"
              class="source-item"
              :class="{ active: selectedSourceId === source.id }"
            >
              <div class="source-content" @click="handleSourceSelect(source.id)">
                <div class="source-info">
                  <el-icon class="source-icon" :color="getSourceColor(source)">
                    <Folder />
                  </el-icon>
                  <div class="source-details">
                    <div class="source-name">{{ source.name }}</div>
                    <div class="source-meta">
                      <span class="source-count">{{ source.count || 0 }} 条</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="source-actions">
                <el-button
                  link
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click.stop="handleDeleteSource(source.id)"
                />
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="dataSources.length === 0"
              description="暂无数据源"
              :image-size="80"
            />
          </div>
        </el-card>
      </div>

      <!-- 右侧：数据管理 -->
      <div class="right-panel">
        <!-- 上传区域 -->
        <el-card v-if="selectedSourceId" class="upload-card">
          <div class="upload-area">
            <el-upload
              ref="uploadRef"
              drag
              :auto-upload="false"
              :show-file-list="false"
              accept=".xlsx,.xls"
              :on-change="handleFileChange"
              :before-upload="beforeUpload"
            >
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-text">
                点击或拖拽上传Excel文件到当前数据源
                <div class="upload-tip">支持.xlsx/.xls格式</div>
              </div>
            </el-upload>

            <!-- 上传进度 -->
            <div v-if="uploadProgress.show" class="upload-progress">
              <div class="progress-info">
                <span>{{ uploadProgress.fileName }}</span>
                <span>{{ uploadProgress.percentage }}%</span>
              </div>
              <el-progress
                :percentage="uploadProgress.percentage"
                :status="uploadProgress.status"
              />
            </div>
          </div>
        </el-card>

        <!-- 筛选区域 -->
        <el-card v-if="selectedSourceId" class="filter-card">
          <div class="filter-area">
            <!-- 数据类型筛选 -->
            <div class="filter-item">
              <span class="filter-label">数据类型：</span>
              <el-radio-group v-model="filterType" @change="handleFilter">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="webmedia">网媒</el-radio-button>
                <el-radio-button label="weibo">微博</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 时间范围筛选 -->
            <div class="filter-item">
              <span class="filter-label">发布时间：</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleFilter"
              />
            </div>

            <!-- 关键词筛选 -->
            <div class="filter-item">
              <span class="filter-label">关键词：</span>
              <el-input
                v-model="filterKeyword"
                placeholder="搜索标题或内容"
                clearable
                @clear="handleFilter"
                @keyup.enter="handleFilter"
              >
                <template #append>
                  <el-button :icon="Search" @click="handleFilter" />
                </template>
              </el-input>
            </div>
          </div>
        </el-card>

        <!-- 主内容区 -->
        <el-card v-if="selectedSourceId" class="main-content-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="数据列表" name="list">
              <div class="tab-header">
                <span>共 {{ filteredData.length }} 条数据</span>
                <div class="header-actions">
                  <el-button-group>
                    <el-button :type="viewMode === 'list' ? 'primary' : ''" size="small" @click="viewMode = 'list'">
                      <el-icon><List /></el-icon>
                    </el-button>
                    <el-button :type="viewMode === 'card' ? 'primary' : ''" size="small" @click="viewMode = 'card'">
                      <el-icon><Grid /></el-icon>
                    </el-button>
                  </el-button-group>
                </div>
              </div>

          <!-- 列表视图 -->
          <div v-if="viewMode === 'list'" class="list-view">
            <el-table :data="displayData" stripe style="width: 100%" height="100%">
              <el-table-column prop="id" label="ID" width="180" />
              <el-table-column label="类型" width="80">
                <template #default="{ row }">
                  <el-tag v-if="isWebMedia(row)" type="primary" size="small">网媒</el-tag>
                  <el-tag v-else type="success" size="small">微博</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="标题/内容" min-width="300">
                <template #default="{ row }">
                  <div class="content-cell">
                    {{ isWebMedia(row) ? row.title : row.content }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="来源" width="150">
                <template #default="{ row }">
                  {{ isWebMedia(row) ? row.source : row.userName }}
                </template>
              </el-table-column>
              <el-table-column label="发布时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.publishTime) }}
                </template>
              </el-table-column>
              <el-table-column label="情感" width="100">
                <template #default="{ row }">
                  <el-tag v-if="row.sentiment" :type="getSentimentType(row.sentiment)" size="small">
                    {{ getSentimentText(row.sentiment) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredData.length"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
              />
            </div>
          </div>

          <!-- 卡片视图 -->
          <div v-else-if="viewMode === 'card'" class="card-view">
            <div class="card-grid">
              <el-card
                v-for="item in displayData"
                :key="item.id"
                class="data-card"
                shadow="hover"
              >
                <div class="card-content">
                  <div class="card-header-info">
                    <el-tag v-if="isWebMedia(item)" type="primary" size="small">网媒</el-tag>
                    <el-tag v-else type="success" size="small">微博</el-tag>
                    <span class="card-time">{{ formatDate(item.publishTime) }}</span>
                  </div>
                  <div class="card-title">
                    {{ isWebMedia(item) ? item.title : item.content.substring(0, 50) + '...' }}
                  </div>
                  <div class="card-meta">
                    <span class="meta-item">
                      <el-icon><User /></el-icon>
                      {{ isWebMedia(item) ? item.source : item.userName }}
                    </span>
                    <span v-if="item.sentiment" class="meta-item">
                      <el-tag :type="getSentimentType(item.sentiment)" size="small">
                        {{ getSentimentText(item.sentiment) }}
                      </el-tag>
                    </span>
                  </div>
                </div>
              </el-card>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[12, 24, 48]"
                layout="total, sizes, prev, pager, next"
                :total="filteredData.length"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
              />
            </div>
          </div>

              <!-- 空状态 -->
              <el-empty
                v-if="displayData.length === 0"
                description="暂无数据"
              />
            </el-tab-pane>

            <!-- 数据统计 -->
            <el-tab-pane label="数据统计" name="statistics">
              <div class="statistics-view">
                <!-- 统计卡片网格 -->
                <div class="stats-grid">
                  <!-- 总览卡片 -->
                  <el-card class="stat-card">
                    <div class="stat-card-header">
                      <span>数据总览</span>
                    </div>
                    <div class="stat-card-body">
                      <div class="stat-item">
                        <div class="stat-label">总条数</div>
                        <div class="stat-value">{{ statsData.total }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">网媒数据</div>
                        <div class="stat-value text-primary">{{ statsData.webmediaCount }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">微博数据</div>
                        <div class="stat-value text-success">{{ statsData.weiboCount }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">时间范围</div>
                        <div class="stat-value small">{{ statsData.timeRange }}</div>
                      </div>
                    </div>
                  </el-card>

                  <!-- 情感分布 -->
                  <el-card class="stat-card">
                    <div class="stat-card-header">
                      <span>情感分布</span>
                    </div>
                    <div class="stat-card-body">
                      <div ref="sentimentChartRef" class="chart-container"></div>
                    </div>
                  </el-card>

                  <!-- 媒体分布（网媒）或用户活跃度（微博） -->
                  <el-card v-if="statsData.webmediaCount > 0" class="stat-card">
                    <div class="stat-card-header">
                      <span>媒体来源分布</span>
                    </div>
                    <div class="stat-card-body">
                      <div ref="mediaChartRef" class="chart-container"></div>
                    </div>
                  </el-card>

                  <el-card v-if="statsData.weiboCount > 0" class="stat-card">
                    <div class="stat-card-header">
                      <span>用户活跃度</span>
                    </div>
                    <div class="stat-card-body">
                      <div ref="userChartRef" class="chart-container"></div>
                    </div>
                  </el-card>

                  <!-- 时间趋势 -->
                  <el-card class="stat-card full-width">
                    <div class="stat-card-header">
                      <span>时间趋势</span>
                    </div>
                    <div class="stat-card-body">
                      <div ref="trendChartRef" class="chart-container-large"></div>
                    </div>
                  </el-card>

                  <!-- 互动数据（微博） -->
                  <el-card v-if="statsData.weiboCount > 0" class="stat-card">
                    <div class="stat-card-header">
                      <span>互动数据</span>
                    </div>
                    <div class="stat-card-body">
                      <div class="stat-item">
                        <div class="stat-label">平均点赞数</div>
                        <div class="stat-value">{{ statsData.avgLike }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">平均评论数</div>
                        <div class="stat-value">{{ statsData.avgComment }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">平均转发数</div>
                        <div class="stat-value">{{ statsData.avgRepost }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">总互动量</div>
                        <div class="stat-value text-primary">{{ statsData.totalInteraction }}</div>
                      </div>
                    </div>
                  </el-card>

                  <!-- 报道倾向（网媒） -->
                  <el-card v-if="statsData.webmediaCount > 0" class="stat-card">
                    <div class="stat-card-header">
                      <span>报道倾向</span>
                    </div>
                    <div class="stat-card-body">
                      <div ref="trendencyChartRef" class="chart-container"></div>
                    </div>
                  </el-card>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 未选择数据源提示 -->
        <el-empty
          v-else
          description="请先选择或添加数据源"
          :image-size="200"
        />
      </div>
    </div>

    <!-- 添加数据源对话框 -->
    <el-dialog
      v-model="showAddSourceDialog"
      title="添加数据源"
      width="400px"
    >
      <el-form :model="newSourceForm" label-width="100px">
        <el-form-item label="数据源名称">
          <el-input
            v-model="newSourceForm.name"
            placeholder="请输入数据源名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddSourceDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddSource">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  UploadFilled,
  Document,
  Delete,
  Search,
  User,
  Folder,
  List,
  Grid
} from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/dataStore'
import { parseExcelFile, convertToWebMediaData, convertToWeiboData } from '@/utils/excel'
import { formatDate, formatFileSize } from '@/utils'
import { isWebMedia } from '@/types'
import type { UploadFile, UploadRawFile } from 'element-plus'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const dataStore = useDataStore()

// 数据源接口
interface DataSource {
  id: string
  name: string
  type?: 'webmedia' | 'weibo'
  count: number
  dataIds: string[]
}

// 上传进度
interface UploadProgress {
  show: boolean
  fileName: string
  percentage: number
  status?: 'success' | 'exception' | 'warning' | ''
}

// 数据源管理
const dataSources = ref<DataSource[]>([])
const selectedSourceId = ref<string>('')
const showAddSourceDialog = ref(false)
const newSourceForm = ref({ name: '' })

// 上传状态
const uploadRef = ref()
const uploadProgress = ref<UploadProgress>({
  show: false,
  fileName: '',
  percentage: 0,
  status: ''
})

// 筛选条件
const filterType = ref<'all' | 'webmedia' | 'weibo'>('all')
const dateRange = ref<[string, string] | null>(null)
const filterKeyword = ref('')

// 视图模式
const viewMode = ref<'list' | 'card'>('list')
const activeTab = ref('list')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 图表ref
const sentimentChartRef = ref()
const mediaChartRef = ref()
const userChartRef = ref()
const trendChartRef = ref()
const trendencyChartRef = ref()

// 当前数据源的所有数据
const currentSourceData = computed(() => {
  if (!selectedSourceId.value) return []

  const source = dataSources.value.find(s => s.id === selectedSourceId.value)
  if (!source || !source.dataIds.length) return []

  // 从store获取所有数据
  dataStore.setDataSource('all')
  return dataStore.allData.filter(item => source.dataIds.includes(item.id))
})

// 过滤后的数据
const filteredData = computed(() => {
  let data = currentSourceData.value

  // 按数据类型筛选
  if (filterType.value === 'webmedia') {
    data = data.filter(item => isWebMedia(item))
  } else if (filterType.value === 'weibo') {
    data = data.filter(item => !isWebMedia(item))
  }

  // 按时间范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    data = data.filter(item => {
      const publishTime = dayjs(item.publishTime).format('YYYY-MM-DD')
      return publishTime >= start && publishTime <= end
    })
  }

  // 按关键词筛选
  if (filterKeyword.value) {
    const keyword = filterKeyword.value.toLowerCase()
    data = data.filter(item => {
      if (isWebMedia(item)) {
        return (
          item.title?.toLowerCase().includes(keyword) ||
          item.content?.toLowerCase().includes(keyword)
        )
      } else {
        return item.content?.toLowerCase().includes(keyword)
      }
    })
  }

  return data
})

// 显示的数据（分页后）
const displayData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 统计数据
const statsData = computed(() => {
  const data = currentSourceData.value

  if (data.length === 0) {
    return {
      total: 0,
      webmediaCount: 0,
      weiboCount: 0,
      timeRange: '-',
      avgLike: 0,
      avgComment: 0,
      avgRepost: 0,
      totalInteraction: 0
    }
  }

  // 分类统计
  const webmediaData = data.filter(item => isWebMedia(item))
  const weiboData = data.filter(item => !isWebMedia(item))

  // 时间范围
  let timeRange = '-'
  if (data.length > 0) {
    const times = data.map(item => dayjs(item.publishTime)).sort((a, b) => a.unix() - b.unix())
    const minTime = times[0]
    const maxTime = times[times.length - 1]
    timeRange = `${minTime.format('YYYY-MM-DD')} 至 ${maxTime.format('YYYY-MM-DD')}`
  }

  // 微博互动数据统计
  let avgLike = 0
  let avgComment = 0
  let avgRepost = 0
  let totalInteraction = 0

  if (weiboData.length > 0) {
    const totalLike = weiboData.reduce((sum, item: any) => sum + (item.likeCount || 0), 0)
    const totalComment = weiboData.reduce((sum, item: any) => sum + (item.commentCount || 0), 0)
    const totalRepost = weiboData.reduce((sum, item: any) => sum + (item.repostCount || 0), 0)

    avgLike = Math.round(totalLike / weiboData.length)
    avgComment = Math.round(totalComment / weiboData.length)
    avgRepost = Math.round(totalRepost / weiboData.length)
    totalInteraction = totalLike + totalComment + totalRepost
  }

  return {
    total: data.length,
    webmediaCount: webmediaData.length,
    weiboCount: weiboData.length,
    timeRange,
    avgLike,
    avgComment,
    avgRepost,
    totalInteraction
  }
})

// 数据源管理函数
const saveDataSources = () => {
  localStorage.setItem('dataSources', JSON.stringify(dataSources.value))
}

const loadDataSources = () => {
  const saved = localStorage.getItem('dataSources')
  if (saved) {
    dataSources.value = JSON.parse(saved)
  }
}

// 添加数据源
const handleAddSource = () => {
  if (!newSourceForm.value.name.trim()) {
    ElMessage.warning('请输入数据源名称')
    return
  }

  const newSource: DataSource = {
    id: `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: newSourceForm.value.name.trim(),
    count: 0,
    dataIds: []
  }

  dataSources.value.push(newSource)
  saveDataSources()

  showAddSourceDialog.value = false
  newSourceForm.value.name = ''

  // 自动选中新添加的数据源
  selectedSourceId.value = newSource.id

  ElMessage.success('数据源添加成功')
}

// 选择数据源
const handleSourceSelect = (sourceId: string) => {
  selectedSourceId.value = sourceId
  currentPage.value = 1
  // 重置筛选条件
  filterType.value = 'all'
  dateRange.value = null
  filterKeyword.value = ''
}

// 删除数据源
const handleDeleteSource = async (sourceId: string) => {
  ElMessageBox.confirm(
    '确定要删除该数据源吗？相关数据也会被删除，此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    const source = dataSources.value.find(s => s.id === sourceId)
    if (!source) return

    try {
      // 删除相关数据
      if (source.dataIds.length > 0) {
        // 根据数据类型批量删除
        const webmediaIds: string[] = []
        const weiboIds: string[] = []

        // 获取所有数据
        dataStore.setDataSource('all')
        const allData = dataStore.allData

        source.dataIds.forEach(id => {
          const item = allData.find(d => d.id === id)
          if (item) {
            if (isWebMedia(item)) {
              webmediaIds.push(id)
            } else {
              weiboIds.push(id)
            }
          }
        })

        if (webmediaIds.length > 0) {
          await dataStore.bulkDeleteWebMediaData(webmediaIds)
        }
        if (weiboIds.length > 0) {
          await dataStore.bulkDeleteWeiboData(weiboIds)
        }
      }

      // 删除数据源
      const index = dataSources.value.findIndex(s => s.id === sourceId)
      if (index > -1) {
        dataSources.value.splice(index, 1)
      }

      saveDataSources()

      // 如果删除的是当前选中的数据源，清空选择
      if (selectedSourceId.value === sourceId) {
        selectedSourceId.value = ''
      }

      ElMessage.success('数据源删除成功')
    } catch (error) {
      console.error('删除数据源失败：', error)
      ElMessage.error('删除数据源失败')
    }
  }).catch(() => {
    // 取消
  })
}

// 文件上传前校验
const beforeUpload = (rawFile: UploadRawFile) => {
  // 检查是否选择了数据源
  if (!selectedSourceId.value) {
    ElMessage.error('请先选择数据源')
    return false
  }

  // 检查文件格式
  const isExcel = rawFile.name.endsWith('.xlsx') || rawFile.name.endsWith('.xls')
  if (!isExcel) {
    ElMessage.error('只支持上传.xlsx或.xls格式的Excel文件！')
    return false
  }

  // 检查文件大小（限制50MB）
  const isLt50M = rawFile.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过50MB！')
    return false
  }

  return true
}

// 文件选择变化 - 立即导入
const handleFileChange = async (file: UploadFile) => {
  if (!file.raw || !selectedSourceId.value) return

  const source = dataSources.value.find(s => s.id === selectedSourceId.value)
  if (!source) return

  // 显示上传进度
  uploadProgress.value = {
    show: true,
    fileName: file.name,
    percentage: 0,
    status: ''
  }

  try {
    uploadProgress.value.percentage = 20

    // 解析Excel文件
    const rawData = await parseExcelFile(file.raw)

    if (rawData.length === 0) {
      throw new Error('文件为空')
    }

    uploadProgress.value.percentage = 40

    // 根据"媒体渠道"字段判断数据类型
    const firstRow = rawData[0]
    const mediaChannel = firstRow['媒体渠道'] || firstRow['channel'] || firstRow['source']

    let dataType: 'webmedia' | 'weibo'
    if (mediaChannel && mediaChannel.toString().includes('微博')) {
      dataType = 'weibo'
    } else {
      dataType = 'webmedia'
    }

    uploadProgress.value.percentage = 60

    // 转换并导入数据
    let data
    let dataIds: string[] = []

    if (dataType === 'webmedia') {
      data = convertToWebMediaData(rawData)
      await dataStore.addWebMediaData(data)
      dataIds = data.map(d => d.id)
    } else {
      data = convertToWeiboData(rawData)
      await dataStore.addWeiboData(data)
      dataIds = data.map(d => d.id)
    }

    uploadProgress.value.percentage = 80

    // 更新数据源
    source.type = dataType
    source.dataIds.push(...dataIds)
    source.count = source.dataIds.length

    saveDataSources()

    uploadProgress.value.percentage = 100
    uploadProgress.value.status = 'success'

    ElMessage.success(`成功导入 ${data.length} 条数据`)

    // 清空上传组件
    uploadRef.value?.clearFiles()

    // 延迟隐藏进度条
    setTimeout(() => {
      uploadProgress.value.show = false
    }, 2000)
  } catch (error: any) {
    console.error('导入失败：', error)
    uploadProgress.value.status = 'exception'
    ElMessage.error(error.message || '导入失败，请检查文件格式')

    // 延迟隐藏进度条
    setTimeout(() => {
      uploadProgress.value.show = false
    }, 2000)
  }
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1
}

// 分页处理
const handleSizeChange = () => {
  currentPage.value = 1
}

const handlePageChange = () => {
  // 页码改变
}

// 获取数据源颜色
const getSourceColor = (source: DataSource) => {
  if (!source.type) return '#909399'
  return source.type === 'webmedia' ? '#409eff' : '#67c23a'
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

// 渲染图表
const renderCharts = () => {
  if (activeTab.value !== 'statistics') return

  nextTick(() => {
    renderSentimentChart()
    renderMediaChart()
    renderUserChart()
    renderTrendChart()
    renderTrendencyChart()
  })
}

// 情感分布图表
const renderSentimentChart = () => {
  if (!sentimentChartRef.value) return

  const data = currentSourceData.value
  const positive = data.filter(item => item.sentiment === 'positive').length
  const neutral = data.filter(item => item.sentiment === 'neutral').length
  const negative = data.filter(item => item.sentiment === 'negative').length

  const chart = echarts.init(sentimentChartRef.value)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '0',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: positive, name: '正面', itemStyle: { color: '#67c23a' } },
          { value: neutral, name: '中性', itemStyle: { color: '#909399' } },
          { value: negative, name: '负面', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 媒体分布图表
const renderMediaChart = () => {
  if (!mediaChartRef.value || statsData.value.webmediaCount === 0) return

  const data = currentSourceData.value.filter(item => isWebMedia(item))
  const sourceMap = new Map<string, number>()

  data.forEach((item: any) => {
    const source = item.source || '未知'
    sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
  })

  const sortedSources = Array.from(sourceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const chart = echarts.init(mediaChartRef.value)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: sortedSources.map(([name]) => name)
    },
    series: [
      {
        type: 'bar',
        data: sortedSources.map(([, count]) => count),
        itemStyle: { color: '#409eff' }
      }
    ]
  }
  chart.setOption(option)
}

// 用户活跃度图表
const renderUserChart = () => {
  if (!userChartRef.value || statsData.value.weiboCount === 0) return

  const data = currentSourceData.value.filter(item => !isWebMedia(item))
  const userMap = new Map<string, number>()

  data.forEach((item: any) => {
    const user = item.userName || '未知'
    userMap.set(user, (userMap.get(user) || 0) + 1)
  })

  const sortedUsers = Array.from(userMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const chart = echarts.init(userChartRef.value)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: sortedUsers.map(([name]) => name)
    },
    series: [
      {
        type: 'bar',
        data: sortedUsers.map(([, count]) => count),
        itemStyle: { color: '#67c23a' }
      }
    ]
  }
  chart.setOption(option)
}

// 时间趋势图表
const renderTrendChart = () => {
  if (!trendChartRef.value) return

  const data = currentSourceData.value
  const dateMap = new Map<string, number>()

  data.forEach(item => {
    const date = dayjs(item.publishTime).format('YYYY-MM-DD')
    dateMap.set(date, (dateMap.get(date) || 0) + 1)
  })

  const sortedDates = Array.from(dateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const chart = echarts.init(trendChartRef.value)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedDates.map(([date]) => date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'line',
        data: sortedDates.map(([, count]) => count),
        smooth: true,
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

// 报道倾向图表
const renderTrendencyChart = () => {
  if (!trendencyChartRef.value || statsData.value.webmediaCount === 0) return

  const data = currentSourceData.value.filter(item => isWebMedia(item))
  const positive = data.filter(item => item.sentiment === 'positive').length
  const neutral = data.filter(item => item.sentiment === 'neutral').length
  const negative = data.filter(item => item.sentiment === 'negative').length

  const chart = echarts.init(trendencyChartRef.value)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: [
          { value: positive, name: '正面报道', itemStyle: { color: '#67c23a' } },
          { value: neutral, name: '中性报道', itemStyle: { color: '#909399' } },
          { value: negative, name: '负面报道', itemStyle: { color: '#f56c6c' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

// 监听tab切换
watch(activeTab, (newTab) => {
  if (newTab === 'statistics') {
    renderCharts()
  }
})

// 监听数据源切换
watch(selectedSourceId, () => {
  if (activeTab.value === 'statistics') {
    renderCharts()
  }
})

// 初始化
onMounted(async () => {
  await dataStore.loadAllData()
  loadDataSources()
})
</script>

<style lang="scss" scoped>
.data-import-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .content-area {
    flex: 1;
    display: flex;
    gap: 20px;
    overflow: hidden;

    .left-panel {
      width: 280px;
      flex-shrink: 0;

      .data-source-card {
        height: 100%;
        display: flex;
        flex-direction: column;

        :deep(.el-card__body) {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .source-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .data-source-list {
          flex: 1;
          overflow-y: auto;

          .source-item {
            margin-bottom: 8px;
            border-radius: 4px;
            border: 1px solid transparent;
            transition: all 0.3s;

            &:hover {
              background-color: #f5f7fa;
            }

            &.active {
              background-color: #ecf5ff;
              border-color: #409eff;
            }

            .source-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px;
              cursor: pointer;
            }

            .source-info {
              display: flex;
              align-items: center;
              gap: 10px;
              flex: 1;
              min-width: 0;

              .source-icon {
                font-size: 20px;
                flex-shrink: 0;
              }

              .source-details {
                flex: 1;
                min-width: 0;

                .source-name {
                  font-size: 14px;
                  font-weight: 500;
                  color: #303133;
                  margin-bottom: 4px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                .source-meta {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 12px;

                  .source-count {
                    color: #909399;
                  }
                }
              }
            }

            .source-actions {
              padding: 0 12px 8px 12px;
              border-top: 1px solid #e4e7ed;
            }
          }
        }
      }
    }

    .right-panel {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .upload-card {
        .upload-area {
          :deep(.el-upload) {
            width: 100%;
          }

          :deep(.el-upload-dragger) {
            width: 100%;
            padding: 30px 20px;
          }

          .upload-icon {
            font-size: 48px;
            color: #409eff;
            margin-bottom: 10px;
          }

          .upload-text {
            font-size: 14px;
            color: #606266;

            .upload-tip {
              font-size: 12px;
              color: #909399;
              margin-top: 4px;
            }
          }

          .upload-progress {
            margin-top: 16px;

            .progress-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
              color: #606266;
            }
          }
        }
      }

      .filter-card {
        .filter-area {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;

          .filter-item {
            display: flex;
            align-items: center;
            gap: 8px;

            .filter-label {
              font-size: 14px;
              color: #606266;
              white-space: nowrap;
            }
          }
        }
      }

      .main-content-card {
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

        :deep(.el-tabs) {
          display: flex;
          flex-direction: column;
          height: 100%;

          .el-tabs__content {
            flex: 1;
            overflow: hidden;

            .el-tab-pane {
              height: 100%;
              overflow-y: auto;
            }
          }
        }

        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }

        .list-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;

          .content-cell {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .card-view {
          flex: 1;
          overflow-y: auto;

          .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;
            margin-bottom: 20px;

            .data-card {
              .card-content {
                .card-header-info {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 12px;

                  .card-time {
                    font-size: 12px;
                    color: #909399;
                  }
                }

                .card-title {
                  font-size: 14px;
                  font-weight: 500;
                  color: #303133;
                  margin-bottom: 12px;
                  line-height: 1.5;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }

                .card-meta {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 12px;
                  color: #909399;

                  .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                  }
                }
              }
            }
          }
        }

        .pagination {
          display: flex;
          justify-content: center;
          padding: 16px 0;
        }

        // 统计视图
        .statistics-view {
          height: 100%;

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            .stat-card {
              &.full-width {
                grid-column: 1 / -1;
              }

              .stat-card-header {
                font-size: 16px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 16px;
              }

              .stat-card-body {
                .stat-item {
                  margin-bottom: 12px;

                  .stat-label {
                    font-size: 14px;
                    color: #909399;
                    margin-bottom: 4px;
                  }

                  .stat-value {
                    font-size: 24px;
                    font-weight: 600;
                    color: #303133;

                    &.text-primary {
                      color: #409eff;
                    }

                    &.text-success {
                      color: #67c23a;
                    }

                    &.small {
                      font-size: 14px;
                      font-weight: 400;
                    }
                  }
                }

                .chart-container {
                  width: 100%;
                  height: 200px;
                }

                .chart-container-large {
                  width: 100%;
                  height: 300px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

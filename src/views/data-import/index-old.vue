<template>
  <div class="data-import-container">
    <!-- 头部导入区域 -->
    <el-card class="upload-card compact">
      <div class="upload-area-compact">
        <!-- 统一上传入口 -->
        <el-upload
          ref="uploadRef"
          class="upload-compact"
          drag
          multiple
          :auto-upload="false"
          :show-file-list="false"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
        >
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">
            点击或拖拽上传Excel文件
            <div class="upload-tip">支持.xlsx/.xls格式，自动识别网媒/微博数据</div>
          </div>
        </el-upload>

        <!-- 上传中提示 -->
        <div v-if="uploading" class="uploading-status">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在导入数据...</span>
        </div>
      </div>
    </el-card>

    <!-- 主内容区域 -->
    <div class="content-area">
      <!-- 左侧：数据源管理 -->
      <div class="left-panel">
        <el-card class="data-source-card">
          <template #header>
            <span>数据源管理</span>
          </template>

          <!-- 数据源列表 -->
          <div class="data-source-list">
            <!-- 全部数据源 -->
            <div
              class="source-item"
              :class="{ active: selectedSourceId === 'all' }"
            >
              <div class="source-content" @click="handleSourceSelect('all')">
                <div class="source-info">
                  <el-icon class="source-icon"><DataBoard /></el-icon>
                  <span class="source-name">全部数据</span>
                </div>
                <el-tag type="info" size="small">{{ statistics.total }}</el-tag>
              </div>
            </div>

            <el-divider v-if="dataSources.length > 0" style="margin: 10px 0" />

            <!-- 已导入的数据源 -->
            <div
              v-for="source in dataSources"
              :key="source.id"
              class="source-item"
              :class="{ active: selectedSourceId === source.id }"
            >
              <div class="source-content" @click="handleSourceSelect(source.id)">
                <div class="source-info">
                  <el-icon class="source-icon" :color="source.type === 'webmedia' ? '#409eff' : '#67c23a'">
                    <Document />
                  </el-icon>
                  <div class="source-details">
                    <div class="source-name">{{ source.name }}</div>
                    <div class="source-meta">
                      <el-tag v-if="source.type === 'webmedia'" type="primary" size="small">网媒</el-tag>
                      <el-tag v-else type="success" size="small">微博</el-tag>
                      <span class="source-time">{{ formatDate(source.importTime) }}</span>
                    </div>
                  </div>
                </div>
                <el-tag type="info" size="small">{{ source.count }}</el-tag>
              </div>
              <div class="source-actions">
                <el-button
                  link
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click.stop="handleDeleteSource(source.id)"
                >
                  删除
                </el-button>
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

      <!-- 右侧：数据列表 -->
      <div class="right-panel">
        <el-card class="data-list-card">
          <template #header>
            <div class="list-header">
              <span>数据列表</span>
              <div class="header-actions">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索内容..."
                  :prefix-icon="Search"
                  clearable
                  style="width: 240px; margin-right: 10px;"
                  @input="handleSearch"
                />
                <el-select
                  v-model="viewMode"
                  placeholder="视图模式"
                  style="width: 120px;"
                >
                  <el-option label="列表视图" value="list" />
                  <el-option label="卡片视图" value="card" />
                  <el-option label="时间轴" value="timeline" />
                </el-select>
              </div>
            </div>
          </template>

          <!-- 列表视图 -->
          <div v-if="viewMode === 'list'" class="list-view">
            <el-table
              :data="displayData"
              stripe
              style="width: 100%"
              v-loading="loading"
            >
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="id" label="ID" width="150" />
              <el-table-column label="类型" width="100">
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
                  <el-tag
                    v-if="row.sentiment"
                    :type="getSentimentType(row.sentiment)"
                    size="small"
                  >
                    {{ getSentimentText(row.sentiment) }}
                  </el-tag>
                  <span v-else style="color: #909399;">-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleView(row)">
                    查看
                  </el-button>
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

          <!-- 时间轴视图 -->
          <div v-else-if="viewMode === 'timeline'" class="timeline-view">
            <el-timeline>
              <el-timeline-item
                v-for="item in displayData"
                :key="item.id"
                :timestamp="formatDate(item.publishTime)"
                placement="top"
              >
                <el-card>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <el-tag v-if="isWebMedia(item)" type="primary" size="small">网媒</el-tag>
                      <el-tag v-else type="success" size="small">微博</el-tag>
                      <span class="timeline-source">
                        {{ isWebMedia(item) ? item.source : item.userName }}
                      </span>
                    </div>
                    <div class="timeline-title">
                      {{ isWebMedia(item) ? item.title : item.content.substring(0, 100) + '...' }}
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 30]"
                layout="total, sizes, prev, pager, next"
                :total="filteredData.length"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
              />
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty
            v-if="displayData.length === 0 && !loading"
            description="暂无数据，请先导入数据"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UploadFilled,
  Document,
  Close,
  Delete,
  Search,
  DataBoard,
  Promotion,
  ChatLineSquare,
  User,
  Upload,
  Loading,
  Select,
  CircleClose,
  Warning
} from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/dataStore'
import { parseExcelFile, convertToWebMediaData, convertToWeiboData } from '@/utils/excel'
import { formatDate, formatFileSize } from '@/utils'
import { isWebMedia } from '@/types'
import type { UploadFile, UploadRawFile } from 'element-plus'

const dataStore = useDataStore()

// 数据源接口
interface DataSource {
  id: string
  name: string
  type: 'webmedia' | 'weibo'
  count: number
  importTime: string
  dataIds: string[] // 存储该数据源对应的数据ID列表
}

// 上传状态
const uploadRef = ref()
const uploading = ref(false)

// 数据源管理
const dataSources = ref<DataSource[]>([])
const selectedSourceId = ref<string>('all')

// 搜索和筛选
const searchKeyword = ref('')
const viewMode = ref<'list' | 'card' | 'timeline'>('list')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 加载状态
const loading = ref(false)

// 统计数据
const statistics = computed(() => dataStore.statistics)

// 当前数据源的数据
const currentData = computed(() => {
  if (selectedSourceId.value === 'all') {
    // 显示所有数据
    dataStore.setDataSource('all')
    return dataStore.allData
  } else {
    // 根据数据源ID过滤数据
    const source = dataSources.value.find(s => s.id === selectedSourceId.value)
    if (!source) return []

    // 获取该数据源的数据
    dataStore.setDataSource('all')
    return dataStore.allData.filter(item => source.dataIds.includes(item.id))
  }
})

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchKeyword.value) {
    return currentData.value
  }

  return currentData.value.filter(item => {
    const searchText = searchKeyword.value.toLowerCase()
    if (isWebMedia(item)) {
      return (
        item.title?.toLowerCase().includes(searchText) ||
        item.content?.toLowerCase().includes(searchText) ||
        item.source?.toLowerCase().includes(searchText)
      )
    } else {
      return (
        item.content?.toLowerCase().includes(searchText) ||
        item.userName?.toLowerCase().includes(searchText)
      )
    }
  })
})

// 显示的数据（分页后）
const displayData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 文件上传前校验
const beforeUpload = (rawFile: UploadRawFile) => {
  // 检查文件格式
  const isExcel = rawFile.name.endsWith('.xlsx') || rawFile.name.endsWith('.xls')
  if (!isExcel) {
    ElMessage.error('只支持上传.xlsx或.xls格式的Excel文件！')
    return false
  }

  // 检查文件大小（限制50MB）
  const isLt50M = rawFile.size / 1024 / 1024 < 500
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过50MB！')
    return false
  }

  return true
}

// 文件选择变化 - 立即导入
const handleFileChange = async (file: UploadFile) => {
  if (!file.raw) return

  uploading.value = true

  try {
    // 解析Excel文件
    const rawData = await parseExcelFile(file.raw)

    if (rawData.length === 0) {
      ElMessage.error('文件为空')
      return
    }

    // 根据"媒体渠道"字段判断数据类型
    const firstRow = rawData[0]
    const mediaChannel = firstRow['媒体渠道'] || firstRow['channel'] || firstRow['source']

    let dataType: 'webmedia' | 'weibo'

    // 如果媒体渠道是"微博"，则是微博数据，否则是网媒数据
    if (mediaChannel && mediaChannel.toString().includes('微博')) {
      dataType = 'weibo'
    } else {
      dataType = 'webmedia'
    }

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

    // 创建数据源
    const newSource: DataSource = {
      id: `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: dataType,
      count: data.length,
      importTime: new Date().toISOString(),
      dataIds
    }

    dataSources.value.push(newSource)

    // 保存数据源到 localStorage
    saveDataSources()

    ElMessage.success(`成功导入 ${data.length} 条数据`)

    // 清空上传组件
    uploadRef.value?.clearFiles()
  } catch (error: any) {
    console.error('导入失败：', error)
    ElMessage.error(error.message || '导入失败，请检查文件格式')
  } finally {
    uploading.value = false
  }
}

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

// 选择数据源
const handleSourceSelect = (sourceId: string) => {
  selectedSourceId.value = sourceId
  currentPage.value = 1
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
      // 批量删除相关数据
      if (source.type === 'webmedia') {
        await dataStore.bulkDeleteWebMediaData(source.dataIds)
      } else {
        await dataStore.bulkDeleteWeiboData(source.dataIds)
      }

      // 删除数据源
      const index = dataSources.value.findIndex(s => s.id === sourceId)
      if (index > -1) {
        dataSources.value.splice(index, 1)
      }

      // 保存数据源
      saveDataSources()

      // 如果删除的是当前选中的数据源，切换到全部
      if (selectedSourceId.value === sourceId) {
        selectedSourceId.value = 'all'
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

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 分页
const handleSizeChange = () => {
  currentPage.value = 1
}

const handlePageChange = () => {
  // 页码改变时自动滚动到顶部
}

// 查看详情
const handleView = (row: any) => {
  ElMessageBox.alert(
    `<div style="max-height: 400px; overflow-y: auto;">
      <p><strong>ID:</strong> ${row.id}</p>
      <p><strong>类型:</strong> ${isWebMedia(row) ? '网媒' : '微博'}</p>
      ${isWebMedia(row) ? `<p><strong>标题:</strong> ${row.title}</p>` : ''}
      <p><strong>内容:</strong> ${row.content}</p>
      <p><strong>来源:</strong> ${isWebMedia(row) ? row.source : row.userName}</p>
      <p><strong>发布时间:</strong> ${formatDate(row.publishTime)}</p>
    </div>`,
    '详情',
    {
      confirmButtonText: '关闭',
      dangerouslyUseHTMLString: true
    }
  )
}

// 清空数据
const handleClearData = async () => {
  ElMessageBox.confirm(
    '确定要清空所有数据吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    await dataStore.clearAllData()
    ElMessage.success('数据已清空')
  }).catch(() => {
    // 取消
  })
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
    loadDataSources()
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.data-import-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .upload-card.compact {
    .upload-area-compact {
      display: flex;
      align-items: center;
      gap: 20px;

      .upload-compact {
        flex: 1;

        :deep(.el-upload) {
          width: 100%;
        }

        :deep(.el-upload-dragger) {
          padding: 20px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 15px;
          text-align: left;
        }

        .upload-icon {
          font-size: 32px;
          color: #409eff;
        }

        .upload-text {
          flex: 1;
          font-size: 14px;
          color: #606266;

          .upload-tip {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }

      .uploading-status {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #409eff;
        font-size: 14px;

        .is-loading {
          animation: rotating 2s linear infinite;
        }
      }
    }
  }

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

        .data-source-list {
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

                  .source-time {
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

      .data-list-card {
        height: 100%;
        display: flex;
        flex-direction: column;

        :deep(.el-card__body) {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .header-actions {
            display: flex;
            align-items: center;
          }
        }

        .list-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;

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
              cursor: pointer;
              transition: transform 0.3s;

              &:hover {
                transform: translateY(-4px);
              }

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
                  font-size: 15px;
                  font-weight: 500;
                  margin-bottom: 12px;
                  line-height: 1.5;
                  color: #303133;
                }

                .card-meta {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 13px;
                  color: #606266;

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

        .timeline-view {
          flex: 1;
          overflow-y: auto;
          padding: 20px 0;

          .timeline-content {
            .timeline-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;

              .timeline-source {
                font-size: 13px;
                color: #606266;
              }
            }

            .timeline-title {
              font-size: 14px;
              line-height: 1.6;
              color: #303133;
            }
          }
        }

        .pagination {
          display: flex;
          justify-content: center;
          padding: 20px 0;
          margin-top: auto;
        }
      }
    }
  }
}
</style>

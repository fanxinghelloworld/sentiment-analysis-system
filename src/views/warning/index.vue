<template>
  <div class="warning-container">
    <!-- 顶部统计 -->
    <div class="stats-section">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon" color="#f56c6c"><Warning /></el-icon>
          <div class="stat-info">
            <div class="stat-label">未处理预警</div>
            <div class="stat-value">{{ warningStore.unhandledCount }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon" color="#e6a23c"><BellFilled /></el-icon>
          <div class="stat-info">
            <div class="stat-label">严重预警</div>
            <div class="stat-value">{{ warningStore.recordsByLevel.high.length }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon" color="#409eff"><Setting /></el-icon>
          <div class="stat-info">
            <div class="stat-label">启用规则</div>
            <div class="stat-value">{{ warningStore.activeRules.length }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon" color="#67c23a"><Check /></el-icon>
          <div class="stat-info">
            <div class="stat-label">今日预警</div>
            <div class="stat-value">{{ todayWarningsCount }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区 -->
    <el-tabs v-model="activeTab" type="border-card" class="warning-tabs">
      <!-- 预警规则 Tab -->
      <el-tab-pane label="预警规则" name="rules">
        <div class="tab-header">
          <el-button type="primary" @click="showAddRuleDialog">
            <el-icon><Plus /></el-icon>
            新增规则
          </el-button>
        </div>

        <el-table
          :data="warningStore.rules"
          style="width: 100%"
          v-loading="warningStore.loading"
        >
          <el-table-column prop="name" label="规则名称" width="200" />
          <el-table-column prop="type" label="规则类型" width="140">
            <template #default="{ row }">
              <el-tag :type="getRuleTypeTagType(row.type)">
                {{ getRuleTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="预警级别" width="120">
            <template #default="{ row }">
              <el-tag :type="getLevelTagType(row.level)">
                {{ getLevelName(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="规则配置" min-width="250">
            <template #default="{ row }">
              <div class="rule-config">
                <span v-if="row.config.keywords">
                  关键词: {{ row.config.keywords.join(', ') }}
                </span>
                <span v-if="row.config.sentimentThreshold">
                  情感阈值: {{ row.config.sentimentThreshold }}%
                </span>
                <span v-if="row.config.volumeThreshold">
                  数量阈值: {{ row.config.volumeThreshold }}条
                </span>
                <span v-if="row.config.speedThreshold">
                  速度阈值: {{ row.config.speedThreshold }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态" width="100">
            <template #default="{ row }">
              <el-switch
                v-model="row.enabled"
                @change="toggleRule(row.id)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                link
                @click="editRule(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                link
                @click="deleteRule(row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 预警记录 Tab -->
      <el-tab-pane label="预警记录" name="records">
        <div class="tab-header">
          <el-radio-group v-model="recordFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="unhandled">未处理</el-radio-button>
            <el-radio-button label="processing">处理中</el-radio-button>
            <el-radio-button label="resolved">已解决</el-radio-button>
          </el-radio-group>

          <el-select v-model="levelFilter" placeholder="预警级别" size="small" clearable>
            <el-option label="全部级别" value="" />
            <el-option label="严重" value="high" />
            <el-option label="警告" value="medium" />
            <el-option label="提示" value="low" />
          </el-select>
        </div>

        <el-table
          :data="filteredRecords"
          style="width: 100%"
          v-loading="warningStore.loading"
        >
          <el-table-column prop="createdAt" label="触发时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="ruleName" label="规则名称" width="180" />
          <el-table-column prop="level" label="预警级别" width="120">
            <template #default="{ row }">
              <el-tag :type="getLevelTagType(row.level)">
                {{ getLevelName(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="预警原因" min-width="300" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                link
                @click="viewWarningDetail(row)"
              >
                查看详情
              </el-button>
              <el-dropdown @command="(cmd) => handleWarningAction(row.id, cmd)">
                <el-button type="primary" size="small" link>
                  处理<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="processing">标记为处理中</el-dropdown-item>
                    <el-dropdown-item command="resolved">标记为已解决</el-dropdown-item>
                    <el-dropdown-item command="ignored">忽略</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 预警统计 Tab -->
      <el-tab-pane label="预警统计" name="statistics">
        <div class="statistics-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <template #header>
                  <span>预警趋势</span>
                </template>
                <div ref="trendChartRef" style="width: 100%; height: 300px;"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>
                  <span>预警级别分布</span>
                </template>
                <div ref="levelChartRef" style="width: 100%; height: 300px;"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12">
              <el-card>
                <template #header>
                  <span>预警类型分布</span>
                </template>
                <div ref="typeChartRef" style="width: 100%; height: 300px;"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>
                  <span>处理状态分布</span>
                </template>
                <div ref="statusChartRef" style="width: 100%; height: 300px;"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑规则对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="isEditMode ? '编辑规则' : '新增规则'"
      width="600px"
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleFormRules"
        label-width="120px"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>

        <el-form-item label="规则类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择规则类型" style="width: 100%">
            <el-option label="关键词预警" value="keyword" />
            <el-option label="情感阈值预警" value="sentiment" />
            <el-option label="舆情量激增预警" value="volume" />
            <el-option label="传播速度预警" value="speed" />
          </el-select>
        </el-form-item>

        <el-form-item label="预警级别" prop="level">
          <el-select v-model="ruleForm.level" placeholder="请选择预警级别" style="width: 100%">
            <el-option label="严重" value="high" />
            <el-option label="警告" value="medium" />
            <el-option label="提示" value="low" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="ruleForm.type === 'keyword'" label="关键词" prop="keywords">
          <el-input
            v-model="keywordsInput"
            type="textarea"
            :rows="3"
            placeholder="请输入关键词，多个关键词用逗号分隔"
          />
        </el-form-item>

        <el-form-item
          v-if="ruleForm.type === 'sentiment'"
          label="负面情感阈值"
          prop="sentimentThreshold"
        >
          <el-input-number
            v-model="ruleForm.config.sentimentThreshold"
            :min="0"
            :max="100"
            placeholder="负面情感占比超过此值时触发预警"
          />
          <span style="margin-left: 10px;">%</span>
        </el-form-item>

        <el-form-item
          v-if="ruleForm.type === 'volume'"
          label="数量阈值"
          prop="volumeThreshold"
        >
          <el-input-number
            v-model="ruleForm.config.volumeThreshold"
            :min="1"
            placeholder="短时间内舆情数量超过此值时触发"
          />
          <span style="margin-left: 10px;">条</span>
        </el-form-item>

        <el-form-item
          v-if="ruleForm.type === 'speed'"
          label="速度阈值"
          prop="speedThreshold"
        >
          <el-input-number
            v-model="ruleForm.config.speedThreshold"
            :min="1"
            placeholder="转发/评论速度超过此值时触发"
          />
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="ruleForm.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>

    <!-- 预警详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="预警详情"
      width="700px"
    >
      <div v-if="currentWarning" class="warning-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="触发时间">
            {{ formatTime(currentWarning.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="规则名称">
            {{ currentWarning.ruleName }}
          </el-descriptions-item>
          <el-descriptions-item label="预警级别">
            <el-tag :type="getLevelTagType(currentWarning.level)">
              {{ getLevelName(currentWarning.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="数据类型">
            {{ currentWarning.dataType === 'webmedia' ? '网媒' : '微博' }}
          </el-descriptions-item>
          <el-descriptions-item label="预警原因" :span="2">
            {{ currentWarning.reason }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentWarning.aiSuggestion" label="AI建议" :span="2">
            <div class="ai-suggestion">
              {{ currentWarning.aiSuggestion }}
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-actions">
          <el-button type="primary" @click="handleWarningAction(currentWarning.id, 'processing')">
            标记为处理中
          </el-button>
          <el-button type="success" @click="handleWarningAction(currentWarning.id, 'resolved')">
            标记为已解决
          </el-button>
          <el-button @click="handleWarningAction(currentWarning.id, 'ignored')">
            忽略此预警
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Warning,
  BellFilled,
  Setting,
  Check,
  Plus,
  ArrowDown
} from '@element-plus/icons-vue'
import { useWarningStore } from '@/stores/warningStore'
import type { WarningRule, WarningRecord } from '@/types'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

const warningStore = useWarningStore()

// Tab控制
const activeTab = ref('rules')

// 预警记录筛选
const recordFilter = ref('all')
const levelFilter = ref('')

// 对话框控制
const ruleDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEditMode = ref(false)

// 表单
const ruleFormRef = ref<FormInstance>()
const ruleForm = ref<Partial<WarningRule>>({
  name: '',
  type: 'keyword',
  level: 'medium',
  enabled: true,
  config: {}
})

const keywordsInput = ref('')

const ruleFormRules: FormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择预警级别', trigger: 'change' }]
}

// 当前查看的预警
const currentWarning = ref<WarningRecord | null>(null)

// 图表refs
const trendChartRef = ref()
const levelChartRef = ref()
const typeChartRef = ref()
const statusChartRef = ref()

// 计算属性
const todayWarningsCount = computed(() => {
  const today = dayjs().startOf('day')
  return warningStore.records.filter(r =>
    dayjs(r.createdAt).isAfter(today)
  ).length
})

const filteredRecords = computed(() => {
  let records = warningStore.records

  // 按状态筛选
  if (recordFilter.value !== 'all') {
    records = records.filter(r => r.status === recordFilter.value)
  }

  // 按级别筛选
  if (levelFilter.value) {
    records = records.filter(r => r.level === levelFilter.value)
  }

  return records
})

// 辅助函数
const getRuleTypeName = (type: string) => {
  const names: Record<string, string> = {
    keyword: '关键词预警',
    sentiment: '情感阈值',
    volume: '舆情量激增',
    speed: '传播速度'
  }
  return names[type] || type
}

const getRuleTypeTagType = (type: string) => {
  const types: Record<string, any> = {
    keyword: 'warning',
    sentiment: 'danger',
    volume: 'info',
    speed: 'success'
  }
  return types[type] || ''
}

const getLevelName = (level: string) => {
  const names: Record<string, string> = {
    high: '严重',
    medium: '警告',
    low: '提示'
  }
  return names[level] || level
}

const getLevelTagType = (level: string) => {
  const types: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level] || ''
}

const getStatusName = (status: string) => {
  const names: Record<string, string> = {
    unhandled: '未处理',
    processing: '处理中',
    resolved: '已解决',
    ignored: '已忽略'
  }
  return names[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, any> = {
    unhandled: 'danger',
    processing: 'warning',
    resolved: 'success',
    ignored: 'info'
  }
  return types[status] || ''
}

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 规则管理
const showAddRuleDialog = () => {
  isEditMode.value = false
  ruleForm.value = {
    name: '',
    type: 'keyword',
    level: 'medium',
    enabled: true,
    config: {}
  }
  keywordsInput.value = ''
  ruleDialogVisible.value = true
}

const editRule = (rule: WarningRule) => {
  isEditMode.value = true
  ruleForm.value = { ...rule }
  keywordsInput.value = rule.config.keywords?.join(',') || ''
  ruleDialogVisible.value = true
}

const saveRule = async () => {
  if (!ruleFormRef.value) return

  await ruleFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      // 处理关键词
      if (ruleForm.value.type === 'keyword' && keywordsInput.value) {
        ruleForm.value.config.keywords = keywordsInput.value
          .split(',')
          .map(k => k.trim())
          .filter(k => k)
      }

      // 构建配置对象（普通对象，非响应式）
      const config: WarningRule['config'] = {}

      if (ruleForm.value.type === 'keyword' && ruleForm.value.config.keywords) {
        config.keywords = [...ruleForm.value.config.keywords]
      }
      if (ruleForm.value.config.sentimentThreshold !== undefined) {
        config.sentimentThreshold = Number(ruleForm.value.config.sentimentThreshold)
      }
      if (ruleForm.value.config.volumeThreshold !== undefined) {
        config.volumeThreshold = Number(ruleForm.value.config.volumeThreshold)
      }
      if (ruleForm.value.config.speedThreshold !== undefined) {
        config.speedThreshold = Number(ruleForm.value.config.speedThreshold)
      }

      const rule: WarningRule = {
        id: ruleForm.value.id || `WR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: ruleForm.value.name!,
        type: ruleForm.value.type!,
        level: ruleForm.value.level!,
        enabled: ruleForm.value.enabled!,
        config: config,
        createdAt: ruleForm.value.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 使用 JSON.parse(JSON.stringify()) 确保是纯粹的普通对象
      const plainRule = JSON.parse(JSON.stringify(rule))

      if (isEditMode.value) {
        await warningStore.updateRule(plainRule.id, plainRule)
        ElMessage.success('规则更新成功')
      } else {
        await warningStore.addRule(plainRule)
        ElMessage.success('规则创建成功')
      }

      ruleDialogVisible.value = false
    } catch (error) {
      ElMessage.error('保存失败')
      console.error(error)
    }
  })
}

const toggleRule = async (id: string) => {
  try {
    await warningStore.toggleRule(id)
    ElMessage.success('规则状态已更新')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteRule = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除此规则吗？', '提示', {
      type: 'warning'
    })

    await warningStore.deleteRule(id)
    ElMessage.success('规则已删除')
  } catch (error) {
    // 用户取消
  }
}

// 预警处理
const viewWarningDetail = (record: WarningRecord) => {
  currentWarning.value = record
  detailDialogVisible.value = true
}

const handleWarningAction = async (id: string, status: WarningRecord['status']) => {
  try {
    await warningStore.handleRecord(id, status)
    ElMessage.success('处理成功')
    detailDialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 图表渲染
const renderTrendChart = () => {
  if (!trendChartRef.value) return

  // 销毁已存在的图表实例
  const existingChart = echarts.getInstanceByDom(trendChartRef.value)
  if (existingChart) {
    existingChart.dispose()
  }

  const chart = echarts.init(trendChartRef.value)

  // 获取最近7天的数据
  const days: string[] = []
  const counts: number[] = []

  for (let i = 6; i >= 0; i--) {
    const day = dayjs().subtract(i, 'day')
    days.push(day.format('MM-DD'))

    const count = warningStore.records.filter(r =>
      dayjs(r.createdAt).isSame(day, 'day')
    ).length

    counts.push(count)
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: days
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '预警数量',
        type: 'line',
        data: counts,
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

const renderLevelChart = () => {
  if (!levelChartRef.value) return

  // 销毁已存在的图表实例
  const existingChart = echarts.getInstanceByDom(levelChartRef.value)
  if (existingChart) {
    existingChart.dispose()
  }

  const chart = echarts.init(levelChartRef.value)

  const data = [
    { value: warningStore.recordsByLevel.high.length, name: '严重', itemStyle: { color: '#f56c6c' } },
    { value: warningStore.recordsByLevel.medium.length, name: '警告', itemStyle: { color: '#e6a23c' } },
    { value: warningStore.recordsByLevel.low.length, name: '提示', itemStyle: { color: '#409eff' } }
  ]

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: data,
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

const renderTypeChart = () => {
  if (!typeChartRef.value) return

  // 销毁已存在的图表实例
  const existingChart = echarts.getInstanceByDom(typeChartRef.value)
  if (existingChart) {
    existingChart.dispose()
  }

  const chart = echarts.init(typeChartRef.value)

  const typeCount: Record<string, number> = {}
  warningStore.records.forEach(r => {
    const rule = warningStore.rules.find(ru => ru.id === r.ruleId)
    if (rule) {
      typeCount[rule.type] = (typeCount[rule.type] || 0) + 1
    }
  })

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: Object.keys(typeCount).map(getRuleTypeName)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '预警数量',
        type: 'bar',
        data: Object.values(typeCount),
        itemStyle: { color: '#67c23a' }
      }
    ]
  }

  chart.setOption(option)
}

const renderStatusChart = () => {
  if (!statusChartRef.value) return

  // 销毁已存在的图表实例
  const existingChart = echarts.getInstanceByDom(statusChartRef.value)
  if (existingChart) {
    existingChart.dispose()
  }

  const chart = echarts.init(statusChartRef.value)

  const statusCount: Record<string, number> = {
    unhandled: 0,
    processing: 0,
    resolved: 0,
    ignored: 0
  }

  warningStore.records.forEach(r => {
    statusCount[r.status]++
  })

  const data = [
    { value: statusCount.unhandled, name: '未处理', itemStyle: { color: '#f56c6c' } },
    { value: statusCount.processing, name: '处理中', itemStyle: { color: '#e6a23c' } },
    { value: statusCount.resolved, name: '已解决', itemStyle: { color: '#67c23a' } },
    { value: statusCount.ignored, name: '已忽略', itemStyle: { color: '#909399' } }
  ]

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: data,
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

const renderAllCharts = () => {
  nextTick(() => {
    renderTrendChart()
    renderLevelChart()
    renderTypeChart()
    renderStatusChart()
  })
}

// 监听 tab 切换，当切换到统计 tab 时重新渲染图表
watch(activeTab, (newTab) => {
  if (newTab === 'statistics') {
    renderAllCharts()
  }
})

// 初始化
onMounted(async () => {
  await warningStore.loadAll()
  // 如果当前是统计 tab，渲染图表
  if (activeTab.value === 'statistics') {
    renderAllCharts()
  }
})
</script>

<style lang="scss" scoped>
.warning-container {
  padding: 20px;

  .stats-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          font-size: 40px;
        }

        .stat-info {
          flex: 1;

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #303133;
          }
        }
      }
    }
  }

  .warning-tabs {
    :deep(.el-tabs__content) {
      padding: 20px;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
    }

    .rule-config {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      color: #606266;
    }

    .statistics-section {
      .el-card {
        margin-bottom: 20px;
      }
    }
  }

  .warning-detail {
    .ai-suggestion {
      padding: 12px;
      background: #f0f9ff;
      border-radius: 4px;
      border-left: 3px solid #409eff;
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .detail-actions {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  }
}
</style>

<template>
  <div class="project-detail">
    <el-card class="project-header-card">
      <template #header>
        <div class="card-header">
          <span>项目信息</span>
          <div class="header-actions">
            <el-button type="danger" size="small" @click="$emit('delete', projectId)">
              删除项目
            </el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="projectFormRef"
        :model="projectForm"
        label-width="100px"
        @submit.prevent
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用人单位">
              <el-input v-model="projectForm.employer_name" @change="saveProject" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检测编号">
              <el-input v-model="projectForm.test_number" @change="saveProject" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分析地点">
              <el-input v-model="projectForm.analysis_location" @change="saveProject" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分析日期">
              <el-date-picker
                v-model="projectForm.analysis_date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY.MM.DD"
                @change="saveProject"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采样日期">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-date-picker
                  v-model="samplingDateStart"
                  type="date"
                  placeholder="开始日期"
                  value-format="YYYY.MM.DD"
                  @change="handleSamplingDateChange"
                  style="width: 140px"
                />
                <span>~</span>
                <el-date-picker
                  v-model="samplingDateEnd"
                  type="date"
                  placeholder="结束日期"
                  value-format="YYYY.MM.DD"
                  @change="handleSamplingDateChange"
                  style="width: 140px"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检测依据">
              <el-radio-group v-model="projectForm.test_standard" @change="saveProject">
                <el-radio label="GBZ/T 192.1-2025">GBZ/T 192.1-2025 总粉尘浓度</el-radio>
                <el-radio label="GBZ/T 192.2-2025">GBZ/T 192.2-2025 呼吸性粉尘浓度</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="采样温度">
              <el-input
                v-model="tempInputs.sampling_temperature"
                @input="(val: string) => handleNumberInput('sampling_temperature', val)"
                @blur="handleNumberBlur('sampling_temperature', 'sampling_temperature')"
                placeholder="℃"
                style="width: 80px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="采样气压">
              <el-input
                v-model="tempInputs.sampling_air_pressure"
                @input="(val: string) => handleNumberInput('sampling_air_pressure', val)"
                @blur="handleNumberBlur('sampling_air_pressure', 'sampling_air_pressure')"
                placeholder="kPa"
                style="width: 80px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否换算V0">
              <el-tag :type="needV0ConversionFlag ? 'warning' : 'success'">
                {{ needV0ConversionFlag ? '是' : '否' }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分析温度">
              <div style="display: flex; align-items: center; gap: 4px;">
                <el-input
                  v-model="tempInputs.analysis_temperature_min"
                  @input="(val: string) => handleNumberInput('analysis_temperature_min', val)"
                  @blur="handleNumberBlur('analysis_temperature_min', 'analysis_temperature_min')"
                  placeholder="最低"
                  style="width: 80px"
                />
                <span>~</span>
                <el-input
                  v-model="tempInputs.analysis_temperature_max"
                  @input="(val: string) => handleNumberInput('analysis_temperature_max', val)"
                  @blur="handleNumberBlur('analysis_temperature_max', 'analysis_temperature_max')"
                  placeholder="最高"
                  style="width: 80px"
                />
                <span>℃</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分析湿度">
              <div style="display: flex; align-items: center; gap: 4px;">
                <el-input
                  v-model="tempInputs.analysis_humidity_min"
                  @input="(val: string) => handleNumberInput('analysis_humidity_min', val)"
                  @blur="handleNumberBlur('analysis_humidity_min', 'analysis_humidity_min')"
                  placeholder="最低"
                  style="width: 80px"
                />
                <span>~</span>
                <el-input
                  v-model="tempInputs.analysis_humidity_max"
                  @input="(val: string) => handleNumberInput('analysis_humidity_max', val)"
                  @blur="handleNumberBlur('analysis_humidity_max', 'analysis_humidity_max')"
                  placeholder="最高"
                  style="width: 80px"
                />
                <span>%</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验仪器">
              <el-input v-model="projectForm.instrument_name" @change="saveProject" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仪器编号">
              <el-input v-model="projectForm.instrument_no" @change="saveProject" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分析人">
              <el-input v-model="projectForm.analyst" @change="saveProject" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="复核人">
              <el-input v-model="projectForm.reviewer" @change="saveProject" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 标准砝码检查 -->
    <el-card class="standard-weight-card">
      <template #header>
        <span>标准砝码检查</span>
      </template>

      <el-form :model="standardWeightForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="砝码编号">
              <el-input v-model="standardWeightForm.weight_no" @change="saveStandardWeight" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原始质量">
              <el-input-number
                v-model="standardWeightForm.original_mass"
                :precision="2"
                @change="saveStandardWeight"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="本次称重">
              <el-input-number
                v-model="standardWeightForm.current_mass"
                :precision="2"
                @change="saveStandardWeight"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="检查结论">
              <el-tag :type="standardWeightResult === '合格' ? 'success' : 'danger'" size="large">
                {{ standardWeightResult || '未检查' }}
              </el-tag>
              <span style="margin-left: 20px; color: #909399;">
                差值: {{ standardWeightDiff?.toFixed(2) || '-' }} mg
              </span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 样品数据表格 -->
    <el-card class="samples-card">
      <template #header>
        <div class="card-header">
          <span>样品数据</span>
          <div class="header-actions">
            <el-switch
              v-model="isTranscriptionView"
              active-text="誊抄视图"
              inactive-text="完整视图"
              style="margin-right: 20px"
            />
            <el-button type="primary" size="small" @click="handleAddRows">
              新增行
            </el-button>
            <el-button size="small" @click="batchSetVolume">
              批量设置体积
            </el-button>
            <el-button type="danger" size="small" @click="handleClearAllSamples">
              清空表格
            </el-button>
          </div>
        </div>
      </template>

      <!-- 最低定量浓度提示 -->
      <div class="quantitative-concentration-tip">
        <el-alert type="info" :closable="false">
          <template #title>
            最低定量浓度参考：
            500L → 0.2 mg/m³ | 300L → 0.34 mg/m³ | 420L → 0.24 mg/m³ | 450L → 0.23 mg/m³ | 480L → 0.21 mg/m³ | 525L → 0.20 mg/m³
            <span style="margin-left: 20px; color: #909399;">| 支持单列粘贴（Ctrl+V）：点击该列输入框后粘贴数据</span>
          </template>
        </el-alert>
      </div>

      <!-- 完整视图表格 -->
      <el-table
        v-show="!isTranscriptionView"
        :data="samples"
        border
        height="400"
        :row-class-name="getRowClassName"
        @paste.capture.prevent="handlePaste"
        class="excel-table"
      >
        <el-table-column prop="sample_type" label="类型" width="70">
          <template #default="{ row }">
            <el-tag :type="row.sample_type === '空白' ? 'warning' : 'primary'" size="small">
              {{ row.sample_type || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sample_no" label="样品编号" width="200">
          <template #default="{ row, $index }">
            <div
              :data-cell="$index + '-sample_no'"
              class="excel-cell"
              :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 0 }"
              @click="handleCellClick($index, 'sample_no')"
            >
              <el-input
                v-model="row.sample_no"
                size="small"
                @change="updateSample(row)"
                @keydown="handleCellKeydown($event, $index, 'sample_no')"
                @focus="handleCellFocus($index, 'sample_no')"
                @paste.prevent.stop
                placeholder="输入编号"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="filter_no" label="滤膜编号" width="100">
          <template #default="{ row, $index }">
            <div
              :data-cell="$index + '-filter_no'"
              class="excel-cell"
              :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 1 }"
              @click="handleCellClick($index, 'filter_no')"
            >
              <el-input
                v-model="row.filter_no"
                size="small"
                @change="updateSample(row)"
                @keydown="handleCellKeydown($event, $index, 'filter_no')"
                @focus="handleCellFocus($index, 'filter_no')"
                @paste.prevent.stop
                placeholder="可选"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="w1" label="采样前质量W1(mg)" width="120">
          <template #default="{ row, $index }">
            <div
              :data-cell="$index + '-w1'"
              class="excel-cell"
              :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 2 }"
              @click="handleCellClick($index, 'w1')"
            >
              <el-input
                v-model="row.w1"
                size="small"
                placeholder=""
                @change="handleWChange(row, 'w1')"
                @keydown="handleCellKeydown($event, $index, 'w1')"
                @focus="handleCellFocus($index, 'w1')"
                @blur="handleWBlur(row, 'w1')"
                style="width: 100%"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="w2_first" label="采样后第一次(mg)" width="120">
          <template #default="{ row, $index }">
            <div
              :data-cell="$index + '-w2_first'"
              class="excel-cell"
              :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 3 }"
              @click="handleCellClick($index, 'w2_first')"
            >
              <el-input
                v-model="row.w2_first"
                size="small"
                placeholder=""
                @change="handleWChange(row, 'w2_first')"
                @keydown="handleCellKeydown($event, $index, 'w2_first')"
                @focus="handleCellFocus($index, 'w2_first')"
                @blur="handleWBlur(row, 'w2_first')"
                style="width: 100%"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="w2_second" label="采样后第二次(mg)" width="120">
          <template #default="{ row, $index }">
            <div
              :data-cell="$index + '-w2_second'"
              class="excel-cell"
              :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 4 }"
              @click="handleCellClick($index, 'w2_second')"
            >
              <el-input
                v-model="row.w2_second"
                size="small"
                placeholder=""
                @change="handleWChange(row, 'w2_second')"
                @keydown="handleCellKeydown($event, $index, 'w2_second')"
                @focus="handleCellFocus($index, 'w2_second')"
                @blur="handleWBlur(row, 'w2_second')"
                style="width: 100%"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="w2_avg" label="采样后平均W2(mg)" width="120">
          <template #default="{ row }">
            <span>{{ row.w2_avg?.toFixed(2) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="weighing_diff" label="称量差值(mg)" width="100">
          <template #default="{ row }">
            <span :class="{ 'qc-fail': row.weighing_qc === '不合格' }">
              {{ row.weighing_diff?.toFixed(2) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="weighing_qc" label="称量质控" width="80">
          <template #default="{ row }">
            <el-tag
              v-if="row.weighing_qc"
              :type="row.weighing_qc === '合格' ? 'success' : 'danger'"
              size="small"
            >
              {{ row.weighing_qc }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="delta_m" label="增重Δm(mg)" width="100">
          <template #default="{ row }">
            <span :class="{ 'qc-fail': row.delta_m_qc === '不合格' }">
              {{ row.delta_m?.toFixed(2) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="delta_m_qc" label="增重质控" width="80">
          <template #default="{ row }">
            <el-tag
              v-if="row.delta_m_qc"
              :type="row.delta_m_qc === '合格' ? 'success' : 'danger'"
              size="small"
            >
              {{ row.delta_m_qc }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="vt" label="Vt(L)" width="100">
          <template #default="{ row, $index }">
            <!-- 空白样品显示"/"，普通样品显示输入框 -->
            <span v-if="row.sample_type === '空白'">/</span>
            <div
              v-else
              :data-cell="$index + '-vt'"
              class="excel-cell"
              :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 5 }"
              @click="handleCellClick($index, 'vt')"
            >
              <el-input
                v-model="row.vt"
                size="small"
                placeholder="500"
                @change="handleVtChange(row)"
                @keydown="handleCellKeydown($event, $index, 'vt')"
                @focus="handleCellFocus($index, 'vt')"
                @paste.prevent.stop
                style="width: 100%"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="v0" label="V0(L)" width="80">
          <template #default="{ row }">
            <span>{{ formatVolume(row, row.v0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="concentration" label="浓度(mg/m³)" width="100">
          <template #default="{ row }">
            <span>{{ row.concentration?.toFixed(3) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rounded_value" label="检测值(修约)" width="100">
          <template #default="{ row }">
            <span class="rounded-value">{{ formatRoundedValue(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_detected" label="是否检出" width="80">
          <template #default="{ row }">
            <el-tag
              v-if="row.is_detected === '检出'"
              type="success"
              size="small"
            >
              检出
            </el-tag>
            <el-tag
              v-else-if="row.is_detected === '未检出'"
              type="info"
              size="small"
            >
              未检出
            </el-tag>
            <span v-else>{{ row.is_detected || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" fixed="right">
          <template #default="{ row, $index }">
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              @click="deleteSampleRow(row, $index)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 誊抄视图表格 -->
      <el-table
        v-show="isTranscriptionView"
        :data="samples"
        border
        stripe
        height="400"
        highlight-current-row
      >
        <el-table-column prop="sample_type" label="类型" width="70">
          <template #default="{ row }">
            <el-tag :type="row.sample_type === '空白' ? 'warning' : 'primary'" size="small">
              {{ row.sample_type || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sample_no" label="样品编号" width="200">
          <template #default="{ row }">
            {{ row.sample_no || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="filter_no" label="滤膜编号" width="100">
          <template #default="{ row }">
            {{ row.filter_no || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="w1" label="采样前质量W1(mg)" width="120">
          <template #default="{ row }">
            {{ row.w1?.toFixed(2) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="w2_first" label="采样后第一次(mg)" width="120">
          <template #default="{ row }">
            {{ row.w2_first?.toFixed(2) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="w2_second" label="采样后第二次(mg)" width="120">
          <template #default="{ row }">
            {{ row.w2_second?.toFixed(2) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="w2_avg" label="采样后平均W2(mg)" width="120">
          <template #default="{ row }">
            {{ row.w2_avg?.toFixed(2) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="delta_m" label="增重Δm(mg)" width="100">
          <template #default="{ row }">
            {{ row.delta_m?.toFixed(2) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="vt" label="Vt(L)" width="80">
          <template #default="{ row }">
            {{ formatVolume(row, row.vt) }}
          </template>
        </el-table-column>
        <el-table-column prop="v0" label="V0(L)" width="80">
          <template #default="{ row }">
            {{ formatVolume(row, row.v0) }}
          </template>
        </el-table-column>
        <el-table-column prop="concentration" label="浓度(mg/m³)" width="100">
          <template #default="{ row }">
            <span>{{ row.concentration?.toFixed(3) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rounded_value" label="检测值(修约)" width="100">
          <template #default="{ row }">
            <span class="rounded-value">{{ formatRoundedValue(row) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  needV0Conversion,
  calculateV0,
  getSampleType,
  calculateW2Avg,
  calculateWeighingDiff,
  checkWeighingQC,
  calculateDeltaM,
  checkDeltaMQC,
  calculateConcentration,
  calculateRoundedValue,
  checkIsDetected,
  checkStandardWeight,
  getRoundingDecimals
} from '../utils/calculator'

interface Props {
  projectId: number
}

const props = defineProps<Props>()
const emit = defineEmits(['delete'])

// 项目表单
const projectForm = ref({
  employer_name: '',
  test_number: '',
  analysis_location: '',
  analysis_date: '',
  sampling_date: '',
  test_standard: 'GBZ/T 192.1-2025',
  sampling_temperature: null as number | null,
  sampling_air_pressure: null as number | null,
  analysis_temperature_min: null as number | null,
  analysis_temperature_max: null as number | null,
  analysis_humidity_min: null as number | null,
  analysis_humidity_max: null as number | null,
  instrument_name: '',
  instrument_no: '',
  analyst: '',
  reviewer: ''
})

// 砝码表单
const standardWeightForm = ref({
  id: null as number | null,
  weight_no: '',
  original_mass: null as number | null,
  current_mass: null as number | null
})

// 样品数据
const samples = ref<any[]>([])

// 视图切换
const isTranscriptionView = ref(false)

// 当前选中单元格位置
const currentCell = ref<{ row: number; col: number } | null>(null)

// 可编辑列定义（完整视图）
const editableColumns = ['sample_no', 'filter_no', 'w1', 'w2_first', 'w2_second', 'vt']

// 获取列索引对应的字段名
const getColumnField = (colIndex: number): string => {
  return editableColumns[colIndex] || ''
}

// 获取字段名对应的列索引
const getColumnIndex = (field: string): number => {
  return editableColumns.indexOf(field)
}

// 采样日期（两个独立选择器）
const samplingDateStart = ref<string | null>(null)
const samplingDateEnd = ref<string | null>(null)

// 处理采样日期变化
const handleSamplingDateChange = () => {
  if (samplingDateStart.value && samplingDateEnd.value) {
    projectForm.value.sampling_date = samplingDateStart.value === samplingDateEnd.value
      ? samplingDateStart.value
      : `${samplingDateStart.value}~${samplingDateEnd.value}`
  } else if (samplingDateStart.value) {
    projectForm.value.sampling_date = samplingDateStart.value
  } else if (samplingDateEnd.value) {
    projectForm.value.sampling_date = samplingDateEnd.value
  } else {
    projectForm.value.sampling_date = ''
  }
  saveProject()
}

// 从存储的日期字符串解析为两个独立日期
const parseSamplingDate = (dateStr: string) => {
  if (!dateStr) return { start: null, end: null }
  if (dateStr.includes('~')) {
    const parts = dateStr.split('~')
    return { start: parts[0], end: parts[1] }
  }
  return { start: dateStr, end: dateStr }
}

// 数值输入临时状态（用于支持输入小数点）
const tempInputs = ref({
  sampling_temperature: '',
  sampling_air_pressure: '',
  analysis_temperature_min: '',
  analysis_temperature_max: '',
  analysis_humidity_min: '',
  analysis_humidity_max: ''
})

// 处理数值输入（允许输入数字和小数点）
const handleNumberInput = (field: keyof typeof tempInputs.value, value: string) => {
  // 只保留数字、小数点和负号
  let filtered = value.replace(/[^\d.-]/g, '')
  // 确保只有一个小数点
  const parts = filtered.split('.')
  if (parts.length > 2) {
    filtered = parts[0] + '.' + parts.slice(1).join('')
  }
  // 处理负号：只有开头的负号才保留
  const isNegative = filtered.startsWith('-')
  filtered = filtered.replace(/-/g, '')
  if (isNegative) {
    filtered = '-' + filtered
  }
  tempInputs.value[field] = filtered
}

// 数值输入失去焦点时保存
const handleNumberBlur = (field: keyof typeof tempInputs.value, targetField: keyof typeof projectForm.value) => {
  const val = tempInputs.value[field]
  if (val === '' || val === '-' || val === '.') {
    (projectForm.value as any)[targetField] = null
  } else {
    let num = parseFloat(val)
    // 根据字段类型保留不同精度
    if (field === 'analysis_humidity_min' || field === 'analysis_humidity_max') {
      // 湿度保留整数
      num = Math.round(num)
    } else {
      // 温度和气压保留一位小数
      num = Math.round(num * 10) / 10
    }
    (projectForm.value as any)[targetField] = num
    tempInputs.value[field] = String(num)
  }
  saveProject()
}

// 初始化临时输入值（格式化显示）
const initTempInputs = () => {
  const formatOneDecimal = (val: number | null) => val !== null ? val.toFixed(1) : ''
  const formatInteger = (val: number | null) => val !== null ? Math.round(val).toString() : ''

  tempInputs.value.sampling_temperature = formatOneDecimal(projectForm.value.sampling_temperature)
  tempInputs.value.sampling_air_pressure = formatOneDecimal(projectForm.value.sampling_air_pressure)
  tempInputs.value.analysis_temperature_min = formatOneDecimal(projectForm.value.analysis_temperature_min)
  tempInputs.value.analysis_temperature_max = formatOneDecimal(projectForm.value.analysis_temperature_max)
  tempInputs.value.analysis_humidity_min = formatInteger(projectForm.value.analysis_humidity_min)
  tempInputs.value.analysis_humidity_max = formatInteger(projectForm.value.analysis_humidity_max)
}

// 计算是否需要V0换算
const needV0ConversionFlag = computed(() => {
  return needV0Conversion(projectForm.value.sampling_temperature, projectForm.value.sampling_air_pressure)
})

// 砝码检查结果
const standardWeightResult = computed(() => {
  if (standardWeightForm.value.original_mass === null ||
      standardWeightForm.value.current_mass === null) {
    return ''
  }
  return checkStandardWeight(
    standardWeightForm.value.original_mass,
    standardWeightForm.value.current_mass
  )
})

const standardWeightDiff = computed(() => {
  if (standardWeightForm.value.original_mass === null ||
      standardWeightForm.value.current_mass === null) {
    return null
  }
  return Math.abs(standardWeightForm.value.current_mass - standardWeightForm.value.original_mass)
})

// 格式化修约值
const formatRoundedValue = (row: any) => {
  // 空白样品显示"未检出"
  if (row.sample_type === '空白') return '未检出'
  if (row.rounded_value === null || row.rounded_value === undefined) return '-'
  const decimals = getRoundingDecimals(row.vt)
  return row.rounded_value.toFixed(decimals)
}

// 格式化Vt/V0（空白样品显示"/"）
const formatVolume = (row: any, value: any) => {
  if (row.sample_type === '空白') return '/'
  return value || '-'
}

// 处理单列粘贴（从Excel复制的数据）
const handlePaste = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData('text/plain')
  if (!text) return

  // 解析：按换行分行（单列数据）
  const values = text.trim().split(/\r?\n/)

  // 获取当前焦点元素，确定目标列
  const activeEl = document.activeElement as HTMLElement
  if (!activeEl) return

  // 查找带有 data-cell 属性的父元素
  const cellContainer = activeEl.closest('[data-cell]') as HTMLElement
  if (!cellContainer) return

  // 从 data-cell 提取行索引和字段名（格式：{rowIndex}-{field}）
  const dataCell = cellContainer.getAttribute('data-cell')
  if (!dataCell) return

  const parts = dataCell.split('-')
  const rowIndex = parseInt(parts[0])
  const field = parts[1]

  // 验证字段是否可粘贴
  const validFields = ['sample_no', 'filter_no', 'w1', 'w2_first', 'w2_second', 'vt']
  if (!validFields.includes(field)) return

  // 确保有足够的行（从当前行开始）
  const neededRows = rowIndex + values.length
  while (samples.value.length < neededRows) {
    addSampleRow()
  }

  // 从当前行开始填充数据
  values.forEach((val, index) => {
    const row = samples.value[rowIndex + index]
    const trimmedVal = val.trim()

    if (field === 'vt') {
      // Vt 需验证有效值
      const vtVal = parseInt(trimmedVal)
      row.vt = [500, 300, 420, 450, 480, 525].includes(vtVal) ? vtVal : 500
    } else if (['w1', 'w2_first', 'w2_second'].includes(field)) {
      // 数值字段
      row[field] = parseFloat(trimmedVal) || null
    } else {
      // 文本字段
      row[field] = trimmedVal
    }
    updateSample(row)
  })

  ElMessage.success(`已粘贴 ${values.length} 行数据到 ${field} 列，从第 ${rowIndex + 1} 行开始`)
}

// 处理Vt输入变化（验证有效值）
const handleVtChange = (row: any) => {
  const validValues = [500, 300, 420, 450, 480, 525]
  const vtNum = parseInt(row.vt as string)

  if (!validValues.includes(vtNum)) {
    row.vt = 500 // 无效值恢复默认
  } else {
    row.vt = vtNum
  }
  updateSample(row)
}

// 处理W值变化（输入时转换为数值）
const handleWChange = (row: any, field: 'w1' | 'w2_first' | 'w2_second') => {
  const value = row[field]
  if (value === '' || value === null || value === undefined) {
    row[field] = null
  } else {
    const num = parseFloat(value)
    row[field] = isNaN(num) ? null : num
  }
  updateSample(row)
}

// 处理W值失焦（格式化显示）
const handleWBlur = (row: any, field: 'w1' | 'w2_first' | 'w2_second') => {
  const value = row[field]
  if (value !== null && value !== undefined && typeof value === 'number') {
    // 格式化为两位小数字符串显示
    row[field] = value.toFixed(2)
  }
}

// 行样式
const getRowClassName = ({ row }: { row: any }) => {
  if (row.weighing_qc === '不合格' || row.delta_m_qc === '不合格') {
    return 'qc-fail-row'
  }
  return ''
}

// 加载项目数据
const loadProject = async () => {
  try {
    const project = await window.electronAPI.getProject(props.projectId)
    if (project) {
      projectForm.value = {
        employer_name: project.employer_name || '',
        test_number: project.test_number || '',
        analysis_location: project.analysis_location || '',
        analysis_date: project.analysis_date || '',
        sampling_date: project.sampling_date || '',
        test_standard: project.test_standard || 'GBZ/T 192.1-2025',
        sampling_temperature: project.sampling_temperature,
        sampling_air_pressure: project.sampling_air_pressure,
        analysis_temperature_min: project.analysis_temperature_min,
        analysis_temperature_max: project.analysis_temperature_max,
        analysis_humidity_min: project.analysis_humidity_min,
        analysis_humidity_max: project.analysis_humidity_max,
        instrument_name: project.instrument_name || '',
        instrument_no: project.instrument_no || '',
        analyst: project.analyst || '',
        reviewer: project.reviewer || ''
      }
      // 解析采样日期为两个独立日期
      const parsed = parseSamplingDate(project.sampling_date || '')
      samplingDateStart.value = parsed.start
      samplingDateEnd.value = parsed.end
      initTempInputs()
    }
  } catch (e) {
    ElMessage.error('加载项目失败')
  }
}

// 加载砝码数据
const loadStandardWeight = async () => {
  try {
    const weight = await window.electronAPI.getStandardWeight(props.projectId)
    if (weight) {
      standardWeightForm.value = {
        id: weight.id,
        weight_no: weight.weight_no || '',
        original_mass: weight.original_mass,
        current_mass: weight.current_mass
      }
    } else {
      // 新项目使用默认值
      standardWeightForm.value = {
        id: null,
        weight_no: 'HX663',
        original_mass: 50.00,
        current_mass: null
      }
    }
  } catch (e) {
    // 可能没有砝码记录，使用默认值
    standardWeightForm.value = {
      id: null,
      weight_no: 'HX663',
      original_mass: 50.00,
      current_mass: null
    }
  }
}

// 加载样品数据
const loadSamples = async () => {
  try {
    const data = await window.electronAPI.getSamples(props.projectId)
    samples.value = data || []
  } catch (e) {
    ElMessage.error('加载样品数据失败')
  }
}

// 保存项目
const saveProject = async () => {
  try {
    // 转换为普通对象，避免 IPC 序列化问题
    const projectData = {
      employer_name: projectForm.value.employer_name,
      test_number: projectForm.value.test_number,
      analysis_location: projectForm.value.analysis_location,
      analysis_date: projectForm.value.analysis_date,
      sampling_date: projectForm.value.sampling_date,
      test_standard: projectForm.value.test_standard,
      sampling_temperature: projectForm.value.sampling_temperature,
      sampling_air_pressure: projectForm.value.sampling_air_pressure,
      analysis_temperature_min: projectForm.value.analysis_temperature_min,
      analysis_temperature_max: projectForm.value.analysis_temperature_max,
      analysis_humidity_min: projectForm.value.analysis_humidity_min,
      analysis_humidity_max: projectForm.value.analysis_humidity_max,
      instrument_name: projectForm.value.instrument_name,
      instrument_no: projectForm.value.instrument_no,
      analyst: projectForm.value.analyst,
      reviewer: projectForm.value.reviewer
    }
    await window.electronAPI.updateProject(props.projectId, projectData)
    // 更新样品的V0计算
    samples.value.forEach(sample => {
      if (sample.vt) {
        sample.v0 = calculateV0(
          sample.vt,
          projectForm.value.sampling_temperature,
          projectForm.value.sampling_air_pressure
        )
        if (sample.delta_m !== null && sample.delta_m !== undefined) {
          sample.concentration = calculateConcentration(sample.delta_m, sample.v0)
          sample.rounded_value = calculateRoundedValue(sample.concentration, sample.vt)
          sample.is_detected = checkIsDetected(sample.rounded_value, sample.sample_type, sample.vt)
        }
      }
    })
    ElMessage.success('项目已保存')
  } catch (e: any) {
    console.error('保存失败:', e)
    ElMessage.error(`保存失败: ${e?.message || '未知错误'}`)
  }
}

// 保存砝码
const saveStandardWeight = async () => {
  try {
    if (standardWeightForm.value.id) {
      await window.electronAPI.updateStandardWeight(
        standardWeightForm.value.id,
        {
          weight_no: standardWeightForm.value.weight_no,
          original_mass: standardWeightForm.value.original_mass,
          current_mass: standardWeightForm.value.current_mass,
          check_result: standardWeightResult.value
        }
      )
    } else {
      const result = await window.electronAPI.createStandardWeight({
        project_id: props.projectId,
        weight_no: standardWeightForm.value.weight_no,
        original_mass: standardWeightForm.value.original_mass,
        current_mass: standardWeightForm.value.current_mass,
        check_result: standardWeightResult.value
      })
      standardWeightForm.value.id = result.id
    }
    ElMessage.success('砝码检查已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

// 更新样品计算
const updateSample = async (row: any) => {
  // 自动判断样品类型
  row.sample_type = getSampleType(row.sample_no)

  // 确保w1, w2_first, w2_second为数值类型
  const w1 = typeof row.w1 === 'string' ? parseFloat(row.w1) : row.w1
  const w2First = typeof row.w2_first === 'string' ? parseFloat(row.w2_first) : row.w2_first
  const w2Second = typeof row.w2_second === 'string' ? parseFloat(row.w2_second) : row.w2_second

  // 计算W2平均值
  if (w2First !== null && !isNaN(w2First) && w2Second !== null && !isNaN(w2Second)) {
    row.w2_avg = calculateW2Avg(w2First, w2Second)
    row.weighing_diff = calculateWeighingDiff(w2First, w2Second)
    row.weighing_qc = checkWeighingQC(row.weighing_diff)
  }

  // 计算增重
  if (w1 !== null && !isNaN(w1) && row.w2_avg !== null) {
    row.delta_m = calculateDeltaM(w1, row.w2_avg)
    row.delta_m_qc = checkDeltaMQC(row.delta_m, row.sample_type)
  }

  // 计算V0
  if (row.vt) {
    row.v0 = calculateV0(
      row.vt,
      projectForm.value.sampling_temperature,
      projectForm.value.sampling_air_pressure
    )
  }

  // 计算浓度
  if (row.delta_m !== null && row.v0 !== null) {
    row.concentration = calculateConcentration(row.delta_m, row.v0)
    row.rounded_value = calculateRoundedValue(row.concentration, row.vt)
    row.is_detected = checkIsDetected(row.rounded_value, row.sample_type, row.vt)
  }

  // 保存到数据库
  try {
    // 转换为普通对象，避免 IPC 序列化问题
    const sampleData = {
      sample_type: row.sample_type,
      sample_no: row.sample_no,
      filter_no: row.filter_no,
      w1: typeof row.w1 === 'string' ? parseFloat(row.w1) || null : row.w1,
      w2_first: typeof row.w2_first === 'string' ? parseFloat(row.w2_first) || null : row.w2_first,
      w2_second: typeof row.w2_second === 'string' ? parseFloat(row.w2_second) || null : row.w2_second,
      w2_avg: row.w2_avg,
      weighing_diff: row.weighing_diff,
      weighing_qc: row.weighing_qc,
      delta_m: row.delta_m,
      delta_m_qc: row.delta_m_qc,
      vt: row.vt,
      v0: row.v0,
      concentration: row.concentration,
      rounded_value: row.rounded_value,
      is_detected: row.is_detected
    }
    if (row.id) {
      await window.electronAPI.updateSample(row.id, sampleData)
    } else {
      const result = await window.electronAPI.createSample({
        ...sampleData,
        project_id: props.projectId
      })
      row.id = result.id
    }
  } catch (e) {
    ElMessage.error('保存样品失败')
  }
}

// 添加样品行
const addSampleRow = (count: number = 1) => {
  for (let i = 0; i < count; i++) {
    const newRow = {
      id: null,
      project_id: props.projectId,
      sample_type: '样品',
      sample_no: '',
      filter_no: '',
      w1: null,
      w2_first: null,
      w2_second: null,
      w2_avg: null,
      weighing_diff: null,
      weighing_qc: '',
      delta_m: null,
      delta_m_qc: '',
      vt: 500,
      v0: 500,
      concentration: null,
      rounded_value: null,
      is_detected: ''
    }
    samples.value.push(newRow)
  }
}

// 新增行按钮点击（弹出输入框）
const handleAddRows = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新增行数', '新增行', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[1-9]\d*$/,
      inputErrorMessage: '请输入正整数',
      inputValue: '1'
    })
    addSampleRow(parseInt(value))
    ElMessage.success(`已新增 ${value} 行`)
  } catch {
    // 用户取消
  }
}

// 删除样品行
const deleteSampleRow = async (row: any, index: number) => {
  try {
    await ElMessageBox.confirm('确定删除该样品记录？', '删除确认', { type: 'warning' })
    if (row.id) {
      await window.electronAPI.deleteSample(row.id)
    }
    samples.value.splice(index, 1)
    ElMessage.success('已删除')
  } catch (e) {
    // 用户取消
  }
}

// 清空所有样品数据
const handleClearAllSamples = async () => {
  try {
    await ElMessageBox.confirm(
      '确定清空所有样品数据？此操作不可恢复！',
      '清空确认',
      { type: 'warning', confirmButtonText: '确定清空', cancelButtonText: '取消' }
    )
    // 删除数据库中的所有样品
    for (const sample of samples.value) {
      if (sample.id) {
        await window.electronAPI.deleteSample(sample.id)
      }
    }
    // 清空本地数据
    samples.value = []
    ElMessage.success('已清空所有样品数据')
  } catch (e) {
    // 用户取消
  }
}

// 批量设置采样体积
const batchSetVolume = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入采样体积', '批量设置', {
      inputPattern: /^[0-9]+$/,
      inputErrorMessage: '请输入有效的数字',
      inputValue: '500'
    })
    const vt = parseInt(value)
    samples.value.forEach(row => {
      row.vt = vt
      updateSample(row)
    })
    ElMessage.success('已批量设置')
  } catch (e) {
    // 用户取消
  }
}

// 处理单元格键盘导航
const handleCellKeydown = (event: Event, rowIndex: number, field: string) => {
  const keyEvent = event as KeyboardEvent
  const colIndex = getColumnIndex(field)
  if (colIndex === -1) return

  let newRow = rowIndex
  let newCol = colIndex

  switch (keyEvent.key) {
    case 'ArrowUp':
      newRow = Math.max(0, rowIndex - 1)
      keyEvent.preventDefault()
      break
    case 'ArrowDown':
      newRow = Math.min(samples.value.length - 1, rowIndex + 1)
      keyEvent.preventDefault()
      break
    case 'ArrowLeft':
      // 只有在输入框光标在最左边时才移动到上一列
      const inputEl = keyEvent.target as HTMLInputElement
      if (inputEl.selectionStart === 0 || inputEl.selectionStart === null) {
        newCol = Math.max(0, colIndex - 1)
        keyEvent.preventDefault()
      } else {
        return
      }
      break
    case 'ArrowRight':
      // 只有在输入框光标在最右边时才移动到下一列
      const inputElRight = keyEvent.target as HTMLInputElement
      if (inputElRight.selectionStart === inputElRight.value.length || inputElRight.selectionStart === null) {
        newCol = Math.min(editableColumns.length - 1, colIndex + 1)
        keyEvent.preventDefault()
      } else {
        return
      }
      break
    case 'Tab':
      if (keyEvent.shiftKey) {
        newCol = Math.max(0, colIndex - 1)
      } else {
        newCol = Math.min(editableColumns.length - 1, colIndex + 1)
      }
      keyEvent.preventDefault()
      break
    case 'Enter':
      newRow = Math.min(samples.value.length - 1, rowIndex + 1)
      keyEvent.preventDefault()
      break
    default:
      return
  }

  // 聚焦到新单元格
  focusCell(newRow, newCol)
}

// 聚焦指定单元格
const focusCell = (rowIndex: number, colIndex: number) => {
  currentCell.value = { row: rowIndex, col: colIndex }

  // 使用 setTimeout 确保 DOM 更新后聚焦
  setTimeout(() => {
    const field = getColumnField(colIndex)
    const selector = `[data-cell="${rowIndex}-${field}"]`
    const cellContainer = document.querySelector(selector)

    if (!cellContainer) return

    // 查找输入框元素
    const inputEl = cellContainer.querySelector('input') as HTMLInputElement
    if (inputEl) {
      inputEl.focus()
      // 只有当输入框有值时才选中内容
      if (inputEl.value && inputEl.value.length > 0) {
        inputEl.select()
      }
    }
  }, 0)
}

// 单元格点击选中
const handleCellClick = (rowIndex: number, field: string) => {
  const colIndex = getColumnIndex(field)
  if (colIndex !== -1) {
    currentCell.value = { row: rowIndex, col: colIndex }
  }
}

// 单元格获得焦点
const handleCellFocus = (rowIndex: number, field: string) => {
  const colIndex = getColumnIndex(field)
  if (colIndex !== -1) {
    currentCell.value = { row: rowIndex, col: colIndex }
  }
}

// 监听projectId变化
watch(() => props.projectId, () => {
  loadProject()
  loadStandardWeight()
  loadSamples()
}, { immediate: true })

onMounted(() => {
  loadProject()
  loadStandardWeight()
  loadSamples()
})
</script>

<style scoped>
.project-detail {
  max-width: 1400px;
}

.project-header-card,
.standard-weight-card,
.samples-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.quantitative-concentration-tip {
  margin-bottom: 15px;
}

.qc-fail {
  color: #f56c6c;
  font-weight: bold;
}

.rounded-value {
  font-weight: bold;
  color: #409eff;
}

:deep(.qc-fail-row) {
  background-color: #fef0f0 !important;
}

/* 誊抄视图当前行高亮 - 更醒目 */
:deep(.el-table__body tr.current-row > td) {
  background-color: #ecf5ff !important;
  font-weight: 500;
  color: #409eff !important;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  padding-left: 8px;
  padding-right: 8px;
}

/* Excel风格单元格 */
.excel-table :deep(.el-table__body .el-table__cell) {
  padding: 0;
}

.excel-cell {
  width: 100%;
  height: 100%;
  padding: 4px 8px;
  box-sizing: border-box;
  cursor: cell;
  transition: background-color 0.15s;
}

.excel-cell:hover {
  background-color: #f5f7fa;
}

.excel-cell.cell-selected {
  background-color: #ecf5ff;
  box-shadow: inset 0 0 0 2px #409eff;
}

.excel-cell :deep(.el-input) {
  border: none;
  background: transparent;
}

.excel-cell :deep(.el-input__wrapper) {
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.excel-cell :deep(.el-input__wrapper:hover),
.excel-cell :deep(.el-input__wrapper.is-focus) {
  box-shadow: none;
}

.excel-cell :deep(.el-input__inner) {
  border: none;
  background: transparent;
  padding: 0;
  height: 24px;
  line-height: 24px;
}

.excel-cell :deep(.el-input-number) {
  border: none;
  background: transparent;
}

.excel-cell :deep(.el-input-number .el-input__wrapper) {
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.excel-cell :deep(.el-input-number .el-input__inner) {
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
}
</style>
import { ref, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
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
  getRoundingDecimals
} from '../utils/calculator'
import type { SampleRowData } from '../types/sample'
import { createEmptySampleRow, VALID_SAMPLING_VOLUMES } from '../types/sample'

export function useSamples(projectId: Ref<number> | number) {
  const samples = ref<SampleRowData[]>([])
  const isTranscriptionView = ref(false)

  // 获取当前projectId（支持响应式和静态值）
  const getProjectId = () => typeof projectId === 'number' ? projectId : projectId.value

  // 采样温度和气压（用于计算V0）
  const samplingTemp = ref<number | null>(null)
  const samplingPressure = ref<number | null>(null)

  // 格式化修约值
  const formatRoundedValue = (row: SampleRowData) => {
    if (row.sample_type === '空白') return '未检出'
    if (row.rounded_value === null || row.rounded_value === undefined) return '-'
    const decimals = getRoundingDecimals(row.vt)
    return row.rounded_value.toFixed(decimals)
  }

  // 格式化Vt/V0（空白样品显示"/"）
  const formatVolume = (row: SampleRowData, value: number | null) => {
    if (row.sample_type === '空白') return '/'
    return value || '-'
  }

  // 行样式
  const getRowClassName = ({ row }: { row: SampleRowData }) => {
    if (row.weighing_qc === '不合格' || row.delta_m_qc === '不合格') {
      return 'qc-fail-row'
    }
    return ''
  }

  // 加载样品数据
  const loadSamples = async () => {
    try {
      const id = getProjectId()
      const data = await window.electronAPI.getSamples(id)
      // 加载时重新计算样品类型和检出状态（确保与当前逻辑一致）
      samples.value = (data || []).map((row: SampleRowData) => {
        const sampleType = getSampleType(row.sample_no || '')
        let isDetected = row.is_detected
        // 重新计算检出状态
        if (row.concentration !== null && row.concentration !== undefined && !isNaN(row.concentration)) {
          isDetected = checkIsDetected(row.concentration, sampleType, row.vt || 500)
        }
        return {
          ...row,
          sample_type: sampleType,
          is_detected: isDetected
        }
      }) as SampleRowData[]
    } catch (e) {
      ElMessage.error('加载样品数据失败')
    }
  }

  // 更新样品计算
  const updateSample = async (row: SampleRowData) => {
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
      row.v0 = calculateV0(row.vt, samplingTemp.value, samplingPressure.value)
    }

    // 计算浓度
    if (row.delta_m !== null && row.v0 !== null) {
      row.concentration = calculateConcentration(row.delta_m, row.v0)
      row.rounded_value = calculateRoundedValue(row.concentration, row.vt)
      row.is_detected = checkIsDetected(row.concentration, row.sample_type, row.vt)
    }

    // 保存到数据库
    try {
      const pid = getProjectId()
      const sampleData = JSON.parse(JSON.stringify({
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
      }))
      if (row.id) {
        await window.electronAPI.updateSample(row.id, sampleData)
      } else {
        const result = await window.electronAPI.createSample({
          ...sampleData,
          project_id: pid
        })
        row.id = result.id
      }
    } catch {
      ElMessage.error('保存样品失败')
    }
  }

  // 添加样品行
  const addSampleRows = (count: number = 1) => {
    const pid = getProjectId()
    for (let i = 0; i < count; i++) {
      samples.value.push(createEmptySampleRow(pid))
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
      addSampleRows(parseInt(value))
      ElMessage.success(`已新增 ${value} 行`)
    } catch {
      // 用户取消
    }
  }

  // 删除样品行
  const deleteSampleRow = async (row: SampleRowData, index: number) => {
    try {
      await ElMessageBox.confirm('确定删除该样品记录？', '删除确认', { type: 'warning' })
      if (row.id) {
        await window.electronAPI.deleteSample(row.id)
      }
      samples.value.splice(index, 1)
      ElMessage.success('已删除')
    } catch {
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
      for (const sample of samples.value) {
        if (sample.id) {
          await window.electronAPI.deleteSample(sample.id)
        }
      }
      samples.value = []
      ElMessage.success('已清空所有样品数据')
    } catch {
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
    } catch {
      // 用户取消
    }
  }

  // 处理Vt输入变化（验证有效值）
  const handleVtChange = (row: SampleRowData) => {
    const vtNum = parseInt(row.vt as unknown as string)
    if (!(VALID_SAMPLING_VOLUMES as readonly number[]).includes(vtNum)) {
      row.vt = 500
    } else {
      row.vt = vtNum
    }
    updateSample(row)
  }

  // 处理W值变化（输入时转换为数值）
  const handleWChange = (row: SampleRowData, field: 'w1' | 'w2_first' | 'w2_second') => {
    const value = row[field] as unknown as string | number | null
    if (value === '' || value === null || value === undefined) {
      row[field] = null
    } else {
      const num = parseFloat(value as string)
      row[field] = isNaN(num) ? null : num
    }
    updateSample(row)
  }

  // 处理W值失焦（格式化显示）
  const handleWBlur = (row: SampleRowData, field: 'w1' | 'w2_first' | 'w2_second') => {
    const value = row[field]
    if (value !== null && value !== undefined && typeof value === 'number') {
      row[field] = parseFloat(value.toFixed(2))
    }
  }

  // 更新所有样品的V0计算（当温度或气压变化时）
  const recalculateAllV0 = () => {
    samples.value.forEach(sample => {
      if (sample.vt) {
        sample.v0 = calculateV0(sample.vt, samplingTemp.value, samplingPressure.value)
        if (sample.delta_m !== null && sample.delta_m !== undefined) {
          sample.concentration = calculateConcentration(sample.delta_m, sample.v0)
          sample.rounded_value = calculateRoundedValue(sample.concentration, sample.vt)
          sample.is_detected = checkIsDetected(sample.concentration, sample.sample_type, sample.vt)
        }
      }
    })
  }

  return {
    samples,
    isTranscriptionView,
    samplingTemp,
    samplingPressure,
    formatRoundedValue,
    formatVolume,
    getRowClassName,
    loadSamples,
    updateSample,
    addSampleRows,
    handleAddRows,
    deleteSampleRow,
    handleClearAllSamples,
    batchSetVolume,
    handleVtChange,
    handleWChange,
    handleWBlur,
    recalculateAllV0
  }
}
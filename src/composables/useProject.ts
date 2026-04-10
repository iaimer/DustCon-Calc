import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { needV0Conversion } from '../utils/calculator'
import type { ProjectFormData } from '../types/project'
import { createEmptyProjectForm } from '../types/project'

export function useProject(projectId: number) {
  const projectForm = ref<ProjectFormData>(createEmptyProjectForm())

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

  // 计算是否需要V0换算
  const needV0ConversionFlag = computed(() => {
    return needV0Conversion(projectForm.value.sampling_temperature, projectForm.value.sampling_air_pressure)
  })

  // 加载项目
  const loadProject = async () => {
    try {
      const project = await window.electronAPI.getProject(projectId)
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
        const parsed = parseSamplingDate(project.sampling_date || '')
        samplingDateStart.value = parsed.start
        samplingDateEnd.value = parsed.end
      }
    } catch (e) {
      ElMessage.error('加载项目失败')
    }
    return projectForm.value
  }

  // 保存项目
  const saveProject = async () => {
    try {
      await window.electronAPI.updateProject(projectId, projectForm.value)
      ElMessage.success('项目已保存')
    } catch (e: any) {
      console.error('保存失败:', e)
      ElMessage.error(`保存失败: ${e?.message || '未知错误'}`)
    }
  }

  return {
    projectForm,
    samplingDateStart,
    samplingDateEnd,
    handleSamplingDateChange,
    needV0ConversionFlag,
    loadProject,
    saveProject
  }
}
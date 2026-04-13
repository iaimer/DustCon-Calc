import { ref, computed, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { checkStandardWeight } from '../utils/calculator'
import type { StandardWeightFormData } from '../types/standardWeight'
import { createEmptyStandardWeightForm } from '../types/standardWeight'

export function useStandardWeight(projectId: Ref<number> | number) {
  const standardWeightForm = ref<StandardWeightFormData>(createEmptyStandardWeightForm())

  // 获取当前projectId（支持响应式和静态值）
  const getProjectId = () => typeof projectId === 'number' ? projectId : projectId.value

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

  // 加载砝码数据
  const loadStandardWeight = async () => {
    try {
      const id = getProjectId()
      const weight = await window.electronAPI.getStandardWeight(id)
      if (weight) {
        standardWeightForm.value = {
          id: weight.id,
          weight_no: weight.weight_no || '',
          original_mass: weight.original_mass,
          current_mass: weight.current_mass
        }
      } else {
        standardWeightForm.value = createEmptyStandardWeightForm()
      }
    } catch {
      // 可能没有砝码记录，使用默认值
      standardWeightForm.value = createEmptyStandardWeightForm()
    }
  }

  // 保存砝码
  const saveStandardWeight = async () => {
    try {
      const id = getProjectId()
      const data = {
        weight_no: standardWeightForm.value.weight_no,
        original_mass: standardWeightForm.value.original_mass,
        current_mass: standardWeightForm.value.current_mass,
        check_result: standardWeightResult.value
      }
      if (standardWeightForm.value.id) {
        await window.electronAPI.updateStandardWeight(
          standardWeightForm.value.id,
          JSON.parse(JSON.stringify(data))
        )
      } else {
        const result = await window.electronAPI.createStandardWeight({
          project_id: id,
          ...JSON.parse(JSON.stringify(data))
        })
        standardWeightForm.value.id = result.id
      }
      ElMessage.success('砝码检查已保存')
    } catch {
      ElMessage.error('保存失败')
    }
  }

  return {
    standardWeightForm,
    standardWeightResult,
    standardWeightDiff,
    loadStandardWeight,
    saveStandardWeight
  }
}
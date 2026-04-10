import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { checkStandardWeight } from '../utils/calculator'
import type { StandardWeightFormData } from '../types/standardWeight'
import { createEmptyStandardWeightForm } from '../types/standardWeight'

export function useStandardWeight(projectId: number) {
  const standardWeightForm = ref<StandardWeightFormData>(createEmptyStandardWeightForm())

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
      const weight = await window.electronAPI.getStandardWeight(projectId)
      if (weight) {
        standardWeightForm.value = {
          id: weight.id,
          weight_no: weight.weight_no || '',
          original_mass: weight.original_mass,
          current_mass: weight.current_mass
        }
      }
    } catch {
      // 可能没有砝码记录，使用默认值
      standardWeightForm.value = createEmptyStandardWeightForm()
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
          project_id: projectId,
          weight_no: standardWeightForm.value.weight_no,
          original_mass: standardWeightForm.value.original_mass,
          current_mass: standardWeightForm.value.current_mass,
          check_result: standardWeightResult.value
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
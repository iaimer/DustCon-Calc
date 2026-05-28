import { ref, computed, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { checkStandardWeight } from '../utils/calculator'
import type { StandardWeightFormData } from '../types/standardWeight'
import { createEmptyStandardWeightForm } from '../types/standardWeight'
import { tauriAPI } from '../api/tauri'

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
      const weight = await tauriAPI.getStandardWeight(id)
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
    } catch (e) {
      console.error('加载砝码数据失败:', e)
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
        await tauriAPI.updateStandardWeightFromUpdateData(standardWeightForm.value.id, data)
      } else {
        const result = await tauriAPI.createStandardWeightFromCreateData({
          project_id: id,
          ...data
        })
        standardWeightForm.value.id = result.id
      }
      ElMessage.success('砝码检查已保存')
    } catch (e) {
      console.error('保存砝码检查失败:', e)
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
<template>
  <el-card class="project-header-card">
    <template #header>
      <div class="card-header">
        <span>项目信息</span>
        <div class="header-actions">
          <el-button type="danger" size="small" @click="$emit('delete')">
            删除项目
          </el-button>
        </div>
      </div>
    </template>

    <el-form ref="formRef" :model="formData" label-width="100px" @submit.prevent>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用人单位">
            <el-input v-model="formData.employer_name" @change="emitSave" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="检测编号">
            <el-input v-model="formData.test_number" @change="emitSave" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分析地点">
            <el-input v-model="formData.analysis_location" @change="emitSave" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分析日期">
            <el-date-picker
              v-model="formData.analysis_date"
              type="date"
              placeholder="选择日期"
              value-format="YYYY.MM.DD"
              @change="emitSave"
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
            <el-radio-group v-model="formData.test_standard" @change="emitSave">
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
              @blur="handleBlur('sampling_temperature')"
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
              @blur="handleBlur('sampling_air_pressure')"
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
                @blur="handleBlur('analysis_temperature_min')"
                placeholder="最低"
                style="width: 80px"
              />
              <span>~</span>
              <el-input
                v-model="tempInputs.analysis_temperature_max"
                @input="(val: string) => handleNumberInput('analysis_temperature_max', val)"
                @blur="handleBlur('analysis_temperature_max')"
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
                @blur="handleBlur('analysis_humidity_min')"
                placeholder="最低"
                style="width: 80px"
              />
              <span>~</span>
              <el-input
                v-model="tempInputs.analysis_humidity_max"
                @input="(val: string) => handleNumberInput('analysis_humidity_max', val)"
                @blur="handleBlur('analysis_humidity_max')"
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
            <el-input v-model="formData.instrument_name" @change="emitSave" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仪器编号">
            <el-input v-model="formData.instrument_no" @change="emitSave" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分析人">
            <el-input v-model="formData.analyst" @change="emitSave" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="复核人">
            <el-input v-model="formData.reviewer" @change="emitSave" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProject } from '../../composables/useProject'
import { useNumericInput } from '../../composables/useNumericInput'
import { needV0Conversion } from '../../utils/calculator'
import type { ProjectFormData } from '../../types/project'

const props = defineProps<{ projectId: number }>()
const emit = defineEmits(['delete', 'save', 'envChange'])

const {
  projectForm,
  samplingDateStart,
  samplingDateEnd,
  handleSamplingDateChange,
  saveProject
} = useProject(props.projectId)

const { tempInputs, handleNumberInput, handleNumberBlur, initTempInputs } = useNumericInput()

const formData = projectForm

const needV0ConversionFlag = computed(() => {
  return needV0Conversion(formData.value.sampling_temperature, formData.value.sampling_air_pressure)
})

const emitSave = () => {
  saveProject()
  emit('save', formData.value)
}

const handleBlur = (field: keyof typeof tempInputs.value) => {
  handleNumberBlur(field, (val: number | null) => {
    // 映射 tempInputs 字段到 ProjectFormData 字段
    const formField = field as keyof ProjectFormData
    if (formField in formData.value) {
      ;(formData.value as Record<string, number | null | string>)[formField] = val
    }
    saveProject()
    emit('envChange', formData.value)
  })
}

// 初始化
const init = async () => {
  await (useProject(props.projectId).loadProject())
  initTempInputs({
    sampling_temperature: formData.value.sampling_temperature,
    sampling_air_pressure: formData.value.sampling_air_pressure,
    analysis_temperature_min: formData.value.analysis_temperature_min,
    analysis_temperature_max: formData.value.analysis_temperature_max,
    analysis_humidity_min: formData.value.analysis_humidity_min,
    analysis_humidity_max: formData.value.analysis_humidity_max
  })
}

defineExpose({ init, formData })
</script>

<style scoped>
.project-header-card {
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
</style>
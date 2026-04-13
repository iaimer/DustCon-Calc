<template>
  <el-card class="standard-weight-card">
    <template #header>
      <span>标准砝码检查</span>
    </template>

    <el-form :model="formData" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="砝码编号">
            <el-input v-model="formData.weight_no" @change="saveStandardWeight" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="原始质量">
            <el-input-number
              v-model="formData.original_mass"
              :precision="2"
              @change="saveStandardWeight"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="本次称重">
            <el-input-number
              v-model="formData.current_mass"
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
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useStandardWeight } from '../../composables/useStandardWeight'

const props = defineProps<{ projectId: number }>()

const projectIdRef = toRef(props, 'projectId')

const {
  standardWeightForm,
  standardWeightResult,
  standardWeightDiff,
  loadStandardWeight,
  saveStandardWeight
} = useStandardWeight(projectIdRef)

const formData = standardWeightForm

defineExpose({ loadStandardWeight })
</script>

<style scoped>
.standard-weight-card {
  margin-bottom: 20px;
}
</style>
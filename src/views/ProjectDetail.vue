<template>
  <div class="project-detail">
    <div class="collapsible-panels">
      <el-collapse v-model="activePanels">
        <el-collapse-item title="项目信息" name="project">
          <ProjectInfoForm
            ref="projectFormRef"
            :project-id="projectId"
            @save="onProjectSave"
            @envChange="onEnvChange"
          />
        </el-collapse-item>
        <el-collapse-item title="标准砝码检查" name="standardWeight">
          <StandardWeightForm
            ref="standardWeightRef"
            :project-id="projectId"
          />
        </el-collapse-item>
      </el-collapse>
    </div>

    <SampleTable
      ref="sampleTableRef"
      :project-id="projectId"
      @envChange="onEnvChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import ProjectInfoForm from '../components/project/ProjectInfoForm.vue'
import StandardWeightForm from '../components/project/StandardWeightForm.vue'
import SampleTable from '../components/samples/SampleTable.vue'
import type { ProjectFormData } from '../types/project'

const activePanels = ref<string[]>([])

const props = defineProps<{ projectId: number }>()
const emit = defineEmits(['projectSaved'])

const projectFormRef = ref<InstanceType<typeof ProjectInfoForm> | null>(null)
const standardWeightRef = ref<InstanceType<typeof StandardWeightForm> | null>(null)
const sampleTableRef = ref<InstanceType<typeof SampleTable> | null>(null)

const onProjectSave = (formData: ProjectFormData) => {
  sampleTableRef.value?.updateEnvParams({
    sampling_temperature: formData.sampling_temperature,
    sampling_air_pressure: formData.sampling_air_pressure
  })
  emit('projectSaved')
}

// 环境参数变化时更新样品计算
const onEnvChange = (formData: ProjectFormData) => {
  sampleTableRef.value?.updateEnvParams({
    sampling_temperature: formData.sampling_temperature,
    sampling_air_pressure: formData.sampling_air_pressure
  })
}

// 加载所有数据
const loadAllData = async () => {
  await projectFormRef.value?.init()
  await standardWeightRef.value?.loadStandardWeight()
  await sampleTableRef.value?.loadSamples()
}

// 监听projectId变化
watch(() => props.projectId, loadAllData)

onMounted(loadAllData)
</script>

<style scoped>
.project-detail {
  max-width: 1400px;
}
.collapsible-panels {
  margin-bottom: 12px;
}
.collapsible-panels :deep(.el-collapse-item__content) {
  padding-bottom: 0;
}
.collapsible-panels :deep(.el-card) {
  margin-bottom: 0;
  border: none;
  box-shadow: none;
}
</style>
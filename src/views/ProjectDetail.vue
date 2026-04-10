<template>
  <div class="project-detail">
    <ProjectInfoForm
      ref="projectFormRef"
      :project-id="projectId"
      @delete="emit('delete', projectId)"
      @save="onProjectSave"
      @envChange="onEnvChange"
    />

    <StandardWeightForm
      ref="standardWeightRef"
      :project-id="projectId"
    />

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

const props = defineProps<{ projectId: number }>()
const emit = defineEmits(['delete'])

const projectFormRef = ref<InstanceType<typeof ProjectInfoForm> | null>(null)
const standardWeightRef = ref<InstanceType<typeof StandardWeightForm> | null>(null)
const sampleTableRef = ref<InstanceType<typeof SampleTable> | null>(null)

// 项目保存时触发样品重新计算
const onProjectSave = (formData: ProjectFormData) => {
  sampleTableRef.value?.updateEnvParams({
    sampling_temperature: formData.sampling_temperature,
    sampling_air_pressure: formData.sampling_air_pressure
  })
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
watch(() => props.projectId, loadAllData, { immediate: true })

onMounted(loadAllData)
</script>

<style scoped>
.project-detail {
  max-width: 1400px;
}
</style>
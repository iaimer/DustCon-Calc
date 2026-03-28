<template>
  <div class="app-container">
    <el-container style="height: 100vh">
      <el-aside :width="sidebarCollapsed ? '0px' : '300px'" class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-content" v-show="!sidebarCollapsed">
          <div class="sidebar-header">
            <h2>粉尘浓度计算器</h2>
            <el-button type="primary" @click="createNewProject" :icon="Plus">
              新建项目
            </el-button>
          </div>
          <div class="sidebar-search">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索项目..."
              :prefix-icon="Search"
              clearable
            />
          </div>
          <div class="project-list">
            <el-scrollbar>
              <div
                v-for="project in filteredProjects"
                :key="project.id"
                class="project-item"
                :class="{ active: selectedProjectId === project.id }"
                @click="selectProject(project.id)"
              >
                <div class="project-item-header">
                  <span class="project-name">{{ project.test_number || '未编号' }}</span>
                </div>
                <div class="project-item-date">
                  {{ formatDate(project.analysis_date) || '未设置日期' }}
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-aside>
      <div class="sidebar-toggle" :class="{ collapsed: sidebarCollapsed }" @click="sidebarCollapsed = !sidebarCollapsed">
        <el-icon :size="12">
          <ArrowLeft v-if="!sidebarCollapsed" />
          <ArrowRight v-else />
        </el-icon>
      </div>
      <el-main class="main-content">
        <ProjectDetail
          v-if="selectedProjectId"
          :project-id="selectedProjectId"
          @delete="handleProjectDelete"
        />
        <div v-else class="empty-state">
          <el-empty description="请选择或创建一个项目" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectDetail from './views/ProjectDetail.vue'
import dayjs from 'dayjs'

const projects = ref<any[]>([])
const selectedProjectId = ref<number | null>(null)
const searchKeyword = ref('')
const sidebarCollapsed = ref(false)

const filteredProjects = computed(() => {
  if (!searchKeyword.value) return projects.value
  const keyword = searchKeyword.value.toLowerCase()
  return projects.value.filter(p =>
    p.employer_name?.toLowerCase().includes(keyword) ||
    p.test_number?.toLowerCase().includes(keyword)
  )
})

const formatDate = (date: string) => {
  return date || ''
}

const loadProjects = async () => {
  try {
    projects.value = await window.electronAPI.getProjects()
  } catch (e) {
    ElMessage.error('加载项目列表失败')
  }
}

const createNewProject = async () => {
  try {
    const projectData = {
      employer_name: '新项目',
      test_number: '',
      analysis_location: '天平室',
      analysis_date: dayjs().format('YYYY.MM.DD'),
      sampling_date: '',
      test_standard: 'GBZ/T 192.1-2025',
      sampling_temperature: null,
      sampling_air_pressure: null,
      analysis_temperature_min: null,
      analysis_temperature_max: null,
      analysis_humidity_min: null,
      analysis_humidity_max: null,
      instrument_name: 'BT-125D分析天平',
      instrument_no: 'HX079',
      analyst: '',
      reviewer: ''
    }
    const result = await window.electronAPI.createProject(projectData)
    projects.value.unshift(result)
    selectedProjectId.value = result.id
    ElMessage.success('项目创建成功')
  } catch (e: any) {
    console.error('创建项目失败:', e)
    ElMessage.error(`创建项目失败: ${e?.message || '未知错误'}`)
  }
}

const selectProject = (id: number) => {
  selectedProjectId.value = id
}

const handleProjectDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该项目及其所有样品数据？', '删除确认', {
      type: 'warning'
    })
    await window.electronAPI.deleteProject(id)
    projects.value = projects.value.filter(p => p.id !== id)
    if (selectedProjectId.value === id) {
      selectedProjectId.value = null
    }
    ElMessage.success('项目已删除')
  } catch (e) {
    // 用户取消或出错
  }
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  background: #f5f7fa;
  position: relative;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  position: relative;
}

.sidebar.collapsed {
  border-right: none;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 300px;
}

.sidebar-toggle {
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  left: 288px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  transition: all 0.25s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  color: #909399;
}

.sidebar-toggle.collapsed {
  left: 8px;
}

.sidebar-toggle:hover {
  background: #409eff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.sidebar-search {
  padding: 10px 20px;
}

.project-list {
  flex: 1;
  overflow: hidden;
}

.project-item {
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #ebeef5;
  transition: background 0.2s;
}

.project-item:hover {
  background: #f5f7fa;
}

.project-item.active {
  background: #ecf5ff;
}

.project-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  font-weight: 500;
  color: #303133;
}

.project-item-date {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
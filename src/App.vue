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
                  <div class="project-actions">
                    <el-tooltip content="复制项目" placement="top">
                      <el-button
                        type="primary"
                        size="small"
                        :icon="DocumentCopy"
                        circle
                        @click.stop="copyProject(project.id)"
                      />
                    </el-tooltip>
                    <el-tooltip content="删除项目" placement="top">
                      <el-button
                        type="danger"
                        size="small"
                        :icon="Delete"
                        circle
                        @click.stop="deleteProject(project.id)"
                      />
                    </el-tooltip>
                  </div>
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
          @project-saved="onProjectSaved"
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
import { Plus, Search, ArrowLeft, ArrowRight, Delete, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectDetail from './views/ProjectDetail.vue'
import dayjs from 'dayjs'
import { tauriAPI } from './api/tauri'
import type { Project } from './types/project'

const projects = ref<Project[]>([])
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

const formatDate = (date: string | null) => {
  return date || ''
}

const loadProjects = async () => {
  try {
    projects.value = await tauriAPI.getProjects()
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
      test_standard: 'GBZ/T 192.1-2025' as const,
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
    const result = await tauriAPI.createProject(projectData)
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

const onProjectSaved = async () => {
  await loadProjects()
}

const deleteProject = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该项目及其所有样品数据？', '删除确认', {
      type: 'warning'
    })
    await tauriAPI.deleteProject(id)
    projects.value = projects.value.filter(p => p.id !== id)
    if (selectedProjectId.value === id) {
      selectedProjectId.value = null
    }
    ElMessage.success('项目已删除')
  } catch (e: any) {
    if (e !== 'cancel' && e?.code !== 'ERR_CANCEL' && !(e instanceof Error && e.message?.includes('cancel'))) {
      console.error('删除项目失败:', e)
      ElMessage.error(`删除失败: ${e?.message || '未知错误'}`)
    }
  }
}

const copyProject = async (id: number) => {
  try {
    await ElMessageBox.confirm('复制项目将保留项目信息和标准砝码检查，不复制样品数据', '复制项目', {
      type: 'info',
      confirmButtonText: '复制',
      cancelButtonText: '取消'
    })
    const result = await tauriAPI.copyProject(id)
    const newProject = await tauriAPI.getProject(result.id)
    if (newProject) projects.value.unshift(newProject)
    selectedProjectId.value = result.id
    ElMessage.success('项目已复制')
  } catch (e: any) {
    if (e !== 'cancel' && e?.code !== 'ERR_CANCEL' && !(e instanceof Error && e.message?.includes('cancel'))) {
      console.error('复制项目失败:', e)
      ElMessage.error(`复制失败: ${e?.message || '未知错误'}`)
    }
  }
}

onMounted(() => {
  loadProjects()
})
</script>

<style>
body {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

.el-message-box, .el-dialog, .el-form-item__label, .el-input__inner, .el-button, .el-table {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>

<style scoped>
.app-container {
  height: 100vh;
  background: #f5f7fa;
  position: relative;
}

.sidebar {
  background: #fff;
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
  width: 16px;
  height: 48px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  left: 300px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  transition: all 0.25s ease;
  box-shadow: 1px 0 4px rgba(0, 0, 0, 0.08);
  color: #909399;
  border-radius: 0 4px 4px 0;
}
.sidebar-toggle.collapsed {
  left: 0;
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

.project-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.project-item:hover .project-actions {
  opacity: 1;
}

.project-actions .el-button {
  width: 24px;
  height: 24px;
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
  padding: 0 0 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
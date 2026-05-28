<template>
  <div class="app-container">
    <el-container style="height: 100vh">
      <el-aside
        :width="sidebarCollapsed ? '0px' : '300px'"
        class="sidebar"
        :class="{ collapsed: sidebarCollapsed }"
        @mouseenter="cancelCollapse"
        @mouseleave="scheduleCollapse"
      >
        <div class="sidebar-content" v-show="!sidebarCollapsed">
          <div class="sidebar-header">
            <div class="sidebar-title-group">
              <h2>粉尘浓度计算器</h2>
              <span class="sidebar-subtitle">Dust Concentration Analyzer</span>
            </div>
          <div class="sidebar-header-actions">
            <el-button type="primary" @click="createNewProject" :icon="Plus">
              新建项目
            </el-button>
            </div>
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
                      <el-button type="primary" size="small" circle @click.stop="copyProject(project.id)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="删除项目" placement="top">
                      <el-button type="danger" size="small" circle @click.stop="deleteProject(project.id)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </el-button>
                    </el-tooltip>
                  </div>
                </div>
                <div class="project-item-date">
                  {{ formatDate(project.analysis_date) || '未设置日期' }}
                </div>
              </div>
            </el-scrollbar>
          </div>
          <div class="sidebar-footer" @click="sidebarCollapsed = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="3" x2="3" y2="21"/>
              <polyline points="9 3 3 12 9 21"/>
            </svg>
            <span>折叠侧栏</span>
          </div>
        </div>
      </el-aside>
      <el-main class="main-content">
        <div v-if="sidebarCollapsed" class="sidebar-hover-zone" @mouseenter="expandSidebar" />
        <ProjectDetail
          v-if="selectedProjectId"
          :project-id="selectedProjectId"
          @project-saved="onProjectSaved"
        />
        <div v-else class="empty-state">
          <div class="empty-guide">
            <div class="empty-guide-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="8" width="40" height="48" rx="4" stroke="#C0C4CC" stroke-width="2" fill="none"/>
                <line x1="20" y1="24" x2="44" y2="24" stroke="#E4E7ED" stroke-width="2"/>
                <line x1="20" y1="32" x2="44" y2="32" stroke="#E4E7ED" stroke-width="2"/>
                <line x1="20" y1="40" x2="36" y2="40" stroke="#E4E7ED" stroke-width="2"/>
                <circle cx="32" cy="52" r="6" fill="#ECF5FF" stroke="#409EFF" stroke-width="1.5"/>
                <line x1="32" y1="49" x2="32" y2="55" stroke="#409EFF" stroke-width="2" stroke-linecap="round"/>
                <line x1="29" y1="52" x2="35" y2="52" stroke="#409EFF" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="empty-guide-title">欢迎使用粉尘浓度计算器</h3>
            <p class="empty-guide-text">选择左侧已有项目，或点击下方按钮创建新项目</p>
            <el-button type="primary" @click="createNewProject" :icon="Plus" size="large">
              新建项目
            </el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectDetail from './views/ProjectDetail.vue'
import dayjs from 'dayjs'
import { tauriAPI } from './api/tauri'
import type { Project } from './types/project'

const projects = ref<Project[]>([])
const selectedProjectId = ref<number | null>(null)
const searchKeyword = ref('')
const sidebarCollapsed = ref(false)
let autoHideTimer: ReturnType<typeof setTimeout> | null = null

const expandSidebar = () => {
  if (autoHideTimer) clearTimeout(autoHideTimer)
  autoHideTimer = null
  sidebarCollapsed.value = false
}

const scheduleCollapse = () => {
  if (autoHideTimer) clearTimeout(autoHideTimer)
  autoHideTimer = setTimeout(() => {
    sidebarCollapsed.value = true
  }, 400)
}

const cancelCollapse = () => {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
    autoHideTimer = null
  }
}

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
    console.error('加载项目列表失败:', e)
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

.sidebar-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sidebar-hover-zone {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9999;
  width: 18px;
  height: 100vh;
  cursor: default;
}
.sidebar-hover-zone::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(64,158,255,0);
  transition: background 0.2s ease;
}
.sidebar-hover-zone:hover::after {
  background: rgba(64,158,255,0.06);
}

.sidebar-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-title-group h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  line-height: 1.3;
}

.sidebar-subtitle {
  font-size: 11px;
  color: #c0c4cc;
  letter-spacing: 0.5px;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s;
  flex-shrink: 0;
}
.sidebar-footer:hover {
  color: #409eff;
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
  border-left: 3px solid #409eff;
  padding-left: 17px;
}

.project-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-actions {
  display: flex;
  gap: 4px;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s, visibility 0.15s;
}

.project-item:hover .project-actions {
  visibility: visible;
  opacity: 1;
}

.project-actions .el-button {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
.empty-guide {
  text-align: center;
}
.empty-guide-icon {
  margin-bottom: 16px;
}
.empty-guide-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}
.empty-guide-text {
  font-size: 14px;
  color: #909399;
  margin: 0 0 24px;
}
</style>
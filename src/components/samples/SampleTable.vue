<template>
  <el-card class="samples-card">
    <template #header>
      <div class="card-header">
        <span>样品数据</span>
        <div class="header-actions">
          <el-switch
            v-model="isTranscriptionView"
            active-text="誊抄视图"
            inactive-text="完整视图"
            style="margin-right: 20px"
          />
          <el-button type="primary" size="small" @click="handleAddRows">
            新增行
          </el-button>
          <el-button size="small" @click="batchSetVolume">
            批量设置体积
          </el-button>
          <el-button type="danger" size="small" @click="handleClearAllSamples">
            清空表格
          </el-button>
        </div>
      </div>
    </template>

    <!-- 最低定量浓度提示 -->
    <div class="quantitative-concentration-tip">
      <el-alert type="info" :closable="false">
        <template #title>
          最低定量浓度参考：
          500L → 0.2 mg/m³ | 300L → 0.34 mg/m³ | 420L → 0.24 mg/m³ | 450L → 0.23 mg/m³ | 480L → 0.21 mg/m³ | 525L → 0.20 mg/m³
          <span style="margin-left: 20px; color: #909399;">| 支持单列粘贴（Ctrl+V）：点击该列输入框后粘贴数据</span>
        </template>
      </el-alert>
    </div>

    <!-- 完整视图表格 -->
    <el-table
      v-show="!isTranscriptionView"
      :data="samples"
      border
      :height="tableHeight"
      :row-class-name="getRowClassName"
      @paste.capture.prevent="handlePaste"
      class="excel-table"
    >
      <el-table-column prop="sample_type" label="类型" width="70" fixed>
        <template #default="{ row }">
          <el-tag :type="row.sample_type === '空白' ? 'warning' : 'primary'" size="small">
            {{ row.sample_type || '-' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="sample_no" label="样品编号" width="200" fixed>
        <template #default="{ row, $index }">
          <div
            :data-cell="$index + '-sample_no'"
            class="excel-cell"
            :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 0 }"
            @click="handleCellClick($index, 'sample_no')"
          >
            <el-input
              v-model="row.sample_no"
              size="small"
              @change="updateSample(row)"
              @keydown="onKeydown($event, $index, 'sample_no')"
              @focus="handleCellFocus($index, 'sample_no')"
              @paste.prevent.stop
              placeholder="输入编号"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="filter_no" label="滤膜编号" width="100">
        <template #default="{ row, $index }">
          <div
            :data-cell="$index + '-filter_no'"
            class="excel-cell"
            :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 1 }"
            @click="handleCellClick($index, 'filter_no')"
          >
            <el-input
              v-model="row.filter_no"
              size="small"
              @change="updateSample(row)"
              @keydown="onKeydown($event, $index, 'filter_no')"
              @focus="handleCellFocus($index, 'filter_no')"
              @paste.prevent.stop
              placeholder="可选"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="w1" label="采样前W₁(mg)" width="110">
        <template #default="{ row, $index }">
          <div
            :data-cell="$index + '-w1'"
            class="excel-cell"
            :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 2 }"
            @click="handleCellClick($index, 'w1')"
          >
            <el-input
              v-model="row.w1"
              size="small"
              @change="handleWChange(row, 'w1')"
              @keydown="onKeydown($event, $index, 'w1')"
              @focus="handleCellFocus($index, 'w1')"
              @blur="handleWBlur(row, 'w1')"
              style="width: 100%"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column label="采样后W₂(mg)" width="260">
        <el-table-column prop="w2_first" label="第一次" width="86">
          <template #default="{ row, $index }">
            <div
              :data-cell="$index + '-w2_first'"
              class="excel-cell"
            :class="{
              'cell-selected': currentCell?.row === $index && currentCell?.col === 3,
              'w2-qc-fail': row.weighing_qc === '不合格'
            }"
              @click="handleCellClick($index, 'w2_first')"
            >
              <el-input
                v-model="row.w2_first"
                size="small"
                @change="handleWChange(row, 'w2_first')"
                @keydown="onKeydown($event, $index, 'w2_first')"
                @focus="handleCellFocus($index, 'w2_first')"
                @blur="handleWBlur(row, 'w2_first')"
                style="width: 100%"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="w2_second" label="第二次" width="86">
          <template #default="{ row, $index }">
            <div
              :data-cell="$index + '-w2_second'"
              class="excel-cell"
            :class="{
              'cell-selected': currentCell?.row === $index && currentCell?.col === 4,
              'w2-qc-fail': row.weighing_qc === '不合格'
            }"
              @click="handleCellClick($index, 'w2_second')"
            >
              <el-input
                v-model="row.w2_second"
                size="small"
                @change="handleWChange(row, 'w2_second')"
                @keydown="onKeydown($event, $index, 'w2_second')"
                @focus="handleCellFocus($index, 'w2_second')"
                @blur="handleWBlur(row, 'w2_second')"
                style="width: 100%"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="w2_avg" label="平均(mg)" width="86">
          <template #default="{ row }">
            <span :class="{ 'qc-fail': row.weighing_qc === '不合格' }">
              {{ row.w2_avg?.toFixed(2) || '-' }}
            </span>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column prop="delta_m" label="增重Δm(mg)" width="100">
        <template #default="{ row }">
          <span :class="{ 'qc-fail': row.delta_m_qc === '不合格' }">
            {{ row.delta_m?.toFixed(2) || '-' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="vt" label="Vt(L)" width="100">
        <template #default="{ row, $index }">
          <span v-if="row.sample_type === '空白'">/</span>
          <div
            v-else
            :data-cell="$index + '-vt'"
            class="excel-cell"
            :class="{ 'cell-selected': currentCell?.row === $index && currentCell?.col === 5 }"
            @click="handleCellClick($index, 'vt')"
          >
            <el-input
              v-model="row.vt"
              size="small"
              placeholder="500"
              @change="handleVtChange(row)"
              @keydown="onKeydown($event, $index, 'vt')"
              @focus="handleCellFocus($index, 'vt')"
              @paste.prevent.stop
              style="width: 100%"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="v0" label="V0(L)" width="80">
        <template #default="{ row }">
          <span>{{ formatVolume(row, row.v0) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="concentration" label="浓度(mg/m³)" width="100">
        <template #default="{ row }">
          <span>{{ row.concentration?.toFixed(3) || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="rounded_value" label="检测值(mg/m³)" width="110">
        <template #default="{ row }">
          <span v-if="row.is_detected === '未检出'" class="not-detected">
            未检出
          </span>
          <span v-else class="rounded-value">
            {{ formatRoundedValue(row) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="60">
        <template #default="{ row, $index }">
          <el-button type="danger" size="small" :icon="Delete" circle @click="deleteSampleRow(row, $index)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 誊抄视图表格 -->
    <el-table
      v-show="isTranscriptionView"
      :data="samples"
      border
      stripe
      :height="tableHeight"
      highlight-current-row
      :row-class-name="getRowClassName"
      class="excel-table"
    >
      <el-table-column prop="sample_type" label="类型" width="70" fixed>
        <template #default="{ row }">
          <el-tag :type="row.sample_type === '空白' ? 'warning' : 'primary'" size="small">
            {{ row.sample_type || '-' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="sample_no" label="样品编号" width="200" fixed>
        <template #default="{ row }">{{ row.sample_no || '-' }}</template>
      </el-table-column>

      <el-table-column prop="filter_no" label="滤膜编号" width="100">
        <template #default="{ row }">{{ row.filter_no || '-' }}</template>
      </el-table-column>

      <el-table-column prop="w1" label="采样前W₁(mg)" width="110">
        <template #default="{ row }">{{ row.w1?.toFixed(2) || '-' }}</template>
      </el-table-column>

      <el-table-column label="采样后W₂(mg)" width="260">
        <el-table-column prop="w2_first" label="第一次" width="86">
          <template #default="{ row }">
            <div class="trans-cell" :class="{ 'w2-qc-fail': row.weighing_qc === '不合格' }">
              <span :class="{ 'qc-fail': row.weighing_qc === '不合格' }">
                {{ row.w2_first?.toFixed(2) || '-' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="w2_second" label="第二次" width="86">
          <template #default="{ row }">
            <div class="trans-cell" :class="{ 'w2-qc-fail': row.weighing_qc === '不合格' }">
              <span :class="{ 'qc-fail': row.weighing_qc === '不合格' }">
                {{ row.w2_second?.toFixed(2) || '-' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="w2_avg" label="平均(mg)" width="86">
          <template #default="{ row }">
            <div class="trans-cell" :class="{ 'w2-qc-fail': row.weighing_qc === '不合格' }">
              <span :class="{ 'qc-fail': row.weighing_qc === '不合格' }">
                {{ row.w2_avg?.toFixed(2) || '-' }}
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column prop="delta_m" label="增重Δm(mg)" width="100">
        <template #default="{ row }">
          <span :class="{ 'qc-fail': row.delta_m_qc === '不合格' }">
            {{ row.delta_m?.toFixed(2) || '-' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="vt" label="Vt(L)" width="80">
        <template #default="{ row }">{{ formatVolume(row, row.vt) }}</template>
      </el-table-column>

      <el-table-column prop="v0" label="V0(L)" width="80">
        <template #default="{ row }">{{ formatVolume(row, row.v0) }}</template>
      </el-table-column>

      <el-table-column prop="concentration" label="浓度(mg/m³)" width="100">
        <template #default="{ row }">{{ row.concentration?.toFixed(3) || '-' }}</template>
      </el-table-column>

      <el-table-column label="检测值(mg/m³)" width="110">
        <template #default="{ row }">
          <span class="rounded-value">{{ formatRoundedValue(row) }}</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, toRef, computed, onMounted, onUnmounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useSamples } from '../../composables/useSamples'
import { useSampleTableNavigation } from '../../composables/useSampleTableNavigation'
import { usePasteHandler } from '../../composables/usePasteHandler'

const viewportHeight = ref(window.innerHeight)

const updateViewportHeight = () => {
  viewportHeight.value = window.innerHeight
}

onMounted(() => window.addEventListener('resize', updateViewportHeight))
onUnmounted(() => window.removeEventListener('resize', updateViewportHeight))

const tableHeight = computed(() => viewportHeight.value - 260)

const props = defineProps<{ projectId: number }>()
const emit = defineEmits(['envChange'])

const projectIdRef = toRef(props, 'projectId')

const {
  samples,
  isTranscriptionView,
  samplingTemp,
  samplingPressure,
  formatRoundedValue,
  formatVolume,
  getRowClassName,
  loadSamples,
  updateSample,
  addSampleRows,
  handleAddRows,
  deleteSampleRow,
  handleClearAllSamples,
  batchSetVolume,
  handleVtChange,
  handleWChange,
  handleWBlur,
  recalculateAllV0
} = useSamples(projectIdRef)

const {
  currentCell,
  handleCellKeydown,
  handleCellClick,
  handleCellFocus
} = useSampleTableNavigation(() => samples.value.length)

const { handlePaste } = usePasteHandler(
  samples,
  addSampleRows,
  updateSample
)

const updateEnvParams = (env: { sampling_temperature: number | null; sampling_air_pressure: number | null }) => {
  samplingTemp.value = env.sampling_temperature
  samplingPressure.value = env.sampling_air_pressure
  recalculateAllV0()
}

const onKeydown = (e: Event, row: number, field: 'sample_no' | 'filter_no' | 'w1' | 'w2_first' | 'w2_second' | 'vt') => {
  handleCellKeydown(e as KeyboardEvent, row, field)
}

defineExpose({ loadSamples, updateEnvParams })
</script>

<style scoped>
.samples-card {
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
.quantitative-concentration-tip {
  margin-bottom: 15px;
}
.qc-fail {
  color: #f56c6c;
  font-weight: bold;
}
.rounded-value {
  font-weight: bold;
  color: #409eff;
}
.not-detected {
  color: #909399;
  font-style: italic;
}
:deep(.qc-fail-row) {
  background-color: #fef0f0 !important;
}
:deep(.el-table__body tr.current-row > td) {
  background-color: #ecf5ff !important;
  font-weight: 500;
  color: #409eff !important;
}
:deep(.el-table) {
  font-size: 13px;
}
.excel-table :deep(.el-table__body .el-table__cell) {
  padding: 0;
}
.excel-table :deep(th .cell) {
  text-align: center;
}
.excel-cell {
  width: 100%;
  height: 100%;
  padding: 4px 8px;
  box-sizing: border-box;
  cursor: cell;
  transition: background-color 0.15s;
}
.excel-cell:hover {
  background-color: #f5f7fa;
}
.excel-cell.cell-selected {
  background-color: #ecf5ff;
  box-shadow: inset 0 0 0 2px #409eff;
}
.excel-cell.w2-qc-fail,
.trans-cell.w2-qc-fail {
  background-color: #fef0f0;
}
.excel-cell.w2-qc-fail:hover {
  background-color: #fde2e2;
}
.trans-cell {
  padding: 4px 8px;
  box-sizing: border-box;
  text-align: center;
}
.excel-cell :deep(.el-input) {
  border: none;
  background: transparent;
}
.excel-cell :deep(.el-input__wrapper) {
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 0;
}
.excel-cell :deep(.el-input__wrapper:hover),
.excel-cell :deep(.el-input__wrapper.is-focus) {
  box-shadow: none;
}
.excel-cell :deep(.el-input__inner) {
  border: none;
  background: transparent;
  padding: 0;
  height: 24px;
  line-height: 24px;
}
</style>

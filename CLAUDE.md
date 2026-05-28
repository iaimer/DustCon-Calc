# CLAUDE.md — 项目知识库

> 粉尘浓度计算器 — 基于 GBZ/T 192 标准的工作场所粉尘浓度分析记录桌面应用。Apple Silicon 原生应用。

## 快速命令

```bash
npm run dev          # 启动前端开发服务器
npm run tauri:dev    # 启动 Tauri 开发模式
npm run build        # 仅构建前端（vue-tsc + vite build）
npm run tauri:build  # 构建发布版 DMG（aarch64）
npm run test         # 运行单元测试
npm run test:watch   # 监听模式运行测试
```

## 关键约束

### 平台
- 构建目标：`aarch64-apple-darwin`（Apple Silicon only）
- 无需支持 Intel / Windows / Linux

### 语言与标准
- 代码注释 / 用户界面：中文
- 遵循 GBZ/T 192.1-2025、GBZ/T 192.2-2025、GB/T 8170 标准

### 数据存储
- 本地 SQLite（`~/Library/Application Support/dust-calculator/dust-calculator.db`）
- 数据库迁移在启动时自动运行（ALTER TABLE 处理存量数据）

### 依赖控制
- 非必要不新增 npm/cargo 依赖
- 已有 `directories` crate 已被移除（手动拼接路径）

## 架构概览

```
┌─────────────────┐         ┌─────────────────┐
│  Frontend (Vue) │ invoke  │  Rust Backend   │
│  src/           │ ◄─────► │  src-tauri/     │
│                 │         │                 │
│  Vue 3 +        │         │  rusqlite       │
│  Element Plus   │         │  SQLite DB      │
└─────────────────┘         └─────────────────┘
```

### 后端 (src-tauri/src/)

| 路径 | 职责 |
|------|------|
| `main.rs` | 应用入口 |
| `lib.rs` | Tauri setup + handler 注册 |
| `db/mod.rs` | SQLite 连接初始化 + 迁移；`get_connection()` 返回 `Result<MutexGuard, String>` |
| `commands/mod.rs` | 公共工具函数 `empty_to_null` |
| `commands/projects.rs` | 项目 CRUD（6 个命令） |
| `commands/samples.rs` | 样品 CRUD（5 个命令，含 batch_create_samples 事务） |
| `commands/standard_weights.rs` | 标准砝码 CRUD（3 个命令） |

### 前端 (src/)

| 路径 | 职责 |
|------|------|
| `views/ProjectDetail.vue` | 主视图：项目信息 + 砝码检查 + 样品表格 |
| `components/project/` | 项目信息表单、砝码检查表单 |
| `components/samples/SampleTable.vue` | 样品表格（完整视图 + 誊抄视图双模式） |
| `composables/useProject.ts` | 项目数据加载/保存逻辑 |
| `composables/useSamples.ts` | 样品数据加载/保存/计算逻辑 |
| `composables/useStandardWeight.ts` | 砝码数据逻辑 |
| `composables/useSampleTableNavigation.ts` | 表格键盘导航（Tab/方向键） |
| `composables/usePasteHandler.ts` | Excel 批量粘贴处理 |
| `composables/useNumericInput.ts` | 温度/气压数值输入过滤与格式化 |
| `api/tauri.ts` | Tauri invoke 封装层 |
| `types/` | TypeScript 类型定义（Project/Sample/StandardWeight） |
| `utils/calculator.ts` | 核心计算模块（GB/T 8170 修约、V0 换算、QC 判定） |

### 数据库表

- `projects`：检测项目元数据（用人单位、日期、环境参数）
- `samples`：样品数据（称量值、计算值、质控判定）
- `standard_weights`：标准砝码检查记录

### Tauri Commands（共 14 个）

| 分类 | 命令 |
|------|------|
| Projects | `get_projects`, `get_project`, `create_project`, `update_project`, `delete_project`, `copy_project` |
| Samples | `get_samples`, `create_sample`, `update_sample`, `delete_sample`, `batch_create_samples` |
| StandardWeights | `get_standard_weight`, `create_standard_weight`, `update_standard_weight` |

### 核心计算 (`calculator.ts`)

- **四舍六入五成双**（`roundBank`）：严格遵循 GB/T 8170
- **V0 换算**：温度 < 5°C 或 > 35°C，或气压 < 98.8kPa 或 > 103.4kPa 时自动计算
- **样品类型判定**：编号含 `-0-` 的为空白样品
- **QC 判定**：称量质控 ≤ 0.2mg、空白 Δm ≤ 0.02mg、样品 Δm > 0.1mg
- **检出限临界值**：当原始浓度 < 最低定量浓度但 roundBank 修约后 ≥ 最低定量浓度时，改为向下取整避免矛盾

### 采样体积与精度

| 体积 | 检测值精度 | 最低定量浓度 |
|------|-----------|-------------|
| 500L | 1 位小数 | 0.2 mg/m³ |
| 300L | 2 位小数 | 0.34 mg/m³ |
| 420L | 2 位小数 | 0.24 mg/m³ |
| 450L | 2 位小数 | 0.23 mg/m³ |
| 480L | 2 位小数 | 0.21 mg/m³ |
| 525L | 2 位小数 | 0.20 mg/m³ |

### QC 内联显示

QC 状态不占独立列，改为嵌入单元格内联指示：
- 称量质控不合格 → W₂ 输入框红色背景（`w2-qc-fail`）、平均值红色文字
- 增重质控不合格 → Δm 红色文字
- 未检出 → 检测值列显示「未检出」灰色斜体

## 重要决策记录

| 决策 | 原因 | 影响范围 |
|------|------|----------|
| 从 Electron 迁移到 Tauri | 体积从 ~150MB 降至 ~4MB，原生性能，Apple Silicon 原生支持 | 整体架构 |
| `get_connection()` 返回 `Result` 而非 unwrap | 防止 Mutex 中毒导致整个应用崩溃 | `db/mod.rs` + 所有 commands 调用者 |
| `batch_create_samples` 使用 `unchecked_transaction` | 避免批量插入中途失败时部分写入 | `commands/samples.rs` |
| QC 列改为内联指示 | 匹配 Word 模板布局，减少列数，阅读更直观 | `SampleTable.vue` 表格结构 |
| `empty_to_null` 提取到 `commands/mod.rs` | 消除 3 个命令文件中 8 行重复代码 | `commands/` 模块 |
| 检出限临界值修约改为向下取整 | 避免 roundBank 修约后值 ≥ 检出限但实际浓度 < 检出限导致矛盾 | `utils/calculator.ts` |
| 表格高度动态计算（`innerHeight - 260`） | 适配不同屏幕尺寸，不再固定 400px | `SampleTable.vue` |
| 面板可折叠（`el-collapse`） | 节省空间，用户可按需展开/收起项目信息和砝码检查 | `ProjectDetail.vue` |
| 粘贴解析用 `nextTick` 替代 `setTimeout(0)` | 更可靠、更语义化 | `useSampleTableNavigation.ts` |
| 粘贴 `weight` 字段用 `isNaN` 检查替代 `|| null` | `|| null` 会吞掉 `0` 值 | `usePasteHandler.ts` |
| 侧栏折叠改为底栏「◄ 折叠侧栏」 | 迷你图标按钮和「新建项目」主按钮不协调，底栏方案视觉统一 | `App.vue` |
| 移除 `<Transition mode="out-in">` | 切换项目时重建组件干扰 `onMounted` 子组件 ref 的数据加载时序 | `ProjectDetail.vue` |
| 类型 + 样品编号列冻结 | 水平滚动时关键列保持可见，提升录入效率 | `SampleTable.vue` |
| 去除 ProjectInfoForm/StandardWeightForm 内层 `<el-card>` | 面板已放置在 `el-collapse` 内，内层卡片导致标题重复 | `ProjectInfoForm.vue`, `StandardWeightForm.vue` |
| 内联 SVG 替代 Element Plus 图标组件 | 图标在 Tauri 中渲染不一致，内联 SVG 更可靠 | `App.vue` |

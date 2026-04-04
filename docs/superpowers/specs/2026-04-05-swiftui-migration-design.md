# 粉尘数据计算器：Electron → SwiftUI 原生迁移设计

## Context

现有粉尘数据计算器使用 Electron + Vue 3 + Element Plus + sql.js 构建。用户主要需求是减少应用体积（Electron 打包后 100-200MB，原生应用可控制在 10-20MB）。目标平台仅 macOS，愿意投入时间追求最佳原生体验，要求保留全部现有功能。

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   SwiftUI Views                  │
│  ┌─────────────┐  ┌─────────────────────────┐   │
│  │ ProjectList │  │    ProjectDetailView    │   │
│  │   View      │  │  ┌─────────────────┐    │   │
│  │             │  │  │ SampleTable View │    │   │
│  └─────────────┘  │  └─────────────────┘    │   │
│                   │  ┌─────────────────┐    │   │
│                   │  │ ProjectForm View│    │   │
│                   │  └─────────────────┘    │   │
│                   └─────────────────────────┘   │
├─────────────────────────────────────────────────┤
│                 ViewModel / Store               │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ProjectStore │  │ SampleStore │              │
│  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────┤
│                   Data Layer                     │
│  ┌─────────────────────────────────────────┐   │
│  │        GRDB.swift (SQLite ORM)          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌────────────┐ │   │
│  │  │Project  │ │ Sample  │ │ StdWeight  │ │   │
│  │  │ Record  │ │ Record  │ │  Record    │ │   │
│  │  └─────────┘ └─────────┘ └────────────┐ │   │
│  └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│                 Business Logic                  │
│  ┌─────────────────────────────────────────┐   │
│  │       Calculator.swift (纯函数)          │   │
│  │  roundBank(), calculateV0(), etc.       │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**架构模式**: MVVM + 单向数据流，使用 Swift 5.9 `@Observable` 进行状态管理。

## Data Layer

### Database Location

- 原 Electron: `app.getPath('userData')/dust-calculator.db`
- 新原生: `~/Library/Application Support/DustCalculator/dust-calculator.db`

### Table Schema

保持与原版一致的 3 张表结构：

**ProjectRecord (17 fields)**
```swift
struct ProjectRecord: Codable, FetchableRecord, PersistableRecord {
    var id: Int64?
    var employerName: String
    var testNumber: String
    var analysisLocation: String
    var analysisDate: Date
    var samplingDate: Date
    var testStandard: String
    var samplingTemperature: Double?
    var samplingAirPressure: Double?
    var analysisTemperatureMin: Double?
    var analysisTemperatureMax: Double?
    var analysisHumidityMin: Double?
    var analysisHumidityMax: Double?
    var instrumentName: String?
    var instrumentNo: String?
    var analyst: String?
    var reviewer: String?
    var createdAt: Date
    var updatedAt: Date
}
```

**SampleRecord (16 fields)**
```swift
struct SampleRecord: Codable, FetchableRecord, PersistableRecord {
    var id: Int64?
    var projectId: Int64
    var sampleType: String
    var sampleNo: String
    var filterNo: String
    var w1: Double?
    var w2First: Double?
    var w2Second: Double?
    var w2Avg: Double?
    var weighingDiff: Double?
    var weighingQC: Bool?
    var deltaM: Double?
    var deltaMQC: Bool?
    var vt: Double?
    var v0: Double?
    var concentration: Double?
    var roundedValue: Double?
}
```

**StandardWeightRecord (6 fields)**
```swift
struct StandardWeightRecord: Codable, FetchableRecord, PersistableRecord {
    var id: Int64?
    var projectId: Int64
    var weightNo: String
    var originalMass: Double?
    var currentMass: Double?
    var checkResult: String?
}
```

### Data Migration

启动时检测旧数据库文件，提示用户迁移：
1. 检测 Electron 数据库路径是否存在
2. 如存在，显示迁移对话框
3. 使用 GRDB 直接读取旧 SQLite 文件
4. 复制所有记录到新数据库
5. 原文件保留作为备份

## UI Components

### View Hierarchy

```
AppView (根视图)
├── SidebarView (项目列表侧边栏)
│   ├── ProjectListView
│   │   └── ProjectRowView (单个项目卡片)
│   └── SearchBarView
│
└── ContentView (主内容区)
    ├── ProjectDetailView (项目详情)
    │   ├── ProjectFormView (项目信息表单)
    │   │   ├── FormSection: 基本信息
    │   │   ├── FormSection: 分析环境
    │   │   └── FormSection: 仪器信息
    │   │
    │   ├── SampleTableView (样品数据表格 ⭐核心难点)
    │   │   ├── TableHeaderView (列标题)
    │   │   ├── SampleRowView (单行数据)
    │   │   └── SampleCellView (单个单元格)
    │   │
    │   ├── StandardWeightView (标准砝码)
    │   │
    │   └── ToolbarView (操作按钮栏)
    │       ├── 视图切换 (完整/誊抄)
    │       ├── 导出按钮
    │       └── QC 检查按钮
    │
    └── EmptyStateView (无项目时显示)
```

### Key UI Features

1. **SwiftUI Table API** (macOS 12+): 使用原生 `Table` 和 `TableRow` 组件
2. **Keyboard Navigation**: `FocusState` 管理单元格焦点，监听方向键/Tab/Enter
3. **Excel Paste**: `NSPasteboard` 解析制表符分隔数据，批量填充
4. **Dual View Toggle**: 完整视图显示所有列，誊抄视图仅显示必要列

## Business Logic

Calculator.swift 直接翻译 calculator.ts (299 行)，保持算法完全一致：

### Core Functions

```swift
/// 四舍六入五成双 (GB/T 8170)
func roundBank(_ value: Double, decimals: Int) -> Double

/// V0 标准体积转换
func calculateV0(vt: Double, temperature: Double, pressure: Double) -> Double?

/// 检测值修约
func roundDetectionValue(_ concentration: Double, volume: Int) -> Double

/// QC 检查
func checkWeighingQC(w2First: Double, w2Second: Double) -> Bool  // ≤ 0.2mg
func checkBlankQC(deltaM: Double) -> Bool  // ≤ 0.02mg
func checkSampleQC(deltaM: Double) -> Bool  // > 0.1mg
```

### Sampling Volumes

| 体积 | 检测值修约 | 最小定量浓度 |
|------|----------|-------------|
| 500L | 1 位小数 | 0.2 mg/m³ |
| 300L/420L/450L/525L | 2 位小数 | - |

## Testing Strategy

### Test Levels

| 层级 | 工具 | 优先级 |
|------|------|--------|
| 单元测试 | XCTest | 高 (Calculator) |
| 数据库测试 | XCTest + GRDB | 中 |
| UI 测试 | XCTest UI | 低 |

### Calculator Tests

直接移植 tests/calculator.test.ts (278 行)，确保 Swift 版本与 TypeScript 版本输出完全相同：

```swift
func testRoundBank() {
    XCTAssertEqual(roundBank(1.25, 1), 1.2)   // 五后空，前偶，舍
    XCTAssertEqual(roundBank(1.35, 1), 1.4)   // 五后空，前奇，进
    XCTAssertEqual(roundBank(1.2501, 1), 1.3) // 五后有数，进
}
```

### Verification Flow

1. 完成 Calculator.swift + 测试
2. 用相同输入对比 TS/Swift 输出
3. 确保 100% 一致后再继续开发

## Project Structure

```
DustCalculator/
├── App/
│   ├── DustCalculatorApp.swift      # 入口
│   └── AppView.swift                # 根视图
│
├── Models/
│   ├── ProjectRecord.swift
│   ├── SampleRecord.swift
│   ├── StandardWeightRecord.swift
│   └── DatabaseManager.swift
│
├── Stores/
│   ├── ProjectStore.swift
│   └── SampleStore.swift
│
├── Views/
│   ├── Sidebar/
│   │   ├── SidebarView.swift
│   │   ├── ProjectListView.swift
│   │   └── ProjectRowView.swift
│   │
│   ├── ProjectDetail/
│   │   ├── ProjectDetailView.swift
│   │   ├── ProjectFormView.swift
│   │   ├── SampleTableView.swift    ⭐
│   │   ├── SampleRowView.swift
│   │   ├── SampleCellView.swift
│   │   └── ToolbarView.swift
│   │
│   └── StandardWeight/
│       └── StandardWeightView.swift
│
├── Utils/
│   ├── Calculator.swift             ⭐
│   ├── PasteboardHelper.swift
│   └── FocusManager.swift
│
├── Tests/
│   ├── CalculatorTests.swift
│   ├── DatabaseTests.swift
│   └── MigrationTests.swift
│
└── Resources/
    ├── Assets.xcassets
    └── Localizable.strings
```

## Tech Stack

| 层级 | 技术 |
|------|------|
| 语言 | Swift 5.9+ |
| UI 框架 | SwiftUI |
| 数据库 | GRDB.swift 6.x |
| 最低版本 | macOS 13 (Ventura) |
| 测试 | XCTest |

## Expected Results

- 应用体积: ~10-15 MB
- 启动时间: < 1 秒
- 内存占用: < 50 MB
- Apple Silicon: 原生优化

## Files to Reference from Original Project

| 原文件 | 用途 |
|--------|------|
| `src/utils/calculator.ts` | 算法翻译源 |
| `tests/calculator.test.ts` | 测试用例翻译源 |
| `electron/main.ts` | 数据库表结构参考 |
| `src/views/ProjectDetail.vue` | UI 功能参考 |
| `src/App.vue` | UI 功能参考 |
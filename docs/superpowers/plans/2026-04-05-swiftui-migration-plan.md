# SwiftUI 原生迁移实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将粉尘数据计算器从 Electron 迁移到原生 SwiftUI 应用，保持全部功能一致。

**Architecture:** MVVM + 单向数据流，SwiftUI 视图层，GRDB.swift 数据持久化，纯函数计算逻辑层独立。

**Tech Stack:** Swift 5.9+, SwiftUI, GRDB.swift 6.x, XCTest, macOS 13+

---

## Phase 1: Xcode 项目初始化

### Task 1: 创建 Xcode 项目

**Files:**
- Create: `DustCalculator/DustCalculator.xcodeproj` (通过 Xcode)
- Create: `DustCalculator/DustCalculatorApp.swift`
- Create: `DustCalculator/AppView.swift`

- [ ] **Step 1: 使用 Xcode 创建项目**

在 Xcode 中：
1. File → New → Project
2. 选择 macOS → App
3. Product Name: `DustCalculator`
4. Interface: SwiftUI
5. Language: Swift
6. Storage: None (稍后手动添加 GRDB)
7. 保存到 `/Users/yezi/Coding/` 目录（与当前项目同级）

项目创建后，Xcode 会自动生成以下文件结构：
```
DustCalculator/
├── DustCalculator.xcodeproj
├── DustCalculator/
│   ├── DustCalculatorApp.swift
│   ├── ContentView.swift (将重命名为 AppView.swift)
│   └── Assets.xcassets
```

- [ ] **Step 2: 重命名 ContentView 为 AppView**

在 Xcode 中将 `ContentView.swift` 重命名为 `AppView.swift`，并更新内容：

```swift
// AppView.swift
import SwiftUI

struct AppView: View {
    var body: some View {
        Text("粉尘数据计算器")
            .frame(minWidth: 800, minHeight: 600)
    }
}

#Preview {
    AppView()
}
```

- [ ] **Step 3: 更新 App 入口文件**

```swift
// DustCalculatorApp.swift
import SwiftUI

@main
struct DustCalculatorApp: App {
    var body: some Scene {
        WindowGroup {
            AppView()
        }
        .windowStyle(.automatic)
        .defaultSize(width: 1000, height: 700)
    }
}
```

- [ ] **Step 4: 验证项目可运行**

在 Xcode 中按 `Cmd+R` 运行项目，确认显示 "粉尘数据计算器" 文字。

- [ ] **Step 5: Commit**

```bash
cd /Users/yezi/Coding/DustCalculator
git init
git add .
git commit -m "init: 创建 SwiftUI 项目骨架"
```

---

### Task 2: 添加 GRDB.swift 依赖

**Files:**
- Modify: `DustCalculator/DustCalculator.xcodeproj` (Package Dependencies)

- [ ] **Step 1: 通过 Swift Package Manager 添加 GRDB**

在 Xcode 中：
1. File → Add Package Dependencies
2. 搜索: `https://github.com/groue/GRDB.swift`
3. 选择版本: 6.x (最新稳定版)
4. Add Package
5. 选择 `GRDB` 库添加到 DustCalculator target

- [ ] **Step 2: 验证 GRDB 可导入**

创建临时测试文件验证导入成功：

```swift
// 临时添加到 AppView.swift 顶部验证
import GRDB
```

编译项目 (`Cmd+B`)，确认无错误。

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "deps: 添加 GRDB.swift 依赖"
```

---

## Phase 2: 计算逻辑层 (TDD)

### Task 3: 创建 Calculator.swift 文件结构

**Files:**
- Create: `DustCalculator/DustCalculator/Utils/Calculator.swift`

- [ ] **Step 1: 创建 Utils 目录和 Calculator.swift**

在 Xcode 项目导航器中：
1. 右键 DustCalculator 文件夹 → New Group → 命名 `Utils`
2. 右键 Utils 文件夹 → New File → Swift File → 命名 `Calculator.swift`

- [ ] **Step 2: 定义基础类型和常量**

```swift
// Calculator.swift
import Foundation

// MARK: - 类型定义

/// 样品类型
enum SampleType: String, Codable {
    case blank = "空白"
    case sample = "样品"
}

/// QC 检查结果
enum QCResult: String, Codable {
    case passed = "合格"
    case failed = "不合格"
    case empty = ""
}

/// 检出状态
enum DetectionStatus: String, Codable {
    case blankDash = "-"
    case notDetected = "未检出"
    case detected = "检出"
    case empty = ""
}

// MARK: - 采样体积常量

/// 标准采样体积选项
let SAMPLING_VOLUMES: Set<Double> = [500, 300, 420, 450, 525]

// MARK: - 核心计算函数声明（后续任务实现）
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: 创建 Calculator.swift 基础结构"
```

---

### Task 4: 实现银行家舍入算法 (TDD)

**Files:**
- Create: `DustCalculator/DustCalculatorTests/CalculatorTests.swift`
- Modify: `DustCalculator/DustCalculator/Utils/Calculator.swift`

- [ ] **Step 1: 创建测试文件**

在 Xcode 中：
1. 右键 DustCalculator 项目 → New Group → 命名 `Tests`（放在项目根目录）
2. 确保 Tests 文件夹在文件系统中位于 `DustCalculator/DustCalculatorTests/`
3. 右键 Tests → New File → Unit Test Case Class → 命名 `CalculatorTests`

- [ ] **Step 2: 编写 roundBank 测试用例**

```swift
// CalculatorTests.swift
import XCTest
@testable import DustCalculator

final class CalculatorTests: XCTestCase {
    
    // MARK: - 银行家舍入测试
    
    func testRoundBank_evenIntegerRoundsDown() {
        // 整数部分为偶数时，0.5 舍去
        XCTAssertEqual(roundBank(2.5, decimals: 0), 2.0)
        XCTAssertEqual(roundBank(4.5, decimals: 0), 4.0)
        XCTAssertEqual(roundBank(6.5, decimals: 0), 6.0)
    }
    
    func testRoundBank_oddIntegerRoundsUp() {
        // 整数部分为奇数时，0.5 进一
        XCTAssertEqual(roundBank(3.5, decimals: 0), 4.0)
        XCTAssertEqual(roundBank(5.5, decimals: 0), 6.0)
        XCTAssertEqual(roundBank(7.5, decimals: 0), 8.0)
    }
    
    func testRoundBank_oneDecimalEvenRoundsDown() {
        // 1位小数，前一位为偶数时舍去
        XCTAssertEqual(roundBank(1.25, decimals: 1), 1.2)
        XCTAssertEqual(roundBank(2.45, decimals: 1), 2.4)
    }
    
    func testRoundBank_oneDecimalOddRoundsUp() {
        // 1位小数，前一位为奇数时进一
        XCTAssertEqual(roundBank(1.35, decimals: 1), 1.4)
        XCTAssertEqual(roundBank(2.55, decimals: 1), 2.6)
    }
    
    func testRoundBank_twoDecimalsEvenRoundsDown() {
        // 2位小数，前一位为偶数时舍去
        XCTAssertEqual(roundBank(1.125, decimals: 2), 1.12)
        XCTAssertEqual(roundBank(2.345, decimals: 2), 2.34)
    }
    
    func testRoundBank_twoDecimalsOddRoundsUp() {
        // 2位小数，前一位为奇数时进一
        XCTAssertEqual(roundBank(1.135, decimals: 2), 1.14)
        XCTAssertEqual(roundBank(2.355, decimals: 2), 2.36)
    }
    
    func testRoundBank_lessThan05RoundsDown() {
        // 小于 0.5 舍去
        XCTAssertEqual(roundBank(1.4, decimals: 0), 1.0)
        XCTAssertEqual(roundBank(1.24, decimals: 1), 1.2)
    }
    
    func testRoundBank_greaterThan05RoundsUp() {
        // 大于 0.5 进一
        XCTAssertEqual(roundBank(1.6, decimals: 0), 2.0)
        XCTAssertEqual(roundBank(1.26, decimals: 1), 1.3)
    }
    
    func testRoundBank_negativeNumbers() {
        // 负数处理
        XCTAssertEqual(roundBank(-2.5, decimals: 0), -2.0) // -2 是偶数
        XCTAssertEqual(roundBank(-3.5, decimals: 0), -4.0) // -3 是奇数
    }
}
```

- [ ] **Step 3: 运行测试验证失败**

按 `Cmd+U` 运行测试，确认测试失败（`roundBank` 函数未定义）。

- [ ] **Step 4: 实现 roundBank 函数**

```swift
// 在 Calculator.swift 中添加：

/// 四舍六入五成双（银行家舍入法）- GB/T 8170标准
///
/// 规则说明：
/// - 当舍弃部分小于0.5时，舍去
/// - 当舍弃部分大于0.5时，进一
/// - 当舍弃部分恰好等于0.5时：
///   - 如果前一位是偶数，则舍去
///   - 如果前一位是奇数，则进一
func roundBank(_ value: Double, decimals: Int) -> Double {
    if value.isNaN { return .nan }
    
    let multiplier = pow(10.0, Double(decimals))
    let shifted = value * multiplier
    
    // 处理精度问题
    let epsilon = 1e-10
    let roundedShifted = round(shifted * 1e10) / 1e10
    
    // 判断是否有小数部分
    let integer = floor(roundedShifted)
    let fraction = roundedShifted - integer
    
    // 判断是否恰好是 0.5（考虑精度误差）
    if abs(fraction - 0.5) < epsilon {
        // 恰好 0.5 时，检查整数部分是否为偶数
        if Int(integer) % 2 == 0 {
            // 偶数舍去
            return integer / multiplier
        } else {
            // 奇数进一
            return (integer + 1) / multiplier
        }
    }
    
    // 非 0.5 情况：常规四舍六入
    // < 0.5 舍去，> 0.5 进一
    if fraction < 0.5 {
        return integer / multiplier
    } else {
        return (integer + 1) / multiplier
    }
}
```

- [ ] **Step 5: 运行测试验证通过**

按 `Cmd+U` 运行测试，确认所有测试通过。

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: 实现银行家舍入算法 roundBank"
```

---

### Task 5: 实现采样体积相关函数 (TDD)

**Files:**
- Modify: `DustCalculator/DustCalculatorTests/CalculatorTests.swift`
- Modify: `DustCalculator/DustCalculator/Utils/Calculator.swift`

- [ ] **Step 1: 编写测试用例**

```swift
// 在 CalculatorTests.swift 中添加：

// MARK: - 采样体积相关测试

func testGetMinQuantitativeConcentration_500L() {
    XCTAssertEqual(getMinQuantitativeConcentration(500), 0.2)
}

func testGetMinQuantitativeConcentration_300L() {
    // 0.1 × 1000 / 300 = 0.333... → 向上取整 0.34
    XCTAssertEqual(getMinQuantitativeConcentration(300), 0.34)
}

func testGetMinQuantitativeConcentration_420L() {
    // 0.1 × 1000 / 420 = 0.238... → 向上取整 0.24
    XCTAssertEqual(getMinQuantitativeConcentration(420), 0.24)
}

func testGetMinQuantitativeConcentration_450L() {
    // 0.1 × 1000 / 450 = 0.222... → 向上取整 0.23
    XCTAssertEqual(getMinQuantitativeConcentration(450), 0.23)
}

func testGetMinQuantitativeConcentration_525L() {
    // 0.1 × 1000 / 525 = 0.190... → 向上取整 0.20
    XCTAssertEqual(getMinQuantitativeConcentration(525), 0.20)
}

func testGetRoundingDecimals_500L() {
    XCTAssertEqual(getRoundingDecimals(500), 1)
}

func testGetRoundingDecimals_otherVolumes() {
    XCTAssertEqual(getRoundingDecimals(300), 2)
    XCTAssertEqual(getRoundingDecimals(420), 2)
    XCTAssertEqual(getRoundingDecimals(450), 2)
    XCTAssertEqual(getRoundingDecimals(525), 2)
}
```

- [ ] **Step 2: 运行测试验证失败**

按 `Cmd+U` 运行测试，确认新测试失败。

- [ ] **Step 3: 实现函数**

```swift
// 在 Calculator.swift 中添加：

/// 根据采样体积获取最低定量浓度
///
/// 规则：
/// - 500L: 固定 0.2 mg/m³
/// - 其他: 0.1 × 1000 / Vt，向上取整保留两位小数（只进不舍）
func getMinQuantitativeConcentration(vt: Double) -> Double {
    if vt == 500 {
        return 0.2
    }
    // 向上取整到两位小数（只进不舍）
    let raw = 0.1 * 1000 / vt
    return ceil(raw * 100) / 100
}

/// 根据采样体积获取检测值保留位数
///
/// 规则：检测值保留位数与最低定量浓度一致
/// - 500L: 最低定量浓度 0.2（1位小数）→ 检测值保留1位小数
/// - 其他: 最低定量浓度保留2位小数 → 检测值保留2位小数
func getRoundingDecimals(vt: Double) -> Int {
    return vt == 500 ? 1 : 2
}
```

- [ ] **Step 4: 运行测试验证通过**

按 `Cmd+U` 运行测试，确认所有测试通过。

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现采样体积相关函数"
```

---

### Task 6: 实现 V0 换算函数 (TDD)

**Files:**
- Modify: `DustCalculator/DustCalculatorTests/CalculatorTests.swift`
- Modify: `DustCalculator/DustCalculator/Utils/Calculator.swift`

- [ ] **Step 1: 编写测试用例**

```swift
// 在 CalculatorTests.swift 中添加：

// MARK: - V0 换算测试

func testNeedV0Conversion_normalRange() {
    // 温度在 5-35℃ 范围内，气压在 98.8-103.4 kPa 范围内，不需要换算
    XCTAssertFalse(needV0Conversion(temperature: 17.9, pressure: 101))
    XCTAssertFalse(needV0Conversion(temperature: 20, pressure: 101.3))
}

func testNeedV0Conversion_lowTemperature() {
    // 温度低于 5℃ 需要换算
    XCTAssertTrue(needV0Conversion(temperature: 0, pressure: 101))
    XCTAssertTrue(needV0Conversion(temperature: 4, pressure: 101))
}

func testNeedV0Conversion_highTemperature() {
    // 温度高于 35℃ 需要换算
    XCTAssertTrue(needV0Conversion(temperature: 40, pressure: 101))
}

func testNeedV0Conversion_lowPressure() {
    // 气压低于 98.8 kPa 需要换算
    XCTAssertTrue(needV0Conversion(temperature: 20, pressure: 98))
}

func testNeedV0Conversion_highPressure() {
    // 气压高于 103.4 kPa 需要换算
    XCTAssertTrue(needV0Conversion(temperature: 20, pressure: 105))
}

func testCalculateV0_noConversion() {
    // 不需要换算时 V0 等于 Vt
    XCTAssertEqual(calculateV0(vt: 500, temperature: 20, pressure: 101.3), 500)
    XCTAssertEqual(calculateV0(vt: 500, temperature: nil, pressure: nil), 500)
}

func testCalculateV0_withConversion() {
    // Vt=500L, t=0℃, P=90kPa
    // V0 = 500 × 293/(273+0) × (90/101.3)
    let v0 = calculateV0(vt: 500, temperature: 0, pressure: 90)
    XCTAssertTrue(v0 > 450 && v0 < 520)
}
```

- [ ] **Step 2: 运行测试验证失败**

按 `Cmd+U` 运行测试，确认新测试失败。

- [ ] **Step 3: 实现函数**

```swift
// 在 Calculator.swift 中添加：

/// 判断是否需要 V0 换算
///
/// 规则：当温度<5℃或>35℃、气压<98.8kPa或>103.4kPa时需要换算
func needV0Conversion(temperature: Double?, pressure: Double?) -> Bool {
    guard let temp = temperature, let pres = pressure else { return false }
    return temp < 5 || temp > 35 || pres < 98.8 || pres > 103.4
}

/// 计算标准采样体积 V0
///
/// 公式：V0 = Vt × 293/(273+t) × (P/101.3)
/// 保留整数
func calculateV0(vt: Double, temperature: Double?, pressure: Double?) -> Double {
    guard let temp = temperature, let pres = pressure else { return vt }
    if !needV0Conversion(temperature: temp, pressure: pres) {
        return vt
    }
    return round(vt * 293 / (273 + temp) * (pres / 101.3))
}
```

- [ ] **Step 4: 运行测试验证通过**

按 `Cmd+U` 运行测试，确认所有测试通过。

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现 V0 换算函数"
```

---

### Task 7: 实现样品类型判断和 W2 计算 (TDD)

**Files:**
- Modify: `DustCalculator/DustCalculatorTests/CalculatorTests.swift`
- Modify: `DustCalculator/DustCalculator/Utils/Calculator.swift`

- [ ] **Step 1: 编写测试用例**

```swift
// 在 CalculatorTests.swift 中添加：

// MARK: - 样品类型判断测试

func testGetSampleType_blankSample() {
    // 样品编号包含 -0- 为空白样品
    XCTAssertEqual(getSampleType(sampleNo: "1-0-1"), .blank)
    XCTAssertEqual(getSampleType(sampleNo: "2-0-2"), .blank)
}

func testGetSampleType_normalSample() {
    // 样品编号不包含 -0- 为样品
    XCTAssertEqual(getSampleType(sampleNo: "1-1-1-1"), .sample)
    XCTAssertEqual(getSampleType(sampleNo: "2-1-2"), .sample)
}

func testGetSampleType_emptyString() {
    XCTAssertEqual(getSampleType(sampleNo: ""), .sample)
}

// MARK: - W2 平均值计算测试

func testCalculateW2Avg_normalCase() {
    // (50.92 + 50.93) / 2 = 50.925 → 四舍六入五成双：5092 是偶数，舍去得 50.92
    XCTAssertEqual(calculateW2Avg(w2First: 50.92, w2Second: 50.93), 50.92)
    // (41.33 + 41.35) / 2 = 41.34，无需修约
    XCTAssertEqual(calculateW2Avg(w2First: 41.33, w2Second: 41.35), 41.34)
}

func testCalculateW2Avg_nilValues() {
    XCTAssertTrue(calculateW2Avg(w2First: nil, w2Second: 50.93).isNaN)
    XCTAssertTrue(calculateW2Avg(w2First: 50.92, w2Second: nil).isNaN)
}

// MARK: - 称量差值计算测试

func testCalculateWeighingDiff_normalCase() {
    XCTAssertEqual(calculateWeighingDiff(w2First: 50.92, w2Second: 50.93), 0.01)
    XCTAssertEqual(calculateWeighingDiff(w2First: 41.33, w2Second: 41.35), 0.02)
}

func testCalculateWeighingDiff_nilValues() {
    XCTAssertTrue(calculateWeighingDiff(w2First: nil, w2Second: 50.93).isNaN)
}
```

- [ ] **Step 2: 运行测试验证失败**

按 `Cmd+U` 运行测试，确认新测试失败。

- [ ] **Step 3: 实现函数**

```swift
// 在 Calculator.swift 中添加：

/// 根据样品编号判断样品类型
///
/// 规则：样品编号包含 "-0-" 为空白样品
func getSampleType(sampleNo: String) -> SampleType {
    if sampleNo.isEmpty { return .sample }
    return sampleNo.contains("-0-") ? .blank : .sample
}

/// 计算 W2 平均值
///
/// 公式：(第一次 + 第二次) / 2，保留两位小数
func calculateW2Avg(w2First: Double?, w2Second: Double?) -> Double {
    guard let first = w2First, let second = w2Second else { return .nan }
    return roundBank((first + second) / 2, decimals: 2)
}

/// 计算称量差值
///
/// 公式：|第一次 - 第二次|
func calculateWeighingDiff(w2First: Double?, w2Second: Double?) -> Double {
    guard let first = w2First, let second = w2Second else { return .nan }
    return abs(first - second)
}
```

- [ ] **Step 4: 运行测试验证通过**

按 `Cmd+U` 运行测试，确认所有测试通过。

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现样品类型判断和 W2 计算函数"
```

---

### Task 8: 实现 QC 检查函数 (TDD)

**Files:**
- Modify: `DustCalculator/DustCalculatorTests/CalculatorTests.swift`
- Modify: `DustCalculator/DustCalculator/Utils/Calculator.swift`

- [ ] **Step 1: 编写测试用例**

```swift
// 在 CalculatorTests.swift 中添加：

// MARK: - 称量质控判断测试

func testCheckWeighingQC_passed() {
    // 称量差值 ≤ 0.2mg 为合格
    XCTAssertEqual(checkWeighingQC(weighingDiff: 0.01), .passed)
    XCTAssertEqual(checkWeighingQC(weighingDiff: 0.2), .passed)
}

func testCheckWeighingQC_failed() {
    // 称量差值 > 0.2mg 为不合格
    XCTAssertEqual(checkWeighingQC(weighingDiff: 0.21), .failed)
    XCTAssertEqual(checkWeighingQC(weighingDiff: 0.5), .failed)
}

func testCheckWeighingQC_nilOrNaN() {
    XCTAssertEqual(checkWeighingQC(weighingDiff: nil), .empty)
    XCTAssertEqual(checkWeighingQC(weighingDiff: .nan), .empty)
}

// MARK: - 增重质控判断测试

func testCheckDeltaMQC_blankPassed() {
    // 空白样品 Δm ≤ 0.02mg 为合格
    XCTAssertEqual(checkDeltaMQC(deltaM: 0.01, sampleType: .blank), .passed)
    XCTAssertEqual(checkDeltaMQC(deltaM: 0.02, sampleType: .blank), .passed)
}

func testCheckDeltaMQC_blankFailed() {
    // 空白样品 Δm > 0.02mg 为不合格
    XCTAssertEqual(checkDeltaMQC(deltaM: 0.03, sampleType: .blank), .failed)
}

func testCheckDeltaMQC_samplePassed() {
    // 样品 Δm > 0.1mg 为合格
    XCTAssertEqual(checkDeltaMQC(deltaM: 0.11, sampleType: .sample), .passed)
    XCTAssertEqual(checkDeltaMQC(deltaM: 0.5, sampleType: .sample), .passed)
}

func testCheckDeltaMQC_sampleFailed() {
    // 样品 Δm ≤ 0.1mg 为不合格
    XCTAssertEqual(checkDeltaMQC(deltaM: 0.09, sampleType: .sample), .failed)
    XCTAssertEqual(checkDeltaMQC(deltaM: 0.1, sampleType: .sample), .failed)
}

func testCheckDeltaMQC_nilOrNaN() {
    XCTAssertEqual(checkDeltaMQC(deltaM: nil, sampleType: .sample), .empty)
    XCTAssertEqual(checkDeltaMQC(deltaM: .nan, sampleType: .blank), .empty)
}
```

- [ ] **Step 2: 运行测试验证失败**

按 `Cmd+U` 运行测试，确认新测试失败。

- [ ] **Step 3: 实现函数**

```swift
// 在 Calculator.swift 中添加：

/// 判断称量质控是否合格
///
/// 规则：称量差值 ≤ 0.2mg 为合格
func checkWeighingQC(weighingDiff: Double?) -> QCResult {
    guard let diff = weighingDiff, !diff.isNaN else { return .empty }
    return diff <= 0.2 ? .passed : .failed
}

/// 判断增重质控是否合格
///
/// 规则：
/// - 空白样品：Δm ≤ 0.02mg 为合格
/// - 样品：Δm > 0.1mg 为合格
func checkDeltaMQC(deltaM: Double?, sampleType: SampleType) -> QCResult {
    guard let dm = deltaM, !dm.isNaN else { return .empty }
    if sampleType == .blank {
        return dm <= 0.02 ? .passed : .failed
    } else {
        return dm > 0.1 ? .passed : .failed
    }
}
```

- [ ] **Step 4: 运行测试验证通过**

按 `Cmd+U` 运行测试，确认所有测试通过。

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现 QC 检查函数"
```

---

### Task 9: 实现浓度计算和修约函数 (TDD)

**Files:**
- Modify: `DustCalculator/DustCalculatorTests/CalculatorTests.swift`
- Modify: `DustCalculator/DustCalculator/Utils/Calculator.swift`

- [ ] **Step 1: 编写测试用例**

```swift
// 在 CalculatorTests.swift 中添加：

// MARK: - 增重计算测试

func testCalculateDeltaM_normalCase() {
    XCTAssertEqual(calculateDeltaM(w1: 50.22, w2Avg: 50.92), 0.70)
}

func testCalculateDeltaM_nilValues() {
    XCTAssertTrue(calculateDeltaM(w1: nil, w2Avg: 50.92).isNaN)
}

// MARK: - 浓度计算测试

func testCalculateConcentration_normalCase() {
    // Δm=0.5mg, V=500L → C=0.5×1000/500=1.0 mg/m³
    XCTAssertEqual(calculateConcentration(deltaM: 0.5, volume: 500), 1.0)
    // Δm=0.5mg, V=300L → C≈1.67 mg/m³
    XCTAssertEqual(calculateConcentration(deltaM: 0.5, volume: 300), 1.666666666666667, accuracy: 0.01)
}

func testCalculateConcentration_nilOrZeroVolume() {
    XCTAssertTrue(calculateConcentration(deltaM: 0.5, volume: nil).isNaN)
    XCTAssertTrue(calculateConcentration(deltaM: 0.5, volume: 0).isNaN)
}

// MARK: - 检测值修约测试

func testCalculateRoundedValue_500L() {
    // 500L 采样体积保留 1 位小数
    XCTAssertEqual(calculateRoundedValue(concentration: 1.0, vt: 500), 1.0)
    XCTAssertEqual(calculateRoundedValue(concentration: 1.15, vt: 500), 1.2) // 四舍六入五成双
}

func testCalculateRoundedValue_otherVolumes() {
    // 其他采样体积保留 2 位小数
    XCTAssertEqual(calculateRoundedValue(concentration: 1.67, vt: 300), 1.67)
    XCTAssertEqual(calculateRoundedValue(concentration: 1.675, vt: 300), 1.68) // 四舍六入五成双
}

func testCalculateRoundedValue_nilOrNaN() {
    XCTAssertTrue(calculateRoundedValue(concentration: nil, vt: 500).isNaN)
    XCTAssertTrue(calculateRoundedValue(concentration: .nan, vt: 500).isNaN)
}
```

- [ ] **Step 2: 运行测试验证失败**

按 `Cmd+U` 运行测试，确认新测试失败。

- [ ] **Step 3: 实现函数**

```swift
// 在 Calculator.swift 中添加：

/// 计算增重 Δm
///
/// 公式：W2平均值 - W1
func calculateDeltaM(w1: Double?, w2Avg: Double?) -> Double {
    guard let w = w1, let avg = w2Avg else { return .nan }
    return avg - w
}

/// 计算浓度 C
///
/// 公式：C = Δm × 1000 / V (mg/m³)
func calculateConcentration(deltaM: Double?, volume: Double?) -> Double {
    guard let dm = deltaM, let vol = volume, vol != 0 else { return .nan }
    return dm * 1000 / vol
}

/// 计算修约后的检测值
///
/// 规则：
/// - 根据采样体积确定保留位数
/// - 使用四舍六入五成双修约
func calculateRoundedValue(concentration: Double?, vt: Double) -> Double {
    guard let conc = concentration, !conc.isNaN else { return .nan }
    let decimals = getRoundingDecimals(vt: vt)
    return roundBank(conc, decimals: decimals)
}
```

- [ ] **Step 4: 运行测试验证通过**

按 `Cmd+U` 运行测试，确认所有测试通过。

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现浓度计算和修约函数"
```

---

### Task 10: 实现检出判断和砝码检查函数 (TDD)

**Files:**
- Modify: `DustCalculator/DustCalculatorTests/CalculatorTests.swift`
- Modify: `DustCalculator/DustCalculator/Utils/Calculator.swift`

- [ ] **Step 1: 编写测试用例**

```swift
// 在 CalculatorTests.swift 中添加：

// MARK: - 检出判断测试

func testCheckIsDetected_blankSample() {
    // 空白样品显示 "-"
    XCTAssertEqual(checkIsDetected(roundedValue: 0.5, sampleType: .blank, vt: 500), .blankDash)
}

func testCheckIsDetected_notDetected() {
    // 浓度 ≤ 最低定量浓度显示"未检出"
    XCTAssertEqual(checkIsDetected(roundedValue: 0.2, sampleType: .sample, vt: 500), .notDetected)
    XCTAssertEqual(checkIsDetected(roundedValue: 0.1, sampleType: .sample, vt: 500), .notDetected)
}

func testCheckIsDetected_detected() {
    // 浓度 > 最低定量浓度显示"检出"
    XCTAssertEqual(checkIsDetected(roundedValue: 0.21, sampleType: .sample, vt: 500), .detected)
    XCTAssertEqual(checkIsDetected(roundedValue: 1.0, sampleType: .sample, vt: 500), .detected)
}

func testCheckIsDetected_nilOrNaN() {
    XCTAssertEqual(checkIsDetected(roundedValue: nil, sampleType: .sample, vt: 500), .empty)
    XCTAssertEqual(checkIsDetected(roundedValue: .nan, sampleType: .blank, vt: 500), .empty)
}

// MARK: - 标准砝码检查测试

func testCheckStandardWeight_passed() {
    // 差值 ≤ 0.1mg 为合格
    XCTAssertEqual(checkStandardWeight(originalMass: 50, currentMass: 50.1), .passed)
    XCTAssertEqual(checkStandardWeight(originalMass: 50, currentMass: 50.05), .passed)
    XCTAssertEqual(checkStandardWeight(originalMass: 50, currentMass: 49.95), .passed)
}

func testCheckStandardWeight_failed() {
    // 差值 > 0.1mg 为不合格
    XCTAssertEqual(checkStandardWeight(originalMass: 50, currentMass: 50.11), .failed)
    XCTAssertEqual(checkStandardWeight(originalMass: 50, currentMass: 49.89), .failed)
}

func testCheckStandardWeight_nilValues() {
    XCTAssertEqual(checkStandardWeight(originalMass: nil, currentMass: 50), .empty)
    XCTAssertEqual(checkStandardWeight(originalMass: 50, currentMass: nil), .empty)
}
```

- [ ] **Step 2: 运行测试验证失败**

按 `Cmd+U` 运行测试，确认新测试失败。

- [ ] **Step 3: 实现函数**

```swift
// 在 Calculator.swift 中添加：

/// 判断是否检出
///
/// 规则：
/// - 空白样品显示 "-"
/// - 浓度 ≤ 最低定量浓度显示"未检出"
/// - 其他显示"检出"
func checkIsDetected(roundedValue: Double?, sampleType: SampleType, vt: Double) -> DetectionStatus {
    guard let value = roundedValue, !value.isNaN else { return .empty }
    if sampleType == .blank { return .blankDash }
    
    let minQuantitative = getMinQuantitativeConcentration(vt: vt)
    return value <= minQuantitative ? .notDetected : .detected
}

/// 计算标准砝码检查结果
///
/// 规则：|本次称重 - 原始质量| ≤ 0.1mg 为合格
func checkStandardWeight(originalMass: Double?, currentMass: Double?) -> QCResult {
    guard let original = originalMass, let current = currentMass else { return .empty }
    let diff = abs(current - original)
    // 使用 3 位小数处理浮点数精度问题
    return round(diff * 1000) / 1000 <= 0.1 ? .passed : .failed
}
```

- [ ] **Step 4: 运行测试验证通过**

按 `Cmd+U` 运行测试，确认所有测试通过。

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现检出判断和砝码检查函数"
```

---

### Task 11: 实现完整样品计算函数 (TDD)

**Files:**
- Modify: `DustCalculator/DustCalculatorTests/CalculatorTests.swift`
- Modify: `DustCalculator/DustCalculator/Utils/Calculator.swift`

- [ ] **Step 1: 编写测试用例**

```swift
// 在 CalculatorTests.swift 中添加：

// MARK: - 完整样品计算测试

func testCalculateSample_blankSample() {
    let input = SampleInput(
        sampleNo: "1-0-1",
        filterNo: "",
        w1: 41.36,
        w2First: 41.33,
        w2Second: 41.35,
        vt: 420
    )
    
    let result = calculateSample(input: input, temperature: 17.9, pressure: 101)
    
    XCTAssertEqual(result.sampleType, .blank)
    XCTAssertEqual(result.w2Avg, 41.34, accuracy: 0.01)
    XCTAssertEqual(result.deltaM, -0.02, accuracy: 0.01)
    XCTAssertEqual(result.isDetected, .blankDash)
}

func testCalculateSample_normalSample() {
    let input = SampleInput(
        sampleNo: "1-1-1-1",
        filterNo: "",
        w1: 50.22,
        w2First: 50.92,
        w2Second: 50.93,
        vt: 500
    )
    
    let result = calculateSample(input: input, temperature: 17.9, pressure: 101)
    
    XCTAssertEqual(result.sampleType, .sample)
    // W2 平均值 = (50.92 + 50.93) / 2 = 50.925 → 四舍六入五成双 → 50.92
    XCTAssertEqual(result.w2Avg, 50.92, accuracy: 0.01)
    // Δm = 50.92 - 50.22 = 0.70
    XCTAssertEqual(result.deltaM, 0.70, accuracy: 0.01)
    // 浓度 = 0.70 × 1000 / 500 = 1.40
    XCTAssertEqual(result.concentration, 1.40, accuracy: 0.01)
    XCTAssertEqual(result.roundedValue, 1.4, accuracy: 0.1)
    XCTAssertEqual(result.isDetected, .detected)
}
```

- [ ] **Step 2: 运行测试验证失败**

按 `Cmd+U` 运行测试，确认新测试失败。

- [ ] **Step 3: 定义输入输出结构体**

```swift
// 在 Calculator.swift 中添加：

// MARK: - 样品计算输入输出结构体

/// 样品计算输入
struct SampleInput {
    var sampleNo: String
    var filterNo: String
    var w1: Double?
    var w2First: Double?
    var w2Second: Double?
    var vt: Double
}

/// 样品计算输出
struct SampleOutput {
    var sampleType: SampleType
    var sampleNo: String
    var filterNo: String
    var w1: Double?
    var w2First: Double?
    var w2Second: Double?
    var w2Avg: Double?
    var weighingDiff: Double?
    var weighingQC: QCResult
    var deltaM: Double?
    var deltaMQC: QCResult
    var vt: Double
    var v0: Double
    var concentration: Double?
    var roundedValue: Double?
    var isDetected: DetectionStatus
}
```

- [ ] **Step 4: 实现完整计算函数**

```swift
// 在 Calculator.swift 中添加：

/// 完整计算样品数据
func calculateSample(input: SampleInput, temperature: Double?, pressure: Double?) -> SampleOutput {
    let sampleType = getSampleType(sampleNo: input.sampleNo)
    let w2Avg = calculateW2Avg(w2First: input.w2First, w2Second: input.w2Second)
    let weighingDiff = calculateWeighingDiff(w2First: input.w2First, w2Second: input.w2Second)
    let weighingQC = checkWeighingQC(weighingDiff: weighingDiff)
    let deltaM = calculateDeltaM(w1: input.w1, w2Avg: w2Avg)
    let deltaMQC = checkDeltaMQC(deltaM: deltaM, sampleType: sampleType)
    let v0 = calculateV0(vt: input.vt, temperature: temperature, pressure: pressure)
    let concentration = calculateConcentration(deltaM: deltaM, volume: v0)
    let roundedValue = calculateRoundedValue(concentration: concentration, vt: input.vt)
    let isDetected = checkIsDetected(roundedValue: roundedValue, sampleType: sampleType, vt: input.vt)
    
    return SampleOutput(
        sampleType: sampleType,
        sampleNo: input.sampleNo,
        filterNo: input.filterNo,
        w1: input.w1,
        w2First: input.w2First,
        w2Second: input.w2Second,
        w2Avg: w2Avg,
        weighingDiff: weighingDiff,
        weighingQC: weighingQC,
        deltaM: deltaM,
        deltaMQC: deltaMQC,
        vt: input.vt,
        v0: v0,
        concentration: concentration,
        roundedValue: roundedValue,
        isDetected: isDetected
    )
}
```

- [ ] **Step 5: 运行测试验证通过**

按 `Cmd+U` 运行测试，确认所有测试通过。

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: 实现完整样品计算函数 calculateSample"
```

---

## Phase 3: 数据层

### Task 12: 创建数据库管理器

**Files:**
- Create: `DustCalculator/DustCalculator/Models/DatabaseManager.swift`

- [ ] **Step 1: 创建 Models 目录**

在 Xcode 项目导航器中：
1. 右键 DustCalculator 文件夹 → New Group → 命名 `Models`

- [ ] **Step 2: 创建 DatabaseManager.swift**

```swift
// DatabaseManager.swift
import Foundation
import GRDB

/// 数据库管理器
class DatabaseManager {
    static let shared = DatabaseManager()
    
    private var dbPool: DatabasePool?
    
    /// 数据库文件路径
    private var databasePath: String {
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        let appFolder = appSupport.appendingPathComponent("DustCalculator")
        
        // 确保目录存在
        try? FileManager.default.createDirectory(at: appFolder, withIntermediateDirectories: true)
        
        return appFolder.appendingPathComponent("dust-calculator.db").path
    }
    
    private init() {
        openDatabase()
    }
    
    /// 打开数据库连接
    private func openDatabase() {
        do {
            dbPool = try DatabasePool(path: databasePath)
            createTables()
        } catch {
            print("数据库打开失败: \(error)")
        }
    }
    
    /// 创建表结构
    private func createTables() {
        try? dbPool?.write { db in
            // 项目表
            try db.create(table: "project", ifNotExists: true) { t in
                t.autoIncrementedPrimaryKey("id")
                t.column("employerName", .text).notNull()
                t.column("testNumber", .text).notNull()
                t.column("analysisLocation", .text).notNull()
                t.column("analysisDate", .datetime).notNull()
                t.column("samplingDate", .datetime).notNull()
                t.column("testStandard", .text).notNull()
                t.column("samplingTemperature", .double)
                t.column("samplingAirPressure", .double)
                t.column("analysisTemperatureMin", .double)
                t.column("analysisTemperatureMax", .double)
                t.column("analysisHumidityMin", .double)
                t.column("analysisHumidityMax", .double)
                t.column("instrumentName", .text)
                t.column("instrumentNo", .text)
                t.column("analyst", .text)
                t.column("reviewer", .text)
                t.column("createdAt", .datetime).notNull()
                t.column("updatedAt", .datetime).notNull()
            }
            
            // 样品表
            try db.create(table: "sample", ifNotExists: true) { t in
                t.autoIncrementedPrimaryKey("id")
                t.column("projectId", .integer).notNull().indexed()
                t.column("sampleType", .text).notNull()
                t.column("sampleNo", .text).notNull()
                t.column("filterNo", .text).notNull()
                t.column("w1", .double)
                t.column("w2First", .double)
                t.column("w2Second", .double)
                t.column("w2Avg", .double)
                t.column("weighingDiff", .double)
                t.column("weighingQC", .boolean)
                t.column("deltaM", .double)
                t.column("deltaMQC", .boolean)
                t.column("vt", .double)
                t.column("v0", .double)
                t.column("concentration", .double)
                t.column("roundedValue", .double)
            }
            
            // 标准砝码表
            try db.create(table: "standardWeight", ifNotExists: true) { t in
                t.autoIncrementedPrimaryKey("id")
                t.column("projectId", .integer).notNull().indexed()
                t.column("weightNo", .text).notNull()
                t.column("originalMass", .double)
                t.column("currentMass", .double)
                t.column("checkResult", .text)
            }
        }
    }
    
    /// 获取数据库连接池
    var db: DatabasePool? {
        return dbPool
    }
}
```

- [ ] **Step 3: 编译验证**

按 `Cmd+B` 编译，确认无错误。

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: 创建数据库管理器 DatabaseManager"
```

---

### Task 13: 创建 Record 类型

**Files:**
- Create: `DustCalculator/DustCalculator/Models/ProjectRecord.swift`
- Create: `DustCalculator/DustCalculator/Models/SampleRecord.swift`
- Create: `DustCalculator/DustCalculator/Models/StandardWeightRecord.swift`

- [ ] **Step 1: 创建 ProjectRecord**

```swift
// ProjectRecord.swift
import Foundation
import GRDB

/// 项目记录
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
    
    // GRDB 表名映射
    static let databaseTableName = "project"
    
    /// 创建新项目
    static func create(
        employerName: String,
        testNumber: String,
        analysisLocation: String,
        analysisDate: Date,
        samplingDate: Date,
        testStandard: String
    ) -> ProjectRecord {
        let now = Date()
        return ProjectRecord(
            id: nil,
            employerName: employerName,
            testNumber: testNumber,
            analysisLocation: analysisLocation,
            analysisDate: analysisDate,
            samplingDate: samplingDate,
            testStandard: testStandard,
            samplingTemperature: nil,
            samplingAirPressure: nil,
            analysisTemperatureMin: nil,
            analysisTemperatureMax: nil,
            analysisHumidityMin: nil,
            analysisHumidityMax: nil,
            instrumentName: nil,
            instrumentNo: nil,
            analyst: nil,
            reviewer: nil,
            createdAt: now,
            updatedAt: now
        )
    }
}
```

- [ ] **Step 2: 创建 SampleRecord**

```swift
// SampleRecord.swift
import Foundation
import GRDB

/// 样品记录
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
    
    // GRDB 表名映射
    static let databaseTableName = "sample"
    
    /// 从 SampleOutput 创建记录
    static func fromOutput(projectId: Int64, output: SampleOutput) -> SampleRecord {
        return SampleRecord(
            id: nil,
            projectId: projectId,
            sampleType: output.sampleType.rawValue,
            sampleNo: output.sampleNo,
            filterNo: output.filterNo,
            w1: output.w1,
            w2First: output.w2First,
            w2Second: output.w2Second,
            w2Avg: output.w2Avg,
            weighingDiff: output.weighingDiff,
            weighingQC: output.weighingQC == .passed,
            deltaM: output.deltaM,
            deltaMQC: output.deltaMQC == .passed,
            vt: output.vt,
            v0: output.v0,
            concentration: output.concentration,
            roundedValue: output.roundedValue
        )
    }
}
```

- [ ] **Step 3: 创建 StandardWeightRecord**

```swift
// StandardWeightRecord.swift
import Foundation
import GRDB

/// 标准砝码记录
struct StandardWeightRecord: Codable, FetchableRecord, PersistableRecord {
    var id: Int64?
    var projectId: Int64
    var weightNo: String
    var originalMass: Double?
    var currentMass: Double?
    var checkResult: String?
    
    // GRDB 表名映射
    static let databaseTableName = "standardWeight"
}
```

- [ ] **Step 4: 编译验证**

按 `Cmd+B` 编译，确认无错误。

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: 创建 GRDB Record 类型 (Project/Sample/StandardWeight)"
```

---

## Phase 4: Store 层

### Task 14: 创建 ProjectStore

**Files:**
- Create: `DustCalculator/DustCalculator/Stores/ProjectStore.swift`

- [ ] **Step 1: 创建 Stores 目录**

在 Xcode 项目导航器中：
1. 右键 DustCalculator 文件夹 → New Group → 命名 `Stores`

- [ ] **Step 2: 创建 ProjectStore**

```swift
// ProjectStore.swift
import Foundation
import GRDB

/// 项目状态管理
@Observable
class ProjectStore {
    /// 所有项目列表
    var projects: [ProjectRecord] = []
    
    /// 当前选中的项目
    var selectedProject: ProjectRecord?
    
    /// 搜索关键词
    var searchText: String = ""
    
    /// 过滤后的项目列表
    var filteredProjects: [ProjectRecord] {
        if searchText.isEmpty {
            return projects
        }
        return projects.filter { project in
            project.employerName.localizedCaseInsensitiveContains(searchText) ||
            project.testNumber.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    /// 加载所有项目
    func loadProjects() {
        guard let db = DatabaseManager.shared.db else { return }
        
        do {
            projects = try db.read { db in
                try ProjectRecord
                    .order(Column("updatedAt").desc)
                    .fetchAll(db)
            }
        } catch {
            print("加载项目失败: \(error)")
        }
    }
    
    /// 创建新项目
    func createProject(_ project: ProjectRecord) -> ProjectRecord? {
        guard let db = DatabaseManager.shared.db else { return nil }
        
        do {
            var newProject = project
            try db.write { db in
                try newProject.insert(db)
            }
            loadProjects()
            return newProject
        } catch {
            print("创建项目失败: \(error)")
            return nil
        }
    }
    
    /// 更新项目
    func updateProject(_ project: ProjectRecord) {
        guard let db = DatabaseManager.shared.db else { return }
        
        do {
            var updatedProject = project
            updatedProject.updatedAt = Date()
            try db.write { db in
                try updatedProject.update(db)
            }
            loadProjects()
        } catch {
            print("更新项目失败: \(error)")
        }
    }
    
    /// 删除项目
    func deleteProject(_ project: ProjectRecord) {
        guard let db = DatabaseManager.shared.db else { return }
        
        do {
            try db.write { db in
                // 先删除关联的样品和砝码
                try SampleRecord
                    .filter(Column("projectId") == project.id!)
                    .deleteAll(db)
                try StandardWeightRecord
                    .filter(Column("projectId") == project.id!)
                    .deleteAll(db)
                // 再删除项目
                _ = try project.delete(db)
            }
            loadProjects()
            if selectedProject?.id == project.id {
                selectedProject = nil
            }
        } catch {
            print("删除项目失败: \(error)")
        }
    }
    
    /// 选择项目
    func selectProject(_ project: ProjectRecord?) {
        selectedProject = project
    }
}
```

- [ ] **Step 3: 编译验证**

按 `Cmd+B` 编译，确认无错误。

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: 创建 ProjectStore 状态管理"
```

---

### Task 15: 创建 SampleStore

**Files:**
- Create: `DustCalculator/DustCalculator/Stores/SampleStore.swift`

- [ ] **Step 1: 创建 SampleStore**

```swift
// SampleStore.swift
import Foundation
import GRDB

/// 样品状态管理
@Observable
class SampleStore {
    /// 当前项目的样品列表
    var samples: [SampleRecord] = []
    
    /// 标准砝码列表
    var standardWeights: [StandardWeightRecord] = []
    
    /// 加载样品
    func loadSamples(projectId: Int64) {
        guard let db = DatabaseManager.shared.db else { return }
        
        do {
            samples = try db.read { db in
                try SampleRecord
                    .filter(Column("projectId") == projectId)
                    .order(Column("id"))
                    .fetchAll(db)
            }
        } catch {
            print("加载样品失败: \(error)")
        }
    }
    
    /// 加载标准砝码
    func loadStandardWeights(projectId: Int64) {
        guard let db = DatabaseManager.shared.db else { return }
        
        do {
            standardWeights = try db.read { db in
                try StandardWeightRecord
                    .filter(Column("projectId") == projectId)
                    .order(Column("id"))
                    .fetchAll(db)
            }
        } catch {
            print("加载砝码失败: \(error)")
        }
    }
    
    /// 创建样品
    func createSample(_ sample: SampleRecord) -> SampleRecord? {
        guard let db = DatabaseManager.shared.db else { return nil }
        
        do {
            var newSample = sample
            try db.write { db in
                try newSample.insert(db)
            }
            loadSamples(projectId: sample.projectId)
            return newSample
        } catch {
            print("创建样品失败: \(error)")
            return nil
        }
    }
    
    /// 批量创建样品
    func batchCreateSamples(_ newSamples: [SampleRecord]) {
        guard let db = DatabaseManager.shared.db else { return }
        guard let projectId = newSamples.first?.projectId else { return }
        
        do {
            try db.write { db in
                for var sample in newSamples {
                    try sample.insert(db)
                }
            }
            loadSamples(projectId: projectId)
        } catch {
            print("批量创建样品失败: \(error)")
        }
    }
    
    /// 更新样品
    func updateSample(_ sample: SampleRecord) {
        guard let db = DatabaseManager.shared.db else { return }
        
        do {
            var updatedSample = sample
            try db.write { db in
                try updatedSample.update(db)
            }
            loadSamples(projectId: sample.projectId)
        } catch {
            print("更新样品失败: \(error)")
        }
    }
    
    /// 删除样品
    func deleteSample(_ sample: SampleRecord) {
        guard let db = DatabaseManager.shared.db else { return }
        
        do {
            try db.write { db in
                _ = try sample.delete(db)
            }
            loadSamples(projectId: sample.projectId)
        } catch {
            print("删除样品失败: \(error)")
        }
    }
    
    /// 创建标准砝码
    func createStandardWeight(_ weight: StandardWeightRecord) -> StandardWeightRecord? {
        guard let db = DatabaseManager.shared.db else { return nil }
        
        do {
            var newWeight = weight
            try db.write { db in
                try newWeight.insert(db)
            }
            loadStandardWeights(projectId: weight.projectId)
            return newWeight
        } catch {
            print("创建砝码失败: \(error)")
            return nil
        }
    }
    
    /// 更新标准砝码
    func updateStandardWeight(_ weight: StandardWeightRecord) {
        guard let db = DatabaseManager.shared.db else { return }
        
        do {
            var updatedWeight = weight
            try db.write { db in
                try updatedWeight.update(db)
            }
            loadStandardWeights(projectId: weight.projectId)
        } catch {
            print("更新砝码失败: \(error)")
        }
    }
}
```

- [ ] **Step 2: 编译验证**

按 `Cmd+B` 编译，确认无错误。

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: 创建 SampleStore 状态管理"
```

---

## Phase 5: UI 层 - 基础视图

### Task 16: 创建 AppView 主框架

**Files:**
- Modify: `DustCalculator/DustCalculator/AppView.swift`

- [ ] **Step 1: 重写 AppView**

```swift
// AppView.swift
import SwiftUI

struct AppView: View {
    @State private var projectStore = ProjectStore()
    @State private var sampleStore = SampleStore()
    
    var body: some View {
        NavigationSplitView {
            SidebarView(
                projectStore: projectStore,
                sampleStore: sampleStore
            )
            .navigationSplitViewColumnWidth(min: 200, ideal: 250, max: 300)
        } detail: {
            if let project = projectStore.selectedProject {
                ProjectDetailView(
                    project: project,
                    projectStore: projectStore,
                    sampleStore: sampleStore
                )
            } else {
                EmptyStateView()
            }
        }
        .frame(minWidth: 900, minHeight: 600)
        .onAppear {
            projectStore.loadProjects()
        }
    }
}

#Preview {
    AppView()
}
```

- [ ] **Step 2: 编译验证**

按 `Cmd+B` 编译（会有错误提示缺少视图组件，下一步创建）。

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: 创建 AppView 主框架"
```

---

### Task 17: 创建基础视图组件

**Files:**
- Create: `DustCalculator/DustCalculator/Views/SidebarView.swift`
- Create: `DustCalculator/DustCalculator/Views/EmptyStateView.swift`
- Create: `DustCalculator/DustCalculator/Views/Views` 目录

- [ ] **Step 1: 创建 Views 目录结构**

在 Xcode 项目导航器中：
1. 右键 DustCalculator 文件夹 → New Group → 命名 `Views`

- [ ] **Step 2: 创建 SidebarView**

```swift
// SidebarView.swift
import SwiftUI

struct SidebarView: View {
    @Bindable var projectStore: ProjectStore
    @Bindable var sampleStore: SampleStore
    
    var body: some View {
        List(selection: $projectStore.selectedProject) {
            ForEach(projectStore.filteredProjects, id: \.id) { project in
                ProjectRowView(project: project)
                    .tag(project)
            }
        }
        .searchable(text: $projectStore.searchText, prompt: "搜索项目")
        .navigationTitle("项目列表")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: createNewProject) {
                    Image(systemName: "plus")
                }
            }
        }
    }
    
    private func createNewProject() {
        let newProject = ProjectRecord.create(
            employerName: "新项目",
            testNumber: "待填写",
            analysisLocation: "待填写",
            analysisDate: Date(),
            samplingDate: Date(),
            testStandard: "GBZ/T 192"
        )
        
        if let created = projectStore.createProject(newProject) {
            projectStore.selectProject(created)
        }
    }
}
```

- [ ] **Step 3: 创建 ProjectRowView**

```swift
// ProjectRowView.swift (在 SidebarView.swift 同一文件或单独文件)
import SwiftUI

struct ProjectRowView: View {
    let project: ProjectRecord
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(project.employerName)
                .font(.headline)
            Text(project.testNumber)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text(formatDate(project.analysisDate))
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}
```

- [ ] **Step 4: 创建 EmptyStateView**

```swift
// EmptyStateView.swift
import SwiftUI

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "folder")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)
            Text("请选择或创建一个项目")
                .font(.title2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
```

- [ ] **Step 5: 编译验证**

按 `Cmd+B` 编译，确认无错误。

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: 创建 SidebarView 和 EmptyStateView"
```

---

### Task 18: 创建 ProjectDetailView 基础结构

**Files:**
- Create: `DustCalculator/DustCalculator/Views/ProjectDetailView.swift`

- [ ] **Step 1: 创建 ProjectDetailView**

```swift
// ProjectDetailView.swift
import SwiftUI

struct ProjectDetailView: View {
    @Bindable var project: ProjectRecord
    @Bindable var projectStore: ProjectStore
    @Bindable var sampleStore: SampleStore
    
    @State private var showTranscriptionView = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // 项目信息表单
                ProjectFormView(project: $project)
                
                Divider()
                
                // 工具栏
                ToolbarView(
                    showTranscriptionView: $showTranscriptionView,
                    onSave: { projectStore.updateProject(project) }
                )
                
                Divider()
                
                // 样品表格
                SampleTableView(
                    samples: sampleStore.samples,
                    project: project,
                    sampleStore: sampleStore,
                    isTranscriptionView: showTranscriptionView
                )
                
                Divider()
                
                // 标准砝码
                StandardWeightView(
                    weights: sampleStore.standardWeights,
                    project: project,
                    sampleStore: sampleStore
                )
            }
            .padding()
        }
        .navigationTitle(project.employerName)
        .navigationSubtitle(project.testNumber)
        .onAppear {
            if let id = project.id {
                sampleStore.loadSamples(projectId: id)
                sampleStore.loadStandardWeights(projectId: id)
            }
        }
        .onChange(of: project.id) { _, newId in
            if let id = newId {
                sampleStore.loadSamples(projectId: id)
                sampleStore.loadStandardWeights(projectId: id)
            }
        }
    }
}
```

- [ ] **Step 2: 创建 ToolbarView**

```swift
// ToolbarView.swift (可单独文件或在同一文件)
import SwiftUI

struct ToolbarView: View {
    @Binding var showTranscriptionView: Bool
    let onSave: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            // 视图切换
            Toggle("誊抄视图", isOn: $showTranscriptionView)
            
            Spacer()
            
            // 保存按钮
            Button("保存项目") {
                onSave()
            }
            .buttonStyle(.borderedProminent)
            
            // 导出按钮（后续实现）
            Button("导出数据") {
                // TODO: 实现导出功能
            }
            .buttonStyle(.bordered)
        }
        .padding(.vertical, 8)
    }
}
```

- [ ] **Step 3: 编译验证**

按 `Cmd+B` 编译（会有错误提示缺少子视图，后续任务创建）。

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: 创建 ProjectDetailView 基础结构"
```

---

## Phase 6: UI 层 - 表单和表格

### Task 19: 创建 ProjectFormView

**Files:**
- Create: `DustCalculator/DustCalculator/Views/ProjectFormView.swift`

- [ ] **Step 1: 创建 ProjectFormView**

```swift
// ProjectFormView.swift
import SwiftUI

struct ProjectFormView: View {
    @Binding var project: ProjectRecord
    
    var body: some View {
        Form {
            Section("基本信息") {
                LabeledContent("用人单位") {
                    TextField("", text: $project.employerName)
                        .textFieldStyle(.roundedBorder)
                }
                LabeledContent("检测编号") {
                    TextField("", text: $project.testNumber)
                        .textFieldStyle(.roundedBorder)
                }
                LabeledContent("分析地点") {
                    TextField("", text: $project.analysisLocation)
                        .textFieldStyle(.roundedBorder)
                }
                LabeledContent("分析日期") {
                    DatePicker("", selection: $project.analysisDate, displayedComponents: .date)
                }
                LabeledContent("采样日期") {
                    DatePicker("", selection: $project.samplingDate, displayedComponents: .date)
                }
                LabeledContent("检测标准") {
                    TextField("", text: $project.testStandard)
                        .textFieldStyle(.roundedBorder)
                }
            }
            
            Section("采样环境") {
                LabeledContent("采样温度 (℃)") {
                    TextField("", value: $project.samplingTemperature, format: .number)
                        .textFieldStyle(.roundedBorder)
                }
                LabeledContent("采样气压 {
                    TextField("", value: $project.samplingAirPressure, format: .number)
                        .textFieldStyle(.roundedBorder)
                }
            }
            
            Section("分析环境") {
                LabeledContent("分析温度最低 (℃)") {
                    TextField("", value: $project.analysisTemperatureMin, format: .number)
                        .textFieldStyle(.roundedBorder)
                }
                LabeledContent("分析温度最高 (℃)") {
                    TextField("", value: $project.analysisTemperatureMax, format: .number)
                        .textFieldStyle(.roundedBorder)
                }
                LabeledContent("分析湿度最低 (%)") {
                    TextField("", value: $project.analysisHumidityMin, format: .number)
                        .textFieldStyle(.roundedBorder)
                }
                LabeledContent("分析湿度最高 (%)") {
                    TextField("", value: $project.analysisHumidityMax, format: .number)
                        .textFieldStyle(.roundedBorder)
                }
            }
            
            Section("仪器信息") {
                LabeledContent("仪器名称") {
                    TextField("", text: $project.instrumentName ?? "")
                        .textFieldStyle(.roundedBorder)
                }
                LabeledContent("仪器编号") {
                    TextField("", text: $project.instrumentNo ?? "")
                        .textFieldStyle(.roundedBorder)
                }
            }
            
            Section("人员信息") {
                LabeledContent("分析人员") {
                    TextField("", text: $project.analyst ?? "")
                        .textFieldStyle(.roundedBorder)
                }
                LabeledContent("审核人员") {
                    TextField("", text: $project.reviewer ?? "")
                        .textFieldStyle(.roundedBorder)
                }
            }
        }
        .formStyle(.grouped)
    }
}
```

- [ ] **Step 2: 编译验证**

按 `Cmd+B` 编译，确认无错误。

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: 创建 ProjectFormView 项目表单"
```

---

### Task 20: 创建 SampleTableView 基础结构

**Files:**
- Create: `DustCalculator/DustCalculator/Views/SampleTableView.swift`

- [ ] **Step 1: 创建 SampleTableView**

```swift
// SampleTableView.swift
import SwiftUI

struct SampleTableView: View {
    let samples: [SampleRecord]
    let project: ProjectRecord
    @Bindable var sampleStore: SampleStore
    let isTranscriptionView: Bool
    
    @State private var selectedSample: SampleRecord?
    @State private var editingSample: SampleRecord?
    
    // 完整视图的列
    private let fullViewColumns: [String] = [
        "样品类型", "样品编号", "滤膜编号", "W1", "W2第一次", "W2第二次",
        "W2平均", "称量差", "称量QC", "Δm", "Δm QC", "Vt", "V0",
        "浓度", "检测值", "检出"
    ]
    
    // 蚊抄视图的列
    private let transcriptionColumns: [String] = [
        "样品编号", "滤膜编号", "W1", "W2第一次", "W2第二次"
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("样品数据")
                .font(.headline)
            
            Table(samples, selection: $selectedSample) {
                TableColumn("样品类型") { sample in
                    Text(sample.sampleType)
                }
                
                TableColumn("样品编号") { sample in
                    EditableText(value: sample.sampleNo, onEdit: { newValue in
                        updateSampleField(sample, field: "sampleNo", value: newValue)
                    })
                }
                
                TableColumn("滤膜编号") { sample in
                    EditableText(value: sample.filterNo, onEdit: { newValue in
                        updateSampleField(sample, field: "filterNo", value: newValue)
                    })
                }
                
                TableColumn("W1") { sample in
                    EditableDouble(value: sample.w1, onEdit: { newValue in
                        updateSampleAndRecalculate(sample, w1: newValue)
                    })
                }
                
                TableColumn("W2第一次") { sample in
                    EditableDouble(value: sample.w2First, onEdit: { newValue in
                        updateSampleAndRecalculate(sample, w2First: newValue)
                    })
                }
                
                TableColumn("W2第二次") { sample in
                    EditableDouble(value: sample.w2Second, onEdit: { newValue in
                        updateSampleAndRecalculate(sample, w2Second: newValue)
                    })
                }
                
                TableColumn("W2平均") { sample in
                    Text(formatDouble(sample.w2Avg))
                        .foregroundStyle(.secondary)
                }
                
                TableColumn("称量差") { sample in
                    Text(formatDouble(sample.weighingDiff))
                        .foregroundStyle(.secondary)
                }
                
                TableColumn("称量QC") { sample in
                    Text(sample.weighingQC == true ? "合格" : sample.weighingQC == false ? "不合格" : "")
                        .foregroundStyle(sample.weighingQC == true ? .green : .red)
                }
                
                TableColumn("Δm") { sample in
                    Text(formatDouble(sample.deltaM))
                        .foregroundStyle(.secondary)
                }
                
                TableColumn("Δm QC") { sample in
                    Text(sample.deltaMQC == true ? "合格" : sample.deltaMQC == false ? "不合格" : "")
                        .foregroundStyle(sample.deltaMQC == true ? .green : .red)
                }
                
                TableColumn("Vt") { sample in
                    EditableDouble(value: sample.vt, onEdit: { newValue in
                        updateSampleAndRecalculate(sample, vt: newValue)
                    })
                }
                
                TableColumn("V0") { sample in
                    Text(formatDouble(sample.v0))
                        .foregroundStyle(.secondary)
                }
                
                TableColumn("浓度") { sample in
                    Text(formatDouble(sample.concentration))
                        .foregroundStyle(.secondary)
                }
                
                TableColumn("检测值") { sample in
                    Text(formatDouble(sample.roundedValue))
                        .foregroundStyle(.secondary)
                }
                
                TableColumn("检出") { sample in
                    // 从 roundedValue 和 sampleType 判断检出状态
                    let isDetected = calculateDetectionStatus(sample)
                    Text(isDetected)
                        .foregroundStyle(isDetected == "检出" ? .green : .secondary)
                }
            }
            .tableStyle(.alternatingRowBackgrounds)
            .frame(minHeight: 300)
            
            // 添加样品按钮
            HStack {
                Button("添加样品") {
                    addNewSample()
                }
                .buttonStyle(.bordered)
                
                Button("批量粘贴") {
                    // TODO: 实现批量粘贴功能
                }
                .buttonStyle(.bordered)
                
                if let selected = selectedSample {
                    Button("删除样品") {
                        sampleStore.deleteSample(selected)
                        selectedSample = nil
                    }
                    .buttonStyle(.bordered)
                    .foregroundStyle(.red)
                }
            }
        }
    }
    
    // ... 辅助方法将在后续任务中添加
}
```

- [ ] **Step 2: 创建 EditableText 和 EditableDouble 组件**

```swift
// 编辑组件在同一文件或单独文件
import SwiftUI

struct EditableText: View {
    let value: String
    let onEdit: (String) -> Void
    
    @State private var editingValue: String = ""
    @State private var isEditing = false
    
    var body: some View {
        TextField("", text: $editingValue, onCommit: {
            if editingValue != value {
                onEdit(editingValue)
            }
            isEditing = false
        })
        .textFieldStyle(.roundedBorder)
        .onAppear { editingValue = value }
    }
}

struct EditableDouble: View {
    let value: Double?
    let onEdit: (Double?) -> Void
    
    @State private var editingValue: String = ""
    @State private var isEditing = false
    
    var body: some View {
        TextField("", text: $editingValue, onCommit: {
            let newValue = Double(editingValue)
            if newValue != value {
                onEdit(newValue)
            }
            isEditing = false
        })
        .textFieldStyle(.roundedBorder)
        .onAppear {
            if let v = value {
                editingValue = String(v)
            }
        }
    }
}
```

- [ ] **Step 3: 编译验证**

按 `Cmd+B` 编译（会有警告提示缺少辅助方法，下一步添加）。

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: 创建 SampleTableView 基础结构"
```

---

### Task 21: 完善 SampleTableView 辅助方法

**Files:**
- Modify: `DustCalculator/DustCalculator/Views/SampleTableView.swift`

- [ ] **Step 1: 添加辅助方法**

```swift
// 在 SampleTableView 中添加：

extension SampleTableView {
    /// 格式化 Double 显示
    private func formatDouble(_ value: Double?) -> String {
        guard let v = value, !v.isNaN else { return "" }
        return String(format: "%.2f", v)
    }
    
    /// 计算检出状态
    private func calculateDetectionStatus(_ sample: SampleRecord) -> String {
        let sampleType = SampleType(rawValue: sample.sampleType) ?? .sample
        
        guard let roundedValue = sample.roundedValue, !roundedValue.isNaN else {
            return ""
        }
        
        if sampleType == .blank {
            return "-"
        }
        
        guard let vt = sample.vt else { return "" }
        let minQuantitative = getMinQuantitativeConcentration(vt: vt)
        
        return roundedValue <= minQuantitative ? "未检出" : "检出"
    }
    
    /// 添加新样品
    private func addNewSample() {
        guard let projectId = project.id else { return }
        
        let newSample = SampleRecord(
            id: nil,
            projectId: projectId,
            sampleType: "样品",
            sampleNo: "",
            filterNo: "",
            w1: nil,
            w2First: nil,
            w2Second: nil,
            w2Avg: nil,
            weighingDiff: nil,
            weighingQC: nil,
            deltaM: nil,
            deltaMQC: nil,
            vt: nil,
            v0: nil,
            concentration: nil,
            roundedValue: nil
        )
        
        sampleStore.createSample(newSample)
    }
    
    /// 更新样品字段
    private func updateSampleField(_ sample: SampleRecord, field: String, value: String) {
        var updated = sample
        switch field {
        case "sampleNo":
            updated.sampleNo = value
            updated.sampleType = getSampleType(sampleNo: value).rawValue
        case "filterNo":
            updated.filterNo = value
        default:
            break
        }
        sampleStore.updateSample(updated)
    }
    
    /// 更新样品并重新计算
    private func updateSampleAndRecalculate(
        _ sample: SampleRecord,
        w1: Double? = nil,
        w2First: Double? = nil,
        w2Second: Double? = nil,
        vt: Double? = nil
    ) {
        var updated = sample
        
        // 更新输入值
        if let w1 = w1 { updated.w1 = w1 }
        if let w2First = w2First { updated.w2First = w2First }
        if let w2Second = w2Second { updated.w2Second = w2Second }
        if let vt = vt { updated.vt = vt }
        
        // 使用 Calculator 重新计算
        let input = SampleInput(
            sampleNo: updated.sampleNo,
            filterNo: updated.filterNo,
            w1: updated.w1,
            w2First: updated.w2First,
            w2Second: updated.w2Second,
            vt: updated.vt ?? 500
        )
        
        let output = calculateSample(
            input: input,
            temperature: project.samplingTemperature,
            pressure: project.samplingAirPressure
        )
        
        // 更新计算结果
        updated.sampleType = output.sampleType.rawValue
        updated.w2Avg = output.w2Avg
        updated.weighingDiff = output.weighingDiff
        updated.weighingQC = output.weighingQC == .passed
        updated.deltaM = output.deltaM
        updated.deltaMQC = output.deltaMQC == .passed
        updated.vt = output.vt
        updated.v0 = output.v0
        updated.concentration = output.concentration
        updated.roundedValue = output.roundedValue
        
        sampleStore.updateSample(updated)
    }
}
```

- [ ] **Step 2: 编译验证**

按 `Cmd+B` 编译，确认无错误。

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: 完善 SampleTableView 辅助方法和重计算逻辑"
```

---

### Task 22: 创建 StandardWeightView

**Files:**
- Create: `DustCalculator/DustCalculator/Views/StandardWeightView.swift`

- [ ] **Step 1: 创建 StandardWeightView**

```swift
// StandardWeightView.swift
import SwiftUI

struct StandardWeightView: View {
    let weights: [StandardWeightRecord]
    let project: ProjectRecord
    @Bindable var sampleStore: SampleStore
    
    @State private var selectedWeight: StandardWeightRecord?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("标准砝码检查")
                .font(.headline)
            
            if weights.isEmpty {
                Text("暂无砝码检查记录")
                    .foregroundStyle(.secondary)
            } else {
                Table(weights, selection: $selectedWeight) {
                    TableColumn("砝码编号") { weight in
                        EditableWeightText(value: weight.weightNo, onEdit: { newValue in
                            updateWeightField(weight, field: "weightNo", value: newValue)
                        })
                    }
                    
                    TableColumn("原始质量") { weight in
                        EditableWeightDouble(value: weight.originalMass, onEdit: { newValue in
                            updateWeightAndCheck(weight, originalMass: newValue)
                        })
                    }
                    
                    TableColumn("本次称重") { weight in
                        EditableWeightDouble(value: weight.currentMass, onEdit: { newValue in
                            updateWeightAndCheck(weight, currentMass: newValue)
                        })
                    }
                    
                    TableColumn("检查结果") { weight in
                        Text(weight.checkResult ?? "")
                            .foregroundStyle(weight.checkResult == "合格" ? .green : .red)
                    }
                }
                .tableStyle(.alternatingRowBackgrounds)
                .frame(minHeight: 100)
            }
            
            HStack {
                Button("添加砝码") {
                    addNewWeight()
                }
                .buttonStyle(.bordered)
                
                if let selected = selectedWeight {
                    Button("删除") {
                        sampleStore.updateStandardWeight(selected)
                        selectedWeight = nil
                    }
                    .buttonStyle(.bordered)
                    .foregroundStyle(.red)
                }
            }
        }
    }
    
    private func addNewWeight() {
        guard let projectId = project.id else { return }
        
        let newWeight = StandardWeightRecord(
            id: nil,
            projectId: projectId,
            weightNo: "",
            originalMass: nil,
            currentMass: nil,
            checkResult: nil
        )
        
        sampleStore.createStandardWeight(newWeight)
    }
    
    private func updateWeightField(_ weight: StandardWeightRecord, field: String, value: String) {
        var updated = weight
        if field == "weightNo" {
            updated.weightNo = value
        }
        sampleStore.updateStandardWeight(updated)
    }
    
    private func updateWeightAndCheck(
        _ weight: StandardWeightRecord,
        originalMass: Double? = nil,
        currentMass: Double? = nil
    ) {
        var updated = weight
        
        if let original = originalMass { updated.originalMass = original }
        if let current = currentMass { updated.currentMass = current }
        
        // 使用 Calculator 检查
        let result = checkStandardWeight(
            originalMass: updated.originalMass,
            currentMass: updated.currentMass
        )
        updated.checkResult = result.rawValue
        
        sampleStore.updateStandardWeight(updated)
    }
}

// 编辑组件
struct EditableWeightText: View {
    let value: String
    let onEdit: (String) -> Void
    
    @State private var editingValue: String = ""
    
    var body: some View {
        TextField("", text: $editingValue, onCommit: {
            if editingValue != value {
                onEdit(editingValue)
            }
        })
        .textFieldStyle(.roundedBorder)
        .onAppear { editingValue = value }
    }
}

struct EditableWeightDouble: View {
    let value: Double?
    let onEdit: (Double?) -> Void
    
    @State private var editingValue: String = ""
    
    var body: some View {
        TextField("", text: $editingValue, onCommit: {
            let newValue = Double(editingValue)
            if newValue != value {
                onEdit(newValue)
            }
        })
        .textFieldStyle(.roundedBorder)
        .onAppear {
            if let v = value {
                editingValue = String(v)
            }
        }
    }
}
```

- [ ] **Step 2: 编译验证**

按 `Cmd+B` 编译，确认无错误。

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: 创建 StandardWeightView 标准砝码视图"
```

---

## Phase 7: 完整验证

### Task 23: 完整应用测试

**Files:**
- All existing files

- [ ] **Step 1: 运行完整应用**

按 `Cmd+R` 运行应用，测试以下流程：

1. 创建新项目 - 点击 "+" 按钮
2. 编辑项目信息 - 在表单中填写
3. 添加样品 - 点击"添加样品"
4. 编辑样品数据 - 输入 W1, W2 等
5. 验证自动计算 - 检查计算值是否正确
6. 添加砝码记录 - 测试砝码检查功能
7. 切换项目 - 测试项目列表切换
8. 删除项目 - 测试删除功能

- [ ] **Step 2: 运行单元测试**

按 `Cmd+U` 运行所有测试，确认 CalculatorTests 全部通过。

- [ ] **Step 3: 对比 TypeScript 输出**

使用相同输入数据，对比 Swift 和 TypeScript 版本的计算结果是否一致。

- [ ] **Step 4: 最终 Commit**

```bash
git add .
git commit -m "feat: SwiftUI 原生迁移完成"
```

---

## 验收清单

- [ ] 应用可正常运行，无编译错误
- [ ] CalculatorTests 所有测试通过
- [ ] 可创建/编辑/删除项目
- [ ] 可添加/编辑样品，自动计算正确
- [ ] QC 检查功能正常（称量QC、Δm QC）
- [ ] 标准砝码检查功能正常
- [ ] 项目搜索功能正常
- [ ] 誊抄视图切换功能正常（如有）
- [ ] 应用体积 < 20MB
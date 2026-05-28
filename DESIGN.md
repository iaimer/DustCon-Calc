---
name: 粉尘浓度计算器
description: 基于 GBZ/T 192 标准的粉尘浓度分析记录桌面应用
colors:
  primary: "#409eff"
  danger: "#f56c6c"
  text-primary: "#303133"
  text-secondary: "#909399"
  bg-body: "#f5f7fa"
  bg-white: "#ffffff"
  border: "#e4e7ed"
  bg-active: "#ecf5ff"
  bg-qc-fail: "#fef0f0"
typography:
  body:
    fontFamily: "'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
  sidebar-title:
    fontFamily: "'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "18px"
    fontWeight: 600
rounded:
  sm: "4px"
  md: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
---

# Design System: 粉尘浓度计算器

## 1. Overview

**Creative North Star: "分析工作台"**

这个设计系统服务于职业卫生实验室的检测人员。使用者坐在工作站前，面对一批待处理的采样滤膜，在应用里填写称量数据、审查计算结果、打印检测报告。设计氛围由此决定：**平实、不喧哗、每一个元素都有功能理由**。

视觉语言从实验室仪器和手工记录表中汲取气质 —— 不模仿 SaaS 仪表盘，也不模仿学术论文的拥挤排版。白色背景上灰色和蓝色构建层级，红色只在 QC 不合格时出现 —— 它的稀有性就是意义。表格占 80% 以上的交互面积，所有设计决策以让表格更清晰、输入更顺手为优先。

**Key Characteristics:**
- 功能即装饰。不添加纯装饰性元素。阴影、颜色、圆角都有明确的交互意图
- 信息密度可调节：完整视图（编辑态）和誊抄视图（打印态）满足两种需求
- 状态嵌入内容：QC 不合格直接标红数据本身，不扩散到独立列或弹窗
- 蓝灰基调，红色仅为 QC 失败保留，银色为"未检出"保留

## 2. Colors

主色检测蓝（`#409eff`）贯穿交互态：选中的项目、聚焦的单元格、表格当前行、按钮主色。红色（`#f56c6c`）严格保留给 QC 不合格 —— 不在其他上下文出现。

### Primary
- **检测蓝** (`#409eff`)：按钮主色、表格焦点态、选中态、活跃项目标识、可点击元素的 hover 反馈。作为唯一的有彩色，使用面积控制在界面 10% 以内。
- **检测蓝浅** (`#ecf5ff`)：项目选中背景、当前行背景、选中单元格背景。功能：标示"你在这里"。

### Danger
- **QC 不合格红** (`#f56c6c`)：仅用于称量质控和增重质控不合格的数值文字。其出现即意味着需要操作者关注。

### Neutral
- **主体文字** (`#303133`)：项目名称、列标题、表格数据文字。全应用最高对比度。
- **辅助文字** (`#909399`)：项目日期、操作按钮、未检出状态、说明文字。降低视觉噪音。
- **背景色** (`#f5f7fa`)：应用整体背景、侧栏悬浮态。与白色形成微妙层级。
- **表面白** (`#ffffff`)：侧栏背景、表单卡片背景、table 行背景。全应用主要表面色。
- **边框** (`#e4e7ed`)：侧栏分割线、表单边框、表格行边框。`#ebeef5` 用于侧栏项目分隔。

### Named Rules

**红色协定。** 红色（`#f56c6c`）只用于 QC 不合格。不出现在按钮、标签、链接或任何装饰性元素中。它的缺席意味着"一切正常"。

## 3. Typography

**Body Font:** `'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif`

**Character:** 单一字体栈，全应用统一。PingFang SC 是 macOS 系统原生中文字体，在西文和数字上回退到系统西文字体。不做创意字体搭配 —— 实验室工具不需要展示性排版。

### Hierarchy
- **Sidebar Title** (600, 18px, 1.5)：「粉尘浓度计算器」标题。仅此一处。
- **Project Name** (500, inherited 14px, 1.5)：项目列表中的项目名称。
- **Table Header** (500, 13px, 1.5)：Element Plus 表格列标题。居中。
- **Table Body** (400, 13px, 1.5)：表格中的样品数据。数据密集区的阅读尺寸。
- **Meta** (400, 12px, 1.5)：项目日期、操作按钮文字辅助信息。
- **Rounded Value** (700, 13px, 1.5)：检测值。蓝色粗体，从数据中突出计算结果。

## 4. Elevation

轻阴影策略。层级主要通过背景色变化（白 `#fff` → 浅灰 `#f5f7fa` → 更浅蓝 `#ecf5ff`）传递，阴影仅出现在交互反馈中。

### Shadow Vocabulary
- **Toggle Hover** (`0 2px 8px rgba(64,158,255,0.4)`)：侧栏切换按钮 hover 时的提升效果。唯一的可见阴影。
- **Toggle Default** (`1px 0 4px rgba(0,0,0,0.08)`)：侧栏切换按钮的细微右投影，形成按钮和侧栏的分离感。

### Named Rules
**扁平默认法则。** 静止状态不下阴影。层级靠背景色过渡。阴影只在交互反馈中出现，不是结构的一部分。

## 5. Components

### Buttons
- **Shape:** 4px 圆角。标准高度。
- **Primary:** `#409eff` 背景 + 白色文字。应用于新建项目、保存。
- **Small / Circle (24×24px):** 用于项目列表（复制、删除）。hover 时显示（`opacity: 0 → 1`），减少视觉负担。
- **Ghost / Text:** 默认的 Element Plus 文字按钮样式，用于表格操作区域（新增行、批量设置）。

### Inputs / Fields

**标准表单输入**（项目信息区域）：Element Plus 默认样式。线性边框，聚焦时蓝色边框。

**Excel 风格表格输入**（样品表格区域）：
- **Shape:** 无边框、无背景。单元格本身是输入容器。
- **Default:** 单元格 4px 8px 内边距。`13px` 字体。白色背景。
- **Hover:** 浅灰背景（`#f5f7fa`）。
- **Focus / Selected:** 蓝色边框阴影（`inset 0 0 0 2px #409eff`），浅蓝背景（`#ecf5ff`）。
- **QC Fail:** 红色背景（`#fef0f0`），hover 加深（`#fde2e2`）。嵌入式的输入框完全透明，无额外边框。

### Table
- **Shape:** 无外边框，只有水平分隔线。每行 `height: auto`，单元格 `padding: 0`（excel 表格模式）。
- **Row Hover:** 浅灰背景。
- **Active Row (当前行):** 浅蓝背景 + 蓝色文字加粗。
- **QC Fail Row:** 浅红背景 + 红色文字加粗（Δm 列）。
- **Column Header:** 居中，`13px` 文字，500 权重。
- **Not Detected:** 银灰色（`#909399`）斜体。

### Navigation (Sidebar)
- **Width:** 300px 固定宽度，可折叠。
- **Header:** 20px 内边距，下方 1px 线分割。
- **Items:** 12px 20px 内边距，下方 1px 细线分割。
- **Active:** 浅蓝背景（`#ecf5ff`）。
- **Hover:** 浅灰背景（`#f5f7fa`）。
- **Action Buttons (复制/删除):** hover 时才显示，渐入 0.2s transition。
- **Toggle:** 16×48px 窄条，半突出于侧栏右侧。hover 时变为蓝色。

### Cards / Containers
- **Collapsible Panels (项目信息/砝码检查):** 无边框、无阴影、无圆角。内容直接贴合背景。
- **Standard Element Plus Card:** 保留默认的 4px 圆角和极浅阴影。用于定量浓度提示等辅助信息。

## 6. Do's and Don'ts

### Do:
- **Do** 让表格占据主要内容区 80% 以上的面积。其他面板应可折叠，不抢占表格的注意力。
- **Do** 使用蓝色（`#409eff`）作为唯一的交互态颜色。选中、聚焦、链接、按钮保持一致。
- **Do** 用红色（`#f56c6c`）标示 QC 不合格的数值。红色只出现于此。
- **Do** 在单元格内用蓝色粗体（`rounded-value`）突出显示计算结果（检测值）。
- **Do** 保持侧栏项目列表简洁，操作按钮 hover 才显示。
- **Do** 使用 `13px` 表格字号平衡可读性和信息密度。

### Don't:
- **Don't** 添加独立 QC 判定列。不合格状态应通过内联红色文字标示。
- **Don't** 使用弹窗或对话框来告知 QC 结果。状态就在数据所在的位置。
- **Don't** 出现除 `#409eff`（检测蓝）和 `#f56c6c`（QC 红）以外的有彩色。不要使用绿色表示合格（合格即默认，无需颜色）。
- **Don't** 在侧栏或表格以外添加卡片式区域。元素靠间距和对齐组织，不需要卡片包裹。
- **Don't** 用科研论文的拥挤排版。保持单元格间距舒适（4px 8px 内边距），行间有足够呼吸感。
- **Don't** 在应显示检测值的单元格中显示「——」、「-」或空白。显示计算结果或明确标示"未检出"（灰色斜体）。

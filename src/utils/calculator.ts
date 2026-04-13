/**
 * 四舍六入五成双（银行家舍入法）- GB/T 8170标准
 *
 * 规则说明：
 * - 当舍弃部分小于0.5时，舍去
 * - 当舍弃部分大于0.5时，进一
 * - 当舍弃部分恰好等于0.5时：
 *   - 如果前一位是偶数，则舍去
 *   - 如果前一位是奇数，则进一
 */
export function roundBank(num: number, decimals: number): number {
  if (num === null || num === undefined || isNaN(num)) {
    return NaN
  }

  const multiplier = Math.pow(10, decimals)
  const shifted = num * multiplier

  // 处理精度问题
  const epsilon = 1e-10
  const roundedShifted = Math.round(shifted * 1e10) / 1e10

  // 判断是否有小数部分
  const integer = Math.floor(roundedShifted)
  const fraction = roundedShifted - integer

  // 判断是否恰好是0.5（考虑精度误差）
  if (Math.abs(fraction - 0.5) < epsilon) {
    // 恰好0.5时，检查整数部分是否为偶数
    if (integer % 2 === 0) {
      // 偶数舍去
      return integer / multiplier
    } else {
      // 奇数进一
      return (integer + 1) / multiplier
    }
  }

  // 非0.5情况：常规四舍六入
  // < 0.5 舍去，> 0.5 进一
  if (fraction < 0.5) {
    return integer / multiplier
  } else {
    return (integer + 1) / multiplier
  }
}

/**
 * 标准采样体积选项
 */
export const SAMPLING_VOLUMES = [500, 300, 420, 450, 480, 525] as const

/**
 * 根据采样体积获取最低定量浓度
 *
 * 规则：
 * - 500L: 固定 0.2 mg/m³
 * - 其他: 0.1 × 1000 / Vt，向上取整保留两位小数（只进不舍）
 */
export function getMinQuantitativeConcentration(vt: number): number {
  if (vt === 500) {
    return 0.2
  }
  // 向上取整到两位小数（只进不舍）
  const raw = 0.1 * 1000 / vt
  return Math.ceil(raw * 100) / 100
}

/**
 * 根据采样体积获取检测值保留位数
 *
 * 规则：检测值保留位数与最低定量浓度一致
 * - 500L: 最低定量浓度0.2（1位小数）→ 检测值保留1位小数
 * - 其他: 最低定量浓度保留2位小数 → 检测值保留2位小数
 */
export function getRoundingDecimals(vt: number): number {
  return vt === 500 ? 1 : 2
}

/**
 * 判断是否需要V0换算
 *
 * 规则：当温度<5℃或>35℃、气压<98.8kPa或>103.4kPa时需要换算
 */
export function needV0Conversion(temperature: number | null, pressure: number | null): boolean {
  if (temperature === null || pressure === null) return false
  return temperature < 5 || temperature > 35 || pressure < 98.8 || pressure > 103.4
}

/**
 * 计算标准采样体积V0
 *
 * 公式：V0 = Vt × 293/(273+t) × (P/101.3)
 * 保留整数
 */
export function calculateV0(vt: number, temperature: number | null, pressure: number | null): number {
  if (temperature === null || pressure === null) {
    return vt
  }
  if (!needV0Conversion(temperature, pressure)) {
    return vt
  }
  return Math.round(vt * 293 / (273 + temperature) * (pressure / 101.3))
}

/**
 * 根据样品编号判断样品类型
 *
 * 规则：样品编号包含"-0-"为空白样品
 */
export function getSampleType(sampleNo: string): '空白' | '样品' {
  if (!sampleNo) return '样品'
  return sampleNo.includes('-0-') ? '空白' : '样品'
}

/**
 * 计算W2平均值
 *
 * 公式：(第一次 + 第二次) / 2，保留两位小数
 */
export function calculateW2Avg(w2First: number, w2Second: number): number {
  if (w2First === null || w2Second === null) {
    return NaN
  }
  return roundBank((w2First + w2Second) / 2, 2)
}

/**
 * 计算称量差值
 *
 * 公式：|第一次 - 第二次|
 */
export function calculateWeighingDiff(w2First: number, w2Second: number): number {
  if (w2First === null || w2Second === null) {
    return NaN
  }
  return Math.abs(w2First - w2Second)
}

/**
 * 判断称量质控是否合格
 *
 * 规则：称量差值 ≤ 0.2mg 为合格
 */
export function checkWeighingQC(weighingDiff: number): '合格' | '不合格' | '' {
  if (weighingDiff === null || isNaN(weighingDiff)) return ''
  return weighingDiff <= 0.2 ? '合格' : '不合格'
}

/**
 * 计算增重Δm
 *
 * 公式：W2平均值 - W1
 */
export function calculateDeltaM(w1: number, w2Avg: number): number {
  if (w1 === null || w2Avg === null) {
    return NaN
  }
  return w2Avg - w1
}

/**
 * 判断增重质控是否合格
 *
 * 规则：
 * - 空白样品：Δm ≤ 0.02mg 为合格
 * - 样品：Δm > 0.1mg 为合格
 */
export function checkDeltaMQC(deltaM: number, sampleType: '空白' | '样品'): '合格' | '不合格' | '' {
  if (deltaM === null || isNaN(deltaM)) return ''
  if (sampleType === '空白') {
    return deltaM <= 0.02 ? '合格' : '不合格'
  } else {
    return deltaM > 0.1 ? '合格' : '不合格'
  }
}

/**
 * 计算浓度C
 *
 * 公式：C = Δm × 1000 / V (mg/m³)
 */
export function calculateConcentration(deltaM: number, volume: number): number {
  if (deltaM === null || volume === null || volume === 0) {
    return NaN
  }
  return deltaM * 1000 / volume
}

/**
 * 计算修约后的检测值
 *
 * 规则：
 * - 根据采样体积确定保留位数
 * - 使用四舍六入五成双修约
 */
export function calculateRoundedValue(concentration: number, vt: number): number {
  if (concentration === null || isNaN(concentration)) return NaN
  const decimals = getRoundingDecimals(vt)
  return roundBank(concentration, decimals)
}

/**
 * 判断是否检出
 *
 * 规则：
 * - 空白样品显示"-"
 * - 检测实际浓度<最低定量浓度显示"未检出"
 * - 检测实际浓度≥最低定量浓度显示"检出"
 */
export function checkIsDetected(
  concentration: number,
  sampleType: '空白' | '样品',
  vt: number
): '-' | '未检出' | '检出' | '' {
  if (concentration === null || isNaN(concentration)) return ''
  if (sampleType === '空白') return '-'

  const minQuantitative = getMinQuantitativeConcentration(vt)
  return concentration < minQuantitative ? '未检出' : '检出'
}

/**
 * 计算标准砝码检查结果
 *
 * 规则：|本次称重 - 原始质量| ≤ 0.1mg 为合格
 */
export function checkStandardWeight(originalMass: number, currentMass: number): '合格' | '不合格' | '' {
  if (originalMass === null || currentMass === null) return ''
  const diff = Math.abs(currentMass - originalMass)
  // 使用toFixed处理浮点数精度问题
  return parseFloat(diff.toFixed(3)) <= 0.1 ? '合格' : '不合格'
}

/**
 * 完整计算样品数据
 */
export interface SampleInput {
  sample_no: string
  filter_no: string
  w1: number
  w2_first: number
  w2_second: number
  vt: number
}

export interface SampleOutput {
  sample_type: '空白' | '样品'
  sample_no: string
  filter_no: string
  w1: number
  w2_first: number
  w2_second: number
  w2_avg: number
  weighing_diff: number
  weighing_qc: '合格' | '不合格' | ''
  delta_m: number
  delta_m_qc: '合格' | '不合格' | ''
  vt: number
  v0: number
  concentration: number
  rounded_value: number
  is_detected: '-' | '未检出' | '检出' | ''
}

export function calculateSample(
  input: SampleInput,
  temperature: number,
  pressure: number
): SampleOutput {
  const sampleType = getSampleType(input.sample_no)
  const w2Avg = calculateW2Avg(input.w2_first, input.w2_second)
  const weighingDiff = calculateWeighingDiff(input.w2_first, input.w2_second)
  const weighingQC = checkWeighingQC(weighingDiff)
  const deltaM = calculateDeltaM(input.w1, w2Avg)
  const deltaMQC = checkDeltaMQC(deltaM, sampleType)
  const v0 = calculateV0(input.vt, temperature, pressure)
  const concentration = calculateConcentration(deltaM, v0)
  const roundedValue = calculateRoundedValue(concentration, input.vt)
  const isDetected = checkIsDetected(concentration, sampleType, input.vt)

  return {
    sample_type: sampleType,
    sample_no: input.sample_no,
    filter_no: input.filter_no,
    w1: input.w1,
    w2_first: input.w2_first,
    w2_second: input.w2_second,
    w2_avg: w2Avg,
    weighing_diff: weighingDiff,
    weighing_qc: weighingQC,
    delta_m: deltaM,
    delta_m_qc: deltaMQC,
    vt: input.vt,
    v0: v0,
    concentration: concentration,
    rounded_value: roundedValue,
    is_detected: isDetected
  }
}
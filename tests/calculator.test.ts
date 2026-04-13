import { describe, it, expect } from 'vitest'
import {
  roundBank,
  getMinQuantitativeConcentration,
  getRoundingDecimals,
  needV0Conversion,
  calculateV0,
  getSampleType,
  calculateW2Avg,
  checkWeighingQC,
  checkDeltaMQC,
  calculateConcentration,
  calculateRoundedValue,
  checkIsDetected,
  checkStandardWeight,
  calculateSample
} from '../src/utils/calculator'

describe('四舍六入五成双修约算法', () => {
  it('修约0.5到偶数位（整数部分为偶数时舍去）', () => {
    expect(roundBank(2.5, 0)).toBe(2)
    expect(roundBank(4.5, 0)).toBe(4)
    expect(roundBank(6.5, 0)).toBe(6)
  })

  it('修约0.5到奇数位（整数部分为奇数时进一）', () => {
    expect(roundBank(3.5, 0)).toBe(4)
    expect(roundBank(5.5, 0)).toBe(6)
    expect(roundBank(7.5, 0)).toBe(8)
  })

  it('修约0.5到1位小数（偶数位舍去）', () => {
    expect(roundBank(1.25, 1)).toBe(1.2)
    expect(roundBank(2.45, 1)).toBe(2.4)
  })

  it('修约0.5到1位小数（奇数位进一）', () => {
    expect(roundBank(1.35, 1)).toBe(1.4)
    expect(roundBank(2.55, 1)).toBe(2.6)
  })

  it('修约0.5到2位小数（偶数位舍去）', () => {
    expect(roundBank(1.125, 2)).toBe(1.12)
    expect(roundBank(2.345, 2)).toBe(2.34)
  })

  it('修约0.5到2位小数（奇数位进一）', () => {
    expect(roundBank(1.135, 2)).toBe(1.14)
    expect(roundBank(2.355, 2)).toBe(2.36)
  })

  it('小于0.5时舍去', () => {
    expect(roundBank(1.4, 0)).toBe(1)
    expect(roundBank(1.24, 1)).toBe(1.2)
  })

  it('大于0.5时进一', () => {
    expect(roundBank(1.6, 0)).toBe(2)
    expect(roundBank(1.26, 1)).toBe(1.3)
  })

  it('处理负数', () => {
    expect(roundBank(-2.5, 0)).toBe(-2) // -2是偶数
    expect(roundBank(-3.5, 0)).toBe(-4) // -3是奇数，但-4才是"舍入方向上"的偶数
  })
})

describe('采样体积相关计算', () => {
  it('500L采样体积的最低定量浓度为0.2', () => {
    expect(getMinQuantitativeConcentration(500)).toBe(0.2)
  })

  it('300L采样体积的最低定量浓度应为0.34（向上取整）', () => {
    expect(getMinQuantitativeConcentration(300)).toBe(0.34)
  })

  it('420L采样体积的最低定量浓度应为0.24（向上取整）', () => {
    expect(getMinQuantitativeConcentration(420)).toBe(0.24)
  })

  it('450L采样体积的最低定量浓度应为0.23（向上取整）', () => {
    expect(getMinQuantitativeConcentration(450)).toBe(0.23)
  })

  it('525L采样体积的最低定量浓度应为0.20（向上取整）', () => {
    expect(getMinQuantitativeConcentration(525)).toBe(0.20)
  })

  it('500L采样体积修约位数为1', () => {
    expect(getRoundingDecimals(500)).toBe(1)
  })

  it('其他采样体积修约位数为2', () => {
    expect(getRoundingDecimals(300)).toBe(2)
    expect(getRoundingDecimals(420)).toBe(2)
    expect(getRoundingDecimals(450)).toBe(2)
    expect(getRoundingDecimals(525)).toBe(2)
  })
})

describe('V0换算判断和计算', () => {
  it('温度在5-35℃范围内不需要换算', () => {
    expect(needV0Conversion(17.9, 101)).toBe(false)
    expect(needV0Conversion(20, 101.3)).toBe(false)
  })

  it('温度低于5℃需要换算', () => {
    expect(needV0Conversion(0, 101)).toBe(true)
    expect(needV0Conversion(4, 101)).toBe(true)
  })

  it('温度高于35℃需要换算', () => {
    expect(needV0Conversion(40, 101)).toBe(true)
  })

  it('气压低于98.8kPa需要换算', () => {
    expect(needV0Conversion(20, 98)).toBe(true)
  })

  it('气压高于103.4kPa需要换算', () => {
    expect(needV0Conversion(20, 105)).toBe(true)
  })

  it('不需要换算时V0等于Vt', () => {
    expect(calculateV0(500, 20, 101.3)).toBe(500)
  })

  it('需要换算时计算正确的V0', () => {
    // Vt=500L, t=0℃, P=90kPa
    // V0 = 500 × 293/(273+0) × (90/101.3) = 500 × 293/273 × 0.8875 ≈ 480
    const v0 = calculateV0(500, 0, 90)
    expect(v0).toBeGreaterThan(450)
    expect(v0).toBeLessThan(520)
  })
})

describe('样品类型判断', () => {
  it('样品编号包含-0-为空白样品', () => {
    expect(getSampleType('1-0-1')).toBe('空白')
    expect(getSampleType('2-0-2')).toBe('空白')
  })

  it('样品编号不包含-0-为样品', () => {
    expect(getSampleType('1-1-1-1')).toBe('样品')
    expect(getSampleType('2-1-2')).toBe('样品')
  })
})

describe('W2平均值计算', () => {
  it('正确计算平均值并修约到2位小数', () => {
    // (50.92 + 50.93) / 2 = 50.925，四舍六入五成双：5092是偶数，舍去得50.92
    expect(calculateW2Avg(50.92, 50.93)).toBe(50.92)
    // (41.33 + 41.35) / 2 = 41.34，无需修约
    expect(calculateW2Avg(41.33, 41.35)).toBe(41.34)
  })
})

describe('称量质控判断', () => {
  it('称量差值≤0.2为合格', () => {
    expect(checkWeighingQC(0.01)).toBe('合格')
    expect(checkWeighingQC(0.2)).toBe('合格')
  })

  it('称量差值>0.2为不合格', () => {
    expect(checkWeighingQC(0.21)).toBe('不合格')
    expect(checkWeighingQC(0.5)).toBe('不合格')
  })
})

describe('增重质控判断', () => {
  it('空白样品Δm≤0.02为合格', () => {
    expect(checkDeltaMQC(0.01, '空白')).toBe('合格')
    expect(checkDeltaMQC(0.02, '空白')).toBe('合格')
  })

  it('空白样品Δm>0.02为不合格', () => {
    expect(checkDeltaMQC(0.03, '空白')).toBe('不合格')
  })

  it('样品Δm>0.1为合格', () => {
    expect(checkDeltaMQC(0.11, '样品')).toBe('合格')
    expect(checkDeltaMQC(0.5, '样品')).toBe('合格')
  })

  it('样品Δm≤0.1为不合格', () => {
    expect(checkDeltaMQC(0.09, '样品')).toBe('不合格')
    expect(checkDeltaMQC(0.1, '样品')).toBe('不合格')
  })
})

describe('浓度计算', () => {
  it('正确计算浓度', () => {
    // Δm=0.5mg, V=500L → C=0.5×1000/500=1.0 mg/m³
    expect(calculateConcentration(0.5, 500)).toBe(1.0)
    // Δm=0.5mg, V=300L → C=0.5×1000/300≈1.67 mg/m³
    expect(calculateConcentration(0.5, 300)).toBeCloseTo(1.67, 2)
  })
})

describe('检测值修约', () => {
  it('500L采样体积保留1位小数', () => {
    expect(calculateRoundedValue(1.0, 500)).toBe(1.0)
    expect(calculateRoundedValue(1.15, 500)).toBe(1.2) // 四舍六入五成双
  })

  it('其他采样体积保留2位小数', () => {
    expect(calculateRoundedValue(1.67, 300)).toBe(1.67)
    expect(calculateRoundedValue(1.675, 300)).toBe(1.68) // 四舍六入五成双
  })
})

describe('检出判断', () => {
  it('空白样品显示-', () => {
    expect(checkIsDetected(0.5, '空白', 500)).toBe('-')
  })

  it('浓度<最低定量浓度显示未检出', () => {
    expect(checkIsDetected(0.1, '样品', 500)).toBe('未检出')
    expect(checkIsDetected(0.19, '样品', 500)).toBe('未检出')
  })

  it('浓度≥最低定量浓度显示检出', () => {
    expect(checkIsDetected(0.2, '样品', 500)).toBe('检出')  // 等于最低定量浓度
    expect(checkIsDetected(0.21, '样品', 500)).toBe('检出')
    expect(checkIsDetected(1.0, '样品', 500)).toBe('检出')
  })

  it('修约后等于最低定量浓度但实际浓度大于时显示检出', () => {
    // 实际浓度0.25修约后为0.2（银行家舍入），但用实际浓度判断应检出
    expect(checkIsDetected(0.25, '样品', 500)).toBe('检出')
    // 验证修约结果确实等于最低定量浓度
    expect(roundBank(0.25, 1)).toBe(0.2)
  })
})

describe('砝码检查', () => {
  it('差值≤0.1为合格', () => {
    expect(checkStandardWeight(50, 50.1)).toBe('合格')
    expect(checkStandardWeight(50, 50.05)).toBe('合格')
    expect(checkStandardWeight(50, 49.95)).toBe('合格')
  })

  it('差值>0.1为不合格', () => {
    expect(checkStandardWeight(50, 50.11)).toBe('不合格')
    expect(checkStandardWeight(50, 49.89)).toBe('不合格')
  })
})

describe('完整样品计算', () => {
  it('正确计算空白样品', () => {
    const result = calculateSample({
      sample_no: '1-0-1',
      filter_no: '',
      w1: 41.36,
      w2_first: 41.33,
      w2_second: 41.35,
      vt: 420
    }, 17.9, 101)

    expect(result.sample_type).toBe('空白')
    expect(result.w2_avg).toBe(41.34)
    expect(result.delta_m).toBeCloseTo(-0.02, 2)
    expect(result.is_detected).toBe('-')
  })

  it('正确计算样品', () => {
    const result = calculateSample({
      sample_no: '1-1-1-1',
      filter_no: '',
      w1: 50.22,
      w2_first: 50.92,
      w2_second: 50.93,
      vt: 500
    }, 17.9, 101)

    expect(result.sample_type).toBe('样品')
    // W2平均值 = (50.92 + 50.93) / 2 = 50.925 → 四舍六入五成双 → 50.92
    expect(result.w2_avg).toBe(50.92)
    // Δm = 50.92 - 50.22 = 0.70
    expect(result.delta_m).toBeCloseTo(0.70, 2)
    // 浓度 = 0.70 × 1000 / 500 = 1.40
    expect(result.concentration).toBeCloseTo(1.40, 2)
    expect(result.rounded_value).toBeCloseTo(1.4, 1)
    expect(result.is_detected).toBe('检出')
  })
})
import { describe, it, expect } from 'vitest'
import {
  roundBank,
  getMinQuantitativeConcentration,
  getRoundingDecimals,
  needV0Conversion,
  calculateW2Avg,
  checkWeighingQC,
  checkDeltaMQC,
  calculateConcentration,
  checkIsDetected,
  checkStandardWeight,
  calculateSample,
  SAMPLING_VOLUMES
} from '../src/utils/calculator'

describe('模拟数据完整计算流程测试', () => {
  // 模拟项目环境参数
  const normalEnvironment = { temperature: 20, pressure: 101.3 }
  const extremeEnvironment = { temperature: 40, pressure: 90 }
  const coldEnvironment = { temperature: -5, pressure: 105 }

  // 模拟样品数据集
  const mockSamples = [
    // 空白样品（编号含-0-）
    {
      sample_no: '1-0-1',
      filter_no: 'M001',
      w1: 41.36,
      w2_first: 41.33,
      w2_second: 41.35,
      vt: 420
    },
    // 正常检出样品
    {
      sample_no: '1-1-1-1',
      filter_no: 'M002',
      w1: 50.22,
      w2_first: 50.92,
      w2_second: 50.93,
      vt: 500
    },
    // 未检出样品（增重很小）
    {
      sample_no: '2-1-1-1',
      filter_no: 'M003',
      w1: 42.00,
      w2_first: 42.01,
      w2_second: 42.02,
      vt: 500
    },
    // 高浓度样品
    {
      sample_no: '3-1-1-1',
      filter_no: 'M004',
      w1: 40.50,
      w2_first: 42.50,
      w2_second: 42.51,
      vt: 300
    },
    // 称量质控不合格样品（差值 > 0.2）
    {
      sample_no: '4-1-1-1',
      filter_no: 'M005',
      w1: 45.00,
      w2_first: 45.50,
      w2_second: 45.80, // 差值 0.30 > 0.2
      vt: 420
    }
  ]

  describe('空白样品完整计算', () => {
    it('空白样品计算正确（负增重）', () => {
      const result = calculateSample(mockSamples[0], normalEnvironment.temperature, normalEnvironment.pressure)

      expect(result.sample_type).toBe('空白')
      expect(result.w2_avg).toBe(41.34) // 四舍六入五成双
      expect(result.delta_m).toBeCloseTo(-0.02, 2)
      expect(result.weighing_diff).toBeCloseTo(0.02, 2)
      expect(result.weighing_qc).toBe('合格') // 0.02 ≤ 0.2
      expect(result.delta_m_qc).toBe('合格') // 空白样品 |-0.02| ≤ 0.02
      expect(result.is_detected).toBe('-')
    })

    it('空白样品Vt显示为斜杠（不参与浓度计算）', () => {
      const result = calculateSample(mockSamples[0], normalEnvironment.temperature, normalEnvironment.pressure)
      expect(result.v0).toBe(420) // 不需要换算时V0=Vt
    })
  })

  describe('正常检出样品完整计算', () => {
    it('500L采样体积样品检出计算', () => {
      const result = calculateSample(mockSamples[1], normalEnvironment.temperature, normalEnvironment.pressure)

      expect(result.sample_type).toBe('样品')
      expect(result.w2_avg).toBe(50.92) // 四舍六入五成双：5092是偶数
      expect(result.delta_m).toBeCloseTo(0.70, 2)
      expect(result.concentration).toBeCloseTo(1.40, 2) // 0.70 * 1000 / 500
      expect(result.rounded_value).toBeCloseTo(1.4, 1) // 500L保留1位小数
      expect(result.is_detected).toBe('检出') // 1.4 > 0.2
      expect(result.v0).toBe(500) // 正常环境不需要换算
    })

    it('300L采样体积高浓度样品计算', () => {
      const result = calculateSample(mockSamples[3], normalEnvironment.temperature, normalEnvironment.pressure)

      expect(result.sample_type).toBe('样品')
      // w2_avg = (42.50 + 42.51) / 2 = 42.505 → 四舍六入五成双 → 42.50（50是偶数）
      expect(result.w2_avg).toBe(42.50)
      expect(result.delta_m).toBeCloseTo(2.00, 2) // 42.50 - 40.50
      expect(result.concentration).toBeCloseTo(6.67, 2) // 2.00 * 1000 / 300
      expect(result.rounded_value).toBeCloseTo(6.67, 2) // 300L保留2位小数
      expect(result.is_detected).toBe('检出')
    })
  })

  describe('未检出样品计算', () => {
    it('浓度低于最低定量浓度判定为未检出', () => {
      const result = calculateSample(mockSamples[2], normalEnvironment.temperature, normalEnvironment.pressure)

      expect(result.sample_type).toBe('样品')
      // w2_avg = (42.01 + 42.02) / 2 = 42.015 → 四舍六入五成双 → 42.02（01是奇数，进一）
      expect(result.w2_avg).toBe(42.02)
      expect(result.delta_m).toBeCloseTo(0.02, 2) // 42.02 - 42.00
      expect(result.concentration).toBeCloseTo(0.04, 2) // 0.02 * 1000 / 500
      expect(result.rounded_value).toBeCloseTo(0.0, 1)
      expect(result.is_detected).toBe('未检出') // 0.0 < 0.2
    })
  })

  describe('质控不合格情况', () => {
    it('称量差值过大判定不合格', () => {
      const result = calculateSample(mockSamples[4], normalEnvironment.temperature, normalEnvironment.pressure)

      expect(result.weighing_diff).toBeCloseTo(0.30, 2)
      expect(result.weighing_qc).toBe('不合格') // 0.30 > 0.2
    })
  })

  describe('V0换算场景', () => {
    it('高温环境需要V0换算', () => {
      const result = calculateSample(mockSamples[1], extremeEnvironment.temperature, extremeEnvironment.pressure)

      expect(needV0Conversion(extremeEnvironment.temperature, extremeEnvironment.pressure)).toBe(true)
      expect(result.v0).not.toBe(500) // V0被换算
      expect(result.v0).toBeLessThan(500) // 高温时V0 < Vt
      // 检查V0计算公式: V0 = Vt × 293/(273+t) × (P/101.3)
      // 500 × 293/313 × 90/101.3 ≈ 420
      expect(result.v0).toBeGreaterThan(400)
      expect(result.v0).toBeLessThan(450)
    })

    it('低温环境需要V0换算', () => {
      const result = calculateSample(mockSamples[1], coldEnvironment.temperature, coldEnvironment.pressure)

      expect(needV0Conversion(coldEnvironment.temperature, coldEnvironment.pressure)).toBe(true)
      // V0 = 500 × 293/268 × 105/101.3 ≈ 570
      expect(result.v0).toBeGreaterThan(500) // 低温高压时V0 > Vt
    })
  })

  describe('采样体积边界测试', () => {
    it('所有采样体积类型计算正确', () => {
      SAMPLING_VOLUMES.forEach(vt => {
        const minQuant = getMinQuantitativeConcentration(vt)
        const decimals = getRoundingDecimals(vt)

        expect(minQuant).toBeGreaterThan(0)
        expect(decimals).toBe(vt === 500 ? 1 : 2)

        // 验证最低定量浓度公式
        if (vt === 500) {
          expect(minQuant).toBe(0.2)
        } else {
          // 其他: 0.1 × 1000 / Vt，向上取整到两位小数
          const expectedRaw = 0.1 * 1000 / vt
          const expectedCeiled = Math.ceil(expectedRaw * 100) / 100
          expect(minQuant).toBe(expectedCeiled)
        }
      })
    })
  })

  describe('修约算法边界值测试', () => {
    it('检测值修约恰好等于最低定量浓度时判定未检出', () => {
      // 500L: 最低定量浓度 0.2
      // 检测值恰好 0.2 时应判定为未检出
      const roundedValue = 0.2
      const result = checkIsDetected(roundedValue, '样品', 500)
      expect(result).toBe('未检出')
    })

    it('检测值略高于最低定量浓度时判定检出', () => {
      const roundedValue = 0.21
      const result = checkIsDetected(roundedValue, '样品', 500)
      expect(result).toBe('检出')
    })

    it('四舍六入五成双精确测试', () => {
      // 整数位测试
      expect(roundBank(2.5, 0)).toBe(2)  // 奇数舍入到偶数
      expect(roundBank(3.5, 0)).toBe(4)  // 奇数舍入到偶数
      expect(roundBank(4.5, 0)).toBe(4)  // 偶数保持

      // 一位小数测试
      expect(roundBank(1.25, 1)).toBe(1.2)  // 25→偶数位舍去
      expect(roundBank(1.35, 1)).toBe(1.4)  // 35→奇数位进一
      expect(roundBank(1.45, 1)).toBe(1.4)  // 45→偶数位舍去

      // 两位小数测试
      expect(roundBank(1.125, 2)).toBe(1.12)  // 125→偶数位舍去
      expect(roundBank(1.135, 2)).toBe(1.14)  // 135→奇数位进一
    })
  })

  describe('砝码检查测试', () => {
    it('砝码检查合格场景', () => {
      expect(checkStandardWeight(50.00, 50.05)).toBe('合格')  // 差值 0.05
      expect(checkStandardWeight(50.00, 50.10)).toBe('合格')  // 差值 0.10（边界）
      expect(checkStandardWeight(50.00, 49.90)).toBe('合格')  // 差值 0.10（边界）
    })

    it('砝码检查不合格场景', () => {
      expect(checkStandardWeight(50.00, 50.11)).toBe('不合格')  // 差值 0.11
      expect(checkStandardWeight(50.00, 49.89)).toBe('不合格')  // 差值 0.11
    })
  })

  describe('错误输入处理', () => {
    it('null输入返回NaN或空', () => {
      expect(roundBank(null as any, 2)).toBeNaN()
      expect(calculateW2Avg(null as any, 50)).toBeNaN()
      expect(checkWeighingQC(null as any)).toBe('')
      expect(checkDeltaMQC(null as any, '样品')).toBe('')
    })

    it('无效采样体积返回NaN', () => {
      expect(calculateConcentration(0.5, 0)).toBeNaN()
      expect(calculateConcentration(0.5, null as any)).toBeNaN()
    })
  })
})
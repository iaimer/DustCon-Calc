import { describe, it, expect } from 'vitest'

describe('数值输入处理', () => {
  // 模拟输入处理函数
  const handleNumberInput = (value: string): string => {
    // 只保留数字、小数点和负号
    let filtered = value.replace(/[^\d.-]/g, '')
    // 确保只有一个小数点
    const parts = filtered.split('.')
    if (parts.length > 2) {
      filtered = parts[0] + '.' + parts.slice(1).join('')
    }
    // 处理负号：只有开头的负号才保留
    const isNegative = filtered.startsWith('-')
    filtered = filtered.replace(/-/g, '')
    if (isNegative) {
      filtered = '-' + filtered
    }
    return filtered
  }

  // 模拟失去焦点时的解析
  const parseNumber = (value: string): number | null => {
    if (value === '' || value === '-' || value === '.') {
      return null
    }
    return parseFloat(value)
  }

  it('允许输入整数', () => {
    expect(handleNumberInput('25')).toBe('25')
    expect(handleNumberInput('100')).toBe('100')
  })

  it('允许输入小数', () => {
    expect(handleNumberInput('25.5')).toBe('25.5')
    expect(handleNumberInput('0.1')).toBe('0.1')
    expect(handleNumberInput('.5')).toBe('.5')
  })

  it('允许输入负数', () => {
    expect(handleNumberInput('-5')).toBe('-5')
    expect(handleNumberInput('-10.5')).toBe('-10.5')
  })

  it('过滤非数字字符', () => {
    expect(handleNumberInput('abc')).toBe('')
    expect(handleNumberInput('25abc')).toBe('25')
    expect(handleNumberInput('温度25')).toBe('25')
    expect(handleNumberInput('25度')).toBe('25')
  })

  it('过滤多个小数点', () => {
    expect(handleNumberInput('25.5.3')).toBe('25.53')
    expect(handleNumberInput('...')).toBe('.')
  })

  it('过滤多个负号', () => {
    expect(handleNumberInput('--5')).toBe('-5')
    expect(handleNumberInput('5-3')).toBe('53')
    expect(handleNumberInput('-5-')).toBe('-5')
  })

  it('正确解析有效数值', () => {
    expect(parseNumber('25')).toBe(25)
    expect(parseNumber('25.5')).toBe(25.5)
    expect(parseNumber('-10.5')).toBe(-10.5)
    expect(parseNumber('.5')).toBe(0.5)
  })

  it('无效输入返回null', () => {
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('-')).toBeNull()
    expect(parseNumber('.')).toBeNull()
  })
})
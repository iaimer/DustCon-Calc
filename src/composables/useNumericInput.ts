import { ref } from 'vue'

export interface TempInputs {
  sampling_temperature: string
  sampling_air_pressure: string
  analysis_temperature_min: string
  analysis_temperature_max: string
  analysis_humidity_min: string
  analysis_humidity_max: string
}

export function useNumericInput() {
  const tempInputs = ref<TempInputs>({
    sampling_temperature: '',
    sampling_air_pressure: '',
    analysis_temperature_min: '',
    analysis_temperature_max: '',
    analysis_humidity_min: '',
    analysis_humidity_max: ''
  })

  // 处理数值输入（允许输入数字和小数点）
  const handleNumberInput = (field: keyof TempInputs, value: string) => {
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
    tempInputs.value[field] = filtered
  }

  // 数值输入失去焦点时保存
  const handleNumberBlur = (
    field: keyof TempInputs,
    onSave: (value: number | null) => void
  ) => {
    const val = tempInputs.value[field]
    if (val === '' || val === '-' || val === '.') {
      onSave(null)
    } else {
      let num = parseFloat(val)
      // 根据字段类型保留不同精度
      if (field === 'analysis_humidity_min' || field === 'analysis_humidity_max') {
        // 湿度保留整数
        num = Math.round(num)
      } else {
        // 温度和气压保留一位小数
        num = Math.round(num * 10) / 10
      }
      onSave(num)
      tempInputs.value[field] = String(num)
    }
  }

  // 格式化显示
  const formatOneDecimal = (val: number | null) => val !== null ? val.toFixed(1) : ''
  const formatInteger = (val: number | null) => val !== null ? Math.round(val).toString() : ''

  // 初始化临时输入值
  const initTempInputs = (data: {
    sampling_temperature: number | null
    sampling_air_pressure: number | null
    analysis_temperature_min: number | null
    analysis_temperature_max: number | null
    analysis_humidity_min: number | null
    analysis_humidity_max: number | null
  }) => {
    tempInputs.value.sampling_temperature = formatOneDecimal(data.sampling_temperature)
    tempInputs.value.sampling_air_pressure = formatOneDecimal(data.sampling_air_pressure)
    tempInputs.value.analysis_temperature_min = formatOneDecimal(data.analysis_temperature_min)
    tempInputs.value.analysis_temperature_max = formatOneDecimal(data.analysis_temperature_max)
    tempInputs.value.analysis_humidity_min = formatInteger(data.analysis_humidity_min)
    tempInputs.value.analysis_humidity_max = formatInteger(data.analysis_humidity_max)
  }

  return {
    tempInputs,
    handleNumberInput,
    handleNumberBlur,
    initTempInputs
  }
}
import { ElMessage } from 'element-plus'
import type { SampleRowData, EditableColumnField } from '../types/sample'
import { VALID_SAMPLING_VOLUMES } from '../types/sample'

export function usePasteHandler(
  samples: { value: SampleRowData[] },
  addSampleRows: (count: number) => void,
  updateSample: (row: SampleRowData) => void
) {
  // 处理单列粘贴（从Excel复制的数据）
  const handlePaste = (event: ClipboardEvent) => {
    const text = event.clipboardData?.getData('text/plain')
    if (!text) return

    // 解析：按换行分行（单列数据）
    const values = text.trim().split(/\r?\n/)

    // 获取当前焦点元素，确定目标列
    const activeEl = document.activeElement as HTMLElement
    if (!activeEl) return

    // 查找带有 data-cell 属性的父元素
    const cellContainer = activeEl.closest('[data-cell]') as HTMLElement
    if (!cellContainer) return

    // 从 data-cell 提取行索引和字段名（格式：{rowIndex}-{field}）
    const dataCell = cellContainer.getAttribute('data-cell')
    if (!dataCell) return

    const parts = dataCell.split('-')
    const rowIndex = parseInt(parts[0])
    const field = parts[1] as EditableColumnField

    // 验证字段是否可粘贴
    const validFields: EditableColumnField[] = ['sample_no', 'filter_no', 'w1', 'w2_first', 'w2_second', 'vt']
    if (!validFields.includes(field)) return

    // 确保有足够的行（从当前行开始）
    const neededRows = rowIndex + values.length
    while (samples.value.length < neededRows) {
      addSampleRows(1)
    }

    // 从当前行开始填充数据
    values.forEach((val, index) => {
      const row = samples.value[rowIndex + index]
      const trimmedVal = val.trim()

      if (field === 'vt') {
        const vtVal = parseInt(trimmedVal)
        row.vt = (VALID_SAMPLING_VOLUMES as readonly number[]).includes(vtVal) ? vtVal : 500
      } else if (field === 'w1' || field === 'w2_first' || field === 'w2_second') {
        row[field] = parseFloat(trimmedVal) || null
      } else {
        (row as unknown as Record<string, unknown>)[field] = trimmedVal
      }
      updateSample(row)
    })

    ElMessage.success(`已粘贴 ${values.length} 行数据到 ${field} 列，从第 ${rowIndex + 1} 行开始`)
  }

  return {
    handlePaste
  }
}
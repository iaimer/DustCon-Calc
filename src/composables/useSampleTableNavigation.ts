import { ref, nextTick } from 'vue'
import type { EditableColumnField } from '../types/sample'
import { EDITABLE_COLUMNS } from '../types/sample'

export function useSampleTableNavigation(samplesLength: () => number) {
  const currentCell = ref<{ row: number; col: number } | null>(null)

  // 获取列索引对应的字段名
  const getColumnField = (colIndex: number): EditableColumnField => {
    return EDITABLE_COLUMNS[colIndex] || 'sample_no'
  }

  // 获取字段名对应的列索引
  const getColumnIndex = (field: EditableColumnField): number => {
    return EDITABLE_COLUMNS.indexOf(field)
  }

  // 聚焦指定单元格
  const focusCell = (rowIndex: number, colIndex: number) => {
    currentCell.value = { row: rowIndex, col: colIndex }

    nextTick(() => {
      const field = getColumnField(colIndex)
      const selector = `[data-cell="${rowIndex}-${field}"]`
      const cellContainer = document.querySelector(selector)

      if (!cellContainer) return

      const inputEl = cellContainer.querySelector('input') as HTMLInputElement
      if (inputEl) {
        inputEl.focus()
        if (inputEl.value && inputEl.value.length > 0) {
          inputEl.select()
        }
      }
    })
  }

  // 处理单元格键盘导航
  const handleCellKeydown = (event: KeyboardEvent, rowIndex: number, field: EditableColumnField) => {
    const colIndex = getColumnIndex(field)
    if (colIndex === -1) return

    let newRow = rowIndex
    let newCol = colIndex
    const maxRows = samplesLength()

    switch (event.key) {
      case 'ArrowUp':
        newRow = Math.max(0, rowIndex - 1)
        event.preventDefault()
        break
      case 'ArrowDown':
        newRow = Math.min(maxRows - 1, rowIndex + 1)
        event.preventDefault()
        break
      case 'ArrowLeft':
        const inputEl = event.target as HTMLInputElement
        if (inputEl.selectionStart === 0 || inputEl.selectionStart === null) {
          newCol = Math.max(0, colIndex - 1)
          event.preventDefault()
        } else {
          return
        }
        break
      case 'ArrowRight':
        const inputElRight = event.target as HTMLInputElement
        if (inputElRight.selectionStart === inputElRight.value.length || inputElRight.selectionStart === null) {
          newCol = Math.min(EDITABLE_COLUMNS.length - 1, colIndex + 1)
          event.preventDefault()
        } else {
          return
        }
        break
      case 'Tab':
        if (event.shiftKey) {
          newCol = Math.max(0, colIndex - 1)
        } else {
          newCol = Math.min(EDITABLE_COLUMNS.length - 1, colIndex + 1)
        }
        event.preventDefault()
        break
      case 'Enter':
        newRow = Math.min(maxRows - 1, rowIndex + 1)
        event.preventDefault()
        break
      default:
        return
    }

    focusCell(newRow, newCol)
  }

  // 单元格点击选中
  const handleCellClick = (rowIndex: number, field: EditableColumnField) => {
    const colIndex = getColumnIndex(field)
    if (colIndex !== -1) {
      currentCell.value = { row: rowIndex, col: colIndex }
    }
  }

  // 单元格获得焦点
  const handleCellFocus = (rowIndex: number, field: EditableColumnField) => {
    const colIndex = getColumnIndex(field)
    if (colIndex !== -1) {
      currentCell.value = { row: rowIndex, col: colIndex }
    }
  }

  return {
    currentCell,
    getColumnField,
    getColumnIndex,
    focusCell,
    handleCellKeydown,
    handleCellClick,
    handleCellFocus
  }
}
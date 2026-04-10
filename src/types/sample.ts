import type { SampleOutput } from '../utils/calculator'

export type SampleType = '空白' | '样品'
export type QCResult = '合格' | '不合格' | ''
export type DetectResult = '-' | '未检出' | '检出' | ''

export interface Sample extends SampleOutput {
  id: number | null
  project_id: number
}

export interface SampleRowData {
  id: number | null
  project_id: number
  sample_type: SampleType
  sample_no: string
  filter_no: string
  w1: number | null
  w2_first: number | null
  w2_second: number | null
  w2_avg: number | null
  weighing_diff: number | null
  weighing_qc: QCResult
  delta_m: number | null
  delta_m_qc: QCResult
  vt: number
  v0: number
  concentration: number | null
  rounded_value: number | null
  is_detected: DetectResult
}

export type EditableColumnField = 'sample_no' | 'filter_no' | 'w1' | 'w2_first' | 'w2_second' | 'vt'

export const EDITABLE_COLUMNS: EditableColumnField[] = ['sample_no', 'filter_no', 'w1', 'w2_first', 'w2_second', 'vt']

export const VALID_SAMPLING_VOLUMES = [500, 300, 420, 450, 480, 525] as const

export function createEmptySampleRow(projectId: number): SampleRowData {
  return {
    id: null,
    project_id: projectId,
    sample_type: '样品',
    sample_no: '',
    filter_no: '',
    w1: null,
    w2_first: null,
    w2_second: null,
    w2_avg: null,
    weighing_diff: null,
    weighing_qc: '',
    delta_m: null,
    delta_m_qc: '',
    vt: 500,
    v0: 500,
    concentration: null,
    rounded_value: null,
    is_detected: ''
  }
}
import { invoke } from '@tauri-apps/api/core'
import type { Project, ProjectFormData } from '../types/project'
import type { SampleRowData } from '../types/sample'
import type { StandardWeight, StandardWeightCreateData, StandardWeightUpdateData } from '../types/standardWeight'

interface SampleData {
  sample_type: string
  sample_no: string
  filter_no: string
  w1: number | null
  w2_first: number | null
  w2_second: number | null
  w2_avg: number | null
  weighing_diff: number | null
  weighing_qc: string
  delta_m: number | null
  delta_m_qc: string
  vt: number
  v0: number
  concentration: number | null
  rounded_value: number | null
}

interface StandardWeightData {
  weight_no: string
  original_mass: number | null
  current_mass: number | null
  check_result: string
}

function convertSampleRowToData(row: SampleRowData): SampleData {
  return {
    sample_type: row.sample_type,
    sample_no: row.sample_no,
    filter_no: row.filter_no,
    w1: row.w1,
    w2_first: row.w2_first,
    w2_second: row.w2_second,
    w2_avg: row.w2_avg,
    weighing_diff: row.weighing_diff,
    weighing_qc: row.weighing_qc,
    delta_m: row.delta_m,
    delta_m_qc: row.delta_m_qc,
    vt: row.vt,
    v0: row.v0,
    concentration: row.concentration,
    rounded_value: row.rounded_value,
  }
}

export const tauriAPI = {
  // Projects
  getProjects: (): Promise<Project[]> => invoke('get_projects'),
  getProject: (id: number): Promise<Project | null> => invoke('get_project', { id }),
  createProject: (data: ProjectFormData): Promise<Project> => invoke('create_project', { data }),
  updateProject: (id: number, data: ProjectFormData): Promise<Project> => invoke('update_project', { id, data }),
  deleteProject: (id: number): Promise<boolean> => invoke('delete_project', { id }),
  copyProject: (id: number): Promise<{ id: number }> => invoke('copy_project', { id }),

  // Samples
  getSamples: (projectId: number): Promise<SampleRowData[]> => invoke('get_samples', { projectId }),
  createSample: (projectId: number, data: SampleData): Promise<SampleRowData> =>
    invoke('create_sample', { projectId, data }),
  updateSample: (id: number, data: SampleData): Promise<SampleRowData> =>
    invoke('update_sample', { id, data }),
  deleteSample: (id: number): Promise<boolean> => invoke('delete_sample', { id }),
  batchCreateSamples: (samples: Array<{ project_id: number; data: SampleData }>): Promise<SampleRowData[]> =>
    invoke('batch_create_samples', { samples }),

  // Sample helpers
  createSampleFromRow: (projectId: number, row: SampleRowData): Promise<SampleRowData> =>
    tauriAPI.createSample(projectId, convertSampleRowToData(row)),
  updateSampleFromRow: (row: SampleRowData): Promise<SampleRowData> =>
    row.id ? tauriAPI.updateSample(row.id, convertSampleRowToData(row)) : Promise.reject(new Error('No sample id')),

  // Standard weights
  getStandardWeight: (projectId: number): Promise<StandardWeight | null> =>
    invoke('get_standard_weight', { projectId }),
  createStandardWeight: (projectId: number, data: StandardWeightData): Promise<StandardWeight> =>
    invoke('create_standard_weight', { projectId, data }),
  updateStandardWeight: (id: number, data: StandardWeightData): Promise<StandardWeight> =>
    invoke('update_standard_weight', { id, data }),

  // Standard weight helpers
  createStandardWeightFromCreateData: (data: StandardWeightCreateData): Promise<StandardWeight> =>
    tauriAPI.createStandardWeight(data.project_id, {
      weight_no: data.weight_no,
      original_mass: data.original_mass,
      current_mass: data.current_mass,
      check_result: data.check_result,
    }),
  updateStandardWeightFromUpdateData: (id: number, data: StandardWeightUpdateData): Promise<StandardWeight> =>
    tauriAPI.updateStandardWeight(id, {
      weight_no: data.weight_no,
      original_mass: data.original_mass,
      current_mass: data.current_mass,
      check_result: data.check_result,
    }),
}
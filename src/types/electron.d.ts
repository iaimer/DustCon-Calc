/// <reference types="element-plus/global" />

import type { Project, ProjectFormData } from './project'
import type { Sample, SampleRowData } from './sample'
import type { StandardWeight, StandardWeightCreateData, StandardWeightUpdateData } from './standardWeight'

interface ElectronAPI {
  // Projects
  getProjects: () => Promise<Project[]>
  getProject: (id: number) => Promise<Project | null>
  createProject: (data: ProjectFormData) => Promise<Project>
  updateProject: (id: number, data: ProjectFormData) => Promise<Project>
  deleteProject: (id: number) => Promise<boolean>

  // Samples
  getSamples: (projectId: number) => Promise<Sample[]>
  createSample: (data: Omit<SampleRowData, 'id'> & { project_id: number }) => Promise<Sample>
  updateSample: (id: number, data: Omit<SampleRowData, 'id' | 'project_id'>) => Promise<Sample>
  deleteSample: (id: number) => Promise<boolean>
  batchCreateSamples: (samples: Array<Omit<SampleRowData, 'id'> & { project_id: number }>) => Promise<Sample[]>

  // Standard weights
  getStandardWeight: (projectId: number) => Promise<StandardWeight | null>
  createStandardWeight: (data: StandardWeightCreateData) => Promise<StandardWeight>
  updateStandardWeight: (id: number, data: StandardWeightUpdateData) => Promise<StandardWeight>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
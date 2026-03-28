/// <reference types="element-plus/global" />

interface ElectronAPI {
  getProjects: () => Promise<any[]>
  getProject: (id: number) => Promise<any>
  createProject: (data: any) => Promise<any>
  updateProject: (id: number, data: any) => Promise<any>
  deleteProject: (id: number) => Promise<boolean>

  getSamples: (projectId: number) => Promise<any[]>
  createSample: (data: any) => Promise<any>
  updateSample: (id: number, data: any) => Promise<any>
  deleteSample: (id: number) => Promise<boolean>
  batchCreateSamples: (samples: any[]) => Promise<any[]>

  getStandardWeight: (projectId: number) => Promise<any>
  createStandardWeight: (data: any) => Promise<any>
  updateStandardWeight: (id: number, data: any) => Promise<any>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
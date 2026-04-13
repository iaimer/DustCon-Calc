import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', {
  // Projects
  getProjects: () => ipcRenderer.invoke('db:getProjects'),
  getProject: (id: number) => ipcRenderer.invoke('db:getProject', id),
  createProject: (data: any) => ipcRenderer.invoke('db:createProject', data),
  updateProject: (id: number, data: any) => ipcRenderer.invoke('db:updateProject', id, data),
  deleteProject: (id: number) => ipcRenderer.invoke('db:deleteProject', id),
  copyProject: (id: number) => ipcRenderer.invoke('db:copyProject', id),

  // Samples
  getSamples: (projectId: number) => ipcRenderer.invoke('db:getSamples', projectId),
  createSample: (data: any) => ipcRenderer.invoke('db:createSample', data),
  updateSample: (id: number, data: any) => ipcRenderer.invoke('db:updateSample', id, data),
  deleteSample: (id: number) => ipcRenderer.invoke('db:deleteSample', id),
  batchCreateSamples: (samples: any[]) => ipcRenderer.invoke('db:batchCreateSamples', samples),

  // Standard weights
  getStandardWeight: (projectId: number) => ipcRenderer.invoke('db:getStandardWeight', projectId),
  createStandardWeight: (data: any) => ipcRenderer.invoke('db:createStandardWeight', data),
  updateStandardWeight: (id: number, data: any) => ipcRenderer.invoke('db:updateStandardWeight', id, data)
})
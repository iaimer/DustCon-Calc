import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

// 使用require加载sql.js以避免打包问题
const initSqlJs = require('sql.js')

let mainWindow: BrowserWindow | null = null
let db: any = null
let dbPath: string = ''

// 初始化数据库
async function initDatabase() {
  // 在Electron中需要指定WASM文件路径
  const wasmBinary = readFileSync(join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm'))
  const SQL = await initSqlJs({ wasmBinary })
  dbPath = join(app.getPath('userData'), 'dust-calculator.db')

  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)

    // 数据库迁移：检查并添加字段
    const tableInfo = db.exec("PRAGMA table_info(projects)")
    if (tableInfo.length > 0) {
      const columns = tableInfo[0].values.map((row: any[]) => row[1])
      if (!columns.includes('analysis_date')) {
        db.run('ALTER TABLE projects ADD COLUMN analysis_date DATE')
      }
      // 添加采样环境字段
      if (!columns.includes('sampling_temperature')) {
        db.run('ALTER TABLE projects ADD COLUMN sampling_temperature REAL')
      }
      if (!columns.includes('sampling_air_pressure')) {
        db.run('ALTER TABLE projects ADD COLUMN sampling_air_pressure REAL')
      }
      // 添加分析环境范围字段
      if (!columns.includes('analysis_temperature_min')) {
        db.run('ALTER TABLE projects ADD COLUMN analysis_temperature_min REAL')
      }
      if (!columns.includes('analysis_temperature_max')) {
        db.run('ALTER TABLE projects ADD COLUMN analysis_temperature_max REAL')
      }
      if (!columns.includes('analysis_humidity_min')) {
        db.run('ALTER TABLE projects ADD COLUMN analysis_humidity_min REAL')
      }
      if (!columns.includes('analysis_humidity_max')) {
        db.run('ALTER TABLE projects ADD COLUMN analysis_humidity_max REAL')
      }
      saveDatabase()
    }
  } else {
    db = new SQL.Database()
    // 创建表
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employer_name TEXT NOT NULL,
        test_number TEXT,
        analysis_location TEXT,
        analysis_date DATE,
        sampling_date DATE,
        test_standard TEXT,
        sampling_temperature REAL,
        sampling_air_pressure REAL,
        analysis_temperature_min REAL,
        analysis_temperature_max REAL,
        analysis_humidity_min REAL,
        analysis_humidity_max REAL,
        instrument_name TEXT,
        instrument_no TEXT,
        analyst TEXT,
        reviewer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    db.run(`
      CREATE TABLE IF NOT EXISTS standard_weights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        weight_no TEXT,
        original_mass REAL,
        current_mass REAL,
        check_result TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `)
    db.run(`
      CREATE TABLE IF NOT EXISTS samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        sample_type TEXT,
        sample_no TEXT,
        filter_no TEXT,
        w1 REAL,
        w2_first REAL,
        w2_second REAL,
        w2_avg REAL,
        weighing_diff REAL,
        weighing_qc TEXT,
        delta_m REAL,
        delta_m_qc TEXT,
        vt REAL,
        v0 REAL,
        concentration REAL,
        rounded_value REAL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `)
    saveDatabase()
  }

  return db
}

// 保存数据库到文件
function saveDatabase() {
  if (db && dbPath) {
    const data = db.export()
    const buffer = Buffer.from(data)
    writeFileSync(dbPath, buffer)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: '粉尘浓度计算器'
  })

  // 开发模式
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC handlers - 数据库操作
ipcMain.handle('db:getProjects', async () => {
  if (!db) return []
  const result = db.exec('SELECT id, employer_name, test_number, analysis_location, analysis_date, sampling_date, test_standard, sampling_temperature, sampling_air_pressure, analysis_temperature_min, analysis_temperature_max, analysis_humidity_min, analysis_humidity_max, instrument_name, instrument_no, analyst, reviewer, created_at, updated_at FROM projects ORDER BY created_at DESC')
  if (result.length === 0) return []
  return result[0].values.map((row: any[]) => ({
    id: row[0],
    employer_name: row[1],
    test_number: row[2],
    analysis_location: row[3],
    analysis_date: row[4],
    sampling_date: row[5],
    test_standard: row[6],
    sampling_temperature: row[7],
    sampling_air_pressure: row[8],
    analysis_temperature_min: row[9],
    analysis_temperature_max: row[10],
    analysis_humidity_min: row[11],
    analysis_humidity_max: row[12],
    instrument_name: row[13],
    instrument_no: row[14],
    analyst: row[15],
    reviewer: row[16],
    created_at: row[17],
    updated_at: row[18]
  }))
})

ipcMain.handle('db:getProject', async (_, id: number) => {
  if (!db) return null
  const result = db.exec('SELECT id, employer_name, test_number, analysis_location, analysis_date, sampling_date, test_standard, sampling_temperature, sampling_air_pressure, analysis_temperature_min, analysis_temperature_max, analysis_humidity_min, analysis_humidity_max, instrument_name, instrument_no, analyst, reviewer, created_at, updated_at FROM projects WHERE id = ?', [id])
  if (result.length === 0 || result[0].values.length === 0) return null
  const row = result[0].values[0]
  return {
    id: row[0],
    employer_name: row[1],
    test_number: row[2],
    analysis_location: row[3],
    analysis_date: row[4],
    sampling_date: row[5],
    test_standard: row[6],
    sampling_temperature: row[7],
    sampling_air_pressure: row[8],
    analysis_temperature_min: row[9],
    analysis_temperature_max: row[10],
    analysis_humidity_min: row[11],
    analysis_humidity_max: row[12],
    instrument_name: row[13],
    instrument_no: row[14],
    analyst: row[15],
    reviewer: row[16],
    created_at: row[17],
    updated_at: row[18]
  }
})

ipcMain.handle('db:createProject', async (_, data: any) => {
  if (!db) return null
  try {
    db.run(`
      INSERT INTO projects (employer_name, test_number, analysis_location, analysis_date, sampling_date, test_standard, sampling_temperature, sampling_air_pressure, analysis_temperature_min, analysis_temperature_max, analysis_humidity_min, analysis_humidity_max, instrument_name, instrument_no, analyst, reviewer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.employer_name, data.test_number, data.analysis_location, data.analysis_date, data.sampling_date,
      data.test_standard, data.sampling_temperature, data.sampling_air_pressure,
      data.analysis_temperature_min, data.analysis_temperature_max,
      data.analysis_humidity_min, data.analysis_humidity_max,
      data.instrument_name, data.instrument_no, data.analyst, data.reviewer
    ])
    const result = db.exec('SELECT last_insert_rowid() as id')
    const id = result[0].values[0][0]
    saveDatabase()
    return { id, ...data }
  } catch (e) {
    console.error('创建项目失败:', e)
    throw e
  }
})

ipcMain.handle('db:updateProject', async (_, id: number, data: any) => {
  if (!db) return null
  try {
    db.run(`
      UPDATE projects SET
        employer_name = ?, test_number = ?, analysis_location = ?, analysis_date = ?, sampling_date = ?,
        test_standard = ?, sampling_temperature = ?, sampling_air_pressure = ?,
        analysis_temperature_min = ?, analysis_temperature_max = ?,
        analysis_humidity_min = ?, analysis_humidity_max = ?,
        instrument_name = ?, instrument_no = ?, analyst = ?, reviewer = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data.employer_name, data.test_number, data.analysis_location, data.analysis_date, data.sampling_date,
      data.test_standard, data.sampling_temperature, data.sampling_air_pressure,
      data.analysis_temperature_min, data.analysis_temperature_max,
      data.analysis_humidity_min, data.analysis_humidity_max,
      data.instrument_name, data.instrument_no, data.analyst, data.reviewer, id
    ])
    saveDatabase()
    return { id, ...data }
  } catch (e) {
    console.error('更新项目失败:', e)
    throw e
  }
})

ipcMain.handle('db:deleteProject', async (_, id: number) => {
  if (!db) return false
  db.run('DELETE FROM samples WHERE project_id = ?', [id])
  db.run('DELETE FROM standard_weights WHERE project_id = ?', [id])
  db.run('DELETE FROM projects WHERE id = ?', [id])
  saveDatabase()
  return true
})

// Samples
ipcMain.handle('db:getSamples', async (_, projectId: number) => {
  if (!db) return []
  const result = db.exec('SELECT * FROM samples WHERE project_id = ? ORDER BY id', [projectId])
  if (result.length === 0) return []
  return result[0].values.map((row: any[]) => ({
    id: row[0],
    project_id: row[1],
    sample_type: row[2],
    sample_no: row[3],
    filter_no: row[4],
    w1: row[5],
    w2_first: row[6],
    w2_second: row[7],
    w2_avg: row[8],
    weighing_diff: row[9],
    weighing_qc: row[10],
    delta_m: row[11],
    delta_m_qc: row[12],
    vt: row[13],
    v0: row[14],
    concentration: row[15],
    rounded_value: row[16]
  }))
})

ipcMain.handle('db:createSample', async (_, data: any) => {
  if (!db) return null
  db.run(`
    INSERT INTO samples (project_id, sample_type, sample_no, filter_no, w1, w2_first, w2_second, w2_avg, weighing_diff, weighing_qc, delta_m, delta_m_qc, vt, v0, concentration, rounded_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.project_id, data.sample_type, data.sample_no, data.filter_no,
    data.w1, data.w2_first, data.w2_second, data.w2_avg, data.weighing_diff,
    data.weighing_qc, data.delta_m, data.delta_m_qc, data.vt, data.v0,
    data.concentration, data.rounded_value
  ])
  const result = db.exec('SELECT last_insert_rowid() as id')
  const id = result[0].values[0][0]
  saveDatabase()
  return { id, ...data }
})

ipcMain.handle('db:updateSample', async (_, id: number, data: any) => {
  if (!db) return null
  db.run(`
    UPDATE samples SET
      sample_type = ?, sample_no = ?, filter_no = ?, w1 = ?, w2_first = ?, w2_second = ?,
      w2_avg = ?, weighing_diff = ?, weighing_qc = ?, delta_m = ?, delta_m_qc = ?,
      vt = ?, v0 = ?, concentration = ?, rounded_value = ?
    WHERE id = ?
  `, [
    data.sample_type, data.sample_no, data.filter_no, data.w1, data.w2_first, data.w2_second,
    data.w2_avg, data.weighing_diff, data.weighing_qc, data.delta_m, data.delta_m_qc,
    data.vt, data.v0, data.concentration, data.rounded_value, id
  ])
  saveDatabase()
  return { id, ...data }
})

ipcMain.handle('db:deleteSample', async (_, id: number) => {
  if (!db) return false
  db.run('DELETE FROM samples WHERE id = ?', [id])
  saveDatabase()
  return true
})

ipcMain.handle('db:batchCreateSamples', async (_, samples: any[]) => {
  if (!db) return []
  for (const item of samples) {
    db.run(`
      INSERT INTO samples (project_id, sample_type, sample_no, filter_no, w1, w2_first, w2_second, w2_avg, weighing_diff, weighing_qc, delta_m, delta_m_qc, vt, v0, concentration, rounded_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      item.project_id, item.sample_type, item.sample_no, item.filter_no,
      item.w1, item.w2_first, item.w2_second, item.w2_avg, item.weighing_diff,
      item.weighing_qc, item.delta_m, item.delta_m_qc, item.vt, item.v0,
      item.concentration, item.rounded_value
    ])
  }
  saveDatabase()
  return samples
})

// Standard weights
ipcMain.handle('db:getStandardWeight', async (_, projectId: number) => {
  if (!db) return null
  const result = db.exec('SELECT * FROM standard_weights WHERE project_id = ?', [projectId])
  if (result.length === 0 || result[0].values.length === 0) return null
  const row = result[0].values[0]
  return {
    id: row[0],
    project_id: row[1],
    weight_no: row[2],
    original_mass: row[3],
    current_mass: row[4],
    check_result: row[5]
  }
})

ipcMain.handle('db:createStandardWeight', async (_, data: any) => {
  if (!db) return null
  db.run(`
    INSERT INTO standard_weights (project_id, weight_no, original_mass, current_mass, check_result)
    VALUES (?, ?, ?, ?, ?)
  `, [
    data.project_id, data.weight_no, data.original_mass, data.current_mass, data.check_result
  ])
  const result = db.exec('SELECT last_insert_rowid() as id')
  const id = result[0].values[0][0]
  saveDatabase()
  return { id, ...data }
})

ipcMain.handle('db:updateStandardWeight', async (_, id: number, data: any) => {
  if (!db) return null
  db.run(`
    UPDATE standard_weights SET weight_no = ?, original_mass = ?, current_mass = ?, check_result = ?
    WHERE id = ?
  `, [data.weight_no, data.original_mass, data.current_mass, data.check_result, id])
  saveDatabase()
  return { id, ...data }
})

// 应用启动
app.whenReady().then(async () => {
  await initDatabase()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) db.close()
    app.quit()
  }
})

app.on('before-quit', () => {
  if (db) {
    saveDatabase()
    db = null
  }
})
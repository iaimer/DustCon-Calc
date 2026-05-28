use rusqlite::{Connection, Result as SqliteResult};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new() -> SqliteResult<Self> {
        let db_path = Self::get_db_path();

        // 确保数据目录存在
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path)?;

        // 启用外键约束
        conn.execute_batch("PRAGMA foreign_keys = ON;")?;

        let db = Self {
            conn: Mutex::new(conn),
        };

        db.init_tables()?;
        db.run_migrations()?;

        Ok(db)
    }

    fn get_db_path() -> PathBuf {
        // 使用与 Electron 相同的数据目录路径
        // Electron: app.getPath('userData') = ~/Library/Application Support/dust-calculator/
        let home = std::env::var("HOME").unwrap_or_else(|_| "/".to_string());
        PathBuf::from(home)
            .join("Library")
            .join("Application Support")
            .join("dust-calculator")
            .join("dust-calculator.db")
    }

    fn init_tables(&self) -> SqliteResult<()> {
        let conn = self.conn.lock().expect("数据库 Mutex 已被毒化");

        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employer_name TEXT NOT NULL,
                test_number TEXT,
                analysis_location TEXT,
                analysis_date TEXT,
                sampling_date TEXT,
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
            );

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
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS standard_weights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER UNIQUE,
                weight_no TEXT,
                original_mass REAL,
                current_mass REAL,
                check_result TEXT,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );"
        )?;

        Ok(())
    }

    fn run_migrations(&self) -> SqliteResult<()> {
        let conn = self.conn.lock().expect("数据库 Mutex 已被毒化");

        // 检查 projects 表字段（与 Electron 版保持一致）
        let columns: Vec<String> = conn
            .prepare("PRAGMA table_info(projects)")?
            .query_map([], |row| row.get::<_, String>(1))?
            .filter_map(|r| r.ok())
            .collect();

        if !columns.contains(&"analysis_date".to_string()) {
            conn.execute("ALTER TABLE projects ADD COLUMN analysis_date TEXT", [])?;
        }
        if !columns.contains(&"sampling_temperature".to_string()) {
            conn.execute("ALTER TABLE projects ADD COLUMN sampling_temperature REAL", [])?;
        }
        if !columns.contains(&"sampling_air_pressure".to_string()) {
            conn.execute("ALTER TABLE projects ADD COLUMN sampling_air_pressure REAL", [])?;
        }
        if !columns.contains(&"analysis_temperature_min".to_string()) {
            conn.execute("ALTER TABLE projects ADD COLUMN analysis_temperature_min REAL", [])?;
        }
        if !columns.contains(&"analysis_temperature_max".to_string()) {
            conn.execute("ALTER TABLE projects ADD COLUMN analysis_temperature_max REAL", [])?;
        }
        if !columns.contains(&"analysis_humidity_min".to_string()) {
            conn.execute("ALTER TABLE projects ADD COLUMN analysis_humidity_min REAL", [])?;
        }
        if !columns.contains(&"analysis_humidity_max".to_string()) {
            conn.execute("ALTER TABLE projects ADD COLUMN analysis_humidity_max REAL", [])?;
        }

        Ok(())
    }

    pub fn get_connection(&self) -> Result<std::sync::MutexGuard<'_, Connection>, String> {
        self.conn.lock().map_err(|e| format!("数据库连接异常: {}", e))
    }
}
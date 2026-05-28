use crate::db::Database;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Serialize, Deserialize)]
pub struct Project {
    id: i64,
    employer_name: String,
    test_number: Option<String>,
    analysis_location: Option<String>,
    analysis_date: Option<String>,
    sampling_date: Option<String>,
    test_standard: Option<String>,
    sampling_temperature: Option<f64>,
    sampling_air_pressure: Option<f64>,
    analysis_temperature_min: Option<f64>,
    analysis_temperature_max: Option<f64>,
    analysis_humidity_min: Option<f64>,
    analysis_humidity_max: Option<f64>,
    instrument_name: Option<String>,
    instrument_no: Option<String>,
    analyst: Option<String>,
    reviewer: Option<String>,
    created_at: Option<String>,
    updated_at: Option<String>,
}

#[derive(Deserialize)]
pub struct ProjectFormData {
    employer_name: String,
    test_number: String,
    analysis_location: String,
    analysis_date: String,
    sampling_date: String,
    test_standard: String,
    sampling_temperature: Option<f64>,
    sampling_air_pressure: Option<f64>,
    analysis_temperature_min: Option<f64>,
    analysis_temperature_max: Option<f64>,
    analysis_humidity_min: Option<f64>,
    analysis_humidity_max: Option<f64>,
    instrument_name: String,
    instrument_no: String,
    analyst: String,
    reviewer: String,
}

use crate::commands::empty_to_null;

#[command]
pub fn get_projects(db: tauri::State<'_, Database>) -> Result<Vec<Project>, String> {
    let conn = db.get_connection()?;

    let mut stmt = conn
        .prepare(
            "SELECT id, employer_name, test_number, analysis_location, analysis_date,
             sampling_date, test_standard, sampling_temperature, sampling_air_pressure,
             analysis_temperature_min, analysis_temperature_max, analysis_humidity_min,
             analysis_humidity_max, instrument_name, instrument_no, analyst, reviewer,
             created_at, updated_at FROM projects ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let projects = stmt
        .query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                employer_name: row.get(1)?,
                test_number: row.get(2)?,
                analysis_location: row.get(3)?,
                analysis_date: row.get(4)?,
                sampling_date: row.get(5)?,
                test_standard: row.get(6)?,
                sampling_temperature: row.get(7)?,
                sampling_air_pressure: row.get(8)?,
                analysis_temperature_min: row.get(9)?,
                analysis_temperature_max: row.get(10)?,
                analysis_humidity_min: row.get(11)?,
                analysis_humidity_max: row.get(12)?,
                instrument_name: row.get(13)?,
                instrument_no: row.get(14)?,
                analyst: row.get(15)?,
                reviewer: row.get(16)?,
                created_at: row.get(17)?,
                updated_at: row.get(18)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(projects)
}

#[command]
pub fn get_project(db: tauri::State<'_, Database>, id: i64) -> Result<Option<Project>, String> {
    let conn = db.get_connection()?;

    let mut stmt = conn
        .prepare(
            "SELECT id, employer_name, test_number, analysis_location, analysis_date,
             sampling_date, test_standard, sampling_temperature, sampling_air_pressure,
             analysis_temperature_min, analysis_temperature_max, analysis_humidity_min,
             analysis_humidity_max, instrument_name, instrument_no, analyst, reviewer,
             created_at, updated_at FROM projects WHERE id = ?",
        )
        .map_err(|e| e.to_string())?;

    let project = stmt
        .query_row([id], |row| {
            Ok(Project {
                id: row.get(0)?,
                employer_name: row.get(1)?,
                test_number: row.get(2)?,
                analysis_location: row.get(3)?,
                analysis_date: row.get(4)?,
                sampling_date: row.get(5)?,
                test_standard: row.get(6)?,
                sampling_temperature: row.get(7)?,
                sampling_air_pressure: row.get(8)?,
                analysis_temperature_min: row.get(9)?,
                analysis_temperature_max: row.get(10)?,
                analysis_humidity_min: row.get(11)?,
                analysis_humidity_max: row.get(12)?,
                instrument_name: row.get(13)?,
                instrument_no: row.get(14)?,
                analyst: row.get(15)?,
                reviewer: row.get(16)?,
                created_at: row.get(17)?,
                updated_at: row.get(18)?,
            })
        })
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(project)
}

#[command]
pub fn create_project(db: tauri::State<'_, Database>, data: ProjectFormData) -> Result<Project, String> {
    let conn = db.get_connection()?;

    conn.execute(
        "INSERT INTO projects (
            employer_name, test_number, analysis_location, analysis_date, sampling_date,
            test_standard, sampling_temperature, sampling_air_pressure,
            analysis_temperature_min, analysis_temperature_max,
            analysis_humidity_min, analysis_humidity_max,
            instrument_name, instrument_no, analyst, reviewer
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
        rusqlite::params![
            data.employer_name.clone(),
            empty_to_null(data.test_number.clone()),
            empty_to_null(data.analysis_location.clone()),
            empty_to_null(data.analysis_date.clone()),
            empty_to_null(data.sampling_date.clone()),
            empty_to_null(data.test_standard.clone()),
            data.sampling_temperature,
            data.sampling_air_pressure,
            data.analysis_temperature_min,
            data.analysis_temperature_max,
            data.analysis_humidity_min,
            data.analysis_humidity_max,
            empty_to_null(data.instrument_name.clone()),
            empty_to_null(data.instrument_no.clone()),
            empty_to_null(data.analyst.clone()),
            empty_to_null(data.reviewer.clone()),
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(Project {
        id,
        employer_name: data.employer_name,
        test_number: empty_to_null(data.test_number),
        analysis_location: empty_to_null(data.analysis_location),
        analysis_date: empty_to_null(data.analysis_date),
        sampling_date: empty_to_null(data.sampling_date),
        test_standard: empty_to_null(data.test_standard),
        sampling_temperature: data.sampling_temperature,
        sampling_air_pressure: data.sampling_air_pressure,
        analysis_temperature_min: data.analysis_temperature_min,
        analysis_temperature_max: data.analysis_temperature_max,
        analysis_humidity_min: data.analysis_humidity_min,
        analysis_humidity_max: data.analysis_humidity_max,
        instrument_name: empty_to_null(data.instrument_name),
        instrument_no: empty_to_null(data.instrument_no),
        analyst: empty_to_null(data.analyst),
        reviewer: empty_to_null(data.reviewer),
        created_at: None,
        updated_at: None,
    })
}

#[command]
pub fn update_project(db: tauri::State<'_, Database>, id: i64, data: ProjectFormData) -> Result<Project, String> {
    let conn = db.get_connection()?;

    conn.execute(
        "UPDATE projects SET
            employer_name = ?1, test_number = ?2, analysis_location = ?3,
            analysis_date = ?4, sampling_date = ?5, test_standard = ?6,
            sampling_temperature = ?7, sampling_air_pressure = ?8,
            analysis_temperature_min = ?9, analysis_temperature_max = ?10,
            analysis_humidity_min = ?11, analysis_humidity_max = ?12,
            instrument_name = ?13, instrument_no = ?14, analyst = ?15,
            reviewer = ?16, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?17",
        rusqlite::params![
            data.employer_name.clone(),
            empty_to_null(data.test_number.clone()),
            empty_to_null(data.analysis_location.clone()),
            empty_to_null(data.analysis_date.clone()),
            empty_to_null(data.sampling_date.clone()),
            empty_to_null(data.test_standard.clone()),
            data.sampling_temperature,
            data.sampling_air_pressure,
            data.analysis_temperature_min,
            data.analysis_temperature_max,
            data.analysis_humidity_min,
            data.analysis_humidity_max,
            empty_to_null(data.instrument_name.clone()),
            empty_to_null(data.instrument_no.clone()),
            empty_to_null(data.analyst.clone()),
            empty_to_null(data.reviewer.clone()),
            id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(Project {
        id,
        employer_name: data.employer_name,
        test_number: empty_to_null(data.test_number),
        analysis_location: empty_to_null(data.analysis_location),
        analysis_date: empty_to_null(data.analysis_date),
        sampling_date: empty_to_null(data.sampling_date),
        test_standard: empty_to_null(data.test_standard),
        sampling_temperature: data.sampling_temperature,
        sampling_air_pressure: data.sampling_air_pressure,
        analysis_temperature_min: data.analysis_temperature_min,
        analysis_temperature_max: data.analysis_temperature_max,
        analysis_humidity_min: data.analysis_humidity_min,
        analysis_humidity_max: data.analysis_humidity_max,
        instrument_name: empty_to_null(data.instrument_name),
        instrument_no: empty_to_null(data.instrument_no),
        analyst: empty_to_null(data.analyst),
        reviewer: empty_to_null(data.reviewer),
        created_at: None,
        updated_at: None,
    })
}

#[command]
pub fn delete_project(db: tauri::State<'_, Database>, id: i64) -> Result<bool, String> {
    let conn = db.get_connection()?;

    // 由于启用了外键约束，删除项目会自动删除关联的 samples 和 standard_weights
    conn.execute("DELETE FROM projects WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;

    Ok(true)
}

#[command]
pub fn copy_project(db: tauri::State<'_, Database>, id: i64) -> Result<serde_json::Value, String> {
    let conn = db.get_connection()?;

    // 获取原项目 - 直接查询而不是调用 get_project
    let project = conn
        .query_row(
            "SELECT id, employer_name, test_number, analysis_location, analysis_date,
             sampling_date, test_standard, sampling_temperature, sampling_air_pressure,
             analysis_temperature_min, analysis_temperature_max, analysis_humidity_min,
             analysis_humidity_max, instrument_name, instrument_no, analyst, reviewer,
             created_at, updated_at FROM projects WHERE id = ?",
            [id],
            |row| {
                Ok(Project {
                    id: row.get(0)?,
                    employer_name: row.get(1)?,
                    test_number: row.get(2)?,
                    analysis_location: row.get(3)?,
                    analysis_date: row.get(4)?,
                    sampling_date: row.get(5)?,
                    test_standard: row.get(6)?,
                    sampling_temperature: row.get(7)?,
                    sampling_air_pressure: row.get(8)?,
                    analysis_temperature_min: row.get(9)?,
                    analysis_temperature_max: row.get(10)?,
                    analysis_humidity_min: row.get(11)?,
                    analysis_humidity_max: row.get(12)?,
                    instrument_name: row.get(13)?,
                    instrument_no: row.get(14)?,
                    analyst: row.get(15)?,
                    reviewer: row.get(16)?,
                    created_at: row.get(17)?,
                    updated_at: row.get(18)?,
                })
            },
        )
        .optional()
        .map_err(|e| e.to_string())?
        .ok_or("项目不存在")?;

    // 创建新项目
    let new_name = format!("{}（副本）", project.employer_name);

    conn.execute(
        "INSERT INTO projects (
            employer_name, test_number, analysis_location, analysis_date, sampling_date,
            test_standard, sampling_temperature, sampling_air_pressure,
            analysis_temperature_min, analysis_temperature_max,
            analysis_humidity_min, analysis_humidity_max,
            instrument_name, instrument_no, analyst, reviewer
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
        rusqlite::params![
            new_name,
            project.test_number,
            project.analysis_location,
            project.analysis_date,
            project.sampling_date,
            project.test_standard,
            project.sampling_temperature,
            project.sampling_air_pressure,
            project.analysis_temperature_min,
            project.analysis_temperature_max,
            project.analysis_humidity_min,
            project.analysis_humidity_max,
            project.instrument_name,
            project.instrument_no,
            project.analyst,
            project.reviewer,
        ],
    )
    .map_err(|e| e.to_string())?;

    let new_id = conn.last_insert_rowid();

    // 复制标准砝码
    let weight = conn
        .query_row(
            "SELECT weight_no, original_mass, current_mass, check_result FROM standard_weights WHERE project_id = ?",
            [id],
            |row| {
                Ok(StandardWeightData {
                    weight_no: row.get(0)?,
                    original_mass: row.get(1)?,
                    current_mass: row.get(2)?,
                    check_result: row.get(3)?,
                })
            },
        )
        .optional()
        .map_err(|e: rusqlite::Error| e.to_string())?;

    if let Some(weight) = weight {
        conn.execute(
            "INSERT INTO standard_weights (project_id, weight_no, original_mass, current_mass, check_result)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![new_id, weight.weight_no, weight.original_mass, weight.current_mass, weight.check_result],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(serde_json::json!({ "id": new_id }))
}

// 用于 copy_project 的内部结构
#[derive(Deserialize)]
struct StandardWeightData {
    weight_no: Option<String>,
    original_mass: Option<f64>,
    current_mass: Option<f64>,
    check_result: Option<String>,
}
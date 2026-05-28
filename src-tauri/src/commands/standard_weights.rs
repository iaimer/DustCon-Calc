use crate::db::Database;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Serialize, Deserialize)]
pub struct StandardWeight {
    id: i64,
    project_id: i64,
    weight_no: Option<String>,
    original_mass: Option<f64>,
    current_mass: Option<f64>,
    check_result: Option<String>,
}

#[derive(Deserialize)]
pub struct StandardWeightData {
    weight_no: String,
    original_mass: Option<f64>,
    current_mass: Option<f64>,
    check_result: String,
}

use crate::commands::empty_to_null;

#[command]
pub fn get_standard_weight(db: tauri::State<'_, Database>, project_id: i64) -> Result<Option<StandardWeight>, String> {
    let conn = db.get_connection()?;

    let result = conn
        .query_row(
            "SELECT id, project_id, weight_no, original_mass, current_mass, check_result
             FROM standard_weights WHERE project_id = ?",
            [project_id],
            |row| {
                Ok(StandardWeight {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    weight_no: row.get(2)?,
                    original_mass: row.get(3)?,
                    current_mass: row.get(4)?,
                    check_result: row.get(5)?,
                })
            },
        )
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(result)
}

#[command]
pub fn create_standard_weight(db: tauri::State<'_, Database>, project_id: i64, data: StandardWeightData) -> Result<StandardWeight, String> {
    let conn = db.get_connection()?;

    let weight_no = empty_to_null(data.weight_no.clone());
    let check_result = empty_to_null(data.check_result.clone());

    conn.execute(
        "INSERT INTO standard_weights (project_id, weight_no, original_mass, current_mass, check_result)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![
            project_id,
            weight_no.clone(),
            data.original_mass,
            data.current_mass,
            check_result.clone(),
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(StandardWeight {
        id,
        project_id,
        weight_no,
        original_mass: data.original_mass,
        current_mass: data.current_mass,
        check_result,
    })
}

#[command]
pub fn update_standard_weight(db: tauri::State<'_, Database>, id: i64, data: StandardWeightData) -> Result<StandardWeight, String> {
    let conn = db.get_connection()?;

    // 获取 project_id
    let project_id: i64 = conn
        .query_row("SELECT project_id FROM standard_weights WHERE id = ?", [id], |row| row.get(0))
        .optional()
        .map_err(|e| e.to_string())?
        .ok_or("标准砝码数据未找到")?;

    let weight_no = empty_to_null(data.weight_no.clone());
    let check_result = empty_to_null(data.check_result.clone());

    conn.execute(
        "UPDATE standard_weights SET weight_no = ?1, original_mass = ?2, current_mass = ?3, check_result = ?4
         WHERE id = ?5",
        rusqlite::params![
            weight_no.clone(),
            data.original_mass,
            data.current_mass,
            check_result.clone(),
            id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(StandardWeight {
        id,
        project_id,
        weight_no,
        original_mass: data.original_mass,
        current_mass: data.current_mass,
        check_result,
    })
}
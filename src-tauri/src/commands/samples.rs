use crate::db::Database;
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Serialize, Deserialize)]
pub struct Sample {
    id: i64,
    project_id: i64,
    sample_type: Option<String>,
    sample_no: Option<String>,
    filter_no: Option<String>,
    w1: Option<f64>,
    w2_first: Option<f64>,
    w2_second: Option<f64>,
    w2_avg: Option<f64>,
    weighing_diff: Option<f64>,
    weighing_qc: Option<String>,
    delta_m: Option<f64>,
    delta_m_qc: Option<String>,
    vt: Option<f64>,
    v0: Option<f64>,
    concentration: Option<f64>,
    rounded_value: Option<f64>,
}

#[derive(Deserialize)]
pub struct SampleData {
    sample_type: String,
    sample_no: String,
    filter_no: String,
    w1: Option<f64>,
    w2_first: Option<f64>,
    w2_second: Option<f64>,
    w2_avg: Option<f64>,
    weighing_diff: Option<f64>,
    weighing_qc: String,
    delta_m: Option<f64>,
    delta_m_qc: String,
    vt: f64,
    v0: f64,
    concentration: Option<f64>,
    rounded_value: Option<f64>,
}

#[derive(Deserialize)]
pub struct SampleWithProjectId {
    project_id: i64,
    data: SampleData,
}

fn empty_to_null(s: String) -> Option<String> {
    if s.is_empty() { None } else { Some(s) }
}

fn get_sample_by_id(conn: &rusqlite::Connection, id: i64) -> Result<Sample, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, project_id, sample_type, sample_no, filter_no, w1, w2_first,
             w2_second, w2_avg, weighing_diff, weighing_qc, delta_m, delta_m_qc,
             vt, v0, concentration, rounded_value FROM samples WHERE id = ?",
        )
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
        Ok(Sample {
            id: row.get(0)?,
            project_id: row.get(1)?,
            sample_type: row.get(2)?,
            sample_no: row.get(3)?,
            filter_no: row.get(4)?,
            w1: row.get(5)?,
            w2_first: row.get(6)?,
            w2_second: row.get(7)?,
            w2_avg: row.get(8)?,
            weighing_diff: row.get(9)?,
            weighing_qc: row.get(10)?,
            delta_m: row.get(11)?,
            delta_m_qc: row.get(12)?,
            vt: row.get(13)?,
            v0: row.get(14)?,
            concentration: row.get(15)?,
            rounded_value: row.get(16)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[command]
pub fn get_samples(db: tauri::State<'_, Database>, project_id: i64) -> Result<Vec<Sample>, String> {
    let conn = db.get_connection();

    let mut stmt = conn
        .prepare(
            "SELECT id, project_id, sample_type, sample_no, filter_no, w1, w2_first,
             w2_second, w2_avg, weighing_diff, weighing_qc, delta_m, delta_m_qc,
             vt, v0, concentration, rounded_value FROM samples WHERE project_id = ? ORDER BY id",
        )
        .map_err(|e| e.to_string())?;

    let samples = stmt
        .query_map([project_id], |row| {
            Ok(Sample {
                id: row.get(0)?,
                project_id: row.get(1)?,
                sample_type: row.get(2)?,
                sample_no: row.get(3)?,
                filter_no: row.get(4)?,
                w1: row.get(5)?,
                w2_first: row.get(6)?,
                w2_second: row.get(7)?,
                w2_avg: row.get(8)?,
                weighing_diff: row.get(9)?,
                weighing_qc: row.get(10)?,
                delta_m: row.get(11)?,
                delta_m_qc: row.get(12)?,
                vt: row.get(13)?,
                v0: row.get(14)?,
                concentration: row.get(15)?,
                rounded_value: row.get(16)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(samples)
}

#[command]
pub fn create_sample(db: tauri::State<'_, Database>, project_id: i64, data: SampleData) -> Result<Sample, String> {
    let conn = db.get_connection();

    conn.execute(
        "INSERT INTO samples (
            project_id, sample_type, sample_no, filter_no, w1, w2_first, w2_second,
            w2_avg, weighing_diff, weighing_qc, delta_m, delta_m_qc, vt, v0,
            concentration, rounded_value
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
        rusqlite::params![
            project_id,
            empty_to_null(data.sample_type),
            empty_to_null(data.sample_no),
            empty_to_null(data.filter_no),
            data.w1,
            data.w2_first,
            data.w2_second,
            data.w2_avg,
            data.weighing_diff,
            empty_to_null(data.weighing_qc),
            data.delta_m,
            empty_to_null(data.delta_m_qc),
            data.vt,
            data.v0,
            data.concentration,
            data.rounded_value,
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    get_sample_by_id(&conn, id)
}

#[command]
pub fn update_sample(db: tauri::State<'_, Database>, id: i64, data: SampleData) -> Result<Sample, String> {
    let conn = db.get_connection();

    conn.execute(
        "UPDATE samples SET
            sample_type = ?1, sample_no = ?2, filter_no = ?3, w1 = ?4,
            w2_first = ?5, w2_second = ?6, w2_avg = ?7, weighing_diff = ?8,
            weighing_qc = ?9, delta_m = ?10, delta_m_qc = ?11, vt = ?12,
            v0 = ?13, concentration = ?14, rounded_value = ?15
        WHERE id = ?16",
        rusqlite::params![
            empty_to_null(data.sample_type),
            empty_to_null(data.sample_no),
            empty_to_null(data.filter_no),
            data.w1,
            data.w2_first,
            data.w2_second,
            data.w2_avg,
            data.weighing_diff,
            empty_to_null(data.weighing_qc),
            data.delta_m,
            empty_to_null(data.delta_m_qc),
            data.vt,
            data.v0,
            data.concentration,
            data.rounded_value,
            id,
        ],
    )
    .map_err(|e| e.to_string())?;

    get_sample_by_id(&conn, id)
}

#[command]
pub fn delete_sample(db: tauri::State<'_, Database>, id: i64) -> Result<bool, String> {
    let conn = db.get_connection();
    conn.execute("DELETE FROM samples WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub fn batch_create_samples(db: tauri::State<'_, Database>, samples: Vec<SampleWithProjectId>) -> Result<Vec<Sample>, String> {
    let conn = db.get_connection();
    let mut created = Vec::new();

    for item in samples {
        conn.execute(
            "INSERT INTO samples (
                project_id, sample_type, sample_no, filter_no, w1, w2_first, w2_second,
                w2_avg, weighing_diff, weighing_qc, delta_m, delta_m_qc, vt, v0,
                concentration, rounded_value
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
            rusqlite::params![
                item.project_id,
                empty_to_null(item.data.sample_type),
                empty_to_null(item.data.sample_no),
                empty_to_null(item.data.filter_no),
                item.data.w1,
                item.data.w2_first,
                item.data.w2_second,
                item.data.w2_avg,
                item.data.weighing_diff,
                empty_to_null(item.data.weighing_qc),
                item.data.delta_m,
                empty_to_null(item.data.delta_m_qc),
                item.data.vt,
                item.data.v0,
                item.data.concentration,
                item.data.rounded_value,
            ],
        )
        .map_err(|e| e.to_string())?;

        let id = conn.last_insert_rowid();
        created.push(get_sample_by_id(&conn, id)?);
    }

    Ok(created)
}
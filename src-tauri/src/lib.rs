mod db;
mod commands;

use db::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Database::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .manage(db)
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::projects::get_projects,
            commands::projects::get_project,
            commands::projects::create_project,
            commands::projects::update_project,
            commands::projects::delete_project,
            commands::projects::copy_project,
            commands::samples::get_samples,
            commands::samples::create_sample,
            commands::samples::update_sample,
            commands::samples::delete_sample,
            commands::samples::batch_create_samples,
            commands::standard_weights::get_standard_weight,
            commands::standard_weights::create_standard_weight,
            commands::standard_weights::update_standard_weight,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod iracing;

use tauri::{AppHandle, Manager};

#[tauri::command]
fn set_clickthrough(app: AppHandle, ignore: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window
            .set_ignore_cursor_events(ignore)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_connection_status() -> Result<serde_json::Value, String> {
    let mut reader = iracing::memory::SharedMemoryReader::new();
    let connected = reader.connect();
    Ok(serde_json::json!({
        "connected": connected,
        "mode": if connected { "live_iracing" } else { "mock_pipeline" }
    }))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            set_clickthrough,
            get_connection_status
        ])
        .setup(|app| {
            // Ponytail: configure transparent overlay window defaults
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_always_on_top(true);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running free-iracing-overlay");
}

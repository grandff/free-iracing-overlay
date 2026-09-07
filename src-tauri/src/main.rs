// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod iracing;

use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

fn get_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app.path().app_config_dir().map_err(|e| e.to_string())?;
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    path.push("config.json");
    Ok(path)
}

// ponytail: OS native persistent file storage (config.json) without heavy SQLite dependencies
#[tauri::command]
fn save_config(app: AppHandle, config_json: String) -> Result<(), String> {
    let path = get_config_path(&app)?;
    fs::write(path, config_json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_config(app: AppHandle) -> Result<Option<String>, String> {
    let path = get_config_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    Ok(Some(content))
}

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
    // ponytail: OS-level hotkey, not a DOM keydown. iRacing owns keyboard focus while
    // driving, so a window listener never fires in game. Registered here instead.
    let alt_j = Shortcut::new(Some(Modifiers::ALT), Code::KeyJ);
    let alt_j_handler = alt_j.clone();

    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if shortcut == &alt_j_handler && event.state() == ShortcutState::Pressed {
                        let _ = app.emit("toggle-edit-mode", ());
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            save_config,
            load_config,
            set_clickthrough,
            get_connection_status
        ])
        .setup(move |app| {
            // Ponytail: configure transparent overlay window defaults
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_always_on_top(true);
                // Start in driving mode: clicks pass through to the game.
                let _ = window.set_ignore_cursor_events(true);
            }
            app.global_shortcut().register(alt_j.clone())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running free-iracing-overlay");
}

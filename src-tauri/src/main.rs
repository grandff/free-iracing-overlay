// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod iracing;

use std::fs;
use std::path::PathBuf;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

/// Two windows, deliberately:
/// - `main`    transparent click-through HUD, no taskbar entry, shown only while iRacing runs
/// - `control` ordinary decorated window the user alt-tabs to and configures from
///
/// They must stay separate: if settings lived inside the HUD, hiding the HUD when
/// iRacing is closed would also hide the only way to change settings.
const OVERLAY: &str = "main";
const CONTROL: &str = "control";

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
    if let Some(window) = app.get_webview_window(OVERLAY) {
        window
            .set_ignore_cursor_events(ignore)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn show_control_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(CONTROL) {
        window.show().map_err(|e| e.to_string())?;
        window.unminimize().ok();
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn set_overlay_visible(app: AppHandle, visible: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(OVERLAY) {
        if visible {
            window.show().map_err(|e| e.to_string())?;
        } else {
            window.hide().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
fn get_connection_status() -> Result<serde_json::Value, String> {
    let mut reader = iracing::memory::SharedMemoryReader::new();
    let connected = reader.connect();
    Ok(serde_json::json!({
        "connected": connected,
        "mode": if connected { "live_iracing" } else { "waiting" }
    }))
}

/// Polls the iRacing shared-memory map and emits `iracing-connection` on change.
/// 1Hz: opening a file mapping is cheap, and a sim launch is not a sub-second event.
/// ponytail: poll, not an event subscription — irsdk offers no connect notification.
fn spawn_connection_watcher(app: AppHandle) {
    std::thread::spawn(move || {
        let mut last: Option<bool> = None; // None = nothing emitted yet
        loop {
            let mut reader = iracing::memory::SharedMemoryReader::new();
            let connected = reader.connect();
            if last != Some(connected) {
                last = Some(connected);
                let _ = app.emit("iracing-connection", connected);
            }
            std::thread::sleep(Duration::from_secs(1));
        }
    });
}

fn main() {
    // ponytail: OS-level hotkey, not a DOM keydown. iRacing owns keyboard focus while
    // driving, so a window listener never fires in game. Registered here instead.
    let alt_j_handler = Shortcut::new(Some(Modifiers::ALT), Code::KeyJ);

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
            set_overlay_visible,
            show_control_window,
            get_connection_status
        ])
        .on_window_event(|window, event| {
            // Closing the control window quits the app; closing the HUD just hides it.
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == OVERLAY {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .setup(|app| {
            if let Some(overlay) = app.get_webview_window(OVERLAY) {
                let _ = overlay.set_always_on_top(true);
                // Driving mode by default: clicks pass through to the game.
                let _ = overlay.set_ignore_cursor_events(true);
            }
            app.global_shortcut()
                .register(Shortcut::new(Some(Modifiers::ALT), Code::KeyJ))?;
            spawn_connection_watcher(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running free-iracing-overlay");
}

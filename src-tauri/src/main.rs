// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod iracing;

use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine as _;
use std::fs;
use std::io::Read;
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

/// Where debug logs go. An empty `dir` means the app's own log directory, which is
/// the only location we can guarantee is writable without asking the user.
///
/// `create` is false when we are only resolving a path to show it: the settings
/// field re-resolves on every keystroke, and creating as we go would litter the
/// disk with `C:`, `C:\\U`, `C:\\Us`... on the way to the path the user meant.
fn resolve_log_dir(app: &AppHandle, dir: &str, create: bool) -> Result<PathBuf, String> {
    let base = if dir.trim().is_empty() {
        app.path().app_log_dir().map_err(|e| e.to_string())?
    } else {
        PathBuf::from(dir.trim())
    };
    if create && !base.exists() {
        fs::create_dir_all(&base).map_err(|e| e.to_string())?;
    }
    Ok(base)
}

/// The absolute path a given setting resolves to, so the UI can show the user
/// exactly where to look instead of making them guess.
#[tauri::command]
fn debug_log_path(app: AppHandle, dir: String, file_name: String) -> Result<String, String> {
    let mut path = resolve_log_dir(&app, &dir, false)?;
    path.push(sanitize_file_name(&file_name));
    Ok(path.to_string_lossy().into_owned())
}

/// A log file name may not escape the chosen directory. The renderer supplies it,
/// so it is untrusted input even though the user is the one typing.
fn sanitize_file_name(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
        .collect();
    if cleaned.is_empty() || cleaned.starts_with('.') {
        "telemetry-debug.csv".to_string()
    } else {
        cleaned
    }
}

/// Appends already-formatted lines to the debug log.
///
/// Batched on purpose: the renderer samples telemetry many times a second and one
/// IPC round trip per row would cost more than the thing being measured.
#[tauri::command]
fn append_debug_log(
    app: AppHandle,
    dir: String,
    file_name: String,
    header: String,
    lines: String,
) -> Result<String, String> {
    use std::io::Write;

    let mut path = resolve_log_dir(&app, &dir, true)?;
    path.push(sanitize_file_name(&file_name));

    let is_new = !path.exists();
    let mut f = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;
    if is_new && !header.is_empty() {
        writeln!(f, "{header}").map_err(|e| e.to_string())?;
    }
    f.write_all(lines.as_bytes()).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().into_owned())
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

/// Fetches one theme typeface over HTTPS on behalf of the webview.
///
/// The webview cannot do this itself: its CSP allows `connect-src 'self'` only,
/// so a compromised renderer has no path to an arbitrary host. Routing the GET
/// through here keeps that property while still letting the user install the
/// official face of the theme they picked.
///
/// This deliberately does NOT verify the digest or touch the filesystem:
/// - the caller (`src/services/fonts.ts`) checks the bytes against a pinned
///   SHA-256 before registering them, so tampered bytes are rejected there;
/// - nothing is written under `public/`, which `vite build` copies wholesale
///   into the release bundle (AGENTS.md S10.3-11 forbids shipping the font).
///
/// `allow_url` is the supply-chain guard: only hosts we pin are reachable, so a
/// compromised renderer cannot turn this into a general-purpose fetch primitive.
fn allow_url(url: &str) -> bool {
    url.starts_with("https://raw.githubusercontent.com/Thomson-19/F1-Fonts/")
        && !url.contains("..")
}

#[tauri::command]
fn fetch_theme_font(url: String) -> Result<String, String> {
    if !allow_url(&url) {
        return Err(format!("refused: {url} is not a pinned font source"));
    }

    let resp = ureq::get(&url)
        .timeout(Duration::from_secs(20))
        .call()
        .map_err(|e| e.to_string())?;

    let mut bytes: Vec<u8> = Vec::new();
    resp.into_reader()
        // A display woff2 is ~27KB; 4MB is a generous ceiling that still refuses
        // to buffer an unbounded response into memory.
        .take(4 * 1024 * 1024)
        .read_to_end(&mut bytes)
        .map_err(|e| e.to_string())?;

    if bytes.is_empty() {
        return Err("empty response".into());
    }

    Ok(BASE64.encode(bytes))
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
            get_connection_status,
            fetch_theme_font,
            debug_log_path,
            append_debug_log
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

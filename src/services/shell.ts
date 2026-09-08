// Desktop shell integration: which window are we, and how do we talk to the other one.
//
// Under Tauri there are two windows (see src-tauri/src/main.rs):
//   "control" — ordinary decorated program window, always running, owns settings
//   "main"    — transparent click-through HUD, shown only while iRacing is running
//
// In a plain browser (dev preview) there is one window and no iRacing, so we run a
// combined view driven by the mock telemetry engine.
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export type WindowRole = "control" | "overlay" | "browser";

function readLabel(): string | null {
  if (!isTauri()) return null;
  try {
    // Tauri v2 exposes the current window's label synchronously on the internals object.
    return (window as any).__TAURI_INTERNALS__?.metadata?.currentWindow?.label ?? null;
  } catch {
    return null;
  }
}

// `?window=control` previews the program window in a plain browser, so the two-window
// layout can be checked without a full Tauri build.
function devRoleOverride(): WindowRole | null {
  try {
    const v = new URLSearchParams(location.search).get("window");
    return v === "control" || v === "overlay" ? v : null;
  } catch {
    return null;
  }
}

export const windowRole: WindowRole =
  devRoleOverride() ??
  (!isTauri() ? "browser" : readLabel() === "control" ? "control" : "overlay");

/** True when there is no Tauri shell — one window, mock telemetry, no OS window control. */
export const isBrowserPreview = !isTauri();

/** Bring the program window to the front (from the HUD's settings button). */
export async function openControlWindow() {
  if (!isTauri()) return;
  await invoke("show_control_window").catch(() => {});
}

/** Show or hide the HUD window itself — not CSS, the actual OS window. */
export async function setOverlayVisible(visible: boolean) {
  if (!isTauri()) return;
  await invoke("set_overlay_visible", { visible }).catch(() => {});
}

/** Driving mode lets clicks reach the game; edit mode must capture them. */
export async function setClickthrough(ignore: boolean) {
  if (!isTauri()) return;
  await invoke("set_clickthrough", { ignore }).catch(() => {});
}

/**
 * Subscribe to iRacing connection changes. Rust polls the shared-memory map at 1Hz
 * and emits only on change; we also pull once so a late subscriber is never stale.
 * Returns an unsubscribe function.
 */
export async function watchConnection(onChange: (connected: boolean) => void) {
  if (isBrowserPreview) {
    // Browser preview: the mock engine stands in for a running sim.
    onChange(true);
    return () => {};
  }
  const un = await listen<boolean>("iracing-connection", (e) => onChange(e.payload));
  try {
    const status = await invoke<{ connected: boolean }>("get_connection_status");
    onChange(!!status?.connected);
  } catch {
    onChange(false);
  }
  return un;
}

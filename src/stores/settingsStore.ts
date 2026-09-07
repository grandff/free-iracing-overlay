import { createStore } from "solid-js/store";
import { invoke, isTauri } from "@tauri-apps/api/core";

export type ThemeType = "f1" | "wec" | "wrc" | "indycar" | "gt";
export type TripleMonitorMode = "center-clamp" | "full-span";

export interface WidgetTransform {
  x: number;
  y: number;
  scale: number;
  visible: boolean;
}

export type WidgetKey =
  | "leaderboard"
  | "relative"
  | "lapDelta"
  | "revengeTracker"
  | "spotterLeft"
  | "spotterRight"
  | "fuelCalculator"
  | "tireAnalysis"
  | "incidentHazard"
  | "weather"
  | "multiclassRadar"
  | "trackMap"
  | "telemetryHub";

export interface SettingsState {
  hasCompletedSetup: boolean; // false = initial setup wizard required
  setupStep: 1 | 2; // 1 = Theme Selection, 2 = Overlay Preview & Layout
  theme: ThemeType; // currently only 'f1' active, others 'coming soon'
  isEditMode: boolean; // Alt + J toggle
  tripleMonitorMode: TripleMonitorMode;
  storageTarget: "disk-file" | "local-storage";
  widgets: Record<WidgetKey, WidgetTransform>;
}

const STORAGE_KEY = "iracing_overlay_config_v1";

const defaultSettings: SettingsState = {
  hasCompletedSetup: false,
  setupStep: 1,
  theme: "f1",
  isEditMode: false,
  tripleMonitorMode: "center-clamp",
  storageTarget: "local-storage",
  widgets: {
    leaderboard: { x: 0, y: 0, scale: 1.0, visible: true },
    relative: { x: 0, y: 0, scale: 1.0, visible: true },
    lapDelta: { x: 0, y: 0, scale: 1.0, visible: true },
    revengeTracker: { x: 0, y: 0, scale: 1.0, visible: true },
    spotterLeft: { x: 0, y: 0, scale: 1.0, visible: true },
    spotterRight: { x: 0, y: 0, scale: 1.0, visible: true },
    fuelCalculator: { x: 0, y: 0, scale: 1.0, visible: true },
    tireAnalysis: { x: 0, y: 0, scale: 1.0, visible: true },
    incidentHazard: { x: 0, y: 0, scale: 1.0, visible: true },
    weather: { x: 0, y: 0, scale: 1.0, visible: true },
    multiclassRadar: { x: 0, y: 0, scale: 1.0, visible: true },
    trackMap: { x: 0, y: 0, scale: 1.0, visible: true },
    telemetryHub: { x: 0, y: 0, scale: 1.0, visible: true },
  },
};

function loadInitialSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed,
        widgets: {
          ...defaultSettings.widgets,
          ...(parsed.widgets || {}),
          // Ensure spotterLeft and spotterRight are populated
          spotterLeft: parsed.widgets?.spotterLeft || defaultSettings.widgets.spotterLeft,
          spotterRight: parsed.widgets?.spotterRight || defaultSettings.widgets.spotterRight,
        },
        theme: "f1",
      };
    }
  } catch (e) {
    console.error("Failed to load initial settings:", e);
  }
  return defaultSettings;
}

const [settings, setSettings] = createStore<SettingsState>(loadInitialSettings());

// Asynchronously hydrate from Tauri native disk config.json if available
export async function hydrateFromDiskConfig() {
  if (!isTauri()) return;
  try {
    const diskContent = await invoke<string | null>("load_config");
    if (diskContent) {
      const parsed = JSON.parse(diskContent);
      setSettings({
        ...defaultSettings,
        ...parsed,
        storageTarget: "disk-file",
        theme: "f1",
        widgets: {
          ...defaultSettings.widgets,
          ...(parsed.widgets || {}),
          spotterLeft: parsed.widgets?.spotterLeft || defaultSettings.widgets.spotterLeft,
          spotterRight: parsed.widgets?.spotterRight || defaultSettings.widgets.spotterRight,
        },
      });
      console.log("Loaded configuration from disk file (config.json)");
    }
  } catch (e) {
    console.warn("Failed to load config from native disk file, keeping memory state:", e);
  }
}

export function updateSettings<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
  setSettings(key, value);
}

export function updateWidgetTransform(widgetKey: keyof SettingsState["widgets"], transform: Partial<WidgetTransform>) {
  setSettings("widgets", widgetKey, (prev) => ({ ...prev, ...transform }));
}

export function toggleWidgetVisibility(widgetKey: WidgetKey) {
  setSettings("widgets", widgetKey, "visible", (v) => !v);
}

export function toggleEditMode() {
  setSettings("isEditMode", (prev) => !prev);
}

export async function saveSettingsAsDefault() {
  setSettings("hasCompletedSetup", true);
  setSettings("isEditMode", false);

  const snapshot = JSON.parse(JSON.stringify(settings));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    console.log("Saved overlay layout to localStorage");
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }

  if (isTauri()) {
    try {
      await invoke("save_config", { configJson: JSON.stringify(snapshot, null, 2) });
      setSettings("storageTarget", "disk-file");
      console.log("Saved default configuration to OS native disk file (config.json)");
    } catch (e) {
      console.error("Failed to write native config.json:", e);
    }
  }
}

export { settings };

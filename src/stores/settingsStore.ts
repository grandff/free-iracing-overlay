import { createStore } from "solid-js/store";

export type ThemeType = "f1" | "wec" | "wrc" | "indycar" | "gt";
export type TripleMonitorMode = "center-clamp" | "full-span";

export interface WidgetTransform {
  x: number;
  y: number;
  scale: number;
}

export interface SettingsState {
  hasCompletedSetup: boolean; // false = initial setup wizard required
  setupStep: 1 | 2; // 1 = Theme Selection, 2 = Overlay Preview & Layout
  theme: ThemeType; // currently only 'f1' active, others 'coming soon'
  isEditMode: boolean; // Alt + J toggle
  tripleMonitorMode: TripleMonitorMode;
  widgets: {
    telemetryHub: WidgetTransform;
    leaderboard: WidgetTransform;
    relative: WidgetTransform;
    trackMap: WidgetTransform;
  };
}

const STORAGE_KEY = "iracing_overlay_config_v1";

const defaultSettings: SettingsState = {
  hasCompletedSetup: false, // initial launch must show setup
  setupStep: 1,
  theme: "f1", // default F1 theme
  isEditMode: false,
  tripleMonitorMode: "center-clamp",
  widgets: {
    telemetryHub: { x: 0, y: 0, scale: 1.0 },
    leaderboard: { x: 0, y: 0, scale: 1.0 },
    relative: { x: 0, y: 0, scale: 1.0 },
    trackMap: { x: 0, y: 0, scale: 1.0 },
  },
};

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed,
        // Ensure F1 is locked as active theme if invalid
        theme: parsed.theme === "f1" ? "f1" : "f1",
      };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return defaultSettings;
}

const [settings, setSettings] = createStore<SettingsState>(loadSettings());

export function updateSettings<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
  setSettings(key, value);
}

export function updateWidgetTransform(widgetKey: keyof SettingsState["widgets"], transform: Partial<WidgetTransform>) {
  setSettings("widgets", widgetKey, (prev) => ({ ...prev, ...transform }));
}

export function toggleEditMode() {
  setSettings("isEditMode", (prev) => !prev);
}

// Persist settings as default
export function saveSettingsAsDefault() {
  setSettings("hasCompletedSetup", true);
  setSettings("isEditMode", false);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to persist settings:", e);
  }
}

// Reset to setup wizard
export function restartSetupWizard() {
  setSettings("hasCompletedSetup", false);
  setSettings("setupStep", 1);
  setSettings("isEditMode", true);
}

export { settings };

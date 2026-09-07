import { createStore } from "solid-js/store";

export type ThemeType = "f1" | "wec" | "wrc" | "indycar" | "gt";
export type TripleMonitorMode = "center-clamp" | "full-span";
export type SpotterBezelPosition = "center-bezel" | "outer-edge";

export interface SettingsState {
  theme: ThemeType;
  isEditMode: boolean; // false = click-through, true = interactive
  tripleMonitorMode: TripleMonitorMode;
  spotterBezelPosition: SpotterBezelPosition;
  relativeCount: number; // 2 ~ 5
  spotterLeftDistanceM: number; // 1.5 ~ 5.0m
  spotterRightDistanceM: number;
}

const STORAGE_KEY = "iracing_overlay_settings_v1";

const defaultSettings: SettingsState = {
  theme: "f1",
  isEditMode: true, // start in edit/interactive mode for initial setup
  tripleMonitorMode: "center-clamp",
  spotterBezelPosition: "center-bezel",
  relativeCount: 3,
  spotterLeftDistanceM: 3.0,
  spotterRightDistanceM: 3.0,
};

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return defaultSettings;
}

const [settings, setSettings] = createStore<SettingsState>(loadSettings());

export function updateSettings<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
  setSettings(key, value);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

export function toggleEditMode() {
  updateSettings("isEditMode", !settings.isEditMode);
}

export function cycleTheme() {
  const themes: ThemeType[] = ["f1", "wec", "wrc", "indycar", "gt"];
  const next = themes[(themes.indexOf(settings.theme) + 1) % themes.length];
  updateSettings("theme", next);
}

export { settings };

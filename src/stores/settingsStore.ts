import { createStore } from "solid-js/store";
import { invoke, isTauri } from "@tauri-apps/api/core";
import type { SupportedLanguage } from "../i18n/locales.ts";

export type { SupportedLanguage };
export type ThemeType = "f1" | "wec" | "wrc" | "indycar" | "gt";
export type TripleMonitorMode = "center-clamp" | "full-span";

export interface WidgetTransform {
  x: number;
  y: number;
  scale: number;
  width?: number;
  maxRows?: number;
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

export interface UserProfile {
  driverName: string;
  country: string; // ISO 2-letter or iRacing Club, e.g. "KR"
  carNumber: string;
  carBrand: string;
}

export interface SettingsState {
  hasCompletedSetup: boolean; // false = initial setup wizard required
  setupStep: 1 | 2; // 1 = Theme Selection, 2 = Overlay Preview & Layout
  theme: ThemeType; // currently only 'f1' active, others 'coming soon'
  language: SupportedLanguage; // "ko" | "en" | "zh" | "ja" | "fr" | "de" | "it"
  isEditMode: boolean; // Alt + J toggle
  showControlPanel: boolean; // true = program settings dashboard visible
  showThemeLogo: boolean; // true = display current theme series logo at top of HUD
  sessionType: "PRACTICE" | "QUALIFY" | "RACE"; // Session mode (Practice, Qualify, Race)
  tripleMonitorMode: TripleMonitorMode;
  storageTarget: "disk-file" | "local-storage";
  userProfile: UserProfile;
  widgets: Record<WidgetKey, WidgetTransform>;
}

const STORAGE_KEY = "iracing_overlay_config_v1";

const defaultSettings: SettingsState = {
  hasCompletedSetup: false,
  setupStep: 1,
  theme: "f1",
  language: "ko",
  isEditMode: false,
  showControlPanel: false,
  showThemeLogo: true,
  sessionType: "RACE",
  tripleMonitorMode: "center-clamp",
  storageTarget: "local-storage",
  userProfile: {
    driverName: "K. Jeongmin",
    country: "KR",
    carNumber: "7",
    carBrand: "Porsche",
  },
  widgets: {
    leaderboard: { x: 0, y: 0, scale: 1.0, width: 520, maxRows: 10, visible: true },
    relative: { x: 0, y: 0, scale: 1.0, width: 320, maxRows: 3, visible: true },
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
        language: parsed.language || "ko",
        showThemeLogo: parsed.showThemeLogo !== undefined ? parsed.showThemeLogo : true,
        sessionType: parsed.sessionType || "RACE",
        userProfile: {
          ...defaultSettings.userProfile,
          ...(parsed.userProfile || {}),
        },
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
        language: parsed.language || "ko",
        showThemeLogo: parsed.showThemeLogo !== undefined ? parsed.showThemeLogo : true,
        sessionType: parsed.sessionType || "RACE",
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

// ponytail: transient UI state — never belongs in the saved config. Persisting
// isEditMode meant a restart could drop you straight into edit mode.
const TRANSIENT: (keyof SettingsState)[] = ["isEditMode", "showControlPanel", "setupStep"];

function persistableSnapshot(): SettingsState {
  const snap = JSON.parse(JSON.stringify(settings)) as SettingsState;
  for (const k of TRANSIENT) Reflect.deleteProperty(snap, k);
  return snap;
}

async function writeConfig(snapshot: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
  if (isTauri()) {
    try {
      await invoke("save_config", { configJson: JSON.stringify(snapshot, null, 2) });
      setSettings("storageTarget", "disk-file");
    } catch (e) {
      console.error("Failed to write native config.json:", e);
    }
  }
}

// Every setting change persists on its own — no "don't forget to save" step.
// Debounced so a widget drag writes once at the end, not 60x/second.
// ponytail: 400ms flat debounce; add a max-wait only if a long drag ever loses data.
let persistTimer: ReturnType<typeof setTimeout> | undefined;
function schedulePersist() {
  // Before the wizard finishes, saveSettingsAsDefault() owns the first write.
  if (!settings.hasCompletedSetup) return;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => void writeConfig(persistableSnapshot()), 400);
}

/** Force any pending debounced write out now (window close, wizard finish). */
export async function flushSettings() {
  clearTimeout(persistTimer);
  await writeConfig(persistableSnapshot());
}

export function updateSettings<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
  setSettings(key, value);
  schedulePersist();
}

export function updateWidgetTransform(widgetKey: keyof SettingsState["widgets"], transform: Partial<WidgetTransform>) {
  setSettings("widgets", widgetKey, (prev) => ({ ...prev, ...transform }));
  schedulePersist();
}

export function toggleWidgetVisibility(widgetKey: WidgetKey) {
  setSettings("widgets", widgetKey, "visible", (v) => !v);
  schedulePersist();
}

export function toggleControlPanel() {
  setSettings("showControlPanel", (prev) => !prev);
}

export function openControlPanel() {
  setSettings("showControlPanel", true);
}

export function closeControlPanel() {
  setSettings("showControlPanel", false);
}

export function toggleEditMode() {
  setSettings("isEditMode", (prev) => !prev);
}

export function updateUserProfile(profile: Partial<UserProfile>) {
  setSettings("userProfile", (prev) => ({ ...prev, ...profile }));
  schedulePersist();
}

/** Finishes the setup wizard. Ongoing changes persist by themselves after this. */
export async function saveSettingsAsDefault() {
  setSettings("hasCompletedSetup", true);
  setSettings("isEditMode", false);
  await flushSettings();
}

export { settings };

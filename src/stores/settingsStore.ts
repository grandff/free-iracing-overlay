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
  /**
   * Panel background alpha, 0.15..1. Feeds --hud-bg-alpha on the widget wrapper.
   * Optional so configs saved before this existed keep working on the default.
   */
  bgAlpha?: number;
  width?: number;
  height?: number;
  maxRows?: number;
  persistenceMode?: "session" | "5min";
  visible: boolean;
}

export type WidgetKey =
  | "leaderboard"
  | "relative"
  | "teamRadio"
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
  | "shiftLight"
  | "telemetryHub"
  | "digiflag"
  | "pitBoxHelper";

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
  translateSystemMessages: boolean; // true = translate system messages into current language, false = verbatim English
  tripleMonitorMode: TripleMonitorMode;
  centerClampWidth: 1920 | 2560; // 1920 (FHD Triples 5760x1080) vs 2560 (QHD Triples 7680x1440)
  spotterBezelAnchor: "screen-edge" | "center-bezel"; // Spotters at outer edges vs center screen bezels
  storageTarget: "disk-file" | "local-storage";
  debugLogging: boolean; // record raw SDK values next to what the widgets show
  debugLogPath: string; // "" = the app's own log directory
  revengePersistence: "session" | "5min"; // "session": keep until session end, "5min": auto-reset after 5 minutes
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
  translateSystemMessages: false,
  tripleMonitorMode: "center-clamp",
  centerClampWidth: 1920,
  spotterBezelAnchor: "center-bezel",
  storageTarget: "local-storage",
  revengePersistence: "session",
  debugLogging: false,
  debugLogPath: "",
  userProfile: {
    driverName: "K. Jeongmin",
    country: "KR",
    carNumber: "7",
    carBrand: "Porsche",
  },
  widgets: {
    leaderboard: { x: 0, y: 0, scale: 1.0, width: 520, maxRows: 10, visible: true },
    relative: { x: 0, y: 0, scale: 1.0, width: 340, maxRows: 3, visible: true },
    teamRadio: { x: 0, y: 0, scale: 1.0, width: 340, visible: true },
    lapDelta: { x: 0, y: 0, scale: 1.0, width: 440, visible: true },
    revengeTracker: { x: 0, y: 0, scale: 1.0, visible: true },
    spotterLeft: { x: 0, y: 0, scale: 1.0, width: 26, height: 280, visible: true },
    spotterRight: { x: 0, y: 0, scale: 1.0, width: 26, height: 280, visible: true },
    fuelCalculator: { x: 0, y: 0, scale: 1.0, width: 280, visible: true },
    tireAnalysis: { x: 0, y: 0, scale: 1.0, visible: true },
    incidentHazard: { x: 0, y: 0, scale: 1.0, width: 340, visible: true },
    weather: { x: 0, y: 0, scale: 1.0, width: 380, visible: true },
    multiclassRadar: { x: 0, y: 0, scale: 1.0, visible: true },
    trackMap: { x: 0, y: 0, scale: 1.0, width: 460, visible: true },
    shiftLight: { x: 0, y: 0, scale: 1.0, width: 440, visible: true },
    telemetryHub: { x: 0, y: 0, scale: 1.0, visible: true },
    digiflag: { x: 0, y: 0, scale: 1.0, width: 220, visible: true },
    pitBoxHelper: { x: 0, y: 0, scale: 1.0, width: 340, visible: true },
  },
};

/**
 * The spotters used to be short horizontal cards; they are vertical LED rails
 * now. A saved 200x56 would clamp to a stub, so a landscape size is treated as
 * the old shape and reset. ponytail: one shape test instead of a version field.
 */
function migrateSpotter(saved: WidgetTransform | undefined, fallback: WidgetTransform): WidgetTransform {
  if (!saved) return fallback;
  if ((saved.width ?? 0) >= (saved.height ?? 0)) return { ...saved, width: fallback.width, height: fallback.height };
  return saved;
}

function loadInitialSettings(): SettingsState {
  try {
    if (typeof localStorage === "undefined") return defaultSettings;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed,
        language: parsed.language || "ko",
        showThemeLogo: parsed.showThemeLogo !== undefined ? parsed.showThemeLogo : true,
        sessionType: parsed.sessionType || "RACE",
        translateSystemMessages: parsed.translateSystemMessages !== undefined ? parsed.translateSystemMessages : false,
        tripleMonitorMode: parsed.tripleMonitorMode || "center-clamp",
        centerClampWidth: parsed.centerClampWidth || 1920,
        spotterBezelAnchor: parsed.spotterBezelAnchor || "center-bezel",
        debugLogging: parsed.debugLogging === true,
        debugLogPath: parsed.debugLogPath || "",
        userProfile: {
          ...defaultSettings.userProfile,
          ...(parsed.userProfile || {}),
        },
        widgets: {
          ...defaultSettings.widgets,
          ...(parsed.widgets || {}),
          teamRadio: parsed.widgets?.teamRadio || defaultSettings.widgets.teamRadio,
          lapDelta: parsed.widgets?.lapDelta || defaultSettings.widgets.lapDelta,
          trackMap: parsed.widgets?.trackMap || defaultSettings.widgets.trackMap,
          shiftLight: parsed.widgets?.shiftLight || defaultSettings.widgets.shiftLight,
          spotterLeft: migrateSpotter(parsed.widgets?.spotterLeft, defaultSettings.widgets.spotterLeft),
          spotterRight: migrateSpotter(parsed.widgets?.spotterRight, defaultSettings.widgets.spotterRight),
          incidentHazard: parsed.widgets?.incidentHazard || defaultSettings.widgets.incidentHazard,
          weather: parsed.widgets?.weather || defaultSettings.widgets.weather,
          digiflag: parsed.widgets?.digiflag || defaultSettings.widgets.digiflag,
          pitBoxHelper: parsed.widgets?.pitBoxHelper || defaultSettings.widgets.pitBoxHelper,
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
        translateSystemMessages: parsed.translateSystemMessages !== undefined ? parsed.translateSystemMessages : false,
        tripleMonitorMode: parsed.tripleMonitorMode || "center-clamp",
        centerClampWidth: parsed.centerClampWidth || 1920,
        spotterBezelAnchor: parsed.spotterBezelAnchor || "center-bezel",
        debugLogging: parsed.debugLogging === true,
        debugLogPath: parsed.debugLogPath || "",
        storageTarget: "disk-file",
        theme: "f1",
        widgets: {
          ...defaultSettings.widgets,
          ...(parsed.widgets || {}),
          teamRadio: parsed.widgets?.teamRadio || defaultSettings.widgets.teamRadio,
          lapDelta: parsed.widgets?.lapDelta || defaultSettings.widgets.lapDelta,
          trackMap: parsed.widgets?.trackMap || defaultSettings.widgets.trackMap,
          shiftLight: parsed.widgets?.shiftLight || defaultSettings.widgets.shiftLight,
          spotterLeft: migrateSpotter(parsed.widgets?.spotterLeft, defaultSettings.widgets.spotterLeft),
          spotterRight: migrateSpotter(parsed.widgets?.spotterRight, defaultSettings.widgets.spotterRight),
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
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
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

export function setTranslateSystemMessages(enabled: boolean) {
  setSettings("translateSystemMessages", enabled);
  schedulePersist();
}

export function updateWidgetTransform(widgetKey: keyof SettingsState["widgets"], transform: Partial<WidgetTransform>) {
  setSettings("widgets", widgetKey, (prev) => ({ ...prev, ...transform }));
  schedulePersist();
}

/** Panel background alpha for one widget. Clamped: fully invisible or fully
 *  opaque are both useless states to leave a user stuck in. */
export const DEFAULT_BG_ALPHA = 0.95;
export function widgetBgAlpha(widgetKey: WidgetKey): number {
  return settings.widgets[widgetKey]?.bgAlpha ?? DEFAULT_BG_ALPHA;
}
export function setWidgetBgAlpha(widgetKey: WidgetKey, alpha: number) {
  setSettings("widgets", widgetKey, "bgAlpha", Math.max(0.15, Math.min(1, alpha)));
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

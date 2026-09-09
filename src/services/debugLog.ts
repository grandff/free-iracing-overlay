// Telemetry debug recorder.
//
// Writes one CSV row per sample with the RAW iRacing values next to the values the
// widgets actually display, so a wrong reading on screen can be traced back to the
// SDK variable it came from without attaching a debugger to a running sim.
//
// It also records the rows where there is no frame at all: right now the packaged
// app has no shared-memory reader (M5.2), so "connected=1, frame=0" is exactly the
// diagnostic that says the pipeline stops at the Rust side.

import { invoke, isTauri } from "@tauri-apps/api/core";
import { settings } from "../stores/settingsStore.ts";
import { telemetry } from "../stores/telemetryStore.ts";
import type { TelemetryFrame } from "./telemetry/types.ts";

/**
 * ponytail: 10Hz, fixed. Fast enough to catch a spotter flick or an incident
 * trigger, slow enough that an hour of racing is a few MB. Make it a setting only
 * if something turns out to need 60Hz to reproduce.
 */
const SAMPLE_MS = 100;
/** One IPC call per flush, not per row. */
const FLUSH_MS = 2000;
const DEFAULT_FILE = "telemetry-debug.csv";

const COLUMNS = [
  "time",
  "connected",
  "source",
  "hasFrame",
  // --- raw SDK ---
  "raw_CarLeftRight",
  "raw_SessionFlags",
  "raw_FuelLevel",
  "raw_Lap",
  "raw_OnPitRoad",
  "raw_LapDistPct",
  "raw_Speed_kmh",
  "raw_RPM",
  "raw_Gear",
  "raw_carsInWorld",
  // --- what the widgets show ---
  "out_spotterL",
  "out_spotterR",
  "out_hazardType",
  "out_hazardDist_m",
  "out_hazardCar",
  "out_fuelAvgPerLap",
  "out_lapsOnFuel",
  "out_lapsRemaining",
  "out_toFinish_L",
  "out_boxUnderfilled",
  "out_pitStallDist_m",
  "out_airTemp",
  "out_trackTemp",
] as const;

const HEADER = COLUMNS.join(",");

/** CSV-safe: the only free text we emit is a car number and a hazard type. */
function cell(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return Number.isFinite(v) ? String(Math.round(v * 1000) / 1000) : "";
  return String(v).replace(/[",\n\r]/g, " ");
}

function row(frame: TelemetryFrame | null): string {
  const f = frame;
  const p = f?.pitLane;
  return [
    new Date().toISOString(),
    telemetry.isConnected,
    telemetry.source,
    !!f,
    f?.spotter?.carLeftRight,
    f?.sessionFlags,
    f?.player?.fuelLevelLiters,
    f?.player?.lap,
    f?.player?.onPitRoad,
    f?.cars?.find((c) => c.carIdx === f.player?.carIdx)?.lapDistPct,
    f?.player?.speedKmh,
    f?.player?.rpm,
    f?.player?.gear,
    f?.cars?.filter((c) => c.trackSurface !== -1).length,
    f?.spotter?.leftState,
    f?.spotter?.rightState,
    f?.hazard?.hasIncident ? f.hazard.hazardType : "",
    f?.hazard?.hasIncident ? f.hazard.distanceMeters : "",
    f?.hazard?.incidentCarNumber,
    f?.fuel?.avgPerLap,
    f?.fuel?.lapsOnFuel,
    f?.fuel?.lapsRemaining,
    f?.fuel?.toFinish,
    f?.fuel?.boxUnderfilled,
    p?.distanceToStallMeters,
    f?.weather?.airTempC,
    f?.weather?.trackTempC,
  ]
    .map(cell)
    .join(",");
}

let sampleTimer: ReturnType<typeof setInterval> | undefined;
let flushTimer: ReturnType<typeof setInterval> | undefined;
let buffer: string[] = [];
let lastError: string | undefined;
let resolvedPath: string | undefined;

async function flush() {
  if (buffer.length === 0) return;
  const lines = buffer.join("\n") + "\n";
  buffer = [];
  if (!isTauri()) {
    // Browser preview has no filesystem; the console is the log. info, not debug:
    // most consoles hide debug by default, which defeats the point of the feature.
    console.info("[debugLog]\n" + lines);
    return;
  }
  try {
    resolvedPath = await invoke<string>("append_debug_log", {
      dir: settings.debugLogPath ?? "",
      fileName: DEFAULT_FILE,
      header: HEADER,
      lines,
    });
    lastError = undefined;
  } catch (e) {
    // Keep the app running: a log we cannot write must never take the HUD with it.
    lastError = String(e);
    console.error("[debugLog] write failed:", e);
  }
}

export function startDebugLog() {
  if (sampleTimer) return;
  buffer = [];
  sampleTimer = setInterval(() => {
    buffer.push(row(telemetry.frame));
    // A stalled flush must not grow without bound (30s of samples).
    if (buffer.length > 300) buffer.splice(0, buffer.length - 300);
  }, SAMPLE_MS);
  flushTimer = setInterval(() => void flush(), FLUSH_MS);
}

export function stopDebugLog() {
  if (sampleTimer) clearInterval(sampleTimer);
  if (flushTimer) clearInterval(flushTimer);
  sampleTimer = undefined;
  flushTimer = undefined;
  void flush();
}

/** Absolute path the current setting resolves to, for display in the control panel. */
export async function debugLogPath(dir: string): Promise<string> {
  if (!isTauri()) return "(browser preview — logs go to the devtools console)";
  try {
    return await invoke<string>("debug_log_path", { dir, fileName: DEFAULT_FILE });
  } catch (e) {
    return String(e);
  }
}

export const debugLogState = () => ({ path: resolvedPath, error: lastError, running: !!sampleTimer });

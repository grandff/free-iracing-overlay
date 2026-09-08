import { createStore } from "solid-js/store";
import { TelemetryFrame } from "../services/telemetry/types.ts";
import { lerpEngine } from "../services/telemetry/lerpEngine.ts";
import { isBrowserPreview, watchConnection } from "../services/shell.ts";

export interface TelemetryState {
  frame: TelemetryFrame | null;
  displayFps: number;
  telemetryTickRate: number;
  /** True only when iRacing's shared memory is actually mapped (or in browser preview). */
  isConnected: boolean;
  source: "mock" | "iracing-shmem";
}

const [telemetry, setTelemetry] = createStore<TelemetryState>({
  frame: null,
  displayFps: 60,
  telemetryTickRate: 60,
  // Starts false under Tauri: the Rust watcher decides. Browser preview flips it
  // true immediately via watchConnection so macOS/Linux dev still shows the HUD.
  isConnected: false,
  source: import.meta.env.DEV && isBrowserPreview ? "mock" : "iracing-shmem",
});

let unwatch: (() => void) | undefined;
let stopTelemetrySource: (() => void) | undefined;
let pipelineGeneration = 0;

/**
 * Connection flag only — no telemetry engine.
 * The control window needs to know whether iRacing is up (to show status and to
 * decide whether the HUD window is on screen), but it renders no gauges, so it must
 * not spin up a second 60Hz tick loop and rAF interpolator alongside the overlay's.
 */
export function initializeConnectionWatch() {
  // iRacing presence is an OS fact, not something the mock generator gets to assert.
  // Rust polls the shared-memory map at 1Hz and emits on change.
  watchConnection((connected) => setTelemetry("isConnected", connected)).then((un) => {
    unwatch = un;
  });
}

/** Full 60Hz pipeline. Overlay window (or browser preview) only. */
export function initializeTelemetryPipeline() {
  initializeConnectionWatch();

  // Mock telemetry is a browser-only development aid. Never feed simulated
  // racing data to a packaged Tauri app or a production web build.
  if (!import.meta.env.DEV || !isBrowserPreview) return;

  const generation = ++pipelineGeneration;
  void import("../services/telemetry/mockEngine.ts").then(({ mockEngine }) => {
    if (generation !== pipelineGeneration) return;

    // 1. Connect mock generator to LERP engine (60Hz -> 144Hz+)
    mockEngine.start((incomingFrame) => {
      setTelemetry("telemetryTickRate", incomingFrame.tickRateHz);
      lerpEngine.feed(incomingFrame);
    });
    stopTelemetrySource = () => mockEngine.stop();

    // 2. Connect LERP engine output to Solid.js store (runs at display refresh rate)
    lerpEngine.start((interpolatedFrame, currentFps) => {
      setTelemetry("frame", interpolatedFrame);
      setTelemetry("displayFps", currentFps);
    });
  });
}

export function disposeTelemetryPipeline() {
  pipelineGeneration += 1;
  unwatch?.();
  unwatch = undefined;
  stopTelemetrySource?.();
  stopTelemetrySource = undefined;
  lerpEngine.stop();
}

export { telemetry };

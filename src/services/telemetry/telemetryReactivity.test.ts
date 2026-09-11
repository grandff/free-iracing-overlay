import assert from "node:assert/strict";
import { createStore, reconcile } from "solid-js/store";
import { createComputed, createRoot } from "solid-js";
import { mockEngine } from "./mockEngine.ts";
import type { TelemetryFrame } from "./types.ts";

// Setup browser globals for headless test
if (typeof window === "undefined") {
  (globalThis as any).window = globalThis;
}
if (typeof localStorage === "undefined") {
  (globalThis as any).localStorage = { getItem: () => null, setItem: () => {} };
}

createRoot(() => {
  const [telemetry, setTelemetry] = createStore<{ frame: TelemetryFrame | null }>({ frame: null });

  let car0LapUpdates = 0;
  let playerGearUpdates = 0;
  let spotterUpdates = 0;

  createComputed(() => {
    const d = telemetry.frame?.cars?.[0]?.lapDistPct;
    if (d !== undefined) car0LapUpdates++;
  });

  createComputed(() => {
    const g = telemetry.frame?.player?.gear;
    if (g !== undefined) playerGearUpdates++;
  });

  createComputed(() => {
    const s = telemetry.frame?.spotter?.carLeftRight;
    if (s !== undefined) spotterUpdates++;
  });

  // Wire up the pipeline exactly as telemetryStore.ts does
  mockEngine.start((incomingFrame) => {
    if (!telemetry.frame) {
      setTelemetry("frame", incomingFrame);
    } else {
      if (telemetry.frame.player) {
        incomingFrame.player.speedKmh = telemetry.frame.player.speedKmh;
        incomingFrame.player.rpm = telemetry.frame.player.rpm;
      }
      if (telemetry.frame.shiftLight) {
        incomingFrame.shiftLight.speedKmh = telemetry.frame.shiftLight.speedKmh;
        incomingFrame.shiftLight.rpm = telemetry.frame.shiftLight.rpm;
      }
      setTelemetry("frame", reconcile(incomingFrame, { key: "carIdx" }));
    }
  });

  // Run 10 ticks
  for (let i = 0; i < 10; i++) {
    mockEngine.tick();
  }
  mockEngine.stop();

  // Assert that cars lapDistPct was reactively updated across ticks
  assert.ok(car0LapUpdates >= 10, `car0LapUpdates must be at least 10, got ${car0LapUpdates}`);
  assert.ok(telemetry.frame !== null, "telemetry.frame must be populated");
  assert.ok((telemetry.frame?.cars.length ?? 0) > 0, "cars array must have competitors");

  console.log("telemetryReactivity self-check passed: Solid store reactivity and reconcile verified");
});

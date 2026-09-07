import { createStore } from "solid-js/store";
import { TelemetryFrame } from "../services/telemetry/types.ts";
import { mockEngine } from "../services/telemetry/mockEngine.ts";
import { lerpEngine } from "../services/telemetry/lerpEngine.ts";

export interface TelemetryState {
  frame: TelemetryFrame | null;
  displayFps: number;
  telemetryTickRate: number;
  isConnected: boolean;
  source: "mock" | "iracing-shmem";
}

const [telemetry, setTelemetry] = createStore<TelemetryState>({
  frame: null,
  displayFps: 60,
  telemetryTickRate: 60,
  isConnected: false,
  source: "mock",
});

export function initializeTelemetryPipeline() {
  // 1. Connect mock generator to LERP engine (60Hz -> 144Hz+)
  mockEngine.start((incomingFrame) => {
    setTelemetry("telemetryTickRate", incomingFrame.tickRateHz);
    setTelemetry("isConnected", true);
    lerpEngine.feed(incomingFrame);
  });

  // 2. Connect LERP engine output to Solid.js store (runs at display refresh rate)
  lerpEngine.start((interpolatedFrame, currentFps) => {
    setTelemetry("frame", interpolatedFrame);
    setTelemetry("displayFps", currentFps);
  });
}

export { telemetry };

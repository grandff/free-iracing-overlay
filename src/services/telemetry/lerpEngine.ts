import type { TelemetryFrame } from "./types.ts";

// ponytail: zero-allocation native display refresh rate (60Hz..240Hz) LERP engine
// Smooths speedometer and tachometer between 60Hz iRacing telemetry ticks without frame rate throttling
export class LerpEngine {
  private prevSpeed = 0;
  private prevRpm = 0;
  private currSpeed = 0;
  private currRpm = 0;

  private lastTickTime = performance.now();
  private tickIntervalMs = 16.66; // 60Hz iRacing default
  private animFrameId: number | null = null;
  private onRenderCallback: ((speedKmh: number, rpm: number, fps: number) => void) | null = null;

  private frameCount = 0;
  private lastFpsCalcTime = performance.now();
  private currentFps = 60;

  private initialized = false;

  public feed(frame: TelemetryFrame, now: number = performance.now()) {
    const speed = frame.player?.speedKmh ?? 0;
    const rpm = frame.player?.rpm ?? 0;

    if (!this.initialized) {
      this.initialized = true;
      this.prevSpeed = speed;
      this.currSpeed = speed;
      this.prevRpm = rpm;
      this.currRpm = rpm;
      this.lastTickTime = now;
      this.tickIntervalMs = 16.66;
      return;
    }

    const delta = Math.max(8, Math.min(100, now - this.lastTickTime));
    // Exponential smoothing (EMA) to eliminate timer jitter between 60Hz ticks
    this.tickIntervalMs = this.tickIntervalMs * 0.85 + delta * 0.15;
    this.lastTickTime = now;

    // Snapshot previous and current values
    this.prevSpeed = this.currSpeed;
    this.prevRpm = this.currRpm;
    this.currSpeed = speed;
    this.currRpm = rpm;
  }

  public interpolateAt(time: number): { speedKmh: number; rpm: number } {
    if (!this.initialized) {
      return { speedKmh: this.currSpeed, rpm: this.currRpm };
    }

    const elapsed = time - this.lastTickTime;
    const alpha = Math.min(1.0, Math.max(0.0, elapsed / this.tickIntervalMs));

    if (alpha >= 1.0 || (this.prevSpeed === this.currSpeed && this.prevRpm === this.currRpm)) {
      return { speedKmh: this.currSpeed, rpm: this.currRpm };
    }

    return {
      speedKmh: Math.round(this.prevSpeed + (this.currSpeed - this.prevSpeed) * alpha),
      rpm: Math.round(this.prevRpm + (this.currRpm - this.prevRpm) * alpha),
    };
  }

  public start(onRender: (speedKmh: number, rpm: number, fps: number) => void) {
    this.onRenderCallback = onRender;

    const loop = (time: number) => {
      // FPS measurement (every 500ms)
      this.frameCount++;
      if (time - this.lastFpsCalcTime >= 500) {
        this.currentFps = Math.round((this.frameCount * 1000) / (time - this.lastFpsCalcTime));
        this.frameCount = 0;
        this.lastFpsCalcTime = time;
      }

      if (this.onRenderCallback) {
        const { speedKmh, rpm } = this.interpolateAt(time);
        this.onRenderCallback(speedKmh, rpm, this.currentFps);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

export const lerpEngine = new LerpEngine();

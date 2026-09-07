import { TelemetryFrame } from "./types.ts";

// ponytail: high-efficiency 60fps rate-limited interpolation engine
// Prevents GC thrashing and excessive DOM re-evaluations on 120Hz/144Hz/240Hz screens
export class LerpEngine {
  private prevFrame: TelemetryFrame | null = null;
  private currFrame: TelemetryFrame | null = null;
  private lastTickTime = performance.now();
  private tickIntervalMs = 16.66; // 60Hz iRacing default
  private animFrameId: number | null = null;
  private onRenderCallback: ((interpolated: TelemetryFrame, fps: number) => void) | null = null;

  private frameCount = 0;
  private lastFpsCalcTime = performance.now();
  private currentFps = 60;
  private lastRenderTime = 0;
  private readonly targetFrameIntervalMs = 16.0; // 60fps max for Solid DOM reactivity

  public feed(frame: TelemetryFrame) {
    const now = performance.now();
    this.tickIntervalMs = Math.max(8, now - this.lastTickTime);
    this.lastTickTime = now;

    this.prevFrame = this.currFrame ? this.currFrame : frame;
    this.currFrame = frame;
  }

  public start(onRender: (interpolated: TelemetryFrame, fps: number) => void) {
    this.onRenderCallback = onRender;

    const loop = (time: number) => {
      // FPS measurement
      this.frameCount++;
      if (time - this.lastFpsCalcTime >= 500) {
        this.currentFps = Math.round((this.frameCount * 1000) / (time - this.lastFpsCalcTime));
        this.frameCount = 0;
        this.lastFpsCalcTime = time;
      }

      // Throttle Solid.js store updates to 60fps
      if (time - this.lastRenderTime >= this.targetFrameIntervalMs) {
        this.lastRenderTime = time;
        if (this.currFrame) {
          const interpolated = this.interpolate(time);
          if (this.onRenderCallback) {
            this.onRenderCallback(interpolated, this.currentFps);
          }
        }
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

  private interpolate(renderTime: number): TelemetryFrame {
    if (!this.prevFrame || !this.currFrame) return this.currFrame!;

    const elapsed = renderTime - this.lastTickTime;
    const alpha = Math.min(1.0, Math.max(0.0, elapsed / this.tickIntervalMs));
    const lerp = (a: number, b: number) => a + (b - a) * alpha;

    return {
      ...this.currFrame,
      player: {
        ...this.currFrame.player,
        speedKmh: Math.round(lerp(this.prevFrame.player.speedKmh, this.currFrame.player.speedKmh)),
        rpm: Math.round(lerp(this.prevFrame.player.rpm, this.currFrame.player.rpm)),
      },
      // Keep cars array reference stable per 60Hz tick to prevent memory thrashing
      cars: this.currFrame.cars,
    };
  }
}

export const lerpEngine = new LerpEngine();

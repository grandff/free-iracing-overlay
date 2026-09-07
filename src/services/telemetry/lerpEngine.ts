import { TelemetryFrame } from "./types.ts";

// ponytail: 144Hz/240Hz display refresh rate linear interpolation engine
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

      if (this.currFrame) {
        const interpolated = this.interpolate(time);
        if (this.onRenderCallback) {
          this.onRenderCallback(interpolated, this.currentFps);
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

    // Alpha from 0.0 to 1.0 between 60Hz ticks
    const elapsed = renderTime - this.lastTickTime;
    const alpha = Math.min(1.0, Math.max(0.0, elapsed / this.tickIntervalMs));

    // Linear interpolation helper
    const lerp = (a: number, b: number) => a + (b - a) * alpha;

    // Return interpolated frame with smoothed dynamic values
    return {
      ...this.currFrame,
      player: {
        ...this.currFrame.player,
        speedKmh: Math.round(lerp(this.prevFrame.player.speedKmh, this.currFrame.player.speedKmh)),
        rpm: Math.round(lerp(this.prevFrame.player.rpm, this.currFrame.player.rpm)),
      },
      cars: this.currFrame.cars.map((car, idx) => {
        const prevCar = this.prevFrame?.cars[idx];
        if (!prevCar) return car;
        return {
          ...car,
          lapDistPct: lerp(prevCar.lapDistPct, car.lapDistPct),
          speedKmh: Math.round(lerp(prevCar.speedKmh, car.speedKmh)),
        };
      }),
    };
  }
}

export const lerpEngine = new LerpEngine();

import { TelemetryFrame, CarTelemetry } from "./types.ts";

// ponytail: lightweight 60Hz simulated telemetry generator for macOS/Linux dev without iRacing running
export class MockTelemetryEngine {
  private timer: number | null = null;
  private onTickCallback: ((frame: TelemetryFrame) => void) | null = null;
  private lapDist = 0.15;
  private currentLap = 3;
  private fuelRemaining = 42.5;
  private trackLength = 4500; // 4.5km circuit

  private simulatedCars: CarTelemetry[] = [
    { carIdx: 1, carNumber: "1", driverName: "M. Verstappen", country: "NL", carBrand: "Red Bull", irating: 7850, safetyRating: { license: "P", value: 4.99 }, classPosition: 1, overallPosition: 1, lap: 3, lapDistPct: 0.15, lastLapTime: 84.12, bestLapTime: 83.89, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 245, gapToPlayerSeconds: 0, trackSurface: 3 },
    { carIdx: 2, carNumber: "16", driverName: "C. Leclerc", country: "MC", carBrand: "Ferrari", irating: 6840, safetyRating: { license: "A", value: 4.62 }, classPosition: 2, overallPosition: 2, lap: 3, lapDistPct: 0.145, lastLapTime: 84.34, bestLapTime: 84.05, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 242, gapToPlayerSeconds: -0.42, trackSurface: 3 },
    { carIdx: 3, carNumber: "44", driverName: "L. Hamilton", country: "GB", carBrand: "Mercedes", irating: 7120, safetyRating: { license: "A", value: 4.88 }, classPosition: 3, overallPosition: 3, lap: 3, lapDistPct: 0.138, lastLapTime: 84.62, bestLapTime: 84.11, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 240, gapToPlayerSeconds: -1.02, trackSurface: 3 },
    { carIdx: 4, carNumber: "81", driverName: "O. Piastri", country: "AU", carBrand: "McLaren", irating: 5920, safetyRating: { license: "B", value: 3.94 }, classPosition: 4, overallPosition: 4, lap: 3, lapDistPct: 0.165, lastLapTime: 84.25, bestLapTime: 84.15, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 248, gapToPlayerSeconds: +1.28, trackSurface: 3 },
    { carIdx: 5, carNumber: "22", driverName: "Y. Tsunoda", country: "JP", carBrand: "Porsche", irating: 4890, safetyRating: { license: "B", value: 3.45 }, classPosition: 1, overallPosition: 5, lap: 3, lapDistPct: 0.12, lastLapTime: 87.55, bestLapTime: 87.20, inPit: false, carClass: "LMP2", carClassColor: "#0066CC", speedKmh: 228, gapToPlayerSeconds: -2.55, trackSurface: 3 },
    { carIdx: 6, carNumber: "55", driverName: "C. Sainz", country: "ES", carBrand: "Ferrari", irating: 6350, safetyRating: { license: "A", value: 4.41 }, classPosition: 2, overallPosition: 6, lap: 3, lapDistPct: 0.115, lastLapTime: 87.80, bestLapTime: 87.35, inPit: false, carClass: "LMP2", carClassColor: "#0066CC", speedKmh: 225, gapToPlayerSeconds: -2.95, trackSurface: 3 },
    { carIdx: 7, carNumber: "99", driverName: "J. Montoya", country: "CO", carBrand: "BMW", irating: 5210, safetyRating: { license: "C", value: 3.82 }, classPosition: 3, overallPosition: 7, lap: 3, lapDistPct: 0.05, lastLapTime: 88.90, bestLapTime: 88.10, inPit: false, carClass: "LMP2", carClassColor: "#0066CC", speedKmh: 220, gapToPlayerSeconds: -8.40, trackSurface: 3 },
    { carIdx: 8, carNumber: "42", driverName: "A. Rossi", country: "US", carBrand: "Aston Martin", irating: 4120, safetyRating: { license: "D", value: 2.95 }, classPosition: 1, overallPosition: 8, lap: 2, lapDistPct: 0.21, lastLapTime: 95.20, bestLapTime: 94.80, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 35, gapToPlayerSeconds: +4.80, trackSurface: 1 }, // incident spinning
    { carIdx: 9, carNumber: "63", driverName: "G. Russell", country: "GB", carBrand: "Mercedes", irating: 6480, safetyRating: { license: "A", value: 4.15 }, classPosition: 2, overallPosition: 9, lap: 2, lapDistPct: 0.10, lastLapTime: 95.45, bestLapTime: 95.00, inPit: true, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 60, gapToPlayerSeconds: -4.10, trackSurface: 2 }, // in pit
    { carIdx: 10, carNumber: "4", driverName: "L. Norris", country: "GB", carBrand: "McLaren", irating: 6920, safetyRating: { license: "A", value: 4.75 }, classPosition: 5, overallPosition: 10, lap: 3, lapDistPct: 0.18, lastLapTime: 84.18, bestLapTime: 83.95, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 250, gapToPlayerSeconds: +2.45, trackSurface: 3 },
    { carIdx: 11, carNumber: "7", driverName: "K. Jeongmin", country: "KR", carBrand: "Porsche", irating: 3450, safetyRating: { license: "B", value: 3.65 }, classPosition: 3, overallPosition: 11, lap: 2, lapDistPct: 0.08, lastLapTime: 96.10, bestLapTime: 95.80, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 232, gapToPlayerSeconds: -5.60, trackSurface: 3 },
    { carIdx: 12, carNumber: "11", driverName: "S. Perez", country: "MX", carBrand: "Red Bull", irating: 5800, safetyRating: { license: "A", value: 3.98 }, classPosition: 6, overallPosition: 12, lap: 3, lapDistPct: 0.13, lastLapTime: 84.90, bestLapTime: 84.40, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 238, gapToPlayerSeconds: -1.80, trackSurface: 3 },
  ];

  public start(onTick: (frame: TelemetryFrame) => void) {
    this.onTickCallback = onTick;
    if (this.timer) clearInterval(this.timer);

    // 60Hz loop (1000ms / 60 = 16.66ms)
    this.timer = window.setInterval(() => this.tick(), 16.66);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private tick() {
    // Progress cars around track at ~240 km/h (66.6 m/s -> ~1.11 m per tick)
    const deltaMeters = 66.6 * 0.0166;
    const deltaPct = deltaMeters / this.trackLength;

    this.lapDist = (this.lapDist + deltaPct) % 1.0;
    if (this.lapDist < 0.005) {
      this.currentLap += 1;
      this.fuelRemaining = Math.max(2.0, this.fuelRemaining - 2.35);
    }

    // Update opponent positions slightly
    this.simulatedCars.forEach((c) => {
      if (c.carIdx === 1) {
        c.lapDistPct = this.lapDist;
        c.lap = this.currentLap;
      } else if (!c.inPit && c.speedKmh > 50) {
        c.lapDistPct = (c.lapDistPct + (deltaPct * (c.speedKmh / 245))) % 1.0;
        c.gapToPlayerSeconds = (c.lapDistPct - this.lapDist) * (84.0);
      }
    });

    // Proximity spotter simulation (Car #16 is 2.8m to our left)
    const spotterLeftDist = 2.8;
    const spotterRightDist = 99.0;

    // Hazard simulation: Car #42 is spinning ahead around lapDist 0.21
    const hazardDist = Math.max(0, (0.21 - this.lapDist) * this.trackLength);
    const hasHazard = hazardDist > 0 && hazardDist < 400;

    const frame: TelemetryFrame = {
      timestamp: performance.now(),
      tickRateHz: 60,
      trackLengthMeters: this.trackLength,
      trackName: "Spa-Francorchamps GP",
      sessionLapsRemaining: 18,
      sessionTimeRemainingSec: 1512,
      player: {
        carIdx: 1,
        carNumber: "1",
        driverName: "M. Verstappen",
        speedKmh: Math.round(238 + Math.sin(Date.now() / 800) * 12),
        rpm: Math.round(11200 + Math.sin(Date.now() / 400) * 800),
        gear: 6,
        fuelLevelLiters: Number(this.fuelRemaining.toFixed(2)),
        fuelMaxLiters: 110,
        fuelAvgPerLap: 2.35,
        fuelLapsRemaining: Math.floor(this.fuelRemaining / 2.35),
        fuelNeededToFinish: Number((18 * 2.35 - this.fuelRemaining + 1.5).toFixed(1)),
        lastLapTime: 84.12,
        bestLapTime: 83.89,
        lastLapDelta: -0.23, // -0.23s green
        incidents: 4,
        tirePressurePsi: [28.5, 28.6, 28.2, 28.3],
        tireWearPct: [94, 91, 96, 93],
        tireSurfaceLoadPct: [68, 74, 62, 65],
      },
      cars: this.simulatedCars,
      spotter: {
        leftDistanceMeters: spotterLeftDist,
        rightDistanceMeters: spotterRightDist,
        leftState: spotterLeftDist < 2.0 ? "danger" : spotterLeftDist < 4.0 ? "caution" : "clear",
        rightState: "clear",
      },
      hazard: {
        hasIncident: hasHazard,
        distanceMeters: Math.round(hazardDist),
        incidentCarNumber: "42",
        incidentSector: 2,
      },
      revenge: {
        hasTarget: true,
        driverName: "J. Montoya",
        carNumber: "99",
        gapSeconds: -8.4,
        incidentCount: 4,
      },
      weather: {
        airTempC: 22.4,
        trackTempC: 34.8,
        windSpeedKmh: 14.2,
        windDirDeg: 65,
        trackWetnessPct: 0,
        precipitationPct: 0,
      },
      multiclass: {
        hasApproachingFastCar: false,
        carClass: "Hypercar",
        carNumber: "1",
        gapSeconds: 0,
      },
    };

    if (this.onTickCallback) {
      this.onTickCallback(frame);
    }
  }
}

export const mockEngine = new MockTelemetryEngine();

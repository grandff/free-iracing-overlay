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
    { carIdx: 2, carNumber: "7", driverName: "K. Jeongmin", country: "KR", carBrand: "Porsche", irating: 6840, safetyRating: { license: "A", value: 4.62 }, classPosition: 2, overallPosition: 2, lap: 3, lapDistPct: 0.145, lastLapTime: 84.34, bestLapTime: 84.05, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 242, gapToPlayerSeconds: -0.42, trackSurface: 3 },
    { carIdx: 3, carNumber: "6", driverName: "K. Estre", country: "FR", carBrand: "Porsche", irating: 7120, safetyRating: { license: "A", value: 4.88 }, classPosition: 3, overallPosition: 3, lap: 3, lapDistPct: 0.138, lastLapTime: 84.62, bestLapTime: 84.11, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 240, gapToPlayerSeconds: -1.02, trackSurface: 3 },
    { carIdx: 4, carNumber: "51", driverName: "A. Pier Guidi", country: "IT", carBrand: "Ferrari", irating: 6920, safetyRating: { license: "A", value: 4.75 }, classPosition: 4, overallPosition: 4, lap: 3, lapDistPct: 0.165, lastLapTime: 84.25, bestLapTime: 84.15, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 248, gapToPlayerSeconds: +1.28, trackSurface: 3 },
    { carIdx: 5, carNumber: "24", driverName: "J. Gordon", country: "US", carBrand: "Corvette", irating: 6350, safetyRating: { license: "A", value: 4.41 }, classPosition: 5, overallPosition: 5, lap: 3, lapDistPct: 0.115, lastLapTime: 87.80, bestLapTime: 87.35, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 225, gapToPlayerSeconds: -2.95, trackSurface: 3 },
    { carIdx: 6, carNumber: "911", driverName: "L. Vanthoor", country: "BE", carBrand: "Porsche", irating: 6890, safetyRating: { license: "A", value: 4.75 }, classPosition: 1, overallPosition: 6, lap: 2, lapDistPct: 0.12, lastLapTime: 94.55, bestLapTime: 94.20, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 235, gapToPlayerSeconds: -2.55, trackSurface: 3 },
    { carIdx: 7, carNumber: "63", driverName: "M. Bortolotti", country: "IT", carBrand: "Lamborghini", irating: 6480, safetyRating: { license: "A", value: 4.52 }, classPosition: 2, overallPosition: 7, lap: 2, lapDistPct: 0.10, lastLapTime: 94.85, bestLapTime: 94.30, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 236, gapToPlayerSeconds: -4.10, trackSurface: 3 },
    { carIdx: 8, carNumber: "3", driverName: "A. Garcia", country: "ES", carBrand: "Corvette", irating: 6120, safetyRating: { license: "A", value: 4.30 }, classPosition: 3, overallPosition: 8, lap: 2, lapDistPct: 0.08, lastLapTime: 95.10, bestLapTime: 94.60, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 233, gapToPlayerSeconds: -5.60, trackSurface: 3 },
    { carIdx: 9, carNumber: "77", driverName: "M. Goetz", country: "DE", carBrand: "Mercedes", irating: 6210, safetyRating: { license: "A", value: 4.25 }, classPosition: 4, overallPosition: 9, lap: 2, lapDistPct: 0.07, lastLapTime: 95.25, bestLapTime: 94.75, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 234, gapToPlayerSeconds: -6.20, trackSurface: 3 },
    { carIdx: 10, carNumber: "23", driverName: "T. Matsuda", country: "JP", carBrand: "Nissan", irating: 5950, safetyRating: { license: "A", value: 4.15 }, classPosition: 5, overallPosition: 10, lap: 2, lapDistPct: 0.06, lastLapTime: 95.40, bestLapTime: 94.90, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 232, gapToPlayerSeconds: -7.10, trackSurface: 3 },
    { carIdx: 11, carNumber: "44", driverName: "L. Hamilton", country: "GB", carBrand: "Mercedes", irating: 7120, safetyRating: { license: "A", value: 4.88 }, classPosition: 6, overallPosition: 11, lap: 2, lapDistPct: 0.05, lastLapTime: 95.70, bestLapTime: 95.10, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 230, gapToPlayerSeconds: -8.00, trackSurface: 3 },
    { carIdx: 12, carNumber: "888", driverName: "R. Marciello", country: "CH", carBrand: "Audi", irating: 6720, safetyRating: { license: "A", value: 4.60 }, classPosition: 7, overallPosition: 12, lap: 2, lapDistPct: 0.04, lastLapTime: 95.90, bestLapTime: 95.20, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 228, gapToPlayerSeconds: -8.90, trackSurface: 3 },
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

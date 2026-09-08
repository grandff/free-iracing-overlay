import { settings } from "../../stores/settingsStore.ts";
import { TelemetryFrame, CarTelemetry, SystemEventKind, SectorColor, LapDeltaTelemetry } from "./types.ts";

// ponytail: lightweight 60Hz simulated telemetry generator for macOS/Linux dev without iRacing running
export class MockTelemetryEngine {
  private timer: number | null = null;
  private onTickCallback: ((frame: TelemetryFrame) => void) | null = null;
  private lapDist = 0.15;
  private currentLap = 3;
  private fuelRemaining = 42.5;
  private trackLength = 4500; // 4.5km circuit

  private simulatedCars: CarTelemetry[] = [
    { carIdx: 1, carNumber: "7", driverName: "K. Jeongmin", country: "KR", carBrand: "Porsche", irating: 6840, safetyRating: { license: "S", value: 4.98 }, classPosition: 1, overallPosition: 1, positionDelta: 0, lap: 3, lapDistPct: 0.15, lastLapTime: 84.12, bestLapTime: 83.89, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 245, gapToPlayerSeconds: 0, trackSurface: 3 },
    { carIdx: 2, carNumber: "1", driverName: "M. Verstappen", country: "NL", carBrand: "Red Bull", irating: 7850, safetyRating: { license: "P", value: 4.99 }, classPosition: 2, overallPosition: 2, positionDelta: 1, lap: 3, lapDistPct: 0.145, lastLapTime: 84.34, bestLapTime: 84.05, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 242, gapToPlayerSeconds: -0.42, trackSurface: 3 },
    { carIdx: 3, carNumber: "6", driverName: "K. Estre", country: "FR", carBrand: "Porsche", irating: 7120, safetyRating: { license: "A", value: 4.88 }, classPosition: 3, overallPosition: 3, positionDelta: -1, lap: 3, lapDistPct: 0.138, lastLapTime: 84.62, bestLapTime: 84.11, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 240, gapToPlayerSeconds: -1.02, trackSurface: 3 },
    { carIdx: 4, carNumber: "51", driverName: "A. Pier Guidi", country: "IT", carBrand: "Ferrari", irating: 6920, safetyRating: { license: "A", value: 3.95 }, classPosition: 4, overallPosition: 4, positionDelta: 2, lap: 3, lapDistPct: 0.165, lastLapTime: 84.25, bestLapTime: 84.15, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 248, gapToPlayerSeconds: +1.28, trackSurface: 3 },
    { carIdx: 5, carNumber: "24", driverName: "J. Gordon", country: "US", carBrand: "Corvette", irating: 6350, safetyRating: { license: "B", value: 3.82 }, classPosition: 5, overallPosition: 5, positionDelta: -2, lap: 3, lapDistPct: 0.115, lastLapTime: 87.80, bestLapTime: 87.35, inPit: true, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 65, gapToPlayerSeconds: -2.95, trackSurface: 1 },
    { carIdx: 6, carNumber: "911", driverName: "L. Vanthoor", country: "BE", carBrand: "Porsche", irating: 6890, safetyRating: { license: "B", value: 3.45 }, classPosition: 1, overallPosition: 6, positionDelta: 1, lap: 2, lapDistPct: 0.12, lastLapTime: 94.55, bestLapTime: 94.20, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 235, gapToPlayerSeconds: -2.55, trackSurface: 3 },
    { carIdx: 7, carNumber: "63", driverName: "M. Bortolotti", country: "IT", carBrand: "Lamborghini", irating: 6480, safetyRating: { license: "C", value: 3.75 }, classPosition: 2, overallPosition: 7, positionDelta: 0, lap: 2, lapDistPct: 0.10, lastLapTime: 94.85, bestLapTime: 94.30, inPit: true, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 0, gapToPlayerSeconds: -4.10, trackSurface: 2 },
    { carIdx: 8, carNumber: "3", driverName: "A. Garcia", country: "ES", carBrand: "Corvette", irating: 6120, safetyRating: { license: "C", value: 2.85 }, classPosition: 3, overallPosition: 8, positionDelta: -1, lap: 2, lapDistPct: 0.08, lastLapTime: 95.10, bestLapTime: 94.60, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 233, gapToPlayerSeconds: -5.60, trackSurface: 3 },
    { carIdx: 9, carNumber: "77", driverName: "M. Goetz", country: "DE", carBrand: "Mercedes", irating: 6210, safetyRating: { license: "D", value: 3.20 }, classPosition: 4, overallPosition: 9, positionDelta: 0, lap: 2, lapDistPct: 0.07, lastLapTime: 95.25, bestLapTime: 94.75, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 234, gapToPlayerSeconds: -6.20, trackSurface: 3 },
    { carIdx: 10, carNumber: "23", driverName: "T. Matsuda", country: "JP", carBrand: "Nissan", irating: 5950, safetyRating: { license: "D", value: 2.65 }, classPosition: 5, overallPosition: 10, positionDelta: 1, lap: 2, lapDistPct: 0.06, lastLapTime: 95.40, bestLapTime: 94.90, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 232, gapToPlayerSeconds: -7.10, trackSurface: 3 },
    { carIdx: 11, carNumber: "44", driverName: "L. Hamilton", country: "GB", carBrand: "Mercedes", irating: 7120, safetyRating: { license: "Rookie", value: 2.90 }, classPosition: 6, overallPosition: 11, positionDelta: -2, lap: 2, lapDistPct: 0.05, lastLapTime: 95.70, bestLapTime: 95.10, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 230, gapToPlayerSeconds: -8.00, trackSurface: 3 },
    { carIdx: 12, carNumber: "888", driverName: "R. Marciello", country: "CH", carBrand: "Audi", irating: 6720, safetyRating: { license: "Rookie", value: 2.45 }, classPosition: 7, overallPosition: 12, positionDelta: 0, lap: 2, lapDistPct: 0.04, lastLapTime: 95.90, bestLapTime: 95.20, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 228, gapToPlayerSeconds: -8.90, trackSurface: 3 },
    { carIdx: 13, carNumber: "16", driverName: "C. Leclerc", country: "MC", carBrand: "Ferrari", irating: 7420, safetyRating: { license: "P", value: 4.80 }, classPosition: 8, overallPosition: 13, positionDelta: 2, lap: 2, lapDistPct: 0.038, lastLapTime: 95.30, bestLapTime: 94.40, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 236, gapToPlayerSeconds: -9.50, trackSurface: 3 },
    { carIdx: 14, carNumber: "14", driverName: "F. Alonso", country: "ES", carBrand: "Aston Martin", irating: 7250, safetyRating: { license: "S", value: 4.60 }, classPosition: 9, overallPosition: 14, positionDelta: 1, lap: 2, lapDistPct: 0.035, lastLapTime: 95.45, bestLapTime: 94.70, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 234, gapToPlayerSeconds: -10.10, trackSurface: 3 },
    { carIdx: 15, carNumber: "4", driverName: "L. Norris", country: "GB", carBrand: "McLaren", irating: 7310, safetyRating: { license: "A", value: 4.50 }, classPosition: 10, overallPosition: 15, positionDelta: 0, lap: 2, lapDistPct: 0.032, lastLapTime: 95.50, bestLapTime: 94.80, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 235, gapToPlayerSeconds: -10.70, trackSurface: 3 },
    { carIdx: 16, carNumber: "11", driverName: "M. Wittmann", country: "DE", carBrand: "BMW", irating: 6150, safetyRating: { license: "B", value: 3.60 }, classPosition: 11, overallPosition: 16, positionDelta: -1, lap: 2, lapDistPct: 0.028, lastLapTime: 95.80, bestLapTime: 95.10, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 232, gapToPlayerSeconds: -11.30, trackSurface: 3 },
    { carIdx: 17, carNumber: "55", driverName: "C. Sainz", country: "ES", carBrand: "Ferrari", irating: 6980, safetyRating: { license: "A", value: 4.15 }, classPosition: 12, overallPosition: 17, positionDelta: 0, lap: 2, lapDistPct: 0.025, lastLapTime: 95.90, bestLapTime: 95.20, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 233, gapToPlayerSeconds: -11.90, trackSurface: 3 },
    { carIdx: 18, carNumber: "81", driverName: "O. Piastri", country: "AU", carBrand: "McLaren", irating: 6820, safetyRating: { license: "B", value: 3.90 }, classPosition: 13, overallPosition: 18, positionDelta: 2, lap: 2, lapDistPct: 0.022, lastLapTime: 96.00, bestLapTime: 95.30, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 234, gapToPlayerSeconds: -12.50, trackSurface: 3 },
    { carIdx: 19, carNumber: "70", driverName: "K. Kobayashi", country: "JP", carBrand: "Toyota", irating: 6650, safetyRating: { license: "A", value: 4.40 }, classPosition: 14, overallPosition: 19, positionDelta: -1, lap: 2, lapDistPct: 0.018, lastLapTime: 96.10, bestLapTime: 95.40, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 231, gapToPlayerSeconds: -13.10, trackSurface: 3 },
    { carIdx: 20, carNumber: "97", driverName: "S. van Gisbergen", country: "NZ", carBrand: "Ford", irating: 6540, safetyRating: { license: "A", value: 3.85 }, classPosition: 15, overallPosition: 20, positionDelta: 1, lap: 2, lapDistPct: 0.015, lastLapTime: 96.25, bestLapTime: 95.50, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 232, gapToPlayerSeconds: -13.80, trackSurface: 3 },
    { carIdx: 21, carNumber: "5", driverName: "D. Cameron", country: "US", carBrand: "Porsche", irating: 6380, safetyRating: { license: "B", value: 3.55 }, classPosition: 16, overallPosition: 21, positionDelta: 0, lap: 2, lapDistPct: 0.012, lastLapTime: 96.40, bestLapTime: 95.60, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 230, gapToPlayerSeconds: -14.50, trackSurface: 3 },
    { carIdx: 22, carNumber: "56", driverName: "H. Tincknell", country: "GB", carBrand: "Ford", irating: 6020, safetyRating: { license: "C", value: 3.10 }, classPosition: 17, overallPosition: 22, positionDelta: -2, lap: 2, lapDistPct: 0.009, lastLapTime: 96.70, bestLapTime: 95.80, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 228, gapToPlayerSeconds: -15.20, trackSurface: 3 },
    { carIdx: 23, carNumber: "98", driverName: "N. Yelloly", country: "GB", carBrand: "BMW", irating: 5890, safetyRating: { license: "D", value: 2.80 }, classPosition: 18, overallPosition: 23, positionDelta: 0, lap: 2, lapDistPct: 0.005, lastLapTime: 96.90, bestLapTime: 96.00, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 227, gapToPlayerSeconds: -16.00, trackSurface: 3 },
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

  /**
   * Derive running order from track progress (real pipeline reads CarIdxPosition /
   * CarIdxClassPosition straight from shared memory). positionDelta is measured
   * against the grid so the ▲/▼ indicator stays steady instead of flickering.
   */
  private recomputePositions() {
    const byProgress = [...this.simulatedCars].sort(
      (a, b) => b.lap + b.lapDistPct - (a.lap + a.lapDistPct)
    );
    const classSeen = new Map<string, number>();
    byProgress.forEach((c, i) => {
      c.overallPosition = i + 1;
      const inClass = (classSeen.get(c.carClass) ?? 0) + 1;
      classSeen.set(c.carClass, inClass);
      c.classPosition = inClass;
      const grid = this.gridPositions.get(c.carIdx);
      if (grid !== undefined) c.positionDelta = grid - c.overallPosition;
    });
  }

  private readonly gridPositions = new Map<number, number>(
    this.simulatedCars.map((c) => [c.carIdx, c.overallPosition])
  );

  private tick() {
    const now = Date.now();
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
        // Mock only: the seeded speed spread is ~1%, so neighbours would take ~45s
        // to swap and the preview would look frozen. Amplitude is sized against the
        // seeded grid spacing (~0.005 lapDistPct) so the running order actually
        // trades places every few seconds and exercises the reorder animation.
        // ponytail: speedKmh stays at its seeded value, so the displayed speed does
        // not track this pace wobble. Fine for a preview; the shmem reader replaces
        // this whole block with real CarIdx* arrays.
        const pace = c.speedKmh / 245 + Math.sin(now / 9000 + c.carIdx) * 0.2;
        const advanced = c.lapDistPct + deltaPct * pace;
        if (advanced >= 1.0) c.lap += 1; // was missing: only the player's lap ever counted up
        c.lapDistPct = advanced % 1.0;
        c.gapToPlayerSeconds = (c.lapDistPct - this.lapDist) * (84.0);
      }
    });

    this.recomputePositions();

    // Mock-only preview. The real reader must derive these boundaries from
    // session YAML SplitTimeInfo.Sectors[].SectorStartPct, never fixed thirds.
    const currentSector: 1 | 2 | 3 = this.lapDist < 0.33 ? 1 : this.lapDist < 0.67 ? 2 : 3;
    const dynamicDelta = -0.24 + Math.sin(now / 3500) * 0.15;

    const s1Status: SectorColor = "purple";
    const s2Status: SectorColor = this.lapDist >= 0.33 ? "green" : "none";
    const s3Status: SectorColor = this.lapDist >= 0.67 ? "yellow" : "none";

    const lapDeltaData: LapDeltaTelemetry = {
      deltaToBest: dynamicDelta,
      deltaToBestValid: true,
      deltaToLast: dynamicDelta + 0.18,
      deltaToLastValid: true,
      deltaToSessionBest: dynamicDelta + 0.35,
      deltaToSessionBestValid: true,
      lastLapTime: 84.12,
      bestLapTime: 83.89,
      currentSector,
      sectors: [
        { sectorNumber: 1, status: s1Status, deltaSeconds: -0.185, isCurrent: currentSector === 1 },
        { sectorNumber: 2, status: s2Status, deltaSeconds: -0.062, isCurrent: currentSector === 2 },
        { sectorNumber: 3, status: s3Status, deltaSeconds: 0.104, isCurrent: currentSector === 3 },
      ],
      targetMode: "best",
    };

    // Proximity spotter simulation (Car #16 is 2.8m to our left)
    const spotterLeftDist = 2.8;
    const spotterRightDist = 99.0;

    // Hazard simulation: Car #42 is spinning ahead around lapDist 0.21
    const hazardDist = Math.max(0, (0.21 - this.lapDist) * this.trackLength);
    const hasHazard = hazardDist > 0 && hazardDist < 400;

    // Radio & System Comms simulation cycle (every 24 seconds)
    const cycleSec = (Date.now() / 1000) % 24;
    let isTransmitting = false;
    const radioDriver = settings.userProfile.driverName || "K. Jeongmin";
    const radioCarNumber = settings.userProfile.carNumber || "7";
    const radioCarBrand = settings.userProfile.carBrand || "Porsche";
    let radioMessage = "";
    let radioChannel = "TEAM";

    let activeEvent: SystemEventKind = "none";
    let rawSysText = "";
    let sysDist: number | undefined = undefined;

    if (cycleSec < 6.0) {
      // Radio transmission from player / pit wall
      isTransmitting = true;
      radioMessage = "BOX THIS LAP FOR HARD TIRES. CONFIRM?";
      radioChannel = "TEAM";
    } else if (cycleSec >= 8.0 && cycleSec < 14.0) {
      // System event: Yellow flag
      activeEvent = "yellowFlag";
      rawSysText = "YELLOW FLAG - SECTOR 2 CAUTION";
      sysDist = 240;
    } else if (cycleSec >= 16.0 && cycleSec < 22.0) {
      // System event: Pit lane entry
      activeEvent = "pitEntry";
      rawSysText = "PIT LANE ENTRY - 60 KM/H LIMIT";
    }

    const frame: TelemetryFrame = {
      timestamp: performance.now(),
      tickRateHz: 60,
      trackLengthMeters: this.trackLength,
      trackName: "Spa-Francorchamps GP",
      // Real pipeline reads Sessions[SessionNum].SessionType. Until the shmem
      // reader lands, the control panel's simulator picker stands in for it.
      sessionType: settings.sessionType,
      sessionLapsTotal: 57,
      sessionLapsRemaining: 18,
      sessionTimeRemainingSec: 1512,
      player: {
        carIdx: 1,
        carNumber: "7",
        driverName: "K. Jeongmin",
        country: "KR",
        carBrand: "Porsche",
        irating: 6840,
        safetyRating: { license: "S", value: 4.98 },
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
        lastLapDelta: dynamicDelta,
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
      radio: {
        isTransmitting,
        carIdx: isTransmitting ? 1 : -1,
        radioIdx: 0,
        frequencyIdx: 1,
        channelName: radioChannel,
        driverName: radioDriver,
        carNumber: radioCarNumber,
        carBrand: radioCarBrand,
        isPlayer: true,
        messageText: radioMessage,
      },
      systemMessage: {
        activeEvent,
        rawText: rawSysText,
        distanceMeters: sysDist,
        timestamp: performance.now(),
      },
      lapDelta: lapDeltaData,
    };

    if (this.onTickCallback) {
      this.onTickCallback(frame);
    }
  }
}

export const mockEngine = new MockTelemetryEngine();

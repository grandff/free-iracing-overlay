import { settings } from "../../stores/settingsStore.ts";
import type {
  TelemetryFrame,
  CarTelemetry,
  SectorColor,
  SectorStatus,
  LapDeltaTelemetry,
  PitLaneTelemetry,
  PlayerTelemetry,
  WeatherTelemetry,
  SpotterState,
  SkiesState,
  SystemEventKind,
} from "./types.ts";
import { IRSDK_FLAGS } from "./types.ts";
import {
  CarLeftRight,
  CarSpeedTracker,
  FuelPerLapTracker,
  detectHazardAhead,
  distanceToPitStall,
  fuelStrategy,
  remainingLaps,
  spotterSides,
} from "./derive.ts";
import { calculateSOF, calculateEloChanges } from "./iratingCalculator.ts";

// ponytail: lightweight 60Hz simulated telemetry generator for macOS/Linux dev without iRacing running
export class MockTelemetryEngine {
  private timer: number | null = null;
  private onTickCallback: ((frame: TelemetryFrame) => void) | null = null;
  private lapDist = 0.15;
  private currentLap = 3;
  private fuelRemaining = 42.5;
  private trackLength = 4500; // 4.5km circuit

  // The mock produces RAW SDK-shaped values; every derived number the widgets
  // show comes back out of derive.ts, exactly as the shmem reader will do (M5.2).
  private readonly fuelTracker = new FuelPerLapTracker();
  private readonly carSpeeds = new CarSpeedTracker();
  /** Session YAML DriverInfo.DriverCarFuelMaxLtr / DriverCarMaxFuelPct. */
  private readonly driverCarFuelMaxLtr = 110;
  private readonly driverCarMaxFuelPct = 1.0;

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

  // Cache calculations that do not change at 60Hz
  private readonly cachedSof: number = calculateSOF(this.simulatedCars.map((c) => c.irating));
  private lastPositionsKey = "";
  private cachedEloResults = new Map<number, any>();
  private readonly classSeenMap = new Map<string, number>();

  // Persistent sub-objects to avoid 1,500+ heap allocations per second at 60Hz
  private readonly cachedWeather: WeatherTelemetry = {
    airTempC: 22.4,
    trackTempC: 34.8,
    windSpeedKmh: 14.2,
    windDirDeg: 65,
    windDirRad: 65 * (Math.PI / 180),
    trackWetnessPct: 0,
    relativeHumidityPct: 58,
    fogLevelPct: 0,
    skies: 1 as SkiesState, // partly cloudy
    weatherType: 1, // dynamic Tempest
    weatherVersion: 2,
    trackWetness: 1, // irsdk_TrackWetness_Dry
    precipitationPct: 0,
    airPressureHg: 29.92,
    airDensity: 1.198,
  };

  private readonly cachedMulticlass = {
    hasApproachingFastCar: false,
    carClass: "Hypercar",
    carNumber: "1",
    gapSeconds: 0,
  };

  private readonly cachedSpotter: {
    leftState: SpotterState;
    rightState: SpotterState;
    carLeftRight: number;
  } = {
    leftState: "clear",
    rightState: "clear",
    carLeftRight: 1,
  };

  private readonly cachedShiftLight = {
    rpm: 0,
    gear: 0,
    speedKmh: 0,
    firstRpm: 10500,
    shiftRpm: 12000,
    lastRpm: 12400,
    blinkRpm: 12500,
    pitLimiterActive: false,
    revLimiterActive: false,
  };

  private readonly cachedRadio = {
    isTransmitting: false,
    carIdx: -1,
    radioIdx: 0,
    frequencyIdx: 1,
    channelName: "TEAM",
    driverName: "K. Jeongmin",
    carNumber: "7",
    carBrand: "Porsche",
    isPlayer: true,
    messageText: "",
  };

  private readonly cachedSystemMessage = {
    activeEvent: "none" as SystemEventKind,
    rawText: "",
    distanceMeters: undefined as number | undefined,
    timestamp: 0,
  };

  private readonly cachedPlayer: PlayerTelemetry = {
    carIdx: 1,
    carNumber: "7",
    driverName: "K. Jeongmin",
    country: "KR",
    carBrand: "Porsche",
    irating: 6840,
    projectedIratingGain: 38,
    safetyRating: { license: "S", value: 4.98 },
    speedKmh: 245,
    rpm: 11000,
    gear: 4,
    fuelLevelLiters: 42.5,
    lap: 3,
    onPitRoad: false,
    lastLapTime: 84.12,
    bestLapTime: 83.89,
    lastLapDelta: -0.24,
    incidents: 4,
    tirePressurePsi: [28.5, 28.6, 28.2, 28.3],
    tireWearPct: [94, 91, 96, 93],
    tireSurfaceLoadPct: [68, 74, 62, 65],
    tireTempC: [88.5, 89.2, 85.1, 86.4],
  };

  private readonly cachedRevenge = {
    hasTarget: true,
    targetCarIdx: 2,
    driverName: "M. Verstappen",
    carNumber: "1",
    country: "NL",
    carBrand: "Red Bull",
    position: 2,
    gapSeconds: -0.42,
    incidentCount: 4,
    incidentTimestamp: Date.now() - 45_000,
    lapDistPct: 0.145,
    avgLapTime: 84.22,
    lastLapDelta: 0.22,
    targetLastLapTime: 84.34,
    playerLastLapTime: 84.12,
  };

  private readonly sortBuffer: CarTelemetry[] = [];

  private readonly cachedSectors: [SectorStatus, SectorStatus, SectorStatus] = [
    { sectorNumber: 1 as const, status: "purple" as SectorColor, deltaSeconds: -0.185, isCurrent: true },
    { sectorNumber: 2 as const, status: "green" as SectorColor, deltaSeconds: -0.062, isCurrent: false },
    { sectorNumber: 3 as const, status: "yellow" as SectorColor, deltaSeconds: 0.104, isCurrent: false },
  ];

  private readonly cachedLapDelta: LapDeltaTelemetry = {
    deltaToBest: -0.24,
    deltaToBestValid: true,
    deltaToLast: -0.06,
    deltaToLastValid: true,
    deltaToSessionBest: 0.11,
    deltaToSessionBestValid: true,
    lastLapTime: 84.12,
    bestLapTime: 83.89,
    currentSector: 1,
    sectors: this.cachedSectors,
    targetMode: "best",
  };

  private readonly cachedPitLane: PitLaneTelemetry = {
    onPitRoad: false,
    inPitStall: false,
    approachingPits: false,
    pitSpeedLimitKmh: 60,
    distanceToStallMeters: undefined,
    pitRepairRemainingSec: 0,
    limiterActive: false,
  };

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
  private recomputePositions(): boolean {
    this.sortBuffer.length = 0;
    for (let i = 0; i < this.simulatedCars.length; i++) {
      this.sortBuffer.push(this.simulatedCars[i]);
    }
    this.sortBuffer.sort(
      (a, b) => b.lap + b.lapDistPct - (a.lap + a.lapDistPct)
    );
    this.classSeenMap.clear();
    let positionsChanged = false;

    for (let i = 0; i < this.sortBuffer.length; i++) {
      const c = this.sortBuffer[i];
      const overall = i + 1;
      const inClass = (this.classSeenMap.get(c.carClass) ?? 0) + 1;
      this.classSeenMap.set(c.carClass, inClass);

      if (c.overallPosition !== overall || c.classPosition !== inClass) {
        c.overallPosition = overall;
        c.classPosition = inClass;
        positionsChanged = true;
      }
      const grid = this.gridPositions.get(c.carIdx);
      if (grid !== undefined) c.positionDelta = grid - c.overallPosition;
    }
    return positionsChanged;
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

    // Mock-only preview. The real reader must derive these boundaries from
    // session YAML SplitTimeInfo.Sectors[].SectorStartPct, never fixed thirds.
    const currentSector: 1 | 2 | 3 = this.lapDist < 0.33 ? 1 : this.lapDist < 0.67 ? 2 : 3;
    const dynamicDelta = -0.24 + Math.sin(now / 3500) * 0.15;

    const s1Status: SectorColor = "purple";
    const s2Status: SectorColor = this.lapDist >= 0.33 ? "green" : "none";
    const s3Status: SectorColor = this.lapDist >= 0.67 ? "yellow" : "none";

    this.cachedSectors[0].status = s1Status;
    this.cachedSectors[0].isCurrent = currentSector === 1;
    this.cachedSectors[1].status = s2Status;
    this.cachedSectors[1].isCurrent = currentSector === 2;
    this.cachedSectors[2].status = s3Status;
    this.cachedSectors[2].isCurrent = currentSector === 3;

    this.cachedLapDelta.deltaToBest = dynamicDelta;
    this.cachedLapDelta.deltaToLast = dynamicDelta + 0.18;
    this.cachedLapDelta.deltaToSessionBest = dynamicDelta + 0.35;
    this.cachedLapDelta.currentSector = currentSector;

    // CarLeftRight is the raw enum the SDK publishes. 20s cycle:
    // clear -> car left -> two left -> car right -> both sides -> clear.
    const spotterCycle = (Date.now() / 1000) % 20;
    const carLeftRight =
      spotterCycle < 3
        ? CarLeftRight.Clear
        : spotterCycle < 7
        ? CarLeftRight.CarLeft
        : spotterCycle < 10.5
        ? CarLeftRight.TwoCarsLeft
        : spotterCycle < 14
        ? CarLeftRight.CarRight
        : spotterCycle < 17
        ? CarLeftRight.CarLeftRight
        : CarLeftRight.Clear;

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

    // Gear & RPM simulation: realistic acceleration cycle
    const cycleMs = 4000;
    const cyclePhase = (Date.now() % cycleMs) / cycleMs; // 0.0 ~ 1.0
    const playerRpm = Math.round(9800 + Math.pow(cyclePhase, 0.8) * (12700 - 9800));
    const gearNum = 4 + (Math.floor(Date.now() / cycleMs) % 3); // cycles 4 -> 5 -> 6
    const playerSpeed = Math.round(220 + gearNum * 20 + cyclePhase * 25);
    const isPitLimiter = activeEvent === "pitEntry";
    const isRevLimiter = playerRpm >= 12500;

    // SessionFlags dynamic simulation (40s cycle)
    const flagCycle = (Date.now() / 1000) % 40;
    let sessionFlags: number = IRSDK_FLAGS.green;
    if (flagCycle >= 20 && flagCycle < 27) {
      sessionFlags = IRSDK_FLAGS.yellow | IRSDK_FLAGS.yellowWaving;
    } else if (flagCycle >= 27 && flagCycle < 32) {
      sessionFlags = IRSDK_FLAGS.blue;
    } else if (flagCycle >= 32 && flagCycle < 40) {
      sessionFlags = IRSDK_FLAGS.checkered;
    }

    const pitLaneActive = (Date.now() / 1000) % 50 >= 35 && (Date.now() / 1000) % 50 < 48;

    // #51 loses it and beaches itself ahead of the player for 8s of every 30.
    // Only the raw CarIdx* state is faked here — detectHazardAhead does the real
    // work of deciding whether that counts as an incident worth warning about.
    const incidentCar = this.simulatedCars[3]; // carIdx 4 is at index 3
    if (incidentCar) {
      if ((Date.now() / 1000) % 30 < 8) {
        incidentCar.lapDistPct = (this.lapDist + 0.03) % 1.0; // beached ~135m ahead
        incidentCar.trackSurface = 0; // irsdk_OffTrack
      } else if (incidentCar.trackSurface === 0) {
        incidentCar.trackSurface = 3; // irsdk_OnTrack — recovered
      }
    }
    for (const c of this.simulatedCars) {
      this.carSpeeds.update(c.carIdx, c.lapDistPct, this.trackLength, now);
    }

    const spotterState = spotterSides({
      carLeftRight,
      cars: this.simulatedCars,
      playerCarIdx: 1,
      playerLapDistPct: this.lapDist,
      trackLengthM: this.trackLength,
    });

    const hazard = detectHazardAhead({
      cars: this.simulatedCars,
      playerCarIdx: 1,
      playerLapDistPct: this.lapDist,
      trackLengthM: this.trackLength,
      sessionFlags,
      speedsKmh: this.carSpeeds.speedKmh,
    });

    // Fuel: raw SDK inputs in, plan out. FuelLevel deltas across clean green laps
    // are the per-lap burn — FuelUsePerHour (kg/h, instantaneous) cannot give it.
    this.fuelTracker.update(this.currentLap, this.fuelRemaining, pitLaneActive, sessionFlags);
    const sessionLapsTotal = 57;
    const sessionTimeRemainingSec = 1512;
    const fuel = fuelStrategy({
      fuelLevel: this.fuelRemaining,
      fuelMaxLtr: this.driverCarFuelMaxLtr,
      maxFuelPct: this.driverCarMaxFuelPct,
      lapsRemaining: remainingLaps(sessionLapsTotal, 18, sessionTimeRemainingSec, 84.12),
      avgPerLap: this.fuelTracker.average || 2.35, // seeded until a clean lap completes
      pitSvFuel: 22, // PitSvFuel, as set in the in-game F4 black box
      fuelFillChecked: true, // PitSvFlags & irsdk_FuelFill
      currentLap: this.currentLap,
    });

    // Pit lane, 50s cycle. Only the raw state is faked; the stall countdown comes
    // out of the same derivation the shmem reader will use.
    const pitCycle = (Date.now() / 1000) % 50;
    const isPitActive = pitLaneActive;
    // YAML DriverInfo.DriverPitTrkPct — where this driver's box sits on the lap.
    const driverPitTrkPct = 0.02;
    const pitDist = distanceToPitStall(this.lapDist, isPitActive ? driverPitTrkPct : undefined, this.trackLength);
    this.cachedPitLane.onPitRoad = isPitActive;
    this.cachedPitLane.inPitStall = pitDist !== undefined && pitDist <= 1.0;
    this.cachedPitLane.approachingPits = pitCycle >= 30 && pitCycle < 35;
    this.cachedPitLane.distanceToStallMeters = pitDist !== undefined ? Math.round(pitDist * 10) / 10 : undefined;
    this.cachedPitLane.limiterActive = isPitActive || isPitLimiter;

    // Calculate real-time ELO changes only when running order actually changes
    const positionsChanged = this.recomputePositions();
    if (positionsChanged || this.lastPositionsKey === "") {
      this.lastPositionsKey = this.simulatedCars.map((c) => c.classPosition).join(",");
      const eloInputs = this.simulatedCars.map((c) => ({
        carIdx: c.carIdx,
        irating: c.irating,
        finishPosition: c.classPosition,
        started: true,
      }));
      this.cachedEloResults = calculateEloChanges(eloInputs);
      for (const car of this.simulatedCars) {
        const res = this.cachedEloResults.get(car.carIdx);
        if (res) {
          car.projectedIratingGain = res.iratingChange;
        }
      }
    }

    const playerElo = this.cachedEloResults.get(1);
    const playerGain = playerElo?.iratingChange ?? 38;

    // Connect Revenge Target to simulated competitor #2 (M. Verstappen)
    const targetCar = this.simulatedCars.find((c) => c.carIdx === 2) || this.simulatedCars[1];
    const playerLastLap = 84.12;
    const targetLastLap = targetCar?.lastLapTime ?? 84.34;
    const lastLapDelta = Number((targetLastLap - playerLastLap).toFixed(2));

    this.cachedRevenge.targetCarIdx = targetCar?.carIdx ?? 2;
    this.cachedRevenge.driverName = targetCar?.driverName ?? "M. Verstappen";
    this.cachedRevenge.carNumber = targetCar?.carNumber ?? "1";
    this.cachedRevenge.country = targetCar?.country ?? "NL";
    this.cachedRevenge.carBrand = targetCar?.carBrand ?? "Red Bull";
    this.cachedRevenge.position = targetCar?.classPosition ?? 2;
    this.cachedRevenge.gapSeconds = targetCar?.gapToPlayerSeconds ?? -0.42;
    this.cachedRevenge.lapDistPct = targetCar?.lapDistPct ?? 0.145;
    this.cachedRevenge.lastLapDelta = lastLapDelta;
    this.cachedRevenge.targetLastLapTime = targetLastLap;
    this.cachedRevenge.playerLastLapTime = playerLastLap;

    // Update persistent player
    this.cachedPlayer.speedKmh = playerSpeed;
    this.cachedPlayer.rpm = playerRpm;
    this.cachedPlayer.gear = gearNum;
    this.cachedPlayer.fuelLevelLiters = this.fuelRemaining;
    this.cachedPlayer.lap = this.currentLap;
    this.cachedPlayer.onPitRoad = pitLaneActive;
    this.cachedPlayer.lastLapDelta = dynamicDelta;
    this.cachedPlayer.projectedIratingGain = playerGain;

    // Update persistent spotter
    this.cachedSpotter.leftState = spotterState.left;
    this.cachedSpotter.rightState = spotterState.right;
    this.cachedSpotter.carLeftRight = carLeftRight;

    // Update persistent shiftLight
    this.cachedShiftLight.rpm = playerRpm;
    this.cachedShiftLight.gear = gearNum;
    this.cachedShiftLight.speedKmh = playerSpeed;
    this.cachedShiftLight.pitLimiterActive = isPitLimiter;
    this.cachedShiftLight.revLimiterActive = isRevLimiter;

    // Update persistent radio & system message
    this.cachedRadio.isTransmitting = isTransmitting;
    this.cachedRadio.carIdx = isTransmitting ? 1 : -1;
    this.cachedRadio.channelName = radioChannel;
    this.cachedRadio.driverName = radioDriver;
    this.cachedRadio.carNumber = radioCarNumber;
    this.cachedRadio.carBrand = radioCarBrand;
    this.cachedRadio.messageText = radioMessage;

    this.cachedSystemMessage.activeEvent = activeEvent;
    this.cachedSystemMessage.rawText = rawSysText;
    this.cachedSystemMessage.distanceMeters = sysDist;
    this.cachedSystemMessage.timestamp = now;

    const frame: TelemetryFrame = {
      timestamp: now,
      tickRateHz: 60,
      trackLengthMeters: this.trackLength,
      trackName: "Spa-Francorchamps GP",
      // Real pipeline reads Sessions[SessionNum].SessionType. Until the shmem
      // reader lands, the control panel's simulator picker stands in for it.
      sessionType: settings.sessionType,
      sessionLapsTotal,
      sessionLapsRemaining: fuel.lapsRemaining,
      sessionTimeRemainingSec,
      sessionFlags,
      sof: this.cachedSof,
      projectedIratingGain: playerGain,
      player: { ...this.cachedPlayer },
      fuel,
      cars: this.simulatedCars.map((c) => ({ ...c })),
      spotter: { ...this.cachedSpotter },
      hazard,
      revenge: { ...this.cachedRevenge },
      weather: { ...this.cachedWeather },
      multiclass: { ...this.cachedMulticlass },
      radio: { ...this.cachedRadio },
      systemMessage: { ...this.cachedSystemMessage },
      lapDelta: {
        ...this.cachedLapDelta,
        sectors: [
          { ...this.cachedSectors[0] },
          { ...this.cachedSectors[1] },
          { ...this.cachedSectors[2] },
        ],
      },
      shiftLight: { ...this.cachedShiftLight },
      pitLane: { ...this.cachedPitLane },
    };

    if (this.onTickCallback) {
      this.onTickCallback(frame);
    }
  }
}

export const mockEngine = new MockTelemetryEngine();

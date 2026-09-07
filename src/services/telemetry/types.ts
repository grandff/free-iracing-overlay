// ponytail: strongly-typed, minimal memory footprint telemetry data structures

export type LicenseClass = "R" | "D" | "C" | "B" | "A" | "P";

export interface SafetyRating {
  license: LicenseClass;
  value: number; // e.g. 4.82
}

export interface CarTelemetry {
  carIdx: number;
  carNumber: string;
  driverName: string;
  country: string; // e.g. "KR", "US", "NL", "GB", "DE", "FR", "IT", "JP", "ES"
  carBrand: string; // e.g. "Porsche", "Ferrari", "BMW", "Mercedes", "McLaren", "Aston Martin", "Audi"
  irating: number; // e.g. 6240
  safetyRating: SafetyRating; // e.g. { license: "A", value: 4.82 }
  classPosition: number;
  overallPosition: number;
  lap: number;
  lapDistPct: number; // 0.0 to 1.0 (longitudinal position on track)
  lastLapTime: number; // in seconds
  bestLapTime: number;
  inPit: boolean;
  carClass: "Hypercar" | "LMP2" | "GT3";
  carClassColor: string;
  speedKmh: number;
  gapToPlayerSeconds: number;
  trackSurface: number; // 0 = not on track, 1 = off track, 2 = pit stall, 3 = on track
}

export interface PlayerTelemetry {
  carIdx: number;
  carNumber: string;
  driverName: string;
  speedKmh: number;
  rpm: number;
  gear: number;
  fuelLevelLiters: number;
  fuelMaxLiters: number;
  fuelAvgPerLap: number;
  fuelLapsRemaining: number;
  fuelNeededToFinish: number;
  lastLapTime: number;
  bestLapTime: number;
  lastLapDelta: number; // positive = slower, negative = faster
  incidents: number;
  tirePressurePsi: [number, number, number, number]; // LF, RF, LR, RR
  tireWearPct: [number, number, number, number]; // LF, RF, LR, RR
  tireSurfaceLoadPct: [number, number, number, number]; // Estimated dynamic load (0~100)
}

export interface SpotterTelemetry {
  leftDistanceMeters: number; // > 5 means clear
  rightDistanceMeters: number;
  leftState: "clear" | "caution" | "danger";
  rightState: "clear" | "caution" | "danger";
}

export interface HazardTelemetry {
  hasIncident: boolean;
  distanceMeters: number;
  incidentCarNumber: string;
  incidentSector: number;
}

export interface RevengeTelemetry {
  hasTarget: boolean;
  driverName: string;
  carNumber: string;
  gapSeconds: number;
  incidentCount: number;
}

export interface WeatherTelemetry {
  airTempC: number;
  trackTempC: number;
  windSpeedKmh: number;
  windDirDeg: number; // 0~360
  trackWetnessPct: number; // 0~100
  precipitationPct: number;
}

export interface MulticlassTelemetry {
  hasApproachingFastCar: boolean;
  carClass: string;
  carNumber: string;
  gapSeconds: number;
}

export interface TelemetryFrame {
  timestamp: number;
  tickRateHz: number;
  trackLengthMeters: number;
  trackName: string;
  sessionLapsRemaining: number;
  sessionTimeRemainingSec: number;
  player: PlayerTelemetry;
  cars: CarTelemetry[];
  spotter: SpotterTelemetry;
  hazard: HazardTelemetry;
  revenge: RevengeTelemetry;
  weather: WeatherTelemetry;
  multiclass: MulticlassTelemetry;
}

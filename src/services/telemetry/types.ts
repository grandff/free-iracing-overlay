// ponytail: strongly-typed, minimal memory footprint telemetry data structures

export type LicenseClass = "S" | "A" | "B" | "C" | "D" | "Rookie" | "R" | "P";

/**
 * Session kind. Read from the session YAML, never chosen by the user:
 *   SessionInfo.Sessions[SessionNum].SessionType -> "Practice" | "Open Qualify"
 *   | "Lone Qualify" | "Race" | "Warmup"
 */
export type SessionType = "PRACTICE" | "QUALIFY" | "RACE";

export interface SafetyRating {
  license: LicenseClass;
  value: number; // e.g. 4.82
}

export interface CarTelemetry {
  carIdx: number; // Index in 64-car arrays (CarIdx*)
  carNumber: string; // Session YAML: DriverInfo.Drivers[carIdx].CarNumber
  driverName: string; // Session YAML: DriverInfo.Drivers[carIdx].UserName
  country: string; // Session YAML: DriverInfo.Drivers[carIdx].ClubName / CountryCode
  carBrand: string; // Session YAML: DriverInfo.Drivers[carIdx].CarScreenName / CarPath
  irating: number; // Session YAML: DriverInfo.Drivers[carIdx].IRating
  safetyRating: SafetyRating; // Session YAML: DriverInfo.Drivers[carIdx].LicString / LicSubLevel
  classPosition: number; // Telemetry: CarIdxClassPosition (int[64])
  overallPosition: number; // Telemetry: CarIdxPosition (int[64])
  positionDelta?: number; // Position change relative to grid/previous lap: +N, -N, 0
  lap: number; // Telemetry: CarIdxLap (int[64])
  lapDistPct: number; // Telemetry: CarIdxLapDistPct (float[64], 0.0 to 1.0)
  lastLapTime: number; // Telemetry: CarIdxLastLapTime (float[64], seconds)
  bestLapTime: number; // Telemetry: CarIdxBestLapTime (float[64], seconds)
  inPit: boolean; // Telemetry: CarIdxOnPitRoad (bool[64])
  carClass: "Hypercar" | "LMP2" | "GT3"; // Telemetry: CarIdxClass (int[64])
  carClassColor: string; // Session YAML: DriverInfo.Drivers[carIdx].CarClassColor
  speedKmh: number; // Telemetry: Speed * 3.6 (m/s to km/h)
  gapToPlayerSeconds: number; // Telemetry: CarIdxEstTime[carIdx] - CarIdxEstTime[player]
  trackSurface: number; // Telemetry: CarIdxTrackSurface (irsdk_TrackSurface: 0=OffTrack, 1=InPitLane, 2=PitStall, 3=OnTrack)
}

export interface PlayerTelemetry {
  carIdx: number;
  carNumber: string;
  driverName: string;
  country: string; // e.g. "KR", "US", "DE"
  carBrand: string; // e.g. "Porsche", "Ferrari"
  irating?: number;
  safetyRating?: SafetyRating;
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

export interface RadioTelemetry {
  isTransmitting: boolean;
  carIdx: number; // RadioTransmitCarIdx: -1 when quiet, 0..63 when someone is speaking
  radioIdx: number; // RadioTransmitRadioIdx
  frequencyIdx: number; // RadioTransmitFrequencyIdx
  channelName: string; // e.g. "TEAM", "DRIVERS", "CLUB"
  driverName: string;
  carNumber: string;
  carBrand: string;
  isPlayer: boolean;
  messageText?: string;
}

export type SystemEventKind =
  | "none"
  | "yellowFlag"
  | "blueFlag"
  | "meatballFlag"
  | "blackFlag"
  | "disqualified"
  | "checkeredFlag"
  | "pitEntry"
  | "pitExit"
  | "pitComplete"
  | "hazardAhead";

export interface SystemMessageTelemetry {
  activeEvent: SystemEventKind;
  rawText: string; // Official original English verbatim: "YELLOW FLAG", "PIT ENTRY", etc.
  distanceMeters?: number;
  timestamp: number;
}

export type SectorColor = "none" | "yellow" | "green" | "purple";

export interface SectorStatus {
  sectorNumber: 1 | 2 | 3;
  status: SectorColor;
  deltaSeconds?: number;
  isCurrent?: boolean;
}

export interface LapDeltaTelemetry {
  deltaToBest: number; // LapDeltaToBestLap (s)
  deltaToBestValid: boolean; // LapDeltaToBestLap_OK
  deltaToLast: number; // LapDeltaToSessionLastlLap (s)
  deltaToLastValid: boolean; // LapDeltaToSessionLastlLap_OK
  deltaToSessionBest?: number; // LapDeltaToSessionBestLap (s)
  deltaToSessionBestValid?: boolean; // LapDeltaToSessionBestLap_OK
  lastLapTime: number; // LapLastLapTime
  bestLapTime: number; // LapBestLapTime
  currentSector: 1 | 2 | 3;
  sectors: [SectorStatus, SectorStatus, SectorStatus];
  targetMode: "best" | "last";
}

export interface TelemetryFrame {
  timestamp: number;
  tickRateHz: number;
  trackLengthMeters: number;
  trackName: string;
  sessionType: SessionType; // Session YAML: Sessions[SessionNum].SessionType
  sessionLapsTotal: number; // Session YAML: SessionLaps ("unlimited" -> 0)
  sessionLapsRemaining: number;
  sessionTimeRemainingSec: number;
  player: PlayerTelemetry;
  cars: CarTelemetry[];
  spotter: SpotterTelemetry;
  hazard: HazardTelemetry;
  revenge: RevengeTelemetry;
  weather: WeatherTelemetry;
  multiclass: MulticlassTelemetry;
  radio: RadioTelemetry;
  systemMessage: SystemMessageTelemetry;
  lapDelta: LapDeltaTelemetry;
}

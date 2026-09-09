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
  projectedIratingGain?: number; // Real-time expected iRating change based on current running rank
}

export interface PlayerTelemetry {
  carIdx: number;
  carNumber: string;
  driverName: string;
  country: string; // e.g. "KR", "US", "DE"
  carBrand: string; // e.g. "Porsche", "Ferrari"
  irating?: number;
  projectedIratingGain?: number; // Player's real-time expected iRating change
  safetyRating?: SafetyRating;
  speedKmh: number;
  rpm: number;
  gear: number;
  fuelLevelLiters: number; // Telemetry: FuelLevel (L). Everything derived from it lives in TelemetryFrame.fuel.
  lap: number; // Telemetry: CarIdxLap for the player
  onPitRoad: boolean; // Telemetry: OnPitRoad
  lastLapTime: number;
  bestLapTime: number;
  lastLapDelta: number; // positive = slower, negative = faster
  incidents: number;
  tirePressurePsi: [number, number, number, number]; // LF, RF, LR, RR
  tireWearPct: [number, number, number, number]; // LF, RF, LR, RR
  tireSurfaceLoadPct: [number, number, number, number]; // Estimated dynamic load (0~100)
  tireTempC: [number, number, number, number]; // LF, RF, LR, RR
}

/** Amber caution (a car alongside) vs red alert (two cars, or door-to-door). */
export interface FuelPlan {
  level: number;
  usableMax: number; // tank capped by the series max-fuel rule
  tankPct: number;
  avgPerLap: number; // raw measured burn (0 until a clean lap completes)
  perLapEstimate: number; // avgPerLap * FUEL_ESTIMATE_FACTOR
  lapsOnFuel: number; // -1 while the burn is still unknown
  lapsRemaining: number; // -1 when the session cannot say
  toFinish: number; // extra litres still needed, 0 when the load reaches the flag
  saveTargetPerLap: number; // burn rate that removes the stop entirely
  saveDelta: number; // how much per lap must come off the current rate
  boxFuel: number; // PitSvFuel
  fuelFillChecked: boolean;
  /** iRon's warning: the black box will not put in what the race needs. */
  boxUnderfilled: boolean;
  pitWindowOpenLap: number; // -1 until laps and burn are both known
  pitWindowCloseLap: number;
  pitLossSeconds: number; // ESTIMATE, see PIT_TRANSIT_SEC
}

export type SpotterState = "clear" | "warning" | "danger";

export interface SpotterTelemetry {
  leftState: SpotterState;
  rightState: SpotterState;
  /**
   * Telemetry: CarLeftRight (irsdk_CarLeftRight). A 7-value ENUM, not a bitfield,
   * and the only signal that says WHICH side has company. It carries no gap, so
   * severity is measured off CarIdxLapDistPct instead (see derive.ts).
   */
  carLeftRight: number;
}

export type HazardType = "offTrack" | "stopped" | "spin" | "collision" | "yellowFlag";

export interface HazardTelemetry {
  hasIncident: boolean;
  distanceMeters: number;
  incidentCarNumber: string;
  incidentSector: number;
  incidentLapDistPct?: number; // Normalized track position (0.0~1.0) of the incident
  hazardType?: HazardType;
  speedKmh?: number; // Speed of the crashed/spinning car
}

export interface RevengeTelemetry {
  hasTarget: boolean;
  targetCarIdx?: number;
  driverName: string;
  carNumber: string;
  country?: string; // Country code, e.g. "NL", "DE", "KR"
  carBrand?: string; // e.g. "Red Bull", "Ferrari", "Porsche"
  position?: number; // Target's current position (e.g. 2 -> P2)
  gapSeconds: number; // Gap/Interval to player in seconds (+ ahead, - behind)
  incidentCount: number; // Incident count (+4x, +2x)
  incidentTimestamp?: number; // Timestamp (ms) when incident occurred
  lapDistPct?: number; // Target's track normalized position (0.0~1.0) for minimap crosshair
  avgLapTime?: number; // Target's average lap time (seconds)
  lastLapDelta?: number; // target.lastLapTime - player.lastLapTime (seconds)
  targetLastLapTime?: number; // Target's last lap time
  playerLastLapTime?: number; // Player's last lap time
}

export type TrackWetnessLevel =
  | 0 // irsdk_TrackWetness_UNKNOWN
  | 1 // irsdk_TrackWetness_Dry
  | 2 // irsdk_TrackWetness_MostlyDry
  | 3 // irsdk_TrackWetness_VeryLightlyWet
  | 4 // irsdk_TrackWetness_LightlyWet
  | 5 // irsdk_TrackWetness_ModeratelyWet
  | 6 // irsdk_TrackWetness_VeryWet
  | 7; // irsdk_TrackWetness_ExtremelyWet

export type SkiesState =
  | 0 // clear
  | 1 // partly cloudy
  | 2 // mostly cloudy
  | 3; // overcast

export interface WeatherTelemetry {
  airTempC: number; // AirTemp (°C)
  trackTempC: number; // TrackTempCrew (°C)
  windSpeedKmh: number; // WindVel (m/s * 3.6 -> km/h)
  windDirDeg: number; // WindDir (rad * 180 / PI -> 0~360°)
  windDirRad?: number; // WindDir (rad)
  trackWetnessPct?: number; // 0~100 legacy %
  relativeHumidityPct?: number; // RelativeHumidity (%)
  fogLevelPct?: number; // FogLevel (%)
  skies?: SkiesState; // Skies (0..3)
  weatherType?: number; // WeatherType (0=constant, 1=dynamic Tempest)
  weatherVersion?: number; // WeatherVersion
  trackWetness?: TrackWetnessLevel; // TrackWetness enum (0..7)
  precipitationPct?: number; // Precipitation (0..100 %)
  airPressureHg?: number; // AirPressure (Hg)
  airDensity?: number; // AirDensity (kg/m^3)
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

export interface ShiftLightTelemetry {
  rpm: number; // 60Hz Telemetry: RPM
  gear: number | string; // 60Hz Telemetry: Gear (-1=R, 0=N, 1..8)
  speedKmh: number; // 60Hz Telemetry: Speed * 3.6
  firstRpm: number; // YAML: DriverInfo.DriverCarSLFirstRPM
  shiftRpm: number; // YAML: DriverInfo.DriverCarSLShiftRPM
  lastRpm: number; // YAML: DriverInfo.DriverCarSLLastRPM
  blinkRpm: number; // YAML: DriverInfo.DriverCarSLBlinkRPM
  pitLimiterActive: boolean; // Telemetry: EngineWarnings & 0x10 (irsdk_pitSpeedLimiter)
  revLimiterActive: boolean; // Telemetry: EngineWarnings & 0x20 (irsdk_revLimiterActive)
}

export const IRSDK_FLAGS = {
  checkered: 0x00000001,
  white: 0x00000002,
  green: 0x00000004,
  yellow: 0x00000008,
  red: 0x00000010,
  blue: 0x00000020,
  debris: 0x00000040,
  yellowWaving: 0x00000100,
  caution: 0x00004000,
  black: 0x00010000,
  disqualify: 0x00020000,
  repair: 0x00100000, // Meatball flag
  startGo: 0x80000000,
} as const;

export interface PitLaneTelemetry {
  onPitRoad: boolean; // Telemetry: OnPitRoad
  inPitStall: boolean; // CarIdxTrackSurface === irsdk_InPitStall
  approachingPits: boolean; // CarIdxTrackSurface === irsdk_AproachingPits
  pitSpeedLimitKmh: number; // e.g. 60 or 80 km/h
  distanceToStallMeters?: number; // derive.ts distanceToPitStall(); undefined until the YAML gives a stall
  pitRepairRemainingSec?: number; // PitRepairLeft (s)
  limiterActive: boolean; // EngineWarnings & 0x10
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
  sessionFlags: number; // 60Hz Telemetry: SessionFlags (bitfield irsdk_Flags)
  player: PlayerTelemetry;
  /** Derived in derive.ts from FuelLevel / SessionLapsRemainEx / PitSvFuel. */
  fuel: FuelPlan;
  cars: CarTelemetry[];
  spotter: SpotterTelemetry;
  hazard: HazardTelemetry;
  revenge: RevengeTelemetry;
  weather: WeatherTelemetry;
  multiclass: MulticlassTelemetry;
  radio: RadioTelemetry;
  systemMessage: SystemMessageTelemetry;
  lapDelta: LapDeltaTelemetry;
  shiftLight?: ShiftLightTelemetry;
  pitLane?: PitLaneTelemetry;
  sof?: number; // Strength of Field (iRacing official exponential calculation)
  projectedIratingGain?: number; // Player's estimated iRating change (+/-)
}

/**
 * Pure derivations from raw iRacing SDK values.
 *
 * Ported from iRon (github.com/lespalt/iRon, OverlaySpotter.h / OverlayDDU.h /
 * OverlayIncident.h) — a shipping C++ overlay whose fuel and spotter maths are
 * already proven against the real sim. The mock generator feeds these functions
 * today and the shared-memory reader (M5.2) feeds the same ones later, so the
 * semantics live in one place instead of being guessed at twice.
 */

import type { CarTelemetry, FuelPlan, HazardTelemetry, HazardType, SpotterState } from "./types.ts";
import { IRSDK_FLAGS } from "./types.ts";

/* =========================================================================
   SPOTTER — irsdk_CarLeftRight + CarIdxLapDistPct
   ========================================================================= */

/** irsdk_CarLeftRight. Note index 0 is "Off", so Clear is 1, not 0. */
export const CarLeftRight = {
  Off: 0, // irsdk_LROff
  Clear: 1, // irsdk_LRClear
  CarLeft: 2, // irsdk_LRCarLeft
  CarRight: 3, // irsdk_LRCarRight
  CarLeftRight: 4, // irsdk_LRCarLeftRight
  TwoCarsLeft: 5, // irsdk_LR2CarsLeft
  TwoCarsRight: 6, // irsdk_LR2CarsRight
} as const;

/** irsdk_TrkLoc (CarIdxTrackSurface). */
export const TrackSurface = {
  NotInWorld: -1,
  OffTrack: 0, // the 1x "off track" incident
  InPitStall: 1,
  AproachingPits: 2,
  OnTrack: 3,
} as const;

/** Cars further apart than this are not alongside; iRon uses the same window. */
const ALONGSIDE_M = 5.0;
/** Door-to-door. iRon switches from yellow caution to red alert here. */
const CRITICAL_GAP_M = 2.2;

/** Signed track gap in metres, wrapped at the start/finish line. */
function gapMeters(fromPct: number, toPct: number, trackLengthM: number): number {
  let d = toPct - fromPct;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d * trackLengthM;
}

export interface SpotterInputs {
  carLeftRight: number; // CarLeftRight
  cars: readonly CarTelemetry[];
  playerCarIdx: number;
  playerLapDistPct: number;
  trackLengthM: number;
}

/**
 * Per-side alert stage.
 *
 * CarLeftRight says WHICH side has company — it is the only signal iRacing
 * publishes for that, and it never carries a gap. Severity comes from the
 * nearest car actually alongside, measured off CarIdxLapDistPct the way iRon
 * does it: door-to-door (<= 2.2m) or two cars on the side is a red alert,
 * anything else alongside is an amber caution.
 */
export function spotterSides(i: SpotterInputs): { left: SpotterState; right: SpotterState } {
  const v = i.carLeftRight;
  const anyLeft = v === CarLeftRight.CarLeft || v === CarLeftRight.CarLeftRight || v === CarLeftRight.TwoCarsLeft;
  const anyRight = v === CarLeftRight.CarRight || v === CarLeftRight.CarLeftRight || v === CarLeftRight.TwoCarsRight;
  if (!anyLeft && !anyRight) return { left: "clear", right: "clear" };

  // Nearest car genuinely alongside, either side — CarLeftRight already told us
  // which side it is on, so the gap only has to answer "how close".
  let nearest = Infinity;
  for (const car of i.cars) {
    if (car.carIdx === i.playerCarIdx) continue;
    if (car.trackSurface === TrackSurface.NotInWorld) continue;
    const abs = Math.abs(gapMeters(i.playerLapDistPct, car.lapDistPct, i.trackLengthM));
    if (abs < ALONGSIDE_M) nearest = Math.min(nearest, abs);
  }
  const critical = nearest <= CRITICAL_GAP_M;

  return {
    left: !anyLeft ? "clear" : critical || v === CarLeftRight.TwoCarsLeft ? "danger" : "warning",
    right: !anyRight ? "clear" : critical || v === CarLeftRight.TwoCarsRight ? "danger" : "warning",
  };
}

/* =========================================================================
   FUEL — FuelLevel / SessionLapsRemainEx / PitSvFuel / dpFuelFill
   ========================================================================= */

/** SessionLapsTotal / SessionLapsRemainEx sentinel for "unlimited". */
export const LAPS_UNLIMITED = 32767;

/**
 * iRon's conservative padding on measured consumption. A lap is never exactly
 * the average, and running dry costs more than one extra stop.
 */
export const FUEL_ESTIMATE_FACTOR = 1.1;

/** Laps averaged for the per-lap burn. iRon's fuel_estimate_avg_green_laps. */
const AVG_GREEN_LAPS = 4;

/** Any of these flying means the lap was not a representative green lap. */
const NON_GREEN_FLAGS =
  IRSDK_FLAGS.yellow |
  IRSDK_FLAGS.yellowWaving |
  IRSDK_FLAGS.red |
  IRSDK_FLAGS.checkered |
  IRSDK_FLAGS.caution |
  IRSDK_FLAGS.black |
  IRSDK_FLAGS.disqualify |
  IRSDK_FLAGS.repair;

export interface FuelInputs {
  fuelLevel: number; // FuelLevel (L)
  fuelMaxLtr: number; // YAML DriverInfo.DriverCarFuelMaxLtr (L)
  maxFuelPct: number; // YAML DriverInfo.DriverCarMaxFuelPct (0..1) — series fuel cap
  /** Laps left to run, or -1 when the session cannot say yet. See remainingLaps(). */
  lapsRemaining: number;
  avgPerLap: number; // measured, see FuelPerLapTracker
  pitSvFuel: number; // PitSvFuel — what the F4 black box will actually add
  fuelFillChecked: boolean; // dpFuelFill / PitSvFlags irsdk_FuelFill
  currentLap: number; // CarIdxLap for the player
}


/**
 * Laps left to run, iRon's rule. A time-limited session reports SessionLapsTotal
 * as 32767, so the lap count has to be estimated from the clock; a lap-limited
 * one can be read straight off SessionLapsRemainEx.
 */
export function remainingLaps(
  sessionLapsTotal: number,
  sessionLapsRemainEx: number,
  sessionTimeRemainSec: number,
  estimatedLapTimeSec: number
): number {
  const timeLimited = sessionLapsTotal === LAPS_UNLIMITED && sessionTimeRemainSec < 48 * 3600;
  if (timeLimited) {
    if (estimatedLapTimeSec <= 0) return -1;
    return Math.round(sessionTimeRemainSec / estimatedLapTimeSec);
  }
  return sessionLapsRemainEx !== LAPS_UNLIMITED ? sessionLapsRemainEx : -1;
}

export function fuelStrategy(i: FuelInputs): FuelPlan {
  // DriverCarMaxFuelPct is the series fuel cap (0.5 on plenty of road series):
  // a "full" tank is that fraction, not DriverCarFuelMaxLtr.
  const usableMax = i.fuelMaxLtr * (i.maxFuelPct > 0 ? i.maxFuelPct : 1);
  const perLapEstimate = i.avgPerLap * FUEL_ESTIMATE_FACTOR;
  const laps = i.lapsRemaining;
  const known = perLapEstimate > 0;

  const lapsOnFuel = known ? i.fuelLevel / perLapEstimate : -1;
  const toFinish = known && laps >= 0 ? Math.max(0, laps * perLapEstimate - i.fuelLevel) : 0;
  // Burn rate that would make the current load last to the flag. Nothing to aim
  // at when the finish is not yet countable.
  const saveTargetPerLap = laps > 0 ? i.fuelLevel / laps : i.avgPerLap;
  const lapsOnFullTank = known ? Math.floor(usableMax / perLapEstimate) : 0;

  return {
    level: i.fuelLevel,
    usableMax,
    tankPct: usableMax > 0 ? Math.min(100, (i.fuelLevel / usableMax) * 100) : 0,
    avgPerLap: i.avgPerLap,
    perLapEstimate,
    lapsOnFuel,
    lapsRemaining: laps,
    toFinish,
    saveTargetPerLap,
    saveDelta: Math.max(0, i.avgPerLap - saveTargetPerLap),
    boxFuel: i.pitSvFuel,
    fuelFillChecked: i.fuelFillChecked,
    boxUnderfilled: toFinish > i.pitSvFuel || (toFinish > 0 && !i.fuelFillChecked),
    // Stopping earlier than this leaves more laps than a full tank can cover.
    pitWindowOpenLap: known && laps >= 0 ? i.currentLap + Math.max(0, laps - lapsOnFullTank) : -1,
    pitWindowCloseLap: known ? i.currentLap + Math.floor(lapsOnFuel) : -1,
    pitLossSeconds: toFinish > 0 ? PIT_TRANSIT_SEC + toFinish / REFUEL_RATE_LPS : 0,
  };
}

/**
 * Pit lane time loss. iRacing publishes no "time lost in the pits" variable, so
 * this is an estimate: a typical GP-circuit transit plus iRacing's refuel rate.
 * ponytail: two constants rather than deriving transit from pit-lane length and
 * TrackPitSpeedLimit — swap in the YAML-derived figure if planning a stop around
 * this number ever proves too coarse.
 */
export const PIT_TRANSIT_SEC = 18;
export const REFUEL_RATE_LPS = 2.8;

/**
 * Per-lap burn, measured the only way iRacing supports: FuelLevel sampled at
 * each lap boundary (iRon does exactly this). FuelUsePerHour is an instantaneous
 * kg/h reading — wrong units and wrong window for a per-lap average, so it is
 * deliberately unused.
 *
 * Laps under any non-green flag and laps that touch the pit lane are discarded:
 * they are not representative of race pace.
 */
export class FuelPerLapTracker {
  private lastLapNumber = -1;
  private fuelAtLapStart = 0;
  private readonly samples: number[] = [];
  private isValidLap = false;
  public lastLapBurn = 0;

  /** Call every tick with the raw SDK values. */
  public update(lap: number, fuelLevel: number, onPitRoad: boolean, sessionFlags: number) {
    if (lap !== this.lastLapNumber) {
      const burn = Math.max(0, this.fuelAtLapStart - fuelLevel);
      if (this.isValidLap && burn > 0) {
        this.lastLapBurn = burn;
        this.samples.push(burn);
        while (this.samples.length > AVG_GREEN_LAPS) this.samples.shift();
      }
      this.lastLapNumber = lap;
      this.fuelAtLapStart = fuelLevel;
      this.isValidLap = true;
    }
    // Checked after the boundary so a flag thrown mid-lap invalidates THAT lap.
    if ((sessionFlags & NON_GREEN_FLAGS) !== 0 || onPitRoad) this.isValidLap = false;
  }

  /** Mean of the last clean green laps; 0 until one completes. */
  public get average(): number {
    if (this.samples.length === 0) return 0;
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }

  /** A session change makes every earlier sample meaningless. */
  public reset() {
    this.samples.length = 0;
    this.lastLapNumber = -1;
    this.isValidLap = false;
    this.lastLapBurn = 0;
  }
}

/* =========================================================================
   PIT STALL — LapDistPct vs YAML DriverInfo.DriverPitTrkPct
   ========================================================================= */

/**
 * Metres from the player to their own pit box, measured along the track.
 *
 * iRacing publishes no countdown; DriverPitTrkPct (session YAML) is where the
 * stall sits as a fraction of a lap, so the distance is that minus where we are.
 * Returns undefined when the YAML has not given us a stall yet — better a dash
 * than a number that sends someone past their box.
 */
export function distanceToPitStall(
  lapDistPct: number,
  driverPitTrkPct: number | undefined,
  trackLengthM: number
): number | undefined {
  if (driverPitTrkPct === undefined || trackLengthM <= 0) return undefined;
  let d = driverPitTrkPct - lapDistPct;
  if (d < 0) d += 1;
  return d * trackLengthM;
}

/* =========================================================================
   HAZARD AHEAD — CarIdxTrackSurface / CarIdxLapDistPct / SessionFlags
   ========================================================================= */

/** iRon looks 15% of a lap ahead — roughly 10-15 seconds at racing speed. */
export const HAZARD_LOOKAHEAD_PCT = 0.15;
/** On track and this slow means it is parked or spun, not merely slow. */
const CRAWLING_KMH = 40;

export interface HazardInputs {
  cars: readonly CarTelemetry[];
  playerCarIdx: number;
  playerLapDistPct: number;
  trackLengthM: number;
  sessionFlags: number;
  /** Opponent pace, km/h, keyed by carIdx. Absent = no sample yet. */
  speedsKmh?: ReadonlyMap<number, number>;
}

/**
 * Nearest genuine incident ahead, or a cleared hazard.
 *
 * The trigger set is exactly the behaviour that moves a Safety Rating: a car off
 * the racing surface (irsdk_OffTrack, the 1x incident), or a car crawling on
 * track — what a spin, a lost-control moment or a collision all leave behind.
 * A car that is simply slower, a car in the pits, and a global yellow with
 * nothing visible ahead are all deliberately silent: false positives are what
 * make a hazard widget get switched off.
 */
export function detectHazardAhead(i: HazardInputs): HazardTelemetry {
  let best: HazardTelemetry | null = null;

  for (const car of i.cars) {
    if (car.carIdx === i.playerCarIdx) continue;
    if (car.trackSurface === TrackSurface.NotInWorld) continue;
    // Pit lane and pit stall are not hazards on the racing line.
    if (car.inPit || car.trackSurface === TrackSurface.InPitStall || car.trackSurface === TrackSurface.AproachingPits) continue;

    let dPct = car.lapDistPct - i.playerLapDistPct;
    if (dPct > 0.5) dPct -= 1;
    if (dPct < -0.5) dPct += 1;
    if (dPct <= 0 || dPct >= HAZARD_LOOKAHEAD_PCT) continue; // behind, or too far ahead

    const speed = i.speedsKmh?.get(car.carIdx);
    let type: HazardType | null = null;
    if (car.trackSurface === TrackSurface.OffTrack) type = "offTrack";
    else if (speed !== undefined && speed < CRAWLING_KMH) type = "stopped";
    if (!type) continue;

    const distance = dPct * i.trackLengthM;
    if (best && best.distanceMeters <= distance) continue;

    best = {
      hasIncident: true,
      distanceMeters: Math.round(distance),
      incidentCarNumber: car.carNumber,
      incidentSector: car.lapDistPct < 1 / 3 ? 1 : car.lapDistPct < 2 / 3 ? 2 : 3,
      incidentLapDistPct: car.lapDistPct,
      hazardType: type,
      speedKmh: speed !== undefined ? Math.round(speed) : 0,
    };
  }

  if (best) return best;

  // Race control has flagged something we cannot pin to a car. Still real, just
  // without a target, so it is reported at the edge of the look-ahead window.
  const yellowBits = IRSDK_FLAGS.yellow | IRSDK_FLAGS.yellowWaving | IRSDK_FLAGS.caution | IRSDK_FLAGS.debris;
  if ((i.sessionFlags & yellowBits) !== 0) {
    return {
      hasIncident: true,
      distanceMeters: Math.round(HAZARD_LOOKAHEAD_PCT * i.trackLengthM),
      incidentCarNumber: "",
      incidentSector: 0,
      hazardType: "yellowFlag",
    };
  }

  return { hasIncident: false, distanceMeters: 0, incidentCarNumber: "", incidentSector: 0 };
}

/**
 * Opponent pace from CarIdxLapDistPct. The SDK publishes `Speed` for the player
 * only, so every other car's speed has to be differentiated from track position.
 * One sample per car, no per-tick allocation.
 */
export class CarSpeedTracker {
  private readonly lastPct = new Map<number, number>();
  private readonly lastAt = new Map<number, number>();
  public readonly speedKmh = new Map<number, number>();

  public update(carIdx: number, lapDistPct: number, trackLengthM: number, nowMs: number) {
    const prevPct = this.lastPct.get(carIdx);
    const prevAt = this.lastAt.get(carIdx);
    if (prevPct === undefined || prevAt === undefined) {
      this.lastPct.set(carIdx, lapDistPct);
      this.lastAt.set(carIdx, nowMs);
      return;
    }

    const dt = (nowMs - prevAt) / 1000;
    if (dt < 0.25) return; // too short a window to differentiate cleanly

    let dPct = lapDistPct - prevPct;
    if (dPct < -0.5) dPct += 1; // wrapped the start/finish line
    this.lastPct.set(carIdx, lapDistPct);
    this.lastAt.set(carIdx, nowMs);
    if (dPct < 0 || dPct > 0.5) return; // towed or reset: not a speed

    this.speedKmh.set(carIdx, ((dPct * trackLengthM) / dt) * 3.6);
  }
}

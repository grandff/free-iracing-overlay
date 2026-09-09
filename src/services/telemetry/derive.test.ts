/**
 * Self-check for the SDK derivations. No framework — run it with:
 *   npx tsx src/services/telemetry/derive.test.ts
 */
import assert from "node:assert/strict";
import {
  CarLeftRight,
  distanceToPitStall,
  CarSpeedTracker,
  FUEL_ESTIMATE_FACTOR,
  FuelPerLapTracker,
  detectHazardAhead,
  fuelStrategy,
  remainingLaps,
  spotterSides,
} from "./derive.ts";
import { IRSDK_FLAGS, type CarTelemetry } from "./types.ts";

const TRACK = 4500;
const car = (over: Partial<CarTelemetry>): CarTelemetry => ({
  carIdx: 2, carNumber: "42", driverName: "X", country: "KR", carBrand: "Porsche", irating: 0,
  safetyRating: { license: "A", value: 4 }, classPosition: 2, overallPosition: 2, lap: 1,
  lapDistPct: 0.13, lastLapTime: 90, bestLapTime: 90, inPit: false, carClass: "GT3",
  carClassColor: "#fff", speedKmh: 0, gapToPlayerSeconds: 1, trackSurface: 3, ...over,
});

/* --- spotter ------------------------------------------------------------ */
// A neighbour 3m back: CarLeftRight names the side, the gap sets the severity.
const near = [car({ carIdx: 2, lapDistPct: 0.1 - 3 / TRACK })];
const far = [car({ carIdx: 2, lapDistPct: 0.1 - 4.5 / TRACK })];
const ctxS = { cars: near, playerCarIdx: 1, playerLapDistPct: 0.1, trackLengthM: TRACK };

assert.deepEqual(spotterSides({ ...ctxS, carLeftRight: CarLeftRight.Clear }), { left: "clear", right: "clear" });
assert.deepEqual(spotterSides({ ...ctxS, carLeftRight: CarLeftRight.Off }), { left: "clear", right: "clear" });
assert.deepEqual(spotterSides({ ...ctxS, cars: far, carLeftRight: CarLeftRight.CarLeft }), { left: "warning", right: "clear" });
assert.deepEqual(spotterSides({ ...ctxS, cars: far, carLeftRight: CarLeftRight.CarRight }), { left: "clear", right: "warning" });
assert.deepEqual(spotterSides({ ...ctxS, cars: far, carLeftRight: CarLeftRight.CarLeftRight }), { left: "warning", right: "warning" });
// Two cars on one side is a red alert regardless of gap.
assert.deepEqual(spotterSides({ ...ctxS, cars: far, carLeftRight: CarLeftRight.TwoCarsLeft }), { left: "danger", right: "clear" });
assert.deepEqual(spotterSides({ ...ctxS, cars: far, carLeftRight: CarLeftRight.TwoCarsRight }), { left: "clear", right: "danger" });
// Door-to-door (<= 2.2m) upgrades a single car to red.
const doorToDoor = [car({ carIdx: 2, lapDistPct: 0.1 + 1.5 / TRACK })];
assert.deepEqual(spotterSides({ ...ctxS, cars: doorToDoor, carLeftRight: CarLeftRight.CarLeft }), { left: "danger", right: "clear" });
// A car 40m up the road is not alongside, whatever CarLeftRight says.
const upTheRoad = [car({ carIdx: 2, lapDistPct: 0.1 + 40 / TRACK })];
assert.deepEqual(spotterSides({ ...ctxS, cars: upTheRoad, carLeftRight: CarLeftRight.CarLeft }), { left: "warning", right: "clear" });

/* --- remaining laps ----------------------------------------------------- */
assert.equal(remainingLaps(57, 18, 1512, 84), 18, "lap-limited reads SessionLapsRemainEx");
assert.equal(remainingLaps(32767, 32767, 1512, 84), 18, "timed race estimates from the clock");
assert.equal(remainingLaps(32767, 32767, 200 * 3600, 84), -1, "no clock, no lap count");

/* --- fuel --------------------------------------------------------------- */
const base = {
  fuelMaxLtr: 110, maxFuelPct: 1, avgPerLap: 2.4,
  pitSvFuel: 0, fuelFillChecked: true, currentLap: 10,
};

// Comfortable: no extra fuel needed, no stop time.
const easy = fuelStrategy({ ...base, fuelLevel: 60, lapsRemaining: 10 });
assert.equal(easy.toFinish, 0);
assert.equal(easy.pitLossSeconds, 0);
assert.equal(easy.boxUnderfilled, false);
assert.ok(Math.abs(easy.perLapEstimate - 2.4 * FUEL_ESTIMATE_FACTOR) < 1e-9);

// 20 laps x 2.64 (2.4 padded) = 52.8 needed, 36 aboard -> 16.8 short.
const short = fuelStrategy({ ...base, fuelLevel: 36, lapsRemaining: 20 });
assert.ok(Math.abs(short.toFinish - 16.8) < 1e-9, `toFinish ${short.toFinish}`);
assert.ok(Math.abs(short.saveTargetPerLap - 1.8) < 1e-9);
assert.ok(short.pitLossSeconds > 18);
assert.equal(short.boxUnderfilled, true, "black box set to 0L cannot cover 16.8L");
assert.equal(fuelStrategy({ ...base, fuelLevel: 36, lapsRemaining: 20, pitSvFuel: 20 }).boxUnderfilled, false);
// Fuel requested but the fill box unticked = it will not go in.
assert.equal(
  fuelStrategy({ ...base, fuelLevel: 36, lapsRemaining: 20, pitSvFuel: 20, fuelFillChecked: false }).boxUnderfilled,
  true
);

// DriverCarMaxFuelPct caps the tank: 50% of 110L is the real full.
const capped = fuelStrategy({ ...base, fuelLevel: 27.5, lapsRemaining: 40, maxFuelPct: 0.5 });
assert.equal(capped.usableMax, 55);
assert.equal(capped.tankPct, 50);

// No clean lap yet -> nothing is claimed.
const unknown = fuelStrategy({ ...base, fuelLevel: 36, lapsRemaining: 20, avgPerLap: 0 });
assert.equal(unknown.lapsOnFuel, -1);
assert.equal(unknown.toFinish, 0);
assert.equal(unknown.pitWindowOpenLap, -1);

// Timed race with no countable finish -> no invented target.
const openEnded = fuelStrategy({ ...base, fuelLevel: 36, lapsRemaining: -1 });
assert.equal(openEnded.toFinish, 0);
assert.equal(openEnded.pitWindowOpenLap, -1);
assert.ok(openEnded.lapsOnFuel > 0, "laps on the current load are still knowable");

/* --- per-lap burn: only clean green laps count -------------------------- */
const GREEN = IRSDK_FLAGS.green;
const t = new FuelPerLapTracker();
t.update(1, 50.0, false, GREEN); // lap 1 begins
t.update(2, 47.5, false, GREEN); // lap 1 burned 2.5 -> kept
t.update(2, 46.0, true, GREEN); // pitted during lap 2 -> lap 2 invalid
t.update(3, 60.0, false, GREEN); // lap 2 ended refuelled -> dropped
t.update(4, 57.0, false, GREEN); // lap 3 burned 3.0 -> kept
assert.ok(Math.abs(t.average - 2.75) < 1e-9, `avg was ${t.average}`);
assert.equal(t.lastLapBurn, 3.0);

const y = new FuelPerLapTracker();
y.update(1, 50, false, GREEN);
y.update(1, 49, false, IRSDK_FLAGS.yellow); // caution mid-lap
y.update(2, 48, false, GREEN);
assert.equal(y.average, 0, "a lap under yellow must not set the race average");

/* --- hazard: only SR-moving events ------------------------------------- */
const ctxH = { playerCarIdx: 1, playerLapDistPct: 0.1, trackLengthM: TRACK, sessionFlags: GREEN };
const racing = new Map([[2, 230]]);

// A healthy car 135m ahead is NOT an incident.
assert.equal(detectHazardAhead({ ...ctxH, cars: [car({})], speedsKmh: racing }).hasIncident, false);

// Off the racing surface IS — that is the 1x off-track.
const off = detectHazardAhead({ ...ctxH, cars: [car({ trackSurface: 0 })], speedsKmh: racing });
assert.equal(off.hazardType, "offTrack");
assert.equal(off.distanceMeters, 135);
assert.equal(off.incidentCarNumber, "42");

// Crawling on the racing line IS — a spin or a hit leaves exactly this.
assert.equal(
  detectHazardAhead({ ...ctxH, cars: [car({})], speedsKmh: new Map([[2, 8]]) }).hazardType,
  "stopped"
);

// Pit lane is never a hazard on the racing line.
assert.equal(detectHazardAhead({ ...ctxH, cars: [car({ inPit: true, trackSurface: 0 })], speedsKmh: racing }).hasIncident, false);
// Neither is a car that is not in the world.
assert.equal(detectHazardAhead({ ...ctxH, cars: [car({ trackSurface: -1 })], speedsKmh: racing }).hasIncident, false);
// Behind us: silent.
assert.equal(detectHazardAhead({ ...ctxH, cars: [car({ lapDistPct: 0.05, trackSurface: 0 })], speedsKmh: racing }).hasIncident, false);
// Beyond the 15% look-ahead: silent.
assert.equal(detectHazardAhead({ ...ctxH, cars: [car({ lapDistPct: 0.30, trackSurface: 0 })], speedsKmh: racing }).hasIncident, false);
// Nearest of two wins.
const two = detectHazardAhead({
  ...ctxH,
  cars: [car({ carIdx: 2, carNumber: "42", lapDistPct: 0.20, trackSurface: 0 }), car({ carIdx: 3, carNumber: "7", lapDistPct: 0.12, trackSurface: 0 })],
  speedsKmh: racing,
});
assert.equal(two.incidentCarNumber, "7");

// Race control yellow with nothing identifiable ahead still warns.
assert.equal(detectHazardAhead({ ...ctxH, sessionFlags: IRSDK_FLAGS.yellow, cars: [], speedsKmh: racing }).hazardType, "yellowFlag");

/* --- opponent speed from lap distance ----------------------------------- */
const speeds = new CarSpeedTracker();
speeds.update(2, 0.1, TRACK, 0);
speeds.update(2, 0.1, TRACK, 100); // below the 250ms window: ignored
assert.equal(speeds.speedKmh.get(2), undefined);
speeds.update(2, 0.1 + 64 / TRACK, TRACK, 1000); // 64 m in 1s
assert.ok(Math.abs(speeds.speedKmh.get(2)! - 64 * 3.6) < 0.5);
// Wrapping the start/finish line is a normal lap, not a teleport.
const wrap = new CarSpeedTracker();
wrap.update(3, 0.99, TRACK, 0);
wrap.update(3, 0.01, TRACK, 1000); // +0.02 lap = 90 m
assert.ok(Math.abs(wrap.speedKmh.get(3)! - 90 * 3.6) < 0.5);

/* --- pit stall countdown ------------------------------------------------ */
// Box at 2% of the lap, we are at 1% -> 45m to go.
assert.equal(distanceToPitStall(0.01, 0.02, TRACK), 45);
// Just past it: the countdown wraps to nearly a full lap, never goes negative.
assert.ok(distanceToPitStall(0.03, 0.02, TRACK)! > TRACK * 0.98);
// No stall in the YAML yet -> no number to show.
assert.equal(distanceToPitStall(0.01, undefined, TRACK), undefined);
assert.equal(distanceToPitStall(0.01, 0.02, 0), undefined);

console.log("derive.ts self-check passed");

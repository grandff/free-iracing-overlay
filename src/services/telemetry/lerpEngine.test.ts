import assert from "node:assert/strict";
import { LerpEngine } from "./lerpEngine.ts";
import type { TelemetryFrame } from "./types.ts";

function createDummyFrame(speed: number, rpm: number): TelemetryFrame {
  return {
    timestamp: Date.now(),
    tickRateHz: 60,
    trackLengthMeters: 4500,
    trackName: "Spa",
    sessionType: "RACE",
    sessionLapsTotal: 50,
    sessionLapsRemaining: 20,
    sessionTimeRemainingSec: 1800,
    sessionFlags: 1,
    sof: 3000,
    projectedIratingGain: 15,
    player: {
      carIdx: 1,
      carNumber: "7",
      driverName: "Player",
      country: "KR",
      carBrand: "Porsche",
      irating: 3000,
      safetyRating: { license: "A", value: 4.5 },
      speedKmh: speed,
      rpm: rpm,
      gear: 4,
      fuelLevelLiters: 40,
      lap: 5,
      onPitRoad: false,
      lastLapTime: 85,
      bestLapTime: 84,
      lastLapDelta: 0,
      incidents: 0,
      tirePressurePsi: [28, 28, 28, 28],
      tireWearPct: [95, 95, 95, 95],
      tireSurfaceLoadPct: [50, 50, 50, 50],
      tireTempC: [85, 85, 85, 85],
    },
    fuel: {
      fuelLevelLiters: 40,
      fuelCapacityLiters: 100,
      lapsRemaining: 20,
      fuelNeededLiters: 0,
      avgFuelPerLap: 2.0,
      fuelPerLapConfidence: "confirmed",
      isUnderfueled: false,
      recommendedAddLiters: 0,
      pitWindowOpenLap: 10,
      pitWindowCloseLap: 15,
      estimatedPitStopTimeSeconds: 0,
      fuelBurnPerMinute: 1.5,
      fuelSafeBufferLiters: 2.0,
      fuelRemainingLaps: 20,
      lapsOnFuel: 20,
      fuelPct: 0.4,
    },
    cars: [],
    spotter: { leftState: "clear", rightState: "clear", carLeftRight: 0 },
    weather: {
      airTempC: 20,
      trackTempC: 30,
      windSpeedKmh: 10,
      windDirDeg: 0,
      windDirRad: 0,
      trackWetnessPct: 0,
      relativeHumidityPct: 50,
      fogLevelPct: 0,
      skies: 1,
      weatherType: 1,
      weatherVersion: 1,
      trackWetness: 1,
      precipitationPct: 0,
      airPressureHg: 29.92,
      airDensity: 1.2,
    },
    multiclass: { hasApproachingFastCar: false, carClass: "GT3", carNumber: "1", gapSeconds: 0 },
    radio: { isTransmitting: false, carIdx: -1, radioIdx: 0, frequencyIdx: 0, channelName: "", driverName: "", carNumber: "", carBrand: "", isPlayer: true, messageText: "" },
    systemMessage: { activeEvent: "none", rawText: "", timestamp: 0 },
    lapDelta: {
      deltaToBest: 0,
      deltaToBestValid: true,
      deltaToLast: 0,
      deltaToLastValid: true,
      deltaToSessionBest: 0,
      deltaToSessionBestValid: true,
      lastLapTime: 85,
      bestLapTime: 84,
      currentSector: 1,
      sectors: [
        { sectorNumber: 1, status: "none", isCurrent: true },
        { sectorNumber: 2, status: "none", isCurrent: false },
        { sectorNumber: 3, status: "none", isCurrent: false },
      ],
      targetMode: "best",
    },
    shiftLight: {
      rpm: rpm,
      gear: 4,
      speedKmh: speed,
      firstRpm: 10000,
      shiftRpm: 12000,
      lastRpm: 12500,
      blinkRpm: 12600,
      pitLimiterActive: false,
      revLimiterActive: false,
    },
    pitLane: {
      onPitRoad: false,
      inPitStall: false,
      approachingPits: false,
      pitSpeedLimitKmh: 60,
      pitRepairRemainingSec: 0,
      limiterActive: false,
    },
  };
}

// 1. Test initial feed: no bogus interpolation from 0
const engine = new LerpEngine();
const frame1 = createDummyFrame(200, 10000);
engine.feed(frame1, 1000);

const initRes = engine.interpolateAt(1005);
assert.equal(initRes.speedKmh, 200, "Initial feed must immediately be 200, not ramping from 0");
assert.equal(initRes.rpm, 10000, "Initial feed must immediately be 10000, not ramping from 0");

// 2. Feed frame 2 at t=1016.66ms (speed: 260, rpm: 12000)
const frame2 = createDummyFrame(260, 12000);
engine.feed(frame2, 1016.66);

// At t=1016.66ms (alpha = 0), values should be exactly frame1 values (200, 10000)
const t0 = engine.interpolateAt(1016.66);
assert.equal(t0.speedKmh, 200, "At tick arrival (alpha=0), speed should be prevSpeed (200)");
assert.equal(t0.rpm, 10000, "At tick arrival (alpha=0), rpm should be prevRpm (10000)");

// At halfway through the tick (t = 1016.66 + 8.33 = 1024.99, alpha ~ 0.5)
const tHalf = engine.interpolateAt(1016.66 + 8.33);
assert.ok(Math.abs(tHalf.speedKmh - 230) <= 1, `At half tick, speed should be ~230, got ${tHalf.speedKmh}`);
assert.ok(Math.abs(tHalf.rpm - 11000) <= 10, `At half tick, rpm should be ~11000, got ${tHalf.rpm}`);

// At end of tick interval (t >= 1016.66 + 16.66 = 1033.32, alpha = 1.0)
const tFull = engine.interpolateAt(1035);
assert.equal(tFull.speedKmh, 260, "At or beyond full interval, speed clamps to currSpeed (260)");
assert.equal(tFull.rpm, 12000, "At or beyond full interval, rpm clamps to currRpm (12000)");

// 3. Snapshotting independence: mutating incoming frame after feed does not corrupt engine state
frame2.player.speedKmh = 999;
frame2.player.rpm = 99999;
const tPostMutate = engine.interpolateAt(1035);
assert.equal(tPostMutate.speedKmh, 260, "Engine snapshot must not be mutated by external frame edits");
assert.equal(tPostMutate.rpm, 12000, "Engine snapshot must not be mutated by external frame edits");

console.log("lerpEngine self-check passed: all mathematical and snapshot assertions verified");

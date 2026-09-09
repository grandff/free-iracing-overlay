import {
  calculateSOF,
  calculatePairwiseChance,
  calculateEloChanges,
} from "./iratingCalculator.ts";

// Benchmark test with 3 drivers
const drivers = [
  { carIdx: 1, irating: 3203, finishPosition: 1, started: true },
  { carIdx: 2, irating: 3922, finishPosition: 2, started: true },
  { carIdx: 3, irating: 2974, finishPosition: 3, started: true },
];

const sof = calculateSOF(drivers.map((d) => d.irating));
console.log("Calculated SOF:", sof);

const results = calculateEloChanges(drivers);
console.log("Results:");
for (const [carIdx, res] of results) {
  console.log(`Car #${carIdx}: start=${res.startIrating}, change=${res.iratingChange >= 0 ? "+" : ""}${res.iratingChange}, new=${res.newIrating}`);
}

// Verification checks:
// 1. Equal ratings chance should be 0.5
const equalChance = calculatePairwiseChance(2000, 2000);
if (Math.abs(equalChance - 0.5) > 0.0001) {
  throw new Error(`Equal chance test failed: expected 0.5, got ${equalChance}`);
}

// 2. SOF should be within range [2974, 3922]
if (sof < 2974 || sof > 3922) {
  throw new Error(`SOF out of bounds: ${sof}`);
}

// 3. Winner in position 1 should gain iRating (+), last in position 3 should lose (-)
const winner = results.get(1);
const loser = results.get(3);
if (!winner || winner.iratingChange <= 0) {
  throw new Error("Winner should have gained iRating");
}
if (!loser || loser.iratingChange >= 0) {
  throw new Error("P3 should have lost iRating");
}

console.log("ALL ELO & SOF MATHEMATICAL ASSERTIONS PASSED!");

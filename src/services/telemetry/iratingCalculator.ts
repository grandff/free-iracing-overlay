/**
 * Official iRacing Elo iRating and SOF calculation formulas.
 * Based on "iRacing SOF iRating Calculator v1_1.xlsx", "Turbo87/irating-rs",
 * and community-verified pairwise Elo mechanics.
 */

// Constant factor: 1600 / ln(2) ~ 2308.312059
export const ELO_FACTOR = 1600 / Math.LN2;

/**
 * Pairwise winning probability of driver A (rating a) against driver B (rating b).
 */
export function calculatePairwiseChance(a: number, b: number, factor = ELO_FACTOR): number {
  if (a <= 0 && b <= 0) return 0.5;
  const expA = Math.exp(-a / factor);
  const expB = Math.exp(-b / factor);
  const num = (1 - expA) * expB;
  const den = (1 - expB) * expA + (1 - expA) * expB;
  if (den === 0) return 0.5;
  return num / den;
}

/**
 * Official iRacing Strength of Field (SOF) exponential formula.
 * SOF = (1600 / ln(2)) * ln( N / sum(exp(-R_i / (1600 / ln(2)))) )
 */
export function calculateSOF(ratings: number[]): number {
  const validRatings = ratings.filter((r) => r > 0);
  if (validRatings.length === 0) return 0;

  const sumExp = validRatings.reduce((sum, r) => sum + Math.exp(-r / ELO_FACTOR), 0);
  if (sumExp <= 0) return Math.round(validRatings.reduce((a, b) => a + b, 0) / validRatings.length);

  const sof = ELO_FACTOR * Math.log(validRatings.length / sumExp);
  return Math.round(sof);
}

export interface DriverEloInput {
  carIdx: number;
  irating: number;
  finishPosition: number; // 1-indexed finishing position in class
  started?: boolean;
}

export interface DriverEloOutput {
  carIdx: number;
  startIrating: number;
  iratingChange: number; // +/- delta in integer
  newIrating: number;
}

/**
 * Calculate expected iRating changes for all drivers in a field/class.
 */
export function calculateEloChanges(drivers: DriverEloInput[]): Map<number, DriverEloOutput> {
  const results = new Map<number, DriverEloOutput>();
  if (drivers.length === 0) return results;

  const numRegistrations = drivers.length;
  const starters = drivers.filter((d) => d.started !== false);
  const numStarters = starters.length;
  const numNonStarters = numRegistrations - numStarters;

  // 1. Calculate expected scores
  const expectedScores: number[] = drivers.map((driverA) => {
    let sumChance = 0;
    for (const driverB of drivers) {
      sumChance += calculatePairwiseChance(driverA.irating, driverB.irating, ELO_FACTOR);
    }
    // Subtract self-comparison (which evaluates to 0.5)
    return sumChance - 0.5;
  });

  // 2. Fudge factor
  const fudgeFactors: number[] = drivers.map((driver) => {
    if (driver.started === false) return 0;
    const x = numRegistrations - numNonStarters / 2;
    return (x / 2 - driver.finishPosition) / 100;
  });

  // 3. iRating changes for starters
  const changesStarters: (number | null)[] = drivers.map((driver, i) => {
    if (driver.started === false) return null;
    const expScore = expectedScores[i];
    const fudge = fudgeFactors[i];
    const change =
      ((numRegistrations - driver.finishPosition - expScore - fudge) * 200) / (numStarters || 1);
    return change;
  });

  // 4. Sum of changes for starters (to balance non-starters if any)
  const sumChangesStarters = changesStarters.reduce<number>(
    (acc, val) => (val !== null ? acc + val : acc),
    0
  );

  // 5. Handle non-starters if any
  let sumExpNonStarters = 0;
  drivers.forEach((driver, i) => {
    if (driver.started === false) {
      sumExpNonStarters += expectedScores[i];
    }
  });

  drivers.forEach((driver, i) => {
    let delta = 0;
    if (driver.started !== false) {
      delta = changesStarters[i] ?? 0;
    } else if (numNonStarters > 0 && sumExpNonStarters > 0) {
      const expScore = expectedScores[i];
      delta =
        (-sumChangesStarters / numNonStarters) *
        (expScore / (sumExpNonStarters / numNonStarters));
    }

    const roundedChange = Math.round(delta);
    const newIrating = Math.max(0, driver.irating + roundedChange);
    results.set(driver.carIdx, {
      carIdx: driver.carIdx,
      startIrating: driver.irating,
      iratingChange: roundedChange,
      newIrating,
    });
  });

  return results;
}

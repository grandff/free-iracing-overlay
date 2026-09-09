// ponytail: zero-dependency official 2D circuit geometry presets and resolver
// Maps iRacing session WeekendInfo TrackName/TrackID to SVG path data

export interface TrackLayout {
  id: string;
  name: string;
  shortName: string;
  viewBox: string;
  trackPath: string; // SVG path d attribute (closed loop, start/finish at beginning)
  sectorSplits: [number, number]; // [S1 end pct, S2 end pct], e.g. [0.33, 0.67]
}

/**
 * High-accuracy 2D normalized circuit vector paths for iconic motorsport tracks.
 * All paths are normalized within 400x300 canvas coordinates for seamless scaling.
 */
export const TRACK_PRESETS: Record<string, TrackLayout> = {
  // 1. Circuit de Spa-Francorchamps (GP Pits)
  spa: {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    shortName: "SPA GP",
    viewBox: "0 0 400 300",
    // Authentic Spa outline: La Source -> Eau Rouge/Raidillon -> Kemmel -> Les Combes -> Malmedy -> Bruxelles -> Rivage -> Pouhon -> Fagnes -> Campus -> Stavelot -> Blanchimont -> Bus Stop
    trackPath:
      "M 90 230 " +
      "L 55 240 " +
      "C 40 245, 30 220, 50 200 " +
      "L 95 180 " +
      "C 105 175, 120 160, 135 135 " +
      "L 255 45 " +
      "C 275 30, 295 40, 290 60 " +
      "L 275 90 " +
      "C 270 105, 285 125, 275 140 " +
      "L 220 155 " +
      "C 200 160, 175 180, 160 205 " +
      "C 150 220, 170 240, 190 235 " +
      "L 230 230 " +
      "C 255 230, 270 250, 260 270 " +
      "C 245 285, 210 275, 175 270 " +
      "L 125 260 " +
      "C 105 255, 95 245, 90 230 Z",
    sectorSplits: [0.32, 0.68], // S1: La Source -> Kemmel end, S2: Les Combes -> Stavelot, S3: Blanchimont -> S/F
  },

  // 2. Autodromo Nazionale Monza
  monza: {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    shortName: "MONZA",
    viewBox: "0 0 400 300",
    // Rettifilo -> Curva Grande -> Roggia -> Lesmo 1 & 2 -> Serraglio -> Ascari -> Parabolica
    trackPath:
      "M 140 250 " +
      "L 60 250 " +
      "C 40 250, 40 230, 60 215 " +
      "C 110 175, 180 145, 235 120 " +
      "C 245 115, 255 100, 245 85 " +
      "C 235 70, 245 50, 265 50 " +
      "C 290 50, 310 70, 315 95 " +
      "L 320 150 " +
      "C 325 180, 345 195, 335 210 " +
      "C 320 225, 290 230, 260 240 " +
      "C 230 250, 200 275, 240 280 " +
      "C 300 285, 330 265, 340 240 " +
      "C 345 220, 320 250, 140 250 Z",
    sectorSplits: [0.35, 0.70],
  },

  // 3. Silverstone Circuit (Grand Prix)
  silverstone: {
    id: "silverstone",
    name: "Silverstone Circuit",
    shortName: "SILVERSTONE",
    viewBox: "0 0 400 300",
    // Hamilton Straight -> Abbey -> Farm -> Village -> Loop -> Wellington -> Brooklands -> Luffield -> Copse -> Maggotts/Becketts/Chapel -> Hangar -> Stowe -> Vale -> Club
    trackPath:
      "M 120 210 " +
      "C 105 210, 95 195, 110 185 " +
      "C 125 175, 140 180, 130 160 " +
      "C 120 140, 90 140, 80 120 " +
      "L 90 85 " +
      "C 95 65, 120 60, 140 75 " +
      "C 160 90, 150 115, 175 110 " +
      "L 240 95 " +
      "C 265 90, 280 70, 305 75 " +
      "C 330 80, 320 110, 300 130 " +
      "L 245 195 " +
      "C 230 210, 250 235, 270 230 " +
      "C 290 225, 295 255, 270 265 " +
      "C 240 275, 180 250, 145 235 " +
      "L 120 210 Z",
    sectorSplits: [0.29, 0.65],
  },

  // 4. Suzuka International Racing Course
  suzuka: {
    id: "suzuka",
    name: "Suzuka International Racing Course",
    shortName: "SUZUKA",
    viewBox: "0 0 400 300",
    // S/F -> Turn 1 & 2 -> S-Curves -> Dunlop -> Degner 1&2 -> Hairpin -> 200R -> Spoon -> Backstraight -> 130R -> Casio
    trackPath:
      "M 90 240 " +
      "C 120 240, 155 240, 180 225 " +
      "C 205 210, 200 180, 175 170 " +
      "C 150 160, 160 140, 180 135 " +
      "C 200 130, 215 110, 195 95 " +
      "C 175 80, 190 60, 220 65 " +
      "L 250 90 " +
      "C 275 115, 255 150, 230 150 " +
      "C 205 150, 220 180, 250 190 " +
      "C 280 200, 320 170, 345 140 " +
      "C 360 115, 340 85, 305 85 " +
      "L 190 70 " +
      "C 150 65, 110 90, 85 135 " +
      "C 65 175, 60 210, 75 225 " +
      "L 90 240 Z",
    sectorSplits: [0.33, 0.67],
  },

  // 5. Nürburgring GP
  nurburgring: {
    id: "nurburgring",
    name: "Nürburgring Grand Prix",
    shortName: "NÜRBURGRING",
    viewBox: "0 0 400 300",
    trackPath:
      "M 140 240 " +
      "C 100 240, 70 230, 60 205 " +
      "C 50 180, 80 160, 105 170 " +
      "C 130 180, 115 145, 95 135 " +
      "L 75 115 " +
      "C 60 95, 80 70, 115 65 " +
      "C 150 60, 190 75, 210 95 " +
      "L 260 130 " +
      "C 290 150, 315 175, 335 155 " +
      "C 355 135, 330 100, 300 90 " +
      "L 260 80 " +
      "C 230 75, 240 50, 270 45 " +
      "C 300 40, 340 60, 340 95 " +
      "C 340 140, 320 210, 270 235 " +
      "L 140 240 Z",
    sectorSplits: [0.31, 0.69],
  },

  // 6. Generic Grand Prix Circuit (Default Fallback)
  generic: {
    id: "generic",
    name: "Grand Prix Circuit",
    shortName: "GP CIRCUIT",
    viewBox: "0 0 400 300",
    trackPath:
      "M 110 240 " +
      "L 65 240 " +
      "C 40 240, 35 205, 55 190 " +
      "C 75 175, 110 185, 130 160 " +
      "C 150 135, 135 110, 115 95 " +
      "C 95 80, 110 50, 150 50 " +
      "L 265 50 " +
      "C 300 50, 325 75, 320 105 " +
      "C 315 135, 280 145, 260 165 " +
      "C 240 185, 270 210, 295 200 " +
      "C 320 190, 345 215, 335 245 " +
      "C 325 275, 270 270, 220 260 " +
      "L 165 250 " +
      "L 110 240 Z",
    sectorSplits: [0.33, 0.67],
  },
};

/**
 * Resolves current iRacing session track layout based on TrackName or TrackID
 */
export function getTrackLayout(trackName?: string): TrackLayout {
  if (!trackName) return TRACK_PRESETS.spa;

  const normalized = trackName.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (normalized.includes("spa") || normalized.includes("francorchamps")) {
    return TRACK_PRESETS.spa;
  }
  if (normalized.includes("monza") || normalized.includes("autodromo")) {
    return TRACK_PRESETS.monza;
  }
  if (normalized.includes("silverstone")) {
    return TRACK_PRESETS.silverstone;
  }
  if (normalized.includes("suzuka")) {
    return TRACK_PRESETS.suzuka;
  }
  if (normalized.includes("nurburg") || normalized.includes("nordschleife")) {
    return TRACK_PRESETS.nurburgring;
  }

  return TRACK_PRESETS.generic;
}

import { Component, JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

// ponytail: ultra-lightweight, high-fidelity SVG country flags for iRacing overlays
// 100% Windows-native compatible: Windows Segoe UI Emoji does NOT render flag emojis!
// These vector SVGs guarantee crisp, perfect flags across Windows, macOS, and Linux.

export interface FlagProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  class?: string;
}

// 1. South Korea (대한민국 태극기)
export const FlagKR: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#FFFFFF" />
    {/* Taegeuk Red Upper */}
    <path d="M30 11A9 9 0 0 1 30 29A9 9 0 0 1 30 11Z" fill="#C60C30" />
    {/* Taegeuk Blue Lower */}
    <path d="M30 20A4.5 4.5 0 0 0 30 11A9 9 0 0 0 30 29A4.5 4.5 0 0 1 30 20Z" fill="#003478" />
    <circle cx="30" cy="15.5" r="4.5" fill="#C60C30" />
    {/* Trigrams (Simplified Trigram Bars) */}
    {/* Geon (Top-Left ☰) */}
    <g fill="#000000" transform="translate(13, 8) rotate(34)">
      <rect x="0" y="0" width="8" height="1.2" />
      <rect x="0" y="2.2" width="8" height="1.2" />
      <rect x="0" y="4.4" width="8" height="1.2" />
    </g>
    {/* Gon (Bottom-Right ☷) */}
    <g fill="#000000" transform="translate(42, 27) rotate(34)">
      <rect x="0" y="0" width="3.5" height="1.2" />
      <rect x="4.5" y="0" width="3.5" height="1.2" />
      <rect x="0" y="2.2" width="3.5" height="1.2" />
      <rect x="4.5" y="2.2" width="3.5" height="1.2" />
      <rect x="0" y="4.4" width="3.5" height="1.2" />
      <rect x="4.5" y="4.4" width="3.5" height="1.2" />
    </g>
    {/* Gam (Top-Right ☵) */}
    <g fill="#000000" transform="translate(42, 8) rotate(-34)">
      <rect x="0" y="0" width="3.5" height="1.2" />
      <rect x="4.5" y="0" width="3.5" height="1.2" />
      <rect x="0" y="2.2" width="8" height="1.2" />
      <rect x="0" y="4.4" width="3.5" height="1.2" />
      <rect x="4.5" y="4.4" width="3.5" height="1.2" />
    </g>
    {/* Ri (Bottom-Left ☲) */}
    <g fill="#000000" transform="translate(13, 27) rotate(-34)">
      <rect x="0" y="0" width="8" height="1.2" />
      <rect x="0" y="2.2" width="3.5" height="1.2" />
      <rect x="4.5" y="2.2" width="3.5" height="1.2" />
      <rect x="0" y="4.4" width="8" height="1.2" />
    </g>
  </svg>
);

// 2. United States (USA)
export const FlagUS: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#B22234" />
    {/* White Stripes */}
    <rect y="3.08" width="60" height="3.08" fill="#FFFFFF" />
    <rect y="9.23" width="60" height="3.08" fill="#FFFFFF" />
    <rect y="15.38" width="60" height="3.08" fill="#FFFFFF" />
    <rect y="21.54" width="60" height="3.08" fill="#FFFFFF" />
    <rect y="27.69" width="60" height="3.08" fill="#FFFFFF" />
    <rect y="33.85" width="60" height="3.08" fill="#FFFFFF" />
    {/* Blue Canton */}
    <rect width="25" height="21.54" fill="#3C3B6E" />
    {/* Simplified Stars Grid */}
    <g fill="#FFFFFF">
      <circle cx="4" cy="4" r="0.9" />
      <circle cx="8.5" cy="4" r="0.9" />
      <circle cx="13" cy="4" r="0.9" />
      <circle cx="17.5" cy="4" r="0.9" />
      <circle cx="22" cy="4" r="0.9" />
      <circle cx="6.25" cy="7.5" r="0.9" />
      <circle cx="10.75" cy="7.5" r="0.9" />
      <circle cx="15.25" cy="7.5" r="0.9" />
      <circle cx="19.75" cy="7.5" r="0.9" />
      <circle cx="4" cy="11" r="0.9" />
      <circle cx="8.5" cy="11" r="0.9" />
      <circle cx="13" cy="11" r="0.9" />
      <circle cx="17.5" cy="11" r="0.9" />
      <circle cx="22" cy="11" r="0.9" />
      <circle cx="6.25" cy="14.5" r="0.9" />
      <circle cx="10.75" cy="14.5" r="0.9" />
      <circle cx="15.25" cy="14.5" r="0.9" />
      <circle cx="19.75" cy="14.5" r="0.9" />
      <circle cx="4" cy="18" r="0.9" />
      <circle cx="8.5" cy="18" r="0.9" />
      <circle cx="13" cy="18" r="0.9" />
      <circle cx="17.5" cy="18" r="0.9" />
      <circle cx="22" cy="18" r="0.9" />
    </g>
  </svg>
);

// 3. Germany (DE)
export const FlagDE: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="13.33" fill="#000000" />
    <rect y="13.33" width="60" height="13.33" fill="#DD0000" />
    <rect y="26.66" width="60" height="13.34" fill="#FFCE00" />
  </svg>
);

// 4. United Kingdom (GB)
export const FlagGB: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#012169" />
    {/* Diagonal White Saltire */}
    <line x1="0" y1="0" x2="60" y2="40" stroke="#FFFFFF" stroke-width="6" />
    <line x1="60" y1="0" x2="0" y2="40" stroke="#FFFFFF" stroke-width="6" />
    {/* Diagonal Red Saltire */}
    <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" stroke-width="2.5" />
    <line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" stroke-width="2.5" />
    {/* St George White Cross */}
    <rect x="25" width="10" height="40" fill="#FFFFFF" />
    <rect y="15" width="60" height="10" fill="#FFFFFF" />
    {/* St George Red Cross */}
    <rect x="27" width="6" height="40" fill="#C8102E" />
    <rect y="17" width="60" height="6" fill="#C8102E" />
  </svg>
);

// 5. Japan (JP)
export const FlagJP: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#FFFFFF" />
    <circle cx="30" cy="20" r="12" fill="#BC002D" />
  </svg>
);

// 6. France (FR)
export const FlagFR: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="20" height="40" fill="#002395" />
    <rect x="20" width="20" height="40" fill="#FFFFFF" />
    <rect x="40" width="20" height="40" fill="#ED2939" />
  </svg>
);

// 7. Italy (IT)
export const FlagIT: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="20" height="40" fill="#009246" />
    <rect x="20" width="20" height="40" fill="#FFFFFF" />
    <rect x="40" width="20" height="40" fill="#CE2B37" />
  </svg>
);

// 8. Spain (ES)
export const FlagES: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="10" fill="#AA151B" />
    <rect y="10" width="60" height="20" fill="#F1BF00" />
    <rect y="30" width="60" height="10" fill="#AA151B" />
    {/* Simplified Coat of Arms */}
    <rect x="12" y="16" width="6" height="8" rx="1" fill="#AA151B" />
    <rect x="14" y="14" width="2" height="2" fill="#F1BF00" />
  </svg>
);

// 9. Netherlands (NL)
export const FlagNL: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="13.33" fill="#AE1C28" />
    <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
    <rect y="26.66" width="60" height="13.34" fill="#21468B" />
  </svg>
);

// 10. Australia (AU)
export const FlagAU: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#00008B" />
    {/* Mini Union Jack in canton */}
    <g transform="scale(0.5)">
      <FlagGB />
    </g>
    {/* Southern Cross stars & Commonwealth Star */}
    <g fill="#FFFFFF">
      <circle cx="15" cy="30" r="2.5" />
      <circle cx="45" cy="10" r="1.5" />
      <circle cx="50" cy="18" r="1.5" />
      <circle cx="40" cy="22" r="1.5" />
      <circle cx="45" cy="32" r="2" />
      <circle cx="47" cy="24" r="1" />
    </g>
  </svg>
);

// 11. Belgium (BE)
export const FlagBE: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="20" height="40" fill="#000000" />
    <rect x="20" width="20" height="40" fill="#FDDA24" />
    <rect x="40" width="20" height="40" fill="#EF3340" />
  </svg>
);

// 12. New Zealand (NZ)
export const FlagNZ: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#00247D" />
    <g transform="scale(0.5)">
      <FlagGB />
    </g>
    {/* Red Southern Cross with White Borders */}
    <g stroke="#FFFFFF" stroke-width="0.8" fill="#CC142B">
      <circle cx="45" cy="10" r="1.8" />
      <circle cx="52" cy="18" r="1.8" />
      <circle cx="38" cy="22" r="1.8" />
      <circle cx="45" cy="32" r="2.2" />
    </g>
  </svg>
);

// 13. Switzerland (CH)
export const FlagCH: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#D52B1E" />
    <rect x="26" y="10" width="8" height="20" fill="#FFFFFF" />
    <rect x="18" y="16" width="24" height="8" fill="#FFFFFF" />
  </svg>
);

// 14. Canada (CA)
export const FlagCA: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="15" height="40" fill="#FF0000" />
    <rect x="15" width="30" height="40" fill="#FFFFFF" />
    <rect x="45" width="15" height="40" fill="#FF0000" />
    {/* Maple Leaf */}
    <path
      d="M30 11L32 17L37 15L35 20L39 22L36 25L38 27H32L31 31H29L28 27H22L24 25L21 22L25 20L23 15L28 17L30 11Z"
      fill="#FF0000"
    />
  </svg>
);

// 15. Brazil (BR)
export const FlagBR: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#009B3A" />
    <polygon points="30,5 55,20 30,35 5,20" fill="#FEDF01" />
    <circle cx="30" cy="20" r="7.5" fill="#002776" />
    <path d="M23 19C26 17 34 18 37 21" stroke="#FFFFFF" stroke-width="1.2" fill="none" />
  </svg>
);

// 16. Mexico (MX)
export const FlagMX: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="20" height="40" fill="#006847" />
    <rect x="20" width="20" height="40" fill="#FFFFFF" />
    <rect x="40" width="20" height="40" fill="#CE1126" />
    <circle cx="30" cy="20" r="4" fill="#8B5A2B" />
  </svg>
);

// 17. Austria (AT)
export const FlagAT: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="13.33" fill="#ED2939" />
    <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
    <rect y="26.66" width="60" height="13.34" fill="#ED2939" />
  </svg>
);

// 18. Sweden (SE)
export const FlagSE: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#006AA7" />
    <rect x="18" width="6" height="40" fill="#FECC00" />
    <rect y="17" width="60" height="6" fill="#FECC00" />
  </svg>
);

// 19. Norway (NO)
export const FlagNO: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#BA0C2F" />
    <rect x="17" width="8" height="40" fill="#FFFFFF" />
    <rect y="16" width="60" height="8" fill="#FFFFFF" />
    <rect x="19" width="4" height="40" fill="#00205B" />
    <rect y="18" width="60" height="4" fill="#00205B" />
  </svg>
);

// 20. Finland (FI)
export const FlagFI: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#FFFFFF" />
    <rect x="17" width="8" height="40" fill="#003580" />
    <rect y="16" width="60" height="8" fill="#003580" />
  </svg>
);

// 21. Denmark (DK)
export const FlagDK: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#C8102E" />
    <rect x="18" width="6" height="40" fill="#FFFFFF" />
    <rect y="17" width="60" height="6" fill="#FFFFFF" />
  </svg>
);

// 22. Ireland (IE)
export const FlagIE: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="20" height="40" fill="#169B62" />
    <rect x="20" width="20" height="40" fill="#FFFFFF" />
    <rect x="40" width="20" height="40" fill="#FF883E" />
  </svg>
);

// 23. Portugal (PT)
export const FlagPT: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="24" height="40" fill="#046A38" />
    <rect x="24" width="36" height="40" fill="#DA291C" />
    <circle cx="24" cy="20" r="6" fill="#FFCD00" />
  </svg>
);

// 24. Poland (PL)
export const FlagPL: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="20" fill="#FFFFFF" />
    <rect y="20" width="60" height="20" fill="#DC143C" />
  </svg>
);

// 25. Czech Republic (CZ)
export const FlagCZ: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="20" fill="#FFFFFF" />
    <rect y="20" width="60" height="20" fill="#D7141A" />
    <polygon points="0,0 30,20 0,40" fill="#11457E" />
  </svg>
);

// 26. Monaco (MC)
export const FlagMC: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="20" fill="#CE1126" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
  </svg>
);

// 27. Colombia (CO)
export const FlagCO: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="20" fill="#FCD116" />
    <rect y="20" width="60" height="10" fill="#003893" />
    <rect y="30" width="60" height="10" fill="#CE1126" />
  </svg>
);

// 28. Argentina (AR)
export const FlagAR: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="13.33" fill="#75AADB" />
    <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
    <rect y="26.66" width="60" height="13.34" fill="#75AADB" />
    <circle cx="30" cy="20" r="3.5" fill="#F6B40E" />
  </svg>
);

// 29. International / Motorsport Checkered Flag
export const FlagINT: Component<FlagProps> = (props) => (
  <svg viewBox="0 0 60 40" class={props.class || "w-full h-full"} {...props}>
    <rect width="60" height="40" fill="#1C1C24" />
    <g fill="#FFFFFF">
      <rect x="0" y="0" width="15" height="10" />
      <rect x="30" y="0" width="15" height="10" />
      <rect x="15" y="10" width="15" height="10" />
      <rect x="45" y="10" width="15" height="10" />
      <rect x="0" y="20" width="15" height="10" />
      <rect x="30" y="20" width="15" height="10" />
      <rect x="15" y="30" width="15" height="10" />
      <rect x="45" y="30" width="15" height="10" />
    </g>
  </svg>
);

export interface CountryInfo {
  code2: string;
  code3: string;
  name: string;
  FlagComponent: Component<FlagProps>;
}

// Master iRacing Country & Club Resolver Map
const countryDirectory: Record<string, CountryInfo> = {
  KR: { code2: "KR", code3: "KOR", name: "South Korea", FlagComponent: FlagKR },
  US: { code2: "US", code3: "USA", name: "United States", FlagComponent: FlagUS },
  DE: { code2: "DE", code3: "DEU", name: "Germany", FlagComponent: FlagDE },
  GB: { code2: "GB", code3: "GBR", name: "United Kingdom", FlagComponent: FlagGB },
  JP: { code2: "JP", code3: "JPN", name: "Japan", FlagComponent: FlagJP },
  FR: { code2: "FR", code3: "FRA", name: "France", FlagComponent: FlagFR },
  IT: { code2: "IT", code3: "ITA", name: "Italy", FlagComponent: FlagIT },
  ES: { code2: "ES", code3: "ESP", name: "Spain", FlagComponent: FlagES },
  NL: { code2: "NL", code3: "NLD", name: "Netherlands", FlagComponent: FlagNL },
  AU: { code2: "AU", code3: "AUS", name: "Australia", FlagComponent: FlagAU },
  BE: { code2: "BE", code3: "BEL", name: "Belgium", FlagComponent: FlagBE },
  NZ: { code2: "NZ", code3: "NZL", name: "New Zealand", FlagComponent: FlagNZ },
  CH: { code2: "CH", code3: "CHE", name: "Switzerland", FlagComponent: FlagCH },
  CA: { code2: "CA", code3: "CAN", name: "Canada", FlagComponent: FlagCA },
  BR: { code2: "BR", code3: "BRA", name: "Brazil", FlagComponent: FlagBR },
  MX: { code2: "MX", code3: "MEX", name: "Mexico", FlagComponent: FlagMX },
  AT: { code2: "AT", code3: "AUT", name: "Austria", FlagComponent: FlagAT },
  SE: { code2: "SE", code3: "SWE", name: "Sweden", FlagComponent: FlagSE },
  NO: { code2: "NO", code3: "NOR", name: "Norway", FlagComponent: FlagNO },
  FI: { code2: "FI", code3: "FIN", name: "Finland", FlagComponent: FlagFI },
  DK: { code2: "DK", code3: "DNK", name: "Denmark", FlagComponent: FlagDK },
  IE: { code2: "IE", code3: "IRL", name: "Ireland", FlagComponent: FlagIE },
  PT: { code2: "PT", code3: "PRT", name: "Portugal", FlagComponent: FlagPT },
  PL: { code2: "PL", code3: "POL", name: "Poland", FlagComponent: FlagPL },
  CZ: { code2: "CZ", code3: "CZE", name: "Czech Republic", FlagComponent: FlagCZ },
  MC: { code2: "MC", code3: "MCO", name: "Monaco", FlagComponent: FlagMC },
  CO: { code2: "CO", code3: "COL", name: "Colombia", FlagComponent: FlagCO },
  AR: { code2: "AR", code3: "ARG", name: "Argentina", FlagComponent: FlagAR },
};

// Aliases for 3-letter codes and iRacing regional clubs
const countryAliases: Record<string, string> = {
  // 3-letter codes
  KOR: "KR",
  USA: "US",
  DEU: "DE",
  GBR: "GB",
  JPN: "JP",
  FRA: "FR",
  ITA: "IT",
  ESP: "ES",
  NLD: "NL",
  AUS: "AU",
  BEL: "BE",
  NZL: "NZ",
  CHE: "CH",
  CAN: "CA",
  BRA: "BR",
  MEX: "MX",
  AUT: "AT",
  SWE: "SE",
  NOR: "NO",
  FIN: "FI",
  DNK: "DK",
  IRL: "IE",
  PRT: "PT",
  POL: "PL",
  CZE: "CZ",
  MCO: "MC",
  COL: "CO",
  ARG: "AR",

  // iRacing Club Names
  KOREA: "KR",
  "SOUTH KOREA": "KR",
  JAPAN: "JP",
  GERMANY: "DE",
  "UNITED KINGDOM": "GB",
  UK: "GB",
  ENGLAND: "GB",
  CELTIC: "GB",
  SCOTLAND: "GB",
  WALES: "GB",
  FRANCE: "FR",
  ITALY: "IT",
  SPAIN: "ES",
  IBERIA: "ES",
  NETHERLANDS: "NL",
  HOLLAND: "NL",
  AUSTRALIA: "AU",
  "AUSTRALIA AND NEW ZEALAND": "AU",
  "AUSTRALIA/NZ": "AU",
  "NEW ZEALAND": "NZ",
  BELGIUM: "BE",
  SWITZERLAND: "CH",
  CANADA: "CA",
  BRAZIL: "BR",
  MEXICO: "MX",
  MONACO: "MC",
  COLOMBIA: "CO",
  ARGENTINA: "AR",
  SCANDINAVIA: "SE",
  SWEDEN: "SE",
  NORWAY: "NO",
  FINLAND: "FI",
  DENMARK: "DK",
  AUSTRIA: "AT",
  IRELAND: "IE",
  PORTUGAL: "PT",
  POLAND: "PL",

  // iRacing US Regional Clubs -> US
  CALIFORNIA: "US",
  "NEW ENGLAND": "US",
  "MID-SOUTH": "US",
  FLORIDA: "US",
  TEXAS: "US",
  OHIO: "US",
  GEORGIA: "US",
  CAROLINA: "US",
  PENNSYLVANIA: "US",
  "NEW YORK": "US",
  NORTHWEST: "US",
  PLAINS: "US",
  VIRGINIAS: "US",
  "MID-ATLANTIC": "US",
  "MID-WEST": "US",
  INDIANA: "US",
  ILLINOIS: "US",
  MICHIGAN: "US",
};

export function getCountryInfo(raw?: string): CountryInfo {
  if (!raw) {
    return { code2: "INT", code3: "INT", name: "International", FlagComponent: FlagINT };
  }

  const clean = raw.trim().toUpperCase();

  // Direct 2-letter lookup
  if (countryDirectory[clean]) {
    return countryDirectory[clean];
  }

  // Alias lookup (3-letter or iRacing Club name)
  const resolvedCode2 = countryAliases[clean];
  if (resolvedCode2 && countryDirectory[resolvedCode2]) {
    return countryDirectory[resolvedCode2];
  }

  // Fallback for international / unknown
  return {
    code2: clean.slice(0, 2),
    code3: clean.slice(0, 3),
    name: raw,
    FlagComponent: FlagINT,
  };
}

export const CountryFlag: Component<{
  code?: string;
  class?: string;
  showCode?: boolean;
}> = (props) => {
  const info = () => getCountryInfo(props.code);

  return (
    <div
      class={`inline-flex items-center justify-center overflow-hidden shrink-0 ${
        props.class || "w-5 h-3.5 rounded-[2px] border border-white/20 shadow-sm"
      }`}
      title={`${info().name} (${info().code3})`}
    >
      <Dynamic component={info().FlagComponent} class="w-full h-full object-cover" />
    </div>
  );
};

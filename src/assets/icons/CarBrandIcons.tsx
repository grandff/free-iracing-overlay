import { Component, createSignal, Show } from "solid-js";

// ponytail: brand marks are static files in /brands/, not inlined SVG.
// 33 marks = 208KB on disk but 0KB of JS bundle, and only the ~8 brands present in a
// session are ever fetched. Every mark is a 24x24 square viewBox in white, so the
// leaderboard brand column is uniform without per-brand sizing rules.
// Regenerate with: npm run setup-brands

/** Brand keyword -> file stem in /brands/. Keys are matched lowercase. */
const brandFileMap: Record<string, string> = {
  // --- iRacing GT / prototype manufacturers ---
  porsche: "porsche",
  ferrari: "ferrari",
  lamborghini: "lamborghini",
  mclaren: "mclaren",
  "aston martin": "aston-martin",
  aston: "aston-martin",
  bmw: "bmw",
  mercedes: "mercedes",
  "mercedes-amg": "mercedes",
  "mercedes-benz": "mercedes",
  amg: "mercedes",
  audi: "audi",
  cadillac: "cadillac",
  chevrolet: "chevrolet",
  chevy: "chevrolet",
  corvette: "chevrolet",
  ford: "ford",
  acura: "acura",
  honda: "honda",
  toyota: "toyota",
  nissan: "nissan",
  hyundai: "hyundai",
  mazda: "mazda",
  subaru: "subaru",
  bentley: "bentley",
  maserati: "maserati",
  bugatti: "bugatti",
  koenigsegg: "koenigsegg",
  mini: "mini",
  mitsubishi: "mitsubishi",
  lancer: "mitsubishi",
  evo: "mitsubishi",

  // --- road / touring ---
  volkswagen: "volkswagen",
  vw: "volkswagen",
  renault: "renault",
  peugeot: "peugeot",
  kia: "kia",
  fiat: "fiat",
  opel: "opel",
  skoda: "skoda",
  seat: "seat",
  dacia: "dacia",

  // --- teams that appear as a "brand" in session data ---
  "red bull": "redbull",
  redbull: "redbull",

  // --- hand-authored marks (scripts/brand-extras/) ---
  lexus: "lexus",
  "rc f": "lexus",
  "alfa romeo": "alfa-romeo",
  alfa: "alfa-romeo",
  alpine: "alpine",
  a424: "alpine",
  lotus: "lotus",
  pontiac: "pontiac",
  solstice: "pontiac",

  // --- iRacing chassis constructors whose logo IS a wordmark: text is the
  //     faithful rendering, so map them to "" and let the text fallback run. ---
  dallara: "",
  oreca: "",
  ligier: "",
  radical: "",
  riley: "",
  williams: "",
  ruf: "",
  holden: "",
  commodore: "",

  // --- iRacing car model names -> manufacturer ---
  "911": "porsche",
  "963": "porsche",
  "992": "porsche",
  cayman: "porsche",
  "296": "ferrari",
  "488": "ferrari",
  "499p": "ferrari",
  huracan: "lamborghini",
  lambo: "lamborghini",
  "720s": "mclaren",
  "570s": "mclaren",
  vantage: "aston-martin",
  "m4": "bmw",
  "m hybrid": "bmw",
  z4: "bmw",
  "r8": "audi",
  "v-series": "cadillac",
  "c8": "chevrolet",
  mustang: "ford",
  gt3: "", // class name, never a brand — force text fallback
  "mx-5": "mazda",
  miata: "mazda",
  brz: "subaru",
  nsx: "acura",
  supra: "toyota",
  "gr86": "toyota",
  "gt-r": "nissan",
  gtr: "nissan",
  elantra: "hyundai",
  veloster: "hyundai",
  "ir-18": "",
  p217: "",
  "js p320": "",
  "sr8": "",
  "sr10": "",
};

/**
 * Resolve a brand/car name to a mark URL, or null when we have no mark for it.
 * Null is a normal outcome (Lexus, Alfa Romeo, Dallara, Radical, Ligier, Oreca…) —
 * callers render the brand text instead.
 */
export function getCarBrandImageSrc(brandName?: string): string | null {
  if (!brandName) return null;
  const key = brandName.toLowerCase().trim();

  const exact = brandFileMap[key];
  if (exact) return `/brands/${exact}.svg`;
  if (exact === "") return null; // explicitly mapped to "no mark"

  // Longest match first so "aston martin" beats "aston", "mercedes-amg" beats "amg".
  const hit = Object.keys(brandFileMap)
    .filter((k) => brandFileMap[k] && key.includes(k))
    .sort((a, b) => b.length - a.length)[0];

  return hit ? `/brands/${brandFileMap[hit]}.svg` : null;
}

/**
 * Brand mark with a text fallback. Falls back on BOTH "no mark mapped" and
 * "mark failed to load" — a missing or corrupt file can never render as a broken
 * image placeholder, which is how the previous asset set failed.
 */
export const CarBrandIcon: Component<{
  brand?: string;
  class?: string;
  size?: number;
}> = (props) => {
  const [failed, setFailed] = createSignal(false);
  const src = () => (failed() ? null : getCarBrandImageSrc(props.brand));

  return (
    <Show
      when={src()}
      fallback={
        <span
          class="text-[9px] font-mono font-bold text-white/70 truncate text-center tracking-tight px-0.5"
          title={props.brand}
        >
          {props.brand}
        </span>
      }
    >
      {(url) => (
        <img
          src={url()}
          alt={props.brand || ""}
          title={props.brand}
          class={props.class || "w-4 h-4 object-contain"}
          width={props.size}
          height={props.size}
          loading="eager"
          onError={() => setFailed(true)}
        />
      )}
    </Show>
  );
};

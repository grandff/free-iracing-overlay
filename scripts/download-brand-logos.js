// ponytail: ONE source, one format. The previous version pulled from 4 different
// hosts (worldvectorlogo / wikipedia / vehiclespecs / car-logos-dataset) which gave
// mixed PNG+SVG, 1MB files, dark-on-dark logos, ragged aspect ratios, and one file
// that was an HTTP error page saved as .svg.
//
// Simple Icons gives every brand as a single <path> on a 24x24 square viewBox in a
// colour we choose -> uniform size, guaranteed legible on the dark HUD, ~1-20KB each.
// Brands it does not carry are hand-authored in scripts/brand-extras/.
import fs from "fs";
import path from "path";

const brandsDir = path.resolve("public/brands");
const extrasDir = path.resolve("scripts/brand-extras");

// Rendered white: the overlay is a dark carbon HUD, and broadcast timing towers use
// monochrome manufacturer marks. Colour-per-brand is what made half of these invisible.
const FILL = "white";

// key = filename stem used by src/assets/icons/CarBrandIcons.tsx
const SLUGS = {
  acura: "acura",
  "aston-martin": "astonmartin",
  audi: "audi",
  bentley: "bentley",
  bmw: "bmw",
  bugatti: "bugatti",
  cadillac: "cadillac",
  chevrolet: "chevrolet",
  dacia: "dacia",
  fiat: "fiat",
  ferrari: "ferrari",
  ford: "ford",
  honda: "honda",
  hyundai: "hyundai",
  kia: "kia",
  koenigsegg: "koenigsegg",
  lamborghini: "lamborghini",
  maserati: "maserati",
  mazda: "mazda",
  mclaren: "mclaren",
  mini: "mini",
  mitsubishi: "mitsubishi",
  nissan: "nissan",
  opel: "opel",
  peugeot: "peugeot",
  porsche: "porsche",
  redbull: "redbull",
  renault: "renault",
  seat: "seat",
  skoda: "skoda",
  subaru: "subaru",
  toyota: "toyota",
  volkswagen: "volkswagen",
};

fs.mkdirSync(brandsDir, { recursive: true });

console.log("==================================================");
console.log(`🏎️  Car brand marks -> public/brands/  (24x24, ${FILL})`);
console.log("==================================================");

let ok = 0;
let failed = [];

for (const [file, slug] of Object.entries(SLUGS)) {
  const dest = path.join(brandsDir, `${file}.svg`);
  try {
    const res = await fetch(`https://cdn.simpleicons.org/${slug}/${FILL}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const svg = await res.text();
    // Guard against the previous bug: an error page saved with an .svg extension.
    if (!svg.trimStart().startsWith("<svg") || !svg.includes("<path")) {
      throw new Error("response is not an SVG");
    }
    fs.writeFileSync(dest, svg);
    console.log(`  ✅ ${file}.svg`.padEnd(28) + `${(svg.length / 1024).toFixed(1)} KB`);
    ok++;
  } catch (e) {
    failed.push(`${file} (${e.message})`);
    console.log(`  ❌ ${file}.svg — ${e.message}`);
  }
}

// Brands Simple Icons does not carry (trademark policy). Hand-authored, same 24x24 grid.
if (fs.existsSync(extrasDir)) {
  for (const f of fs.readdirSync(extrasDir).filter((n) => n.endsWith(".svg"))) {
    fs.copyFileSync(path.join(extrasDir, f), path.join(brandsDir, f));
    console.log(`  ✅ ${f}`.padEnd(28) + "(hand-authored)");
    ok++;
  }
}

console.log("--------------------------------------------------");
console.log(`${ok} marks written to public/brands/`);
if (failed.length) {
  console.log(`\n⚠️  ${failed.length} failed — these fall back to brand text in the HUD:`);
  failed.forEach((f) => console.log(`   • ${f}`));
}
console.log("\nBrands with no mark available (Lexus, Alfa Romeo, Alpine, Dallara,");
console.log("Radical, Ligier, Oreca) intentionally render as text in the leaderboard.");
console.log("==================================================");

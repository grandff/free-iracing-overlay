// Verifies every iRacing manufacturer resolves to a mark that exists on disk,
// or to a deliberate text fallback. Imports the REAL resolver, not a copy.
import fs from "fs";
import path from "path";
import { build } from "esbuild";

const outfile = path.join(process.cwd(), "node_modules/.cache/brandmap.mjs");
await build({
  entryPoints: ["src/assets/icons/CarBrandIcons.tsx"],
  outfile, bundle: true, format: "esm", platform: "node",
  loader: { ".tsx": "tsx" }, logLevel: "silent",
  // The test only calls getCarBrandImageSrc (no JSX). Compile JSX to inert stubs
  // so the module imports under plain node without a Solid runtime.
  jsx: "transform", jsxFactory: "__h", jsxFragment: "__F",
  banner: { js: "const __h=()=>null,__F=null;" },
  plugins: [{ name:"stub-solid", setup(b){ b.onResolve({filter:/^solid-js/},()=>({path:"solid",namespace:"stub"})); b.onLoad({filter:/.*/,namespace:"stub"},()=>({contents:"export const createSignal=()=>[()=>0,()=>{}];export const Show=null;",loader:"js"})); } }],
});
const { getCarBrandImageSrc } = await import("file://" + outfile);

// Every manufacturer / chassis constructor in iRacing's car roster,
// plus real CarScreenName strings as the SDK reports them.
const BRANDS = ["Acura","Alfa Romeo","Alpine","Aston Martin","Audi","Bentley","BMW","Cadillac",
"Chevrolet","Corvette","Dallara","Ferrari","Ford","Holden","Honda","Hyundai","Kia","Lamborghini",
"Lexus","Ligier","Lotus","Maserati","Mazda","McLaren","Mercedes","Mercedes-AMG","Mini","Nissan",
"Oreca","Peugeot","Pontiac","Porsche","Radical","Renault","Riley","Ruf","Skoda","Subaru","Toyota",
"Volkswagen","Williams","Red Bull","Mitsubishi","Bugatti","Koenigsegg","Fiat","Opel","Seat","Dacia"];

const SCREEN_NAMES = ["Porsche 911 GT3 R","Ferrari 296 GT3","BMW M4 GT3","Mercedes-AMG GT3 2020",
"Audi R8 LMS EVO II","Lamborghini Huracan GT3 EVO","McLaren 720S GT3 EVO","Aston Martin Vantage GT3",
"Lexus RC F GT3","Chevrolet Corvette Z06 GT3.R","Ford Mustang GT3","Acura NSX GT3 EVO 22",
"Porsche 963 GTP","Cadillac V-Series.R GTP","Acura ARX-06 GTP","Dallara IR-18","Dallara P217",
"Ligier JS P320","Radical SR10","Mazda MX-5 Cup","Hyundai Elantra N TCR","Honda Civic Type R TCR",
"Toyota GR86","Ruf RT 12R","Lotus 79","Holden Commodore VF","Pontiac Solstice","Alpine A424",
"Alfa Romeo Giulia","Global Mazda MX-5 Cup","Porsche 718 Cayman GT4","BMW Z4 GT3","Subaru WRX"];

const files = new Set(fs.readdirSync("public/brands"));
let mark = 0, text = 0;
const broken = [];

for (const b of [...BRANDS, ...SCREEN_NAMES]) {
  const src = getCarBrandImageSrc(b);
  if (!src) { text++; console.log(`🔤 ${b.padEnd(30)} text`); continue; }
  const f = src.split("/").pop();
  if (!files.has(f)) { broken.push(`${b} -> ${f} (missing)`); console.log(`❌ ${b.padEnd(30)} ${f}`); }
  else { mark++; console.log(`🖼  ${b.padEnd(30)} ${f}`); }
}

// Every shipped file must be reachable from the map, or it is dead weight.
const reachable = new Set();
for (const b of [...BRANDS, ...SCREEN_NAMES]) {
  const s = getCarBrandImageSrc(b);
  if (s) reachable.add(s.split("/").pop());
}
const orphans = [...files].filter((f) => !reachable.has(f));

console.log("-".repeat(56));
console.log(`marks ${mark} | text fallback ${text} | broken ${broken.length}`);
if (orphans.length) console.log(`unreferenced files: ${orphans.join(", ")}`);
if (broken.length) { console.error("\nBROKEN:"); broken.forEach((b) => console.error("  " + b)); process.exit(1); }

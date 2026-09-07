import fs from "fs";
import path from "path";

const fontsDir = path.resolve("public/fonts");
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

console.log("==================================================");
console.log("🏎️  F1 Formula 1 Official Typography System");
console.log("==================================================");
console.log(`Checking fonts in: ${fontsDir}\n`);

const expectedFonts = [
  "Formula1-Bold.woff2",
  "Formula1-Regular.woff2",
  "Formula1-Wide.woff2",
];

const found = [];
const missing = [];

for (const font of expectedFonts) {
  if (fs.existsSync(path.join(fontsDir, font))) {
    found.push(font);
  } else {
    missing.push(font);
  }
}

if (found.length > 0) {
  console.log("✅ Installed F1 Official Fonts:");
  found.forEach((f) => console.log(`   • ${f}`));
}

if (missing.length > 0) {
  console.log("\n⚠️  Missing F1 Official Fonts (Proprietary Asset):");
  missing.forEach((f) => console.log(`   • ${f}`));
  console.log("\n💡 WebFont Fallback Active:");
  console.log("   • Titillium Web (Google Fonts - Broadcast Timing)");
  console.log("   • Chakra Petch (Google Fonts - Digital Telemetry Tabular)");
  console.log("\n👉 How to install official F1 fonts:");
  console.log("   1. Copy Formula1-*.woff2 files into public/fonts/");
  console.log("   2. Or install Formula 1 font in your OS font book.");
  console.log("   3. Refresh http://localhost:1420 to immediately apply!");
}
console.log("==================================================");

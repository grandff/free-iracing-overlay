import fs from "fs";
import path from "path";
import https from "https";

const fontsDir = path.resolve("public/fonts");
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

console.log("==================================================");
console.log("🏎️  F1 Formula 1 Typography Setup Engine");
console.log("==================================================");

const fontSources = [
  {
    target: "Formula1-Bold.woff2",
    url: "https://raw.githubusercontent.com/Thomson-19/F1-Fonts/main/F1-Display-Bold.woff2",
  },
  {
    target: "Formula1-Regular.woff2",
    url: "https://raw.githubusercontent.com/Thomson-19/F1-Fonts/main/F1-Display-Regular.woff2",
  },
  {
    target: "Formula1-Wide.woff2",
    url: "https://raw.githubusercontent.com/Thomson-19/F1-Fonts/main/F1-Display-Wide.woff2",
  },
];

async function downloadFont(source) {
  const filePath = path.join(fontsDir, source.target);
  if (fs.existsSync(filePath)) {
    const size = fs.statSync(filePath).size;
    if (size > 1000) {
      console.log(`✅ ${source.target} already installed (${(size / 1024).toFixed(1)} KB)`);
      return;
    }
  }

  console.log(`⬇️  Downloading ${source.target}...`);
  return new Promise((resolve) => {
    https.get(source.url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (redirRes) => {
          const file = fs.createWriteStream(filePath);
          redirRes.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log(`✅ Installed: ${source.target}`);
            resolve();
          });
        }).on("error", () => resolve());
      } else if (res.statusCode === 200) {
        const file = fs.createWriteStream(filePath);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`✅ Installed: ${source.target}`);
          resolve();
        });
      } else {
        console.log(`⚠️  Could not fetch ${source.target} (HTTP ${res.statusCode}), using Google WebFont fallback.`);
        resolve();
      }
    }).on("error", (err) => {
      console.log(`⚠️  Network error for ${source.target}: ${err.message}`);
      resolve();
    });
  });
}

async function main() {
  for (const src of fontSources) {
    await downloadFont(src);
  }
  console.log("==================================================");
  console.log("🎉 Typography setup complete! (Default: Roboto, F1: Formula1/Roboto)");
}

main();

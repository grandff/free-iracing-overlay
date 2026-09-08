# Third-Party Notices

This project's own source code is MIT licensed (see [LICENSE](LICENSE)). Everything
listed here is **not** covered by that license and belongs to its respective owner.

---

## 1. Trademark disclaimer

This is an unofficial, community-built tool. It is **not** affiliated with,
endorsed by, sponsored by, or in any way officially connected to:

- **iRacing.com Motorsport Simulations, LLC** ("iRacing")
- **Formula One World Championship Limited** / **Formula One Group**
  (F1®, FORMULA 1®, the F1 logo, GRAND PRIX®, and related marks)
- the FIA World Endurance Championship (WEC), the FIA World Rally Championship
  (WRC), INDYCAR, or IMSA
- any vehicle manufacturer whose emblem appears in the interface

All product names, logos, trademarks, and registered trademarks are the property
of their respective owners. Their use here is nominative — to identify the
real-world series and cars a user is racing — and does not imply endorsement.

---

## 2. Fonts

### Formula1 (Formula1 Display / Formula1 Wide)

**Proprietary. Not distributed with this repository. Not redistributable.**

Owned by Formula One World Championship Limited. The files are **not** committed
to this repository; `npm run setup-fonts` fetches them into `public/fonts/`
(git-ignored) on the developer's own machine.

If the files are absent the overlay falls back to Roboto and works normally.

Anyone packaging or redistributing a build of this project is responsible for
confirming they hold the rights to embed this typeface. **If you are unsure, do
not run `npm run setup-fonts` before building** — the fallback is legally safe.

A permissively licensed alternative with a similar motorsport feel is
**Titillium Web** (SIL Open Font License 1.1), which Formula 1 itself used for
broadcast graphics until 2017.

### Roboto, Roboto Mono, Titillium Web, Barlow Condensed, Chakra Petch

Apache License 2.0 / SIL Open Font License 1.1. Loaded at runtime from Google
Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`); not committed here.

---

## 3. Manufacturer emblems — `public/brands/*.svg`

Retrieved by `npm run setup-brands` from **Simple Icons**
(<https://simpleicons.org>), whose icon files are released under **CC0 1.0
Universal**.

CC0 covers the *icon artwork files only*. The **brands they depict remain
registered trademarks** of Porsche, Ferrari, BMW, Mercedes-Benz, Audi, Toyota,
Red Bull, and the other manufacturers shown. Simple Icons states this explicitly,
and it applies here unchanged.

---

## 4. Series marks drawn in source — `src/assets/icons/Icons.tsx`

`LogoF1`, `LogoWEC`, `LogoWRC`, `LogoIndyCar`, and `LogoIMSA` are inline SVG
representations of championship logos. The drawings are original to this
repository; the **marks themselves are not**. They are trademarks of their
respective series owners.

The overlay ships a **"Show Series Logo" toggle** (program settings → HUD) so the
mark can be turned off entirely.

---

## 5. iRacing SDK

Field names and memory layout (`irsdk_*`, `CarIdx*`) come from iRacing's publicly
documented shared-memory telemetry interface. No iRacing code, asset, or header
is vendored here — only the names required to read the map.

---

## 6. Runtime and build dependencies

| Package | License |
| --- | --- |
| solid-js | MIT |
| lucide-solid | ISC |
| @tauri-apps/api, @tauri-apps/cli, tauri (Rust) | MIT / Apache-2.0 |
| @tauri-apps/plugin-global-shortcut | MIT / Apache-2.0 |
| vite, vite-plugin-solid | MIT |
| tailwindcss, postcss, autoprefixer | MIT |
| typescript | Apache-2.0 |

Exact resolved versions are in `package-lock.json` / `bun.lock` and
`src-tauri/Cargo.lock`.

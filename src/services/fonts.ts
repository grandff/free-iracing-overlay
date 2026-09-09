// ponytail: document.fonts + crypto.subtle are the native registry and hasher —
// no webfont loader, no crypto library, no build step.
//
// Theme -> official typeface, with an HONEST installed/missing probe and a
// production install path that satisfies both standing asset rules:
//
//   AGENTS.md S10.1-2 (no runtime remote origin): a third-party host could swap
//     the blob under a running overlay, so every byte is checked against a digest
//     pinned here before it is ever registered. Remote bytes are never trusted.
//   AGENTS.md S10.3-11 (no proprietary font in the installer): downloaded faces
//     land in the OS app-data dir and the browser cache, never in `public/`,
//     which `vite build` copies wholesale into the release bundle.
//
// The status shown in the UI used to be a hardcoded green "Active" label. It
// claimed the F1 face was live while `public/fonts/` held nothing but a README,
// so the whole overlay silently rendered in Roboto. Everything here reports what
// the browser actually resolved, never what we hope it resolved.
import { invoke, isTauri } from "@tauri-apps/api/core";
import type { ThemeType } from "../stores/settingsStore.ts";

export type FontStatus = "installed" | "missing" | "theme-unavailable";

export interface FontFaceSpec {
  /** Basename `npm run setup-fonts` writes into public/fonts/. */
  file: string;
  /** Upstream source, fetched once by the native side and hash-checked. */
  url: string;
  /** SHA-256 of the exact bytes we accept. A mismatch aborts the install. */
  sha256: string;
  family: string;
  weight: string;
}

export interface ThemeFont {
  /** CSS family that the theme's --theme-font resolves to. */
  family: string;
  /** Name shown to the user. */
  label: string;
  faces: FontFaceSpec[];
  /** false = the theme itself has not shipped, so there is no font to install yet. */
  themeShipped: boolean;
  rightsHolder?: string;
}

const F1_SRC = "https://raw.githubusercontent.com/Thomson-19/F1-Fonts/main";

// Only F1 ships today (AGENTS.md S7.1). The rest deliberately carry no typeface
// name: naming a face we have not verified would be a fabricated claim in the UI.
export const THEME_FONTS: Record<ThemeType, ThemeFont> = {
  f1: {
    family: "Formula1",
    label: "Formula1 Display",
    themeShipped: true,
    rightsHolder: "Formula One Licensing BV",
    faces: [
      {
        file: "Formula1-Regular.woff2",
        url: `${F1_SRC}/F1-Display-Regular.woff2`,
        sha256: "6887de2582095b0428641a5313b56ecbd36e7f0697c407e31a4f7a216c64f371",
        family: "Formula1",
        weight: "400",
      },
      {
        file: "Formula1-Bold.woff2",
        url: `${F1_SRC}/F1-Display-Bold.woff2`,
        sha256: "c4d76acbd8afaecec69fe940f610d907fe427efba7c459d8fd907f138f6eb0df",
        family: "Formula1",
        weight: "700",
      },
      {
        file: "Formula1-Wide.woff2",
        url: `${F1_SRC}/F1-Display-Wide.woff2`,
        sha256: "400bb5f295137366b330a2fa3c98cfe30c85c0dba9544c078fd6d4439435a27c",
        family: "Formula1 Wide",
        weight: "400 900",
      },
    ],
  },
  wec: { family: "", label: "", faces: [], themeShipped: false },
  wrc: { family: "", label: "", faces: [], themeShipped: false },
  indycar: { family: "", label: "", faces: [], themeShipped: false },
  gt: { family: "", label: "", faces: [], themeShipped: false },
};

/**
 * What the browser actually resolved, right now.
 *
 * Deliberately NOT `document.fonts.check()`. After an in-app install the family
 * holds both the CSS `@font-face` rules (in `error` state, because `public/fonts/`
 * is empty in a packaged build) and the JS-registered faces (`loaded`). `check()`
 * answers false in that mix even though the loaded face is the one rendering —
 * which would report "missing" right after a successful install. Asking whether
 * any face of the family actually loaded is both simpler and correct in every
 * combination: CSS-only, JS-only, or both.
 */
export function fontStatus(theme: ThemeType): FontStatus {
  const font = THEME_FONTS[theme];
  if (!font.themeShipped) return "theme-unavailable";
  for (const face of document.fonts) {
    if (face.family === font.family && face.status === "loaded") return "installed";
  }
  return "missing";
}

/** Terminal command that installs the current theme's typeface. */
export const SETUP_FONTS_COMMAND = "npm run setup-fonts";

// ponytail: base64 in localStorage. Three faces is ~103KB encoded, far under the
// 5MB quota, and it costs ~10 lines against IndexedDB's ~40. Move to IndexedDB
// only if a theme ever ships enough faces to approach the quota.
const CACHE_PREFIX = "iracing_overlay_font_v1:";

function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as unknown as ArrayBuffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Registers one face from raw bytes.
 *
 * `new FontFace(family, buffer)` takes the bytes directly, so this never performs
 * a network fetch and is not subject to the `font-src` CSP directive — the
 * download itself is the native side's job, behind the digest check.
 */
async function registerFace(spec: FontFaceSpec, bytes: Uint8Array): Promise<void> {
  const digest = await sha256Hex(bytes);
  if (digest !== spec.sha256) {
    throw new Error(
      `${spec.file}: digest mismatch (expected ${spec.sha256.slice(0, 12)}…, got ${digest.slice(0, 12)}…)`
    );
  }
  const face = new FontFace(spec.family, bytes as unknown as ArrayBuffer, {
    weight: spec.weight,
    style: "normal",
    display: "swap",
  });
  await face.load();
  document.fonts.add(face);
}

/**
 * Fetches one face's bytes.
 *
 * Packaged: the Rust side performs the HTTPS GET, because the webview's CSP
 * intentionally allows `connect-src 'self'` only — a compromised renderer cannot
 * reach out on its own.
 * Browser/dev: same-origin `public/fonts/`, which is what `npm run setup-fonts`
 * populates.
 */
async function fetchFaceBytes(spec: FontFaceSpec): Promise<Uint8Array> {
  if (isTauri()) {
    const b64 = await invoke<string>("fetch_theme_font", { url: spec.url });
    return fromBase64(b64);
  }
  const res = await fetch(`/fonts/${spec.file}`);
  if (!res.ok) throw new Error(`${spec.file}: HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

export interface InstallResult {
  ok: boolean;
  /** Per-face outcome, in manifest order. */
  faces: { file: string; ok: boolean; error?: string }[];
}

/**
 * Downloads, verifies and registers every face of a theme, caching the verified
 * bytes so later launches skip the network entirely.
 */
export async function installThemeFont(theme: ThemeType): Promise<InstallResult> {
  const font = THEME_FONTS[theme];
  const faces: InstallResult["faces"] = [];

  for (const spec of font.faces) {
    try {
      const bytes = await fetchFaceBytes(spec);
      await registerFace(spec, bytes);
      try {
        localStorage.setItem(CACHE_PREFIX + spec.file, toBase64(bytes));
      } catch {
        // Quota or private mode: the face is registered for this session either way.
      }
      faces.push({ file: spec.file, ok: true });
    } catch (e) {
      faces.push({ file: spec.file, ok: false, error: (e as Error).message });
    }
  }

  return { ok: faces.every((f) => f.ok), faces };
}

/**
 * Re-registers previously verified faces on boot. Cheap enough to run before
 * first paint: no network, and the digest is re-checked so a tampered
 * localStorage entry is dropped rather than trusted.
 */
export async function restoreCachedFonts(theme: ThemeType): Promise<void> {
  const font = THEME_FONTS[theme];
  if (!font.themeShipped) return;

  await Promise.all(
    font.faces.map(async (spec) => {
      const cached = localStorage.getItem(CACHE_PREFIX + spec.file);
      if (!cached) return;
      try {
        await registerFace(spec, fromBase64(cached));
      } catch {
        localStorage.removeItem(CACHE_PREFIX + spec.file);
      }
    })
  );
}

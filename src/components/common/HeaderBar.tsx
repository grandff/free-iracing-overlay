import { Component, Show } from "solid-js";
import { settings, updateSettings, cycleTheme, toggleEditMode, ThemeType } from "../../stores/settingsStore.ts";
import { telemetry } from "../../stores/telemetryStore.ts";
import { IconWarning, IconCompass, IconCrosshair } from "../../assets/icons/Icons.tsx";

export const HeaderBar: Component = () => {
  const themes: ThemeType[] = ["f1", "wec", "wrc", "indycar", "gt"];

  return (
    <div class="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 hud-panel text-xs shadow-2xl transition-all select-none">
      {/* App Brand */}
      <div class="flex items-center gap-2 pr-2 border-r border-white/20">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span class="font-bold tracking-wider text-sm">FREE OVERLAY</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">M1 PROTO</span>
      </div>

      {/* Mode Status & Toggle */}
      <button
        onClick={toggleEditMode}
        class={`px-2.5 py-1 rounded font-semibold transition-all flex items-center gap-1.5 ${
          settings.isEditMode
            ? "bg-amber-500/30 text-amber-300 border border-amber-500/50 hover:bg-amber-500/40"
            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
        }`}
        title="Toggle Click-through Mode (Shortcut: Ctrl + Shift + O)"
      >
        <span>{settings.isEditMode ? "🛠️ EDIT MODE (Interactive)" : "🔒 DRIVING MODE (Click-through)"}</span>
        <span class="text-[9px] opacity-70 border border-current px-1 rounded">Ctrl+Shift+O</span>
      </button>

      {/* Theme Switcher */}
      <div class="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-white/10">
        {themes.map((t) => (
          <button
            onClick={() => updateSettings("theme", t)}
            class={`px-2 py-0.5 rounded font-bold uppercase transition-all text-[11px] ${
              settings.theme === t
                ? "bg-[var(--theme-accent)] text-white shadow"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Triple Monitor Mode Toggle */}
      <button
        onClick={() =>
          updateSettings(
            "tripleMonitorMode",
            settings.tripleMonitorMode === "center-clamp" ? "full-span" : "center-clamp"
          )
        }
        class="px-2 py-1 rounded bg-black/30 border border-white/10 hover:bg-white/10 text-white/80 font-mono"
        title="Triple Monitor Screen Adaptation"
      >
        🖥️ {settings.tripleMonitorMode === "center-clamp" ? "TRIPLE: CENTER CLAMP" : "TRIPLE: FULL SPAN"}
      </button>

      {/* Real-time Telemetry & Display Rates */}
      <div class="flex items-center gap-2 pl-2 border-l border-white/20 font-mono text-[11px]">
        <div class="flex items-center gap-1 text-sky-400" title="iRacing Telemetry Input Rate">
          <span>📡</span>
          <span>{telemetry.telemetryTickRate}Hz</span>
        </div>
        <div class="flex items-center gap-1 text-emerald-400 font-bold" title="144Hz+ Display LERP Render Rate">
          <span>⚡</span>
          <span>{telemetry.displayFps} FPS</span>
        </div>
      </div>
    </div>
  );
};

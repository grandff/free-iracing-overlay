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
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-600/50 text-white">F1 EDITION</span>
      </div>

      {/* Mode Status & Toggle (Alt + J) */}
      <button
        onClick={toggleEditMode}
        class={`px-2.5 py-1 rounded font-semibold transition-all flex items-center gap-1.5 ${
          settings.isEditMode
            ? "bg-amber-500/30 text-amber-300 border border-amber-500/50 hover:bg-amber-500/40"
            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
        }`}
        title="Toggle Click-through Mode (Shortcut: Alt + J)"
      >
        <span>{settings.isEditMode ? "🛠️ EDIT MODE (Interactive)" : "🔒 DRIVING MODE (Click-through)"}</span>
        <span class="text-[9px] opacity-90 border border-current px-1 rounded font-bold">Alt + J</span>
      </button>

      {/* Theme Status (F1 active, others upcoming) */}
      <div class="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-white/10">
        <button
          class="px-2.5 py-0.5 rounded font-black uppercase text-[11px] bg-red-600 text-white shadow"
          title="현재 F1 테마 활성화됨"
        >
          F1 테마 (기본)
        </button>
        <span class="text-[10px] text-white/40 px-1" title="WEC, WRC, IndyCar, GT는 추후 업데이트 제공">
          +기타 테마 (추후 제공)
        </span>
      </div>

      {/* Re-run Setup Wizard */}
      <button
        onClick={() => {
          updateSettings("hasCompletedSetup", false);
          updateSettings("setupStep", 1);
        }}
        class="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/80 text-[11px] flex items-center gap-1"
        title="초기 설정 마법사 다시 열기"
      >
        <span>⚙️</span>
        <span>설정 마법사</span>
      </button>

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
        🖥️ {settings.tripleMonitorMode === "center-clamp" ? "TRIPLE: CENTER" : "TRIPLE: FULL"}
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

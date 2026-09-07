import { Component, onMount, onCleanup, createEffect, Show } from "solid-js";
import {
  settings,
  toggleEditMode,
  hydrateFromDiskConfig,
  updateWidgetTransform,
} from "./stores/settingsStore.ts";
import { telemetry, initializeTelemetryPipeline } from "./stores/telemetryStore.ts";
import { HeaderBar } from "./components/common/HeaderBar.tsx";
import { SpotterBlinker } from "./components/common/SpotterBlinker.tsx";
import { TelemetryMonitor } from "./components/common/TelemetryMonitor.tsx";
import { SetupWizard } from "./components/setup/SetupWizard.tsx";
import { F1TimingTower } from "./components/f1/F1TimingTower.tsx";
import { F1Relative } from "./components/f1/F1Relative.tsx";

export const App: Component = () => {
  onMount(() => {
    hydrateFromDiskConfig();
    initializeTelemetryPipeline();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "j" || e.key === "J" || e.code === "KeyJ")) {
        e.preventDefault();
        toggleEditMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
  });

  createEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  });

  const timingDrivers = () => {
    const cars = telemetry.frame?.cars;
    if (!cars || cars.length === 0) return undefined;
    const teamColors = ["#3671C6", "#E8002D", "#FF8000", "#27F4D2", "#E8002D", "#FF8000", "#27F4D2", "#229971"];
    const tireList: ("S" | "M" | "H")[] = ["M", "S", "M", "H", "S", "M", "H", "H"];
    return cars.slice(0, 8).map((c, i) => {
      const code = c.driverName.split(" ").pop()?.substring(0, 3).toUpperCase() || `P${c.overallPosition}`;
      return {
        position: c.overallPosition,
        carNumber: c.carNumber,
        code,
        name: c.driverName,
        teamColor: teamColors[i % teamColors.length],
        teamName: "F1 Team",
        tireCompound: tireList[i % tireList.length],
        gap: c.overallPosition === 1 ? "LEADER" : (c.gapToPlayerSeconds > 0 ? `+${c.gapToPlayerSeconds.toFixed(3)}` : `${c.gapToPlayerSeconds.toFixed(3)}`),
        isPlayer: c.carIdx === 1,
      };
    });
  };

  const relativeEntries = () => {
    const cars = telemetry.frame?.cars;
    if (!cars || cars.length === 0) return undefined;
    const teamColors = ["#3671C6", "#E8002D", "#FF8000", "#27F4D2", "#E8002D", "#FF8000", "#27F4D2", "#229971"];
    const tireList: ("S" | "M" | "H")[] = ["M", "S", "M", "H", "S", "M", "H", "H"];
    const sorted = [...cars].sort((a, b) => a.gapToPlayerSeconds - b.gapToPlayerSeconds);
    const pIdx = sorted.findIndex((c) => c.carIdx === 1);
    const slice = sorted.slice(Math.max(0, pIdx - 2), Math.min(sorted.length, pIdx + 3));
    return slice.map((c) => {
      const code = c.driverName.split(" ").pop()?.substring(0, 3).toUpperCase() || `P${c.overallPosition}`;
      return {
        carNumber: c.carNumber,
        code,
        name: c.driverName,
        teamColor: teamColors[c.carIdx % teamColors.length],
        tireCompound: tireList[c.carIdx % tireList.length],
        gapSeconds: c.gapToPlayerSeconds,
        isPlayer: c.carIdx === 1,
      };
    });
  };

  return (
    <main
      class={`relative w-full h-full min-h-screen overflow-hidden ${
        !settings.hasCompletedSetup || settings.isEditMode
          ? "pointer-events-auto bg-black/25"
          : "pointer-events-none bg-transparent"
      }`}
    >
      {/* 1. Initial Setup Wizard */}
      <Show when={!settings.hasCompletedSetup}>
        <SetupWizard />
      </Show>

      {/* 2. Main Driving Overlay HUD */}
      <Show when={settings.hasCompletedSetup}>
        <HeaderBar />
        <SpotterBlinker />

        <div
          class={`relative w-full h-full transition-all duration-300 ${
            settings.tripleMonitorMode === "center-clamp"
              ? "max-w-[1920px] mx-auto border-x border-white/5"
              : "w-full"
          }`}
        >
          {!settings.isEditMode && (
            <div class="fixed top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white/50 text-[10px] font-mono rounded pointer-events-none transition-opacity duration-500">
              DRIVING MODE ACTIVE (Click-through enabled • Press Alt+J to edit)
            </div>
          )}

          {/* F1 Timing Tower (Top-Left) */}
          <div
            style={{
              transform: `translate3d(${settings.widgets.leaderboard.x}px, ${settings.widgets.leaderboard.y}px, 0) scale(${settings.widgets.leaderboard.scale})`,
              "transform-origin": "top left",
            }}
            class={`fixed top-16 left-8 z-30 select-none ${
              settings.isEditMode ? "pointer-events-auto cursor-move ring-2 ring-amber-400/80 rounded" : "pointer-events-none"
            }`}
          >
            <F1TimingTower
              drivers={timingDrivers()}
              lapCurrent={telemetry.frame?.cars[0]?.lap}
              isEditMode={settings.isEditMode}
              scale={settings.widgets.leaderboard.scale}
              onScaleChange={(scale) => updateWidgetTransform("leaderboard", { scale })}
            />
          </div>

          {/* F1 Tactical Relative (Bottom-Right) */}
          <div
            style={{
              transform: `translate3d(${settings.widgets.relative.x}px, ${settings.widgets.relative.y}px, 0) scale(${settings.widgets.relative.scale})`,
              "transform-origin": "bottom right",
            }}
            class={`fixed bottom-8 right-8 z-30 select-none ${
              settings.isEditMode ? "pointer-events-auto cursor-move ring-2 ring-amber-400/80 rounded" : "pointer-events-none"
            }`}
          >
            <F1Relative
              entries={relativeEntries()}
              isEditMode={settings.isEditMode}
              scale={settings.widgets.relative.scale}
              onScaleChange={(scale) => updateWidgetTransform("relative", { scale })}
            />
          </div>

          {/* Central Telemetry Monitor */}
          <TelemetryMonitor />
        </div>
      </Show>
    </main>
  );
};

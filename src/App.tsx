import { Component, onMount, onCleanup, createEffect, Show, createSignal } from "solid-js";
import {
  settings,
  toggleEditMode,
  toggleControlPanel,
  hydrateFromDiskConfig,
  updateWidgetTransform,
  WidgetKey,
} from "./stores/settingsStore.ts";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { telemetry, initializeTelemetryPipeline } from "./stores/telemetryStore.ts";
import { HeaderBar } from "./components/common/HeaderBar.tsx";
import { SetupWizard } from "./components/setup/SetupWizard.tsx";
import { ControlApp } from "./components/control/ControlApp.tsx";
import { Leaderboard } from "./components/widgets/Leaderboard.tsx";
import { Relative } from "./components/widgets/Relative.tsx";
import { LapDelta } from "./components/widgets/LapDelta.tsx";
import { RevengeTracker } from "./components/widgets/RevengeTracker.tsx";
import { SpotterLeft } from "./components/widgets/SpotterLeft.tsx";
import { SpotterRight } from "./components/widgets/SpotterRight.tsx";
import { FuelSimulator } from "./components/widgets/FuelSimulator.tsx";
import { TireAnalysis } from "./components/widgets/TireAnalysis.tsx";
import { IncidentHazard } from "./components/widgets/IncidentHazard.tsx";
import { WeatherWidget } from "./components/widgets/WeatherWidget.tsx";
import { MulticlassRadar } from "./components/widgets/MulticlassRadar.tsx";
import { TrackMap } from "./components/widgets/TrackMap.tsx";
import { TelemetryHub } from "./components/widgets/TelemetryHub.tsx";
import { createPresence } from "./utils/presence.ts";
import { t } from "./i18n/index.ts";

export const App: Component = () => {
  const [draggingWidget, setDraggingWidget] = createSignal<WidgetKey | null>(null);
  const [dragOffset, setDragOffset] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });

  const setupPresence = createPresence(() => !settings.hasCompletedSetup, 250);
  const hudPresence = createPresence(() => settings.hasCompletedSetup, 250);
  const drivingBannerPresence = createPresence(() => !settings.isEditMode && settings.hasCompletedSetup, 200);

  const handleMouseDown = (widgetKey: WidgetKey, e: MouseEvent) => {
    if (!settings.isEditMode) return;
    setDraggingWidget(widgetKey);
    const current = settings.widgets[widgetKey];
    setDragOffset({ x: e.clientX - current.x, y: e.clientY - current.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    const key = draggingWidget();
    if (!key) return;
    const offset = dragOffset();
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    updateWidgetTransform(key, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingWidget(null);
  };

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

    // In game, iRacing owns keyboard focus and the listener above never fires.
    // Rust registers Alt+J as an OS-level hotkey and emits this instead.
    if (isTauri()) {
      let unlisten: (() => void) | undefined;
      let disposed = false;
      listen("toggle-edit-mode", () => toggleEditMode()).then((fn) => {
        if (disposed) fn();
        else unlisten = fn;
      });
      onCleanup(() => {
        disposed = true;
        unlisten?.();
      });
    }
  });

  createEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  });

  // Driving mode must let clicks reach the game. CSS pointer-events cannot do this —
  // only the OS window can, so mirror edit mode onto the native click-through flag.
  createEffect(() => {
    if (!isTauri()) return;
    const interactive = settings.isEditMode || !settings.hasCompletedSetup || settings.showControlPanel;
    invoke("set_clickthrough", { ignore: !interactive }).catch(() => {});
  });

  // Performance Tiering (AGENTS.md Section 5):
  // - Timing Tower at 10Hz (every 100ms)
  // - Tactical Relative at 30Hz (every 33ms)
  // - Track Map at 20Hz (every 50ms)
  const [timingDrivers, setTimingDrivers] = createSignal<any[]>([]);
  const [relativeEntries, setRelativeEntries] = createSignal<any[]>([]);
  const [trackMapCars, setTrackMapCars] = createSignal<any[]>([]);

  let lastTimingUpdate = 0;
  let lastRelativeUpdate = 0;
  let lastTrackUpdate = 0;

  createEffect(() => {
    const frame = telemetry.frame;
    if (!frame || !frame.cars || frame.cars.length === 0) return;
    const now = performance.now();

    // 1. Timing Tower Throttled to 10Hz
    if (now - lastTimingUpdate >= 100) {
      lastTimingUpdate = now;
      const teamColors = ["#3671C6", "#E8002D", "#FF8000", "#27F4D2", "#E8002D", "#FF8000", "#27F4D2", "#229971"];
      const tireList: ("S" | "M" | "H")[] = ["M", "S", "M", "H", "S", "M", "H", "H"];
      const mapped = frame.cars.slice(0, 8).map((c, i) => {
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
      setTimingDrivers(mapped);
    }

    // 2. Relative Throttled to 30Hz
    if (now - lastRelativeUpdate >= 33) {
      lastRelativeUpdate = now;
      const teamColors = ["#3671C6", "#E8002D", "#FF8000", "#27F4D2", "#E8002D", "#FF8000", "#27F4D2", "#229971"];
      const tireList: ("S" | "M" | "H")[] = ["M", "S", "M", "H", "S", "M", "H", "H"];
      const sorted = [...frame.cars].sort((a, b) => a.gapToPlayerSeconds - b.gapToPlayerSeconds);
      const pIdx = sorted.findIndex((c) => c.carIdx === 1);
      const slice = sorted.slice(Math.max(0, pIdx - 2), Math.min(sorted.length, pIdx + 3));
      const mappedRel = slice.map((c) => {
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
      setRelativeEntries(mappedRel);
    }

    // 3. Track Map Throttled to 20Hz
    if (now - lastTrackUpdate >= 50) {
      lastTrackUpdate = now;
      const mappedCars = frame.cars.map((c) => ({
        carIdx: c.carIdx,
        carNumber: c.carNumber,
        lapDistPct: c.lapDistPct,
        color: c.carClassColor || "#ffffff",
        isPlayer: c.carIdx === 1,
      }));
      setTrackMapCars(mappedCars);
    }
  });

  return (
    <main
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      class={`relative w-full h-full min-h-screen overflow-hidden ${
        !settings.hasCompletedSetup || settings.isEditMode
          ? "pointer-events-auto bg-black/25"
          : "pointer-events-none bg-transparent"
      }`}
    >
      {/* 1. Initial Setup Wizard */}
      <Show when={setupPresence.mounted()}>
        <div
          class={`w-full h-full transition-opacity duration-200 ${
            setupPresence.visible() ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <SetupWizard />
        </div>
      </Show>

      {/* 2. Main Driving Overlay HUD */}
      <Show when={hudPresence.mounted()}>
        <div
          class={`w-full h-full transition-opacity duration-200 ${
            hudPresence.visible() ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Floating Minimal Control Capsule (Always Accessible) */}
          <div class="fixed top-3 right-6 z-50 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={toggleControlPanel}
              class="px-3 py-1.5 rounded-full bg-[#18181c]/90 hover:bg-[#25252b] text-white/90 border border-white/15 text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title={t().programSettings}
            >
              <span class="text-sm">⚙️</span>
              <span>{t().programSettings}</span>
            </button>

            <button
              onClick={toggleEditMode}
              class={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
                settings.isEditMode
                  ? "bg-amber-500 text-black border-amber-400 font-bold"
                  : "bg-[#18181c]/90 hover:bg-[#25252b] text-white/90 border-white/15"
              }`}
              title={t().editOnOverlay}
            >
              <span>{settings.isEditMode ? t().exitEditMode : t().editOnOverlay}</span>
              <kbd class="text-[9px] font-mono px-1 py-0.5 rounded bg-black/40 text-white">Alt+J</kbd>
            </button>
          </div>

          {/* Program Settings Window (프로그램 영역) */}
          <Show when={settings.showControlPanel}>
            <ControlApp />
          </Show>

          <div
            class={`relative w-full h-full ${
              settings.tripleMonitorMode === "center-clamp"
                ? "max-w-[1920px] mx-auto border-x border-white/5"
                : "w-full"
            }`}
          >
            <Show when={drivingBannerPresence.mounted()}>
              <div
                class={`fixed top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white/50 text-[10px] font-mono rounded pointer-events-none apple-pill-enter ${
                  drivingBannerPresence.visible() ? "is-visible" : "is-hidden"
                }`}
              >
                {t().drivingModeNotice}
              </div>
            </Show>

            {/* 기능 1: 순위표 (Top-Left, 10Hz) */}
            <Show when={settings.widgets.leaderboard?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("leaderboard", e)}
                style={{
                  transform: `translate3d(${settings.widgets.leaderboard.x}px, ${settings.widgets.leaderboard.y}px, 0) scale(${settings.widgets.leaderboard.scale})`,
                  "transform-origin": "top left",
                }}
                class={`fixed top-14 left-6 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <Leaderboard
                  cars={telemetry.frame?.cars}
                  lapCurrent={telemetry.frame?.cars[0]?.lap}
                  playerCarIdx={telemetry.frame?.player?.carIdx || 1}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.leaderboard.scale}
                  width={settings.widgets.leaderboard.width || 460}
                  onScaleChange={(scale) => updateWidgetTransform("leaderboard", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("leaderboard", { width })}
                />
              </div>
            </Show>

            {/* 기능 2: 렐러티브 (Bottom-Right, 30Hz) */}
            <Show when={settings.widgets.relative?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("relative", e)}
                style={{
                  transform: `translate3d(${settings.widgets.relative.x}px, ${settings.widgets.relative.y}px, 0) scale(${settings.widgets.relative.scale})`,
                  "transform-origin": "bottom right",
                }}
                class={`fixed bottom-6 right-6 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <Relative
                  entries={relativeEntries().length > 0 ? relativeEntries() : undefined}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.relative.scale}
                  onScaleChange={(scale) => updateWidgetTransform("relative", { scale })}
                />
              </div>
            </Show>

            {/* 기능 3: 직전 랩타임 비교 (Top-Center) */}
            <Show when={settings.widgets.lapDelta?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("lapDelta", e)}
                style={{
                  transform: `translate3d(calc(-50% + ${settings.widgets.lapDelta.x}px), ${settings.widgets.lapDelta.y}px, 0) scale(${settings.widgets.lapDelta.scale})`,
                  "transform-origin": "top center",
                }}
                class={`fixed top-14 left-1/2 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <LapDelta
                  deltaSeconds={telemetry.frame?.player?.lastLapDelta ?? -0.142}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.lapDelta.scale}
                  onScaleChange={(scale) => updateWidgetTransform("lapDelta", { scale })}
                />
              </div>
            </Show>

            {/* 기능 4: 리벤지 트래커 (Bottom-Right-Center) */}
            <Show when={settings.widgets.revengeTracker?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("revengeTracker", e)}
                style={{
                  transform: `translate3d(${settings.widgets.revengeTracker.x}px, ${settings.widgets.revengeTracker.y}px, 0) scale(${settings.widgets.revengeTracker.scale})`,
                  "transform-origin": "bottom right",
                }}
                class={`fixed bottom-24 right-80 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <RevengeTracker
                  hasTarget={telemetry.frame?.revenge?.hasTarget}
                  targetCarNumber={telemetry.frame?.revenge?.carNumber}
                  targetDriverName={telemetry.frame?.revenge?.driverName}
                  gapSeconds={telemetry.frame?.revenge?.gapSeconds}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.revengeTracker.scale}
                  onScaleChange={(scale) => updateWidgetTransform("revengeTracker", { scale })}
                />
              </div>
            </Show>

            {/* 기능 5-L: 좌측 근접 스포터 (Left Screen Edge) */}
            <Show when={settings.widgets.spotterLeft?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("spotterLeft", e)}
                style={{
                  transform: `translate3d(${settings.widgets.spotterLeft.x}px, calc(-50% + ${settings.widgets.spotterLeft.y}px), 0) scale(${settings.widgets.spotterLeft.scale})`,
                  "transform-origin": "left center",
                }}
                class={`fixed top-1/2 left-2 z-40 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-lg rounded-r-xl"
                    : "pointer-events-none"
                }`}
              >
                <SpotterLeft
                  distance={telemetry.frame?.spotter?.leftDistanceMeters}
                  state={telemetry.frame?.spotter?.leftState}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.spotterLeft.scale}
                  onScaleChange={(scale) => updateWidgetTransform("spotterLeft", { scale })}
                />
              </div>
            </Show>

            {/* 기능 5-R: 우측 근접 스포터 (Right Screen Edge) */}
            <Show when={settings.widgets.spotterRight?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("spotterRight", e)}
                style={{
                  transform: `translate3d(${settings.widgets.spotterRight.x}px, calc(-50% + ${settings.widgets.spotterRight.y}px), 0) scale(${settings.widgets.spotterRight.scale})`,
                  "transform-origin": "right center",
                }}
                class={`fixed top-1/2 right-2 z-40 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-lg rounded-l-xl"
                    : "pointer-events-none"
                }`}
              >
                <SpotterRight
                  distance={telemetry.frame?.spotter?.rightDistanceMeters}
                  state={telemetry.frame?.spotter?.rightState}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.spotterRight.scale}
                  onScaleChange={(scale) => updateWidgetTransform("spotterRight", { scale })}
                />
              </div>
            </Show>

            {/* 기능 6: 연료 시뮬레이터 (Bottom-Left) */}
            <Show when={settings.widgets.fuelCalculator?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("fuelCalculator", e)}
                style={{
                  transform: `translate3d(${settings.widgets.fuelCalculator.x}px, ${settings.widgets.fuelCalculator.y}px, 0) scale(${settings.widgets.fuelCalculator.scale})`,
                  "transform-origin": "bottom left",
                }}
                class={`fixed bottom-6 left-6 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <FuelSimulator
                  fuelLevelLiters={telemetry.frame?.player?.fuelLevelLiters}
                  fuelPerLap={telemetry.frame?.player?.fuelAvgPerLap}
                  fuelLapsRemaining={telemetry.frame?.player?.fuelLapsRemaining}
                  estPitLaps={telemetry.frame?.player?.fuelNeededToFinish}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.fuelCalculator.scale}
                  onScaleChange={(scale) => updateWidgetTransform("fuelCalculator", { scale })}
                />
              </div>
            </Show>

            {/* 기능 7: 타이어 분석 (Bottom-Left-Center) */}
            <Show when={settings.widgets.tireAnalysis?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("tireAnalysis", e)}
                style={{
                  transform: `translate3d(${settings.widgets.tireAnalysis.x}px, ${settings.widgets.tireAnalysis.y}px, 0) scale(${settings.widgets.tireAnalysis.scale})`,
                  "transform-origin": "bottom left",
                }}
                class={`fixed bottom-6 left-80 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <TireAnalysis
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.tireAnalysis.scale}
                  onScaleChange={(scale) => updateWidgetTransform("tireAnalysis", { scale })}
                />
              </div>
            </Show>

            {/* 기능 8: 전방 사고 경고 (Center High Alert) */}
            <Show when={settings.widgets.incidentHazard?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("incidentHazard", e)}
                style={{
                  transform: `translate3d(calc(-50% + ${settings.widgets.incidentHazard.x}px), ${settings.widgets.incidentHazard.y}px, 0) scale(${settings.widgets.incidentHazard.scale})`,
                  "transform-origin": "top center",
                }}
                class={`fixed top-28 left-1/2 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <IncidentHazard
                  aheadHazardMeters={telemetry.frame?.hazard?.hasIncident ? telemetry.frame?.hazard?.distanceMeters : undefined}
                  hazardCarNumber={telemetry.frame?.hazard?.incidentCarNumber}
                  yellowFlagActive={telemetry.frame?.hazard?.hasIncident}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.incidentHazard.scale}
                  onScaleChange={(scale) => updateWidgetTransform("incidentHazard", { scale })}
                />
              </div>
            </Show>

            {/* 기능 9: 날씨 & 트랙 컨디션 (Top-Center-Right) */}
            <Show when={settings.widgets.weather?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("weather", e)}
                style={{
                  transform: `translate3d(${settings.widgets.weather.x}px, ${settings.widgets.weather.y}px, 0) scale(${settings.widgets.weather.scale})`,
                  "transform-origin": "top right",
                }}
                class={`fixed top-14 right-80 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <WeatherWidget
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.weather.scale}
                  onScaleChange={(scale) => updateWidgetTransform("weather", { scale })}
                />
              </div>
            </Show>

            {/* 기능 10: 멀티클래스 레이더 (Center Alert) */}
            <Show when={settings.widgets.multiclassRadar?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("multiclassRadar", e)}
                style={{
                  transform: `translate3d(calc(-50% + ${settings.widgets.multiclassRadar.x}px), ${settings.widgets.multiclassRadar.y}px, 0) scale(${settings.widgets.multiclassRadar.scale})`,
                  "transform-origin": "top center",
                }}
                class={`fixed top-44 left-1/2 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <MulticlassRadar
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.multiclassRadar.scale}
                  onScaleChange={(scale) => updateWidgetTransform("multiclassRadar", { scale })}
                />
              </div>
            </Show>

            {/* 기능 11: 2D 실시간 트랙 맵 (Top-Right, 20Hz) */}
            <Show when={settings.widgets.trackMap?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("trackMap", e)}
                style={{
                  transform: `translate3d(${settings.widgets.trackMap.x}px, ${settings.widgets.trackMap.y}px, 0) scale(${settings.widgets.trackMap.scale})`,
                  "transform-origin": "top right",
                }}
                class={`fixed top-14 right-6 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <TrackMap
                  cars={trackMapCars().length > 0 ? trackMapCars() : undefined}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.trackMap.scale}
                  onScaleChange={(scale) => updateWidgetTransform("trackMap", { scale })}
                />
              </div>
            </Show>

            {/* 콕핏 스티어링 허브 (Bottom-Center, 60Hz) */}
            <Show when={settings.widgets.telemetryHub?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("telemetryHub", e)}
                style={{
                  transform: `translate3d(calc(-50% + ${settings.widgets.telemetryHub.x}px), ${settings.widgets.telemetryHub.y}px, 0) scale(${settings.widgets.telemetryHub.scale})`,
                  "transform-origin": "bottom center",
                }}
                class={`fixed bottom-6 left-1/2 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-xl"
                    : "pointer-events-none"
                }`}
              >
                <TelemetryHub
                  gear={telemetry.frame?.player?.gear ?? "4"}
                  speedKmh={telemetry.frame?.player?.speedKmh ?? 245}
                  rpm={telemetry.frame?.player?.rpm ?? 11250}
                  maxRpm={12500}
                  throttlePct={88}
                  brakePct={0}
                  drsAvailable={true}
                  drsActive={false}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.telemetryHub.scale}
                  onScaleChange={(scale) => updateWidgetTransform("telemetryHub", { scale })}
                />
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </main>
  );
};

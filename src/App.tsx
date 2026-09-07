import { Component, onMount, onCleanup, createEffect, Show, createSignal } from "solid-js";
import {
  settings,
  toggleEditMode,
  hydrateFromDiskConfig,
  updateWidgetTransform,
  WidgetKey,
} from "./stores/settingsStore.ts";
import { telemetry, initializeTelemetryPipeline } from "./stores/telemetryStore.ts";
import { HeaderBar } from "./components/common/HeaderBar.tsx";
import { SpotterBlinker } from "./components/common/SpotterBlinker.tsx";
import { SetupWizard } from "./components/setup/SetupWizard.tsx";
import { F1TimingTower } from "./components/f1/F1TimingTower.tsx";
import { F1Relative } from "./components/f1/F1Relative.tsx";
import { F1LapDelta } from "./components/f1/F1LapDelta.tsx";
import { F1RevengeTracker } from "./components/f1/F1RevengeTracker.tsx";
import { F1SpotterLeft } from "./components/f1/F1SpotterLeft.tsx";
import { F1SpotterRight } from "./components/f1/F1SpotterRight.tsx";
import { F1FuelCalculator } from "./components/f1/F1FuelCalculator.tsx";
import { F1TireAnalysis } from "./components/f1/F1TireAnalysis.tsx";
import { F1IncidentHazard } from "./components/f1/F1IncidentHazard.tsx";
import { F1WeatherWidget } from "./components/f1/F1WeatherWidget.tsx";
import { F1MulticlassRadar } from "./components/f1/F1MulticlassRadar.tsx";
import { F1TrackMap } from "./components/f1/F1TrackMap.tsx";
import { F1TelemetryHub } from "./components/f1/F1TelemetryHub.tsx";
import { createPresence } from "./utils/presence.ts";

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
          class={`w-full h-full transition-opacity duration-250 ${
            setupPresence.visible() ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <SetupWizard />
        </div>
      </Show>

      {/* 2. Main Driving Overlay HUD */}
      <Show when={hudPresence.mounted()}>
        <div
          class={`w-full h-full transition-opacity duration-250 ${
            hudPresence.visible() ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <HeaderBar />
          <SpotterBlinker />

          <div
            class={`relative w-full h-full transition-all duration-300 ${
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
                DRIVING MODE ACTIVE (Click-through enabled • Press Alt+J to edit)
              </div>
            </Show>

            {/* 기능 1: 순위표 (F1 Timing Tower - Top-Left) */}
            <Show when={settings.widgets.leaderboard?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("leaderboard", e)}
                style={{
                  transform: `translate3d(${settings.widgets.leaderboard.x}px, ${settings.widgets.leaderboard.y}px, 0) scale(${settings.widgets.leaderboard.scale})`,
                  "transform-origin": "top left",
                }}
                class={`fixed top-14 left-6 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
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
            </Show>

            {/* 기능 2: 렐러티브 (F1 Tactical Relative - Bottom-Right) */}
            <Show when={settings.widgets.relative?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("relative", e)}
                style={{
                  transform: `translate3d(${settings.widgets.relative.x}px, ${settings.widgets.relative.y}px, 0) scale(${settings.widgets.relative.scale})`,
                  "transform-origin": "bottom right",
                }}
                class={`fixed bottom-6 right-6 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <F1Relative
                  entries={relativeEntries()}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.relative.scale}
                  onScaleChange={(scale) => updateWidgetTransform("relative", { scale })}
                />
              </div>
            </Show>

            {/* 기능 3: 직전 랩타임 비교 (F1 Lap Delta - Top-Center) */}
            <Show when={settings.widgets.lapDelta?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("lapDelta", e)}
                style={{
                  transform: `translate3d(calc(-50% + ${settings.widgets.lapDelta.x}px), ${settings.widgets.lapDelta.y}px, 0) scale(${settings.widgets.lapDelta.scale})`,
                  "transform-origin": "top center",
                }}
                class={`fixed top-14 left-1/2 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <F1LapDelta
                  deltaSeconds={telemetry.frame?.player?.lastLapTime ? -0.142 : undefined}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.lapDelta.scale}
                  onScaleChange={(scale) => updateWidgetTransform("lapDelta", { scale })}
                />
              </div>
            </Show>

            {/* 기능 4: 리벤지 트래커 (F1 Revenge Target - Bottom-Right-Center) */}
            <Show when={settings.widgets.revengeTracker?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("revengeTracker", e)}
                style={{
                  transform: `translate3d(${settings.widgets.revengeTracker.x}px, ${settings.widgets.revengeTracker.y}px, 0) scale(${settings.widgets.revengeTracker.scale})`,
                  "transform-origin": "bottom right",
                }}
                class={`fixed bottom-24 right-80 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <F1RevengeTracker
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
                class={`fixed top-1/2 left-2 z-40 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-lg rounded-r-xl"
                    : "pointer-events-none"
                }`}
              >
                <F1SpotterLeft
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
                class={`fixed top-1/2 right-2 z-40 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-lg rounded-l-xl"
                    : "pointer-events-none"
                }`}
              >
                <F1SpotterRight
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
                class={`fixed bottom-6 left-6 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <F1FuelCalculator
                  fuelLevelLiters={telemetry.frame?.fuel?.currentLiters}
                  fuelPerLap={telemetry.frame?.fuel?.perLapLiters}
                  fuelLapsRemaining={telemetry.frame?.fuel?.lapsRemaining}
                  estPitLaps={telemetry.frame?.fuel?.requiredForFinishLiters}
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
                class={`fixed bottom-6 left-76 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <F1TireAnalysis
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
                class={`fixed top-28 left-1/2 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <F1IncidentHazard
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
                class={`fixed top-14 right-76 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <F1WeatherWidget
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
                class={`fixed top-44 left-1/2 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <F1MulticlassRadar
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.multiclassRadar.scale}
                  onScaleChange={(scale) => updateWidgetTransform("multiclassRadar", { scale })}
                />
              </div>
            </Show>

            {/* 기능 11: 2D 실시간 트랙 맵 (Top-Right) */}
            <Show when={settings.widgets.trackMap?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("trackMap", e)}
                style={{
                  transform: `translate3d(${settings.widgets.trackMap.x}px, ${settings.widgets.trackMap.y}px, 0) scale(${settings.widgets.trackMap.scale})`,
                  "transform-origin": "top right",
                }}
                class={`fixed top-14 right-6 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <F1TrackMap
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.trackMap.scale}
                  onScaleChange={(scale) => updateWidgetTransform("trackMap", { scale })}
                />
              </div>
            </Show>

            {/* 콕핏 스티어링 허브 (Bottom-Center) */}
            <Show when={settings.widgets.telemetryHub?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("telemetryHub", e)}
                style={{
                  transform: `translate3d(calc(-50% + ${settings.widgets.telemetryHub.x}px), ${settings.widgets.telemetryHub.y}px, 0) scale(${settings.widgets.telemetryHub.scale})`,
                  "transform-origin": "bottom center",
                }}
                class={`fixed bottom-6 left-1/2 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-xl"
                    : "pointer-events-none"
                }`}
              >
                <F1TelemetryHub
                  gear={telemetry.frame?.player?.gear ?? "4"}
                  speedKmh={telemetry.frame?.player?.speedKmh ?? 245}
                  rpm={telemetry.frame?.player?.rpm ?? 11250}
                  maxRpm={12500}
                  throttlePct={telemetry.frame?.player?.throttlePct ?? 92}
                  brakePct={telemetry.frame?.player?.brakePct ?? 0}
                  drsAvailable={telemetry.frame?.player?.drsAvailable ?? true}
                  drsActive={telemetry.frame?.player?.drsActive ?? false}
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

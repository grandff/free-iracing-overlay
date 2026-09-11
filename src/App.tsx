import { Component, onMount, onCleanup, createEffect, Show, createSignal } from "solid-js";
import {
  settings,
  toggleEditMode,
  toggleControlPanel,
  hydrateFromDiskConfig,
  updateWidgetTransform,
  updateSettings,
  WidgetKey,
  widgetBgAlpha,
} from "./stores/settingsStore.ts";
import { isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { windowRole, openControlWindow, setClickthrough } from "./services/shell.ts";
import { telemetry, initializeTelemetryPipeline, disposeTelemetryPipeline } from "./stores/telemetryStore.ts";
import { SetupWizard } from "./components/setup/SetupWizard.tsx";
import { ControlApp } from "./components/control/ControlApp.tsx";
import { Leaderboard } from "./components/widgets/Leaderboard.tsx";
import { Relative } from "./components/widgets/Relative.tsx";
import { TeamRadio } from "./components/widgets/TeamRadio.tsx";
import { LapDelta } from "./components/widgets/LapDelta.tsx";
import { RevengeTracker } from "./components/widgets/RevengeTracker.tsx";
import { Spotter, SPOTTER_DEFAULT_HEIGHT, SPOTTER_DEFAULT_WIDTH } from "./components/widgets/Spotter.tsx";
import { FuelSimulator } from "./components/widgets/FuelSimulator.tsx";
import { TireAnalysis } from "./components/widgets/TireAnalysis.tsx";
import { IncidentHazard } from "./components/widgets/IncidentHazard.tsx";
import { WeatherWidget } from "./components/widgets/WeatherWidget.tsx";
import { MulticlassRadar } from "./components/widgets/MulticlassRadar.tsx";
import { TrackMap } from "./components/widgets/TrackMap.tsx";
import { ShiftLight } from "./components/widgets/ShiftLight.tsx";
import { TelemetryHub } from "./components/widgets/TelemetryHub.tsx";
import { Digiflag } from "./components/widgets/Digiflag.tsx";
import { PitBoxHelper } from "./components/widgets/PitBoxHelper.tsx";
import { createPresence } from "./utils/presence.ts";
import { t } from "./i18n/index.ts";
import { OpacityChip } from "./components/common/OpacityChip.tsx";
import { restoreCachedFonts } from "./services/fonts.ts";
import { startDebugLog, stopDebugLog } from "./services/debugLog.ts";

export const App: Component = () => {
  const [draggingWidget, setDraggingWidget] = createSignal<WidgetKey | null>(null);
  const [dragOffset, setDragOffset] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });

  const setupPresence = createPresence(() => !settings.hasCompletedSetup, 250);
  // The HUD shows as soon as setup is done. Gating it on a telemetry frame made the
  // packaged app a permanently blank window, because the Rust side only probes for
  // iRacing's presence today and streams no frames yet (see iracing/memory.rs, M5).
  // The OS window itself is already shown only while iRacing is connected, and each
  // safety widget refuses to render without real data — that is where "do not show
  // fabricated telemetry" belongs, not in a blanket gate that hides everything.
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

  // Under Tauri the settings UI is a separate OS window, so this focuses it.
  // In the browser preview there is only one window, so fall back to the in-page panel.
  const openSettings = () => (windowRole === "browser" ? toggleControlPanel() : void openControlWindow());

  onMount(() => {
    hydrateFromDiskConfig();
    initializeTelemetryPipeline();
    // Re-register a previously installed typeface from cache. No network, and the
    // digest is re-checked, so a tampered cache entry is dropped rather than used.
    void restoreCachedFonts(settings.theme);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "j" || e.key === "J" || e.code === "KeyJ")) {
        e.preventDefault();
        toggleEditMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
      disposeTelemetryPipeline();
    });

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

  // Telemetry recording follows the setting. Only this window runs the pipeline,
  // so only this window writes the log — the control window would duplicate rows.
  createEffect(() => {
    if (settings.debugLogging) startDebugLog();
    else stopDebugLog();
  });
  onCleanup(() => stopDebugLog());

  // Driving mode must let clicks reach the game. CSS pointer-events cannot do this —
  // only the OS window can, so mirror edit mode onto the native click-through flag.
  createEffect(() => {
    const interactive = settings.isEditMode || !settings.hasCompletedSetup;
    void setClickthrough(!interactive);
  });

  // Performance Tiering (AGENTS.md Section 5):
  // - Tactical Relative at 30Hz (every 33ms)
  // - Track Map at 20Hz (every 50ms)
  const [relativeEntries, setRelativeEntries] = createSignal<any[]>([]);
  const [trackMapCars, setTrackMapCars] = createSignal<any[]>([]);

  let lastRelativeUpdate = 0;
  let lastTrackUpdate = 0;

  createEffect(() => {
    const frame = telemetry.frame;
    if (!frame || !frame.cars || frame.cars.length === 0) return;
    const now = performance.now();

    // 2. Relative Throttled to 30Hz
    if (now - lastRelativeUpdate >= 33) {
      lastRelativeUpdate = now;
      const teamColors = ["#3671C6", "#E8002D", "#FF8000", "#27F4D2", "#E8002D", "#FF8000", "#27F4D2", "#229971"];
      const tireList: ("S" | "M" | "H")[] = ["M", "S", "M", "H", "S", "M", "H", "H"];
      const sorted = [...frame.cars].sort((a, b) => a.gapToPlayerSeconds - b.gapToPlayerSeconds);
      const playerIdx = frame.player?.carIdx ?? 1;
      const pIdx = sorted.findIndex((c) => c.carIdx === playerIdx);
      const aheadBehind = Math.max(2, Math.min(5, settings.widgets.relative?.maxRows || 3));
      const slice = sorted.slice(Math.max(0, pIdx - aheadBehind), Math.min(sorted.length, pIdx + aheadBehind + 1));
      const playerSectorData = frame.lapDelta?.sectors;

      const mappedRel = slice.map((c) => {
        const code = c.driverName.split(" ").pop()?.substring(0, 3).toUpperCase() || `P${c.overallPosition}`;
        const isPlayer = c.carIdx === playerIdx;
        return {
          position: c.overallPosition || c.classPosition || 1,
          carNumber: c.carNumber,
          code,
          name: c.driverName,
          country: c.country,
          teamColor: c.carClassColor || teamColors[c.carIdx % teamColors.length],
          tireCompound: tireList[c.carIdx % tireList.length],
          gapSeconds: c.gapToPlayerSeconds,
          isPlayer,
          sectors: isPlayer && playerSectorData
            ? [playerSectorData[0].status, playerSectorData[1].status, playerSectorData[2].status] as const
            : undefined,
          currentSector: isPlayer ? frame.lapDelta?.currentSector : undefined,
          irating: c.irating,
          projectedIratingGain: c.projectedIratingGain,
        };
      });
      setRelativeEntries(mappedRel);
    }

    // 3. Track Map Throttled to 20Hz
    if (now - lastTrackUpdate >= 50) {
      lastTrackUpdate = now;
      const playerIdx = frame.player?.carIdx || 1;
      const mappedCars = frame.cars.map((c) => ({
        carIdx: c.carIdx,
        carNumber: c.carNumber,
        driverName: c.driverName,
        lapDistPct: c.lapDistPct,
        color: c.carClassColor || "#ffffff",
        isPlayer: c.carIdx === playerIdx,
        inPit: c.inPit,
        trackSurface: c.trackSurface,
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
              onClick={openSettings}
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
          <Show when={windowRole === "browser" && settings.showControlPanel}>
            <ControlApp />
          </Show>

          <div
            class={`relative w-full h-full ${
              settings.tripleMonitorMode === "center-clamp"
                ? settings.centerClampWidth === 2560
                  ? "max-w-[2560px] mx-auto border-x border-white/10"
                  : "max-w-[1920px] mx-auto border-x border-white/10"
                : "w-full"
            }`}
          >
            {/* M2.7: Triple Screen Bezel Guide Indicators (Edit Mode only) */}
            <Show when={settings.isEditMode && settings.tripleMonitorMode === "center-clamp"}>
              <div class="pointer-events-none fixed inset-0 z-10 flex justify-center">
                <div
                  class="h-full border-x-2 border-dashed border-yellow-400/40 relative flex justify-between"
                  style={{
                    width: `${settings.centerClampWidth}px`,
                  }}
                >
                  <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[9px] font-mono">
                    ◀ LEFT BEZEL ({settings.centerClampWidth}px)
                  </div>
                  <div class="absolute top-2 right-2 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[9px] font-mono">
                    RIGHT BEZEL ▶
                  </div>
                </div>
              </div>
            </Show>

            <Show when={drivingBannerPresence.mounted()}>
              <div
                class={`absolute top-3 left-6 px-3 py-1 bg-black/60 text-white/50 text-[10px] font-mono rounded pointer-events-none apple-pill-enter ${
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
                  "--hud-bg-alpha": widgetBgAlpha("leaderboard"),
                  transform: `translate3d(${settings.widgets.leaderboard.x}px, ${settings.widgets.leaderboard.y}px, 0) scale(${settings.widgets.leaderboard.scale})`,
                  "transform-origin": "top left",
                }}
                class={`absolute top-14 left-6 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <Leaderboard
                  cars={telemetry.frame?.cars}
                  lapCurrent={telemetry.frame?.cars[0]?.lap}
                  lapTotal={telemetry.frame?.sessionLapsTotal}
                  playerCarIdx={telemetry.frame?.player?.carIdx || 1}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.leaderboard.scale}
                  width={settings.widgets.leaderboard.width || 520}
                  maxRows={settings.widgets.leaderboard.maxRows || 10}
                  showThemeLogo={settings.showThemeLogo}
                  theme={settings.theme}
                  sessionType={telemetry.frame?.sessionType}
                  sessionTimeRemain={telemetry.frame?.sessionTimeRemainingSec}
                  sof={telemetry.frame?.sof}
                  projectedIratingGain={telemetry.frame?.projectedIratingGain}
                  onScaleChange={(scale) => updateWidgetTransform("leaderboard", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("leaderboard", { width })}
                  onMaxRowsChange={(maxRows) => updateWidgetTransform("leaderboard", { maxRows })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="leaderboard" />
                </Show>
              </div>
            </Show>

            {/* 기능 2: 렐러티브 (Bottom-Right, 30Hz) */}
            <Show when={settings.widgets.relative?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("relative", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("relative"),
                  transform: `translate3d(${settings.widgets.relative.x}px, ${settings.widgets.relative.y}px, 0) scale(${settings.widgets.relative.scale})`,
                  "transform-origin": "bottom right",
                }}
                class={`absolute bottom-6 right-6 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <Relative
                  entries={relativeEntries().length > 0 ? relativeEntries() : undefined}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.relative.scale}
                  width={settings.widgets.relative.width || 340}
                  maxRows={settings.widgets.relative.maxRows || 3}
                  sof={telemetry.frame?.sof}
                  projectedIratingGain={telemetry.frame?.projectedIratingGain}
                  onScaleChange={(scale) => updateWidgetTransform("relative", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("relative", { width })}
                  onMaxRowsChange={(maxRows) => updateWidgetTransform("relative", { maxRows })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="relative" />
                </Show>
              </div>
            </Show>

            {/* 기능 17 (M2.3): 팀 라디오 & 통신 HUD (Top-Right) */}
            <Show when={settings.widgets.teamRadio?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("teamRadio", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("teamRadio"),
                  transform: `translate3d(${settings.widgets.teamRadio?.x ?? 0}px, ${settings.widgets.teamRadio?.y ?? 0}px, 0) scale(${settings.widgets.teamRadio?.scale ?? 1.0})`,
                  "transform-origin": "top right",
                }}
                class={`absolute top-14 right-6 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <TeamRadio
                  radio={telemetry.frame?.radio}
                  systemMessage={telemetry.frame?.systemMessage}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.teamRadio?.scale ?? 1.0}
                  width={settings.widgets.teamRadio?.width ?? 320}
                  onScaleChange={(scale) => updateWidgetTransform("teamRadio", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("teamRadio", { width })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="teamRadio" />
                </Show>
              </div>
            </Show>

            {/* 기능 3: 직전 랩타임 비교 (Top-Center) */}
            <Show when={settings.widgets.lapDelta?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("lapDelta", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("lapDelta"),
                  transform: `translate3d(calc(-50% + ${settings.widgets.lapDelta.x}px), ${settings.widgets.lapDelta.y}px, 0) scale(${settings.widgets.lapDelta.scale})`,
                  "transform-origin": "top center",
                }}
                class={`absolute top-14 left-1/2 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <LapDelta
                  lapDelta={telemetry.frame?.lapDelta}
                  deltaSeconds={telemetry.frame?.player?.lastLapDelta}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.lapDelta?.scale ?? 1.0}
                  width={settings.widgets.lapDelta?.width ?? 440}
                  onScaleChange={(scale) => updateWidgetTransform("lapDelta", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("lapDelta", { width })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="lapDelta" />
                </Show>
              </div>
            </Show>

            {/* 기능 4: 리벤지 트래커 (Bottom-Right-Center) */}
            <Show
              when={
                settings.widgets.revengeTracker?.visible !== false &&
                (settings.isEditMode ||
                  (telemetry.frame?.sessionType !== "QUALIFY" &&
                    (telemetry.frame?.revenge?.hasTarget ?? false)))
              }
            >
              <div
                onMouseDown={(e) => handleMouseDown("revengeTracker", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("revengeTracker"),
                  transform: `translate3d(${settings.widgets.revengeTracker.x}px, ${settings.widgets.revengeTracker.y}px, 0) scale(${settings.widgets.revengeTracker.scale})`,
                  "transform-origin": "bottom right",
                }}
                class={`absolute bottom-24 right-[380px] z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <RevengeTracker
                  revenge={telemetry.frame?.revenge}
                  sessionType={telemetry.frame?.sessionType}
                  playerLastLapTime={telemetry.frame?.player?.lastLapTime}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.revengeTracker.scale}
                  width={settings.widgets.revengeTracker.width}
                  persistenceMode={settings.revengePersistence}
                  onScaleChange={(scale) => updateWidgetTransform("revengeTracker", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("revengeTracker", { width })}
                  onPersistenceModeChange={(mode) => updateSettings("revengePersistence", mode)}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="revengeTracker" />
                </Show>
              </div>
            </Show>

            {/* 기능 5-L: 좌측 근접 스포터 (Left Screen Edge or Center Bezel) */}
            <Show when={settings.widgets.spotterLeft?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("spotterLeft", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("spotterLeft"),
                  transform: `translate3d(${settings.widgets.spotterLeft.x}px, calc(-50% + ${settings.widgets.spotterLeft.y}px), 0) scale(${settings.widgets.spotterLeft.scale})`,
                  "transform-origin": "left center",
                  left:
                    settings.tripleMonitorMode === "center-clamp" && settings.spotterBezelAnchor === "center-bezel"
                      // max() so a window narrower than the clamp cannot push the
                      // rail off-screen — that is how both spotters went missing.
                      ? `max(8px, calc(50% - ${settings.centerClampWidth / 2}px + 8px))`
                      : "8px",
                }}
                class={`fixed top-1/2 z-40 select-none transition-[left] duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-lg"
                    : "pointer-events-none"
                }`}
              >
                <Spotter
                  side="left"
                  state={telemetry.frame?.spotter?.leftState}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.spotterLeft.scale}
                  width={settings.widgets.spotterLeft.width ?? SPOTTER_DEFAULT_WIDTH}
                  height={settings.widgets.spotterLeft.height ?? SPOTTER_DEFAULT_HEIGHT}
                  onScaleChange={(scale) => updateWidgetTransform("spotterLeft", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("spotterLeft", { width })}
                  onHeightChange={(height) => updateWidgetTransform("spotterLeft", { height })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="spotterLeft" />
                </Show>
              </div>
            </Show>

            {/* 기능 5-R: 우측 근접 스포터 (Right Screen Edge or Center Bezel) */}
            <Show when={settings.widgets.spotterRight?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("spotterRight", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("spotterRight"),
                  transform: `translate3d(${settings.widgets.spotterRight.x}px, calc(-50% + ${settings.widgets.spotterRight.y}px), 0) scale(${settings.widgets.spotterRight.scale})`,
                  "transform-origin": "right center",
                  right:
                    settings.tripleMonitorMode === "center-clamp" && settings.spotterBezelAnchor === "center-bezel"
                      // max() so a window narrower than the clamp cannot push the
                      // rail off-screen — that is how both spotters went missing.
                      ? `max(8px, calc(50% - ${settings.centerClampWidth / 2}px + 8px))`
                      : "8px",
                }}
                class={`fixed top-1/2 z-40 select-none transition-[right] duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-lg"
                    : "pointer-events-none"
                }`}
              >
                <Spotter
                  side="right"
                  state={telemetry.frame?.spotter?.rightState}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.spotterRight.scale}
                  width={settings.widgets.spotterRight.width ?? SPOTTER_DEFAULT_WIDTH}
                  height={settings.widgets.spotterRight.height ?? SPOTTER_DEFAULT_HEIGHT}
                  onScaleChange={(scale) => updateWidgetTransform("spotterRight", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("spotterRight", { width })}
                  onHeightChange={(height) => updateWidgetTransform("spotterRight", { height })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="spotterRight" />
                </Show>
              </div>
            </Show>

            {/* 기능 6: 연료 시뮬레이터 (Bottom-Left) */}
            <Show when={settings.widgets.fuelCalculator?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("fuelCalculator", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("fuelCalculator"),
                  transform: `translate3d(${settings.widgets.fuelCalculator.x}px, ${settings.widgets.fuelCalculator.y}px, 0) scale(${settings.widgets.fuelCalculator.scale})`,
                  "transform-origin": "bottom left",
                }}
                class={`absolute bottom-6 left-6 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <FuelSimulator
                  fuel={telemetry.frame?.fuel}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.fuelCalculator.scale}
                  width={settings.widgets.fuelCalculator.width}
                  onScaleChange={(scale) => updateWidgetTransform("fuelCalculator", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("fuelCalculator", { width })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="fuelCalculator" />
                </Show>
              </div>
            </Show>

            {/* 기능 7: 타이어 분석 (Bottom-Left-Center) */}
            <Show when={settings.widgets.tireAnalysis?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("tireAnalysis", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("tireAnalysis"),
                  transform: `translate3d(${settings.widgets.tireAnalysis.x}px, ${settings.widgets.tireAnalysis.y}px, 0) scale(${settings.widgets.tireAnalysis.scale})`,
                  "transform-origin": "bottom left",
                }}
                class={`absolute bottom-6 left-80 z-30 select-none ${
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
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="tireAnalysis" />
                </Show>
              </div>
            </Show>

            {/* 기능 8: 전방 사고 경고 (Center High Alert) */}
            <Show when={settings.widgets.incidentHazard?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("incidentHazard", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("incidentHazard"),
                  transform: `translate3d(calc(-50% + ${settings.widgets.incidentHazard.x}px), ${settings.widgets.incidentHazard.y}px, 0) scale(${settings.widgets.incidentHazard.scale})`,
                  "transform-origin": "top center",
                }}
                class={`absolute top-[288px] left-1/2 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <IncidentHazard
                  hazard={telemetry.frame?.hazard}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.incidentHazard.scale}
                  width={settings.widgets.incidentHazard.width ?? 340}
                  onScaleChange={(scale) => updateWidgetTransform("incidentHazard", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("incidentHazard", { width })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="incidentHazard" />
                </Show>
              </div>
            </Show>

            {/* 기능 9: 날씨 & 트랙 컨디션 (Top-Center-Right) */}
            <Show when={settings.widgets.weather?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("weather", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("weather"),
                  transform: `translate3d(${settings.widgets.weather.x}px, ${settings.widgets.weather.y}px, 0) scale(${settings.widgets.weather.scale})`,
                  "transform-origin": "top right",
                }}
                class={`absolute top-[290px] right-6 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-[2px]"
                    : "pointer-events-none"
                }`}
              >
                <WeatherWidget
                  weather={telemetry.frame?.weather}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.weather.scale}
                  width={settings.widgets.weather.width ?? 380}
                  onScaleChange={(scale) => updateWidgetTransform("weather", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("weather", { width })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="weather" />
                </Show>
              </div>
            </Show>

            {/* 기능 10: 멀티클래스 레이더 (Center Alert) */}
            <Show when={settings.widgets.multiclassRadar?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("multiclassRadar", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("multiclassRadar"),
                  transform: `translate3d(${settings.widgets.multiclassRadar.x}px, ${settings.widgets.multiclassRadar.y}px, 0) scale(${settings.widgets.multiclassRadar.scale})`,
                  "transform-origin": "top right",
                }}
                class={`absolute top-1/3 right-12 z-30 select-none ${
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
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="multiclassRadar" />
                </Show>
              </div>
            </Show>

            {/* 기능 11: 2D 실시간 트랙 맵 (Bottom-Left, 20Hz) */}
            <Show when={settings.widgets.trackMap?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("trackMap", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("trackMap"),
                  transform: `translate3d(${settings.widgets.trackMap?.x ?? 0}px, ${settings.widgets.trackMap?.y ?? 0}px, 0) scale(${settings.widgets.trackMap?.scale ?? 1.0})`,
                  "transform-origin": "bottom left",
                }}
                class={`absolute bottom-[210px] left-[320px] z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <TrackMap
                  cars={trackMapCars().length > 0 ? trackMapCars() : undefined}
                  trackName={telemetry.frame?.trackName}
                  sectors={telemetry.frame?.lapDelta?.sectors}
                  currentSector={telemetry.frame?.lapDelta?.currentSector}
                  hazard={telemetry.frame?.hazard}
                  yellowFlag={telemetry.frame?.systemMessage?.activeEvent === "yellowFlag"}
                  revenge={telemetry.frame?.revenge}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.trackMap?.scale ?? 1.0}
                  width={settings.widgets.trackMap?.width ?? 460}
                  onScaleChange={(scale) => updateWidgetTransform("trackMap", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("trackMap", { width })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="trackMap" />
                </Show>
              </div>
            </Show>

            {/* 기능 16: 테마별 RPM 시프트 라이트 LED 바 (Top-Center HUD) */}
            <Show when={settings.widgets.shiftLight?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("shiftLight", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("shiftLight"),
                  transform: `translate3d(calc(-50% + ${settings.widgets.shiftLight?.x ?? 0}px), ${settings.widgets.shiftLight?.y ?? 0}px, 0) scale(${settings.widgets.shiftLight?.scale ?? 1.0})`,
                  "transform-origin": "top center",
                }}
                class={`absolute top-[136px] left-1/2 z-30 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-lg"
                    : "pointer-events-none"
                }`}
              >
                <ShiftLight
                  data={telemetry.frame?.shiftLight}
                  theme={settings.theme}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.shiftLight?.scale ?? 1.0}
                  width={settings.widgets.shiftLight?.width ?? 440}
                  onScaleChange={(scale) => updateWidgetTransform("shiftLight", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("shiftLight", { width })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="shiftLight" />
                </Show>
              </div>
            </Show>

            {/* 콕핏 스티어링 허브 (Bottom-Center, 60Hz) */}
            <Show when={settings.widgets.telemetryHub?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("telemetryHub", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("telemetryHub"),
                  transform: `translate3d(calc(-50% + ${settings.widgets.telemetryHub.x}px), ${settings.widgets.telemetryHub.y}px, 0) scale(${settings.widgets.telemetryHub.scale})`,
                  "transform-origin": "bottom center",
                }}
                class={`absolute bottom-6 left-1/2 z-30 select-none ${
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
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="telemetryHub" />
                </Show>
              </div>
            </Show>

            {/* 기능 15: 디지플래그 / 세션 플래그 경보 (Top-Center High Visibility) */}
            <Show when={settings.widgets.digiflag?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("digiflag", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("digiflag"),
                  transform: `translate3d(calc(-50% + ${settings.widgets.digiflag?.x ?? 0}px), ${settings.widgets.digiflag?.y ?? 0}px, 0) scale(${settings.widgets.digiflag?.scale ?? 1.0})`,
                  "transform-origin": "top center",
                }}
                class={`absolute top-4 left-1/2 z-40 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-[2px]"
                    : "pointer-events-none"
                }`}
              >
                <Digiflag
                  sessionFlags={telemetry.frame?.sessionFlags}
                  approachingCarNumber={
                    // Only real when a faster car is actually closing; otherwise the
                    // blue flag would name a car that is nowhere near us.
                    telemetry.frame?.multiclass?.hasApproachingFastCar
                      ? telemetry.frame?.multiclass?.carNumber
                      : undefined
                  }
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.digiflag?.scale ?? 1.0}
                  width={settings.widgets.digiflag?.width ?? 240}
                  onScaleChange={(scale) => updateWidgetTransform("digiflag", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("digiflag", { width })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="digiflag" />
                </Show>
              </div>
            </Show>

            {/* 기능 14: 피트박스 카운트다운 & 리미터 헬퍼 (Center Pit View) */}
            <Show when={settings.widgets.pitBoxHelper?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("pitBoxHelper", e)}
                style={{
                  "--hud-bg-alpha": widgetBgAlpha("pitBoxHelper"),
                  transform: `translate3d(calc(-50% + ${settings.widgets.pitBoxHelper?.x ?? 0}px), ${settings.widgets.pitBoxHelper?.y ?? 0}px, 0) scale(${settings.widgets.pitBoxHelper?.scale ?? 1.0})`,
                  "transform-origin": "center center",
                }}
                class={`absolute top-[40%] left-1/2 z-35 select-none ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-xl rounded-[2px]"
                    : "pointer-events-none"
                }`}
              >
                <PitBoxHelper
                  pitLane={telemetry.frame?.pitLane}
                  speedKmh={telemetry.frame?.player?.speedKmh}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.pitBoxHelper?.scale ?? 1.0}
                  width={settings.widgets.pitBoxHelper?.width ?? 340}
                  onScaleChange={(scale) => updateWidgetTransform("pitBoxHelper", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("pitBoxHelper", { width })}
                />
                <Show when={settings.isEditMode}>
                  <OpacityChip widgetKey="pitBoxHelper" />
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </main>
  );
};

import { Component, Show, createSignal, createMemo } from "solid-js";
import { IconFuel, IconPit, IconWarning, IconChevronUp, IconChevronDown } from "../../assets/icons/Icons.tsx";
import { t } from "../../i18n/index.ts";

export interface FuelSimulatorProps {
  fuelLevelLiters?: number;
  fuelMaxLiters?: number;
  fuelAvgPerLap?: number;
  fuelLastLap?: number;
  fuelLapsRemaining?: number;
  fuelNeededToFinish?: number;
  fuelPitAddLiters?: number;
  fuelSaveTargetPerLap?: number;
  fuelSaveDelta?: number;
  pitWindowOpenLap?: number;
  pitWindowCloseLap?: number;
  pitLossSeconds?: number;
  inGamePitFuel?: number;
  inGameFuelFillChecked?: boolean;
  isExtraLapConfirmed?: boolean;
  safetyMarginLiters?: number;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
}

export const FuelSimulator: Component<FuelSimulatorProps> = (props) => {
  // Test switcher in Edit Mode:
  // 0 = LIVE (Props)
  // 1 = NORMAL (Plenty of fuel, safe to finish or normal stint)
  // 2 = LIFT & COAST (Deficit, save 0.17 L/L to eliminate pit stop)
  // 3 = LOW FUEL / PIT IN (Critical fuel, < 2 laps, pit required)
  // 4 = BOX AUDIT WARN (In-game F4 black box deficit / uncheck warning)
  // ponytail: intentional simplification — compact signal without external store
  const [testStateStep, setTestStateStep] = createSignal<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = createSignal<boolean>(true);
  const [marginOffset, setMarginOffset] = createSignal<number>(0.5); // Safety margin in Liters

  const cycleTest = (e: MouseEvent) => {
    e.stopPropagation();
    setTestStateStep((prev) => (prev + 1) % 5);
  };

  const cycleMargin = (e: MouseEvent) => {
    e.stopPropagation();
    const margins = [0.0, 0.5, 1.0, 1.5, 2.0];
    const nextIdx = (margins.indexOf(marginOffset()) + 1) % margins.length;
    setMarginOffset(margins[nextIdx]);
  };

  const current = createMemo(() => {
    const step = testStateStep();
    if (step === 1) {
      // NORMAL
      return {
        level: 42.5,
        max: 110,
        avg: 2.35,
        last: 2.34,
        lapsRem: 18.1,
        needed: 35.2,
        pitAdd: 0.0,
        saveTarget: 2.35,
        saveDelta: 0.0,
        windowOpen: 10,
        windowClose: 24,
        pitLoss: 0.0,
        inGamePit: 0.0,
        inGameFill: true,
        extraLap: false,
      };
    }
    if (step === 2) {
      // LIFT & COAST
      return {
        level: 18.2,
        max: 110,
        avg: 2.45,
        last: 2.48,
        lapsRem: 7.4,
        needed: 21.6,
        pitAdd: 3.4 + marginOffset(),
        saveTarget: 2.28,
        saveDelta: 0.17,
        windowOpen: 12,
        windowClose: 18,
        pitLoss: 21.2,
        inGamePit: 10.0,
        inGameFill: true,
        extraLap: true,
      };
    }
    if (step === 3) {
      // LOW FUEL / PIT IN
      return {
        level: 3.4,
        max: 110,
        avg: 2.42,
        last: 2.40,
        lapsRem: 1.4,
        needed: 36.8,
        pitAdd: 34.0 + marginOffset(),
        saveTarget: 0.85,
        saveDelta: 1.57,
        windowOpen: 14,
        windowClose: 16,
        pitLoss: 29.5,
        inGamePit: 34.0,
        inGameFill: true,
        extraLap: true,
      };
    }
    if (step === 4) {
      // BOX AUDIT WARN
      return {
        level: 22.0,
        max: 110,
        avg: 2.38,
        last: 2.35,
        lapsRem: 9.2,
        needed: 45.0,
        pitAdd: 24.0 + marginOffset(),
        saveTarget: 1.80,
        saveDelta: 0.58,
        windowOpen: 12,
        windowClose: 18,
        pitLoss: 26.2,
        inGamePit: 12.0, // Significant deficit vs 24.0L!
        inGameFill: false, // Checkbox unchecked!
        extraLap: true,
      };
    }

    // LIVE from telemetry props
    const level = props.fuelLevelLiters !== undefined ? props.fuelLevelLiters : 38.5;
    const max = props.fuelMaxLiters || 110;
    const avg = props.fuelAvgPerLap !== undefined ? props.fuelAvgPerLap : 2.38;
    const last = props.fuelLastLap !== undefined ? props.fuelLastLap : 2.35;
    const lapsRem = props.fuelLapsRemaining !== undefined ? props.fuelLapsRemaining : Number((level / Math.max(0.1, avg)).toFixed(1));
    const pitAdd = props.fuelPitAddLiters !== undefined
      ? props.fuelPitAddLiters + marginOffset()
      : Math.max(0, (props.fuelNeededToFinish || 0) - level + marginOffset());
    const saveTarget = props.fuelSaveTargetPerLap !== undefined ? props.fuelSaveTargetPerLap : 2.22;
    const saveDelta = props.fuelSaveDelta !== undefined ? props.fuelSaveDelta : Number((avg - saveTarget).toFixed(2));

    return {
      level,
      max,
      avg,
      last,
      lapsRem,
      needed: props.fuelNeededToFinish ?? 48.0,
      pitAdd: Number(pitAdd.toFixed(1)),
      saveTarget,
      saveDelta,
      windowOpen: props.pitWindowOpenLap ?? 12,
      windowClose: props.pitWindowCloseLap ?? 18,
      pitLoss: props.pitLossSeconds ?? 26.4,
      inGamePit: props.inGamePitFuel ?? Number(pitAdd.toFixed(0)),
      inGameFill: props.inGameFuelFillChecked ?? true,
      extraLap: props.isExtraLapConfirmed ?? true,
    };
  });

  const pct = () => Math.min(100, Math.max(0, (current().level / current().max) * 100));
  const isCritical = () => current().lapsRem <= 1.8;
  const isLow = () => current().lapsRem <= 3.2 && !isCritical();

  const isAuditDeficit = () => {
    const d = current();
    return d.inGamePit < d.pitAdd - 1.5;
  };

  const isAuditWarning = () => !current().inGameFill || isAuditDeficit();

  const width = () => props.width ?? 280;

  return (
    <div
      class="relative flex flex-col font-sans select-none pointer-events-auto group/fuel shadow-2xl"
      style={{ width: `${width()}px` }}
    >
      {/* Edit Mode Top Toolbar */}
      <Show when={props.isEditMode}>
        <div
          class="flex items-center justify-between px-2.5 py-1 mb-1.5 rounded-lg hud-surface-deep backdrop-blur-md border border-white/20 text-[10px] text-white/80 shadow-lg"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-[#00d26a]">⛽ {t().fuelStrategyTitle}</span>
            <span class="text-white/30">|</span>
            <span class="font-mono text-[9px] text-white/60">{width()}px</span>
          </div>

          <div class="flex items-center gap-1.5">
            {/* Margin Quick Switcher */}
            <button
              onClick={cycleMargin}
              class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[9px] font-mono text-white cursor-pointer active:scale-95"
              title="Click to cycle safety margin"
            >
              +{marginOffset().toFixed(1)}L
            </button>

            {/* Test State Switcher */}
            <button
              onClick={cycleTest}
              class={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer active:scale-95 transition-colors ${
                testStateStep() === 0
                  ? "bg-white/15 text-white/70 hover:bg-white/25"
                  : testStateStep() === 1
                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                  : testStateStep() === 2
                  ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                  : testStateStep() === 3
                  ? "bg-red-500/40 text-red-300 border border-red-500/50 animate-pulse"
                  : "bg-purple-500/40 text-purple-300 border border-purple-500/50"
              }`}
              title="Cycle test state"
            >
              {testStateStep() === 0
                ? "LIVE"
                : testStateStep() === 1
                ? "NORMAL"
                : testStateStep() === 2
                ? "L&C SAVE"
                : testStateStep() === 3
                ? "LOW FUEL"
                : "AUDIT WARN"}
            </button>

            {/* Scale +/- Controls */}
            <div class="flex items-center gap-1 bg-white/10 rounded px-1 py-0.5">
              <button
                onClick={() => props.onScaleChange && props.onScaleChange(Math.max(0.7, (props.scale || 1) - 0.1))}
                class="w-4 h-4 rounded bg-white/15 hover:bg-white/30 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                -
              </button>
              <span class="text-[9px] font-mono font-bold w-6 text-center">{Math.round((props.scale || 1) * 100)}%</span>
              <button
                onClick={() => props.onScaleChange && props.onScaleChange(Math.min(1.5, (props.scale || 1) + 0.1))}
                class="w-4 h-4 rounded bg-white/15 hover:bg-white/30 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Main Container */}
      <div
        class={`hud-surface backdrop-blur-md rounded-xl overflow-hidden shadow-2xl transition-all duration-200 border ${
          isCritical()
            ? "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
            : isLow()
            ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            : "border-white/15"
        }`}
      >
        {/* Header Bar */}
        <div class="flex items-center justify-between hud-surface-band border-b border-white/10 px-3 py-1.5">
          <div class="flex items-center gap-2">
            <IconFuel
              size={14}
              class={isCritical() ? "text-red-400 animate-pulse" : isLow() ? "text-amber-400" : "text-[#00d26a]"}
            />
            <span class="text-[10px] font-mono font-extrabold tracking-wider text-white">
              FUEL STRATEGY
            </span>
          </div>

          <div class="flex items-center gap-2">
            {/* Leader 0:00 Extra Lap Indicator */}
            <Show when={current().extraLap}>
              <span
                class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                title="Overall leader crosses line before 0:00 — +1 lap fuel calculated"
              >
                +1 LAP CONFIRMED
              </span>
            </Show>

            <span class="text-[9px] font-mono font-bold tabular-nums text-white/80">
              {pct().toFixed(0)}%
            </span>

            {/* Expand / Collapse Drawer Toggle */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen())}
              class="w-4 h-4 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle Strategy Details"
            >
              <Show when={isDrawerOpen()} fallback={<IconChevronDown size={12} />}>
                <IconChevronUp size={12} />
              </Show>
            </button>
          </div>
        </div>

        {/* Dynamic Tank Progress Bar */}
        <div class="relative w-full h-1.5 bg-black/60 overflow-hidden">
          <div
            class={`h-full transition-all duration-300 ${
              isCritical()
                ? "bg-red-500 animate-pulse"
                : isLow()
                ? "bg-amber-400"
                : "bg-gradient-to-r from-[#e10600] via-[#ffd100] to-[#00d26a]"
            }`}
            style={{ width: `${pct()}%` }}
          />
        </div>

        {/* Primary Metrics 2-Column Card */}
        <div class="grid grid-cols-2 gap-2 p-2.5 text-white">
          {/* Remaining Fuel & Laps */}
          <div class="flex flex-col bg-white/[0.04] p-2 rounded-lg border border-white/[0.06]">
            <span class="text-[9px] font-mono font-semibold text-white/50 tracking-wider">REMAINING</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-base font-mono font-extrabold text-white tabular-nums tracking-tight">
                {current().level.toFixed(1)}
              </span>
              <span class="text-[10px] font-mono font-bold text-white/60">L</span>
            </div>
            <span
              class={`text-[9px] font-mono font-bold mt-0.5 ${
                isCritical() ? "text-red-400" : isLow() ? "text-amber-300" : "text-[#00d26a]"
              }`}
            >
              {current().lapsRem.toFixed(1)} LAPS
            </span>
          </div>

          {/* Clean Avg & Pit Requirement */}
          <div class="flex flex-col bg-white/[0.04] p-2 rounded-lg border border-white/[0.06]">
            <span class="text-[9px] font-mono font-semibold text-white/50 tracking-wider">CLEAN AVG / PIT</span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-base font-mono font-extrabold text-amber-300 tabular-nums tracking-tight">
                {current().avg.toFixed(2)}
              </span>
              <span class="text-[10px] font-mono font-bold text-white/60">L/L</span>
            </div>
            <div class="flex items-center gap-1 mt-0.5">
              <Show
                when={current().pitAdd > 0.1}
                fallback={<span class="text-[9px] text-[#00d26a] font-mono font-bold">NO STOP NEEDED</span>}
              >
                <span class="text-[9px] text-cyan-300 font-mono font-bold tabular-nums">
                  PIT: +{current().pitAdd.toFixed(1)}L
                </span>
              </Show>
            </div>
          </div>
        </div>

        {/* Dynamic Lift & Coast / Strategy Status Banner */}
        <div class="px-2.5 pb-2">
          <Show
            when={current().pitAdd > 0.1}
            fallback={
              <div class="flex items-center justify-between px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  SAFE TO FINISH (NO STOP)
                </span>
                <span class="text-white/70">PACE OK</span>
              </div>
            }
          >
            <Show
              when={current().saveDelta <= 0.35 && current().saveDelta > 0}
              fallback={
                <div class="flex items-center justify-between px-2 py-1 rounded bg-red-500/15 border border-red-500/30 text-red-300 text-[9px] font-mono font-bold">
                  <span class="flex items-center gap-1.5">
                    <IconPit size={11} class="text-red-400" />
                    PIT STOP REQUIRED
                  </span>
                  <span class="text-white/80 tabular-nums">+{current().pitAdd.toFixed(1)}L</span>
                </div>
              }
            >
              <div class="flex items-center justify-between px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold animate-pulse">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  LIFT & COAST • SAVE {current().saveDelta.toFixed(2)} L/L
                </span>
                <span class="text-white/80 tabular-nums">TARGET {current().saveTarget.toFixed(2)}</span>
              </div>
            </Show>
          </Show>
        </div>

        {/* Strategy Drawer (Pit Window & In-Game Box Audit) */}
        <Show when={isDrawerOpen()}>
          <div class="bg-black/30 border-t border-white/10 px-2.5 py-2 flex flex-col gap-1.5 text-[9px] font-mono">
            {/* Stint Pit Window */}
            <div class="flex items-center justify-between text-white/70">
              <span class="text-white/40">PIT WINDOW</span>
              <span class="text-white font-semibold">
                Open: <span class="text-emerald-400">L{current().windowOpen}</span> • Empty:{" "}
                <span class="text-red-400">L{current().windowClose}</span>
              </span>
            </div>

            {/* In-game F4 Black Box Audit */}
            <div
              class={`flex items-center justify-between px-1.5 py-0.5 rounded transition-colors ${
                isAuditWarning() ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-white/[0.03] text-white/70"
              }`}
            >
              <div class="flex items-center gap-1">
                <Show when={isAuditWarning()}>
                  <IconWarning size={11} class="text-red-400 animate-bounce" />
                </Show>
                <span class="text-white/50">F4 BLACK BOX:</span>
                <span class="text-white font-bold tabular-nums">
                  {current().inGameFill ? `${current().inGamePit.toFixed(0)}L` : "OFF"}
                </span>
              </div>

              <Show
                when={!current().inGameFill}
                fallback={
                  <Show
                    when={isAuditDeficit()}
                    fallback={<span class="text-emerald-400 font-bold">MATCHED ✓</span>}
                  >
                    <span class="text-red-400 font-bold tabular-nums">
                      DEFICIT -{(current().pitAdd - current().inGamePit).toFixed(1)}L
                    </span>
                  </Show>
                }
              >
                <span class="text-red-400 font-extrabold animate-pulse">FILL UNCHECKED!</span>
              </Show>
            </div>

            {/* Pit Loss Time Estimate */}
            <div class="flex items-center justify-between text-white/50 text-[8px]">
              <span>PIT TIME LOSS</span>
              <span class="text-white/80 tabular-nums">
                ~{current().pitLoss.toFixed(1)}s (Transit + Refuel)
              </span>
            </div>
          </div>
        </Show>

        {/* Bottom-Right Corner 2D Resize Handle (Edit Mode) */}
        <Show when={props.isEditMode}>
          <div
            class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 hover:bg-amber-300 rounded-br cursor-ew-resize z-50 flex items-end justify-end p-0.5 border border-black shadow pointer-events-auto"
            title="Drag to resize width"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startW = width();

              const handleMouseMove = (moveEvt: MouseEvent) => {
                const deltaX = moveEvt.clientX - startX;
                props.onWidthChange?.(Math.min(380, Math.max(240, startW + deltaX)));
              };

              const handleMouseUp = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
              };

              window.addEventListener("mousemove", handleMouseMove);
              window.addEventListener("mouseup", handleMouseUp);
            }}
          >
            <div class="w-1.5 h-1.5 border-r border-b border-black/80" />
          </div>
        </Show>
      </div>
    </div>
  );
};

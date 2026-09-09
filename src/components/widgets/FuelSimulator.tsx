import { Component, Show, createSignal, createMemo } from "solid-js";
import { IconChevronUp, IconChevronDown } from "../../assets/icons/Icons.tsx";
import { FUEL_ESTIMATE_FACTOR } from "../../services/telemetry/derive.ts";
import type { FuelPlan } from "../../services/telemetry/types.ts";

export interface FuelSimulatorProps {
  /** Derived in derive.ts from FuelLevel / SessionLapsRemainEx / PitSvFuel. */
  fuel?: FuelPlan;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
}

/** Edit-mode rehearsal states. Real plans, run through the real maths. */
const TEST_PLANS: { label: string; plan: FuelPlan }[] = [
  {
    label: "SAFE",
    plan: {
      level: 42.5, usableMax: 110, tankPct: 38.6, avgPerLap: 2.35, perLapEstimate: 2.585,
      lapsOnFuel: 16.4, lapsRemaining: 12, toFinish: 0, saveTargetPerLap: 3.54, saveDelta: 0,
      boxFuel: 0, fuelFillChecked: true, boxUnderfilled: false,
      pitWindowOpenLap: 0, pitWindowCloseLap: 26, pitLossSeconds: 0,
    },
  },
  {
    label: "SAVE",
    plan: {
      level: 18.2, usableMax: 110, tankPct: 16.5, avgPerLap: 2.45, perLapEstimate: 2.695,
      lapsOnFuel: 6.8, lapsRemaining: 8, toFinish: 3.4, saveTargetPerLap: 2.28, saveDelta: 0.17,
      boxFuel: 4, fuelFillChecked: true, boxUnderfilled: false,
      pitWindowOpenLap: 12, pitWindowCloseLap: 18, pitLossSeconds: 19.2,
    },
  },
  {
    label: "LOW",
    plan: {
      level: 3.4, usableMax: 110, tankPct: 3.1, avgPerLap: 2.42, perLapEstimate: 2.662,
      lapsOnFuel: 1.3, lapsRemaining: 14, toFinish: 33.9, saveTargetPerLap: 0.24, saveDelta: 2.18,
      boxFuel: 34, fuelFillChecked: true, boxUnderfilled: false,
      pitWindowOpenLap: 14, pitWindowCloseLap: 16, pitLossSeconds: 30.1,
    },
  },
  {
    label: "BOX WARN",
    plan: {
      level: 22.0, usableMax: 110, tankPct: 20, avgPerLap: 2.38, perLapEstimate: 2.618,
      lapsOnFuel: 8.4, lapsRemaining: 18, toFinish: 25.1, saveTargetPerLap: 1.22, saveDelta: 1.16,
      boxFuel: 12, fuelFillChecked: false, boxUnderfilled: true,
      pitWindowOpenLap: 12, pitWindowCloseLap: 18, pitLossSeconds: 27.0,
    },
  },
  {
    label: "NO DATA",
    plan: {
      level: 42.5, usableMax: 110, tankPct: 38.6, avgPerLap: 0, perLapEstimate: 0,
      lapsOnFuel: -1, lapsRemaining: -1, toFinish: 0, saveTargetPerLap: 0, saveDelta: 0,
      boxFuel: 0, fuelFillChecked: true, boxUnderfilled: false,
      pitWindowOpenLap: -1, pitWindowCloseLap: -1, pitLossSeconds: 0,
    },
  },
];

const DASH = "—";

/**
 * Fuel strategy, F1 world-feed styling: square slab, oblique caps, value over
 * micro-label, tabular numerals so nothing jitters at 60Hz.
 *
 * Every number is derived from real SDK variables (see derive.ts). Before the
 * first clean green lap completes there IS no per-lap burn, and the widget shows
 * dashes rather than inventing one — a made-up fuel number ends races.
 */
export const FuelSimulator: Component<FuelSimulatorProps> = (props) => {
  const [testStep, setTestStep] = createSignal(0); // 0 = live
  const [drawerOpen, setDrawerOpen] = createSignal(true);

  const plan = createMemo<FuelPlan | undefined>(() => {
    if (props.isEditMode && testStep() > 0) return TEST_PLANS[testStep() - 1].plan;
    return props.fuel ?? (props.isEditMode ? TEST_PLANS[0].plan : undefined);
  });

  /** No clean green lap yet -> no per-lap burn -> nothing downstream is real. */
  const known = () => (plan()?.avgPerLap ?? 0) > 0;
  const laps = () => plan()?.lapsOnFuel ?? -1;
  const isCritical = () => known() && laps() >= 0 && laps() <= 1.8;
  const isLow = () => known() && laps() >= 0 && laps() <= 3.2 && !isCritical();
  const needsStop = () => (plan()?.toFinish ?? 0) > 0.05;
  /** Saving is only realistic while the shortfall is within a lift-and-coast. */
  const canSave = () => needsStop() && (plan()?.saveDelta ?? 0) > 0 && (plan()?.saveDelta ?? 0) <= 0.35;

  const width = () => Math.max(240, Math.min(380, props.width ?? 300));
  const accent = () => (isCritical() ? "#E10600" : isLow() ? "#F59E0B" : "#00D26A");
  const num = (v: number, d = 1) => (known() ? v.toFixed(d) : DASH);

  return (
    <div class="relative flex flex-col font-sans select-none pointer-events-auto" style={{ width: `${width()}px` }}>
      {/* Edit-mode controls only — no widget title. */}
      <Show when={props.isEditMode}>
        <div
          class="flex items-center justify-between gap-1.5 px-2 py-1 f1-slab border-b-0 text-white"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTestStep((p) => (p + 1) % (TEST_PLANS.length + 1));
            }}
            class="px-2 py-0.5 bg-[#E10600]/20 hover:bg-[#E10600]/35 text-white border border-[#E10600]/70 text-[10px] f1-oblique cursor-pointer transition-all active:scale-95"
            title="Cycle rehearsal state"
          >
            {testStep() === 0 ? "LIVE" : TEST_PLANS[testStep() - 1].label}
          </button>
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onScaleChange?.(Math.max(0.7, (props.scale || 1) - 0.1));
              }}
              class="w-5 h-5 bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer border border-white/15"
            >
              -
            </button>
            <span class="text-[11px] font-mono font-bold tabular-nums w-9 text-center text-white/90">
              {Math.round((props.scale || 1) * 100)}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onScaleChange?.(Math.min(1.5, (props.scale || 1) + 0.1));
              }}
              class="w-5 h-5 bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer border border-white/15"
            >
              +
            </button>
          </div>
        </div>
      </Show>

      <Show when={plan()}>
        {(p) => (
          <div class="f1-slab flex flex-col overflow-hidden" style={{ "border-left": `3px solid ${accent()}` }}>
            {/* Title lockup: oblique caps over an F1 red rule */}
            <div class="flex items-baseline justify-between px-2.5 pt-1.5 pb-1 border-b-2 border-[#E10600]">
              <span class="f1-oblique text-[11px] text-white tracking-wider">FUEL</span>
              <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] tabular-nums text-white/60">{p().tankPct.toFixed(0)}%</span>
                <button
                  onClick={() => setDrawerOpen(!drawerOpen())}
                  class="w-4 h-4 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  title="Strategy detail"
                >
                  <Show when={drawerOpen()} fallback={<IconChevronDown size={12} />}>
                    <IconChevronUp size={12} />
                  </Show>
                </button>
              </div>
            </div>

            {/* Tank */}
            <div class="relative w-full h-[3px] bg-black/70">
              <div
                class={`h-full transition-[width] duration-300 ${isCritical() ? "animate-pulse" : ""}`}
                style={{ width: `${p().tankPct}%`, background: accent() }}
              />
            </div>

            {/* Primary read: laps on board, level, burn */}
            <div class="grid grid-cols-3 divide-x divide-white/10 px-1 py-2">
              <div class="flex flex-col items-center gap-0.5">
                <span class="f1-value text-[26px]" style={{ color: accent() }}>
                  {known() && laps() >= 0 ? laps().toFixed(1) : DASH}
                </span>
                <span class="f1-label">LAPS LEFT</span>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <span class="f1-value text-[26px] text-white">{p().level.toFixed(1)}</span>
                <span class="f1-label">LITRES</span>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <span class="f1-value text-[26px] text-white">{num(p().avgPerLap, 2)}</span>
                <span class="f1-label">PER LAP</span>
              </div>
            </div>

            {/* Status band: what to do about it */}
            <div
              class={`flex items-center justify-between px-2.5 py-1 text-[10px] f1-oblique ${
                !known()
                  ? "bg-white/[0.06] text-white/50"
                  : p().boxUnderfilled
                  ? "bg-[#E10600] text-white animate-pulse"
                  : canSave()
                  ? "bg-[#F59E0B] text-black"
                  : needsStop()
                  ? "bg-[#F59E0B]/20 text-[#FCD34D] border-t border-[#F59E0B]/40"
                  : "bg-[#00D26A]/15 text-[#00D26A] border-t border-[#00D26A]/30"
              }`}
            >
              <Show
                when={known()}
                fallback={<span>AWAITING FIRST GREEN LAP</span>}
              >
                <span>
                  {p().boxUnderfilled
                    ? "BOX WILL NOT FUEL TO FINISH"
                    : canSave()
                    ? `LIFT & COAST · SAVE ${p().saveDelta.toFixed(2)} L`
                    : needsStop()
                    ? "PIT STOP REQUIRED"
                    : "FUEL TO FINISH"}
                </span>
                <span class="font-mono tabular-nums not-italic">
                  {needsStop() ? `+${p().toFinish.toFixed(1)} L` : "OK"}
                </span>
              </Show>
            </div>

            {/* Strategy drawer */}
            <Show when={drawerOpen()}>
              <div class="flex flex-col gap-1 px-2.5 py-1.5 bg-black/35 border-t border-white/10 text-[9px] font-mono">
                <div class="flex items-center justify-between">
                  <span class="f1-label">PIT WINDOW</span>
                  <span class="tabular-nums text-white/85">
                    <Show when={p().pitWindowOpenLap >= 0} fallback={DASH}>
                      OPEN <span class="text-[#00D26A]">L{p().pitWindowOpenLap}</span> · DRY{" "}
                      <span class="text-[#E10600]">L{p().pitWindowCloseLap}</span>
                    </Show>
                  </span>
                </div>

                {/* iRacing's own F4 black box — the number that actually goes in */}
                <div
                  class={`flex items-center justify-between px-1.5 py-0.5 ${
                    p().boxUnderfilled ? "bg-[#E10600]/25 text-[#FFA8A8]" : "text-white/70"
                  }`}
                >
                  <span class="f1-label">F4 BLACK BOX</span>
                  <span class="tabular-nums">
                    <Show when={p().fuelFillChecked} fallback={<span class="text-[#E10600] font-bold">FILL OFF</span>}>
                      {p().boxFuel.toFixed(0)} L{" "}
                      <Show when={p().boxUnderfilled} fallback={<span class="text-[#00D26A]">OK</span>}>
                        <span class="text-[#E10600]">SHORT {(p().toFinish - p().boxFuel).toFixed(1)}</span>
                      </Show>
                    </Show>
                  </span>
                </div>

                <div class="flex items-center justify-between text-white/45">
                  <span class="f1-label">PIT LOSS EST</span>
                  <span class="tabular-nums">{p().pitLossSeconds > 0 ? `~${p().pitLossSeconds.toFixed(1)}s` : DASH}</span>
                </div>
                <div class="flex items-center justify-between text-white/45">
                  <span class="f1-label">MARGIN</span>
                  <span class="tabular-nums">×{FUEL_ESTIMATE_FACTOR.toFixed(2)} ON MEASURED BURN</span>
                </div>
              </div>
            </Show>

            {/* Width handle */}
            <Show when={props.isEditMode}>
              <div
                class="absolute top-0 -right-1.5 bottom-0 w-3 flex items-center justify-center cursor-ew-resize z-30 pointer-events-auto group"
                title="Drag to resize width"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startW = width();
                  const scale = props.scale || 1;
                  const onMove = (ev: MouseEvent) =>
                    props.onWidthChange?.(Math.max(240, Math.min(380, Math.round(startW + (ev.clientX - startX) / scale))));
                  const onUp = () => {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              >
                <div class="w-1.5 h-7 bg-white/30 group-hover:bg-[#F59E0B] transition-colors" />
              </div>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
};

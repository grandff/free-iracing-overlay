import { Component, Show, createSignal, createMemo, onCleanup } from "solid-js";
import { PitLaneTelemetry } from "../../services/telemetry/types.ts";
import {
  IconPit,
  IconPitStopSign,
  IconWarning,
  IconSpeedLimit,
} from "../../assets/icons/Icons.tsx";
import { t } from "../../i18n/index.ts";

export interface PitBoxHelperProps {
  pitLane?: PitLaneTelemetry;
  speedKmh?: number;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
}

export const PitBoxHelper: Component<PitBoxHelperProps> = (props) => {
  // Width: default 340px, min 260px, max 480px
  const currentWidth = () => Math.max(260, Math.min(480, props.width ?? 340));

  // Edit-mode interactive test switcher:
  // 0: LIVE
  // 1: APPROACH (45m, 58.4 km/h, Safe)
  // 2: DECEL (22m, 45.0 km/h, Caution)
  // 3: BOX (6m, 18.2 km/h, Prepare to stop)
  // 4: STOP (0m, 0 km/h, STOP NOW)
  // 5: OVERSPEED (40m, 63.8 km/h, Danger!)
  // 6: OFF (Ghost frame)
  const [testStep, setTestStep] = createSignal<number>(0);

  const activeData = createMemo(() => {
    if (props.isEditMode) {
      switch (testStep()) {
        case 1:
          return {
            onPitRoad: true,
            inPitStall: false,
            speed: 58.4,
            speedLimit: 60,
            distance: 45.0,
            limiterActive: true,
          };
        case 2:
          return {
            onPitRoad: true,
            inPitStall: false,
            speed: 45.0,
            speedLimit: 60,
            distance: 22.0,
            limiterActive: true,
          };
        case 3:
          return {
            onPitRoad: true,
            inPitStall: false,
            speed: 18.2,
            speedLimit: 60,
            distance: 6.0,
            limiterActive: true,
          };
        case 4:
          return {
            onPitRoad: true,
            inPitStall: true,
            speed: 0.0,
            speedLimit: 60,
            distance: 0.0,
            limiterActive: true,
          };
        case 5:
          return {
            onPitRoad: true,
            inPitStall: false,
            speed: 63.8,
            speedLimit: 60,
            distance: 40.0,
            limiterActive: false,
          };
        case 6:
          return {
            onPitRoad: false,
            inPitStall: false,
            speed: 210,
            speedLimit: 60,
            distance: 50,
            limiterActive: false,
          };
        case 0:
        default:
          break;
      }
    }

    const p = props.pitLane;
    return {
      onPitRoad: p?.onPitRoad ?? false,
      inPitStall: p?.inPitStall ?? false,
      speed: props.speedKmh ?? 0,
      speedLimit: p?.pitSpeedLimitKmh ?? 60,
      // undefined = the session has not told us where the box is yet.
      distance: p?.distanceToStallMeters,
      limiterActive: p?.limiterActive ?? false,
    };
  });

  const isOverspeed = () => activeData().onPitRoad && activeData().speed > activeData().speedLimit + 0.5;
  /** Unknown stall reads as "far away", so nothing lights up on a guess. */
  const stallDist = () => activeData().distance ?? Number.POSITIVE_INFINITY;
  const isStopping = () => activeData().onPitRoad && stallDist() <= 1.5;

  const cycleTest = (e: MouseEvent) => {
    e.stopPropagation();
    setTestStep((prev) => (prev + 1) % 7);
  };

  const testLabel = createMemo(() => {
    switch (testStep()) {
      case 0: return "LIVE";
      case 1: return "APPROACH (45m)";
      case 2: return "DECEL (22m)";
      case 3: return "BOX (6m)";
      case 4: return "STOP (0m)";
      case 5: return "OVERSPEED";
      case 6: return "OFF";
      default: return "TEST";
    }
  });

  // Mouse Drag Resizing
  const [isResizing, setIsResizing] = createSignal(false);
  let startX = 0;
  let startW = 340;

  const onMouseDownResize = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    startX = e.clientX;
    startW = currentWidth();

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const targetW = Math.max(260, Math.min(480, Math.round(startW + deltaX)));
      props.onWidthChange?.(targetW);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  onCleanup(() => {
    setIsResizing(false);
  });

  return (
    <div
      class="relative flex flex-col items-center select-none"
      style={{
        width: `${currentWidth()}px`,
      }}
    >
      {/* Edit Mode Toolbar */}
      <Show when={props.isEditMode}>
        <div class="w-full flex items-center justify-end px-2.5 py-1 mb-1.5 f1-slab text-white z-30 select-none">
          <div class="flex items-center gap-1">
            <button
              onClick={cycleTest}
              class="px-2 py-0.5 rounded-[1px] bg-[#E10600]/20 hover:bg-[#E10600]/35 text-white border border-[#E10600]/70 text-[9.5px] f1-oblique tracking-wider transition-all active:scale-95 cursor-pointer"
              title={t().pitTestBtn}
            >
              {testLabel()}
            </button>

            {/* Scale +/- Controls */}
            <div class="flex items-center gap-0.5 bg-white/5 rounded-[1px] px-1 border border-white/10 ml-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onScaleChange?.(Math.max(0.7, Number(((props.scale ?? 1.0) - 0.05).toFixed(2))));
                }}
                class="hover:text-white px-1 font-bold text-white/60 active:scale-90"
              >
                -
              </button>
              <span class="text-[9px] tabular-nums text-white/90 min-w-[28px] text-center">
                {Math.round((props.scale ?? 1.0) * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onScaleChange?.(Math.min(1.5, Number(((props.scale ?? 1.0) + 0.05).toFixed(2))));
                }}
                class="hover:text-white px-1 font-bold text-white/60 active:scale-90"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Main Pit Box Card */}
      <Show
        when={activeData().onPitRoad}
        fallback={
          <Show when={props.isEditMode}>
            {/* Ghost Frame when outside pit lane */}
            <div class="w-full h-24 f1-slab border-l-4 border-l-[#E10600]/40 border border-dashed border-white/20 flex flex-col items-center justify-center text-white/40 font-mono text-xs gap-1.5 shadow-inner rounded-none">
              <IconPit size={22} class="opacity-40 text-cyan-400" />
              <span class="tracking-widest uppercase text-[9.5px] font-black f1-oblique">
                PIT BOX HELPER • PIT ROAD INACTIVE
              </span>
            </div>
          </Show>
        }
      >
        <div
          class={`w-full relative overflow-hidden f1-slab transition-all duration-150 p-2.5 shadow-2xl flex flex-col rounded-none ${
            isOverspeed()
              ? "border-l-4 border-l-[#E10600] border-red-500 bg-red-950/90 shadow-[0_0_28px_rgba(225,6,0,0.7)] animate-pulse"
              : isStopping()
              ? "border-l-4 border-l-[#E10600] border-red-500 bg-gradient-to-b from-red-950/95 via-black/95 to-red-950/95 shadow-[0_0_24px_rgba(225,6,0,0.6)]"
              : "border-l-4 border-l-[#E10600] border-white/10 bg-[#12141c]/95"
          }`}
        >
          {/* Header Strip: Title + Box Tag + Limiter Pill */}
          <div class="w-full flex items-center justify-between pb-2 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="f1-title text-[11px] text-white">
                {t().pitHelperTitle || "PIT HELPER"}
              </span>
              <span class="px-1.5 py-[1px] bg-[#E10600]/25 text-white border border-[#E10600]/60 rounded-[1px] text-[8.5px] font-mono font-black f1-oblique">
                BOX
              </span>
            </div>

            {/* Speed Limiter State Pill */}
            <div
              class={`px-2 py-0.5 rounded-[1px] text-[8.5px] font-mono font-black tracking-wider border flex items-center gap-1 f1-oblique ${
                activeData().limiterActive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-white/5 text-white/40 border-white/10"
              }`}
            >
              <span
                class={`w-1.5 h-1.5 rounded-[1px] ${
                  activeData().limiterActive ? "bg-emerald-400 animate-pulse" : "bg-white/20"
                }`}
              />
              <span>{activeData().limiterActive ? "LIMITER ON" : "LIMITER OFF"}</span>
            </div>
          </div>

          {/* Speed Limit & Pit Speed Telemetry Grid */}
          <div class="grid grid-cols-2 px-1 py-2 items-center bg-black/30 border-b border-white/10">
            {/* Speed Limit */}
            <div class="flex flex-col items-center justify-center">
              <div class="flex items-baseline gap-1">
                <IconSpeedLimit size={14} class="shrink-0 text-white/60 mr-0.5" />
                <span class="f1-value text-xl text-white tabular-nums">
                  {activeData().speedLimit}
                </span>
                <span class="text-[9px] font-mono font-bold text-white/50">KM/H</span>
              </div>
              <span class="f1-label mt-0.5 text-white/50">
                {t().pitSpeedLimit}
              </span>
            </div>

            {/* Current Pit Speed */}
            <div class="flex flex-col items-center justify-center border-l border-white/10">
              <div class="flex items-baseline gap-1">
                <span
                  class={`f1-value text-2xl tabular-nums ${
                    isOverspeed()
                      ? "text-red-400 animate-bounce"
                      : activeData().speed > activeData().speedLimit - 2
                      ? "text-[#FFD100]"
                      : "text-[#00D26A]"
                  }`}
                >
                  {activeData().speed.toFixed(1)}
                </span>
                <span class="text-[9px] font-mono font-bold text-white/70">KM/H</span>
              </div>
              <span class="f1-label mt-0.5 text-white/50">
                PIT SPEED
              </span>
            </div>
          </div>

          {/* Overspeed Alert Banner */}
          <Show when={isOverspeed()}>
            <div class="w-full my-1.5 py-1 px-2.5 bg-[#E10600] border-l-4 border-l-white flex items-center justify-between text-white shadow-lg animate-pulse rounded-none">
              <div class="flex items-center gap-1.5">
                <IconWarning size={14} class="text-white shrink-0" />
                <span class="text-[11px] font-black f1-oblique tracking-wider uppercase">
                  {t().pitOverspeed} • SLOW DOWN
                </span>
              </div>
              <span class="f1-value text-sm text-white tabular-nums">
                +{Math.max(0, activeData().speed - activeData().speedLimit).toFixed(1)} KM/H
              </span>
            </div>
          </Show>

          {/* Middle Stage: Pit Box Distance Countdown */}
          <div class="w-full flex flex-col items-center justify-center my-2">
            <Show
              when={!isStopping()}
              fallback={
                /* 0m STOP! F1 Grand Prix Pit Box Board */
                <div class="w-full py-2.5 px-3 bg-red-950/90 border-2 border-[#E10600] flex flex-col items-center justify-center shadow-[0_0_24px_rgba(225,6,0,0.8)] animate-pulse rounded-none">
                  <div class="flex items-center gap-2">
                    <span class="text-[#E10600] font-black text-2xl f1-oblique">[</span>
                    <IconPitStopSign size={26} class="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0" />
                    <span class="text-2xl font-black text-white f1-oblique tracking-widest">
                      {activeData().inPitStall ? t().pitInStall : t().pitStopNow}
                    </span>
                    <span class="text-[#E10600] font-black text-2xl f1-oblique">]</span>
                  </div>
                  <span class="f1-label text-red-200 mt-1.5 tracking-widest">
                    {activeData().inPitStall ? "SERVICE IN PROGRESS • HOLD BRAKE" : "BOX NOW • BRAKE FIRMLY"}
                  </span>
                </div>
              }
            >
              {/* Distance Readout */}
              <div class="flex flex-col items-center justify-center mb-1">
                <div class="flex items-baseline gap-1.5">
                  <span
                    class={`f1-value text-3xl tabular-nums ${
                      stallDist() <= 5
                        ? "text-red-400"
                        : stallDist() <= 15
                        ? "text-[#FFD100]"
                        : stallDist() <= 30
                        ? "text-[#38bdf8]"
                        : "text-white"
                    }`}
                  >
                    {activeData().distance !== undefined ? activeData().distance!.toFixed(1) : "—"}
                  </span>
                  <span class="text-xs font-mono font-bold text-white/50">METERS</span>
                </div>
                <span class="f1-label text-white/50">
                  {t().pitBoxDistance}
                </span>
              </div>

              {/* Countdown Segmented LED Track (16 Rectilinear Blocks) */}
              <div class="w-full flex items-center gap-1 p-1 bg-black/40 border border-white/10">
                {Array.from({ length: 16 }).map((_, i) => {
                  const progress = () => Math.max(0, Math.min(1, (50 - stallDist()) / 50));
                  const isActive = () => progress() >= (i + 1) / 16;
                  return (
                    <div
                      class={`flex-1 h-2.5 rounded-[1px] transition-colors duration-100 ${
                        isActive()
                          ? i >= 14
                            ? "bg-[#E10600] shadow-[0_0_8px_#E10600] animate-pulse"
                            : i >= 11
                            ? "bg-[#f97316] shadow-[0_0_6px_#f97316]"
                            : i >= 7
                            ? "bg-[#FFD100] shadow-[0_0_6px_#FFD100]"
                            : "bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]"
                          : "bg-white/10"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Milestone Markers */}
              <div class="w-full flex justify-between text-[8.5px] font-mono font-bold text-white/40 mt-1 px-0.5">
                <span>50M</span>
                <span class={stallDist() <= 30 ? "text-[#38bdf8]" : ""}>30M</span>
                <span class={stallDist() <= 15 ? "text-[#FFD100]" : ""}>15M</span>
                <span class={stallDist() <= 5 ? "text-[#f97316]" : ""}>5M</span>
                <span class={stallDist() <= 1.5 ? "text-[#E10600] font-black" : "text-white/60"}>BOX</span>
              </div>
            </Show>
          </div>

          {/* Bottom Card Footer Strip */}
          <div class="w-full flex items-center justify-between border-t border-white/10 pt-1.5 text-[9.5px] font-mono">
            <div class="flex items-center gap-1.5">
              <span
                class={`w-1.5 h-1.5 rounded-[1px] ${
                  activeData().inPitStall
                    ? "bg-[#E10600] animate-pulse"
                    : "bg-cyan-400 animate-pulse"
                }`}
              />
              <span class="text-white/70 font-bold uppercase tracking-wider f1-oblique">
                {activeData().inPitStall ? t().pitInStall : t().pitApproaching}
              </span>
            </div>
            <span class="text-[8.5px] text-white/40 uppercase tracking-widest font-mono">
              {activeData().inPitStall && (props.pitLane?.pitRepairRemainingSec ?? 0) > 0
                ? `REPAIR: ${props.pitLane?.pitRepairRemainingSec?.toFixed(1)}S`
                : `LIMIT: ${activeData().speedLimit} KM/H`}
            </span>
          </div>
        </div>
      </Show>

      {/* Resize Handle for Edit Mode */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={onMouseDownResize}
          class={`absolute right-[-6px] top-1/2 -translate-y-1/2 w-3.5 h-12 rounded-r-[1px] flex items-center justify-center cursor-ew-resize transition-colors ${
            isResizing() ? "bg-[#E10600] shadow-[0_0_12px_#E10600]" : "bg-white/20 hover:bg-[#E10600]/80"
          }`}
          title="Drag to resize width (260px ~ 480px)"
        >
          <div class="w-0.5 h-6 bg-white/70 rounded-[1px]" />
        </div>
      </Show>
    </div>
  );
};

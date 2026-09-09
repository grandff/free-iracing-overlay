import { Component, Show, createSignal, createMemo, onCleanup } from "solid-js";
import { IconWarning } from "../../assets/icons/Icons.tsx";
import { HazardType } from "../../services/telemetry/types.ts";
import { t } from "../../i18n/index.ts";

export interface IncidentHazardProps {
  sector?: number;
  incidentSector?: number;
  carNumber?: string;
  hazardCarNumber?: string;
  distanceMeters?: number;
  aheadHazardMeters?: number;
  hasIncident?: boolean;
  yellowFlagActive?: boolean;
  hazardType?: HazardType;
  speedKmh?: number;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
}

export const IncidentHazard: Component<IncidentHazardProps> = (props) => {
  // Width control: default 340px, min 280px, max 480px
  const currentWidth = () => Math.max(280, Math.min(480, props.width ?? 340));

  // Edit-mode interactive test switcher:
  // 0: LIVE (reads incoming live telemetry)
  // 1: SPIN (Lose control / spin-out, 140m ahead in Sector 2, 18 km/h) -> Critical Danger
  // 2: CRASH (Barrier / collision crash, 65m ahead in Sector 1, 0 km/h) -> Critical Danger
  // 3: STOPPED (Stopped on track, 280m ahead in Sector 3, 0 km/h) -> Caution Ahead
  // 4: CLEAR (No incident)
  const [testMode, setTestMode] = createSignal<0 | 1 | 2 | 3 | 4>(0);
  const [isResizing, setIsResizing] = createSignal(false);

  // Active data resolution
  const activeData = createMemo(() => {
    if (props.isEditMode && testMode() !== 0) {
      if (testMode() === 1) {
        return {
          active: true,
          type: "spin" as HazardType,
          dist: 140,
          sector: 2,
          carNum: "42",
          speedKmh: 18,
        };
      } else if (testMode() === 2) {
        return {
          active: true,
          type: "collision" as HazardType,
          dist: 65,
          sector: 1,
          carNum: "11",
          speedKmh: 0,
        };
      } else if (testMode() === 3) {
        return {
          active: true,
          type: "stopped" as HazardType,
          dist: 280,
          sector: 3,
          carNum: "88",
          speedKmh: 0,
        };
      } else {
        return {
          active: false,
          type: "yellowFlag" as HazardType,
          dist: 0,
          sector: 2,
          carNum: "",
          speedKmh: 0,
        };
      }
    }

    // Live telemetry resolution:
    // Only trigger for severe incidents (collision, spin/lose-control, stopped on track, yellow flag).
    // Subtle track limits / 10cm curb cuts at racing speeds are strictly ignored.
    const dist = props.aheadHazardMeters !== undefined ? props.aheadHazardMeters : props.distanceMeters;
    const hasActiveIncident =
      (props.hasIncident === true || props.yellowFlagActive === true) &&
      dist !== undefined &&
      dist > 0 &&
      dist <= 400;

    return {
      active: hasActiveIncident,
      type: props.hazardType || (props.yellowFlagActive ? "yellowFlag" : "spin"),
      dist: dist !== undefined ? Math.round(dist) : 180,
      sector: props.incidentSector !== undefined ? props.incidentSector : props.sector !== undefined ? props.sector : 2,
      carNum: props.hazardCarNumber || props.carNumber || "42",
      speedKmh: props.speedKmh !== undefined ? props.speedKmh : 18,
    };
  });

  // Distance tier: Critical (0~200m) vs Caution (200~400m)
  const isCritical = () => activeData().dist <= 200;

  // Type label resolution
  const typeLabel = (type: HazardType) => {
    switch (type) {
      case "collision":
        return t().hazardCollision;
      case "stopped":
        return t().hazardStopped;
      case "yellowFlag":
        return t().hazardYellowFlag;
      case "spin":
      default:
        return t().hazardSpin;
    }
  };

  // Horizontal Resize Mouse Handler
  let startX = 0;
  let startWidth = 0;
  let stopResizeListeners = () => {};

  const handleResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    startX = e.clientX;
    startWidth = currentWidth();
    stopResizeListeners();

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = (ev.clientX - startX) / (props.scale || 1);
      const newWidth = Math.round(Math.max(280, Math.min(480, startWidth + deltaX)));
      props.onWidthChange?.(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      stopResizeListeners();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    stopResizeListeners = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  };

  onCleanup(stopResizeListeners);

  // When to render:
  // In driving mode: ONLY when there is an active severe incident ahead (0m < dist <= 400m).
  // In edit mode: ALWAYS visible to allow positioning and sizing.
  const shouldRender = () => activeData().active || !!props.isEditMode;

  return (
    <Show when={shouldRender()}>
      <div
        class="relative flex flex-col font-sans select-none"
        style={{
          width: `${currentWidth()}px`,
        }}
      >
        {/* Edit Mode Top Control Toolbar */}
        <Show when={props.isEditMode}>
          <div class="flex items-center justify-between px-3 py-1 f1-slab border-b-0 text-white select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTestMode((prev) => ((prev + 1) % 5) as 0 | 1 | 2 | 3 | 4);
              }}
              class="px-2 py-0.5 bg-[#E10600]/20 hover:bg-[#E10600]/35 text-white border border-[#E10600]/70 text-[10px] f1-oblique cursor-pointer transition-all active:scale-95"
              title="사고 테스트 상태 전환 (LIVE / SPIN / CRASH / STOPPED / CLEAR)"
            >
              {t().testHazardBtn}:{" "}
              {testMode() === 0
                ? "LIVE"
                : testMode() === 1
                ? "SPIN"
                : testMode() === 2
                ? "CRASH"
                : testMode() === 3
                ? "STOPPED"
                : "CLEAR"}
            </button>

            <div class="flex items-center gap-1.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onScaleChange?.(Math.max(0.7, (props.scale || 1) - 0.1));
                }}
                class="w-5 h-5 rounded bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer transition-all border border-white/15"
                title="축소"
              >
                -
              </button>
              <span class="text-[11px] font-mono font-bold w-9 text-center text-white/90">
                {Math.round((props.scale || 1) * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onScaleChange?.(Math.min(1.5, (props.scale || 1) + 0.1));
                }}
                class="w-5 h-5 rounded bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer transition-all border border-white/15"
                title="확대"
              >
                +
              </button>
            </div>
          </div>
        </Show>

        {/* Hazard Alert Card */}
        <Show
          when={activeData().active}
          fallback={
            /* Edit Mode Ghost Preview Frame when no active hazard */
            <div class="px-3.5 py-3 border border-dashed border-white/25 bg-[#12141c]/80 backdrop-blur-md flex items-center justify-between text-white/50 text-[11px] font-mono">
              <span class="f1-oblique uppercase tracking-wider">{t().wHazard} • MONITORING</span>
              <span class="text-[10px] text-emerald-400 font-bold uppercase">TRACK CLEAR</span>
            </div>
          }
        >
          <div
            class={`relative flex flex-col f1-slab overflow-hidden shadow-2xl transition-all duration-150 ${
              isCritical()
                ? "border-l-4 border-l-[#E10600] border border-[#E10600]/80 bg-gradient-to-r from-[#24080a]/95 to-[#12141c]/95"
                : "border-l-4 border-l-[#F59E0B] border border-[#F59E0B]/60 bg-gradient-to-r from-[#221808]/95 to-[#12141c]/95"
            }`}
          >
            {/* Top Row: Severity Header + Countdown Distance */}
            <div class="flex items-center justify-between px-3 pt-2 pb-1 border-b border-white/10">
              <div class="flex items-center gap-2">
                <div
                  class={`w-5 h-5 flex items-center justify-center rounded-[2px] ${
                    isCritical()
                      ? "bg-[#E10600] text-white animate-pulse"
                      : "bg-[#F59E0B] text-black"
                  }`}
                >
                  <IconWarning size={14} class="shrink-0" />
                </div>
                <div class="flex flex-col">
                  <span
                    class={`text-[11px] font-black uppercase tracking-wider f1-oblique leading-tight ${
                      isCritical() ? "text-[#FF4D4D]" : "text-[#FCD34D]"
                    }`}
                  >
                    {isCritical() ? t().hazardCriticalDanger : t().hazardCautionAhead}
                  </span>
                  <span class="text-[9px] font-mono text-white/50 uppercase tracking-tight">
                    {t().hazardTrackSector} {activeData().sector}
                  </span>
                </div>
              </div>

              {/* Distance Numerals */}
              <div class="flex items-baseline gap-0.5">
                <span
                  class={`text-2xl font-black font-mono tabular-nums f1-oblique tracking-tight ${
                    isCritical()
                      ? "text-white drop-shadow-[0_0_8px_rgba(225,6,0,0.8)]"
                      : "text-amber-200"
                  }`}
                >
                  {activeData().dist}
                </span>
                <span class="text-[10px] font-mono font-bold text-white/60">m</span>
              </div>
            </div>

            {/* Middle Row: Incident Type Badge + Target Car & Speed Details */}
            <div class="flex items-center justify-between px-3 py-1.5 bg-black/35 gap-2">
              <span
                class={`px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider rounded-[2px] f1-oblique ${
                  isCritical()
                    ? "bg-[#E10600]/30 text-[#FFA8A8] border border-[#E10600]/60"
                    : "bg-[#F59E0B]/25 text-[#FDE68A] border border-[#F59E0B]/50"
                }`}
              >
                {typeLabel(activeData().type)}
              </span>

              <div class="flex items-center gap-2 text-[10px] font-mono font-semibold text-white/80">
                <span class="px-1.5 py-0.2 bg-white/10 rounded-[2px] text-white font-bold">
                  #{activeData().carNum}
                </span>
                <span class="text-white/40">•</span>
                <span class="text-white/90 tabular-nums">
                  {activeData().speedKmh} KM/H
                </span>
              </div>
            </div>

            {/* Bottom Row: Urgent Action Advisory Bar */}
            <div
              class={`flex items-center justify-between px-3 py-1 ${
                isCritical()
                  ? "bg-[#E10600] text-white animate-pulse"
                  : "bg-[#F59E0B]/20 text-amber-200 border-t border-[#F59E0B]/30"
              }`}
            >
              <span class="text-[10px] font-black uppercase tracking-wider f1-oblique">
                {isCritical() ? t().hazardSlowDownNow : t().hazardPrepareSlow}
              </span>
              <span class="text-[9px] font-mono opacity-80 uppercase tracking-widest">
                {isCritical() ? "🚨 URGENT" : "⚠️ CAUTION"}
              </span>
            </div>
          </div>
        </Show>

        {/* Horizontal Resize Drag Handle (Edit Mode only) */}
        <Show when={props.isEditMode}>
          <div
            onMouseDown={handleResizeMouseDown}
            class={`absolute -right-2 top-0 bottom-0 w-3 flex items-center justify-center cursor-ew-resize group z-30 ${
              isResizing() ? "pointer-events-none" : "pointer-events-auto"
            }`}
            title="마우스로 드래그하여 가로 너비 조절"
          >
            <div class="w-1.5 h-7 rounded-full bg-white/30 group-hover:bg-amber-400 group-hover:scale-110 transition-all shadow-sm" />
          </div>
        </Show>
      </div>
    </Show>
  );
};

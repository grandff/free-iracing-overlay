import { Component, Show, createSignal, createMemo, onCleanup } from "solid-js";
import { IconWarning } from "../../assets/icons/Icons.tsx";
import type { HazardTelemetry, HazardType } from "../../services/telemetry/types.ts";
import { t } from "../../i18n/index.ts";

export interface IncidentHazardProps {
  /** Detected in derive.ts from CarIdxTrackSurface / CarIdxLapDistPct / SessionFlags. */
  hazard?: HazardTelemetry;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
}

/** Inside this, slow down now; outside it, prepare to. */
const CRITICAL_M = 200;
/** iRon blinks its incident banner on a 500ms cycle. */
const BLINK_MS = 500;

const TESTS: { label: string; hazard: HazardTelemetry }[] = [
  { label: "OFF TRACK", hazard: { hasIncident: true, distanceMeters: 285, incidentCarNumber: "42", incidentSector: 2, hazardType: "offTrack", speedKmh: 96 } },
  { label: "SPUN", hazard: { hasIncident: true, distanceMeters: 140, incidentCarNumber: "11", incidentSector: 1, hazardType: "stopped", speedKmh: 12 } },
  { label: "YELLOW", hazard: { hasIncident: true, distanceMeters: 400, incidentCarNumber: "", incidentSector: 0, hazardType: "yellowFlag" } },
  { label: "CLEAR", hazard: { hasIncident: false, distanceMeters: 0, incidentCarNumber: "", incidentSector: 0 } },
];

/**
 * Incident ahead — an F1 world-feed alert slab.
 *
 * Ported in spirit from iRon's OverlayIncident: it watches the cars in front and
 * only speaks when one of them is genuinely in trouble. Detection lives in
 * derive.ts; this component renders what it found and is otherwise not on screen
 * at all, so an empty track costs the driver nothing.
 */
export const IncidentHazard: Component<IncidentHazardProps> = (props) => {
  const [testStep, setTestStep] = createSignal(0); // 0 = live
  const [blinkOn, setBlinkOn] = createSignal(true);

  const timer = setInterval(() => setBlinkOn((b) => !b), BLINK_MS);
  onCleanup(() => clearInterval(timer));

  const hazard = createMemo<HazardTelemetry | undefined>(() => {
    if (props.isEditMode && testStep() > 0) return TESTS[testStep() - 1].hazard;
    return props.hazard ?? (props.isEditMode ? TESTS[0].hazard : undefined);
  });

  const active = () => hazard()?.hasIncident === true;
  const distance = () => hazard()?.distanceMeters ?? 0;
  const isCritical = () => distance() <= CRITICAL_M;
  const width = () => Math.max(280, Math.min(480, props.width ?? 340));

  const typeLabel = (type: HazardType | undefined) => {
    switch (type) {
      case "offTrack":
        return t().hazardOffTrack;
      case "collision":
        return t().hazardCollision;
      case "stopped":
        return t().hazardStopped;
      case "yellowFlag":
        return t().hazardYellowFlag;
      default:
        return t().hazardSpin;
    }
  };

  return (
    <Show when={active() || props.isEditMode}>
      <div class="relative flex flex-col font-sans select-none" style={{ width: `${width()}px` }}>
        {/* Edit-mode controls only — no widget title. */}
        <Show when={props.isEditMode}>
          <div
            class="flex items-center justify-between gap-1.5 px-2 py-1 f1-slab border-b-0 text-white"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTestStep((p) => (p + 1) % (TESTS.length + 1));
              }}
              class="px-2 py-0.5 bg-[#E10600]/20 hover:bg-[#E10600]/35 text-white border border-[#E10600]/70 text-[10px] f1-oblique cursor-pointer transition-all active:scale-95"
              title={t().testHazardBtn}
            >
              {testStep() === 0 ? "LIVE" : TESTS[testStep() - 1].label}
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

        <Show
          when={active()}
          fallback={
            <div class="px-3 py-2.5 border border-dashed border-white/25 bg-[#0a0c11]/80 flex items-center justify-between">
              <span class="f1-oblique text-[10px] text-white/45 tracking-wider">MONITORING</span>
              <span class="f1-oblique text-[10px] text-[#00D26A]">TRACK CLEAR</span>
            </div>
          }
        >
          {/* Critical alerts blink; a caution stays solid so it does not nag. */}
          <div
            class="f1-slab flex flex-col overflow-hidden transition-opacity duration-100"
            style={{
              "border-left": `4px solid ${isCritical() ? "#E10600" : "#F59E0B"}`,
              opacity: isCritical() && !blinkOn() && !props.isEditMode ? 0.55 : 1,
            }}
          >
            <div class="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5 border-b border-white/10">
              <div class="flex items-center gap-2 min-w-0">
                <div
                  class="w-5 h-5 shrink-0 flex items-center justify-center"
                  style={{ background: isCritical() ? "#E10600" : "#F59E0B", color: isCritical() ? "#fff" : "#000" }}
                >
                  <IconWarning size={14} />
                </div>
                <div class="flex flex-col min-w-0">
                  <span
                    class="f1-oblique text-[11px] leading-tight tracking-wider"
                    style={{ color: isCritical() ? "#FF4D4D" : "#FCD34D" }}
                  >
                    {isCritical() ? t().hazardCriticalDanger : t().hazardCautionAhead}
                  </span>
                  <span class="f1-label truncate">{typeLabel(hazard()!.hazardType)}</span>
                </div>
              </div>

              <div class="flex items-baseline gap-0.5 shrink-0">
                <span class="f1-value text-[28px] text-white">{distance()}</span>
                <span class="f1-label">M</span>
              </div>
            </div>

            {/* Who and how fast. Blank when race control flagged it without a target. */}
            <Show when={hazard()!.incidentCarNumber}>
              <div class="flex items-center justify-between px-3 py-1 bg-black/40 text-[10px] font-mono">
                <span class="f1-label">
                  {t().hazardTrackSector} {hazard()!.incidentSector}
                </span>
                <div class="flex items-center gap-2 text-white/85">
                  <span class="px-1.5 bg-white/10 font-bold">#{hazard()!.incidentCarNumber}</span>
                  <span class="tabular-nums">{hazard()!.speedKmh ?? 0} KM/H</span>
                </div>
              </div>
            </Show>

            <div
              class="flex items-center justify-between px-3 py-1 f1-oblique text-[10px] tracking-wider"
              style={
                isCritical()
                  ? { background: "#E10600", color: "#fff" }
                  : { background: "rgba(245,158,11,0.18)", color: "#FCD34D" }
              }
            >
              <span>{isCritical() ? t().hazardSlowDownNow : t().hazardPrepareSlow}</span>
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
                props.onWidthChange?.(Math.max(280, Math.min(480, Math.round(startW + (ev.clientX - startX) / scale))));
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
    </Show>
  );
};

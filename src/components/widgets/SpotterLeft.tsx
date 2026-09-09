import { Component, Show, createSignal, createMemo } from "solid-js";
import { SpotterState } from "../../services/telemetry/types.ts";
import { t } from "../../i18n/index.ts";

export interface SpotterProps {
  distance?: number;
  state?: SpotterState;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  height?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
  onHeightChange?: (newHeight: number) => void;
}

export const SpotterLeft: Component<SpotterProps> = (props) => {
  // Test switcher in Edit Mode (0 = live, 1 = warning [1 car], 2 = danger [2 cars])
  // ponytail: intentional simplification — local test state without complex mocks
  const [testStateStep, setTestStateStep] = createSignal<number>(0);

  const cycleTest = (e: MouseEvent) => {
    e.stopPropagation();
    setTestStateStep((prev) => (prev + 1) % 3);
  };

  const current = createMemo(() => {
    const step = testStateStep();
    if (step === 1) {
      return { state: "warning" as SpotterState, distance: 2.4 };
    }
    if (step === 2) {
      return { state: "danger" as SpotterState, distance: 1.1 };
    }
    const dist = props.distance !== undefined ? props.distance : 2.4;
    const rawState = props.state || (props.isEditMode ? "warning" : "clear");
    return { state: rawState, distance: dist };
  });

  const isDanger = createMemo(() => {
    const s = current().state;
    return s === "danger" || (current().distance <= 1.5 && s !== "clear");
  });

  const isWarning = createMemo(() => {
    const s = current().state;
    if (isDanger()) return false;
    return s === "warning" || s === "caution" || (current().distance <= 3.5 && s !== "clear");
  });

  const isClear = createMemo(() => !isDanger() && !isWarning());

  const width = () => props.width ?? 200;
  const height = () => props.height ?? 56;

  return (
    <div
      class="relative flex flex-col font-sans select-none pointer-events-auto group/spotter"
      style={{
        width: `${width()}px`,
      }}
    >
      {/* Edit Mode Top Toolbar */}
      <Show when={props.isEditMode}>
        <div
          class="flex items-center justify-between px-2 py-1 mb-1 rounded hud-surface-deep backdrop-blur-md border border-white/20 text-[10px] text-white/80 shadow-lg"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-amber-400">◀ {t().wSpotterL}</span>
            <span class="text-white/40">|</span>
            <span class="font-mono text-[9px] text-white/60">
              {width()}x{height()}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            {/* Test State Switcher */}
            <button
              onClick={cycleTest}
              class={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                testStateStep() === 2
                  ? "bg-red-500/40 text-red-200 border border-red-400/50"
                  : testStateStep() === 1
                  ? "bg-amber-500/40 text-amber-200 border border-amber-400/50"
                  : "bg-white/10 hover:bg-white/20 text-white/70"
              }`}
              title={t().spotterTestBtn}
            >
              {testStateStep() === 2
                ? t().spotterDanger
                : testStateStep() === 1
                ? t().spotterWarn
                : "LIVE"}
            </button>

            {/* Scale +/- */}
            <div class="flex items-center gap-0.5 ml-1">
              <button
                onClick={() => props.onScaleChange?.(Math.max(0.6, (props.scale ?? 1.0) - 0.05))}
                class="w-4 h-4 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 font-mono text-[9px]"
              >
                -
              </button>
              <span class="font-mono text-[9px] w-7 text-center">
                {Math.round((props.scale ?? 1.0) * 100)}%
              </span>
              <button
                onClick={() => props.onScaleChange?.(Math.min(2.0, (props.scale ?? 1.0) + 0.05))}
                class="w-4 h-4 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 font-mono text-[9px]"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Main Spotter Body */}
      <div
        style={{
          height: `${height()}px`,
        }}
        class={`relative flex items-center justify-between px-3 rounded-r-2xl border-y border-r transition-all duration-150 backdrop-blur-md ${
          isDanger()
            ? "bg-gradient-to-r from-red-950/90 via-red-900/80 to-red-950/90 border-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse"
            : isWarning()
            ? "bg-gradient-to-r from-amber-950/90 via-[#261e05]/85 to-amber-950/90 border-amber-500/70 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.35)]"
            : props.isEditMode
            ? "bg-black/60 border-white/20 text-white/40 border-dashed"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Left Side Accent Bar */}
        <div
          class={`absolute left-0 top-0 bottom-0 w-2 transition-colors ${
            isDanger()
              ? "bg-red-500 shadow-[0_0_12px_#ef4444]"
              : isWarning()
              ? "bg-amber-400 shadow-[0_0_10px_#f59e0b]"
              : "bg-white/20"
          }`}
        />

        {/* Arrow & Stage Indicator */}
        <div class="flex items-center gap-2 pl-2">
          <div class="flex items-center font-black tracking-tighter">
            <Show
              when={isDanger()}
              fallback={
                <span
                  class={`text-2xl transition-transform ${
                    isWarning() ? "text-amber-400 scale-110" : "text-white/40"
                  }`}
                >
                  ◀
                </span>
              }
            >
              <span class="text-2xl text-red-400 font-black animate-ping inline-block">◀</span>
              <span class="text-2xl text-red-400 font-black -ml-2.5">◀</span>
            </Show>
          </div>

          {/* 2-Stage Authentic Proximity Segments */}
          <div class="flex flex-col gap-1 justify-center">
            {/* Stage 1: Warning bar */}
            <div
              class={`w-2.5 h-2 rounded-sm transition-all ${
                isDanger()
                  ? "bg-red-400 shadow-[0_0_8px_#ef4444]"
                  : isWarning()
                  ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                  : "bg-white/10"
              }`}
            />
            {/* Stage 2: Danger bar */}
            <div
              class={`w-2.5 h-3 rounded-sm transition-all ${
                isDanger() ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-white/10"
              }`}
            />
          </div>
        </div>

        {/* Text & Distance */}
        <div class="flex flex-col items-end pr-1">
          <span
            class={`font-mono font-black text-[10px] tracking-wider uppercase ${
              isDanger() ? "text-red-300" : isWarning() ? "text-amber-300" : "text-white/40"
            }`}
          >
            {isDanger() ? "DANGER • 2 CARS" : isWarning() ? "CAR LEFT" : "CLEAR"}
          </span>
          <div class="flex items-baseline gap-1">
            <span
              class={`font-mono text-xl font-black tabular-nums tracking-tight ${
                isDanger() ? "text-white drop-shadow" : isWarning() ? "text-white" : "text-white/40"
              }`}
            >
              {isClear() && !props.isEditMode ? "--" : `${current().distance.toFixed(1)}m`}
            </span>
          </div>
        </div>

        {/* Bottom-Right 2D Corner Resize Handle (Edit Mode) */}
        <Show when={props.isEditMode}>
          <div
            class="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-amber-400/80 hover:bg-amber-300 rounded-br cursor-nwse-resize z-50 flex items-end justify-end p-0.5 border border-black shadow pointer-events-auto"
            title="Drag to resize width & height"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startW = width();
              const startH = height();

              const handleMouseMove = (moveEvt: MouseEvent) => {
                const deltaX = moveEvt.clientX - startX;
                const deltaY = moveEvt.clientY - startY;
                const newW = Math.max(140, Math.min(380, Math.round(startW + deltaX)));
                const newH = Math.max(44, Math.min(160, Math.round(startH + deltaY)));
                props.onWidthChange?.(newW);
                props.onHeightChange?.(newH);
              };

              const handleMouseUp = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
              };

              window.addEventListener("mousemove", handleMouseMove);
              window.addEventListener("mouseup", handleMouseUp);
            }}
          >
            <div class="w-1.5 h-1.5 border-r-2 border-b-2 border-black" />
          </div>
        </Show>
      </div>
    </div>
  );
};

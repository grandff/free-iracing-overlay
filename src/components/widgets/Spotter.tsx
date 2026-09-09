import { Component, Show, createSignal, createMemo, For } from "solid-js";
import { SpotterState } from "../../services/telemetry/types.ts";
import { t } from "../../i18n/index.ts";

export interface SpotterProps {
  side: "left" | "right";
  state?: SpotterState;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  height?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
  onHeightChange?: (newHeight: number) => void;
}

export const SPOTTER_DEFAULT_WIDTH = 26;
export const SPOTTER_DEFAULT_HEIGHT = 280;
const MIN_W = 14;
const MAX_W = 64;
const MIN_H = 120;
const MAX_H = 520;

/** Share of the rail a single car alongside lights. Red alert lights all of it. */
const WARNING_FILL = 0.55;

/**
 * Bezel proximity spotter — a broadcast LED rail down the screen edge.
 *
 * Amber, centre of the rail: a car is alongside (CarLeftRight names the side).
 * Red, full rail, flashing: two cars on that side, or one door-to-door.
 * Nothing at all when the side is clear — it only works as a warning if it is
 * never on the screen otherwise.
 */
export const Spotter: Component<SpotterProps> = (props) => {
  // 0 = live telemetry, 1 = car alongside, 2 = red alert.
  const [testStep, setTestStep] = createSignal(0);

  const state = createMemo<SpotterState>(() => {
    if (props.isEditMode && testStep() === 1) return "warning";
    if (props.isEditMode && testStep() === 2) return "danger";
    // Edit mode with no live frame still needs something to position against.
    return props.state ?? (props.isEditMode ? "warning" : "clear");
  });

  const isDanger = () => state() === "danger";
  const isLit = () => state() !== "clear";

  const width = () => Math.max(MIN_W, Math.min(MAX_W, props.width ?? SPOTTER_DEFAULT_WIDTH));
  const height = () => Math.max(MIN_H, Math.min(MAX_H, props.height ?? SPOTTER_DEFAULT_HEIGHT));

  // ~18px per LED, so a longer rail gets more segments rather than taller ones.
  const segments = createMemo(() => Math.max(5, Math.round(height() / 18)));

  /** Amber lights the middle of the rail; red takes the whole thing. */
  const isSegmentLit = (i: number) => {
    if (!isLit()) return false;
    if (isDanger()) return true;
    const lit = Math.max(1, Math.round(segments() * WARNING_FILL));
    const start = Math.floor((segments() - lit) / 2);
    return i >= start && i < start + lit;
  };

  return (
    <div
      class={`relative flex flex-col font-sans select-none pointer-events-auto ${
        props.side === "right" ? "items-end" : "items-start"
      }`}
    >
      {/* Edit-mode controls. No widget title: the rail is named by where it sits. */}
      <Show when={props.isEditMode}>
        <div
          class={`flex items-center gap-1.5 px-1.5 py-1 mb-1 f1-slab text-white ${
            props.side === "right" ? "justify-end flex-row-reverse" : "justify-start flex-row"
          }`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTestStep((p) => (p + 1) % 3);
            }}
            class={`px-1.5 py-0.5 text-[9px] f1-oblique cursor-pointer transition-all active:scale-95 border font-black ${
              testStep() === 2
                ? "bg-[#E10600] text-white border-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.8)]"
                : testStep() === 1
                ? "bg-[#FFD100] text-black border-[#FFD100] shadow-[0_0_8px_rgba(255,209,0,0.8)]"
                : "bg-white/10 hover:bg-white/20 text-white/80 border-white/15"
            }`}
            title={t().spotterTestBtn}
          >
            {testStep() === 2 ? "ALERT" : testStep() === 1 ? "CAR" : "LIVE"}
          </button>

          <div class="flex items-center gap-1">
            <button
              onClick={() => props.onScaleChange?.(Math.max(0.6, (props.scale ?? 1) - 0.05))}
              class="w-4 h-4 flex items-center justify-center bg-white/10 hover:bg-white/25 border border-white/15 font-mono text-[9px] cursor-pointer"
            >
              -
            </button>
            <span class="font-mono text-[9px] tabular-nums w-8 text-center text-white/90">
              {Math.round((props.scale ?? 1) * 100)}%
            </span>
            <button
              onClick={() => props.onScaleChange?.(Math.min(2.0, (props.scale ?? 1) + 0.05))}
              class="w-4 h-4 flex items-center justify-center bg-white/10 hover:bg-white/25 border border-white/15 font-mono text-[9px] cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </Show>

      {/* LED rail */}
      <div
        style={{ width: `${width()}px`, height: `${height()}px` }}
        class={`relative flex ${props.side === "left" ? "flex-row" : "flex-row-reverse"} transition-opacity duration-100 ${
          isLit() || props.isEditMode ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Accent rail: a solid colour bar hard against the bezel */}
        <div
          class={`w-[3px] shrink-0 transition-colors ${
            isDanger()
              ? "bg-[#E10600] shadow-[0_0_14px_#E10600]"
              : isLit()
              ? "bg-[#FFD100] shadow-[0_0_12px_#FFD100]"
              : "bg-white/15"
          }`}
        />

        {/* Segment stack */}
        <div
          class={`flex-1 flex flex-col gap-[2px] p-[2px] border border-white/10 bg-[rgb(10_12_17_/_var(--hud-bg-alpha,0.9))] ${
            isDanger() ? "animate-pulse" : ""
          }`}
        >
          <For each={Array.from({ length: segments() })}>
            {(_, i) => (
              <div
                class={`flex-1 min-h-[3px] transition-colors duration-100 ${
                  !isSegmentLit(i())
                    ? "bg-white/[0.07]"
                    : isDanger()
                    ? "bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.9)]"
                    : "bg-[#FFD100] shadow-[0_0_6px_rgba(255,209,0,0.85)]"
                }`}
              />
            )}
          </For>
        </div>

        {/* Broadcast tag, set vertically along the rail. Dropped on a thin rail. */}
        <Show when={isLit() && width() >= 22}>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              class={`f1-oblique f1-floating text-[9px] font-black tracking-[0.22em] whitespace-nowrap ${
                isDanger()
                  ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                  : "text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
              }`}
              style={{ "writing-mode": "vertical-rl", "text-orientation": "mixed" }}
            >
              {isDanger() ? "ALERT" : "CAR"} {props.side === "left" ? "L" : "R"}
            </span>
          </div>
        </Show>

        {/* Corner handle: drag for rail thickness and length */}
        <Show when={props.isEditMode}>
          <div
            class={`absolute -bottom-1.5 ${
              props.side === "right" ? "-left-1.5 cursor-nesw-resize" : "-right-1.5 cursor-nwse-resize"
            } w-4 h-4 bg-[#FFD100] hover:bg-yellow-300 z-50 border border-black shadow pointer-events-auto`}
            title="Drag to resize the rail"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startW = width();
              const startH = height();
              const scale = props.scale || 1;

              const onMove = (ev: MouseEvent) => {
                const dx = (ev.clientX - startX) / scale;
                const dy = (ev.clientY - startY) / scale;
                // The right-hand rail grows leftwards, so its drag axis is mirrored.
                const signedDx = props.side === "left" ? dx : -dx;
                props.onWidthChange?.(Math.max(MIN_W, Math.min(MAX_W, Math.round(startW + signedDx))));
                props.onHeightChange?.(Math.max(MIN_H, Math.min(MAX_H, Math.round(startH + dy))));
              };
              const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          />
        </Show>
      </div>
    </div>
  );
};

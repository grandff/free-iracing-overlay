import { Component, Show } from "solid-js";
import { IconArrow } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";

interface Props {
  leftDistance?: number;
  rightDistance?: number;
  leftState?: "clear" | "caution" | "danger";
  rightState?: "clear" | "caution" | "danger";
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const F1ProximitySpotter: Component<Props> = (props) => {
  const leftDist = () => props.leftDistance !== undefined ? props.leftDistance : 1.8;
  const rightDist = () => props.rightDistance !== undefined ? props.rightDistance : 6.0;
  const leftState = () => props.leftState || "caution";
  const rightState = () => props.rightState || "clear";
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  const stateColor = (st: "clear" | "caution" | "danger") => {
    switch (st) {
      case "danger": return "bg-red-600/90 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse";
      case "caution": return "bg-amber-500/80 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]";
      default: return "bg-white/10 text-white/40 border-white/10";
    }
  };

  return (
    <div class="relative flex items-center justify-between w-[320px] font-f1 select-none">
      {/* Floating Scale Pill */}
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${ editPresence.visible() ? "is-visible" : "is-hidden" }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">스포터 크기</span>
          <div class="flex items-center gap-1.5">
            <button
              onClick={() => props.onScaleChange && props.onScaleChange(Math.max(0.7, (props.scale || 1) - 0.1))}
              class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              -
            </button>
            <span class="text-[10px] font-mono font-semibold w-8 text-center">{Math.round((props.scale || 1) * 100)}%</span>
            <button
              onClick={() => props.onScaleChange && props.onScaleChange(Math.min(1.5, (props.scale || 1) + 0.1))}
              class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </Show>

      {/* Left Wing Radar */}
      <div class={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150 ${stateColor(leftState())}`}>
        <div class="rotate-[-90deg]">
          <IconArrow size={14} />
        </div>
        <div class="flex flex-col">
          <span class="text-[9px] font-f1-wide font-black tracking-wider">LEFT</span>
          <span class="text-xs font-mono font-bold tnum">{leftState() === "clear" ? "CLEAR" : `${leftDist().toFixed(1)}m`}</span>
        </div>
      </div>

      {/* Center Cockpit Icon Indicator */}
      <div class="px-2 py-1 bg-black/60 rounded border border-white/15 text-[10px] font-f1-wide text-white/50">
        SPOTTER
      </div>

      {/* Right Wing Radar */}
      <div class={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150 ${stateColor(rightState())}`}>
        <div class="flex flex-col items-end">
          <span class="text-[9px] font-f1-wide font-black tracking-wider">RIGHT</span>
          <span class="text-xs font-mono font-bold tnum">{rightState() === "clear" ? "CLEAR" : `${rightDist().toFixed(1)}m`}</span>
        </div>
        <div class="rotate-90">
          <IconArrow size={14} />
        </div>
      </div>
    </div>
  );
};
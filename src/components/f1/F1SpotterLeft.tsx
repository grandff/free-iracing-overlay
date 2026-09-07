import { Component, Show } from "solid-js";
import { createPresence } from "../../utils/presence.ts";

interface Props {
  distance?: number;
  state?: "clear" | "caution" | "danger";
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const F1SpotterLeft: Component<Props> = (props) => {
  const dist = () => (props.distance !== undefined ? props.distance : 1.8);
  const state = () => props.state || (props.isEditMode ? "caution" : "clear");
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  const isDanger = () => state() === "danger" || (dist() <= 1.5 && state() !== "clear");
  const isCaution = () => state() === "caution" || (dist() > 1.5 && dist() <= 4.0 && state() !== "clear");
  const isClear = () => state() === "clear";

  return (
    <div class="relative flex items-center font-f1 select-none pointer-events-auto">
      {/* Floating Apple Scale Capsule (Only in Edit Mode) */}
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-10 left-0 z-50 flex items-center gap-2 px-2.5 py-1 bg-[#1c1c24]/95 border border-white/15 rounded-full shadow-lg text-white pointer-events-auto whitespace-nowrap apple-pill-enter ${ editPresence.visible() ? "is-visible" : "is-hidden" }`}
        >
          <span class="text-[10px] font-medium text-white/70">좌측 스포터 크기</span>
          <div class="flex items-center gap-1">
            <button
              onClick={() => props.onScaleChange && props.onScaleChange(Math.max(0.7, (props.scale || 1) - 0.1))}
              class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              -
            </button>
            <span class="text-[10px] font-mono font-semibold w-8 text-center">
              {Math.round((props.scale || 1) * 100)}%
            </span>
            <button
              onClick={() => props.onScaleChange && props.onScaleChange(Math.min(1.5, (props.scale || 1) + 0.1))}
              class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </Show>

      {/* Spotter Radar Wing (Left Screen Edge) */}
      <div
        class={`flex items-center gap-2.5 px-3 py-2.5 rounded-r-xl border-y border-r transition-all duration-150 ${ isDanger() ? "bg-[#ff3b30] text-white border-[#ff453a] animate-pulse shadow-md" : isCaution() ? "bg-[#ff9f0a] text-black border-[#ff9f0a] shadow-sm" : props.isEditMode ? "bg-[#1c1c1e]/90 text-white/60 border-white/15 shadow-sm" : "opacity-0 pointer-events-none" }`}
      >
        <div class="flex flex-col items-center justify-center w-5">
          <span class="text-base font-black leading-none">◀</span>
          <span class="text-[8px] font-f1-wide font-black uppercase mt-0.5 tracking-wider">LEFT</span>
        </div>

        {/* 3-Bar Proximity Density Meter */}
        <div class="flex items-center gap-1 h-7">
          <div
            class={`w-1.5 h-full rounded-full ${ isDanger() || isCaution() ? (isDanger() ? "bg-white" : "bg-black") : "bg-white/20" }`}
          />
          <div
            class={`w-1.5 h-5 rounded-full ${ isDanger() ? "bg-white" : isCaution() ? "bg-black/60" : "bg-white/10" }`}
          />
          <div class={`w-1.5 h-3 rounded-full ${isDanger() ? "bg-white" : "bg-white/10"}`} />
        </div>

        {/* Distance Text */}
        <div class="flex flex-col items-start pr-1">
          <span class="text-[9px] font-f1-wide font-extrabold uppercase opacity-80">
            {isDanger() ? "CAR LEFT" : isCaution() ? "HOLD" : "CLEAR"}
          </span>
          <span class="text-sm font-f1-num font-black tabular-nums tracking-tight">
            {isClear() && !props.isEditMode ? "--" : `${dist().toFixed(1)}m`}
          </span>
        </div>
      </div>
    </div>
  );
};

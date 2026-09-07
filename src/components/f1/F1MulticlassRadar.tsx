import { Component, Show } from "solid-js";
import { IconRadar } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";

interface Props {
  carClass?: string;
  carNumber?: string;
  gapSeconds?: number;
  closingSpeedKmh?: number;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const F1MulticlassRadar: Component<Props> = (props) => {
  const cls = () => props.carClass || "HYPERCAR";
  const num = () => props.carNumber || "7";
  const gap = () => props.gapSeconds !== undefined ? props.gapSeconds : 1.8;
  const spd = () => props.closingSpeedKmh !== undefined ? props.closingSpeedKmh : 42;
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  return (
    <div class="relative flex flex-col w-[290px] font-f1 select-none drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)]">
      {/* Floating Scale Pill */}
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 backdrop-blur-xl border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">멀티클래스 크기</span>
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

      {/* Main Multiclass Alert Card */}
      <div class="flex items-center justify-between px-3 py-2 bg-[#12131a]/95 border border-cyan-500/30 rounded-lg shadow-xl backdrop-blur-xl text-white">
        <div class="flex items-center gap-2">
          <IconRadar size={18} class="text-cyan-400 animate-pulse" />
          <div class="flex flex-col">
            <span class="text-[9px] font-f1-wide font-extrabold text-cyan-300 tracking-wider">
              FAST CLASS APPROACHING
            </span>
            <span class="text-xs font-bold">
              #{num()} {cls()} <span class="text-cyan-400 text-[10px] font-mono">(+{spd()}km/h)</span>
            </span>
          </div>
        </div>

        <div class="flex flex-col items-end">
          <span class="text-[9px] text-white/50 font-mono">GAP</span>
          <span class="text-sm font-f1-num font-bold text-cyan-400 tnum">{gap().toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
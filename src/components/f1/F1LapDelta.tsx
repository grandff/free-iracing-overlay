import { Component, Show } from "solid-js";
import { IconStopwatch, IconChevronDown, IconChevronUp } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";

interface Props {
  delta?: number; // e.g. -0.245 (faster) or +0.412 (slower)
  targetName?: string;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const F1LapDelta: Component<Props> = (props) => {
  const delta = () => props.delta !== undefined ? props.delta : -0.234;
  const isFaster = () => delta() <= 0;
  const isPurple = () => delta() <= -0.5; // Overall best
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  const deltaText = () => {
    const val = delta();
    const sign = val > 0 ? "+" : "";
    return `${sign}${val.toFixed(3)}`;
  };

  return (
    <div class="relative flex flex-col font-f1 select-none drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)]">
      {/* Floating Scale Pill */}
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 backdrop-blur-xl border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">랩 델타 크기</span>
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

      {/* Delta Display Pill */}
      <div class="flex items-center h-9 bg-[#12131a]/95 border border-white/15 rounded-lg overflow-hidden shadow-2xl backdrop-blur-xl">
        <div class="flex items-center gap-1.5 px-3 bg-[#1c1c26] h-full border-r border-white/10 text-white/70">
          <IconStopwatch size={14} class="text-[#E10600]" />
          <span class="text-[10px] font-f1-wide font-extrabold tracking-wider">DELTA</span>
        </div>

        <div
          class={`flex items-center gap-2 px-3.5 h-full transition-colors duration-150 ${
            isPurple()
              ? "bg-[#b055f5]/20 text-[#d08bff]"
              : isFaster()
              ? "bg-[#00d26a]/20 text-[#00ff84]"
              : "bg-[#e10600]/20 text-[#ff4d4d]"
          }`}
        >
          <Show when={isFaster()} fallback={<IconChevronUp class="w-3.5 h-3.5 text-[#ff4d4d]" />}>
            <IconChevronDown class={`w-3.5 h-3.5 ${isPurple() ? "text-[#d08bff]" : "text-[#00ff84]"}`} />
          </Show>
          <span class="font-f1-num font-bold text-sm tracking-wider tnum">
            {deltaText()}s
          </span>
        </div>

        <div class="px-2.5 text-[9px] font-f1-wide text-white/50 tracking-wider">
          {props.targetName || "VS BEST"}
        </div>
      </div>
    </div>
  );
};
import { Component, Show } from "solid-js";
import { IconCrosshair } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";
import { t } from "../../i18n/index.ts";

interface Props {
  targetDriver?: string;
  targetDriverName?: string;
  carNumber?: string;
  targetCarNumber?: string;
  gapSeconds?: number;
  incidents?: number;
  hasTarget?: boolean;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const RevengeTracker: Component<Props> = (props) => {
  const driver = () => props.targetDriverName || props.targetDriver || "M. Verstappen";
  const carNum = () => props.targetCarNumber || props.carNumber || "1";
  const gap = () => (props.gapSeconds !== undefined ? props.gapSeconds : 1.42);
  const inc = () => (props.incidents !== undefined ? props.incidents : 4);
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  return (
    <div class="relative flex flex-col font-sans select-none w-[260px] shadow-2xl">
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">{t().wRevenge}</span>
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

      <div class="bg-[#12131a]/95 border border-red-500/30 rounded-lg overflow-hidden shadow-2xl">
        <div class="flex items-center justify-between bg-red-950/60 border-b border-red-500/30 px-3 py-1.5 text-red-200">
          <div class="flex items-center gap-1.5">
            <IconCrosshair size={14} class="text-red-400" />
            <span class="text-[10px] font-mono font-extrabold tracking-wider text-white">REVENGE TARGET</span>
          </div>
          <span class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/30 text-red-300 font-mono font-bold">
            +{inc()}x CONTACT
          </span>
        </div>

        <div class="flex items-center justify-between px-3 py-2 text-white">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-bold text-white/60">#{carNum()}</span>
            <span class="text-xs font-bold tracking-tight">{driver()}</span>
          </div>
          <div class="flex items-center gap-1 text-red-400 font-mono font-bold text-xs tabular-nums">
            <span>GAP</span>
            <span class="text-white">{gap().toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

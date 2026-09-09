import { Component, Show } from "solid-js";
import { IconRadar } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";
import { t } from "../../i18n/index.ts";

interface Props {
  approachingCarClass?: string;
  carNumber?: string;
  gapSeconds?: number;
  closingSpeedKmh?: number;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const MulticlassRadar: Component<Props> = (props) => {
  const cls = () => props.approachingCarClass || "Hypercar";
  const carNum = () => props.carNumber || "8";
  const gap = () => (props.gapSeconds !== undefined ? props.gapSeconds : 2.4);
  const closingSpeed = () => (props.closingSpeedKmh !== undefined ? props.closingSpeedKmh : 45);
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  return (
    <div class="relative flex flex-col font-sans select-none w-[280px] shadow-2xl">
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 hud-surface-raised border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">{t().wMulticlass}</span>
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

      <div class="flex items-center gap-3 px-3.5 py-2 bg-blue-950/90 border-2 border-cyan-400 rounded-lg shadow-xl animate-pulse">
        <IconRadar size={20} class="text-cyan-400 shrink-0" />
        <div class="flex flex-col flex-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-extrabold uppercase text-cyan-300 tracking-wider">
              FASTER CLASS APPROACHING
            </span>
            <span class="text-[11px] font-mono font-black text-white tabular-nums">+{gap().toFixed(1)}s</span>
          </div>
          <div class="flex items-center justify-between text-[9px] font-mono text-cyan-100">
            <span>{cls()} #{carNum()}</span>
            <span class="text-cyan-400 font-bold">+{closingSpeed()} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

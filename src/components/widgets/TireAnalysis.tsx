import { Component, Show } from "solid-js";
import { IconTirePSI } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";
import { t } from "../../i18n/index.ts";

interface Props {
  pressures?: [number, number, number, number];
  wears?: [number, number, number, number];
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const TireAnalysis: Component<Props> = (props) => {
  const psi = () => props.pressures || [21.8, 22.1, 20.9, 21.2];
  const wear = () => props.wears || [94, 91, 88, 89];
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  const TireBlock = (p: { pos: string; psiVal: number; wearVal: number }) => (
    <div class="flex flex-col items-center bg-white/[0.05] border border-white/10 rounded p-1.5 text-center min-w-[54px]">
      <span class="text-[8px] font-mono font-black text-white/50">{p.pos}</span>
      <span class="text-[11px] font-mono font-bold text-emerald-400 tabular-nums">{p.wearVal}%</span>
      <span class="text-[9px] font-mono text-white/70 tabular-nums">{p.psiVal.toFixed(1)}</span>
    </div>
  );

  return (
    <div class="relative flex flex-col w-[230px] font-sans select-none shadow-2xl">
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">{t().wTire}</span>
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

      <div class="bg-[#12131a]/95 border border-white/15 rounded-lg overflow-hidden shadow-2xl">
        <div class="flex items-center justify-between bg-[#1a1b24] border-b border-white/10 px-3 py-1.5">
          <div class="flex items-center gap-1.5 text-white">
            <IconTirePSI size={13} class="text-[#ffd100]" />
            <span class="text-[10px] font-mono font-extrabold tracking-wider">TIRE ANALYSIS</span>
          </div>
          <span class="w-4 h-4 rounded-full border border-[#ffd100] text-[#ffd100] flex items-center justify-center text-[9px] font-black">M</span>
        </div>

        <div class="p-2 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <TireBlock pos="FL" psiVal={psi()[0]} wearVal={wear()[0]} />
            <div class="h-0.5 flex-1 bg-white/10 mx-2" />
            <TireBlock pos="FR" psiVal={psi()[1]} wearVal={wear()[1]} />
          </div>

          <div class="flex items-center justify-between">
            <TireBlock pos="RL" psiVal={psi()[2]} wearVal={wear()[2]} />
            <div class="h-0.5 flex-1 bg-white/10 mx-2" />
            <TireBlock pos="RR" psiVal={psi()[3]} wearVal={wear()[3]} />
          </div>
        </div>
      </div>
    </div>
  );
};

import { Component, Show } from "solid-js";
import { IconFuel } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";
import { t } from "../../i18n/index.ts";

interface Props {
  fuelLiters?: number;
  fuelLevelLiters?: number;
  fuelMaxLiters?: number;
  fuelPerLap?: number;
  fuelLapsRemaining?: number;
  lapsRemaining?: number;
  neededToFinish?: number;
  estPitLaps?: number;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const FuelSimulator: Component<Props> = (props) => {
  const current = () => (props.fuelLevelLiters !== undefined ? props.fuelLevelLiters : props.fuelLiters !== undefined ? props.fuelLiters : 42.5);
  const maxFuel = () => props.fuelMaxLiters || 110;
  const perLap = () => (props.fuelPerLap !== undefined ? props.fuelPerLap : 2.35);
  const laps = () => (props.fuelLapsRemaining !== undefined ? props.fuelLapsRemaining : props.lapsRemaining !== undefined ? props.lapsRemaining : 18.2);
  const needed = () => (props.estPitLaps !== undefined ? props.estPitLaps : props.neededToFinish !== undefined ? props.neededToFinish : 28.5);
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  const pct = () => Math.min(100, Math.max(0, (current() / maxFuel()) * 100));

  return (
    <div class="relative flex flex-col w-[260px] font-sans select-none shadow-2xl">
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">{t().wFuel}</span>
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
          <div class="flex items-center gap-2 text-white">
            <IconFuel size={14} class="text-[#00d26a]" />
            <span class="text-[10px] font-mono font-extrabold tracking-wider">FUEL CALCULATOR</span>
          </div>
          <span class="text-[9px] font-mono font-bold text-[#00d26a]">
            {pct().toFixed(0)}%
          </span>
        </div>

        <div class="w-full h-1 bg-black/60">
          <div
            class="h-full bg-gradient-to-r from-[#e10600] via-[#ffd100] to-[#00d26a] transition-all duration-200"
            style={{ width: `${pct()}%` }}
          />
        </div>

        <div class="grid grid-cols-2 gap-2 p-2.5 text-white">
          <div class="flex flex-col bg-white/[0.04] p-2 rounded border border-white/[0.06]">
            <span class="text-[9px] font-mono text-white/50">REMAINING</span>
            <span class="text-sm font-mono font-bold text-white tabular-nums">{current().toFixed(1)} L</span>
            <span class="text-[9px] text-[#00d26a] font-mono font-semibold">{laps().toFixed(1)} LAPS</span>
          </div>

          <div class="flex flex-col bg-white/[0.04] p-2 rounded border border-white/[0.06]">
            <span class="text-[9px] font-mono text-white/50">PER LAP / PIT REQ</span>
            <span class="text-sm font-mono font-bold text-amber-300 tabular-nums">{perLap().toFixed(2)} L/L</span>
            <span class="text-[9px] text-white/60 font-mono">PIT: +{needed().toFixed(1)}L</span>
          </div>
        </div>
      </div>
    </div>
  );
};

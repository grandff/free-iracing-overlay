import { Component, Show } from "solid-js";
import { IconWarning } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";
import { t } from "../../i18n/index.ts";

interface Props {
  sector?: number;
  incidentSector?: number;
  carNumber?: string;
  hazardCarNumber?: string;
  distanceMeters?: number;
  aheadHazardMeters?: number;
  hasIncident?: boolean;
  yellowFlagActive?: boolean;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const IncidentHazard: Component<Props> = (props) => {
  const sector = () => (props.incidentSector !== undefined ? props.incidentSector : props.sector !== undefined ? props.sector : 2);
  const carNum = () => props.hazardCarNumber || props.carNumber || "81";
  const dist = () => (props.aheadHazardMeters !== undefined ? props.aheadHazardMeters : props.distanceMeters !== undefined ? props.distanceMeters : 180);
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  return (
    <div class="relative flex flex-col w-[320px] font-sans select-none shadow-2xl">
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">{t().wHazard}</span>
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

      <div class="flex items-center gap-3 px-4 py-2 bg-red-950/90 border-2 border-red-500 rounded-lg shadow-xl animate-pulse">
        <IconWarning size={22} class="text-red-400 shrink-0" />
        <div class="flex flex-col flex-1">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono font-black uppercase text-white tracking-wider">
              HAZARD • SECTOR {sector()}
            </span>
            <span class="text-[11px] font-mono font-black text-red-300 tabular-nums">{dist()}m</span>
          </div>
          <span class="text-[9px] font-mono text-red-200">
            Car #{carNum()} off-track / stopped
          </span>
        </div>
      </div>
    </div>
  );
};

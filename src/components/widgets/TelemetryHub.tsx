import { Component, Show } from "solid-js";
import { createPresence } from "../../utils/presence.ts";
import { t } from "../../i18n/index.ts";

interface Props {
  speed?: number;
  speedKmh?: number;
  gear?: number | string;
  rpm?: number;
  maxRpm?: number;
  throttlePct?: number;
  brakePct?: number;
  lapDelta?: number;
  fuelLiters?: number;
  fuelLaps?: number;
  drsAvailable?: boolean;
  drsActive?: boolean;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const TelemetryHub: Component<Props> = (props) => {
  const speed = () => (props.speedKmh !== undefined ? props.speedKmh : props.speed !== undefined ? props.speed : 284);
  const gear = () => {
    if (props.gear !== undefined) {
      if (props.gear === 0 || props.gear === "0") return "N";
      if (props.gear === -1 || props.gear === "-1") return "R";
      return props.gear;
    }
    return 7;
  };
  const rpm = () => (props.rpm !== undefined ? props.rpm : 11850);
  const maxRpm = () => props.maxRpm || 13500;
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  const rpmPct = () => Math.min(100, Math.max(0, (rpm() / maxRpm()) * 100));

  return (
    <div class="relative flex flex-col font-sans select-none w-[310px] shadow-2xl">
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 hud-surface-raised border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">{t().wTelemetryHub}</span>
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

      <div class="hud-surface border border-white/15 rounded-lg overflow-hidden shadow-2xl p-2.5">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-mono font-black text-white tabular-nums tracking-tighter">{speed()}</span>
            <span class="text-[10px] font-mono font-bold text-white/40">KM/H</span>
          </div>

          <div class="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg border border-white/15">
            <span class="text-3xl font-mono font-black text-amber-400">{gear()}</span>
          </div>

          <div class="flex flex-col items-end">
            <span class="text-xs font-mono font-bold text-white/80 tabular-nums">{rpm()}</span>
            <span class="text-[9px] font-mono text-white/40">RPM</span>
          </div>
        </div>

        <div class="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
          <div
            class="h-full bg-gradient-to-r from-[#00d26a] via-[#ffd100] to-[#e10600] transition-all duration-75"
            style={{ width: `${rpmPct()}%` }}
          />
        </div>
      </div>
    </div>
  );
};

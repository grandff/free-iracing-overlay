import { Component, Show } from "solid-js";
import { IconCompass } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";
import { t } from "../../i18n/index.ts";

interface Props {
  airTemp?: number;
  trackTemp?: number;
  windSpeed?: number;
  windDir?: number;
  rainProb?: number;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const WeatherWidget: Component<Props> = (props) => {
  const air = () => (props.airTemp !== undefined ? props.airTemp : 24.2);
  const track = () => (props.trackTemp !== undefined ? props.trackTemp : 38.6);
  const wind = () => (props.windSpeed !== undefined ? props.windSpeed : 12);
  const rain = () => (props.rainProb !== undefined ? props.rainProb : 0);
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  return (
    <div class="relative flex flex-col font-sans select-none shadow-2xl">
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">{t().wWeather}</span>
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

      <div class="flex items-center h-9 bg-[#12131a]/95 border border-white/15 rounded-lg overflow-hidden shadow-2xl px-3 gap-3 text-white text-xs">
        <div class="flex items-center gap-1.5 text-white/80">
          <IconCompass size={14} class="text-cyan-400" />
          <span class="font-mono text-[11px] tabular-nums">{wind()} km/h</span>
        </div>

        <div class="h-3 w-px bg-white/15" />

        <div class="flex items-center gap-1 text-[11px] font-mono">
          <span class="text-white/50">AIR</span>
          <span class="font-bold text-white tabular-nums">{air().toFixed(1)}°C</span>
        </div>

        <div class="h-3 w-px bg-white/15" />

        <div class="flex items-center gap-1 text-[11px] font-mono">
          <span class="text-white/50">TRACK</span>
          <span class="font-bold text-amber-400 tabular-nums">{track().toFixed(1)}°C</span>
        </div>

        <div class="h-3 w-px bg-white/15" />

        <div class="flex items-center gap-1 text-[11px] font-mono">
          <span class="text-white/50">RAIN</span>
          <span class="font-bold text-[#00d26a] tabular-nums">{rain()}%</span>
        </div>
      </div>
    </div>
  );
};

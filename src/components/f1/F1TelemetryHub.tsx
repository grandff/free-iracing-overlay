import { Component, Show, For } from "solid-js";
import { IconStopwatch, IconFuel } from "../../assets/icons/Icons.tsx";
import { createPresence } from "../../utils/presence.ts";

interface Props {
  gear?: number | string;
  speedKmh?: number;
  rpm?: number;
  maxRpm?: number;
  lapDelta?: number;
  fuelLiters?: number;
  fuelLaps?: number;
  throttlePct?: number; // 0 ~ 100
  brakePct?: number; // 0 ~ 100
  drsActive?: boolean;
  drsAvailable?: boolean;
  ersBatteryPct?: number;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const F1TelemetryHub: Component<Props> = (props) => {
  const gear = () => (props.gear !== undefined ? props.gear : 6);
  const speed = () => (props.speedKmh !== undefined ? props.speedKmh : 245);
  const rpm = () => (props.rpm !== undefined ? props.rpm : 11200);
  const maxRpm = () => props.maxRpm || 13500;
  const delta = () => (props.lapDelta !== undefined ? props.lapDelta : -0.234);
  const fuel = () => (props.fuelLiters !== undefined ? props.fuelLiters : 42.5);
  const fuelLaps = () => (props.fuelLaps !== undefined ? props.fuelLaps : 18);
  const throttle = () => (props.throttlePct !== undefined ? props.throttlePct : 88);
  const brake = () => (props.brakePct !== undefined ? props.brakePct : 0);
  const drsAvail = () => (props.drsAvailable !== undefined ? props.drsAvailable : true);
  const drsOn = () => (props.drsActive !== undefined ? props.drsActive : false);
  const ers = () => (props.ersBatteryPct !== undefined ? props.ersBatteryPct : 84);
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  // 15 Shift LEDs (5 Green, 5 Red, 5 Blue) - Clean matte racecar display, zero tacky neon box-shadows
  const totalLeds = 15;
  const rpmRatio = () => Math.min(1, Math.max(0, (rpm() - 5000) / (maxRpm() - 5000)));
  const litCount = () => Math.round(rpmRatio() * totalLeds);

  return (
    <div class="relative flex flex-col bg-[#141416]/95 border border-white/10 rounded-xl shadow-2xl p-3 select-none font-f1 w-[440px]">
      {/* Sleek Floating Apple Scale Capsule (Only in Edit Mode) */}
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${ editPresence.visible() ? "is-visible" : "is-hidden" }`}
        >
          <span class="text-[10px] font-medium text-white/70">텔레메트리 크기</span>
          <div class="flex items-center gap-1.5">
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

      {/* 1. Top Shift Light LED Bar (15 Discrete Race LEDs - Solid Crisp Matte Colors) */}
      <div class="flex items-center justify-between gap-1 px-2.5 py-1.5 bg-black/60 rounded-lg border border-white/[0.08] mb-2.5">
        <div class="flex items-center gap-1 w-full justify-between">
          <For each={Array.from({ length: totalLeds })}>
            {(_, idx) => {
              const i = idx();
              const isLit = () => i < litCount();
              const colorClass = () => {
                if (i < 5) return isLit() ? "bg-[#30d158]" : "bg-white/[0.07]";
                if (i < 10) return isLit() ? "bg-[#ff453a]" : "bg-white/[0.07]";
                return isLit() ? "bg-[#0a84ff]" : "bg-white/[0.07]";
              };

              return (
                <div
                  class={`h-2 flex-1 rounded-sm  ${colorClass()}`}
                />
              );
            }}
          </For>
        </div>
      </div>

      {/* 2. Main Cluster: Gear, Speed, Pedals, Delta */}
      <div class="grid grid-cols-[80px_1fr_116px] items-center gap-3">
        {/* Gear Box */}
        <div class="flex flex-col items-center justify-center bg-black/50 border border-white/10 rounded-lg py-2 px-1">
          <span class="text-[9px] font-f1-wide text-white/40 tracking-wider">GEAR</span>
          <span
            class={`text-4xl font-f1-num font-black leading-none tracking-tight ${ gear() === "R" ? "text-[#ffd60a]" : gear() === "N" ? "text-[#30d158]" : "text-white" }`}
          >
            {gear()}
          </span>
          <span class="text-[9px] font-f1-num text-white/40 mt-1 font-semibold">
            {rpm().toLocaleString()}
          </span>
        </div>

        {/* Speed & Pedal Trace Center */}
        <div class="flex flex-col gap-1.5">
          {/* Speed & Flags */}
          <div class="flex items-baseline gap-1.5">
            <span class="text-3xl font-f1-num font-black tracking-tight text-white tabular-nums">
              {speed()}
            </span>
            <span class="text-xs font-f1-wide font-bold text-white/40">KM/H</span>

            {/* DRS & ERS Badges - Matte, Clean Minimalist */}
            <div class="ml-auto flex items-center gap-1.5">
              <div
                class={`px-2 py-0.5 rounded text-[10px] font-f1-wide font-black border transition-all ${ drsOn() ? "bg-[#30d158] text-black border-[#30d158]" : drsAvail() ? "bg-white/10 text-[#30d158] border-[#30d158]/40" : "bg-white/5 text-white/20 border-white/10" }`}
              >
                DRS
              </div>
              <div class="px-1.5 py-0.5 rounded text-[10px] font-f1-num font-bold bg-white/10 text-white/70 border border-white/15">
                ERS {ers()}%
              </div>
            </div>
          </div>

          {/* Pedal Traces - Flat, Solid Minimalist Bars without blurry glow */}
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-f1-wide text-white/40 w-5">THR</span>
              <div class="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#30d158] "
                  style={{ width: `${throttle()}%` }}
                />
              </div>
              <span class="text-[9px] font-f1-num text-white/60 w-6 text-right font-bold tabular-nums">
                {throttle()}%
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[9px] font-f1-wide text-white/40 w-5">BRK</span>
              <div class="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#ff453a] "
                  style={{ width: `${brake()}%` }}
                />
              </div>
              <span class="text-[9px] font-f1-num text-white/60 w-6 text-right font-bold tabular-nums">
                {brake()}%
              </span>
            </div>
          </div>
        </div>

        {/* Delta & Fuel Column */}
        <div class="flex flex-col gap-1.5 pl-3 border-l border-white/10">
          <div class="flex flex-col">
            <div class="flex items-center gap-1 text-[9px] font-f1-wide text-white/40">
              <IconStopwatch size={10} />
              <span>LAP DELTA</span>
            </div>
            <div
              class={`px-2 py-0.5 rounded text-xs font-f1-num font-bold tracking-tight border mt-0.5 text-center ${ delta() <= 0 ? "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30" : "bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30" }`}
            >
              {delta() <= 0 ? "" : "+"}
              {delta().toFixed(3)}s
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] font-f1-num text-white/80 pt-1 border-t border-white/[0.08]">
            <div class="flex items-center gap-1 text-[9px] font-f1-wide text-white/40">
              <IconFuel size={10} />
              <span>FUEL</span>
            </div>
            <span class="font-bold tabular-nums">
              {fuel().toFixed(1)}L <span class="text-white/40 font-normal">({fuelLaps()}L)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

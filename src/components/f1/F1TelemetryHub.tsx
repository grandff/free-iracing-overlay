import { Component, Show, For } from "solid-js";
import { IconStopwatch, IconFuel } from "../../assets/icons/Icons.tsx";

interface Props {
  gear?: number | string;
  speedKmh?: number;
  rpm?: number;
  maxRpm?: number;
  lapDelta?: number;
  fuelLiters?: number;
  fuelLaps?: number;
  throttlePct?: number; // 0 ~ 100
  brakePct?: number;    // 0 ~ 100
  drsActive?: boolean;
  drsAvailable?: boolean;
  ersBatteryPct?: number;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const F1TelemetryHub: Component<Props> = (props) => {
  const gear = () => props.gear !== undefined ? props.gear : 6;
  const speed = () => props.speedKmh !== undefined ? props.speedKmh : 245;
  const rpm = () => props.rpm !== undefined ? props.rpm : 11200;
  const maxRpm = () => props.maxRpm || 13500;
  const delta = () => props.lapDelta !== undefined ? props.lapDelta : -0.234;
  const fuel = () => props.fuelLiters !== undefined ? props.fuelLiters : 42.5;
  const fuelLaps = () => props.fuelLaps !== undefined ? props.fuelLaps : 18;
  const throttle = () => props.throttlePct !== undefined ? props.throttlePct : 88;
  const brake = () => props.brakePct !== undefined ? props.brakePct : 0;
  const drsAvail = () => props.drsAvailable !== undefined ? props.drsAvailable : true;
  const drsOn = () => props.drsActive !== undefined ? props.drsActive : false;
  const ers = () => props.ersBatteryPct !== undefined ? props.ersBatteryPct : 84;

  // 15 Rev LEDs (5 Green, 5 Red, 5 Blue/Purple shift flash)
  const totalLeds = 15;
  const rpmRatio = () => Math.min(1, Math.max(0, (rpm() - 5000) / (maxRpm() - 5000)));
  const litCount = () => Math.round(rpmRatio() * totalLeds);

  return (
    <div class="relative flex flex-col bg-[#0f1016]/95 border border-white/[0.12] rounded-xl shadow-[0_20px_48px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-3 select-none font-f1 w-[460px] drop-shadow-2xl">
      {/* Sleek Floating Apple Scale Capsule (Only in Edit Mode) */}
      <Show when={props.isEditMode}>
        <div class="absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 backdrop-blur-xl border border-white/20 rounded-full shadow-lg text-white pointer-events-auto">
          <span class="text-[10px] font-medium text-white/70">텔레메트리 크기</span>
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

      {/* 1. Top F1 Rev Light LED Bar (15 LEDs) */}
      <div class="flex items-center justify-between gap-1 px-3 py-1 bg-black/60 rounded-md border border-white/[0.08] mb-2.5">
        <div class="flex items-center gap-1 w-full justify-between">
          <For each={Array.from({ length: totalLeds })}>
            {(_, idx) => {
              const i = idx();
              const isLit = () => i < litCount();
              const colorClass = () => {
                if (i < 5) return isLit() ? "bg-[#00d26a] shadow-[0_0_8px_#00d26a]" : "bg-[#00d26a]/15";
                if (i < 10) return isLit() ? "bg-[#e10600] shadow-[0_0_8px_#e10600]" : "bg-[#e10600]/15";
                return isLit() ? "bg-[#b055f5] shadow-[0_0_10px_#b055f5] animate-pulse" : "bg-[#b055f5]/15";
              };

              return (
                <div
                  class={`h-2 flex-1 rounded-sm transition-all duration-75 ${colorClass()}`}
                />
              );
            }}
          </For>
        </div>
      </div>

      {/* 2. Main Cluster: Gear, Speed, Pedals, Delta */}
      <div class="grid grid-cols-[80px_1fr_120px] items-center gap-3">
        {/* Gear Box */}
        <div class="flex flex-col items-center justify-center bg-black/50 border border-white/10 rounded-md py-2 px-1">
          <span class="text-[9px] font-f1-wide text-white/40 tracking-wider">GEAR</span>
          <span
            class={`text-4xl font-f1-num font-black leading-none tracking-tight ${
              gear() === "R"
                ? "text-[#ffd100]"
                : gear() === "N"
                ? "text-[#39b54a]"
                : "text-white"
            }`}
          >
            {gear()}
          </span>
          <span class="text-[9px] font-f1-num text-white/40 mt-1 font-semibold">
            {rpm().toLocaleString()}
          </span>
        </div>

        {/* Speed & Pedal Trace Center */}
        <div class="flex flex-col gap-1.5">
          {/* Speed */}
          <div class="flex items-baseline gap-1.5">
            <span class="text-3xl font-f1-num font-black tracking-tight text-white">
              {speed()}
            </span>
            <span class="text-xs font-f1-wide font-bold text-white/50">KM/H</span>

            {/* DRS & ERS Pill */}
            <div class="ml-auto flex items-center gap-1.5">
              <div
                class={`px-2 py-0.5 rounded text-[10px] font-f1-wide font-black border transition-all ${
                  drsOn()
                    ? "bg-[#00d26a] text-black border-[#00d26a] shadow-[0_0_8px_rgba(0,210,106,0.6)]"
                    : drsAvail()
                    ? "bg-white/10 text-[#00d26a] border-[#00d26a]/40"
                    : "bg-white/5 text-white/20 border-white/10"
                }`}
              >
                DRS
              </div>
              <div class="px-1.5 py-0.5 rounded text-[10px] font-f1-num font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                ERS {ers()}%
              </div>
            </div>
          </div>

          {/* Pedal Traces */}
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-f1-wide text-white/40 w-5">THR</span>
              <div class="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#00d26a] shadow-[0_0_6px_#00d26a] transition-all duration-75"
                  style={{ width: `${throttle()}%` }}
                />
              </div>
              <span class="text-[9px] font-f1-num text-white/60 w-6 text-right font-bold">
                {throttle()}%
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[9px] font-f1-wide text-white/40 w-5">BRK</span>
              <div class="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#e10600] shadow-[0_0_6px_#e10600] transition-all duration-75"
                  style={{ width: `${brake()}%` }}
                />
              </div>
              <span class="text-[9px] font-f1-num text-white/60 w-6 text-right font-bold">
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
              class={`px-2 py-1 rounded text-sm font-f1-num font-extrabold tracking-tight border mt-0.5 text-center ${
                delta() < -0.1
                  ? "bg-[#b055f5]/20 text-[#b055f5] border-[#b055f5]/40 shadow-[0_0_8px_rgba(176,85,245,0.3)]"
                  : delta() <= 0
                  ? "bg-[#00d26a]/20 text-[#00d26a] border-[#00d26a]/40"
                  : "bg-[#e10600]/20 text-[#ff453a] border-[#e10600]/40"
              }`}
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
            <span class="font-bold">{fuel().toFixed(1)}L <span class="text-white/40 font-normal">({fuelLaps()}L)</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

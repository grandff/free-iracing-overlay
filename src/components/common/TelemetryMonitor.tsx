import { Component, Show } from "solid-js";
import { telemetry } from "../../stores/telemetryStore.ts";
import { settings } from "../../stores/settingsStore.ts";
import {
  IconFuel,
  IconWarning,
  IconCrosshair,
  IconCompass,
  IconStopwatch,
  IconTirePSI,
} from "../../assets/icons/Icons.tsx";

export const TelemetryMonitor: Component = () => {
  const p = () => telemetry.frame?.player;
  const h = () => telemetry.frame?.hazard;
  const r = () => telemetry.frame?.revenge;
  const w = () => telemetry.frame?.weather;

  return (
    <div
      style={{
        transform: `translate3d(calc(-50% + ${settings.widgets.telemetryHub.x}px), ${settings.widgets.telemetryHub.y}px, 0) scale(${settings.widgets.telemetryHub.scale})`,
        "transform-origin": "bottom center",
      }}
      class="fixed bottom-6 left-1/2 z-30 flex flex-col items-center gap-3 transition-transform duration-75"
    >
      {/* High-priority Hazard Alert (Blinking if hazard ahead within 400m) */}
      <Show when={h() && h()!.hasIncident}>
        <div class="hud-panel px-6 py-2.5 flex items-center gap-3 bg-red-950/80 border-2 border-red-500 text-red-100 shadow-[0_0_25px_#EF4444] animate-pulse">
          <IconWarning size={24} class="text-red-400 animate-bounce" />
          <div class="flex flex-col">
            <span class="font-extrabold tracking-wider text-sm uppercase">INCIDENT AHEAD IN SECTOR {h()!.incidentSector}</span>
            <span class="font-mono text-xs text-red-200">
              Car #{h()!.incidentCarNumber} — Distance: <strong>{h()!.distanceMeters}m</strong>
            </span>
          </div>
        </div>
      </Show>

      {/* Main Central Telemetry & Pipeline Status Hub */}
      <div class="hud-panel px-5 py-3 flex items-center gap-6 text-sm">
        {/* Gear & Speed Cluster (LERP Smooth) */}
        <div class="flex items-center gap-3 pr-4 border-r border-white/10">
          <div class="flex flex-col items-center">
            <span class="text-[10px] text-[var(--theme-text-muted)] font-mono">GEAR</span>
            <span class="text-3xl font-black text-[var(--theme-accent)] leading-none">{p()?.gear || "N"}</span>
          </div>
          <div class="flex flex-col">
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-mono font-black tracking-tight">{p()?.speedKmh || 0}</span>
              <span class="text-[10px] text-[var(--theme-text-muted)]">KM/H</span>
            </div>
            <span class="text-[10px] font-mono text-white/50">{p()?.rpm || 0} RPM</span>
          </div>
        </div>

        {/* Lap Delta */}
        <div class="flex flex-col pr-4 border-r border-white/10">
          <div class="flex items-center gap-1 text-[10px] text-[var(--theme-text-muted)]">
            <IconStopwatch size={12} />
            <span>LAP DELTA</span>
          </div>
          <span
            class={`font-mono font-bold text-base ${
              (p()?.lastLapDelta || 0) <= 0 ? "text-[var(--theme-delta-neg)]" : "text-[var(--theme-delta-pos)]"
            }`}
          >
            {(p()?.lastLapDelta || 0) <= 0 ? "" : "+"}
            {p()?.lastLapDelta.toFixed(2)}s
          </span>
        </div>

        {/* Fuel & Laps */}
        <div class="flex flex-col pr-4 border-r border-white/10">
          <div class="flex items-center gap-1 text-[10px] text-[var(--theme-text-muted)]">
            <IconFuel size={12} />
            <span>FUEL REMAIN</span>
          </div>
          <div class="flex items-baseline gap-1.5 font-mono">
            <span class="font-bold text-base">{p()?.fuelLevelLiters.toFixed(1)}L</span>
            <span class="text-[11px] text-white/60">({p()?.fuelLapsRemaining} laps)</span>
          </div>
        </div>

        {/* Revenge Target Status */}
        <Show when={r() && r()!.hasTarget}>
          <div class="flex flex-col pr-4 border-r border-white/10">
            <div class="flex items-center gap-1 text-[10px] text-red-400">
              <IconCrosshair size={12} class="animate-spin" />
              <span>REVENGE TARGET</span>
            </div>
            <span class="font-mono text-xs font-bold text-red-300">
              #{r()!.carNumber} {r()!.driverName} ({r()!.gapSeconds.toFixed(1)}s)
            </span>
          </div>
        </Show>

        {/* Track Temp & Wind */}
        <div class="flex flex-col">
          <div class="flex items-center gap-1 text-[10px] text-[var(--theme-text-muted)]">
            <IconCompass size={12} />
            <span>TRACK / WIND</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs">
            <span>{w()?.trackTempC}°C</span>
            <span class="text-white/40">|</span>
            <span>{w()?.windSpeedKmh}km/h ({w()?.windDirDeg}°)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

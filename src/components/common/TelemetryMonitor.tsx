import { Component, Show } from "solid-js";
import { telemetry } from "../../stores/telemetryStore.ts";
import { settings, updateWidgetTransform } from "../../stores/settingsStore.ts";
import {
  IconWarning,
  IconCrosshair,
} from "../../assets/icons/Icons.tsx";
import { F1TelemetryHub } from "../f1/F1TelemetryHub.tsx";

export const TelemetryMonitor: Component = () => {
  const p = () => telemetry.frame?.player;
  const h = () => telemetry.frame?.hazard;
  const r = () => telemetry.frame?.revenge;

  return (
    <div
      style={{
        transform: `translate3d(calc(-50% + ${settings.widgets.telemetryHub.x}px), ${settings.widgets.telemetryHub.y}px, 0) scale(${settings.widgets.telemetryHub.scale})`,
        "transform-origin": "bottom center",
      }}
      class="fixed bottom-6 left-1/2 z-30 flex flex-col items-center gap-2.5 transition-transform duration-75"
    >
      {/* High-priority Hazard Alert (Blinking if hazard ahead within 400m) */}
      <Show when={h() && h()!.hasIncident}>
        <div class="hud-panel px-6 py-2 flex items-center gap-3 bg-red-950/90 border-2 border-red-500 text-red-100 shadow-[0_0_25px_#EF4444] animate-pulse rounded">
          <IconWarning size={22} class="text-red-400 animate-bounce" />
          <div class="flex flex-col">
            <span class="font-f1-wide font-black tracking-wider text-xs uppercase text-white">
              INCIDENT AHEAD IN SECTOR {h()!.incidentSector}
            </span>
            <span class="font-f1-num text-[11px] text-red-200">
              Car #{h()!.incidentCarNumber} — Distance: <strong>{h()!.distanceMeters}m</strong>
            </span>
          </div>
        </div>
      </Show>

      {/* Revenge Target Notification if tracking someone */}
      <Show when={r() && r()!.hasTarget}>
        <div class="px-4 py-1.5 rounded bg-black/80 border border-red-500/40 text-red-300 text-xs font-f1 flex items-center gap-2 shadow-lg">
          <IconCrosshair size={14} class="text-red-400 animate-spin" />
          <span>REVENGE TARGET: <strong>#{r()!.carNumber} {r()!.driverName}</strong> ({r()!.gapSeconds.toFixed(1)}s)</span>
        </div>
      </Show>

      {/* F1 Cockpit Steering & Telemetry Hub */}
      <F1TelemetryHub
        gear={p()?.gear}
        speedKmh={p()?.speedKmh}
        rpm={p()?.rpm}
        lapDelta={p()?.lastLapDelta}
        fuelLiters={p()?.fuelLevelLiters}
        fuelLaps={p()?.fuelLapsRemaining}
        isEditMode={settings.isEditMode}
        scale={settings.widgets.telemetryHub.scale}
        onScaleChange={(scale) => updateWidgetTransform("telemetryHub", { scale })}
      />
    </div>
  );
};

import { Component, Show } from "solid-js";
import { telemetry } from "../../stores/telemetryStore.ts";
import { settings } from "../../stores/settingsStore.ts";

export const SpotterBlinker: Component = () => {
  const spotter = () => telemetry.frame?.spotter;

  // Compute CSS classes based on state
  const leftClass = () => {
    const s = spotter();
    if (!s || s.leftState === "clear") return "opacity-0";
    if (s.leftState === "danger") return "opacity-100 bg-red-600 animate-ping shadow-[0_0_20px_#EF4444]";
    return "opacity-80 bg-amber-400 shadow-[0_0_15px_#F59E0B]";
  };

  const rightClass = () => {
    const s = spotter();
    if (!s || s.rightState === "clear") return "opacity-0";
    if (s.rightState === "danger") return "opacity-100 bg-red-600 animate-ping shadow-[0_0_20px_#EF4444]";
    return "opacity-80 bg-amber-400 shadow-[0_0_15px_#F59E0B]";
  };

  return (
    <>
      {/* Left Spotter Border Indicator */}
      <div
        class={`fixed top-1/4 bottom-1/4 left-0 w-3 rounded-r-md transition-all duration-100 pointer-events-none z-40 ${leftClass()}`}
      >
        <Show when={spotter() && spotter()!.leftState !== "clear"}>
          <div class="absolute left-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white font-mono font-bold text-xs rounded border border-white/20">
            ◀ {spotter()!.leftDistanceMeters.toFixed(1)}m
          </div>
        </Show>
      </div>

      {/* Right Spotter Border Indicator */}
      <div
        class={`fixed top-1/4 bottom-1/4 right-0 w-3 rounded-l-md transition-all duration-100 pointer-events-none z-40 ${rightClass()}`}
      >
        <Show when={spotter() && spotter()!.rightState !== "clear"}>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white font-mono font-bold text-xs rounded border border-white/20">
            {spotter()!.rightDistanceMeters.toFixed(1)}m ▶
          </div>
        </Show>
      </div>
    </>
  );
};

import { Component, onMount, onCleanup, createEffect } from "solid-js";
import { settings, toggleEditMode } from "./stores/settingsStore.ts";
import { initializeTelemetryPipeline } from "./stores/telemetryStore.ts";
import { HeaderBar } from "./components/common/HeaderBar.tsx";
import { SpotterBlinker } from "./components/common/SpotterBlinker.tsx";
import { TelemetryMonitor } from "./components/common/TelemetryMonitor.tsx";

export const App: Component = () => {
  onMount(() => {
    // 1. Initialize 60Hz -> 144Hz+ LERP pipeline
    initializeTelemetryPipeline();

    // 2. Register Ctrl + Shift + O keyboard toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        toggleEditMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
  });

  // Dynamically attach data-theme to root element
  createEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  });

  return (
    <main
      class={`relative w-full h-full min-h-screen overflow-hidden ${
        settings.isEditMode ? "pointer-events-auto bg-black/25" : "pointer-events-none bg-transparent"
      }`}
    >
      {/* Top Header & Toolbar (Interactive) */}
      <HeaderBar />

      {/* Proximity Spotter (Always active on side borders) */}
      <SpotterBlinker />

      {/* Viewport Bounds (Triple Monitor Center Clamp vs Full Span) */}
      <div
        class={`relative w-full h-full transition-all duration-300 ${
          settings.tripleMonitorMode === "center-clamp"
            ? "max-w-[1920px] mx-auto border-x border-white/5"
            : "w-full"
        }`}
      >
        {/* Driving Mode Overlay Notification (when locked) */}
        {!settings.isEditMode && (
          <div class="fixed top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white/50 text-[10px] font-mono rounded pointer-events-none transition-opacity duration-500">
            DRIVING MODE ACTIVE (Click-through enabled • Press Ctrl+Shift+O to edit)
          </div>
        )}

        {/* Central HUD Metrics & Alert Monitor */}
        <TelemetryMonitor />
      </div>
    </main>
  );
};

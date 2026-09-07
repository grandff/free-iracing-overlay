import { Component, onMount, onCleanup, createEffect, Show } from "solid-js";
import { settings, toggleEditMode, hydrateFromDiskConfig } from "./stores/settingsStore.ts";
import { initializeTelemetryPipeline } from "./stores/telemetryStore.ts";
import { HeaderBar } from "./components/common/HeaderBar.tsx";
import { SpotterBlinker } from "./components/common/SpotterBlinker.tsx";
import { TelemetryMonitor } from "./components/common/TelemetryMonitor.tsx";
import { SetupWizard } from "./components/setup/SetupWizard.tsx";

export const App: Component = () => {
  onMount(() => {
    // 0. Hydrate config from native disk file (config.json) if running in Tauri desktop app
    hydrateFromDiskConfig();

    // 1. Initialize 60Hz -> 144Hz+ LERP pipeline
    initializeTelemetryPipeline();

    // 2. Register Alt + J keyboard toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "j" || e.key === "J" || e.code === "KeyJ")) {
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
        !settings.hasCompletedSetup || settings.isEditMode
          ? "pointer-events-auto bg-black/25"
          : "pointer-events-none bg-transparent"
      }`}
    >
      {/* 1. Initial Setup Wizard (Runs when hasCompletedSetup is false) */}
      <Show when={!settings.hasCompletedSetup}>
        <SetupWizard />
      </Show>

      {/* 2. Main Driving Overlay HUD (Active when setup completed) */}
      <Show when={settings.hasCompletedSetup}>
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
              DRIVING MODE ACTIVE (Click-through enabled • Press Alt+J to edit)
            </div>
          )}

          {/* Central HUD Metrics & Alert Monitor */}
          <TelemetryMonitor />
        </div>
      </Show>
    </main>
  );
};

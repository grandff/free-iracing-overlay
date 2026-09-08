import { Component, onMount, onCleanup, createEffect } from "solid-js";
import { settings, hydrateFromDiskConfig, flushSettings } from "./stores/settingsStore.ts";
import { telemetry, initializeConnectionWatch, disposeTelemetryPipeline } from "./stores/telemetryStore.ts";
import { setOverlayVisible } from "./services/shell.ts";
import { ControlApp } from "./components/control/ControlApp.tsx";
import { SetupWizard } from "./components/setup/SetupWizard.tsx";

/**
 * The program window (Tauri label "control").
 *
 * It is the app's always-present half: the user alt-tabs here to configure things
 * whether or not iRacing is running. It also owns the decision of when the HUD
 * window is on screen, because it is the window that is guaranteed to be alive.
 */
export const ControlWindow: Component = () => {
  onMount(() => {
    hydrateFromDiskConfig();
    initializeConnectionWatch();
    // A pending debounced write must not die with the window.
    const flush = () => void flushSettings();
    window.addEventListener("beforeunload", flush);
    onCleanup(() => {
      window.removeEventListener("beforeunload", flush);
      disposeTelemetryPipeline();
    });
  });

  createEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  });

  // The whole point of the split: HUD on screen exactly when iRacing is running
  // and the user has finished setup. No manual show/hide step.
  createEffect(() => {
    void setOverlayVisible(settings.hasCompletedSetup && telemetry.isConnected);
  });

  return (
    <div class="w-screen h-screen overflow-hidden bg-[#0f0f12]">
      {settings.hasCompletedSetup ? <ControlApp standalone /> : <SetupWizard />}
    </div>
  );
};

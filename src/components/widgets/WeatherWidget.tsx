import { Component, Show, createSignal, createMemo, onCleanup } from "solid-js";
import {
  IconCompass,
  IconThermometer,
  IconCloudRain,
  IconSun,
  IconCloud,
  IconDroplet,
} from "../../assets/icons/Icons.tsx";
import {
  WeatherTelemetry,
  TrackWetnessLevel,
  SkiesState,
} from "../../services/telemetry/types.ts";
import { t } from "../../i18n/index.ts";

export interface WeatherWidgetProps {
  /** Telemetry: AirTemp / TrackTempCrew / WindVel / WindDir / Skies / Precipitation / TrackWetness. */
  weather?: WeatherTelemetry;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
}

export const WeatherWidget: Component<WeatherWidgetProps> = (props) => {
  // Width control: default 380px, min 300px, max 520px
  const currentWidth = () => Math.max(300, Math.min(520, props.width ?? 380));

  // Edit-mode interactive test switcher:
  // 0: LIVE (reads incoming live telemetry)
  // 1: DRY (Clear skies, 26.2°C Air, 42.8°C Track, Dry, 0% Rain, 9 km/h NE)
  // 2: DAMP (Mostly cloudy, 19.5°C Air, 24.1°C Track, Very Light Wet, 14% Rain, 21 km/h SE)
  // 3: TEMPEST WET (Overcast, 16.8°C Air, 18.5°C Track, Moderately Wet, 52% Rain, 32 km/h SW)
  // 4: FLOOD (Overcast, 13.9°C Air, 14.8°C Track, Extreme Wet, 94% Rain, 46 km/h NW)
  const [testMode, setTestMode] = createSignal<0 | 1 | 2 | 3 | 4>(0);
  const [isResizing, setIsResizing] = createSignal(false);

  // Active data resolution
  const activeData = createMemo(() => {
    // In edit mode with no session attached there is nothing live to show, so the
    // layout rehearses against DRY rather than crashing on an absent frame.
    const rehearsal = props.isEditMode && (testMode() !== 0 || !props.weather) ? testMode() || 1 : 0;
    if (rehearsal !== 0) {
      if (rehearsal === 1) {
        return {
          airTemp: 26.2,
          trackTemp: 42.8,
          windSpeed: 9.4,
          windDir: 45,
          humidity: 38,
          precip: 0,
          wetness: 1 as TrackWetnessLevel, // Dry
          skies: 0 as SkiesState, // Clear
          isDynamic: true,
        };
      } else if (rehearsal === 2) {
        return {
          airTemp: 19.5,
          trackTemp: 24.1,
          windSpeed: 21.2,
          windDir: 135,
          humidity: 76,
          precip: 14,
          wetness: 3 as TrackWetnessLevel, // Very Lightly Wet
          skies: 2 as SkiesState, // Mostly cloudy
          isDynamic: true,
        };
      } else if (rehearsal === 3) {
        return {
          airTemp: 16.8,
          trackTemp: 18.5,
          windSpeed: 32.4,
          windDir: 225,
          humidity: 95,
          precip: 52,
          wetness: 5 as TrackWetnessLevel, // Moderately Wet
          skies: 3 as SkiesState, // Overcast
          isDynamic: true,
        };
      } else {
        return {
          airTemp: 13.9,
          trackTemp: 14.8,
          windSpeed: 46.0,
          windDir: 315,
          humidity: 99,
          precip: 94,
          wetness: 7 as TrackWetnessLevel, // Extremely Wet
          skies: 3 as SkiesState, // Overcast
          isDynamic: true,
        };
      }
    }

    // Live. No frame -> the widget does not render at all (see the Show below),
    // so there is nothing to invent a default for.
    // createMemo runs eagerly, before the Show below can gate anything, so this
    // branch has to survive a missing frame. hasData() keeps it off screen.
    const w = props.weather;
    if (!w) {
      return {
        airTemp: 0, trackTemp: 0, windSpeed: 0, windDir: 0, humidity: 0,
        precip: 0, wetness: 1 as TrackWetnessLevel, skies: 0 as SkiesState, isDynamic: false,
      };
    }
    return {
      airTemp: w.airTempC,
      trackTemp: w.trackTempC,
      windSpeed: w.windSpeedKmh,
      windDir: w.windDirDeg,
      humidity: w.relativeHumidityPct ?? 0,
      precip: w.precipitationPct ?? 0,
      wetness: (w.trackWetness ?? 1) as TrackWetnessLevel,
      skies: (w.skies ?? 0) as SkiesState,
      isDynamic: w.weatherType === 1,
    };
  });

  // Calculate cardinal direction (N, NE, E, SE, S, SW, W, NW)
  const cardinalDir = () => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const deg = activeData().windDir;
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  // Track wetness level metadata & tire strategy recommendation
  const wetnessMeta = () => {
    const level = activeData().wetness;
    switch (level) {
      case 1:
        return { label: t().wetDry, badgeClass: "text-[#00d26a] border-[#00d26a]/60 bg-[#00d26a]/15", tire: "SLICK" };
      case 2:
        return { label: t().wetMostlyDry, badgeClass: "text-[#a3e635] border-[#a3e635]/60 bg-[#a3e635]/15", tire: "SLICK" };
      case 3:
        return { label: t().wetVeryLight, badgeClass: "text-[#fcd34d] border-[#fcd34d]/60 bg-[#fcd34d]/15", tire: "SLICK / INTER" };
      case 4:
        return { label: t().wetLight, badgeClass: "text-[#f59e0b] border-[#f59e0b]/60 bg-[#f59e0b]/15", tire: "INTER" };
      case 5:
        return { label: t().wetModerate, badgeClass: "text-[#38bdf8] border-[#38bdf8]/60 bg-[#38bdf8]/15", tire: "WET" };
      case 6:
        return { label: t().wetVeryWet, badgeClass: "text-[#60a5fa] border-[#60a5fa]/60 bg-[#60a5fa]/15", tire: "WET" };
      case 7:
        return { label: t().wetExtreme, badgeClass: "text-[#f87171] border-[#f87171]/60 bg-[#f87171]/25 animate-pulse", tire: "EXTREME WET" };
      default:
        return { label: t().wetDry, badgeClass: "text-white/70 border-white/20 bg-white/5", tire: "SLICK" };
    }
  };

  // Skies description & icon
  const skiesInfo = () => {
    const s = activeData().skies;
    if (activeData().precip > 0) {
      return { label: t().weatherPrecip, icon: IconCloudRain, color: "text-[#38bdf8]" };
    }
    switch (s) {
      case 0:
        return { label: t().skiesClear, icon: IconSun, color: "text-amber-300" };
      case 1:
        return { label: t().skiesPartlyCloudy, icon: IconSun, color: "text-amber-200" };
      case 2:
        return { label: t().skiesMostlyCloudy, icon: IconCloud, color: "text-white/70" };
      case 3:
      default:
        return { label: t().skiesOvercast, icon: IconCloud, color: "text-white/60" };
    }
  };

  // Track delta vs Air (e.g. +12.4°C)
  const trackDelta = () => {
    const diff = activeData().trackTemp - activeData().airTemp;
    return (diff >= 0 ? "+" : "") + diff.toFixed(1);
  };

  // Horizontal Resize Mouse Handler
  let startX = 0;
  let startWidth = 0;
  let stopResizeListeners = () => {};

  const handleResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    startX = e.clientX;
    startWidth = currentWidth();
    stopResizeListeners();

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = (ev.clientX - startX) / (props.scale || 1);
      const newWidth = Math.round(Math.max(300, Math.min(520, startWidth + deltaX)));
      props.onWidthChange?.(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      stopResizeListeners();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    stopResizeListeners = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  };

  onCleanup(stopResizeListeners);

  // Nothing to report without a session: an overlay that shows 22.4 degrees on a
  // track it has never read is worse than one that shows nothing.
  const hasData = () => props.weather !== undefined || !!props.isEditMode;

  return (
    <Show when={hasData()}>
    <div
      class="relative flex flex-col font-sans select-none"
      style={{
        width: `${currentWidth()}px`,
      }}
    >
      {/* Edit Mode Top Control Bar */}
      <Show when={props.isEditMode}>
        <div class="flex items-center justify-between px-3 py-1 f1-slab border-b-0 text-white select-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTestMode((prev) => ((prev + 1) % 5) as 0 | 1 | 2 | 3 | 4);
            }}
            class="px-2 py-0.5 bg-[#E10600]/20 hover:bg-[#E10600]/35 text-white border border-[#E10600]/70 text-[10px] f1-oblique cursor-pointer transition-all active:scale-95"
            title="날씨/템페스트 테스트 상태 전환"
          >
            {t().weatherTestBtn}:{" "}
            {testMode() === 0
              ? "LIVE"
              : testMode() === 1
              ? "DRY"
              : testMode() === 2
              ? "DAMP"
              : testMode() === 3
              ? "RAIN"
              : "FLOOD"}
          </button>

          <div class="flex items-center gap-1.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onScaleChange?.(Math.max(0.7, (props.scale || 1) - 0.1));
              }}
              class="w-5 h-5 rounded-[1px] bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer transition-all border border-white/15"
              title="축소"
            >
              -
            </button>
            <span class="text-[11px] font-mono font-bold w-9 text-center text-white/90">
              {Math.round((props.scale || 1) * 100)}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onScaleChange?.(Math.min(1.5, (props.scale || 1) + 0.1));
              }}
              class="w-5 h-5 rounded-[1px] bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer transition-all border border-white/15"
              title="확대"
            >
              +
            </button>
          </div>
        </div>
      </Show>

      {/* Main Weather & Tempest F1 Slab Card */}
      <div
        class={`relative flex flex-col f1-slab overflow-hidden shadow-2xl transition-all duration-150 ${
          activeData().precip > 50 || activeData().wetness >= 5
            ? "border-l-4 border-l-[#2563EB] border border-[#2563EB]/70 bg-gradient-to-r from-[#0b1626]/95 to-[#12141c]/95"
            : activeData().precip > 0 || activeData().wetness >= 3
            ? "border-l-4 border-l-[#38BDF8] border border-[#38BDF8]/60 bg-gradient-to-r from-[#0b1a20]/95 to-[#12141c]/95"
            : "border-l-4 border-l-[#E10600] border border-white/10 bg-[#12141c]/95"
        }`}
      >
        {/* Header Strip: Title + Tempest Status + Skies Badge */}
        <div class="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="f1-title text-[11px] text-white">
              {t().weatherTitle}
            </span>
            <Show when={activeData().isDynamic}>
              <span class="px-1.5 py-[1px] bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40 rounded-[2px] text-[8.5px] font-mono font-bold tracking-tight">
                TEMPEST
              </span>
            </Show>
          </div>

          {/* Skies Pill */}
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-black/40 border border-white/10 text-[9.5px] font-mono font-bold text-white/80">
            {(() => {
              const info = skiesInfo();
              const IconComp = info.icon;
              return (
                <>
                  <IconComp size={12} class={info.color} />
                  <span class="uppercase tracking-tight">{info.label}</span>
                </>
              );
            })()}
          </div>
        </div>

        {/* Telemetry Numbers Grid: AIR / TRACK / WIND / HUMIDITY */}
        <div class="grid grid-cols-4 px-2 py-2 gap-1 items-center bg-black/25 text-center">
          {/* 1. Air Temperature */}
          <div class="flex flex-col items-center justify-center px-1">
            <div class="flex items-center gap-1">
              <IconThermometer size={12} class="text-white/40 shrink-0" />
              <span class="f1-value text-base text-white tabular-nums">
                {activeData().airTemp.toFixed(1)}°
              </span>
            </div>
            <span class="f1-label mt-1 text-white/50">
              {t().weatherAir}
            </span>
          </div>

          {/* 2. Track Temperature */}
          <div class="flex flex-col items-center justify-center px-1 border-l border-white/10">
            <div class="flex items-center gap-1">
              <span
                class={`f1-value text-base tabular-nums ${
                  activeData().trackTemp >= 40
                    ? "text-[#f87171]"
                    : activeData().trackTemp >= 30
                    ? "text-[#fcd34d]"
                    : "text-[#38bdf8]"
                }`}
              >
                {activeData().trackTemp.toFixed(1)}°
              </span>
            </div>
            <div class="flex items-center gap-1 mt-1">
              <span class="f1-label text-white/50">
                {t().weatherTrack}
              </span>
              <span class="text-[8px] font-mono font-bold text-white/40 tabular-nums">
                {trackDelta()}
              </span>
            </div>
          </div>

          {/* 3. Wind Speed & Dynamic Compass Direction */}
          <div class="flex flex-col items-center justify-center px-1 border-l border-white/10">
            <div class="flex items-center gap-1">
              <span
                style={{
                  transform: `rotate(${activeData().windDir}deg)`,
                  display: "inline-block",
                  transition: "transform 300ms ease",
                }}
              >
                <IconCompass size={13} class="text-cyan-400 shrink-0" />
              </span>
              <span class="f1-value text-base text-white tabular-nums">
                {Math.round(activeData().windSpeed)}
              </span>
            </div>
            <span class="f1-label mt-1 text-white/50">
              {cardinalDir()} • {t().weatherWind}
            </span>
          </div>

          {/* 4. Relative Humidity */}
          <div class="flex flex-col items-center justify-center px-1 border-l border-white/10">
            <div class="flex items-center gap-1">
              <IconDroplet size={12} class="text-[#38bdf8]/70 shrink-0" />
              <span class="f1-value text-base text-white/90 tabular-nums">
                {Math.round(activeData().humidity)}%
              </span>
            </div>
            <span class="f1-label mt-1 text-white/50">
              {t().weatherHumidity}
            </span>
          </div>
        </div>

        {/* Tempest Track Surface & Rain Status Bar (Bottom Row) */}
        <div class="flex items-center justify-between px-3 py-1.5 bg-black/40 border-t border-white/10 gap-2">
          {/* Surface Wetness Pill + Tire Strategy Recommendation */}
          <div class="flex items-center gap-1.5">
            <span
              class={`px-2 py-0.5 rounded-[2px] text-[9.5px] font-black uppercase tracking-wider border f1-oblique ${
                wetnessMeta().badgeClass
              }`}
            >
              {wetnessMeta().label}
            </span>
            <span class="text-[9px] font-mono font-bold text-white/60 uppercase">
              TIRE: <span class="text-white font-black">{wetnessMeta().tire}</span>
            </span>
          </div>

          {/* Precipitation Rain Intensity Gauge */}
          <div class="flex items-center gap-1.5 shrink-0">
            <Show
              when={activeData().precip > 0}
              fallback={
                <span class="text-[9.5px] font-mono font-bold text-white/40 uppercase">
                  0% PRECIP
                </span>
              }
            >
              <div class="flex items-center gap-1.5">
                <IconCloudRain size={13} class="text-[#38bdf8] animate-bounce shrink-0" />
                <div class="flex flex-col items-end">
                  <span class="text-[10px] font-black font-mono text-[#38bdf8] tabular-nums f1-oblique leading-tight">
                    {Math.round(activeData().precip)}% RAIN
                  </span>
                  {/* Visual Rain Gauge - F1 Segmented Rectilinear Blocks */}
                  <div class="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: 8 }).map((_, i) => {
                      const active = () => activeData().precip >= (i + 1) * 12.5;
                      return (
                        <div
                          class={`w-1.5 h-1.5 rounded-[1px] transition-colors duration-150 ${
                            active()
                              ? i >= 6
                                ? "bg-[#2563EB]"
                                : "bg-[#38bdf8]"
                              : "bg-white/15"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>

      {/* Horizontal Resize Drag Handle (Edit Mode only) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleResizeMouseDown}
          class={`absolute -right-2 top-0 bottom-0 w-3 flex items-center justify-center cursor-ew-resize group z-30 ${
            isResizing() ? "pointer-events-none" : "pointer-events-auto"
          }`}
          title="마우스로 드래그하여 가로 너비 조절"
        >
          <div class="w-1.5 h-7 rounded-[1px] bg-white/30 group-hover:bg-[#E10600] group-hover:scale-110 transition-all shadow-sm" />
        </div>
      </Show>
    </div>
    </Show>
  );
};

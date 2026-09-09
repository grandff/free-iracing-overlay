import { Component, createSignal, createMemo, Show, For } from "solid-js";
import { ShiftLightTelemetry } from "../../services/telemetry/types";
import { ThemeType } from "../../stores/settingsStore";
import { t } from "../../i18n";

export interface ShiftLightProps {
  data?: ShiftLightTelemetry;
  theme?: ThemeType;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (scale: number) => void;
  onWidthChange?: (width: number) => void;
}

export type ShiftLightStyle = "f1" | "gt3" | "indycar";

export const ShiftLight: Component<ShiftLightProps> = (props) => {
  // Interactive test states for Edit Mode
  const [testRpmStep, setTestRpmStep] = createSignal<number>(0);
  const [activeStyle, setActiveStyle] = createSignal<ShiftLightStyle>("f1");

  // Cycle test RPM presets: 0 = live/auto, 1 = low, 2 = mid-high, 3 = shift point, 4 = redline blink, 5 = pit limiter
  const cycleRpmTest = (e: MouseEvent) => {
    e.stopPropagation();
    setTestRpmStep((prev) => (prev + 1) % 6);
  };

  const cycleStyle = (e: MouseEvent) => {
    e.stopPropagation();
    setActiveStyle((prev) => {
      if (prev === "f1") return "gt3";
      if (prev === "gt3") return "indycar";
      return "f1";
    });
  };

  // Resolved telemetry data (either live or test-mode override)
  const current = createMemo(() => {
    const step = testRpmStep();
    const live = props.data || {
      rpm: 11400,
      gear: 5,
      speedKmh: 245,
      firstRpm: 10500,
      shiftRpm: 12000,
      lastRpm: 12400,
      blinkRpm: 12500,
      pitLimiterActive: false,
      revLimiterActive: false,
    };

    if (step === 0) return live;

    if (step === 1) {
      // Low RPM (green LEDs only)
      return { ...live, rpm: 10800, gear: 4, speedKmh: 195, pitLimiterActive: false, revLimiterActive: false };
    }
    if (step === 2) {
      // Mid-High (green + red LEDs)
      return { ...live, rpm: 11850, gear: 5, speedKmh: 232, pitLimiterActive: false, revLimiterActive: false };
    }
    if (step === 3) {
      // Optimal shift point (green + red + blue LEDs)
      return { ...live, rpm: 12350, gear: 5, speedKmh: 260, pitLimiterActive: false, revLimiterActive: false };
    }
    if (step === 4) {
      // Redline flash strobe
      return { ...live, rpm: 12650, gear: 5, speedKmh: 275, pitLimiterActive: false, revLimiterActive: true };
    }
    // Step 5: Pit limiter mode
    return { ...live, rpm: 4200, gear: 1, speedKmh: 60, pitLimiterActive: true, revLimiterActive: false };
  });

  // Calculate LED states (15 LEDs total)
  // Motorsport standard: 5 Green, 5 Red, 5 Blue/Purple
  const leds = createMemo(() => {
    const d = current();
    const totalLeds = 15;
    const { rpm, firstRpm, lastRpm, blinkRpm, revLimiterActive, pitLimiterActive } = d;

    // Is flashing active?
    const isFlashing = revLimiterActive || rpm >= blinkRpm;

    // Fractions
    const span = Math.max(lastRpm - firstRpm, 1000);
    const progress = Math.max(0, Math.min(1, (rpm - firstRpm) / span));
    const litCount = Math.round(progress * totalLeds);

    return Array.from({ length: totalLeds }, (_, index) => {
      // Color group
      let colorType: "green" | "red" | "blue" = "green";
      if (index >= 10) {
        colorType = "blue";
      } else if (index >= 5) {
        colorType = "red";
      }

      // GT3 style: converging inwards from both sides (0..7 and 14..7)
      let isLit = false;
      if (activeStyle() === "gt3") {
        const distFromEdge = index < 8 ? index : totalLeds - 1 - index;
        const maxDist = Math.ceil(progress * 8);
        isLit = distFromEdge < maxDist;
      } else {
        // Standard left-to-right sequential
        isLit = index < litCount;
      }

      return {
        index,
        colorType,
        isLit,
        isFlashing,
        pitLimiterActive,
      };
    });
  });

  const displayGear = createMemo(() => {
    const g = current().gear;
    if (g === 0 || g === "0") return "N";
    if (g === -1 || g === "-1" || g === "R") return "R";
    return String(g);
  });

  const width = () => props.width ?? 420;

  return (
    <div
      class="flex flex-col select-none group/shiftlight transition-shadow"
      style={{
        width: `${width()}px`,
      }}
    >
      {/* Edit Mode Controls */}
      <Show when={props.isEditMode}>
        <div
          class="flex items-center justify-between px-2 py-1 mb-1.5 f1-slab text-[10px] text-white/80"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div class="flex items-center gap-1.5">
            <span class="f1-oblique text-[10px] text-white/80">{t().shiftLightTitle}</span>
          </div>

          <div class="flex items-center gap-1.5">
            {/* Style Switcher */}
            <button
              onClick={cycleStyle}
              class="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-[9px] f1-oblique text-white/80 transition-colors cursor-pointer"
              title="Switch HUD Theme Style"
            >
              {activeStyle().toUpperCase()}
            </button>

            {/* RPM Test Cycle */}
            <button
              onClick={cycleRpmTest}
              class={`px-1.5 py-0.5 text-[9px] f1-oblique transition-colors cursor-pointer ${
                testRpmStep() > 0
                  ? "bg-[#E10600]/15 text-white border border-[#E10600]/60"
                  : "bg-white/10 hover:bg-white/20 text-white/80 border border-transparent"
              }`}
              title="Test Different RPM Ranges"
            >
              {t().rpmTestBtn}: {testRpmStep() === 0 ? "LIVE" : `T${testRpmStep()}`}
            </button>

            {/* Scale adjustment */}
            <div class="flex items-center gap-1 ml-1">
              <button
                onClick={() => props.onScaleChange?.(Math.max(0.6, (props.scale ?? 1.0) - 0.05))}
                class="w-4 h-4 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 font-mono text-[10px]"
              >
                -
              </button>
              <span class="font-mono text-[9px] w-7 text-center">{Math.round((props.scale ?? 1.0) * 100)}%</span>
              <button
                onClick={() => props.onScaleChange?.(Math.min(2.0, (props.scale ?? 1.0) + 0.05))}
                class="w-4 h-4 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 font-mono text-[10px]"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Main Shift Light Housing */}
      <div
        class={`relative overflow-hidden f1-slab border-l-[3px] transition-all duration-150 ${
          current().pitLimiterActive
            ? "!bg-[#04101c]/92 border-l-[#0090FF] shadow-[0_0_20px_rgba(0,144,255,0.3)]"
            : current().revLimiterActive
            ? "!bg-[#150609]/92 border-l-[#E10600] shadow-[0_0_26px_rgba(225,6,0,0.5)]"
            : "border-l-[#E10600]"
        }`}
      >
        {/* Style A: F1 Curved Arch / Horizontal LED Ribbon */}
        <div class="px-2.5 pt-2 pb-2.5 flex flex-col gap-2.5">
          {/* LED Bar Row */}
          <div class="relative w-full flex items-center justify-between gap-[3px]">
            <For each={leds()}>
              {(led) => {
                // Color styles
                const isFlashing = led.isFlashing;
                const isPit = led.pitLimiterActive;

                let litBg = "bg-[#00D26A] shadow-[0_0_10px_#00D26A]";
                let offBg = "bg-[#00D26A]/10 border border-[#00D26A]/20";

                if (led.colorType === "red") {
                  litBg = "bg-[#E10600] shadow-[0_0_12px_#E10600]";
                  offBg = "bg-[#E10600]/10 border border-[#E10600]/20";
                } else if (led.colorType === "blue") {
                  litBg = "bg-[#B055F5] shadow-[0_0_12px_#B055F5]";
                  offBg = "bg-[#B055F5]/10 border border-[#B055F5]/20";
                }

                // Pit Limiter override
                if (isPit) {
                  litBg = "bg-[#0090FF] animate-pulse shadow-[0_0_12px_#0090FF]";
                }

                // Rev Limiter strobe override
                if (isFlashing) {
                  litBg = "bg-white shadow-[0_0_15px_#ffffff] animate-ping";
                }

                return (
                  <div
                    class={`flex-1 h-[9px] transition-all duration-75 ${
                      isFlashing
                        ? "bg-white shadow-[0_0_14px_#ffffff] scale-105"
                        : isPit
                        ? led.index % 2 === 0
                          ? "bg-[#0090FF] shadow-[0_0_10px_#0090FF]"
                          : "bg-[#FFD100] shadow-[0_0_10px_#FFD100]"
                        : led.isLit
                        ? litBg
                        : offBg
                    }`}
                  />
                );
              }}
            </For>
          </div>

          {/* Pit Limiter Banner Override */}
          <Show
            when={current().pitLimiterActive}
            fallback={
              /* F1 onboard telemetry row: value over micro-caps label,
                 hairline field dividers, bare oversize gear numeral. */
              <div class="flex items-stretch text-white">
                <div class="flex-1 flex flex-col items-center justify-center gap-1.5">
                  <span class="f1-value text-[24px] text-white">{current().speedKmh}</span>
                  <span class="f1-label">KM/H</span>
                </div>

                <div class="f1-divider my-1" />

                {/* The F1 steering-wheel signature: bare oversize gear, no box */}
                <div class="flex-1 flex flex-col items-center justify-center gap-1.5">
                  <span
                    class={`f1-value text-[34px] transition-colors ${
                      current().revLimiterActive
                        ? "text-[#E10600] animate-pulse"
                        : displayGear() === "N"
                        ? "text-[#00D26A]"
                        : displayGear() === "R"
                        ? "text-[#FFD100]"
                        : "text-white"
                    }`}
                  >
                    {displayGear()}
                  </span>
                  <span class="f1-label">GEAR</span>
                </div>

                <div class="f1-divider my-1" />

                <div class="flex-1 flex flex-col items-center justify-center gap-1.5">
                  <span
                    class={`f1-value text-[24px] ${
                      current().revLimiterActive ? "text-[#E10600] animate-pulse" : "text-white"
                    }`}
                  >
                    {current().rpm.toLocaleString()}
                  </span>
                  <span class="f1-label">RPM</span>
                </div>
              </div>
            }
          >
            {/* Pit limiter: solid accent band with black caps — the broadcast
                treatment for a mandated-state callout. */}
            <div class="flex items-center justify-between px-3 py-1.5 bg-[#0090FF]">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-black/70 animate-ping" />
                <span class="f1-oblique text-[12px] text-black">{t().pitLimiterText}</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="f1-value text-[20px] text-black">{current().speedKmh}</span>
                <span class="f1-oblique text-[9px] text-black/70">/ 60 KM/H</span>
              </div>
            </div>
          </Show>
        </div>

        {/* Style Badge / Accents */}
      </div>

      {/* Resize Handle (Edit Mode) */}
      <Show when={props.isEditMode}>
        <div
          class="h-2 w-full mt-1 flex items-center justify-center cursor-ew-resize opacity-40 hover:opacity-100 transition-opacity"
          onMouseDown={(e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startW = width();
            const handleMouseMove = (moveEvt: MouseEvent) => {
              const delta = (moveEvt.clientX - startX) * 2; // symmetric resizing
              const newW = Math.max(300, Math.min(680, Math.round(startW + delta)));
              props.onWidthChange?.(newW);
            };
            const handleMouseUp = () => {
              window.removeEventListener("mousemove", handleMouseMove);
              window.removeEventListener("mouseup", handleMouseUp);
            };
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
          }}
        >
          <div class="w-10 h-1 rounded-full bg-white/40" />
        </div>
      </Show>
    </div>
  );
};

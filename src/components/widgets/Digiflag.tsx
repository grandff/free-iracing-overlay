import { Component, Show, createSignal, createMemo, onCleanup, For } from "solid-js";
import { IRSDK_FLAGS } from "../../services/telemetry/types.ts";
import { IconCheckeredFlag } from "../../assets/icons/Icons.tsx";
import { t } from "../../i18n/index.ts";

export type DigiflagType =
  | "none"
  | "checkered"
  | "yellow"
  | "yellowWaving"
  | "caution"
  | "blue"
  | "repair"
  | "black"
  | "white"
  | "green"
  | "red";

export interface DigiflagProps {
  sessionFlags?: number;
  approachingCarNumber?: string;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
}

const DIGIFLAG_LEDS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/**
 * High-end aerodynamic waving flag graphic adhering to official F1 World-Feed
 * broadcast and trackside marshaling standards.
 * Features an undulating 3D silk cloth wave, metallic flagpole, golden finial,
 * and realistic depth shading overlay.
 */
const F1WavingFlag: Component<{ flag: DigiflagType; class?: string }> = (props) => {
  const flagColor = () => {
    switch (props.flag) {
      case "yellow":
      case "yellowWaving":
      case "caution":
        return "#FFD100";
      case "blue":
        return "#0070F3";
      case "red":
        return "#E10600";
      case "green":
        return "#00D26A";
      case "repair":
        return "#111115";
      case "black":
        return "#0F172A";
      case "white":
        return "#F8FAFC";
      case "checkered":
      default:
        return "#FFFFFF";
    }
  };

  const isCheckered = () => props.flag === "checkered";
  const isMeatball = () => props.flag === "repair";
  const isBlack = () => props.flag === "black";

  // Aerodynamic cloth path with flowing bezier wave undulation
  const clothPath =
    "M 6,6 C 26,14 48,-2 70,6 C 82,10 94,4 100,8 C 97,24 101,40 98,52 C 78,46 58,60 38,50 C 24,44 14,54 6,48 Z";

  return (
    <div class={`relative flex items-center justify-center select-none ${props.class ?? ""}`}>
      {/* Dynamic ambient color glow behind flag */}
      <div
        class="absolute inset-0 blur-lg rounded-full opacity-35 pointer-events-none"
        style={{
          "background-color": isCheckered() ? "#EAB308" : flagColor(),
        }}
      />

      <div class="relative animate-f1-pole flex items-center">
        {/* Metallic Flagpole with Golden Finial */}
        <div class="relative flex items-center shrink-0">
          <div class="w-1.5 h-18 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-full shadow-md transform -rotate-6 origin-bottom-left" />
          <div class="absolute -top-1 left-[-2px] w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-yellow-600 via-yellow-300 to-yellow-100 shadow-[0_0_8px_#FFD100]" />
        </div>

        {/* 3D Undulating Waving Cloth */}
        <div class="relative -ml-1 animate-f1-flag-flutter origin-left">
          <svg
            viewBox="0 0 106 60"
            class="w-24 h-16 drop-shadow-[0_8px_14px_rgba(0,0,0,0.85)] overflow-visible"
          >
            <defs>
              {/* Dynamic Fabric Wave Highlights & Shadow Troughs */}
              <linearGradient id="f1-flag-shade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.32" />
                <stop offset="22%" stop-color="#000000" stop-opacity="0.3" />
                <stop offset="48%" stop-color="#FFFFFF" stop-opacity="0.38" />
                <stop offset="72%" stop-color="#000000" stop-opacity="0.28" />
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.25" />
              </linearGradient>

              {/* Crisp 6x4 F1 Checkered Pattern */}
              <pattern id="f1-flag-checkers" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#FFFFFF" />
                <rect x="8" width="8" height="8" fill="#090D16" />
                <rect y="8" width="8" height="8" fill="#090D16" />
                <rect x="8" y="8" width="8" height="8" fill="#FFFFFF" />
              </pattern>

              <clipPath id="f1-flag-cloth-clip">
                <path d={clothPath} />
              </clipPath>
            </defs>

            {/* Base Cloth with Pattern or Solid Racing Color */}
            <path
              d={clothPath}
              fill={isCheckered() ? "url(#f1-flag-checkers)" : flagColor()}
              stroke="rgba(255,255,255,0.2)"
              stroke-width="0.75"
            />

            {/* Meatball Orange Circle (clipped to cloth wave) */}
            <Show when={isMeatball()}>
              <g clip-path="url(#f1-flag-cloth-clip)">
                <circle
                  cx="52"
                  cy="29"
                  r="13"
                  fill="#FF6600"
                  stroke="#FF9800"
                  stroke-width="2"
                  class="drop-shadow-[0_0_8px_rgba(255,102,0,0.9)]"
                />
              </g>
            </Show>

            {/* Black Flag White Penalty Stripe (clipped to cloth wave) */}
            <Show when={isBlack()}>
              <g clip-path="url(#f1-flag-cloth-clip)">
                <polygon points="20,54 36,54 84,6 68,6" fill="#F8FAFC" opacity="0.9" />
              </g>
            </Show>

            {/* 3D Fabric Shading & Specular Highlights */}
            <path
              d={clothPath}
              fill="url(#f1-flag-shade)"
              style={{ "mix-blend-mode": "multiply" }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const Digiflag: Component<DigiflagProps> = (props) => {
  // Width control: default 280px, min 200px, max 460px
  const currentWidth = () => Math.max(200, Math.min(460, props.width ?? 280));

  // Edit mode test switcher:
  // 0: LIVE (reads incoming live telemetry sessionFlags)
  // 1: CHECKERED (Chequered flag finish)
  // 2: YELLOW WAVING (Local caution)
  // 3: BLUE FLAG (Faster car approaching)
  // 4: MEATBALL (Mandatory repair)
  // 5: BLACK FLAG (Penalty)
  // 6: WHITE FLAG (Final lap)
  // 7: GREEN FLAG (Track clear)
  // 8: RED FLAG (Session suspended)
  // 9: OFF (No flag ghost view)
  const [testStep, setTestStep] = createSignal<number>(0);

  const activeFlag = createMemo<DigiflagType>(() => {
    if (props.isEditMode) {
      switch (testStep()) {
        case 1: return "checkered";
        case 2: return "yellowWaving";
        case 3: return "blue";
        case 4: return "repair";
        case 5: return "black";
        case 6: return "white";
        case 7: return "green";
        case 8: return "red";
        case 9: return "none";
        case 0:
        default:
          break;
      }
    }

    const flags = props.sessionFlags ?? 0;
    if (flags & IRSDK_FLAGS.checkered) return "checkered";
    if (flags & IRSDK_FLAGS.red) return "red";
    if (flags & IRSDK_FLAGS.repair) return "repair";
    if (flags & (IRSDK_FLAGS.black | IRSDK_FLAGS.disqualify)) return "black";
    if (flags & IRSDK_FLAGS.yellowWaving) return "yellowWaving";
    if (flags & IRSDK_FLAGS.caution) return "caution";
    if (flags & IRSDK_FLAGS.yellow) return "yellow";
    if (flags & IRSDK_FLAGS.blue) return "blue";
    if (flags & IRSDK_FLAGS.white) return "white";
    if (flags & (IRSDK_FLAGS.green | IRSDK_FLAGS.startGo)) return "green";

    return "none";
  });

  const cycleTest = (e: MouseEvent) => {
    e.stopPropagation();
    setTestStep((prev) => (prev + 1) % 10);
  };

  const testLabel = createMemo(() => {
    switch (testStep()) {
      case 0: return "LIVE";
      case 1: return "CHECKERED";
      case 2: return "YELLOW";
      case 3: return "BLUE";
      case 4: return "MEATBALL";
      case 5: return "BLACK";
      case 6: return "WHITE";
      case 7: return "GREEN";
      case 8: return "RED";
      case 9: return "OFF";
      default: return "TEST";
    }
  });

  // Flag visual meta configuration
  const flagMeta = createMemo(() => {
    switch (activeFlag()) {
      case "checkered":
        return {
          title: t().flagCheckered,
          subtitle: t().flagFinish,
          badge: "FINISH",
          color: "#FFFFFF",
          accentBorder: "border-l-4 border-l-white",
          glowShadow: "shadow-[0_0_24px_rgba(255,255,255,0.35)]",
          ledColor: "#FFFFFF",
          pulse: false,
        };
      case "yellow":
        return {
          title: t().flagYellow,
          subtitle: "SLOW DOWN • NO OVERTAKING",
          badge: "CAUTION",
          color: "#FFD100",
          accentBorder: "border-l-4 border-l-[#FFD100]",
          glowShadow: "shadow-[0_0_26px_rgba(255,209,0,0.45)]",
          ledColor: "#FFD100",
          pulse: false,
        };
      case "yellowWaving":
        return {
          title: t().flagYellowWaving,
          subtitle: "HAZARD ON TRACK • PREPARE TO STOP",
          badge: "DOUBLE YELLOW",
          color: "#FFD100",
          accentBorder: "border-l-4 border-l-[#FFD100]",
          glowShadow: "shadow-[0_0_28px_rgba(255,209,0,0.55)]",
          ledColor: "#FFD100",
          pulse: true,
        };
      case "caution":
        return {
          title: t().flagCaution,
          subtitle: "SAFETY CAR DEPLOYED",
          badge: "SAFETY CAR",
          color: "#FFD100",
          accentBorder: "border-l-4 border-l-[#FFD100]",
          glowShadow: "shadow-[0_0_26px_rgba(255,209,0,0.45)]",
          ledColor: "#FFD100",
          pulse: true,
        };
      case "blue":
        return {
          title: t().flagBlue,
          subtitle: t().flagFasterCar,
          badge: "GIVE WAY",
          color: "#38BDF8",
          accentBorder: "border-l-4 border-l-[#0070F3]",
          glowShadow: "shadow-[0_0_26px_rgba(0,112,243,0.45)]",
          ledColor: "#0070F3",
          pulse: false,
        };
      case "repair":
        return {
          title: t().flagMeatball,
          subtitle: "PIT IMMEDIATELY FOR REPAIRS",
          badge: "MEATBALL",
          color: "#FB923C",
          accentBorder: "border-l-4 border-l-[#FF6600]",
          glowShadow: "shadow-[0_0_26px_rgba(255,102,0,0.45)]",
          ledColor: "#FF6600",
          pulse: true,
        };
      case "black":
        return {
          title: t().flagBlack,
          subtitle: "SERVE PENALTY IN PIT LANE",
          badge: "PENALTY",
          color: "#E2E8F0",
          accentBorder: "border-l-4 border-l-white/60",
          glowShadow: "shadow-[0_0_20px_rgba(255,255,255,0.25)]",
          ledColor: "#FFFFFF",
          pulse: false,
        };
      case "white":
        return {
          title: t().flagWhite,
          subtitle: "FINAL LAP / SLOW VEHICLE",
          badge: "FINAL LAP",
          color: "#F8FAFC",
          accentBorder: "border-l-4 border-l-slate-200",
          glowShadow: "shadow-[0_0_24px_rgba(255,255,255,0.35)]",
          ledColor: "#FFFFFF",
          pulse: false,
        };
      case "green":
        return {
          title: t().flagGreen,
          subtitle: "TRACK CLEAR • RACING RESUMED",
          badge: "GO!",
          color: "#34D399",
          accentBorder: "border-l-4 border-l-[#00D26A]",
          glowShadow: "shadow-[0_0_26px_rgba(0,210,106,0.45)]",
          ledColor: "#00D26A",
          pulse: false,
        };
      case "red":
        return {
          title: t().flagRed,
          subtitle: "STOP RACING • ENTER PIT LANE",
          badge: "SUSPENDED",
          color: "#EF4444",
          accentBorder: "border-l-4 border-l-[#E10600]",
          glowShadow: "shadow-[0_0_32px_rgba(225,6,0,0.65)]",
          ledColor: "#E10600",
          pulse: true,
        };
      case "none":
      default:
        return null;
    }
  });

  // Mouse Drag Resizing
  const [isResizing, setIsResizing] = createSignal(false);
  let startX = 0;
  let startW = 280;

  const onMouseDownResize = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    startX = e.clientX;
    startW = currentWidth();

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const targetW = Math.max(200, Math.min(460, Math.round(startW + deltaX)));
      if (props.onWidthChange) {
        props.onWidthChange(targetW);
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  onCleanup(() => {
    setIsResizing(false);
  });

  return (
    <div
      class="relative flex flex-col font-sans select-none"
      style={{
        width: `${currentWidth()}px`,
      }}
    >
      {/* Edit Mode Control Bar */}
      <Show when={props.isEditMode}>
        <div class="w-full flex items-center justify-end px-2 py-1 mb-1.5 bg-black/85 rounded border border-white/20 text-[10px] font-mono text-white/80 z-30 shadow-lg">
          <div class="flex items-center gap-1">
            <button
              onClick={cycleTest}
              class="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 active:scale-95 text-[#FFD100] font-black tracking-wider transition-colors"
              title={t().flagTestBtn}
            >
              {testLabel()}
            </button>

            {/* Scale +/- Controls */}
            <div class="flex items-center gap-0.5 bg-white/5 rounded px-1 border border-white/10 ml-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onScaleChange?.(Math.max(0.7, Number(((props.scale ?? 1.0) - 0.05).toFixed(2))));
                }}
                class="hover:text-white px-1 font-bold text-white/60 active:scale-90"
              >
                -
              </button>
              <span class="text-[9px] tabular-nums text-white/90 min-w-[28px] text-center">
                {Math.round((props.scale ?? 1.0) * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onScaleChange?.(Math.min(1.5, Number(((props.scale ?? 1.0) + 0.05).toFixed(2))));
                }}
                class="hover:text-white px-1 font-bold text-white/60 active:scale-90"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Main Flag Body */}
      <Show
        when={activeFlag() !== "none" && flagMeta()}
        fallback={
          <Show when={props.isEditMode}>
            {/* Ghost frame when no flag is active in Edit Mode */}
            <div class="w-full h-24 rounded border border-dashed border-white/30 bg-black/40 flex flex-col items-center justify-center text-white/40 font-mono text-xs gap-1.5 shadow-inner">
              <IconCheckeredFlag size={24} class="opacity-40" />
              <span class="tracking-widest uppercase text-[10px] font-bold">DIGIFLAG • NO ACTIVE FLAGS</span>
            </div>
          </Show>
        }
      >
        {(meta) => (
          <div
            class={`w-full relative overflow-hidden rounded bg-[rgb(12_14_20_/_var(--hud-bg-alpha,0.95))] border border-white/15 p-2.5 transition-all ${
              meta().accentBorder
            } ${meta().glowShadow} ${meta().pulse ? "animate-pulse" : ""}`}
          >
            {/* Top High-Intensity FIA LED Light Bar */}
            <div class="w-full flex items-center justify-between px-1 mb-2">
              <For each={DIGIFLAG_LEDS}>
                {(_) => (
                  <div
                    class="w-2 h-2 rounded-full animate-digiflag-led shadow-sm"
                    style={{
                      "background-color": meta().ledColor,
                      "box-shadow": `0 0 8px ${meta().ledColor}`,
                    }}
                  />
                )}
              </For>
            </div>

            {/* Middle: Flag Visual + F1 Broadcast Typography Lockup */}
            <div class="flex items-center gap-3">
              {/* Authentic F1 Waving Flag Graphic */}
              <div class="shrink-0 w-24 h-16 flex items-center justify-center">
                <F1WavingFlag flag={activeFlag()} />
              </div>

              {/* F1 Information Block */}
              <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="flex items-center gap-1.5">
                  <span
                    class="text-sm sm:text-base font-black f1-oblique tracking-wider uppercase truncate leading-tight"
                    style={{ color: meta().color }}
                  >
                    {meta().title}
                  </span>
                </div>

                <span class="text-[9px] sm:text-[10px] font-bold tracking-wider text-white/80 uppercase truncate mt-0.5">
                  {meta().subtitle}
                </span>

                {/* Approaching Car Tag (Blue Flag specific) */}
                <Show when={activeFlag() === "blue" && props.approachingCarNumber}>
                  <div class="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/25 border border-blue-400/40 text-[9px] font-mono font-black text-blue-200 w-fit">
                    <span>APPROACHING:</span>
                    <span class="text-white font-bold">#{props.approachingCarNumber}</span>
                  </div>
                </Show>
              </div>
            </div>

            {/* Bottom Status Ribbon */}
            <div class="w-full flex items-center justify-between border-t border-white/10 pt-1.5 mt-2">
              <div class="flex items-center gap-1.5">
                <span
                  class="w-2 h-2 rounded-full animate-ping"
                  style={{ "background-color": meta().ledColor }}
                />
                <span class="text-[9px] font-mono tracking-widest text-white/60 uppercase">
                  FIA MARSHAL
                </span>
              </div>
              <span
                class="text-[9px] font-mono font-black px-1.5 py-0.2 rounded border uppercase tracking-wider"
                style={{
                  color: meta().color,
                  "border-color": `${meta().ledColor}40`,
                  "background-color": `${meta().ledColor}15`,
                }}
              >
                {meta().badge}
              </span>
            </div>
          </div>
        )}
      </Show>

      {/* Resize Handle for Edit Mode */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={onMouseDownResize}
          class={`absolute right-[-6px] top-1/2 -translate-y-1/2 w-3.5 h-12 rounded-r flex items-center justify-center cursor-ew-resize transition-colors ${
            isResizing() ? "bg-[#FFD100] shadow-[0_0_12px_#FFD100]" : "bg-white/20 hover:bg-white/40"
          }`}
          title="Drag to resize width (200px ~ 460px)"
        >
          <div class="w-0.5 h-6 bg-white/70 rounded-full" />
        </div>
      </Show>
    </div>
  );
};

// ponytail: native SVG getPointAtLength and pathLength="100" stroke-dasharray for zero-dep track mapping
import { Component, For, Show, createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import { SectorStatus, SectorColor, HazardTelemetry, RevengeTelemetry } from "../../services/telemetry/types.ts";
import { getTrackLayout, TRACK_PRESETS, TrackLayout } from "../../services/track/trackPresets.ts";
import { IconPit } from "../../assets/icons/Icons.tsx";
import { Flag } from "lucide-solid";
import { t } from "../../i18n/index.ts";

export interface TrackMapCar {
  carIdx: number;
  carNumber: string;
  driverName?: string;
  lapDistPct: number;
  color: string;
  isPlayer?: boolean;
  inPit?: boolean;
  trackSurface?: number; // 0=OffTrack, 1=InPitLane, 2=InPitStall, 3=OnTrack
}

export interface TrackMapProps {
  cars?: TrackMapCar[];
  trackName?: string;
  sectors?: SectorStatus[];
  currentSector?: 1 | 2 | 3;
  hazard?: HazardTelemetry;
  revenge?: RevengeTelemetry;
  yellowFlag?: boolean;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
}

const PRESET_KEYS = Object.keys(TRACK_PRESETS);

function getSectorColorCode(status: SectorColor): string {
  switch (status) {
    case "purple":
      return "#b034e5";
    case "green":
      return "#00d26a";
    case "yellow":
      return "#ffd100";
    default:
      return "#404354";
  }
}

const defaultCars: TrackMapCar[] = [
  { carIdx: 1, carNumber: "7", driverName: "K. Jeongmin", lapDistPct: 0.42, color: "#00d2ff", isPlayer: true },
  { carIdx: 2, carNumber: "1", driverName: "M. Verstappen", lapDistPct: 0.46, color: "#3671C6" },
  { carIdx: 3, carNumber: "16", driverName: "C. Leclerc", lapDistPct: 0.40, color: "#E8002D" },
  { carIdx: 4, carNumber: "4", driverName: "L. Norris", lapDistPct: 0.36, color: "#FF8000" },
  { carIdx: 5, carNumber: "44", driverName: "L. Hamilton", lapDistPct: 0.28, color: "#27F4D2" },
  { carIdx: 6, carNumber: "55", driverName: "C. Sainz", lapDistPct: 0.72, color: "#E8002D" },
  { carIdx: 7, carNumber: "81", driverName: "O. Piastri", lapDistPct: 0.85, color: "#FF8000" },
  { carIdx: 8, carNumber: "63", driverName: "G. Russell", lapDistPct: 0.15, color: "#27F4D2", inPit: true },
];

export const TrackMap: Component<TrackMapProps> = (props) => {
  // Width control: default 460px, min 380px, max 680px
  const currentWidth = () => Math.max(380, Math.min(680, props.width ?? 460));

  // Edit Mode Test States
  const [testTrackIndex, setTestTrackIndex] = createSignal<number | null>(null);
  const [testHazardActive, setTestHazardActive] = createSignal(false);
  const [isResizing, setIsResizing] = createSignal(false);

  // SVG Reference for native getPointAtLength calculation
  const [pathElement, setPathElement] = createSignal<SVGPathElement | undefined>(undefined);

  // Layout resolution: matches iRacing session track or edit-mode override
  const currentLayout = createMemo<TrackLayout>(() => {
    if (props.isEditMode && testTrackIndex() !== null) {
      const key = PRESET_KEYS[testTrackIndex()!];
      return TRACK_PRESETS[key] || TRACK_PRESETS.spa;
    }
    return getTrackLayout(props.trackName);
  });

  // Effective Cars list
  const cars = () => props.cars || defaultCars;

  // Effective Hazard Info
  const activeHazard = createMemo(() => {
    if (props.isEditMode && testHazardActive()) {
      return {
        hasIncident: true,
        incidentCarNumber: "42",
        incidentSector: 2,
        incidentLapDistPct: 0.21,
      };
    }
    return props.hazard;
  });

  // Active Sectors data
  const s1Status = () => props.sectors?.find((s) => s.sectorNumber === 1)?.status || "purple";
  const s2Status = () => props.sectors?.find((s) => s.sectorNumber === 2)?.status || "green";
  const s3Status = () => props.sectors?.find((s) => s.sectorNumber === 3)?.status || "yellow";
  const currentSec = () => props.currentSector || 2;

  // Native SVG point calculator (C++ browser engine, zero allocation)
  const getCoordinates = (pct: number) => {
    const el = pathElement();
    if (!el) return { x: 200, y: 150, angle: 0 };

    try {
      const len = el.getTotalLength();
      const clampedPct = (((pct % 1.0) + 1.0) % 1.0);
      const p = el.getPointAtLength(clampedPct * len);

      // Tangent angle for orienting direction indicator
      const nextPct = (clampedPct + 0.005) % 1.0;
      const pNext = el.getPointAtLength(nextPct * len);
      const angle = Math.atan2(pNext.y - p.y, pNext.x - p.x) * (180 / Math.PI);

      return { x: p.x, y: p.y, angle };
    } catch {
      return { x: 200, y: 150, angle: 0 };
    }
  };

  // Tight viewBox measured from the path itself. The presets draw inside a loose
  // 400x300 canvas, so the preset viewBox letterboxed the circuit down to roughly
  // half the widget. Padding leaves room for the car-number badges above the dots.
  const [viewBox, setViewBox] = createSignal(currentLayout().viewBox);
  createEffect(() => {
    const layout = currentLayout();
    const el = pathElement();
    if (!el) return;
    const b = el.getBBox();
    if (!b.width || !b.height) return setViewBox(layout.viewBox);
    const pad = 24;
    setViewBox(`${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
  });

  // Start/Finish Line Point
  const sfCoords = () => getCoordinates(0.0);

  // Sector Splits Points
  const s2SplitCoords = () => getCoordinates(currentLayout().sectorSplits[0]);
  const s3SplitCoords = () => getCoordinates(currentLayout().sectorSplits[1]);

  // Sector Stroke Lengths (SVG pathLength="100")
  const s1Len = () => currentLayout().sectorSplits[0] * 100;
  const s2Len = () => (currentLayout().sectorSplits[1] - currentLayout().sectorSplits[0]) * 100;
  const s3Len = () => (1.0 - currentLayout().sectorSplits[1]) * 100;

  // Horizontal Resize Drag Handler
  let startX = 0;
  let startWidth = 0;

  const handleResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    startX = e.clientX;
    startWidth = currentWidth();

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = (ev.clientX - startX) / (props.scale || 1);
      const newWidth = Math.round(Math.max(380, Math.min(680, startWidth + deltaX)));
      props.onWidthChange?.(newWidth);
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
    window.removeEventListener("mousemove", () => {});
    window.removeEventListener("mouseup", () => {});
  });

  return (
    <div
      class="relative flex flex-col font-sans select-none"
      style={{
        width: `${currentWidth()}px`,
      }}
    >
      {/* Edit Mode Top Control Bar */}
      <Show when={props.isEditMode}>
        <div class="flex items-center justify-between px-3 py-1 f1-slab border-b-0 text-white select-none gap-1.5">
          {/* Test Hazard Switcher */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTestHazardActive((prev) => !prev);
            }}
            class={`px-2 py-0.5 text-[10px] f1-oblique cursor-pointer transition-all active:scale-95 border ${
              testHazardActive()
                ? "bg-[#FFD100] text-black border-[#FFD100]"
                : "bg-[#E10600]/15 hover:bg-[#E10600]/25 text-white border-[#E10600]/60"
            }`}
            title="사고 지점 비콘 시뮬레이션 토글"
          >
            {t().testHazardBtn} {testHazardActive() ? "ON" : "OFF"}
          </button>

          {/* Test Track Switcher */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTestTrackIndex((prev) => (prev === null ? 1 : (prev + 1) % PRESET_KEYS.length));
            }}
            class="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 text-[10px] f1-oblique cursor-pointer transition-all active:scale-95 truncate max-w-[100px]"
            title="테스트 트랙 레이아웃 전환"
          >
            {currentLayout().shortName}
          </button>

          {/* Scale Adjuster */}
          <div class="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onScaleChange?.(Math.max(0.7, (props.scale || 1) - 0.1));
              }}
              class="w-5 h-5 rounded bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer transition-all border border-white/15"
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
              class="w-5 h-5 rounded bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer transition-all border border-white/15"
              title="확대"
            >
              +
            </button>
          </div>
        </div>
      </Show>

      {/* Main 2D Track Map Card */}
      <div
        class={`relative flex flex-col transition-all duration-150 ${
          props.isEditMode
            ? "border-b border-x border-white/10 hud-surface-deep backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        {/* 2D Circuit SVG Viewport */}
        <div class="relative w-full p-2 flex items-center justify-center">
          <svg
            viewBox={viewBox()}
            class="w-full h-[300px] overflow-visible drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
          >
            <defs>
              {/* Glowing Filters */}
              <filter id="track-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="track-glow-amber" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Underlying Path Reference for Native Point Calculation */}
            <path
              ref={(el) => {
                setPathElement(el);
              }}
              d={currentLayout().trackPath}
              fill="none"
              stroke="transparent"
              stroke-width="1"
            />

            {/* 2. Track Base Line (Dark Asphalt & Outer Rim) */}
            <path
              d={currentLayout().trackPath}
              fill="none"
              stroke="#05070b"
              stroke-width="11"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.9"
            />
            <path
              d={currentLayout().trackPath}
              fill="none"
              stroke="#E4E7EF"
              stroke-width="5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            {/* 3. 3-Sector Live Color Segments (pathLength="100") */}
            {/* Sector 1 Segment */}
            <path
              d={currentLayout().trackPath}
              pathLength="100"
              fill="none"
              stroke={getSectorColorCode(s1Status())}
              stroke-width={currentSec() === 1 ? "4.5" : "3.0"}
              stroke-dasharray={`${s1Len()} 100`}
              stroke-dashoffset="0"
              stroke-linecap="round"
              stroke-linejoin="round"
              class={currentSec() === 1 ? "opacity-100" : "opacity-80"}
            />

            {/* Sector 2 Segment */}
            <path
              d={currentLayout().trackPath}
              pathLength="100"
              fill="none"
              stroke={
                activeHazard()?.hasIncident && activeHazard()?.incidentSector === 2
                  ? "#ffd100"
                  : getSectorColorCode(s2Status())
              }
              stroke-width={currentSec() === 2 ? "4.5" : "3.0"}
              stroke-dasharray={`${s2Len()} 100`}
              stroke-dashoffset={`-${s1Len()}`}
              stroke-linecap="round"
              stroke-linejoin="round"
              class={
                activeHazard()?.hasIncident && activeHazard()?.incidentSector === 2
                  ? "animate-pulse"
                  : currentSec() === 2
                  ? "opacity-100"
                  : "opacity-80"
              }
            />

            {/* Sector 3 Segment */}
            <path
              d={currentLayout().trackPath}
              pathLength="100"
              fill="none"
              stroke={getSectorColorCode(s3Status())}
              stroke-width={currentSec() === 3 ? "4.5" : "3.0"}
              stroke-dasharray={`${s3Len()} 100`}
              stroke-dashoffset={`-${s1Len() + s2Len()}`}
              stroke-linecap="round"
              stroke-linejoin="round"
              class={currentSec() === 3 ? "opacity-100" : "opacity-80"}
            />

            {/* 4. Start / Finish Line Checkered Marker */}
            <g transform={`translate(${sfCoords().x}, ${sfCoords().y}) rotate(${sfCoords().angle + 90})`}>
              <For each={[0, 1, 2, 3, 4, 5]}>
                {(col) => (
                  <For each={[0, 1]}>
                    {(row) => (
                      <rect
                        x={-7.5 + col * 2.5}
                        y={-2.5 + row * 2.5}
                        width="2.5"
                        height="2.5"
                        fill={(col + row) % 2 === 0 ? "#ffffff" : "#0a0c11"}
                      />
                    )}
                  </For>
                )}
              </For>
            </g>

            {/* 5. Sector Split Visual Indicators [ S1 | S2 | S3 ] */}
            <g transform={`translate(${sfCoords().x + 10}, ${sfCoords().y - 9})`}>
              <rect x="-8" y="-5.5" width="16" height="11" fill="#0a0c11" fill-opacity="0.9" />
              <rect x="-8" y="4" width="16" height="1.5" fill="#E10600" />
              <text
                x="0"
                y="2"
                text-anchor="middle"
                font-size="7"
                font-weight="900"
                font-style="italic"
                fill="#ffffff"
              >
                S/F
              </text>
            </g>
            <g transform={`translate(${s2SplitCoords().x}, ${s2SplitCoords().y}) rotate(${s2SplitCoords().angle + 90})`}>
              <rect x="-4.5" y="-1" width="9" height="2" fill="#ffffff" stroke="#0a0c11" stroke-width="0.6" />
            </g>
            <g transform={`translate(${s3SplitCoords().x}, ${s3SplitCoords().y}) rotate(${s3SplitCoords().angle + 90})`}>
              <rect x="-4.5" y="-1" width="9" height="2" fill="#ffffff" stroke="#0a0c11" stroke-width="0.6" />
            </g>

            {/* 6. Competitor Cars Layer */}
            <For each={cars().filter((c) => !c.isPlayer)}>
              {(c) => {
                const pos = () => getCoordinates(c.lapDistPct);
                const isInPit = () => c.inPit || c.trackSurface === 1 || c.trackSurface === 2;

                return (
                  <g
                    transform={`translate(${pos().x}, ${pos().y})`}
                    class={`transition-transform duration-75 ${isInPit() ? "opacity-40" : "opacity-95"}`}
                  >
                    <rect
                      x="-3.6"
                      y="-3.6"
                      width="7.2"
                      height="7.2"
                      fill={c.color}
                      stroke="#0a0c11"
                      stroke-width="1"
                    />
                    <Show when={!isInPit()}>
                      <text
                        y="-6"
                        text-anchor="middle"
                        fill="#ffffff"
                        font-size="7"
                        font-weight="900"
                        font-style="italic"
                        class="drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] select-none"
                      >
                        {c.carNumber}
                      </text>
                    </Show>
                    <Show when={isInPit()}>
                      <g transform="translate(0, -6) scale(0.6)">
                        <IconPit size={10} class="text-[#ff9f0a]" />
                      </g>
                    </Show>
                  </g>
                );
              }}
            </For>

            {/* 7. Incident Hazard Beacon (사고 발생 지점) */}
            <Show when={activeHazard()?.hasIncident && activeHazard()?.incidentLapDistPct !== undefined}>
              {(() => {
                const hz = activeHazard()!;
                const hPos = () => getCoordinates(hz.incidentLapDistPct ?? 0.21);

                return (
                  <g transform={`translate(${hPos().x}, ${hPos().y})`} class="z-40">
                    {/* Animated Warning Waves */}
                    <circle r="14" fill="#ffd100" opacity="0.3" class="animate-ping" />
                    <circle r="9" fill="#ffd100" opacity="0.6" class="animate-pulse" />
                    {/* Diamond Badge */}
                    <rect
                      x="-6"
                      y="-6"
                      width="12"
                      height="12"
                      transform="rotate(45)"
                      fill="#FFD100"
                      stroke="#0a0c11"
                      stroke-width="1.5"
                    />
                    <text
                      y="3"
                      text-anchor="middle"
                      fill="#000000"
                      font-size="9"
                      font-weight="900"
                      font-family="sans-serif"
                    >
                      !
                    </text>

                    {/* Hazard Car Tag */}
                    <g transform="translate(0, -12)">
                      <rect
                        x="-14"
                        y="-6"
                        width="28"
                        height="11"
                        fill="#FFD100"
                        stroke="#0a0c11"
                        stroke-width="1"
                      />
                      <text
                        y="2.5"
                        text-anchor="middle"
                        fill="#000000"
                        font-size="7"
                        font-weight="900"
                        font-style="italic"
                      >
                        #{hz.incidentCarNumber}
                      </text>
                    </g>
                  </g>
                );
              })()}
            </Show>

            {/* 8. Revenge Target Tactical Crosshair (리벤지 타깃 조준선) */}
            <Show when={props.revenge?.hasTarget && props.revenge?.lapDistPct !== undefined}>
              {(() => {
                const rev = props.revenge!;
                const rPos = () => getCoordinates(rev.lapDistPct ?? 0.46);

                return (
                  <g transform={`translate(${rPos().x}, ${rPos().y})`} class="z-50">
                    {/* Pulsing Tactical Ring */}
                    <circle r="12" fill="none" stroke="#E10600" stroke-width="1.5" opacity="0.8" class="animate-ping" />
                    <circle r="8" fill="#E10600" fill-opacity="0.25" stroke="#E10600" stroke-width="1.2" />

                    {/* Crosshair 4-way Ticks */}
                    <line x1="-11" y1="0" x2="-4" y2="0" stroke="#ffffff" stroke-width="1.2" />
                    <line x1="4" y1="0" x2="11" y2="0" stroke="#ffffff" stroke-width="1.2" />
                    <line x1="0" y1="-11" x2="0" y2="-4" stroke="#ffffff" stroke-width="1.2" />
                    <line x1="0" y1="4" x2="0" y2="11" stroke="#ffffff" stroke-width="1.2" />

                    {/* Revenge Reticle Label */}
                    <g transform="translate(0, -13)">
                      <rect
                        x="-18"
                        y="-6"
                        width="36"
                        height="10"
                        fill="#E10600"
                        stroke="#0a0c11"
                        stroke-width="0.8"
                      />
                      <text
                        x="0"
                        y="1.5"
                        text-anchor="middle"
                        fill="#ffffff"
                        font-size="6.5"
                        font-weight="900"
                        font-style="italic"
                        class="select-none"
                      >
                        TARGET #{rev.carNumber}
                      </text>
                    </g>
                  </g>
                );
              })()}
            </Show>

            {/* 9. Player Car High-Contrast Neon Indicator (#7 YOU) */}
            {(() => {
              const playerCar = () => cars().find((c) => c.isPlayer) || cars()[0];
              const pPos = () => getCoordinates(playerCar().lapDistPct);

              return (
                <g
                  transform={`translate(${pPos().x}, ${pPos().y})`}
                  class="z-50 transition-transform duration-75"
                >
                  {/* Outer Pulsing Neon Aura */}
                  <circle
                    r="9"
                    fill="none"
                    stroke="#00d2ff"
                    stroke-width="2"
                    opacity="0.85"
                    class="animate-pulse"
                  />

                  {/* Core Player Dot */}
                  <rect
                    x="-4.8"
                    y="-4.8"
                    width="9.6"
                    height="9.6"
                    fill="#00d2ff"
                    stroke="#ffffff"
                    stroke-width="1.6"
                    filter="url(#track-glow-cyan)"
                  />

                  {/* Orientation Tangent Pointer Arrow */}
                  <g transform={`rotate(${pPos().angle})`}>
                    <polygon points="8,0 4,-3 4,3" fill="#ffffff" />
                  </g>

                  {/* Player Tag Badge */}
                  <g transform="translate(0, -11)">
                    <rect
                      x="-16"
                      y="-7"
                      width="32"
                      height="12"
                      fill="#00d2ff"
                      stroke="#0a0c11"
                      stroke-width="1"
                    />
                    <text
                      y="2.5"
                      text-anchor="middle"
                      fill="#000000"
                      font-size="8"
                      font-weight="900"
                      font-style="italic"
                    >
                      YOU #{playerCar().carNumber}
                    </text>
                  </g>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Broadcast title lockup — F1 hangs the label UNDER the map graphic
            (see the world-feed "TRACK CONDITIONS" card): oblique caps + red rule. */}
        <div class="flex items-end justify-between px-3 pb-0.5 -mt-1 gap-2 f1-floating">
          <div class="flex items-center gap-2 min-w-0">
            {/* Race-control flag state: green = track clear, yellow = caution */}
            <Flag
              class={`w-[18px] h-[18px] shrink-0 ${
                props.yellowFlag || activeHazard()?.hasIncident
                  ? "text-[#FFD100] fill-[#FFD100] animate-pulse"
                  : "text-[#00D26A] fill-[#00D26A]"
              }`}
              stroke-width={1.5}
            />
            <span class="f1-title text-[15px] text-white truncate">
              {currentLayout().shortName}
            </span>
          </div>

          <div class="flex items-end gap-2.5 shrink-0 pb-[5px]">
            {/* Sector state — three broadcast bars, no boxes */}
            <div class="flex items-end gap-[3px]">
              <For each={[[1, s1Status()], [2, s2Status()], [3, s3Status()]] as const}>
                {([n, st]) => (
                  <div class="flex flex-col items-center gap-1">
                    <span class="f1-label !text-[7px] text-white/60">S{n}</span>
                    <div
                      class="w-[14px] h-[4px]"
                      style={{ background: getSectorColorCode(st as SectorColor) }}
                    />
                  </div>
                )}
              </For>
            </div>
            <span class="f1-value text-[10px] text-white/70">
              {cars().length} CARS
            </span>
          </div>
        </div>
      </div>

      {/* Right Edge Horizontal Drag Handle */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleResizeMouseDown}
          class="absolute -right-2.5 top-8 bottom-4 w-4 flex items-center justify-center cursor-ew-resize group z-50 pointer-events-auto select-none"
          title={`가로 너비 조절 (현재 ${currentWidth()}px)`}
        >
          <div
            class={`w-1.5 h-8 rounded-full shadow-lg border border-black/40 transition-all ${
              isResizing() ? "bg-[#E10600] h-10 scale-110" : "bg-white/70 group-hover:bg-white"
            }`}
          />
        </div>
      </Show>
    </div>
  );
};

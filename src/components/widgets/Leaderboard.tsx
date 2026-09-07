// ponytail: ultra-lightweight, zero-dependency responsive leaderboard
import { Component, For, Show, createSignal, createMemo, onCleanup } from "solid-js";
import { CarTelemetry, SafetyRating, LicenseClass } from "../../services/telemetry/types.ts";
import { createPresence } from "../../utils/presence.ts";
import { t } from "../../i18n/index.ts";
import { CarBrandIcon, BrandGenericRaceCar } from "../../assets/icons/CarBrandIcons.tsx";

export interface LeaderboardProps {
  cars?: CarTelemetry[];
  lapCurrent?: number;
  lapTotal?: number;
  isEditMode?: boolean;
  scale?: number;
  width?: number; // custom width in px
  maxRows?: number; // number of displayed rows
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
  onMaxRowsChange?: (newRows: number) => void;
}

// iRacing country code to flag emoji
const countryFlags: Record<string, string> = {
  KR: "🇰🇷",
  US: "🇺🇸",
  JP: "🇯🇵",
  DE: "🇩🇪",
  GB: "🇬🇧",
  NL: "🇳🇱",
  FR: "🇫🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  AU: "🇦🇺",
  MC: "🇲🇨",
  CO: "🇨🇴",
  MX: "🇲🇽",
  BR: "🇧🇷",
  CA: "🇨🇦",
  BE: "🇧🇪",
  NZ: "🇳🇿",
  CH: "🇨🇭",
};

// iRacing Safety Rating License Tier Colors
const srTierStyles: Record<LicenseClass, { border: string; bg: string; text: string }> = {
  R: { border: "border-[#E03A3E]/70", bg: "bg-[#E03A3E]/15", text: "text-[#FF453A]" }, // Rookie: Red
  D: { border: "border-[#FC6A03]/70", bg: "bg-[#FC6A03]/15", text: "text-[#FF9F0A]" }, // Class D: Orange
  C: { border: "border-[#FED100]/70", bg: "bg-[#FED100]/15", text: "text-[#FFD60A]" }, // Class C: Yellow
  B: { border: "border-[#00A859]/70", bg: "bg-[#00A859]/15", text: "text-[#30D158]" }, // Class B: Green
  A: { border: "border-[#0072CE]/70", bg: "bg-[#0072CE]/15", text: "text-[#0A84FF]" }, // Class A: Blue
  P: { border: "border-[#AF52DE]/70", bg: "bg-[#AF52DE]/15", text: "text-[#BF5AF2]" }, // Pro: Purple
};

function formatLapTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "-:--.---";
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, "0")}`;
}

export const Leaderboard: Component<LeaderboardProps> = (props) => {
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  // Width control: default to 460px (Detailed), minimum 220px, maximum 720px
  const currentWidth = () => Math.max(220, Math.min(720, props.width ?? 460));
  const currentRows = () => Math.max(5, Math.min(20, props.maxRows ?? 10));
  const currentLap = () => props.lapCurrent || 24;
  const totalLaps = () => props.lapTotal || 57;

  // Width Responsive Hierarchy:
  // - Minimum (~220px): [순위] [이름] [최근랩타임]
  // - Level 1 (>= 280px): + [베스트랩타임]
  // - Level 2 (>= 350px): + [IR]
  // - Level 3 (>= 410px): + [국가]
  // - Level 4 (>= 480px): + [SR 사각 배지]
  // - Level 5 (>= 560px): + [차량브랜드]
  const showBestLap = () => currentWidth() >= 280;
  const showIR = () => currentWidth() >= 350;
  const showCountry = () => currentWidth() >= 410;
  const showSR = () => currentWidth() >= 480;
  const showBrand = () => currentWidth() >= 560;

  // 1등(P1)부터 순차 정렬 보장
  const sortedCars = createMemo(() => {
    const list = props.cars ? [...props.cars] : [];
    return list.sort((a, b) => a.overallPosition - b.overallPosition).slice(0, currentRows());
  });

  // Interactive Horizontal Drag Resizing for Edit Mode
  const [isResizingWidth, setIsResizingWidth] = createSignal(false);
  let startX = 0;
  let startW = 0;

  const handleResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsResizingWidth(true);
    startX = e.clientX;
    startW = currentWidth();

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const newWidth = Math.max(220, Math.min(720, startW + deltaX));
      props.onWidthChange?.(Math.round(newWidth));
    };

    const handleMouseUp = () => {
      setIsResizingWidth(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      class="relative flex flex-col font-sans select-none rounded-sm overflow-visible text-white shadow-2xl transition-all"
      style={{
        width: `${currentWidth()}px`,
      }}
    >
      {/* Sleek Floating Apple Scale & Width Capsule (Only in Edit Mode) */}
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-10 left-0 right-0 z-40 flex items-center justify-between px-3 py-1 bg-[#181820]/95 border border-white/20 rounded-full shadow-xl text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <div class="flex items-center gap-1.5 text-[10px] font-medium text-white/70">
            <span>{t().wLeaderboard}</span>
            <span class="text-[9px] font-mono text-white/40">({currentWidth()}px)</span>
          </div>

          <div class="flex items-center gap-2">
            {/* Quick Width Presets */}
            <div class="flex items-center gap-1 border-r border-white/10 pr-2">
              <button
                onClick={() => props.onWidthChange?.(240)}
                class={`px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer transition-all ${
                  currentWidth() < 280 ? "bg-white/25 text-white" : "bg-white/5 text-white/50 hover:text-white"
                }`}
                title="최소 너비 (순위, 이름, 최근랩)"
              >
                최소
              </button>
              <button
                onClick={() => props.onWidthChange?.(380)}
                class={`px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer transition-all ${
                  currentWidth() >= 280 && currentWidth() < 480 ? "bg-white/25 text-white" : "bg-white/5 text-white/50 hover:text-white"
                }`}
                title="기본 너비 (+베스트랩, IR)"
              >
                기본
              </button>
              <button
                onClick={() => props.onWidthChange?.(480)}
                class={`px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer transition-all ${
                  currentWidth() >= 480 && currentWidth() < 560 ? "bg-white/25 text-white" : "bg-white/5 text-white/50 hover:text-white"
                }`}
                title="상세 너비 (+국가, SR 배지)"
              >
                상세
              </button>
              <button
                onClick={() => props.onWidthChange?.(600)}
                class={`px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer transition-all ${
                  currentWidth() >= 560 ? "bg-white/25 text-white" : "bg-white/5 text-white/50 hover:text-white"
                }`}
                title="전체 너비 (+차량브랜드)"
              >
                전체
              </button>
            </div>

            {/* Scale +/- Controls */}
            <div class="flex items-center gap-1">
              <button
                onClick={() => props.onScaleChange && props.onScaleChange(Math.max(0.7, (props.scale || 1) - 0.1))}
                class="w-4 h-4 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                -
              </button>
              <span class="text-[10px] font-mono font-semibold w-7 text-center">
                {Math.round((props.scale || 1) * 100)}%
              </span>
              <button
                onClick={() => props.onScaleChange && props.onScaleChange(Math.min(1.5, (props.scale || 1) + 0.1))}
                class="w-4 h-4 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* 1. Universal Broadcast Header (No hardcoded league logo) */}
      <div class="flex items-center justify-between bg-[#121218] border-b-2 border-[#e10600] px-3 py-1.5 rounded-t shadow-sm">
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-mono font-black tracking-widest text-[#e10600] uppercase">
            STANDINGS
          </span>
          <span class="h-3 w-px bg-white/15" />
          <span class="text-[11px] font-mono font-bold tracking-wider text-white/90">
            LAP {currentLap()}/{totalLaps()}
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" />
          <span class="text-[9px] font-mono font-bold tracking-widest text-white/60">LIVE</span>
        </div>
      </div>

      {/* 2. Dynamic Table Column Header */}
      <div class="flex items-center px-2 py-1 bg-black/85 text-[9px] font-mono text-white/45 tracking-wider border-b border-white/[0.08]">
        {/* Pos */}
        <span class="w-7 text-center font-bold">POS</span>
        <span class="w-[3px] mr-1.5 shrink-0" />

        {/* Optional Country Flag */}
        <Show when={showCountry()}>
          <span class="w-6 text-center">NAT</span>
        </Show>

        {/* Optional Car Brand */}
        <Show when={showBrand()}>
          <span class="w-24 pl-1 text-left truncate flex items-center gap-1 font-bold">
            <BrandGenericRaceCar class="w-3 h-3 text-white/40" />
            BRAND
          </span>
        </Show>

        {/* Driver Name (Always Visible, fills space) */}
        <span class="flex-1 pl-1.5 text-left truncate font-bold">DRIVER</span>

        {/* Optional Safety Rating Badge */}
        <Show when={showSR()}>
          <span class="w-14 text-center">SR</span>
        </Show>

        {/* Optional iRating */}
        <Show when={showIR()}>
          <span class="w-12 text-right pr-1">iR</span>
        </Show>

        {/* Optional Best Lap */}
        <Show when={showBestLap()}>
          <span class="w-16 text-right pr-1">BEST</span>
        </Show>

        {/* Last Lap Time (Always Visible) */}
        <span class="w-16 text-right pr-1 font-bold">LAST</span>
      </div>

      {/* 3. Driver Rows (Starting strictly from P1) */}
      <div class="flex flex-col gap-[1px] bg-black/60">
        <For each={sortedCars()}>
          {(car) => {
            const flag = () => countryFlags[car.country] || car.country || "🏁";
            const srStyle = () =>
              srTierStyles[car.safetyRating?.license || "B"] || srTierStyles.B;
            const isLeader = () => car.overallPosition === 1;

            return (
              <div
                class={`flex items-center h-[28px] px-2 transition-colors duration-100 ${
                  car.carIdx === 1
                    ? "bg-[#1d2338] ring-1 ring-inset ring-[#30d158]/50"
                    : "bg-[#14141c]/95 hover:bg-[#1b1c26]/95"
                }`}
              >
                {/* 1. Pos */}
                <div class="w-7 flex items-center justify-center h-full text-[11px] font-mono font-bold">
                  <span
                    class={
                      isLeader()
                        ? "text-[#ffd60a] font-extrabold"
                        : car.overallPosition <= 3
                        ? "text-[#f5f5f7] font-bold"
                        : "text-white/70"
                    }
                  >
                    {car.overallPosition}
                  </span>
                </div>

                {/* Vertical Accent Color Stripe */}
                <div
                  class="w-[3px] h-full shrink-0 mr-1.5 rounded-full"
                  style={{ "background-color": car.carClassColor || "#E10600" }}
                />

                {/* 2. Optional Country */}
                <Show when={showCountry()}>
                  <div class="w-6 flex items-center justify-center shrink-0 text-xs">
                    <span title={car.country}>{flag()}</span>
                  </div>
                </Show>

                {/* 3. Optional Car Brand with Official Vector Emblem */}
                <Show when={showBrand()}>
                  <div class="w-24 pl-1 flex items-center gap-1.5 shrink-0 overflow-hidden" title={car.carBrand}>
                    <div class="w-4 h-4 shrink-0 flex items-center justify-center">
                      <CarBrandIcon brand={car.carBrand} class="w-4 h-4 drop-shadow-sm" />
                    </div>
                    <span class="text-[10px] font-mono font-medium text-white/80 truncate">
                      {car.carBrand}
                    </span>
                  </div>
                </Show>

                {/* 4. Driver Name (Always Visible) */}
                <div class="flex-1 min-w-0 flex items-center gap-1.5 pl-1.5">
                  <span class="text-[12px] font-medium tracking-tight text-white truncate">
                    {car.driverName}
                  </span>
                  <span class="text-[9px] font-mono text-white/35 shrink-0">
                    #{car.carNumber}
                  </span>
                  <Show when={car.carIdx === 1}>
                    <span class="text-[8px] font-mono font-bold px-1 py-0.2 bg-[#30d158]/20 text-[#30d158] rounded border border-[#30d158]/30 shrink-0">
                      YOU
                    </span>
                  </Show>
                </div>

                {/* 5. Optional Safety Rating (Rounded Rectangle Badge) */}
                <Show when={showSR()}>
                  <div class="w-14 flex items-center justify-center shrink-0">
                    <div
                      class={`px-1.5 py-0.5 rounded-[4px] border ${srStyle().border} ${srStyle().bg} flex items-center gap-0.5`}
                    >
                      <span class={`text-[9px] font-mono font-black ${srStyle().text}`}>
                        {car.safetyRating?.license || "B"}
                      </span>
                      <span class="text-[9px] font-mono font-bold text-white/90">
                        {car.safetyRating?.value?.toFixed(2) || "3.50"}
                      </span>
                    </div>
                  </div>
                </Show>

                {/* 6. Optional iRating */}
                <Show when={showIR()}>
                  <div class="w-12 text-right pr-1 text-[11px] font-mono text-white/70 shrink-0">
                    {car.irating ? car.irating.toLocaleString() : "2,500"}
                  </div>
                </Show>

                {/* 7. Optional Best Lap */}
                <Show when={showBestLap()}>
                  <div class="w-16 text-right pr-1 text-[11px] font-mono text-purple-300/80 shrink-0">
                    {formatLapTime(car.bestLapTime)}
                  </div>
                </Show>

                {/* 8. Last Lap Time (Always Visible) */}
                <div class="w-16 text-right pr-1 text-[11px] font-mono font-bold text-white shrink-0">
                  {formatLapTime(car.lastLapTime)}
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* Bottom Border Accent */}
      <div class="h-1 bg-[#121218] rounded-b border-t border-white/[0.08]" />

      {/* Interactive Horizontal Drag Resize Handle (Only in Edit Mode) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleResizeMouseDown}
          class="absolute -right-2 top-0 bottom-0 w-4 flex items-center justify-center cursor-ew-resize group z-50 pointer-events-auto"
          title="너비 조절 (가로 드래그)"
        >
          <div class="w-1.5 h-12 bg-amber-400 group-hover:bg-amber-300 rounded-full shadow-lg border border-black/40 transition-colors" />
        </div>
      </Show>
    </div>
  );
};

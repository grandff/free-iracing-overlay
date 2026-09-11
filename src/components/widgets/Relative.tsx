import { Component, For, Index, Show, createSignal, createMemo, onCleanup } from "solid-js";
import { CountryFlag } from "../../assets/icons/CountryFlags.tsx";
import { SectorColor } from "../../services/telemetry/types.ts";
import { calculateSOF } from "../../services/telemetry/iratingCalculator.ts";

export interface RelativeEntry {
  position?: number;
  carNumber: string;
  code: string;
  name: string;
  country?: string;
  teamColor: string;
  tireCompound: "S" | "M" | "H" | "I" | "W";
  gapSeconds: number;
  isPlayer?: boolean;
  sectors?: [SectorColor, SectorColor, SectorColor];
  currentSector?: 1 | 2 | 3;
  irating?: number;
  projectedIratingGain?: number;
}

export interface RelativeProps {
  entries?: RelativeEntry[];
  isEditMode?: boolean;
  scale?: number;
  width?: number; // custom width in px (default: 340)
  maxRows?: number; // cars ahead & behind (2 to 5, default: 3)
  sof?: number;
  projectedIratingGain?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
  onMaxRowsChange?: (newRows: number) => void;
}

// 11-car preview. IRSDK does not expose opponent split deltas, so only the
// player's row carries sector colors; opponent rows intentionally show "—".
const defaultRelativeEntries: RelativeEntry[] = [
  { position: 1, carNumber: "1", code: "VER", name: "M. Verstappen", country: "NL", teamColor: "#3671C6", tireCompound: "S", gapSeconds: -4.821, irating: 5200, projectedIratingGain: 18 },
  { position: 2, carNumber: "4", code: "NOR", name: "L. Norris", country: "GB", teamColor: "#FF8000", tireCompound: "M", gapSeconds: -3.120, irating: 4850, projectedIratingGain: 12 },
  { position: 3, carNumber: "81", code: "PIA", name: "O. Piastri", country: "AU", teamColor: "#FF8000", tireCompound: "M", gapSeconds: -1.954, irating: 4100, projectedIratingGain: 6 },
  { position: 4, carNumber: "55", code: "SAI", name: "C. Sainz", country: "ES", teamColor: "#E8002D", tireCompound: "H", gapSeconds: -0.985, irating: 3950, projectedIratingGain: 2 },
  { position: 5, carNumber: "16", code: "LEC", name: "C. Leclerc", country: "MC", teamColor: "#E8002D", tireCompound: "S", gapSeconds: -0.421, irating: 4400, projectedIratingGain: -4 },
  // Player (Index 5)
  { position: 6, carNumber: "7", code: "YOU", name: "K. Jeongmin", country: "KR", teamColor: "#00d26a", tireCompound: "M", gapSeconds: 0.000, isPlayer: true, sectors: ["purple", "green", "none"], currentSector: 3, irating: 2850, projectedIratingGain: 38 },
  // Behind
  { position: 7, carNumber: "44", code: "HAM", name: "L. Hamilton", country: "GB", teamColor: "#27F4D2", tireCompound: "H", gapSeconds: 0.842, irating: 4600, projectedIratingGain: -12 },
  { position: 8, carNumber: "63", code: "RUS", name: "G. Russell", country: "GB", teamColor: "#27F4D2", tireCompound: "H", gapSeconds: 1.635, irating: 3800, projectedIratingGain: -16 },
  { position: 9, carNumber: "14", code: "ALO", name: "F. Alonso", country: "ES", teamColor: "#229971", tireCompound: "M", gapSeconds: 2.780, irating: 3600, projectedIratingGain: -22 },
  { position: 10, carNumber: "10", code: "GAS", name: "P. Gasly", country: "FR", teamColor: "#0090FF", tireCompound: "H", gapSeconds: 3.910, irating: 2900, projectedIratingGain: -28 },
  { position: 11, carNumber: "23", code: "ALB", name: "A. Albon", country: "TH", teamColor: "#005AFF", tireCompound: "M", gapSeconds: 5.120, irating: 3100, projectedIratingGain: -34 },
];

/**
 * 100% Pure Vector SVG Tire Badge
 * - Eliminates font dependency, baseline drift, and subpixel distortion.
 * - Perfectly centered on 24x24 coordinate grid.
 */
const TireBadge: Component<{ compound: "S" | "M" | "H" | "I" | "W"; class?: string }> = (props) => {
  const config = () => {
    switch (props.compound) {
      case "S":
        return { stroke: "#FF2A2A", text: "#FF453A", bg: "rgba(255, 42, 42, 0.18)" };
      case "M":
        return { stroke: "#FFD100", text: "#FFD100", bg: "rgba(255, 209, 0, 0.18)" };
      case "H":
        return { stroke: "#FFFFFF", text: "#FFFFFF", bg: "rgba(255, 255, 255, 0.18)" };
      case "I":
        return { stroke: "#30D158", text: "#30D158", bg: "rgba(48, 209, 88, 0.18)" };
      case "W":
        return { stroke: "#0A84FF", text: "#0A84FF", bg: "rgba(10, 132, 255, 0.18)" };
      default:
        return { stroke: "#FFD100", text: "#FFD100", bg: "rgba(255, 209, 0, 0.18)" };
    }
  };

  return (
    <svg viewBox="0 0 24 24" class={props.class || "w-[18px] h-[18px] shrink-0"}>
      {/* Outer tire ring */}
      <circle cx="12" cy="12" r="10" fill={config().bg} stroke={config().stroke} stroke-width="2.2" />
      {/* 100% Crisp Vector Glyph: Zero font dependency, zero baseline drift */}
      <Show when={props.compound === "S"}>
        <path d="M15.8 9.3c-.3-1.4-1.5-2.3-3.6-2.3-2.3 0-3.8 1.1-3.8 2.6 0 1.5 1.1 2.2 3.1 2.6l1.2.3c1.3.3 1.9.7 1.9 1.4 0 .9-.9 1.5-2.4 1.5-1.7 0-2.6-.7-2.8-1.8H7c.2 2.5 2.2 3.8 4.8 3.8 2.8 0 4.8-1.4 4.8-3.4 0-1.6-1-2.4-3.2-2.8l-1.1-.2c-1.2-.3-1.8-.7-1.8-1.3 0-.8.8-1.3 2-1.3 1.4 0 2.2.6 2.4 1.6h2.1z" fill={config().text} />
      </Show>
      <Show when={props.compound === "M"}>
        <path d="M7 7h2.6l2.4 4.5 2.4-4.5H17v10h-2.5V11.2l-1.9 3.6h-1.2L9.5 11.2V17H7V7z" fill={config().text} />
      </Show>
      <Show when={props.compound === "H"}>
        <path d="M7.5 7h2.8v3.6h3.4V7h2.8v10h-2.8v-4.2h-3.4V17H7.5V7z" fill={config().text} />
      </Show>
      <Show when={props.compound === "I"}>
        <path d="M10.5 7h3v10h-3z" fill={config().text} />
      </Show>
      <Show when={props.compound === "W"}>
        <path d="M7 7h2.5v5.8l1.9-3.6h1.2l1.9 3.6V7H17v10h-2.6l-2.4-4.5-2.4 4.5H7V7z" fill={config().text} />
      </Show>
    </svg>
  );
};

/**
 * 3-Sector Segment Badge Group (S1 | S2 | S3)
 * - Highlights Purple (fastest), Green (personal best), Yellow (slower), Dim (unreached)
 * - Thin white outline marks the current live sector without replacing its color
 */
const SectorPillGroup: Component<{
  sectors?: [SectorColor, SectorColor, SectorColor];
  currentSector?: 1 | 2 | 3;
}> = (props) => {
  const getStyle = (col: SectorColor, isCurr: boolean) => {
    const current = isCurr ? " ring-1 ring-inset ring-white/90" : "";
    switch (col) {
      case "purple":
        return `bg-[#B055F5] border-[#B055F5] text-black${current}`;
      case "green":
        return `bg-[#00D26A] border-[#00D26A] text-black${current}`;
      case "yellow":
        return `bg-[#FFD100] border-[#FFD100] text-black${current}`;
      default:
        return `bg-white/[0.04] border-white/10 text-white/30${current}`;
    }
  };

  return (
    <Show
      when={props.sectors}
      fallback={<span class="text-[10px] font-mono text-white/25" title="Opponent sector splits are not exposed by IRSDK">—</span>}
    >
      {(sectors) => <div class="flex items-center gap-[2px] justify-center">
      <For each={sectors()}>
        {(col, idx) => {
          const secNum = (idx() + 1) as 1 | 2 | 3;
          const isCurr = props.currentSector === secNum;
          return (
            <div
              class={`w-[13px] h-[13px] rounded-[1px] border flex items-center justify-center text-[8px] font-mono font-black ${getStyle(
                col,
                isCurr
              )}`}
              title={`S${secNum}: ${col.toUpperCase()}${isCurr ? " (CURRENT)" : ""}`}
            >
              {secNum}
            </div>
          );
        }}
      </For>
    </div>}
    </Show>
  );
};

export const Relative: Component<RelativeProps> = (props) => {
  // Width control: default 340px, min 280px, max 520px
  const currentWidth = () => Math.max(280, Math.min(520, props.width ?? 340));
  // Ahead/Behind control: 2 to 5 cars (default: 3)
  const carsAheadBehind = () => Math.max(2, Math.min(5, props.maxRows ?? 3));

  // Column responsive hierarchy: show iR column when container >= 400px
  const showIRColumn = () => currentWidth() >= 400;
  const gridColsClass = () =>
    showIRColumn()
      ? "grid-cols-[34px_36px_1fr_48px_48px_28px_66px]"
      : "grid-cols-[38px_40px_1fr_52px_32px_70px]";

  // Real-time Strength of Field (SOF) and projected player iRating gain
  const computedSof = createMemo(() => {
    if (props.sof !== undefined && props.sof > 0) return props.sof;
    const entries = props.entries && props.entries.length > 0 ? props.entries : defaultRelativeEntries;
    const ratings = entries.map((e) => e.irating).filter((r): r is number => typeof r === "number" && r > 0);
    return calculateSOF(ratings);
  });

  const computedPlayerGain = createMemo(() => {
    if (props.projectedIratingGain !== undefined) return props.projectedIratingGain;
    const entries = props.entries && props.entries.length > 0 ? props.entries : defaultRelativeEntries;
    const player = entries.find((e) => e.isPlayer);
    return player?.projectedIratingGain;
  });

  // Dynamic Slicing around Player
  const visibleList = createMemo(() => {
    const aheadBehind = carsAheadBehind();
    if (props.entries && props.entries.length > 0) {
      const pIdx = props.entries.findIndex((e) => e.isPlayer);
      if (pIdx !== -1) {
        const start = Math.max(0, pIdx - aheadBehind);
        const end = Math.min(props.entries.length, pIdx + aheadBehind + 1);
        return props.entries.slice(start, end);
      }
      return props.entries.slice(0, aheadBehind * 2 + 1);
    }
    // Default preview: player is at index 5
    return defaultRelativeEntries.slice(5 - aheadBehind, 5 + aheadBehind + 1);
  });

  // Interactive Drag Resizing for Edit Mode
  const [isResizingWidth, setIsResizingWidth] = createSignal(false);
  const [isResizingHeight, setIsResizingHeight] = createSignal(false);
  const [isResizingCorner, setIsResizingCorner] = createSignal(false);

  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startRows = 0;
  let stopResizeListeners = () => {};

  // 1. 가로 너비 드래그 핸들러
  const handleResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingWidth(true);
    startX = e.clientX;
    startW = currentWidth();
    stopResizeListeners();

    const handleMouseMove = (ev: MouseEvent) => {
      // Widget is anchored bottom-right, so the visible width edge is on the left.
      const deltaX = (startX - ev.clientX) / (props.scale || 1);
      const newWidth = Math.max(280, Math.min(500, startW + deltaX));
      props.onWidthChange?.(Math.round(newWidth));
    };

    const handleMouseUp = () => {
      setIsResizingWidth(false);
      stopResizeListeners();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    stopResizeListeners = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  };

  // 2. 세로 높이 / 앞뒤 표시 대수 조절 핸들러
  const handleHeightResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingHeight(true);
    startY = e.clientY;
    startRows = carsAheadBehind();
    stopResizeListeners();

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaY = (startY - ev.clientY) / (props.scale || 1);
      const stepDelta = Math.round(deltaY / 40);
      const newAheadBehind = Math.max(2, Math.min(5, startRows + stepDelta));
      props.onMaxRowsChange?.(newAheadBehind);
    };

    const handleMouseUp = () => {
      setIsResizingHeight(false);
      stopResizeListeners();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    stopResizeListeners = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  };

  // 3. 우하단 코너 동시 크기 조절 핸들러
  const handleCornerResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingCorner(true);
    startX = e.clientX;
    startW = currentWidth();
    startY = e.clientY;
    startRows = carsAheadBehind();
    stopResizeListeners();

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = (startX - ev.clientX) / (props.scale || 1);
      const deltaY = (startY - ev.clientY) / (props.scale || 1);
      const newWidth = Math.max(280, Math.min(500, startW + deltaX));
      const stepDelta = Math.round(deltaY / 40);
      const newAheadBehind = Math.max(2, Math.min(5, startRows + stepDelta));
      props.onWidthChange?.(Math.round(newWidth));
      props.onMaxRowsChange?.(newAheadBehind);
    };

    const handleMouseUp = () => {
      setIsResizingCorner(false);
      stopResizeListeners();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    stopResizeListeners = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  };

  onCleanup(() => {
    stopResizeListeners();
    setIsResizingWidth(false);
    setIsResizingHeight(false);
    setIsResizingCorner(false);
  });

  return (
    <div
      class="relative flex flex-col font-sans select-none rounded-sm overflow-visible text-white shadow-2xl"
      style={{
        width: `${currentWidth()}px`,
      }}
    >
      {/* Edit Mode Top Shaded Bar: 타이틀 일체 배제, 배율 조절 컨트롤만 깔끔하게 노출 */}
      <Show when={props.isEditMode}>
        <div class="flex items-center justify-end px-3 py-1 hud-surface-deep border-t border-x border-white/20 rounded-t text-white select-none">
          <div class="flex items-center gap-1.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
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

      {/* Header: Non-circle motorsport timing delta icon */}
      <div
        class={`flex items-center justify-between hud-surface-band border-t-[3px] border-t-[#E10600] border-b border-b-white/15 px-3 py-1.5 ${
          props.isEditMode ? "border-x border-white/20" : "rounded-t border border-white/10"
        } shadow-sm`}
      >
        <div class="flex items-center gap-2">
          {/* F1 High-Tech Opposing Chevrons (Ahead / My Car / Behind) - Zero Circles */}
          <svg
            viewBox="0 0 16 16"
            class="w-3.5 h-3.5 text-[#E10600] shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="4 5 8 2 12 5" />
            <line x1="2" y1="8" x2="14" y2="8" stroke-dasharray="2 1.5" stroke="#00d26a" stroke-width="1.8" />
            <polyline points="4 11 8 14 12 11" />
          </svg>
          <span class="text-[11px] font-mono font-black tracking-wider text-white">
            RELATIVE INTERVAL
          </span>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <Show when={computedSof() > 0}>
            <div class="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-white/[0.08] border border-white/10 text-[9px] font-mono font-bold text-white/80">
              <span class="text-white/40 text-[7.5px] uppercase">SOF</span>
              <span>{Math.round(computedSof()).toLocaleString()}</span>
            </div>
          </Show>
          <Show when={computedPlayerGain() !== undefined}>
            <div
              class={`px-1.5 py-0.5 rounded-[2px] border text-[9px] font-mono font-black ${
                (computedPlayerGain() ?? 0) > 0
                  ? "bg-[#00D2BE]/15 border-[#00D2BE]/30 text-[#00D2BE]"
                  : (computedPlayerGain() ?? 0) < 0
                  ? "bg-[#FF3B30]/15 border-[#FF3B30]/30 text-[#FF3B30]"
                  : "bg-white/10 border-white/20 text-white/70"
              }`}
              title="완주 시 예상 iRating 변동"
            >
              {(computedPlayerGain() ?? 0) > 0 ? `+${computedPlayerGain()}` : `${computedPlayerGain()}`} iR
            </div>
          </Show>
          <span class="text-[9px] font-mono font-bold text-white/45 tracking-wide">
            ±{carsAheadBehind()} CARS
          </span>
        </div>
      </div>

      {/* Subheader: POS, #, DRIVER, [iR], SEC, TYRE, GAP */}
      {/* ponytail: unified grid layout and synchronized border-box padding ensure 100% mathematical text alignment between header and body rows */}
      <div class={`grid ${gridColsClass()} items-center px-2 py-1 hud-surface-deep text-[9px] font-mono text-white/45 tracking-wider border-b border-white/[0.08] border-l-[3.5px] border-l-transparent`}>
        <span class="text-center font-bold">POS</span>
        <span class="text-center font-bold">#</span>
        <span class="pl-2 font-bold text-left">DRIVER</span>
        <Show when={showIRColumn()}>
          <span class="text-right pr-1 font-bold">iR</span>
        </Show>
        <span class="text-center font-bold">SEC</span>
        <span class="text-center font-bold">TYRE</span>
        <span class="text-right pr-2 font-bold">GAP</span>
      </div>

      {/* Rows: using Index so table row DOM nodes are reused across 30Hz telemetry updates */}
      <div class="flex flex-col gap-[1px] bg-black/60">
        <Index each={visibleList()}>
          {(d) => {
            const isAhead = () => d().gapSeconds < 0;
            const formattedGap = () =>
              d().isPlayer
                ? "0.000s"
                : `${isAhead() ? "" : "+"}${d().gapSeconds.toFixed(3)}s`;

            return (
              <div
                class={`grid ${gridColsClass()} items-center h-[28px] px-2 transition-colors duration-150 border-l-[3.5px] ${
                  d().isPlayer
                    ? "bg-[#00d26a]/10 ring-1 ring-inset ring-[#00d26a]/45 border-l-[#00d26a]"
                    : "bg-[#13141c]/95 hover:bg-[#181a24]/95 border-l-transparent"
                }`}
              >
                {/* 1. POS: Overall/Class Position */}
                <div class="flex items-center justify-center h-full">
                  <span
                    class={`text-[10px] font-mono font-bold tabular-nums ${
                      d().isPlayer ? "text-[#00d26a] font-black" : "text-white/60"
                    }`}
                  >
                    P{d().position ?? "-"}
                  </span>
                </div>

                {/* 2. Car Number (#): Dedicated spacious column */}
                <div class="flex items-center justify-center h-full">
                  <span
                    class={`text-[10px] font-mono font-bold tabular-nums ${
                      d().isPlayer ? "text-[#00d26a]" : "text-white/75"
                    }`}
                  >
                    #{d().carNumber}
                  </span>
                </div>

                {/* 3. Driver: Clear gap from car number, Team stripe, Flag, YOU badge, Name */}
                <div class="flex items-center h-full pl-2 pr-1 relative overflow-hidden min-w-0 gap-1.5">
                  <Show when={!d().isPlayer}>
                    <div
                      class="w-[3px] h-3.5 shrink-0"
                      style={{ "background-color": d().teamColor }}
                    />
                  </Show>
                  <CountryFlag
                    code={d().country || "US"}
                    class="w-4 h-2.5 rounded-[1.5px] border border-white/20 shadow-sm shrink-0"
                  />
                  <Show when={d().isPlayer}>
                    <span class="text-[8px] font-mono font-black px-1 py-0.2 rounded bg-[#00d26a] text-black shrink-0 tracking-wider shadow-sm">
                      YOU
                    </span>
                  </Show>
                  <span
                    class={`text-[12px] truncate tracking-tight ${
                      d().isPlayer
                        ? "text-white font-black"
                        : isAhead()
                        ? "text-[#f5f5f7] font-medium"
                        : "text-white/80"
                    }`}
                  >
                    {d().name}
                  </span>
                  <Show when={!showIRColumn() && d().irating}>
                    <span class="ml-auto text-[8.5px] font-mono text-white/40 shrink-0 tnum">
                      {((d().irating || 0) / 1000).toFixed(1)}k
                    </span>
                  </Show>
                </div>

                {/* Optional iR Column (>= 400px) */}
                <Show when={showIRColumn()}>
                  <div class="text-right pr-1 shrink-0">
                    <span class={`font-mono text-[10px] tabular-nums ${
                      d().isPlayer ? "text-[#00d26a] font-bold" : "text-white/70"
                    }`}>
                      {d().irating ? d().irating!.toLocaleString() : "—"}
                    </span>
                  </div>
                </Show>

                {/* 4. Sector Pills: [ S1 | S2 | S3 ] */}
                <div class="flex items-center justify-center shrink-0">
                  <SectorPillGroup sectors={d().sectors} currentSector={d().currentSector} />
                </div>

                {/* 5. Tyre badge: 100% Vector SVG */}
                <div class="flex items-center justify-center shrink-0">
                  <TireBadge compound={d().tireCompound} />
                </div>

                {/* 6. Gap: Tabular monospace delta */}
                <div class="text-right pr-2 shrink-0">
                  <span
                    class={`font-mono text-xs font-bold tabular-nums tracking-wider ${
                      d().isPlayer
                        ? "text-[#00d26a] font-black"
                        : "text-white/90"
                    }`}
                  >
                    {formattedGap()}
                  </span>
                </div>
              </div>
            );
          }}
        </Index>
      </div>

      {/* Bottom Border Accent */}
      <div class="h-1 hud-surface-band rounded-b border-t border-white/[0.08]" />

      {/* 1. Horizontal Drag Resize Handle (Left Edge: bottom-right anchored widget) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleResizeMouseDown}
          class="absolute -left-2.5 top-6 bottom-6 w-4 flex items-center justify-center cursor-ew-resize group z-50 pointer-events-auto select-none"
          title={`가로 너비 조절 (현재 ${currentWidth()}px)`}
        >
          <div
            class={`w-1.5 h-12 rounded-full shadow-lg border border-black/40 transition-all ${
              isResizingWidth() ? "bg-[#E10600] h-16 scale-110" : "bg-white/70 group-hover:bg-white"
            }`}
          />
        </div>
      </Show>

      {/* 2. Vertical Drag Resize Handle (Top Edge: bottom-right anchored widget) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleHeightResizeMouseDown}
          class="absolute -top-3 left-6 right-6 h-5 flex items-center justify-center cursor-ns-resize group z-50 pointer-events-auto select-none"
          title={`앞뒤 표시 차량 수 조절 (현재 ±${carsAheadBehind()}대 표시)`}
        >
          <div
            class={`h-1.5 w-16 rounded-full shadow-lg border border-black/40 transition-all flex items-center justify-center ${
              isResizingHeight() ? "bg-[#E10600] w-24 scale-110" : "bg-white/70 group-hover:bg-white"
            }`}
          >
            <Show when={isResizingHeight()}>
              <span class="text-[8px] font-mono font-black text-black tracking-tight">
                ±{carsAheadBehind()} CARS
              </span>
            </Show>
          </div>
        </div>
      </Show>

      {/* 3. Corner Drag Resize Handle (Top-Left) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleCornerResizeMouseDown}
          class="absolute -left-2.5 -top-2.5 w-5 h-5 flex items-center justify-center cursor-nwse-resize group z-50 pointer-events-auto select-none"
          title={`대각선 크기 조절 (가로 ${currentWidth()}px × 앞뒤 ±${carsAheadBehind()}대)`}
        >
          <div
            class={`w-3.5 h-3.5 rounded-full shadow-xl border-2 border-black/60 transition-all ${
              isResizingCorner()
                ? "bg-[#E10600] scale-125 ring-2 ring-[#E10600]/30"
                : "bg-white/70 group-hover:bg-white group-hover:scale-110"
            }`}
          />
        </div>
      </Show>
    </div>
  );
};

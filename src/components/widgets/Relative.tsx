import { Component, For, Show, createSignal, createMemo, onCleanup } from "solid-js";
import { createReorderFlip } from "../../utils/reorderFlip.ts";
import { CountryFlag } from "../../assets/icons/CountryFlags.tsx";

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
}

export interface RelativeProps {
  entries?: RelativeEntry[];
  isEditMode?: boolean;
  scale?: number;
  width?: number; // custom width in px (default: 320)
  maxRows?: number; // cars ahead & behind (2 to 5, default: 3)
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
  onMaxRowsChange?: (newRows: number) => void;
}

// 11 authentic preview cars (5 ahead, Player at index 5, 5 behind)
const defaultRelativeEntries: RelativeEntry[] = [
  { position: 1, carNumber: "1", code: "VER", name: "M. Verstappen", country: "NL", teamColor: "#3671C6", tireCompound: "S", gapSeconds: -4.821 },
  { position: 2, carNumber: "4", code: "NOR", name: "L. Norris", country: "GB", teamColor: "#FF8000", tireCompound: "M", gapSeconds: -3.120 },
  { position: 3, carNumber: "81", code: "PIA", name: "O. Piastri", country: "AU", teamColor: "#FF8000", tireCompound: "M", gapSeconds: -1.954 },
  { position: 4, carNumber: "55", code: "SAI", name: "C. Sainz", country: "ES", teamColor: "#E8002D", tireCompound: "H", gapSeconds: -0.985 },
  { position: 5, carNumber: "16", code: "LEC", name: "C. Leclerc", country: "MC", teamColor: "#E8002D", tireCompound: "S", gapSeconds: -0.421 },
  // Player (Index 5)
  { position: 6, carNumber: "7", code: "YOU", name: "K. Jeongmin", country: "KR", teamColor: "#00d26a", tireCompound: "M", gapSeconds: 0.000, isPlayer: true },
  // Behind
  { position: 7, carNumber: "44", code: "HAM", name: "L. Hamilton", country: "GB", teamColor: "#27F4D2", tireCompound: "H", gapSeconds: 0.842 },
  { position: 8, carNumber: "63", code: "RUS", name: "G. Russell", country: "GB", teamColor: "#27F4D2", tireCompound: "H", gapSeconds: 1.635 },
  { position: 9, carNumber: "14", code: "ALO", name: "F. Alonso", country: "ES", teamColor: "#229971", tireCompound: "M", gapSeconds: 2.780 },
  { position: 10, carNumber: "10", code: "GAS", name: "P. Gasly", country: "FR", teamColor: "#0090FF", tireCompound: "H", gapSeconds: 3.910 },
  { position: 11, carNumber: "23", code: "ALB", name: "A. Albon", country: "TH", teamColor: "#005AFF", tireCompound: "M", gapSeconds: 5.120 },
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

export const Relative: Component<RelativeProps> = (props) => {
  // Width control: default 340px, min 280px, max 520px
  const currentWidth = () => Math.max(280, Math.min(520, props.width ?? 340));
  // Ahead/Behind control: 2 to 5 cars (default: 3)
  const carsAheadBehind = () => Math.max(2, Math.min(5, props.maxRows ?? 3));

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

  // 1. 가로 너비 드래그 핸들러
  const handleResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingWidth(true);
    startX = e.clientX;
    startW = currentWidth();

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const newWidth = Math.max(280, Math.min(500, startW + deltaX));
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

  // 2. 세로 높이 / 앞뒤 표시 대수 조절 핸들러
  const handleHeightResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingHeight(true);
    startY = e.clientY;
    startRows = carsAheadBehind();

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaY = ev.clientY - startY;
      const stepDelta = Math.round(deltaY / 40);
      const newAheadBehind = Math.max(2, Math.min(5, startRows + stepDelta));
      props.onMaxRowsChange?.(newAheadBehind);
    };

    const handleMouseUp = () => {
      setIsResizingHeight(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
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

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;
      const newWidth = Math.max(280, Math.min(500, startW + deltaX));
      const stepDelta = Math.round(deltaY / 40);
      const newAheadBehind = Math.max(2, Math.min(5, startRows + stepDelta));
      props.onWidthChange?.(Math.round(newWidth));
      props.onMaxRowsChange?.(newAheadBehind);
    };

    const handleMouseUp = () => {
      setIsResizingCorner(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  onCleanup(() => {
    setIsResizingWidth(false);
    setIsResizingHeight(false);
    setIsResizingCorner(false);
  });

  // 순위 변동 시 행이 위아래로 자리를 바꾸는 애니메이션 (순위표와 동일 로직 공유)
  const flip = createReorderFlip(() => visibleList().map((d) => d.carNumber));

  return (
    <div
      class="relative flex flex-col font-sans select-none rounded-sm overflow-visible text-white shadow-2xl transition-all"
      style={{
        width: `${currentWidth()}px`,
      }}
    >
      {/* Edit Mode Top Shaded Bar: 타이틀 일체 배제, 배율 조절 컨트롤만 깔끔하게 노출 */}
      <Show when={props.isEditMode}>
        <div class="flex items-center justify-end px-3 py-1 bg-black/90 backdrop-blur-md border-t border-x border-white/20 rounded-t text-white select-none">
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
        class={`flex items-center justify-between bg-[#15151e] border-b-2 border-white/20 px-3 py-1.5 ${
          props.isEditMode ? "border-x border-white/20" : "rounded-t border border-white/10"
        } shadow-sm`}
      >
        <div class="flex items-center gap-2">
          {/* F1 High-Tech Opposing Chevrons (Ahead / My Car / Behind) - Zero Circles */}
          <svg
            viewBox="0 0 16 16"
            class="w-3.5 h-3.5 text-amber-400 shrink-0"
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
        <span class="text-[9px] font-mono font-bold text-amber-400/90 tracking-wide">
          ±{carsAheadBehind()} CARS
        </span>
      </div>

      {/* Subheader: POS, #, DRIVER, TYRE, GAP */}
      {/* ponytail: unified grid layout and synchronized border-box padding ensure 100% mathematical text alignment between header and body rows */}
      <div class="grid grid-cols-[40px_42px_1fr_36px_74px] items-center px-2 py-1 bg-black/85 text-[9px] font-mono text-white/45 tracking-wider border-b border-white/[0.08] border-l-[3.5px] border-l-transparent">
        <span class="text-center font-bold">POS</span>
        <span class="text-center font-bold">#</span>
        <span class="pl-2 font-bold text-left">DRIVER</span>
        <span class="text-center font-bold">TYRE</span>
        <span class="text-right pr-2 font-bold">GAP</span>
      </div>

      {/* Rows */}
      <div class="flex flex-col gap-[1px] bg-black/60">
        <For each={visibleList()}>
          {(d) => {
            const isAhead = d.gapSeconds < 0;
            const formattedGap = d.isPlayer
              ? "0.000s"
              : `${isAhead ? "" : "+"}${d.gapSeconds.toFixed(3)}s`;

            return (
              <div
                ref={flip.row(d.carNumber)}
                class={`grid grid-cols-[40px_42px_1fr_36px_74px] items-center h-[28px] px-2 transition-colors duration-150 border-l-[3.5px] ${
                  d.isPlayer
                    ? "bg-[#00d26a]/15 ring-1 ring-inset ring-[#00d26a]/80 shadow-[0_0_16px_rgba(0,210,106,0.25)] border-l-[#00d26a]"
                    : "bg-[#13141c]/95 hover:bg-[#181a24]/95 border-l-transparent"
                }`}
              >
                {/* 1. POS: Overall/Class Position */}
                <div class="flex items-center justify-center h-full">
                  <span
                    class={`text-[10px] font-mono font-bold tabular-nums ${
                      d.isPlayer ? "text-[#00d26a] font-black" : "text-white/60"
                    }`}
                  >
                    P{d.position ?? "-"}
                  </span>
                </div>

                {/* 2. Car Number (#): Dedicated spacious column */}
                <div class="flex items-center justify-center h-full">
                  <span
                    class={`text-[10px] font-mono font-bold tabular-nums ${
                      d.isPlayer ? "text-[#00d26a]" : "text-amber-400/90"
                    }`}
                  >
                    #{d.carNumber}
                  </span>
                </div>

                {/* 3. Driver: Clear gap from car number, Team stripe, Flag, YOU badge, Name */}
                <div class="flex items-center h-full pl-2 pr-1 relative overflow-hidden min-w-0 gap-1.5">
                  <Show when={!d.isPlayer}>
                    <div
                      class="w-[3px] h-3.5 shrink-0 rounded-full"
                      style={{ "background-color": d.teamColor }}
                    />
                  </Show>
                  <CountryFlag
                    code={d.country || "US"}
                    class="w-4 h-2.5 rounded-[1.5px] border border-white/20 shadow-sm shrink-0"
                  />
                  <Show when={d.isPlayer}>
                    <span class="text-[8px] font-mono font-black px-1 py-0.2 rounded bg-[#00d26a] text-black shrink-0 tracking-wider shadow-sm">
                      YOU
                    </span>
                  </Show>
                  <span
                    class={`text-[12px] truncate tracking-tight ${
                      d.isPlayer
                        ? "text-white font-black drop-shadow-[0_0_6px_rgba(0,210,106,0.4)]"
                        : isAhead
                        ? "text-[#f5f5f7] font-medium"
                        : "text-white/80"
                    }`}
                  >
                    {d.name}
                  </span>
                </div>

                {/* 4. Tyre badge: 100% Vector SVG */}
                <div class="flex items-center justify-center shrink-0">
                  <TireBadge compound={d.tireCompound} />
                </div>

                {/* 5. Gap: Tabular monospace delta */}
                <div class="text-right pr-2 shrink-0">
                  <span
                    class={`font-mono text-xs font-bold tabular-nums tracking-wider ${
                      d.isPlayer
                        ? "text-[#00d26a] font-black drop-shadow-[0_0_8px_rgba(0,210,106,0.5)]"
                        : isAhead
                        ? "text-[#ff9f0a]"
                        : "text-white/90"
                    }`}
                  >
                    {formattedGap}
                  </span>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* Bottom Border Accent */}
      <div class="h-1 bg-[#15151e] rounded-b border-t border-white/[0.08]" />

      {/* 1. Horizontal Drag Resize Handle (Right Edge: Width) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleResizeMouseDown}
          class="absolute -right-2.5 top-6 bottom-6 w-4 flex items-center justify-center cursor-ew-resize group z-50 pointer-events-auto select-none"
          title={`가로 너비 조절 (현재 ${currentWidth()}px)`}
        >
          <div
            class={`w-1.5 h-12 rounded-full shadow-lg border border-black/40 transition-all ${
              isResizingWidth() ? "bg-amber-300 h-16 scale-110" : "bg-amber-400 group-hover:bg-amber-300"
            }`}
          />
        </div>
      </Show>

      {/* 2. Vertical Drag Resize Handle (Bottom Edge: Ahead/Behind Count) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleHeightResizeMouseDown}
          class="absolute -bottom-3 left-6 right-6 h-5 flex items-center justify-center cursor-ns-resize group z-50 pointer-events-auto select-none"
          title={`앞뒤 표시 차량 수 조절 (현재 ±${carsAheadBehind()}대 표시)`}
        >
          <div
            class={`h-1.5 w-16 rounded-full shadow-lg border border-black/40 transition-all flex items-center justify-center ${
              isResizingHeight() ? "bg-amber-300 w-24 scale-110" : "bg-amber-400 group-hover:bg-amber-300"
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

      {/* 3. Corner Drag Resize Handle (Bottom-Right) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleCornerResizeMouseDown}
          class="absolute -right-2.5 -bottom-2.5 w-5 h-5 flex items-center justify-center cursor-nwse-resize group z-50 pointer-events-auto select-none"
          title={`대각선 크기 조절 (가로 ${currentWidth()}px × 앞뒤 ±${carsAheadBehind()}대)`}
        >
          <div
            class={`w-3.5 h-3.5 rounded-full shadow-xl border-2 border-black/60 transition-all ${
              isResizingCorner()
                ? "bg-amber-300 scale-125 ring-2 ring-amber-400/50"
                : "bg-amber-400 group-hover:bg-amber-300 group-hover:scale-110"
            }`}
          />
        </div>
      </Show>
    </div>
  );
};


import { Component, Show, For, createSignal, createMemo, onCleanup } from "solid-js";
import { IconStopwatch, IconChevronDown, IconChevronUp } from "../../assets/icons/Icons.tsx";
import { LapDeltaTelemetry, SectorColor } from "../../services/telemetry/types.ts";
import { t } from "../../i18n/index.ts";

export interface LapDeltaProps {
  lapDelta?: LapDeltaTelemetry;
  deltaSeconds?: number;
  targetName?: string;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
}

function getSectorStyle(status: SectorColor) {
  switch (status) {
    case "purple":
      return {
        bg: "bg-[#B055F5]",
        border: "border-[#B055F5]",
        text: "text-black",
      };
    case "green":
      return {
        bg: "bg-[#00D26A]",
        border: "border-[#00D26A]",
        text: "text-black",
      };
    case "yellow":
      return {
        bg: "bg-[#FFD100]",
        border: "border-[#FFD100]",
        text: "text-black",
      };
    default:
      return {
        bg: "bg-white/[0.04]",
        border: "border-white/10",
        text: "text-white/30",
      };
  }
}

export const LapDelta: Component<LapDeltaProps> = (props) => {
  // Width control: default 440px, min 340px, max 640px
  const currentWidth = () => Math.max(340, Math.min(640, props.width ?? 440));

  // Edit mode test toggle (0: Personal Best -0.24s, 1: Slower +0.38s, 2: Session Purple -0.65s)
  const [testMode, setTestMode] = createSignal<0 | 1 | 2>(0);
  const [isResizing, setIsResizing] = createSignal(false);

  // Active data source (live telemetry or edit-mode test fallback)
  const activeDelta = createMemo(() => {
    if (props.isEditMode) {
      if (testMode() === 1) {
        return {
          delta: 0.382,
          isValid: true,
          isFaster: false,
          isPurple: false,
          targetName: "VS BEST",
          currentSector: 2 as 1 | 2 | 3,
          sectors: [
            { sectorNumber: 1 as const, status: "yellow" as SectorColor, deltaSeconds: 0.145, isCurrent: false },
            { sectorNumber: 2 as const, status: "green" as SectorColor, deltaSeconds: -0.042, isCurrent: true },
            { sectorNumber: 3 as const, status: "yellow" as SectorColor, deltaSeconds: 0.279, isCurrent: false },
          ],
        };
      } else if (testMode() === 2) {
        return {
          delta: -0.648,
          isValid: true,
          isFaster: true,
          isPurple: true,
          targetName: "VS SESSION",
          currentSector: 3 as 1 | 2 | 3,
          sectors: [
            { sectorNumber: 1 as const, status: "purple" as SectorColor, deltaSeconds: -0.245, isCurrent: false },
            { sectorNumber: 2 as const, status: "purple" as SectorColor, deltaSeconds: -0.210, isCurrent: false },
            { sectorNumber: 3 as const, status: "purple" as SectorColor, deltaSeconds: -0.193, isCurrent: true },
          ],
        };
      } else {
        return {
          delta: -0.234,
          isValid: true,
          isFaster: true,
          isPurple: false,
          targetName: "VS BEST",
          currentSector: 2 as 1 | 2 | 3,
          sectors: [
            { sectorNumber: 1 as const, status: "purple" as SectorColor, deltaSeconds: -0.185, isCurrent: false },
            { sectorNumber: 2 as const, status: "green" as SectorColor, deltaSeconds: -0.062, isCurrent: true },
            { sectorNumber: 3 as const, status: "none" as SectorColor, deltaSeconds: undefined, isCurrent: false },
          ],
        };
      }
    }

    const live = props.lapDelta;
    const targetMode = live?.targetMode ?? "best";
    const d = live
      ? targetMode === "last"
        ? live.deltaToLast
        : live.deltaToBest
      : props.deltaSeconds ?? 0;
    const isValid = live
      ? targetMode === "last"
        ? live.deltaToLastValid
        : live.deltaToBestValid
      : props.deltaSeconds !== undefined && Number.isFinite(props.deltaSeconds);
    const isFaster = d <= 0;
    const isPurple = Boolean(
      live?.deltaToSessionBestValid &&
      live.deltaToSessionBest !== undefined &&
      live.deltaToSessionBest < 0
    );
    const targetName = props.targetName || (targetMode === "last" ? "VS LAST" : "VS BEST");
    const currentSector = live?.currentSector ?? 1;
    const sectors = live?.sectors ?? [
      { sectorNumber: 1 as const, status: "none" as SectorColor, deltaSeconds: undefined, isCurrent: false },
      { sectorNumber: 2 as const, status: "none" as SectorColor, deltaSeconds: undefined, isCurrent: false },
      { sectorNumber: 3 as const, status: "none" as SectorColor, deltaSeconds: undefined, isCurrent: false },
    ];

    return {
      delta: d,
      isValid,
      isFaster,
      isPurple,
      targetName,
      currentSector,
      sectors,
    };
  });

  const deltaText = () => {
    if (!activeDelta().isValid) return "—.---";
    const val = activeDelta().delta;
    const sign = val > 0 ? "+" : "";
    return `${sign}${val.toFixed(3)}`;
  };

  // Center 0 percentage bar (-1.0s to +1.0s)
  const barPercent = () => {
    if (!activeDelta().isValid) return 0;
    const clamped = Math.max(-1.0, Math.min(1.0, activeDelta().delta));
    return Math.abs(clamped) * 50; // 0% to 50% of half-width
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
      const newWidth = Math.round(Math.max(340, Math.min(640, startWidth + deltaX)));
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

  return (
    <div
      class="relative flex flex-col font-sans select-none"
      style={{
        width: `${currentWidth()}px`,
      }}
    >
      {/* Edit Mode Top Control Bar */}
      <Show when={props.isEditMode}>
        <div class="flex items-center justify-between px-3 py-1 bg-black/90 backdrop-blur-md border-t border-x border-white/20 rounded-t text-white select-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTestMode((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
            }}
            class="px-2 py-0.5 rounded-[2px] bg-[#E10600]/15 hover:bg-[#E10600]/25 text-white border border-[#E10600]/60 text-[10px] font-mono font-bold cursor-pointer transition-all active:scale-95"
            title="델타 테스트 상태 전환 (베스트 / 지연 / 세션 최고)"
          >
            {t().deltaModeBtn}: {testMode() === 0 ? "BEST" : testMode() === 1 ? "SLOWER" : "PURPLE"}
          </button>

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

      {/* Main Horizontal 3-Sector LapDelta Bar */}
      <div
        class={`relative flex items-center h-[42px] px-2 bg-[#12141c]/95 backdrop-blur-md border border-l-[3px] border-l-[#E10600] shadow-[0_8px_24px_rgba(0,0,0,0.55)] ${
          props.isEditMode ? "rounded-b-[3px] border-b border-r border-white/20" : "rounded-[3px] border-white/15"
        }`}
      >
        {/* 1. Target Comparison Pill (Left) */}
        <div class="flex items-center gap-1.5 px-2 py-1 border-r border-white/10 shrink-0">
          <IconStopwatch size={13} class="text-[#E10600] shrink-0" />
          <span class="text-[10px] font-mono font-black text-white/80 tracking-wider whitespace-nowrap">
            {activeDelta().targetName}
          </span>
        </div>

        {/* 2. Live Delta Time & Center-0 Gauge Bar (Center) */}
        <div class="flex-1 flex flex-col justify-center px-2.5 min-w-0">
          {/* Top row: Delta number + Chevron */}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <Show when={activeDelta().isValid}>
                <Show
                  when={activeDelta().isFaster}
                  fallback={<IconChevronUp class="w-3.5 h-3.5 text-[#ff4d4d] shrink-0" />}
                >
                  <IconChevronDown
                    class={`w-3.5 h-3.5 shrink-0 ${activeDelta().isPurple ? "text-[#B055F5]" : "text-[#00D26A]"}`}
                  />
                </Show>
              </Show>
              <span
                class={`font-mono text-[16px] font-black tracking-wider tabular-nums leading-none ${
                  !activeDelta().isValid
                    ? "text-white/35"
                    : activeDelta().isPurple
                    ? "text-[#B055F5]"
                    : activeDelta().isFaster
                    ? "text-[#00D26A]"
                    : "text-[#ff4d4d]"
                }`}
              >
                {deltaText()}s
              </span>
            </div>

            <Show when={currentWidth() >= 420}>
              <span class="text-[9px] font-mono text-white/40 tracking-wider">
                {!activeDelta().isValid ? "NO DATA" : activeDelta().isPurple ? "SESSION BEST" : activeDelta().isFaster ? "FASTER" : "SLOWER"}
              </span>
            </Show>
          </div>

          {/* Bottom row: Center-0 Symmetrical Delta Gauge Bar */}
          <div class="relative w-full h-[5px] mt-1 bg-black/60 rounded-full border border-white/10 overflow-hidden">
            {/* Center Zero Marker Tick */}
            <div class="absolute left-1/2 -top-0.5 bottom-0.5 w-[1.5px] bg-white/50 z-20 -translate-x-1/2" />

            {/* Faster bar (grows left from center) */}
            <Show when={activeDelta().isValid && activeDelta().isFaster}>
              <div
                class={`absolute top-0 bottom-0 right-1/2 rounded-l-full transition-all duration-75 ${
                  activeDelta().isPurple ? "bg-[#B055F5]" : "bg-[#00D26A]"
                }`}
                style={{
                  width: `${barPercent()}%`,
                  "box-shadow": activeDelta().isPurple ? "0 0 4px #B055F5" : "0 0 4px #00D26A",
                }}
              />
            </Show>

            {/* Slower bar (grows right from center) */}
            <Show when={activeDelta().isValid && !activeDelta().isFaster}>
              <div
                class="absolute top-0 bottom-0 left-1/2 rounded-r-full bg-[#ff3b30] transition-all duration-75"
                style={{
                  width: `${barPercent()}%`,
                  "box-shadow": "0 0 6px #ff3b30",
                }}
              />
            </Show>
          </div>
        </div>

        {/* 3. 3-Sector Segment Blocks [ S1 | S2 | S3 ] (Right) */}
        <div class="flex items-center gap-1 shrink-0 pl-1">
          <For each={activeDelta().sectors}>
            {(sec) => {
              const style = getSectorStyle(sec.status);
              const isCurr = () => sec.isCurrent;

              return (
                <div
                  class={`relative flex flex-col items-center justify-center w-10 h-[30px] rounded-[2px] border ${
                    style.bg
                  } ${style.border} ${
                    isCurr() ? "ring-1 ring-inset ring-white/90" : ""
                  }`}
                  title={`Sector ${sec.sectorNumber}: ${sec.status.toUpperCase()} ${
                    sec.deltaSeconds !== undefined ? `(${sec.deltaSeconds > 0 ? "+" : ""}${sec.deltaSeconds.toFixed(2)}s)` : ""
                  }`}
                >
                  {/* Sector Number */}
                  <span class={`text-[11px] font-mono font-black leading-none ${style.text}`}>
                    S{sec.sectorNumber}
                  </span>

                  {/* Sector Split/Delta Time */}
                  <span class={`text-[8px] font-mono font-bold tabular-nums leading-none mt-0.5 ${sec.status === "none" ? "text-white/35" : "text-black/75"}`}>
                    {sec.deltaSeconds !== undefined
                      ? `${sec.deltaSeconds > 0 ? "+" : ""}${sec.deltaSeconds.toFixed(2)}`
                      : isCurr()
                      ? "LIVE"
                      : "—"}
                  </span>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      {/* Right Edge Horizontal Drag Handle */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleResizeMouseDown}
          class="absolute -right-2.5 top-5 bottom-1 w-4 flex items-center justify-center cursor-ew-resize group z-50 pointer-events-auto select-none"
          title={`가로 너비 조절 (현재 ${currentWidth()}px)`}
        >
          <div
            class={`w-1.5 h-7 rounded-full shadow-lg border border-black/40 transition-all ${
              isResizing() ? "bg-[#E10600] h-9 scale-110" : "bg-white/70 group-hover:bg-white"
            }`}
          />
        </div>
      </Show>
    </div>
  );
};

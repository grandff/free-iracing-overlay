import { Component, Show, For, createSignal, createMemo, onCleanup } from "solid-js";
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
        <div class="flex items-center justify-between px-3 py-1 f1-slab border-b-0 text-white select-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTestMode((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
            }}
            class="px-2 py-0.5 bg-[#E10600]/20 hover:bg-[#E10600]/35 text-white border border-[#E10600]/70 text-[10px] f1-oblique cursor-pointer transition-all active:scale-95"
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

      {/* F1 world-feed delta strip: oblique caps, square corners, value-over-label,
          red rule tab on the left — same lockup the broadcast uses for onboard delta. */}
      <div
        class={`relative flex items-stretch h-[46px] f1-slab border-l-[3px] border-l-[#E10600] ${
          props.isEditMode ? "border-b border-r border-t-0" : ""
        }`}
      >
        {/* 1. Reference target — micro caps label, no icon chrome */}
        <div class="flex flex-col justify-center px-2.5 shrink-0 w-[64px]">
          <span class="f1-oblique text-[11px] leading-none text-white">
            {activeDelta().targetName.replace("VS ", "")}
          </span>
          <span class="f1-label mt-1">TARGET</span>
        </div>

        <div class="f1-divider my-2" />

        {/* 2. Live delta — big oblique value over its label, centre-zero rule beneath */}
        <div class="flex-1 flex flex-col justify-center px-3 min-w-0">
          <div class="flex items-baseline justify-between">
            <div class="flex items-baseline gap-1">
              <span
                class={`f1-value text-[26px] ${
                  !activeDelta().isValid
                    ? "text-white/30"
                    : activeDelta().isPurple
                    ? "text-[#B055F5]"
                    : activeDelta().isFaster
                    ? "text-[#00D26A]"
                    : "text-[#FF3B30]"
                }`}
              >
                {deltaText()}
              </span>
              <span class="f1-oblique text-[11px] text-white/45 -ml-0.5">S</span>
            </div>

            <Show when={currentWidth() >= 400}>
              <span
                class={`f1-oblique text-[9px] tracking-[0.14em] ${
                  !activeDelta().isValid
                    ? "text-white/30"
                    : activeDelta().isPurple
                    ? "text-[#B055F5]"
                    : activeDelta().isFaster
                    ? "text-[#00D26A]"
                    : "text-[#FF3B30]"
                }`}
              >
                {!activeDelta().isValid
                  ? "NO DATA"
                  : activeDelta().isPurple
                  ? "SESSION BEST"
                  : activeDelta().isFaster
                  ? "FASTER"
                  : "SLOWER"}
              </span>
            </Show>
          </div>

          {/* Centre-zero rule: square, 3px, grows out from the middle tick */}
          <div class="relative w-full h-[3px] mt-2 bg-white/[0.16]">
            <div class="absolute left-1/2 -top-[2px] -bottom-[2px] w-px bg-white/70 -translate-x-1/2 z-20" />
            <Show when={activeDelta().isValid && activeDelta().isFaster}>
              <div
                class={`absolute inset-y-0 right-1/2 transition-[width] duration-75 ${
                  activeDelta().isPurple ? "bg-[#B055F5]" : "bg-[#00D26A]"
                }`}
                style={{ width: `${barPercent()}%` }}
              />
            </Show>
            <Show when={activeDelta().isValid && !activeDelta().isFaster}>
              <div
                class="absolute inset-y-0 left-1/2 bg-[#FF3B30] transition-[width] duration-75"
                style={{ width: `${barPercent()}%` }}
              />
            </Show>
          </div>
        </div>

        <div class="f1-divider my-2" />

        {/* 3. Sector strip — F1 timing-tower bars: number above, colour bar below */}
        <div class="flex items-center gap-[3px] shrink-0 px-2.5">
          <For each={activeDelta().sectors}>
            {(sec) => {
              const colour = () =>
                sec.status === "purple"
                  ? "#B055F5"
                  : sec.status === "green"
                  ? "#00D26A"
                  : sec.status === "yellow"
                  ? "#FFD100"
                  : "rgba(255,255,255,0.16)";

              return (
                <div
                  class="flex flex-col items-center justify-center w-[40px]"
                  title={`Sector ${sec.sectorNumber}: ${sec.status.toUpperCase()}${
                    sec.deltaSeconds !== undefined
                      ? ` (${sec.deltaSeconds > 0 ? "+" : ""}${sec.deltaSeconds.toFixed(2)}s)`
                      : ""
                  }`}
                >
                  <span
                    class={`f1-value text-[9px] ${
                      sec.status === "none" ? "text-white/30" : "text-white"
                    }`}
                  >
                    {sec.deltaSeconds !== undefined
                      ? `${sec.deltaSeconds > 0 ? "+" : ""}${sec.deltaSeconds.toFixed(2)}`
                      : sec.isCurrent
                      ? "LIVE"
                      : "—"}
                  </span>
                  <div
                    class="w-full h-[5px] mt-1.5"
                    style={{
                      background: colour(),
                      "box-shadow": sec.isCurrent ? `0 0 6px ${colour()}` : undefined,
                    }}
                  />
                  <span class="f1-label mt-1">S{sec.sectorNumber}</span>
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

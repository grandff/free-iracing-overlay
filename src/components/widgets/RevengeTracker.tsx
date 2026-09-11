import { Component, Show, createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import { RevengeTelemetry, SessionType } from "../../services/telemetry/types.ts";
import { IconCrosshair, IconWarning } from "../../assets/icons/Icons.tsx";
import { CountryFlag } from "../../assets/icons/CountryFlags.tsx";
import { CarBrandIcon } from "../../assets/icons/CarBrandIcons.tsx";
import { settings, updateSettings, updateWidgetTransform } from "../../stores/settingsStore.ts";
import { t } from "../../i18n/index.ts";

export interface RevengeTrackerProps {
  revenge?: RevengeTelemetry;
  hasTarget?: boolean;
  targetCarNumber?: string;
  targetDriverName?: string;
  targetCountry?: string;
  targetCarBrand?: string;
  targetPosition?: number;
  gapSeconds?: number;
  sessionType?: SessionType;
  playerLastLapTime?: number;
  isEditMode?: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
  persistenceMode?: "session" | "5min";
  onPersistenceModeChange?: (mode: "session" | "5min") => void;
}

export const RevengeTracker: Component<RevengeTrackerProps> = (props) => {
  // Width control: default 340px, min 280px, max 480px
  const currentWidth = () => Math.max(280, Math.min(480, props.width ?? 340));

  // Current persistence setting: read from props, store, or default to "session"
  const persistenceSetting = () =>
    props.persistenceMode ||
    settings.widgets.revengeTracker?.persistenceMode ||
    settings.revengePersistence ||
    "session";

  // Toggle persistence mode
  const togglePersistenceMode = (e: MouseEvent) => {
    e.stopPropagation();
    const nextMode = persistenceSetting() === "session" ? "5min" : "session";
    updateSettings("revengePersistence", nextMode);
    updateWidgetTransform("revengeTracker", { persistenceMode: nextMode });
    props.onPersistenceModeChange?.(nextMode);
  };

  // Edit Mode Test Cycling: 0=Live, 1=Target A (+1.4s), 2=Target B (-3.8s), 3=5min countdown test, 4=Disabled/None
  const [testStep, setTestStep] = createSignal<0 | 1 | 2 | 3 | 4>(0);
  const testBaseTime = Date.now();

  const cycleTest = (e: MouseEvent) => {
    e.stopPropagation();
    setTestStep((prev) => ((prev + 1) % 5) as 0 | 1 | 2 | 3 | 4);
  };

  const testLabel = createMemo(() => {
    switch (testStep()) {
      case 0: return "LIVE";
      case 1: return "P2 VER (+1.4s)";
      case 2: return "P5 GOR (-3.8s)";
      case 3: return "5-MIN TEST";
      case 4: return "OFF";
      default: return "TEST";
    }
  });

  // Current system clock for 5-minute countdown
  const [now, setNow] = createSignal(Date.now());

  const hasActiveTarget = () => {
    if (props.isEditMode) return true;
    return !!(props.revenge?.hasTarget || props.hasTarget);
  };

  // Only run the 1-second countdown timer when a target is actually active
  createEffect(() => {
    if (!hasActiveTarget()) return;
    const timerInterval = setInterval(() => setNow(Date.now()), 1000);
    onCleanup(() => clearInterval(timerInterval));
  });

  // Active data derived from live telemetry or edit-mode test steps
  const activeData = createMemo(() => {
    if (props.isEditMode) {
      switch (testStep()) {
        case 1:
          return {
            hasTarget: true,
            driverName: "M. Verstappen",
            carNumber: "1",
            country: "NL",
            carBrand: "Red Bull",
            position: 2,
            gapSeconds: 1.42,
            incidentCount: 4,
            incidentTimestamp: testBaseTime - 30_000,
            avgLapTime: 84.22,
            lastLapDelta: +0.22,
            targetLastLapTime: 84.34,
            playerLastLapTime: 84.12,
          };
        case 2:
          return {
            hasTarget: true,
            driverName: "J. Gordon",
            carNumber: "24",
            country: "US",
            carBrand: "Corvette",
            position: 5,
            gapSeconds: -3.85,
            incidentCount: 4,
            incidentTimestamp: testBaseTime - 90_000,
            avgLapTime: 87.55,
            lastLapDelta: +3.68,
            targetLastLapTime: 87.80,
            playerLastLapTime: 84.12,
          };
        case 3:
          return {
            hasTarget: true,
            driverName: "C. Leclerc",
            carNumber: "16",
            country: "MC",
            carBrand: "Ferrari",
            position: 3,
            gapSeconds: -0.85,
            incidentCount: 2,
            incidentTimestamp: testBaseTime - 145_000,
            avgLapTime: 84.50,
            lastLapDelta: -0.15,
            targetLastLapTime: 83.97,
            playerLastLapTime: 84.12,
          };
        case 4:
          return {
            hasTarget: false,
            driverName: "",
            carNumber: "",
            country: "KR",
            carBrand: "Porsche",
            position: 0,
            gapSeconds: 0,
            incidentCount: 0,
            incidentTimestamp: 0,
            avgLapTime: 0,
            lastLapDelta: 0,
            targetLastLapTime: 0,
            playerLastLapTime: 0,
          };
        case 0:
        default:
          break;
      }
    }

    const rev = props.revenge;
    return {
      hasTarget: rev?.hasTarget ?? props.hasTarget ?? false,
      driverName: rev?.driverName || props.targetDriverName || "M. Verstappen",
      carNumber: rev?.carNumber || props.targetCarNumber || "1",
      country: rev?.country || props.targetCountry || "NL",
      carBrand: rev?.carBrand || props.targetCarBrand || "Red Bull",
      position: rev?.position ?? props.targetPosition ?? 2,
      gapSeconds: rev?.gapSeconds ?? props.gapSeconds ?? 0,
      incidentCount: rev?.incidentCount ?? 4,
      incidentTimestamp: rev?.incidentTimestamp || (testBaseTime - 45_000),
      avgLapTime: rev?.avgLapTime ?? 84.22,
      lastLapDelta: rev?.lastLapDelta ?? +0.22,
      targetLastLapTime: rev?.targetLastLapTime ?? 84.34,
      playerLastLapTime: rev?.playerLastLapTime ?? props.playerLastLapTime ?? 84.12,
    };
  });

  // Check 5-minute expiration
  const secondsRemaining = () => {
    if (persistenceSetting() !== "5min") return null;
    const elapsed = Math.floor((now() - (activeData().incidentTimestamp || now())) / 1000);
    return Math.max(0, 300 - elapsed);
  };

  const isExpired = () => persistenceSetting() === "5min" && (secondsRemaining() ?? 0) <= 0;

  // Session rule check: Only active in PRACTICE and RACE. Hidden in QUALIFY!
  const isQualifySession = () => props.sessionType === "QUALIFY";
  const shouldRender = () => {
    if (props.isEditMode) return true;
    if (isQualifySession()) return false;
    return activeData().hasTarget && !isExpired();
  };

  // Lap time format helper (e.g. 84.22 -> 1:24.22)
  const formatLapTime = (sec: number) => {
    if (!sec || sec <= 0) return "--:--.---";
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${m}:${s.padStart(5, "0")}`;
  };

  // Horizontal Resize Drag Handling
  const [isResizing, setIsResizing] = createSignal(false);
  let startX = 0;
  let startW = 340;

  const onMouseDownResize = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    startX = e.clientX;
    startW = currentWidth();

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const targetW = Math.max(280, Math.min(460, Math.round(startW + deltaX)));
      props.onWidthChange?.(targetW);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <Show when={shouldRender()}>
      <div
        class="relative flex flex-col font-sans select-none"
        style={{
          width: `${currentWidth()}px`,
        }}
      >
        {/* Edit Mode Toolbar */}
        <Show when={props.isEditMode}>
          <div class="w-full flex items-center justify-between px-2.5 py-1 mb-1.5 f1-slab text-white z-30 select-none">
            <div class="flex items-center gap-1.5">
              <IconCrosshair size={13} class="text-[#E10600] animate-pulse" />
              <span class="f1-title text-[10px] text-white">REVENGE</span>
            </div>

            <div class="flex items-center gap-1">
              <button
                onClick={cycleTest}
                class="px-2 py-0.5 rounded-[1px] bg-[#E10600]/20 hover:bg-[#E10600]/35 text-white border border-[#E10600]/70 text-[9px] f1-oblique tracking-wider transition-all active:scale-95 cursor-pointer"
                title="상태 전환"
              >
                {testLabel()}
              </button>

              {/* Scale +/- Controls */}
              <div class="flex items-center gap-0.5 bg-white/5 rounded-[1px] px-1 border border-white/10 ml-1">
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

        {/* Qualifying Disabled Warning Banner (Visible only in Edit Mode when qualifying) */}
        <Show when={props.isEditMode && isQualifySession()}>
          <div class="w-full mb-1 py-1 px-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold flex items-center gap-1.5 rounded-[1px]">
            <IconWarning size={12} class="shrink-0 text-amber-400" />
            <span class="tracking-tight uppercase">
              {t().revengeQualifyHidden || "DISABLED IN QUALIFYING (PRACTICE & RACE ONLY)"}
            </span>
          </div>
        </Show>

        {/* Main F1 Red Revenge Card */}
        <div
          class="w-full relative overflow-hidden f1-slab transition-all duration-150 p-2.5 shadow-[0_0_24px_rgba(225,6,0,0.45)] border-l-4 border-l-[#E10600] border-red-500/50 bg-gradient-to-r from-red-950/90 via-[#12141c]/95 to-red-950/90 flex flex-col rounded-none"
        >
          {/* Top Header Bar: Title + Contact Tag + Persistence Toggle */}
          <div class="w-full flex items-center justify-between pb-2 border-b border-white/10">
            <div class="flex items-center gap-1.5">
              <IconCrosshair size={15} class="text-[#E10600] animate-pulse shrink-0" />
              <span class="f1-title text-[11px] text-white tracking-wider">
                {t().revengeTarget || "REVENGE TARGET"}
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              {/* Incident Penalty Badge */}
              <span class="px-1.5 py-[1px] bg-[#E10600] text-white font-black text-[9px] f1-oblique tracking-wider rounded-[1px] shadow-[0_0_8px_#E10600]">
                +{activeData().incidentCount}x CONTACT
              </span>

              {/* Persistence Mode Toggle Button (Session vs 5-Min) */}
              <button
                onClick={togglePersistenceMode}
                class={`px-1.5 py-[1px] rounded-[1px] text-[8.5px] font-mono font-black tracking-tight border transition-all cursor-pointer f1-oblique ${
                  persistenceSetting() === "5min"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                }`}
                title="클릭하여 유지 모드 변경 (세션 끝까지 vs 5분 후 자동 리셋)"
              >
                {persistenceSetting() === "5min"
                  ? (t().revenge5MinMode || "5 MIN")
                  : (t().revengeSessionMode || "SESSION")}
              </button>
            </div>
          </div>

          {/* Driver & Car Identity Row (Country, Brand, Name, Car#, Position) */}
          <div class="w-full flex items-center justify-between py-2 px-1 border-b border-white/10">
            <div class="flex items-center gap-2 min-w-0">
              {/* 1. Country Flag SVG */}
              <CountryFlag
                code={activeData().country}
                class="w-4.5 h-3 rounded-[1px] border border-white/25 shrink-0 shadow-sm"
              />

              {/* 2. Official Car Brand Vector Logo */}
              <div class="w-4.5 h-4 flex items-center justify-center shrink-0">
                <CarBrandIcon
                  brand={activeData().carBrand}
                  class="w-3.5 h-3.5 object-contain select-none pointer-events-none opacity-95"
                />
              </div>

              {/* 3. Driver Name & Car Number */}
              <div class="flex items-baseline gap-1.5 min-w-0 truncate">
                <span class="f1-value text-sm text-white uppercase tracking-tight truncate">
                  {activeData().driverName}
                </span>
                <span class="text-[10px] font-mono font-bold text-white/50 shrink-0">
                  #{activeData().carNumber}
                </span>
              </div>
            </div>

            {/* 4. Target Current Race Position */}
            <div class="flex items-center shrink-0 pl-1">
              <span class="px-1.5 py-0.5 bg-red-600/30 text-red-200 border border-red-500/50 rounded-[1px] text-[10px] font-black font-mono f1-oblique shadow-sm">
                P{activeData().position}
              </span>
            </div>
          </div>

          {/* 3-Column Battle Telemetry Grid: GAP | AVG LAP | VS MY LAST */}
          <div class="grid grid-cols-3 px-1 py-2 items-center bg-black/35 border-b border-white/10 text-center">
            {/* 1. Interval / Gap to You */}
            <div class="flex flex-col items-center justify-center">
              <div class="flex items-baseline gap-0.5">
                <span
                  class={`f1-value text-lg tabular-nums ${
                    activeData().gapSeconds >= 0 ? "text-[#38bdf8]" : "text-[#f97316]"
                  }`}
                >
                  {activeData().gapSeconds >= 0 ? "+" : ""}
                  {activeData().gapSeconds.toFixed(2)}
                </span>
                <span class="text-[8px] font-mono font-bold text-white/50">S</span>
              </div>
              <span class="f1-label mt-0.5 text-white/50">
                {activeData().gapSeconds >= 0 ? "AHEAD" : "BEHIND"} • {t().revengeInterval || "GAP"}
              </span>
            </div>

            {/* 2. Target Average Lap */}
            <div class="flex flex-col items-center justify-center border-l border-white/10">
              <div class="flex items-baseline gap-0.5">
                <span class="f1-value text-base text-white tabular-nums">
                  {formatLapTime(activeData().avgLapTime)}
                </span>
              </div>
              <span class="f1-label mt-0.5 text-white/50">
                {t().revengeAvgLap || "AVG LAP"}
              </span>
            </div>

            {/* 3. Last Lap Delta vs Player */}
            <div class="flex flex-col items-center justify-center border-l border-white/10">
              <div class="flex items-baseline gap-0.5">
                <span
                  class={`f1-value text-base tabular-nums ${
                    activeData().lastLapDelta <= 0
                      ? "text-[#00D26A]" // Target was slower -> You are faster!
                      : "text-[#FFD100]" // Target was faster on last lap
                  }`}
                >
                  {activeData().lastLapDelta >= 0 ? "+" : ""}
                  {activeData().lastLapDelta.toFixed(2)}
                </span>
                <span class="text-[8px] font-mono font-bold text-white/50">S</span>
              </div>
              <span class="f1-label mt-0.5 text-white/50">
                {t().revengeLastDelta || "VS MY LAST"}
              </span>
            </div>
          </div>

          {/* Bottom Tactical Status Strip */}
          <div class="w-full flex items-center justify-between pt-1.5 text-[9px] font-mono">
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-[1px] bg-[#E10600] animate-pulse" />
              <span class="text-red-300 font-bold uppercase tracking-wider f1-oblique">
                TARGET LOCKED
              </span>
            </div>

            <Show
              when={persistenceSetting() === "5min"}
              fallback={
                <span class="text-white/40 uppercase tracking-widest text-[8.5px]">
                  LOCK: FULL SESSION
                </span>
              }
            >
              <div class="flex items-center gap-1 text-amber-300 font-bold tracking-wider">
                <span class="text-[8px] text-white/40 uppercase">RESET IN</span>
                <span class="tabular-nums">
                  {Math.floor((secondsRemaining() ?? 0) / 60)}:
                  {String((secondsRemaining() ?? 0) % 60).padStart(2, "0")}
                </span>
              </div>
            </Show>
          </div>
        </div>

        {/* Resize Handle for Edit Mode */}
        <Show when={props.isEditMode}>
          <div
            onMouseDown={onMouseDownResize}
            class={`absolute right-[-6px] top-1/2 -translate-y-1/2 w-3.5 h-12 rounded-r-[1px] flex items-center justify-center cursor-ew-resize transition-colors ${
              isResizing() ? "bg-[#E10600] shadow-[0_0_12px_#E10600]" : "bg-white/20 hover:bg-[#E10600]/80"
            }`}
            title="Drag to resize width (280px ~ 460px)"
          >
            <div class="w-0.5 h-6 bg-white/70 rounded-[1px]" />
          </div>
        </Show>
      </div>
    </Show>
  );
};

import { Component, createSignal, Show, For, onCleanup, onMount } from "solid-js";
import {
  settings,
  updateSettings,
  updateWidgetTransform,
  saveSettingsAsDefault,
  toggleEditMode,
} from "../../stores/settingsStore.ts";
import {
  LogoF1,
  LogoWEC,
  LogoWRC,
  LogoIndyCar,
  LogoGT,
  IconChevronDown,
  IconFuel,
  IconStopwatch,
} from "../../assets/icons/Icons.tsx";

interface ThemeOption {
  id: "f1" | "wec" | "wrc" | "indycar" | "gt";
  name: string;
  category: string;
  available: boolean;
  logo: Component<{ class?: string; fill?: string }>;
}

export const SetupWizard: Component = () => {
  const [selectedTheme, setSelectedTheme] = createSignal<string>("f1");
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

  // Dragging state for Step 2
  const [draggingWidget, setDraggingWidget] = createSignal<string | null>(null);
  const [dragOffset, setDragOffset] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });

  const themes: ThemeOption[] = [
    {
      id: "f1",
      name: "Formula 1® (공식 방송 테마)",
      category: "FIA Formula One World Championship",
      available: true,
      logo: LogoF1,
    },
    {
      id: "wec",
      name: "WEC 르망 24시 (내구 레이스)",
      category: "FIA World Endurance Championship",
      available: false,
      logo: LogoWEC,
    },
    {
      id: "wrc",
      name: "WRC 랠리 (스테이지 스플릿)",
      category: "FIA World Rally Championship",
      available: false,
      logo: LogoWRC,
    },
    {
      id: "indycar",
      name: "IndyCar (오픈휠 레이싱)",
      category: "NTT IndyCar Series",
      available: false,
      logo: LogoIndyCar,
    },
    {
      id: "gt",
      name: "GT / Esports (카본 미니멀)",
      category: "GT World Challenge / Esports",
      available: false,
      logo: LogoGT,
    },
  ];

  const currentTheme = () => themes.find((t) => t.id === selectedTheme()) || themes[0];

  // Close dropdown on outside click
  const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("#theme-dropdown-container")) {
      setIsDropdownOpen(false);
    }
  };

  onMount(() => {
    window.addEventListener("click", handleDocumentClick);
  });

  onCleanup(() => {
    window.removeEventListener("click", handleDocumentClick);
  });

  // Step 2 Drag handling
  const handleMouseDown = (widgetKey: "telemetryHub" | "leaderboard" | "relative", e: MouseEvent) => {
    if (!settings.isEditMode) return;
    setDraggingWidget(widgetKey);
    const current = settings.widgets[widgetKey];
    setDragOffset({ x: e.clientX - current.x, y: e.clientY - current.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    const key = draggingWidget();
    if (!key) return;
    const offset = dragOffset();
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    updateWidgetTransform(key as any, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingWidget(null);
  };

  return (
    <div
      class="fixed inset-0 z-50 flex flex-col select-none font-sans"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ================= STEP 1: 테마 설정 화면 (Apple Design) ================= */}
      <Show when={settings.setupStep === 1}>
        <div class="w-full h-full flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6">
          {/* Apple Centered Glass Modal */}
          <div class="max-w-[480px] w-full bg-[#1c1c1e]/85 backdrop-blur-3xl border border-white/[0.12] ring-1 ring-inset ring-white/[0.05] rounded-2xl p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] flex flex-col gap-6 text-[#f5f5f7]">
            
            {/* Header: Title & Step */}
            <div class="flex flex-col gap-1.5 text-center items-center">
              <span class="text-[11px] font-semibold uppercase tracking-widest text-[#86868b]">
                Step 1 of 2 · Theme Selection
              </span>
              <h1 class="text-2xl font-semibold tracking-tight text-white">
                오버레이 테마 설정
              </h1>
              <p class="text-xs text-[#86868b] max-w-sm mt-0.5 leading-relaxed">
                사용할 방송 그래픽 테마를 선택하세요. 설정 후에도 단축키로 언제든 변경 가능합니다.
              </p>
            </div>

            {/* Apple Style Dropdown Selector */}
            <div class="flex flex-col gap-2 mt-1" id="theme-dropdown-container">
              <label class="text-xs font-medium text-[#a1a1a6] px-1">
                방송 테마 선택
              </label>

              <div class="relative">
                {/* Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen())}
                  class="w-full bg-[#2c2c2e]/70 hover:bg-[#3a3a3c]/70 active:scale-[0.99] border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between text-left transition-all duration-150 shadow-sm"
                >
                  <div class="flex items-center gap-3">
                    {/* Active Theme Logo */}
                    <div class="h-6 w-12 flex items-center justify-center">
                      <LogoF1 class="h-4 w-auto" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-white tracking-tight">
                        {currentTheme().name}
                      </span>
                      <span class="text-[11px] text-[#86868b]">
                        {currentTheme().category}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E10600]/15 text-[#ff453a] border border-[#ff453a]/20">
                      사용 가능
                    </span>
                    <IconChevronDown
                      class={`w-4 h-4 text-[#86868b] transition-transform duration-200 ${
                        isDropdownOpen() ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Popover Menu */}
                <Show when={isDropdownOpen()}>
                  <div class="absolute top-full left-0 right-0 mt-2 bg-[#252528]/95 backdrop-blur-2xl border border-white/[0.12] rounded-xl p-1.5 shadow-[0_20px_40px_-8px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-1">
                    <For each={themes}>
                      {(t) => {
                        const LogoComponent = t.logo;
                        const isSelected = () => selectedTheme() === t.id;

                        return (
                          <div
                            onClick={() => {
                              if (!t.available) return;
                              setSelectedTheme(t.id);
                              setIsDropdownOpen(false);
                            }}
                            class={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-150 ${
                              t.available
                                ? isSelected()
                                  ? "bg-white/10 text-white cursor-pointer"
                                  : "hover:bg-white/[0.06] text-[#e5e5ea] cursor-pointer active:scale-[0.98]"
                                : "opacity-40 cursor-not-allowed text-[#636366]"
                            }`}
                          >
                            <div class="flex items-center gap-3">
                              <div class="h-6 w-12 flex items-center justify-center text-white">
                                <LogoComponent class="h-4 w-auto max-h-4 max-w-10" />
                              </div>
                              <div class="flex flex-col">
                                <span class="text-xs font-medium tracking-tight">
                                  {t.name}
                                </span>
                                <span class="text-[10px] text-[#86868b]">
                                  {t.category}
                                </span>
                              </div>
                            </div>

                            <Show
                              when={t.available}
                              fallback={
                                <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#86868b] border border-white/5">
                                  추후 제공
                                </span>
                              }
                            >
                              <Show when={isSelected()}>
                                <span class="text-xs text-[#30d158] font-bold">✓</span>
                              </Show>
                            </Show>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            </div>

            {/* Apple Notice Callout */}
            <div class="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3.5 text-xs text-[#a1a1a6] flex items-start gap-2.5">
              <span class="text-sm mt-px">💡</span>
              <p class="leading-relaxed">
                현재 버전은 <strong class="text-white font-medium">Formula 1® 공식 테마</strong>에 집중 개발되어 제공됩니다.
                다른 시리즈 테마는 업데이트를 통해 순차 지원됩니다.
              </p>
            </div>

            {/* Action Button: Strictly "오버레이 배치 설정하기 -> " */}
            <div class="pt-2">
              <button
                onClick={() => {
                  updateSettings("theme", "f1");
                  updateSettings("setupStep", 2);
                  updateSettings("isEditMode", true);
                }}
                class="w-full bg-[#E10600] hover:bg-[#c30500] active:scale-[0.98] text-white font-semibold text-sm rounded-xl py-3.5 px-6 shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all duration-150"
              >
                <span>오버레이 배치 설정하기 -&gt; </span>
              </button>
            </div>

          </div>
        </div>
      </Show>

      {/* ================= STEP 2: 오버레이 미리보기 & Alt+J 배치 조절 (Apple Design) ================= */}
      <Show when={settings.setupStep === 2}>
        <div class="relative w-full h-full">
          {/* Top Apple Minimal Floating Capsule Toolbar */}
          <div class="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-2.5 bg-[#1c1c1e]/85 backdrop-blur-2xl border border-white/[0.12] rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)] text-[#f5f5f7]">
            {/* Step badge */}
            <div class="flex items-center gap-2 pr-3 border-r border-white/10">
              <span class="text-[11px] font-semibold text-[#86868b] tracking-wider uppercase">
                Step 2/2
              </span>
              <span class="text-xs font-medium text-white">배치 설정</span>
            </div>

            {/* Alt + J Shortcut Pill */}
            <button
              onClick={toggleEditMode}
              class={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border transition-all duration-150 active:scale-[0.96] ${
                settings.isEditMode
                  ? "bg-amber-400/15 text-amber-300 border-amber-400/30"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              <span>{settings.isEditMode ? "편집 활성" : "고정 모드"}</span>
              <kbd class="bg-black/40 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/15 text-white">
                Alt + J
              </kbd>
            </button>

            <span class="text-xs text-[#86868b] hidden md:inline">
              {settings.isEditMode
                ? "위젯을 드래그하여 이동하고 +/- 버튼으로 크기를 조절하세요."
                : "Alt + J 로 편집 모드를 켤 수 있습니다."}
            </span>

            {/* Actions */}
            <div class="flex items-center gap-2 pl-3 border-l border-white/10">
              <button
                onClick={() => updateSettings("setupStep", 1)}
                class="px-3 py-1 rounded-full text-xs text-[#a1a1a6] hover:text-white hover:bg-white/10 transition-all active:scale-[0.96]"
              >
                이전
              </button>

              <button
                onClick={saveSettingsAsDefault}
                class="px-4 py-1.5 rounded-full bg-[#30d158] hover:bg-[#28b84c] active:scale-[0.96] text-black font-semibold text-xs shadow-md transition-all duration-150 flex items-center gap-1.5"
              >
                <span>최종 저장</span>
                <span>✓</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview Overlay Area */}
          <div class="w-full h-full relative pointer-events-none">
            {/* Widget 1: Leaderboard (Top-Left) */}
            <div
              onMouseDown={(e) => handleMouseDown("leaderboard", e)}
              style={{
                transform: `translate3d(${settings.widgets.leaderboard.x}px, ${settings.widgets.leaderboard.y}px, 0) scale(${settings.widgets.leaderboard.scale})`,
                "transform-origin": "top left",
              }}
              class={`fixed top-16 left-8 z-30 hud-panel p-3 w-80 select-none ${
                settings.isEditMode
                  ? "pointer-events-auto cursor-move ring-2 ring-amber-400/80 ring-offset-2 ring-offset-black/50"
                  : "pointer-events-none"
              }`}
            >
              <div class="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span class="hud-header px-2 py-0.5 text-[11px] rounded">순위표 (LEADERBOARD)</span>
                <Show when={settings.isEditMode}>
                  <div class="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateWidgetTransform("leaderboard", {
                          scale: Math.max(0.7, settings.widgets.leaderboard.scale - 0.1),
                        })
                      }
                      class="px-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-bold"
                    >
                      -
                    </button>
                    <span class="text-[10px] font-mono">{Math.round(settings.widgets.leaderboard.scale * 100)}%</span>
                    <button
                      onClick={() =>
                        updateWidgetTransform("leaderboard", {
                          scale: Math.min(1.5, settings.widgets.leaderboard.scale + 0.1),
                        })
                      }
                      class="px-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </Show>
              </div>
              <div class="space-y-1 text-xs font-mono">
                <div class="flex items-center justify-between p-1 bg-red-950/40 rounded">
                  <span>P1 #1 M. Verstappen</span>
                  <span class="text-emerald-400 font-bold">1:24.120</span>
                </div>
                <div class="flex items-center justify-between p-1 bg-black/40 rounded">
                  <span>P2 #16 C. Leclerc</span>
                  <span class="text-white/60">+0.421s</span>
                </div>
                <div class="flex items-center justify-between p-1 bg-black/40 rounded">
                  <span>P3 #44 L. Hamilton</span>
                  <span class="text-white/60">+1.025s</span>
                </div>
              </div>
            </div>

            {/* Widget 2: Relative (Bottom-Right) */}
            <div
              onMouseDown={(e) => handleMouseDown("relative", e)}
              style={{
                transform: `translate3d(${settings.widgets.relative.x}px, ${settings.widgets.relative.y}px, 0) scale(${settings.widgets.relative.scale})`,
                "transform-origin": "bottom right",
              }}
              class={`fixed bottom-8 right-8 z-30 hud-panel p-3 w-72 select-none ${
                settings.isEditMode
                  ? "pointer-events-auto cursor-move ring-2 ring-amber-400/80 ring-offset-2 ring-offset-black/50"
                  : "pointer-events-none"
              }`}
            >
              <div class="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span class="hud-header px-2 py-0.5 text-[11px] rounded">상대 간격 (RELATIVE)</span>
                <Show when={settings.isEditMode}>
                  <div class="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateWidgetTransform("relative", {
                          scale: Math.max(0.7, settings.widgets.relative.scale - 0.1),
                        })
                      }
                      class="px-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-bold"
                    >
                      -
                    </button>
                    <span class="text-[10px] font-mono">{Math.round(settings.widgets.relative.scale * 100)}%</span>
                    <button
                      onClick={() =>
                        updateWidgetTransform("relative", {
                          scale: Math.min(1.5, settings.widgets.relative.scale + 0.1),
                        })
                      }
                      class="px-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </Show>
              </div>
              <div class="space-y-1 text-xs font-mono">
                <div class="flex items-center justify-between p-1 bg-black/30 rounded text-amber-300">
                  <span>#16 C. Leclerc</span>
                  <span>-0.42s</span>
                </div>
                <div class="flex items-center justify-between p-1 bg-red-600/30 font-bold text-white rounded">
                  <span>#1 M. Verstappen (YOU)</span>
                  <span>0.00s</span>
                </div>
                <div class="flex items-center justify-between p-1 bg-black/30 rounded text-emerald-300">
                  <span>#44 L. Hamilton</span>
                  <span>+1.02s</span>
                </div>
              </div>
            </div>

            {/* Widget 3: Telemetry Hub (Bottom-Center) */}
            <div
              onMouseDown={(e) => handleMouseDown("telemetryHub", e)}
              style={{
                transform: `translate3d(${settings.widgets.telemetryHub.x}px, ${settings.widgets.telemetryHub.y}px, 0) scale(${settings.widgets.telemetryHub.scale})`,
                "transform-origin": "bottom center",
              }}
              class={`fixed bottom-8 left-1/2 -translate-x-1/2 z-30 hud-panel px-6 py-3 flex items-center gap-6 select-none ${
                settings.isEditMode
                  ? "pointer-events-auto cursor-move ring-2 ring-amber-400/80 ring-offset-2 ring-offset-black/50"
                  : "pointer-events-none"
              }`}
            >
              <div class="flex items-center gap-3 pr-4 border-r border-white/10">
                <div class="flex flex-col items-center">
                  <span class="text-[10px] text-[var(--theme-text-muted)] font-mono">GEAR</span>
                  <span class="text-3xl font-black text-[var(--theme-accent)] leading-none">6</span>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-mono font-black tracking-tight">245</span>
                    <span class="text-[10px] text-[var(--theme-text-muted)]">KM/H</span>
                  </div>
                  <span class="text-[10px] font-mono text-white/50">11,200 RPM</span>
                </div>
              </div>

              <div class="flex flex-col pr-4 border-r border-white/10">
                <div class="flex items-center gap-1 text-[10px] text-[var(--theme-text-muted)]">
                  <IconStopwatch size={12} />
                  <span>LAP DELTA</span>
                </div>
                <span class="font-mono font-bold text-base text-emerald-400">-0.23s</span>
              </div>

              <div class="flex flex-col">
                <div class="flex items-center gap-1 text-[10px] text-[var(--theme-text-muted)]">
                  <IconFuel size={12} />
                  <span>FUEL REMAIN</span>
                </div>
                <span class="font-mono font-bold text-base">42.5L</span>
              </div>

              <Show when={settings.isEditMode}>
                <div class="flex items-center gap-1 pl-4 border-l border-white/10">
                  <button
                    onClick={() =>
                      updateWidgetTransform("telemetryHub", {
                        scale: Math.max(0.7, settings.widgets.telemetryHub.scale - 0.1),
                      })
                    }
                    class="px-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-bold"
                  >
                    -
                  </button>
                  <span class="text-[10px] font-mono">{Math.round(settings.widgets.telemetryHub.scale * 100)}%</span>
                  <button
                    onClick={() =>
                      updateWidgetTransform("telemetryHub", {
                        scale: Math.min(1.5, settings.widgets.telemetryHub.scale + 0.1),
                      })
                    }
                    class="px-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

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
  LogoIMSA,
  IconFuel,
  IconStopwatch,
} from "../../assets/icons/Icons.tsx";
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Check,
  Info,
  Type,
} from "lucide-solid";
import { F1TimingTower } from "../f1/F1TimingTower.tsx";
import { F1Relative } from "../f1/F1Relative.tsx";
import { F1TelemetryHub } from "../f1/F1TelemetryHub.tsx";
import { createPresence } from "../../utils/presence.ts";

// ponytail: minimal clean theme model without unnecessary subheadings
interface ThemeOption {
  id: "f1" | "wec" | "wrc" | "indycar" | "imsa";
  name: string;
  available: boolean;
  logo: Component<{ class?: string; fill?: string }>;
}

export const SetupWizard: Component = () => {
  const [selectedTheme, setSelectedTheme] = createSignal<string>("f1");
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [showFontInfo, setShowFontInfo] = createSignal(false);

  // Apple Design Fluid Presence Lifecycles (fade in/out on enter and exit)
  const step1Presence = createPresence(() => settings.setupStep === 1, 220);
  const step2Presence = createPresence(() => settings.setupStep === 2, 220);
  const dropdownPresence = createPresence(() => isDropdownOpen(), 160);
  const fontModalPresence = createPresence(() => showFontInfo(), 220);

  // Dragging state for Step 2
  const [draggingWidget, setDraggingWidget] = createSignal<string | null>(null);
  const [dragOffset, setDragOffset] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pure Grand Prix / Championship names with official marks
  const themes: ThemeOption[] = [
    { id: "f1", name: "Formula 1", available: true, logo: LogoF1 },
    { id: "wec", name: "WEC", available: false, logo: LogoWEC },
    { id: "wrc", name: "WRC", available: false, logo: LogoWRC },
    { id: "indycar", name: "IndyCar", available: false, logo: LogoIndyCar },
    { id: "imsa", name: "Daytona (IMSA)", available: false, logo: LogoIMSA },
  ];

  const currentTheme = () => themes.find((t) => t.id === selectedTheme()) || themes[0];

  // Close dropdown on true outside click
  onMount(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const container = document.getElementById("theme-dropdown-container");
      if (container && !container.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleDocumentClick);
    onCleanup(() => window.removeEventListener("click", handleDocumentClick));
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
      class="fixed inset-0 z-50 flex flex-col select-none font-sans pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ================= STEP 1: 테마 설정 화면 (Apple Design Fade in/out) ================= */}
      <Show when={step1Presence.mounted()}>
        <div
          class={`w-full h-full flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6 pointer-events-auto apple-backdrop ${
            step1Presence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          {/* Apple Centered Glass Modal */}
          <div
            class={`max-w-[440px] w-full bg-[#1c1c1e]/90 backdrop-blur-3xl border border-white/[0.12] ring-1 ring-inset ring-white/[0.05] rounded-2xl p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.85)] flex flex-col gap-5 text-[#f5f5f7] apple-modal-card ${
              step1Presence.visible() ? "is-visible" : "is-hidden"
            }`}
          >
            
            {/* 5. Apple Style Segmented Progress Bar (Step 1 of 2) */}
            <div class="w-full flex items-center gap-2">
              <div class="h-1 flex-1 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.6)] transition-all duration-300" />
              <div class="h-1 flex-1 rounded-full bg-white/10 transition-all duration-300" />
            </div>

            {/* Header: Title */}
            <div class="flex flex-col gap-1 text-center items-center">
              <h1 class="text-2xl font-semibold tracking-tight text-white">
                오버레이 테마 설정
              </h1>
              <p class="text-xs text-[#86868b] leading-relaxed">
                사용할 방송 그래픽 테마를 선택하세요.
              </p>
            </div>

            {/* 1 & 2. Apple Style Dropdown Selector */}
            <div class="flex flex-col gap-2 relative" id="theme-dropdown-container">
              <label class="text-xs font-medium text-[#a1a1a6] px-0.5">
                방송 테마 선택
              </label>

              <div class="relative">
                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen((prev) => !prev);
                  }}
                  class="w-full bg-[#2c2c2e]/80 hover:bg-[#3a3a3c]/80 active:scale-[0.99] border border-white/15 rounded-xl px-4 py-3 flex items-center justify-between text-left transition-all duration-150 shadow-sm cursor-pointer pointer-events-auto"
                >
                  <div class="flex items-center gap-3">
                    <div class="h-6 w-14 flex items-center justify-center text-white">
                      {(() => {
                        const LogoComponent = currentTheme().logo;
                        return <LogoComponent class="h-4 w-auto max-h-4 max-w-12" />;
                      })()}
                    </div>
                    <span class="text-base font-semibold text-white tracking-tight">
                      {currentTheme().name}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E10600]/15 text-[#ff453a] border border-[#ff453a]/25">
                      사용 가능
                    </span>
                    <ChevronDown
                      class={`w-4 h-4 text-[#86868b] transition-transform duration-200 ${
                        isDropdownOpen() ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Popover List */}
                <Show when={dropdownPresence.mounted()}>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    class={`absolute top-full left-0 right-0 mt-2 bg-[#252528] border border-white/15 rounded-xl p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.95)] z-50 flex flex-col gap-1 pointer-events-auto apple-popover ${
                      dropdownPresence.visible() ? "is-visible" : "is-hidden"
                    }`}
                  >
                    <For each={themes}>
                      {(t) => {
                        const LogoComponent = t.logo;
                        const isSelected = () => selectedTheme() === t.id;

                        return (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!t.available) return;
                              setSelectedTheme(t.id);
                              setIsDropdownOpen(false);
                            }}
                            class={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-150 ${
                              t.available
                                ? isSelected()
                                  ? "bg-white/10 text-white cursor-pointer"
                                  : "hover:bg-white/[0.08] text-[#e5e5ea] cursor-pointer active:scale-[0.98]"
                                : "opacity-35 cursor-not-allowed text-[#636366]"
                            }`}
                          >
                            <div class="flex items-center gap-3">
                              <div class="h-6 w-14 flex items-center justify-center text-white">
                                <LogoComponent class="h-4 w-auto max-h-4 max-w-12" />
                              </div>
                              <span class="text-sm font-semibold tracking-tight">
                                {t.name}
                              </span>
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
                                <Check class="w-4 h-4 text-[#30d158] stroke-[2.5]" />
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

            {/* 3. Notice Callout */}
            <div class="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-[#a1a1a6] flex items-center gap-2.5">
              <Info class="w-4 h-4 text-[#86868b] shrink-0" />
              <p class="leading-relaxed">
                다른 시리즈 테마는 업데이트를 통해 순차 지원됩니다.
              </p>
            </div>

            {/* 4. Action Button with Lucide ArrowRight */}
            <div class="pt-1">
              <button
                onClick={() => {
                  updateSettings("theme", "f1");
                  updateSettings("setupStep", 2);
                  updateSettings("isEditMode", true);
                }}
                class="w-full bg-[#E10600] hover:bg-[#c30500] active:scale-[0.98] text-white font-semibold text-sm rounded-xl py-3.5 px-6 shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer pointer-events-auto"
              >
                <span>오버레이 배치 설정하기</span>
                <ArrowRight class="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </div>
        </div>
      </Show>

      {/* ================= STEP 2: 오버레이 미리보기 & Alt+J 배치 조절 (Apple Design) ================= */}
      <Show when={step2Presence.mounted()}>
        <div
          class={`relative w-full h-full transition-opacity duration-200 ${
            step2Presence.visible() ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Top Apple Minimal Floating Capsule Toolbar */}
          <div
            class={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-5 py-2.5 bg-[#181820]/90 backdrop-blur-2xl border border-white/[0.12] rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.85)] text-[#f5f5f7] apple-pill-enter ${
              step2Presence.visible() ? "is-visible" : "is-hidden"
            }`}
          >
            {/* Step 2 Progress Bar */}
            <div class="flex items-center gap-1.5 pr-2.5 border-r border-white/10 w-16">
              <div class="h-1 flex-1 rounded-full bg-[#E10600] shadow-[0_0_6px_rgba(225,6,0,0.5)]" />
              <div class="h-1 flex-1 rounded-full bg-[#E10600] shadow-[0_0_6px_rgba(225,6,0,0.5)]" />
            </div>

            {/* Alt + J Shortcut Pill */}
            <button
              onClick={toggleEditMode}
              class={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border transition-all duration-150 active:scale-[0.96] cursor-pointer pointer-events-auto ${
                settings.isEditMode
                  ? "bg-white/20 text-white border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.12)]"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              <span>{settings.isEditMode ? "편집 모드 활성" : "고정 모드"}</span>
              <kbd class="bg-black/40 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/15 text-white">
                Alt + J
              </kbd>
            </button>

            {/* F1 Font Status Pill */}
            <button
              onClick={() => setShowFontInfo(true)}
              class="px-3 py-1 rounded-full text-xs font-f1 bg-white/5 hover:bg-white/10 text-white/85 border border-white/10 flex items-center gap-1.5 cursor-pointer pointer-events-auto transition-all active:scale-[0.96]"
            >
              <Type class="w-3.5 h-3.5 text-[#e10600]" />
              <span>F1 폰트 설정</span>
            </button>

            <span class="text-xs text-[#86868b] hidden lg:inline">
              {settings.isEditMode
                ? "위젯을 드래그하여 이동하고 +/- 버튼으로 크기를 조절하세요."
                : "Alt + J 로 편집 모드를 켤 수 있습니다."}
            </span>

            {/* Actions */}
            <div class="flex items-center gap-2 pl-3 border-l border-white/10">
              <button
                onClick={() => updateSettings("setupStep", 1)}
                class="px-3 py-1 rounded-full text-xs text-[#a1a1a6] hover:text-white hover:bg-white/10 transition-all active:scale-[0.96] flex items-center gap-1 cursor-pointer pointer-events-auto"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>이전</span>
              </button>

              <button
                onClick={saveSettingsAsDefault}
                class="px-4 py-1.5 rounded-full bg-[#00d26a] hover:bg-[#00ba5e] active:scale-[0.96] text-black font-semibold text-xs shadow-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer pointer-events-auto"
              >
                <span>최종 저장</span>
                <Check class="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* F1 Font Info Modal */}
          <Show when={fontModalPresence.mounted()}>
            <div
              onClick={() => setShowFontInfo(false)}
              class={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 pointer-events-auto apple-backdrop ${
                fontModalPresence.visible() ? "is-visible" : "is-hidden"
              }`}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                class={`max-w-[460px] w-full bg-[#181822] border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-white font-sans apple-modal-card ${
                  fontModalPresence.visible() ? "is-visible" : "is-hidden"
                }`}
              >
                <div class="flex items-center justify-between border-b border-white/10 pb-3">
                  <div class="flex items-center gap-2">
                    <LogoF1 class="h-4 w-auto" />
                    <h2 class="text-base font-bold font-f1">F1 공식 타이포그래피 안내</h2>
                  </div>
                  <button
                    onClick={() => setShowFontInfo(false)}
                    class="text-xs text-white/50 hover:text-white px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
                  >
                    닫기
                  </button>
                </div>

                <div class="flex flex-col gap-2.5 text-xs text-[#a0a0b0] leading-relaxed">
                  <p>
                    본 오버레이는 Formula 1 공식 중계 폰트 스택을 지원합니다.
                  </p>
                  <div class="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5 font-mono text-[11px] text-white/90">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-[#00d26a]" />
                      <span>현재 적용 상태: <strong>고품질 모터스포츠 웹폰트 활성</strong></span>
                    </div>
                    <div class="pl-4 text-[10px] text-white/60">
                      • 타이밍 & 보드: <code class="text-amber-300">Titillium Web (Google Fonts)</code><br/>
                      • 디지털 텔레메트리: <code class="text-amber-300">Chakra Petch (Google Fonts)</code>
                    </div>
                  </div>

                  <p>
                    <strong>Formula 1 공식 폰트 파일</strong>(<code class="text-white">Formula1-Bold.woff2</code>)을 소장하고 계신 경우, 프로젝트 루트의 <code class="text-white">public/fonts/</code> 디렉터리에 넣거나 PC 시스템에 설치하시면 100% 공식 폰트가 자동 우선 적용됩니다.
                  </p>
                </div>

                <button
                  onClick={() => setShowFontInfo(false)}
                  class="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl transition-all cursor-pointer"
                >
                  확인
                </button>
              </div>
            </div>
          </Show>

          {/* Interactive Preview Overlay Area */}
          <div class="w-full h-full relative pointer-events-none">
            {/* Widget 1: F1 Timing Tower (Top-Left) */}
            <div
              onMouseDown={(e) => handleMouseDown("leaderboard", e)}
              style={{
                transform: `translate3d(${settings.widgets.leaderboard.x}px, ${settings.widgets.leaderboard.y}px, 0) scale(${settings.widgets.leaderboard.scale})`,
                "transform-origin": "top left",
              }}
              class={`fixed top-16 left-8 z-30 select-none transition-shadow duration-150 ${
                settings.isEditMode
                  ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                  : "pointer-events-none"
              }`}
            >
              <F1TimingTower
                isEditMode={settings.isEditMode}
                scale={settings.widgets.leaderboard.scale}
                onScaleChange={(scale) => updateWidgetTransform("leaderboard", { scale })}
              />
            </div>

            {/* Widget 2: F1 Tactical Relative (Bottom-Right) */}
            <div
              onMouseDown={(e) => handleMouseDown("relative", e)}
              style={{
                transform: `translate3d(${settings.widgets.relative.x}px, ${settings.widgets.relative.y}px, 0) scale(${settings.widgets.relative.scale})`,
                "transform-origin": "bottom right",
              }}
              class={`fixed bottom-8 right-8 z-30 select-none transition-shadow duration-150 ${
                settings.isEditMode
                  ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                  : "pointer-events-none"
              }`}
            >
              <F1Relative
                isEditMode={settings.isEditMode}
                scale={settings.widgets.relative.scale}
                onScaleChange={(scale) => updateWidgetTransform("relative", { scale })}
              />
            </div>

            {/* Widget 3: F1 Cockpit Telemetry Hub (Bottom-Center) */}
            <div
              onMouseDown={(e) => handleMouseDown("telemetryHub", e)}
              style={{
                transform: `translate3d(calc(-50% + ${settings.widgets.telemetryHub.x}px), ${settings.widgets.telemetryHub.y}px, 0) scale(${settings.widgets.telemetryHub.scale})`,
                "transform-origin": "bottom center",
              }}
              class={`fixed bottom-8 left-1/2 z-30 select-none transition-shadow duration-150 ${
                settings.isEditMode
                  ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-xl"
                  : "pointer-events-none"
              }`}
            >
              <F1TelemetryHub
                isEditMode={settings.isEditMode}
                scale={settings.widgets.telemetryHub.scale}
                onScaleChange={(scale) => updateWidgetTransform("telemetryHub", { scale })}
              />
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

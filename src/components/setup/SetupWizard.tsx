import { Component, createSignal, Show, For, onCleanup, onMount } from "solid-js";
import {
  settings,
  updateSettings,
  updateWidgetTransform,
  toggleWidgetVisibility,
  saveSettingsAsDefault,
  toggleEditMode,
  WidgetKey,
} from "../../stores/settingsStore.ts";
import { telemetry } from "../../stores/telemetryStore.ts";
import {
  LogoF1,
  LogoWEC,
  LogoWRC,
  LogoIndyCar,
  LogoIMSA,
} from "../../assets/icons/Icons.tsx";
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Check,
  Info,
  Type,
  Layers,
  Eye,
  EyeOff,
} from "lucide-solid";
import { Leaderboard } from "../widgets/Leaderboard.tsx";
import { Relative } from "../widgets/Relative.tsx";
import { LapDelta } from "../widgets/LapDelta.tsx";
import { RevengeTracker } from "../widgets/RevengeTracker.tsx";
import { SpotterLeft } from "../widgets/SpotterLeft.tsx";
import { SpotterRight } from "../widgets/SpotterRight.tsx";
import { FuelSimulator } from "../widgets/FuelSimulator.tsx";
import { TireAnalysis } from "../widgets/TireAnalysis.tsx";
import { IncidentHazard } from "../widgets/IncidentHazard.tsx";
import { WeatherWidget } from "../widgets/WeatherWidget.tsx";
import { MulticlassRadar } from "../widgets/MulticlassRadar.tsx";
import { TrackMap } from "../widgets/TrackMap.tsx";
import { TelemetryHub } from "../widgets/TelemetryHub.tsx";
import { createPresence } from "../../utils/presence.ts";
import { t, setLanguage, SUPPORTED_LANGUAGES } from "../../i18n/index.ts";

interface ThemeOption {
  id: "f1" | "wec" | "wrc" | "indycar" | "imsa";
  name: string;
  available: boolean;
  logo: Component<{ class?: string; fill?: string }>;
}

export const SetupWizard: Component = () => {
  const [selectedTheme, setSelectedTheme] = createSignal<string>("f1");
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = createSignal(false);
  const [isStep2LangOpen, setIsStep2LangOpen] = createSignal(false);
  const [showFontInfo, setShowFontInfo] = createSignal(false);
  const [showWidgetList, setShowWidgetList] = createSignal(false);

  // Apple Design Fluid Presence Lifecycles
  const step1Presence = createPresence(() => settings.setupStep === 1, 220);
  const step2Presence = createPresence(() => settings.setupStep === 2, 220);
  const dropdownPresence = createPresence(() => isDropdownOpen(), 160);
  const langDropdownPresence = createPresence(() => isLangDropdownOpen(), 160);
  const step2LangPresence = createPresence(() => isStep2LangOpen(), 160);
  const fontModalPresence = createPresence(() => showFontInfo(), 220);
  const widgetListPresence = createPresence(() => showWidgetList(), 160);

  // Dragging state for Step 2
  const [draggingWidget, setDraggingWidget] = createSignal<WidgetKey | null>(null);
  const [dragOffset, setDragOffset] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });

  const themes: ThemeOption[] = [
    { id: "f1", name: "Formula 1", available: true, logo: LogoF1 },
    { id: "wec", name: "WEC", available: false, logo: LogoWEC },
    { id: "wrc", name: "WRC", available: false, logo: LogoWRC },
    { id: "indycar", name: "IndyCar", available: false, logo: LogoIndyCar },
    { id: "imsa", name: "Daytona (IMSA)", available: false, logo: LogoIMSA },
  ];

  const currentTheme = () => themes.find((t) => t.id === selectedTheme()) || themes[0];
  const currentLang = () => SUPPORTED_LANGUAGES.find((l) => l.code === settings.language) || SUPPORTED_LANGUAGES[0];

  const widgetDefinitions = () => [
    { key: "leaderboard" as WidgetKey, name: t().wLeaderboard, category: "Timing" },
    { key: "relative" as WidgetKey, name: t().wRelative, category: "Timing" },
    { key: "lapDelta" as WidgetKey, name: t().wLapDelta, category: "Timing" },
    { key: "revengeTracker" as WidgetKey, name: t().wRevenge, category: "Battle" },
    { key: "spotterLeft" as WidgetKey, name: t().wSpotterL, category: "Safety" },
    { key: "spotterRight" as WidgetKey, name: t().wSpotterR, category: "Safety" },
    { key: "fuelCalculator" as WidgetKey, name: t().wFuel, category: "Strategy" },
    { key: "tireAnalysis" as WidgetKey, name: t().wTire, category: "Strategy" },
    { key: "incidentHazard" as WidgetKey, name: t().wHazard, category: "Safety" },
    { key: "weather" as WidgetKey, name: t().wWeather, category: "Environment" },
    { key: "multiclassRadar" as WidgetKey, name: t().wMulticlass, category: "Battle" },
    { key: "trackMap" as WidgetKey, name: t().wTrackMap, category: "Map" },
    { key: "telemetryHub" as WidgetKey, name: t().wTelemetryHub, category: "Cockpit" },
  ];

  const activeWidgetCount = () => Object.values(settings.widgets).filter((w) => w.visible).length;

  onMount(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const dropdown = document.getElementById("theme-dropdown-container");
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      const langPop = document.getElementById("lang-dropdown-container");
      if (langPop && !langPop.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      const step2Lang = document.getElementById("step2-lang-container");
      if (step2Lang && !step2Lang.contains(e.target as Node)) {
        setIsStep2LangOpen(false);
      }
      const widgetPop = document.getElementById("widget-list-container");
      if (widgetPop && !widgetPop.contains(e.target as Node)) {
        setShowWidgetList(false);
      }
    };
    window.addEventListener("click", handleDocumentClick);
    onCleanup(() => window.removeEventListener("click", handleDocumentClick));
  });

  const handleMouseDown = (widgetKey: WidgetKey, e: MouseEvent) => {
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
    updateWidgetTransform(key, { x: newX, y: newY });
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
      {/* ================= STEP 1: 테마 설정 화면 ================= */}
      <Show when={step1Presence.mounted()}>
        <div
          class={`w-full h-full flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6 pointer-events-auto apple-backdrop ${
            step1Presence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <div
            class={`max-w-[460px] w-full bg-[#1c1c1e]/90 backdrop-blur-3xl border border-white/[0.12] ring-1 ring-inset ring-white/[0.05] rounded-2xl p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.85)] flex flex-col gap-5 text-[#f5f5f7] apple-modal-card ${
              step1Presence.visible() ? "is-visible" : "is-hidden"
            }`}
          >
            {/* Top Bar: Step Progress Bar + Language Switcher */}
            <div class="w-full flex items-center justify-between gap-4">
              <div class="flex-1 flex items-center gap-2">
                <div class="h-1 flex-1 rounded-full bg-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.6)] transition-all duration-300" />
                <div class="h-1 flex-1 rounded-full bg-white/10 transition-all duration-300" />
              </div>

              {/* Step 1 Quick Language Selector Pill */}
              <div class="relative" id="lang-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLangDropdownOpen((prev) => !prev);
                  }}
                  class="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs flex items-center gap-1.5 transition-all cursor-pointer pointer-events-auto active:scale-95"
                  title={t().selectLanguageTitle}
                >
                  <span class="text-sm leading-none">{currentLang().flag}</span>
                  <span class="text-[11px] font-medium text-white/90">{currentLang().name}</span>
                  <ChevronDown class={`w-3 h-3 text-white/40 transition-transform ${isLangDropdownOpen() ? "rotate-180" : ""}`} />
                </button>

                {/* Language Popover */}
                <Show when={langDropdownPresence.mounted()}>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    class={`absolute top-full right-0 mt-2 w-48 bg-[#252528] border border-white/15 rounded-xl p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.95)] z-50 flex flex-col gap-1 pointer-events-auto apple-popover ${
                      langDropdownPresence.visible() ? "is-visible" : "is-hidden"
                    }`}
                  >
                    <For each={SUPPORTED_LANGUAGES}>
                      {(lang) => {
                        const isSelected = () => settings.language === lang.code;
                        return (
                          <div
                            onClick={() => {
                              setLanguage(lang.code);
                              setIsLangDropdownOpen(false);
                            }}
                            class={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-all ${
                              isSelected()
                                ? "bg-white/15 text-white font-semibold"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <div class="flex items-center gap-2.5">
                              <span class="text-base leading-none">{lang.flag}</span>
                              <span>{lang.name}</span>
                            </div>
                            <Show when={isSelected()}>
                              <Check class="w-3.5 h-3.5 text-[#30d158] stroke-[2.5]" />
                            </Show>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            </div>

            {/* Header: Title */}
            <div class="flex flex-col gap-1 text-center items-center">
              <h1 class="text-2xl font-semibold tracking-tight text-white">
                {t().themeTitle}
              </h1>
              <p class="text-xs text-[#86868b] leading-relaxed">
                {t().themeSubtitle}
              </p>
            </div>

            {/* Dropdown Selector */}
            <div class="flex flex-col gap-2 relative" id="theme-dropdown-container">
              <label class="text-xs font-medium text-[#a1a1a6] px-0.5">
                {t().themeSelectLabel}
              </label>

              <div class="relative">
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
                      {t().availableBadge}
                    </span>
                    <ChevronDown
                      class={`w-4 h-4 text-[#86868b] transition-transform duration-200 ${
                        isDropdownOpen() ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Popover */}
                <Show when={dropdownPresence.mounted()}>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    class={`absolute top-full left-0 right-0 mt-2 bg-[#252528] border border-white/15 rounded-xl p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.95)] z-50 flex flex-col gap-1 pointer-events-auto apple-popover ${
                      dropdownPresence.visible() ? "is-visible" : "is-hidden"
                    }`}
                  >
                    <For each={themes}>
                      {(th) => {
                        const LogoComponent = th.logo;
                        const isSelected = () => selectedTheme() === th.id;

                        return (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!th.available) return;
                              setSelectedTheme(th.id);
                              setIsDropdownOpen(false);
                            }}
                            class={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-150 ${
                              th.available
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
                                {th.name}
                              </span>
                            </div>

                            <Show
                              when={th.available}
                              fallback={
                                <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#86868b] border border-white/5">
                                  {t().comingSoonBadge}
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

            {/* Notice Callout */}
            <div class="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-[#a1a1a6] flex items-center gap-2.5">
              <Info class="w-4 h-4 text-[#86868b] shrink-0" />
              <p class="leading-relaxed">
                {t().otherSeriesNotice}
              </p>
            </div>

            {/* Action Button */}
            <div class="pt-1">
              <button
                onClick={() => {
                  updateSettings("theme", "f1");
                  updateSettings("setupStep", 2);
                  updateSettings("isEditMode", true);
                }}
                class="w-full bg-[#E10600] hover:bg-[#c30500] active:scale-[0.98] text-white font-semibold text-sm rounded-xl py-3.5 px-6 shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer pointer-events-auto"
              >
                <span>{t().configureLayout}</span>
                <ArrowRight class="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* ================= STEP 2: 11대 오버레이 미리보기 & Alt+J 배치 조절 ================= */}
      <Show when={step2Presence.mounted()}>
        <div
          class={`relative w-full h-full transition-opacity duration-200 ${
            step2Presence.visible() ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Top Apple Minimal Floating Capsule Toolbar */}
          <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 bg-[#181820]/92 backdrop-blur-2xl border border-white/[0.12] rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.85)] text-[#f5f5f7]">
            {/* Step 2 Progress Bar */}
            <div class="flex items-center gap-1 pr-2 border-r border-white/10 w-12">
              <div class="h-1 flex-1 rounded-full bg-[#E10600] shadow-[0_0_6px_rgba(225,6,0,0.5)]" />
              <div class="h-1 flex-1 rounded-full bg-[#E10600] shadow-[0_0_6px_rgba(225,6,0,0.5)]" />
            </div>

            {/* Alt + J Shortcut Pill */}
            <button
              onClick={toggleEditMode}
              class={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all duration-150 active:scale-[0.96] cursor-pointer pointer-events-auto ${
                settings.isEditMode
                  ? "bg-white/20 text-white border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.12)]"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              <span>{settings.isEditMode ? t().editMode : t().drivingMode}</span>
              <kbd class="bg-black/40 px-1 py-0.5 rounded text-[10px] font-mono border border-white/15 text-white">
                Alt+J
              </kbd>
            </button>

            {/* 11 Core Widgets Toggle Drawer Button */}
            <div class="relative" id="widget-list-container">
              <button
                onClick={() => setShowWidgetList((prev) => !prev)}
                class="px-2.5 py-1 rounded-full text-xs bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 flex items-center gap-1.5 cursor-pointer pointer-events-auto transition-all active:scale-[0.96]"
              >
                <Layers class="w-3.5 h-3.5 text-[#00d26a]" />
                <span>{t().manageWidgetsPill} ({activeWidgetCount()}/13)</span>
                <ChevronDown class={`w-3 h-3 transition-transform ${showWidgetList() ? "rotate-180" : ""}`} />
              </button>

              {/* Widget List Popover */}
              <Show when={widgetListPresence.mounted()}>
                <div
                  onClick={(e) => e.stopPropagation()}
                  class={`absolute top-full left-0 mt-2 w-72 bg-[#1e1e24]/95 backdrop-blur-3xl border border-white/15 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 pointer-events-auto apple-popover ${
                    widgetListPresence.visible() ? "is-visible" : "is-hidden"
                  }`}
                >
                  <div class="px-2.5 py-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-wider border-b border-white/10">
                    {t().widgetManagerTitle}
                  </div>
                  <div class="max-h-64 overflow-y-auto flex flex-col gap-0.5">
                    <For each={widgetDefinitions()}>
                      {(w) => {
                        const isVis = () => settings.widgets[w.key]?.visible !== false;
                        return (
                          <div
                            onClick={() => toggleWidgetVisibility(w.key)}
                            class="px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs hover:bg-white/10 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            <div class="flex flex-col">
                              <span class={`font-medium ${isVis() ? "text-white" : "text-white/40 line-through"}`}>
                                {w.name}
                              </span>
                              <span class="text-[9px] text-white/30">{w.category}</span>
                            </div>
                            <button class={`p-1 rounded ${isVis() ? "text-[#00d26a]" : "text-white/25"}`}>
                              <Show when={isVis()} fallback={<EyeOff class="w-3.5 h-3.5" />}>
                                <Eye class="w-3.5 h-3.5" />
                              </Show>
                            </button>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </Show>
            </div>

            {/* F1 Font Status Pill */}
            <button
              onClick={() => setShowFontInfo(true)}
              class="px-2.5 py-1 rounded-full text-xs font-f1 bg-white/5 hover:bg-white/10 text-white/85 border border-white/10 flex items-center gap-1.5 cursor-pointer pointer-events-auto transition-all active:scale-[0.96]"
            >
              <Type class="w-3.5 h-3.5 text-[#e10600]" />
              <span>{t().f1FontBadge}</span>
            </button>

            {/* Step 2 Language Pill */}
            <div class="relative" id="step2-lang-container">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStep2LangOpen((prev) => !prev);
                }}
                class="px-2.5 py-1 rounded-full text-xs bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 flex items-center gap-1 cursor-pointer pointer-events-auto transition-all active:scale-[0.96]"
              >
                <span>{currentLang().flag}</span>
                <ChevronDown class={`w-3 h-3 text-white/40 transition-transform ${isStep2LangOpen() ? "rotate-180" : ""}`} />
              </button>

              <Show when={step2LangPresence.mounted()}>
                <div
                  onClick={(e) => e.stopPropagation()}
                  class={`absolute top-full right-0 mt-2 w-48 bg-[#1e1e24]/95 backdrop-blur-3xl border border-white/15 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 pointer-events-auto apple-popover ${
                    step2LangPresence.visible() ? "is-visible" : "is-hidden"
                  }`}
                >
                  <For each={SUPPORTED_LANGUAGES}>
                    {(lang) => {
                      const isSelected = () => settings.language === lang.code;
                      return (
                        <div
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsStep2LangOpen(false);
                          }}
                          class={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-all ${
                            isSelected()
                              ? "bg-white/15 text-white font-semibold"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div class="flex items-center gap-2.5">
                            <span class="text-base leading-none">{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                          <Show when={isSelected()}>
                            <Check class="w-3.5 h-3.5 text-[#30d158] stroke-[2.5]" />
                          </Show>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </div>

            {/* Actions */}
            <div class="flex items-center gap-2 pl-2 border-l border-white/10">
              <button
                onClick={() => updateSettings("setupStep", 1)}
                class="px-2.5 py-1 rounded-full text-xs text-[#a1a1a6] hover:text-white hover:bg-white/10 transition-all active:scale-[0.96] flex items-center gap-1 cursor-pointer pointer-events-auto"
              >
                <ArrowLeft class="w-3 h-3" />
                <span>{t().previous}</span>
              </button>

              <button
                onClick={saveSettingsAsDefault}
                class="px-3.5 py-1 rounded-full bg-[#00d26a] hover:bg-[#00ba5e] active:scale-[0.96] text-black font-semibold text-xs shadow-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer pointer-events-auto"
              >
                <span>{t().saveAndStart}</span>
                <Check class="w-3 h-3 stroke-[2.5]" />
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
                    <h2 class="text-base font-bold font-f1">Formula 1 Broadcast Typography</h2>
                  </div>
                  <button
                    onClick={() => setShowFontInfo(false)}
                    class="text-xs text-white/50 hover:text-white px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
                  >
                    {t().close}
                  </button>
                </div>

                <div class="flex flex-col gap-2.5 text-xs text-[#a0a0b0] leading-relaxed">
                  <p>Formula 1 Official Broadcast Font Stack & Web Fonts</p>
                  <div class="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5 font-mono text-[11px] text-white/90">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-[#00d26a]" />
                      <span>Status: <strong class="text-[#00d26a]">Active</strong></span>
                    </div>
                    <div class="pl-4 text-[10px] text-white/60">
                      • Timing & Leaderboard: <code class="text-amber-300">DIN Alternate / Titillium Web</code><br/>
                      • Cockpit Telemetry: <code class="text-amber-300">Chakra Petch</code>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowFontInfo(false)}
                  class="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl transition-all cursor-pointer"
                >
                  {t().close}
                </button>
              </div>
            </div>
          </Show>

          {/* ================= 11대 오버레이 실시간 인터랙티브 프리뷰 뷰포트 ================= */}
          <div class="w-full h-full relative pointer-events-none">
            {/* 기능 1: 순위표 (Top-Left) */}
            <Show when={settings.widgets.leaderboard?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("leaderboard", e)}
                style={{
                  transform: `translate3d(${settings.widgets.leaderboard.x}px, ${settings.widgets.leaderboard.y}px, 0) scale(${settings.widgets.leaderboard.scale})`,
                  "transform-origin": "top left",
                }}
                class={`fixed top-14 left-6 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <Leaderboard
                  cars={telemetry.frame?.cars}
                  playerCarIdx={telemetry.frame?.player?.carIdx || 1}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.leaderboard.scale}
                  width={settings.widgets.leaderboard.width || 460}
                  onScaleChange={(scale) => updateWidgetTransform("leaderboard", { scale })}
                  onWidthChange={(width) => updateWidgetTransform("leaderboard", { width })}
                />
              </div>
            </Show>

            {/* 기능 2: 렐러티브 (Bottom-Right) */}
            <Show when={settings.widgets.relative?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("relative", e)}
                style={{
                  transform: `translate3d(${settings.widgets.relative.x}px, ${settings.widgets.relative.y}px, 0) scale(${settings.widgets.relative.scale})`,
                  "transform-origin": "bottom right",
                }}
                class={`fixed bottom-8 right-6 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <Relative
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.relative.scale}
                  onScaleChange={(scale) => updateWidgetTransform("relative", { scale })}
                />
              </div>
            </Show>

            {/* 기능 3: 직전 랩타임 비교 (Top-Center) */}
            <Show when={settings.widgets.lapDelta?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("lapDelta", e)}
                style={{
                  transform: `translate3d(calc(-50% + ${settings.widgets.lapDelta.x}px), ${settings.widgets.lapDelta.y}px, 0) scale(${settings.widgets.lapDelta.scale})`,
                  "transform-origin": "top center",
                }}
                class={`fixed top-14 left-1/2 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <LapDelta
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.lapDelta.scale}
                  onScaleChange={(scale) => updateWidgetTransform("lapDelta", { scale })}
                />
              </div>
            </Show>

            {/* 기능 4: 리벤지 트래커 (Bottom-Right-Center) */}
            <Show when={settings.widgets.revengeTracker?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("revengeTracker", e)}
                style={{
                  transform: `translate3d(${settings.widgets.revengeTracker.x}px, ${settings.widgets.revengeTracker.y}px, 0) scale(${settings.widgets.revengeTracker.scale})`,
                  "transform-origin": "bottom right",
                }}
                class={`fixed bottom-24 right-80 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <RevengeTracker
                  hasTarget={true}
                  targetCarNumber="33"
                  targetDriverName="Max Verstappen"
                  gapSeconds={1.42}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.revengeTracker.scale}
                  onScaleChange={(scale) => updateWidgetTransform("revengeTracker", { scale })}
                />
              </div>
            </Show>

            {/* 기능 5-L: 좌측 근접 스포터 (Left Screen Edge) */}
            <Show when={settings.widgets.spotterLeft?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("spotterLeft", e)}
                style={{
                  transform: `translate3d(${settings.widgets.spotterLeft.x}px, calc(-50% + ${settings.widgets.spotterLeft.y}px), 0) scale(${settings.widgets.spotterLeft.scale})`,
                  "transform-origin": "left center",
                }}
                class={`fixed top-1/2 left-2 z-40 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-r-xl"
                    : "pointer-events-none"
                }`}
              >
                <SpotterLeft
                  distance={1.4}
                  state="danger"
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.spotterLeft.scale}
                  onScaleChange={(scale) => updateWidgetTransform("spotterLeft", { scale })}
                />
              </div>
            </Show>

            {/* 기능 5-R: 우측 근접 스포터 (Right Screen Edge) */}
            <Show when={settings.widgets.spotterRight?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("spotterRight", e)}
                style={{
                  transform: `translate3d(${settings.widgets.spotterRight.x}px, calc(-50% + ${settings.widgets.spotterRight.y}px), 0) scale(${settings.widgets.spotterRight.scale})`,
                  "transform-origin": "right center",
                }}
                class={`fixed top-1/2 right-2 z-40 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-l-xl"
                    : "pointer-events-none"
                }`}
              >
                <SpotterRight
                  distance={2.8}
                  state="caution"
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.spotterRight.scale}
                  onScaleChange={(scale) => updateWidgetTransform("spotterRight", { scale })}
                />
              </div>
            </Show>

            {/* 기능 6: 연료 시뮬레이터 (Top-Right-Center) */}
            <Show when={settings.widgets.fuelCalculator?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("fuelCalculator", e)}
                style={{
                  transform: `translate3d(${settings.widgets.fuelCalculator.x}px, ${settings.widgets.fuelCalculator.y}px, 0) scale(${settings.widgets.fuelCalculator.scale})`,
                  "transform-origin": "top right",
                }}
                class={`fixed top-14 right-72 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <FuelSimulator
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.fuelCalculator.scale}
                  onScaleChange={(scale) => updateWidgetTransform("fuelCalculator", { scale })}
                />
              </div>
            </Show>

            {/* 기능 7: 타이어 분석기 (Bottom-Left) */}
            <Show when={settings.widgets.tireAnalysis?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("tireAnalysis", e)}
                style={{
                  transform: `translate3d(${settings.widgets.tireAnalysis.x}px, ${settings.widgets.tireAnalysis.y}px, 0) scale(${settings.widgets.tireAnalysis.scale})`,
                  "transform-origin": "bottom left",
                }}
                class={`fixed bottom-8 left-6 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <TireAnalysis
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.tireAnalysis.scale}
                  onScaleChange={(scale) => updateWidgetTransform("tireAnalysis", { scale })}
                />
              </div>
            </Show>

            {/* 기능 8: 전방 사고 경고 (Center-Top-Floating) */}
            <Show when={settings.widgets.incidentHazard?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("incidentHazard", e)}
                style={{
                  transform: `translate3d(calc(-50% + ${settings.widgets.incidentHazard.x}px), ${settings.widgets.incidentHazard.y}px, 0) scale(${settings.widgets.incidentHazard.scale})`,
                  "transform-origin": "top center",
                }}
                class={`fixed top-28 left-1/2 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <IncidentHazard
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.incidentHazard.scale}
                  onScaleChange={(scale) => updateWidgetTransform("incidentHazard", { scale })}
                />
              </div>
            </Show>

            {/* 기능 9: 날씨 & 트랙 컨디션 (Top-Right) */}
            <Show when={settings.widgets.weather?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("weather", e)}
                style={{
                  transform: `translate3d(${settings.widgets.weather.x}px, ${settings.widgets.weather.y}px, 0) scale(${settings.widgets.weather.scale})`,
                  "transform-origin": "top right",
                }}
                class={`fixed top-14 right-6 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <WeatherWidget
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.weather.scale}
                  onScaleChange={(scale) => updateWidgetTransform("weather", { scale })}
                />
              </div>
            </Show>

            {/* 기능 10: 멀티클래스 레이더 (Center-Right-Floating) */}
            <Show when={settings.widgets.multiclassRadar?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("multiclassRadar", e)}
                style={{
                  transform: `translate3d(${settings.widgets.multiclassRadar.x}px, ${settings.widgets.multiclassRadar.y}px, 0) scale(${settings.widgets.multiclassRadar.scale})`,
                  "transform-origin": "right center",
                }}
                class={`fixed top-1/3 right-12 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <MulticlassRadar
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.multiclassRadar.scale}
                  onScaleChange={(scale) => updateWidgetTransform("multiclassRadar", { scale })}
                />
              </div>
            </Show>

            {/* 기능 11: 2D 실시간 트랙 맵 (Bottom-Center-Left) */}
            <Show when={settings.widgets.trackMap?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("trackMap", e)}
                style={{
                  transform: `translate3d(${settings.widgets.trackMap.x}px, ${settings.widgets.trackMap.y}px, 0) scale(${settings.widgets.trackMap.scale})`,
                  "transform-origin": "bottom left",
                }}
                class={`fixed bottom-8 left-64 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded"
                    : "pointer-events-none"
                }`}
              >
                <TrackMap
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.trackMap.scale}
                  onScaleChange={(scale) => updateWidgetTransform("trackMap", { scale })}
                />
              </div>
            </Show>

            {/* 콕핏 스티어링 허브 (Bottom-Center) */}
            <Show when={settings.widgets.telemetryHub?.visible !== false}>
              <div
                onMouseDown={(e) => handleMouseDown("telemetryHub", e)}
                style={{
                  transform: `translate3d(calc(-50% + ${settings.widgets.telemetryHub.x}px), ${settings.widgets.telemetryHub.y}px, 0) scale(${settings.widgets.telemetryHub.scale})`,
                  "transform-origin": "bottom center",
                }}
                class={`fixed bottom-6 left-1/2 z-30 select-none transition-shadow duration-150 ${
                  settings.isEditMode
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing ring-1 ring-white/25 hover:ring-white/50 shadow-[0_0_24px_rgba(255,255,255,0.08)] rounded-xl"
                    : "pointer-events-none"
                }`}
              >
                <TelemetryHub
                  gear="7"
                  speedKmh={312}
                  rpm={11800}
                  maxRpm={12500}
                  throttlePct={100}
                  brakePct={0}
                  drsAvailable={true}
                  drsActive={true}
                  isEditMode={settings.isEditMode}
                  scale={settings.widgets.telemetryHub.scale}
                  onScaleChange={(scale) => updateWidgetTransform("telemetryHub", { scale })}
                />
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};

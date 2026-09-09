import { Component, createSignal, createEffect, Show, For } from "solid-js";
import {
  settings,
  updateSettings,
  updateUserProfile,
  toggleWidgetVisibility,
  toggleEditMode,
  closeControlPanel,
  WidgetKey,
} from "../../stores/settingsStore.ts";
import {
  LogoF1,
  LogoWEC,
  LogoWRC,
  LogoIndyCar,
  LogoIMSA,
} from "../../assets/icons/Icons.tsx";
import {
  Palette,
  Layers,
  Monitor,
  Keyboard,
  Check,
  X,
  Eye,
  EyeOff,
  Globe,
  User,
  FileText,
} from "lucide-solid";
import { t, setLanguage, SUPPORTED_LANGUAGES } from "../../i18n/index.ts";
import { CountryFlag, getCountryInfo } from "../../assets/icons/CountryFlags.tsx";
import { CarBrandIcon } from "../../assets/icons/CarBrandIcons.tsx";
import { telemetry } from "../../stores/telemetryStore.ts";
import { debugLogPath } from "../../services/debugLog.ts";
import {
  THEME_FONTS,
  fontStatus,
  installThemeFont,
  SETUP_FONTS_COMMAND,
  type FontStatus,
} from "../../services/fonts.ts";

export const ControlApp: Component<{ standalone?: boolean }> = (props) => {
  const [activeTab, setActiveTab] = createSignal<"widgets" | "profile" | "theme" | "display" | "shortcuts" | "language" | "diagnostics">("widgets");

  // Resolved by Rust: the same directory logic the writer uses, so what the user
  // reads here is exactly where the file lands.
  const [resolvedLogPath, setResolvedLogPath] = createSignal("");
  createEffect(() => {
    void debugLogPath(settings.debugLogPath).then(setResolvedLogPath);
  });

  const widgetDefinitions = () => [
    { key: "leaderboard" as WidgetKey, name: t().wLeaderboard, category: "Timing", desc: t().wLeaderboardDesc },
    { key: "relative" as WidgetKey, name: t().wRelative, category: "Timing", desc: t().wRelativeDesc },
    { key: "teamRadio" as WidgetKey, name: t().wTeamRadio, category: "Comms", desc: t().wTeamRadioDesc },
    { key: "lapDelta" as WidgetKey, name: t().wLapDelta, category: "Timing", desc: t().wLapDeltaDesc },
    { key: "revengeTracker" as WidgetKey, name: t().wRevenge, category: "Battle", desc: t().wRevengeDesc },
    { key: "spotterLeft" as WidgetKey, name: t().wSpotterL, category: "Safety", desc: t().wSpotterLDesc },
    { key: "spotterRight" as WidgetKey, name: t().wSpotterR, category: "Safety", desc: t().wSpotterRDesc },
    { key: "fuelCalculator" as WidgetKey, name: t().wFuel, category: "Strategy", desc: t().wFuelDesc },
    { key: "tireAnalysis" as WidgetKey, name: t().wTire, category: "Strategy", desc: t().wTireDesc },
    { key: "incidentHazard" as WidgetKey, name: t().wHazard, category: "Safety", desc: t().wHazardDesc },
    { key: "weather" as WidgetKey, name: t().wWeather, category: "Environment", desc: t().wWeatherDesc },
    { key: "multiclassRadar" as WidgetKey, name: t().wMulticlass, category: "Battle", desc: t().wMulticlassDesc },
    { key: "trackMap" as WidgetKey, name: t().wTrackMap, category: "Map", desc: t().wTrackMapDesc },
    { key: "shiftLight" as WidgetKey, name: t().wShiftLight, category: "Cockpit", desc: t().wShiftLightDesc },
    { key: "telemetryHub" as WidgetKey, name: t().wTelemetryHub, category: "Cockpit", desc: t().wTelemetryHubDesc },
  ];

  // standalone = this is its own OS window (Tauri "control"), so no backdrop,
  // no fake traffic lights, and no click-outside-to-close. The browser preview
  // keeps the modal-card presentation.
  // Selecting a theme selects its official typeface, so report whether that face
  // actually resolved rather than assuming it did.
  const [fontState, setFontState] = createSignal<FontStatus>(fontStatus(settings.theme));
  createEffect(() => {
    const theme = settings.theme;
    setFontState(fontStatus(theme));
    document.fonts.ready.then(() => setFontState(fontStatus(theme)));
  });

  const [fontInstalling, setFontInstalling] = createSignal(false);
  const [fontError, setFontError] = createSignal<string | null>(null);

  const runFontInstall = async () => {
    setFontInstalling(true);
    setFontError(null);
    const result = await installThemeFont(settings.theme);
    if (!result.ok) {
      setFontError(result.faces.filter((f) => !f.ok).map((f) => f.error).join(" · "));
    }
    setFontState(fontStatus(settings.theme));
    setFontInstalling(false);
  };

  const standalone = () => !!props.standalone;

  return (
    <div
      class={
        standalone()
          ? "w-full h-full flex text-white font-sans select-none"
          : "fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto select-none"
      }
      onClick={(e) => {
        if (!standalone() && e.target === e.currentTarget) closeControlPanel();
      }}
    >
      {/* Program Window Container */}
      <div
        class={`bg-[#1a1a1e] overflow-hidden flex flex-col text-white font-sans ${
          standalone()
            ? "w-full h-full"
            : "w-full max-w-[840px] border border-white/15 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.9)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Titlebar */}
        <div class="flex items-center justify-between px-5 py-3.5 bg-[#141417] border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <Show when={!standalone()}>
              <div class="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 cursor-pointer" onClick={closeControlPanel} title={t().close} />
              <div class="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-40" />
              <div class="w-3 h-3 rounded-full bg-[#27c93f] opacity-40" />
              <div class="h-4 w-px bg-white/10 mx-1" />
            </Show>
            <span class="text-xs font-semibold text-white/90">{t().appName} — {t().programSettings}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">{t().version}</span>
          </div>

          <div class="flex items-center gap-3">
            {/* Live iRacing link state — the HUD appears on its own when this is green. */}
            <span
              class={`text-[11px] flex items-center gap-1.5 ${
                telemetry.isConnected ? "text-[#30d158]" : "text-white/45"
              }`}
              title={telemetry.isConnected ? t().overlayActiveBg : undefined}
            >
              <span
                class={`w-2 h-2 rounded-full ${
                  telemetry.isConnected ? "bg-[#30d158]" : "bg-white/30 animate-pulse"
                }`}
              />
              {telemetry.isConnected ? t().iracingConnected : t().iracingWaiting}
            </span>
            <Show when={!standalone()}>
              <button
                onClick={closeControlPanel}
                class="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title={t().close}
              >
                <X class="w-4 h-4" />
              </button>
            </Show>
          </div>
        </div>

        {/* Window Body: Sidebar + Main Content */}
        <div class={`flex flex-1 ${standalone() ? "min-h-0" : "min-h-[460px]"}`}>
          {/* Left Sidebar Tabs */}
          <div class="w-48 bg-[#161619] border-r border-white/10 p-3 flex flex-col gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("widgets")}
              class={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs font-medium text-left transition-all ${
                activeTab() === "widgets"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers class="w-4 h-4 text-[#30d158]" />
              <span>{t().tabWidgets}</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              class={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs font-medium text-left transition-all ${
                activeTab() === "profile"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <User class="w-4 h-4 text-[#ff9f0a]" />
              <span>사용자 프로필 & 국가</span>
            </button>

            <button
              onClick={() => setActiveTab("theme")}
              class={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs font-medium text-left transition-all ${
                activeTab() === "theme"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Palette class="w-4 h-4 text-[#E10600]" />
              <span>{t().tabTheme}</span>
            </button>

            <button
              onClick={() => setActiveTab("display")}
              class={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs font-medium text-left transition-all ${
                activeTab() === "display"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Monitor class="w-4 h-4 text-[#0a84ff]" />
              <span>{t().tabDisplay}</span>
            </button>

            <button
              onClick={() => setActiveTab("language")}
              class={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs font-medium text-left transition-all ${
                activeTab() === "language"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Globe class="w-4 h-4 text-[#af52de]" />
              <span>{t().tabLanguage}</span>
            </button>

            <button
              onClick={() => setActiveTab("shortcuts")}
              class={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs font-medium text-left transition-all ${
                activeTab() === "shortcuts"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Keyboard class="w-4 h-4 text-[#ffd60a]" />
              <span>{t().tabShortcuts}</span>
            </button>

            <button
              onClick={() => setActiveTab("diagnostics")}
              class={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs font-medium text-left transition-all ${
                activeTab() === "diagnostics"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText class="w-4 h-4 text-[#30d158]" />
              <span>{t().tabDiagnostics}</span>
            </button>
          </div>

          {/* Right Main Content Area */}
          <div class={`flex-1 p-6 overflow-y-auto ${standalone() ? "min-h-0" : "max-h-[500px]"}`}>
            {/* 0. 사용자 프로필 & 국가 설정 탭 */}
            <Show when={activeTab() === "profile"}>
              <div class="flex flex-col gap-5">
                <div class="border-b border-white/10 pb-3">
                  <h2 class="text-base font-semibold text-white">사용자 프로필 & 국가 정보</h2>
                  <p class="text-xs text-white/50 mt-1">
                    iRacing 텔레메트리 연동 시 본인(YOU)으로 표시될 국가(태극기)와 드라이버 프로필을 관리합니다.
                  </p>
                </div>

                {/* Profile Card Preview */}
                <div class="p-4 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <CountryFlag code={settings.userProfile?.country || "KR"} class="w-10 h-7 rounded-[3px] border border-white/20 shadow-md" />
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-white">{settings.userProfile?.driverName || "K. Jeongmin"}</span>
                        <span class="text-xs font-mono text-white/40">#{settings.userProfile?.carNumber || "7"}</span>
                        <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-[#30d158]/20 text-[#30d158] rounded border border-[#30d158]/30">
                          YOU
                        </span>
                      </div>
                      <div class="flex items-center gap-2 mt-1 text-xs text-white/60">
                        <span>국가: <strong class="text-white">{getCountryInfo(settings.userProfile?.country || "KR").name} ({getCountryInfo(settings.userProfile?.country || "KR").code3})</strong></span>
                        <span>•</span>
                        <span class="flex items-center gap-1">차량: <CarBrandIcon brand={settings.userProfile?.carBrand || "Porsche"} class="w-3.5 h-3.5 inline" /> {settings.userProfile?.carBrand || "Porsche"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Country Selection Grid */}
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-white/80">국가 / iRacing 클럽 선택</label>
                  <div class="grid grid-cols-3 gap-2">
                    {[
                      { code: "KR", name: "대한민국 (Korea)" },
                      { code: "US", name: "미국 (United States)" },
                      { code: "DE", name: "독일 (Germany)" },
                      { code: "JP", name: "일본 (Japan)" },
                      { code: "GB", name: "영국 (United Kingdom)" },
                      { code: "FR", name: "프랑스 (France)" },
                      { code: "IT", name: "이탈리아 (Italy)" },
                      { code: "ES", name: "스페인 (Spain / Iberia)" },
                      { code: "NL", name: "네덜란드 (Netherlands)" },
                      { code: "AU", name: "호주 (Australia)" },
                      { code: "BE", name: "벨기에 (Belgium)" },
                      { code: "CA", name: "캐나다 (Canada)" },
                    ].map((c) => {
                      const isSelected = () => (settings.userProfile?.country || "KR") === c.code;
                      return (
                        <button
                          onClick={() => updateUserProfile({ country: c.code })}
                          class={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            isSelected()
                              ? "bg-white/15 border-white/40 text-white font-semibold ring-1 ring-white/20"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <CountryFlag code={c.code} class="w-5 h-3.5 rounded-[2px] border border-white/20 shrink-0" />
                          <span class="text-xs truncate">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Driver Name & Car Inputs */}
                <div class="grid grid-cols-3 gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs text-white/70">드라이버 이름</label>
                    <input
                      type="text"
                      value={settings.userProfile?.driverName || "K. Jeongmin"}
                      onInput={(e) => updateUserProfile({ driverName: e.currentTarget.value })}
                      class="px-3 py-2 bg-black/40 border border-white/15 rounded-lg text-xs text-white focus:border-[#30d158] focus:outline-none"
                    />
                  </div>

                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs text-white/70">차량 번호</label>
                    <input
                      type="text"
                      value={settings.userProfile?.carNumber || "7"}
                      onInput={(e) => updateUserProfile({ carNumber: e.currentTarget.value })}
                      class="px-3 py-2 bg-black/40 border border-white/15 rounded-lg text-xs text-white focus:border-[#30d158] focus:outline-none"
                    />
                  </div>

                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs text-white/70">선호 제조사 (브랜드)</label>
                    <select
                      value={settings.userProfile?.carBrand || "Porsche"}
                      onChange={(e) => updateUserProfile({ carBrand: e.currentTarget.value })}
                      class="px-3 py-2 bg-black/40 border border-white/15 rounded-lg text-xs text-white focus:border-[#30d158] focus:outline-none"
                    >
                      <option value="Porsche">Porsche</option>
                      <option value="Ferrari">Ferrari</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes">Mercedes-AMG</option>
                      <option value="McLaren">McLaren</option>
                      <option value="Audi">Audi</option>
                      <option value="Aston Martin">Aston Martin</option>
                      <option value="Lamborghini">Lamborghini</option>
                      <option value="Corvette">Corvette</option>
                      <option value="Ford">Ford</option>
                      <option value="Cadillac">Cadillac</option>
                      <option value="Hyundai">Hyundai</option>
                    </select>
                  </div>
                </div>
              </div>
            </Show>

            {/* 1. 위젯 관리 탭 */}
            <Show when={activeTab() === "widgets"}>
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 class="text-base font-semibold text-white">{t().widgetManagerTitle}</h2>
                    <p class="text-xs text-white/50">{t().widgetManagerSubtitle}</p>
                  </div>
                  <button
                    onClick={() => {
                      closeControlPanel();
                      toggleEditMode();
                    }}
                    class="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t().editOnOverlay}</span>
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-2">
                  <For each={widgetDefinitions()}>
                    {(w) => {
                      const isVis = () => settings.widgets[w.key]?.visible !== false;

                      return (
                        <div class="flex items-center justify-between p-3 rounded-xl bg-[#202025] border border-white/10 hover:border-white/20 transition-all">
                          <div class="flex flex-col gap-0.5">
                            <div class="flex items-center gap-2">
                              <span class={`text-sm font-semibold ${isVis() ? "text-white" : "text-white/40 line-through"}`}>
                                {w.name}
                              </span>
                              <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                                {w.category}
                              </span>
                            </div>
                            <span class="text-xs text-white/40">{w.desc}</span>
                          </div>

                          <div class="flex items-center gap-3">
                            <button
                              onClick={() => toggleWidgetVisibility(w.key)}
                              class={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isVis()
                                  ? "bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/30 hover:bg-[#30d158]/30"
                                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                              }`}
                            >
                              <Show when={isVis()} fallback={<EyeOff class="w-3.5 h-3.5" />}>
                                <Eye class="w-3.5 h-3.5" />
                              </Show>
                              <span>{isVis() ? t().stateShown : t().stateHidden}</span>
                            </button>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </Show>

            {/* 2. 테마 설정 탭 */}
            <Show when={activeTab() === "theme"}>
              <div class="flex flex-col gap-4">
                <div class="border-b border-white/10 pb-3">
                  <h2 class="text-base font-semibold text-white">{t().themeTitle}</h2>
                  <p class="text-xs text-white/50">{t().themeSubtitle}</p>
                </div>

                <div class="flex flex-col gap-3">
                  {/* F1 Card */}
                  <div class="p-4 rounded-xl bg-[#202025] border-2 border-[#E10600] flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="h-8 w-20 flex items-center justify-center">
                        <LogoF1 class="h-6 w-auto" />
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold text-white">Formula 1</span>
                          <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#E10600]/20 text-[#ff453a] font-semibold">
                            {t().availableBadge}
                          </span>
                        </div>
                        <p class="text-xs text-white/50 mt-0.5">{t().f1ThemeDesc}</p>
                      </div>
                    </div>
                    <Check class="w-5 h-5 text-[#30d158] stroke-[2.5]" />
                  </div>

                  {/* Official typeface of the selected theme — real resolved state */}
                  <div class="px-4 py-3 rounded-xl bg-[#202025] border border-white/10 flex flex-col gap-2">
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex items-center gap-2 min-w-0">
                        <span
                          class={`w-2 h-2 rounded-full shrink-0 ${
                            fontState() === "installed" ? "bg-[#30d158]" : "bg-[#ff9f0a]"
                          }`}
                        />
                        <span class="text-xs font-medium text-white truncate">
                          {THEME_FONTS[settings.theme].label || settings.theme.toUpperCase()}
                        </span>
                      </div>
                      <span
                        class={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          fontState() === "installed"
                            ? "bg-[#30d158]/15 text-[#30d158]"
                            : "bg-[#ff9f0a]/15 text-[#ffd60a]"
                        }`}
                      >
                        {fontState() === "installed"
                          ? t().fontInstalled
                          : fontState() === "missing"
                          ? t().fontMissing
                          : t().fontThemeUnavailable}
                      </span>
                    </div>

                    <Show when={fontState() === "missing"}>
                      <p class="text-[11px] text-white/55 leading-relaxed">{t().fontMissingHelp}</p>
                      <button
                        onClick={runFontInstall}
                        disabled={fontInstalling()}
                        class="w-full py-2 rounded-lg bg-[#E10600] hover:bg-[#c00500] disabled:opacity-50 disabled:cursor-wait text-white text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
                      >
                        {fontInstalling() ? t().fontInstalling : t().fontInstallButton}
                      </button>
                      <p class="text-[10px] text-white/35">{t().fontInstallVerified}</p>
                      <details class="text-[10px] text-white/35">
                        <summary class="cursor-pointer hover:text-white/60">{t().fontManualAlt}</summary>
                        <code class="mt-1.5 block bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-[#ffd60a] select-text">
                          {SETUP_FONTS_COMMAND}
                        </code>
                      </details>
                    </Show>

                    <Show when={fontError()}>
                      <p class="text-[10px] text-[#ff453a] leading-relaxed break-all">
                        {t().fontInstallFailed}: {fontError()}
                      </p>
                    </Show>

                    <Show when={THEME_FONTS[settings.theme].rightsHolder}>
                      <p class="text-[10px] text-white/35">
                        {THEME_FONTS[settings.theme].rightsHolder} · {t().fontRightsNotice}
                      </p>
                    </Show>
                  </div>

                  {/* Upcoming Themes */}
                  <div class="p-3.5 rounded-xl bg-[#202025]/50 border border-white/5 flex items-center justify-between opacity-50">
                    <div class="flex items-center gap-4">
                      <div class="h-6 w-20 flex items-center justify-center">
                        <LogoWEC class="h-5 w-auto" />
                      </div>
                      <span class="text-xs font-medium text-white/80">WEC</span>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40">{t().comingSoonBadge}</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-[#202025]/50 border border-white/5 flex items-center justify-between opacity-50">
                    <div class="flex items-center gap-4">
                      <div class="h-6 w-20 flex items-center justify-center">
                        <LogoWRC class="h-5 w-auto" />
                      </div>
                      <span class="text-xs font-medium text-white/80">WRC</span>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40">{t().comingSoonBadge}</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-[#202025]/50 border border-white/5 flex items-center justify-between opacity-50">
                    <div class="flex items-center gap-4">
                      <div class="h-6 w-20 flex items-center justify-center">
                        <LogoIndyCar class="h-5 w-auto" />
                      </div>
                      <span class="text-xs font-medium text-white/80">IndyCar</span>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40">{t().comingSoonBadge}</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-[#202025]/50 border border-white/5 flex items-center justify-between opacity-50">
                    <div class="flex items-center gap-4">
                      <div class="h-6 w-20 flex items-center justify-center">
                        <LogoIMSA class="h-5 w-auto" />
                      </div>
                      <span class="text-xs font-medium text-white/80">Daytona</span>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40">{t().comingSoonBadge}</span>
                  </div>
                </div>

                <div class="text-[11px] text-white/40 text-center py-2">
                  {t().otherSeriesNotice}
                </div>

                {/* 상단 시리즈 로고 On/Off 토글 및 세션 모드 설정 */}
                <div class="mt-1 pt-3 border-t border-white/10 flex flex-col gap-2.5">
                  <div class="flex items-center justify-between p-3.5 rounded-xl bg-[#202025] border border-white/10">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-semibold text-white">
                        {t().showThemeLogoTitle || "상단 시리즈 로고 표시"}
                      </span>
                      <span class="text-[11px] text-white/50">
                        {t().showThemeLogoDesc || "순위표 헤더에 현재 선택된 테마의 공식 로고를 노출합니다."}
                      </span>
                    </div>
                    <button
                      onClick={() => updateSettings("showThemeLogo", !settings.showThemeLogo)}
                      class={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        settings.showThemeLogo !== false
                          ? "bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/40"
                          : "bg-white/10 text-white/40 border border-white/15"
                      }`}
                    >
                      {settings.showThemeLogo !== false ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div class="flex items-center justify-between p-3.5 rounded-xl bg-[#202025] border border-white/10">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-semibold text-white">
                        {t().translateSystemMessagesTitle}
                      </span>
                      <span class="text-[11px] text-white/50">
                        {t().translateSystemMessagesDesc}
                      </span>
                    </div>
                    <button
                      onClick={() => updateSettings("translateSystemMessages", !settings.translateSystemMessages)}
                      class={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        settings.translateSystemMessages
                          ? "bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/40"
                          : "bg-white/10 text-white/40 border border-white/15"
                      }`}
                    >
                      {settings.translateSystemMessages ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div class="flex items-center justify-between p-3.5 rounded-xl bg-[#202025] border border-white/10">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-semibold text-white">
                        {t().sessionMode || "시뮬레이터 세션 (미리보기)"}
                      </span>
                      <span class="text-[11px] text-white/50">
                        {t().sessionModeDesc}
                      </span>
                    </div>
                    <div class="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                      <button
                        onClick={() => updateSettings("sessionType", "RACE")}
                        class={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                          settings.sessionType === "RACE" ? "bg-[#e10600] text-white" : "text-white/50 hover:text-white"
                        }`}
                      >
                        RACE
                      </button>
                      <button
                        onClick={() => updateSettings("sessionType", "QUALIFY")}
                        class={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                          settings.sessionType === "QUALIFY" ? "bg-[#ffd60a] text-black" : "text-white/50 hover:text-white"
                        }`}
                      >
                        QUAL
                      </button>
                      <button
                        onClick={() => updateSettings("sessionType", "PRACTICE")}
                        class={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                          settings.sessionType === "PRACTICE" ? "bg-[#0a84ff] text-white" : "text-white/50 hover:text-white"
                        }`}
                      >
                        PRAC
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Show>

            {/* 3. 모니터 & 디스플레이 탭 */}
            <Show when={activeTab() === "display"}>
              <div class="flex flex-col gap-4">
                <div class="border-b border-white/10 pb-3">
                  <h2 class="text-base font-semibold text-white">{t().displayTitle}</h2>
                  <p class="text-xs text-white/50">{t().displaySubtitle}</p>
                </div>

                <div class="flex flex-col gap-3">
                  <div
                    onClick={() => updateSettings("tripleMonitorMode", "center-clamp")}
                    class={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settings.tripleMonitorMode === "center-clamp"
                        ? "bg-[#202025] border-[#0a84ff]"
                        : "bg-[#202025]/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-bold text-white">{t().centerClampTitle}</span>
                      <Show when={settings.tripleMonitorMode === "center-clamp"}>
                        <Check class="w-4 h-4 text-[#0a84ff]" />
                      </Show>
                    </div>
                    <p class="text-xs text-white/50 leading-relaxed">
                      {t().centerClampDesc}
                    </p>

                    <Show when={settings.tripleMonitorMode === "center-clamp"}>
                      <div class="mt-3 pt-3 border-t border-white/10 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                        {/* 1. Center Monitor Width */}
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="text-xs font-semibold text-white/90">{t().tripleCenterWidthLabel}</div>
                            <div class="text-[10px] text-white/50">1080p FHD (1920px) / 1440p QHD (2560px)</div>
                          </div>
                          <div class="flex items-center gap-1 bg-[#1a1a1e] p-1 rounded-lg border border-white/10">
                            <button
                              onClick={() => updateSettings("centerClampWidth", 1920)}
                              class={`px-2.5 py-1 text-xs rounded font-medium transition-all cursor-pointer ${
                                settings.centerClampWidth === 1920
                                  ? "bg-[#0a84ff] text-white font-bold shadow"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {t().tripleCenterFHD}
                            </button>
                            <button
                              onClick={() => updateSettings("centerClampWidth", 2560)}
                              class={`px-2.5 py-1 text-xs rounded font-medium transition-all cursor-pointer ${
                                settings.centerClampWidth === 2560
                                  ? "bg-[#0a84ff] text-white font-bold shadow"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {t().tripleCenterQHD}
                            </button>
                          </div>
                        </div>

                        {/* 2. Spotter Bezel Anchor */}
                        <div class="flex items-center justify-between border-t border-white/5 pt-2">
                          <div>
                            <div class="text-xs font-semibold text-white/90">{t().bezelSnapLabel}</div>
                            <div class="text-[10px] text-white/50">{t().wSpotterL} & {t().wSpotterR}</div>
                          </div>
                          <div class="flex items-center gap-1 bg-[#1a1a1e] p-1 rounded-lg border border-white/10">
                            <button
                              onClick={() => updateSettings("spotterBezelAnchor", "center-bezel")}
                              class={`px-2.5 py-1 text-xs rounded font-medium transition-all cursor-pointer ${
                                settings.spotterBezelAnchor === "center-bezel"
                                  ? "bg-[#0a84ff] text-white font-bold shadow"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {t().bezelCenter}
                            </button>
                            <button
                              onClick={() => updateSettings("spotterBezelAnchor", "screen-edge")}
                              class={`px-2.5 py-1 text-xs rounded font-medium transition-all cursor-pointer ${
                                settings.spotterBezelAnchor === "screen-edge"
                                  ? "bg-[#0a84ff] text-white font-bold shadow"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {t().bezelEdge}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Show>
                  </div>

                  <div
                    onClick={() => updateSettings("tripleMonitorMode", "full-span")}
                    class={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settings.tripleMonitorMode === "full-span"
                        ? "bg-[#202025] border-[#0a84ff]"
                        : "bg-[#202025]/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-bold text-white">{t().fullSpanTitle}</span>
                      <Show when={settings.tripleMonitorMode === "full-span"}>
                        <Check class="w-4 h-4 text-[#0a84ff]" />
                      </Show>
                    </div>
                    <p class="text-xs text-white/50 leading-relaxed">
                      {t().fullSpanDesc}
                    </p>
                  </div>
                </div>
              </div>
            </Show>

            {/* 4. 다국어 설정 탭 (Language Tab) */}
            <Show when={activeTab() === "language"}>
              <div class="flex flex-col gap-4">
                <div class="border-b border-white/10 pb-3">
                  <h2 class="text-base font-semibold text-white">{t().selectLanguageTitle}</h2>
                  <p class="text-xs text-white/50">{t().selectLanguageSubtitle}</p>
                </div>

                <div class="grid grid-cols-1 gap-2.5">
                  <For each={SUPPORTED_LANGUAGES}>
                    {(lang) => {
                      const isSelected = () => settings.language === lang.code;
                      return (
                        <div
                          onClick={() => setLanguage(lang.code)}
                          class={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected()
                              ? "bg-[#202025] border-[#af52de] shadow-md ring-1 ring-[#af52de]/50"
                              : "bg-[#202025]/50 border-white/10 hover:border-white/20 hover:bg-[#202025]"
                          }`}
                        >
                          <div class="flex items-center gap-3.5">
                            <span class="text-2xl">{lang.flag}</span>
                            <div class="flex flex-col">
                              <div class="flex items-center gap-2">
                                <span class={`text-sm font-bold ${isSelected() ? "text-white" : "text-white/80"}`}>
                                  {lang.name}
                                </span>
                                <Show when={lang.code === "ko"}>
                                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium">
                                    기본 (Default)
                                  </span>
                                </Show>
                              </div>
                              <span class="text-xs text-white/40">{lang.englishName}</span>
                            </div>
                          </div>

                          <Show when={isSelected()}>
                            <div class="flex items-center gap-1.5 text-xs text-[#af52de] font-semibold bg-[#af52de]/15 px-2.5 py-1 rounded-lg">
                              <Check class="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{t().currentLanguageBadge}</span>
                            </div>
                          </Show>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </Show>

            {/* 5. 단축키 & 가이드 탭 */}
            <Show when={activeTab() === "shortcuts"}>
              <div class="flex flex-col gap-4">
                <div class="border-b border-white/10 pb-3">
                  <h2 class="text-base font-semibold text-white">{t().shortcutsTitle}</h2>
                  <p class="text-xs text-white/50">{t().shortcutsSubtitle}</p>
                </div>

                <div class="flex flex-col gap-3">
                  <div class="p-4 rounded-xl bg-[#202025] border border-white/10 flex items-center justify-between">
                    <div>
                      <span class="text-sm font-bold text-white">{t().shortcutEditModeTitle}</span>
                      <p class="text-xs text-white/50 mt-0.5">{t().shortcutEditModeDesc}</p>
                    </div>
                    <kbd class="px-2.5 py-1 rounded bg-black/60 border border-white/20 font-mono text-xs font-bold text-white">
                      Alt + J
                    </kbd>
                  </div>

                  <div class="p-4 rounded-xl bg-[#202025] border border-white/10">
                    <span class="text-sm font-bold text-white">{t().configStorageTitle}</span>
                    <p class="text-xs text-white/50 mt-1 leading-relaxed">
                      {t().configStorageDesc}
                    </p>
                  </div>
                </div>
              </div>
            </Show>

            {/* 6. 진단 & 로그 탭 */}
            <Show when={activeTab() === "diagnostics"}>
              <div class="flex flex-col gap-4">
                <div class="border-b border-white/10 pb-3">
                  <h2 class="text-base font-semibold text-white">{t().diagTitle}</h2>
                  <p class="text-xs text-white/50">{t().diagSubtitle}</p>
                </div>

                <div class="p-4 rounded-xl bg-[#202025] border border-white/10 flex items-center justify-between gap-4">
                  <div class="min-w-0">
                    <span class="text-sm font-bold text-white">{t().diagEnable}</span>
                    <p class="text-xs text-white/50 mt-0.5">{t().diagEnableDesc}</p>
                  </div>
                  <button
                    onClick={() => updateSettings("debugLogging", !settings.debugLogging)}
                    class={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${
                      settings.debugLogging ? "bg-[#30d158]" : "bg-white/15"
                    }`}
                    aria-pressed={settings.debugLogging}
                  >
                    <span
                      class={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        settings.debugLogging ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div class="p-4 rounded-xl bg-[#202025] border border-white/10 flex flex-col gap-2">
                  <span class="text-sm font-bold text-white">{t().diagPathLabel}</span>
                  <input
                    type="text"
                    value={settings.debugLogPath}
                    onInput={(e) => updateSettings("debugLogPath", e.currentTarget.value)}
                    placeholder={t().diagPathHint}
                    spellcheck={false}
                    class="w-full px-3 py-2 rounded-lg bg-[#141417] border border-white/10 text-xs text-white/90 font-mono outline-none focus:border-[#30d158]/60"
                  />
                  {/* The resolved absolute path, so nobody has to guess where it went. */}
                  <div class="text-[11px] text-white/45 font-mono break-all">
                    <Show when={!settings.debugLogPath}>
                      <span class="text-white/35">{t().diagPathDefault} · </span>
                    </Show>
                    {resolvedLogPath()}
                  </div>
                </div>

                <p class="text-[11px] leading-relaxed text-white/40">{t().diagWhatIsLogged}</p>
              </div>
            </Show>
          </div>
        </div>

        {/* Window Footer Action Bar */}
        <div class="flex items-center justify-between px-6 py-3.5 bg-[#141417] border-t border-white/10">
          {/* Changes persist on their own, so this reports state instead of asking
              the user to remember to save. */}
          <div class="text-xs text-white/40 flex items-center gap-1.5">
            <Check class="w-3.5 h-3.5 text-[#30d158] stroke-[2.5]" />
            <span>{t().settingsAutoSaved}</span>
          </div>

          <div class="flex items-center gap-3">
            <Show when={!telemetry.isConnected}>
              <span class="text-[11px] text-white/40">{t().overlayHiddenNotice}</span>
            </Show>
            <button
              onClick={() => {
                if (!standalone()) closeControlPanel();
                toggleEditMode();
              }}
              disabled={!telemetry.isConnected}
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {t().editOnOverlay}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

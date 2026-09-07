import { Component, createSignal, Show, For } from "solid-js";
import {
  settings,
  updateSettings,
  updateUserProfile,
  toggleWidgetVisibility,
  toggleEditMode,
  saveSettingsAsDefault,
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
} from "lucide-solid";
import { t, setLanguage, SUPPORTED_LANGUAGES } from "../../i18n/index.ts";
import { CountryFlag, getCountryInfo } from "../../assets/icons/CountryFlags.tsx";
import { CarBrandIcon } from "../../assets/icons/CarBrandIcons.tsx";

export const ControlApp: Component = () => {
  const [activeTab, setActiveTab] = createSignal<"widgets" | "profile" | "theme" | "display" | "shortcuts" | "language">("widgets");

  const widgetDefinitions = () => [
    { key: "leaderboard" as WidgetKey, name: t().wLeaderboard, category: "Timing", desc: t().wLeaderboardDesc },
    { key: "relative" as WidgetKey, name: t().wRelative, category: "Timing", desc: t().wRelativeDesc },
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
    { key: "telemetryHub" as WidgetKey, name: t().wTelemetryHub, category: "Cockpit", desc: t().wTelemetryHubDesc },
  ];

  const activeCount = () => Object.values(settings.widgets).filter((w) => w.visible).length;

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeControlPanel();
      }}
    >
      {/* Program Window Container */}
      <div
        class="w-full max-w-[840px] bg-[#1a1a1e] border border-white/15 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col text-white font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Titlebar */}
        <div class="flex items-center justify-between px-5 py-3.5 bg-[#141417] border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <div class="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 cursor-pointer" onClick={closeControlPanel} title={t().close} />
            <div class="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-40" />
            <div class="w-3 h-3 rounded-full bg-[#27c93f] opacity-40" />
            <div class="h-4 w-px bg-white/10 mx-1" />
            <span class="text-xs font-semibold text-white/90">{t().appName} — {t().programSettings}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">{t().version}</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[11px] text-[#30d158] flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#30d158]" />
              {t().overlayActiveBg}
            </span>
            <button
              onClick={closeControlPanel}
              class="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title={t().close}
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Window Body: Sidebar + Main Content */}
        <div class="flex flex-1 min-h-[460px]">
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
              <span>{t().tabWidgets} ({activeCount()}/13)</span>
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
          </div>

          {/* Right Main Content Area */}
          <div class="flex-1 p-6 overflow-y-auto max-h-[500px]">
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
                      const scale = () => Math.round((settings.widgets[w.key]?.scale || 1.0) * 100);

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
                            <div class="text-xs font-mono text-white/50">{scale()}%</div>
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
          </div>
        </div>

        {/* Window Footer Action Bar */}
        <div class="flex items-center justify-between px-6 py-3.5 bg-[#141417] border-t border-white/10">
          <div class="text-xs text-white/40">
            {t().appName} {t().version} • {t().overlayActiveBg}
          </div>

          <div class="flex items-center gap-3">
            <button
              onClick={() => {
                closeControlPanel();
                toggleEditMode();
              }}
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              {t().editOnOverlay}
            </button>
            <button
              onClick={() => {
                saveSettingsAsDefault();
                closeControlPanel();
              }}
              class="px-5 py-2 rounded-xl bg-[#30d158] hover:bg-[#28c840] active:scale-95 text-xs font-bold text-black shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check class="w-4 h-4 stroke-[2.5]" />
              <span>{t().saveAndReturn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

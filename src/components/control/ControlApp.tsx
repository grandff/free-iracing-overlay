import { Component, createSignal, Show, For } from "solid-js";
import {
  settings,
  updateSettings,
  updateWidgetTransform,
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
  Settings,
  Palette,
  Layers,
  Monitor,
  Keyboard,
  Check,
  X,
  Eye,
  EyeOff,
  Maximize2,
  ExternalLink,
} from "lucide-solid";

export const ControlApp: Component = () => {
  const [activeTab, setActiveTab] = createSignal<"theme" | "widgets" | "display" | "shortcuts">("widgets");

  const widgetDefinitions: { key: WidgetKey; name: string; category: string; desc: string }[] = [
    { key: "leaderboard", name: "1. 실시간 순위표 (Timing Tower)", category: "타이밍", desc: "F1 공식 타이밍 타워, 실시간 순위 및 랩 델타" },
    { key: "relative", name: "2. 렐러티브 (상대 간격)", category: "타이밍", desc: "내 차량 기준 전후방 드라이버와의 실시간 시간 간격" },
    { key: "lapDelta", name: "3. 직전 랩타임 델타", category: "타이밍", desc: "직전 랩 대비 델타 초 단위 비교 게이지" },
    { key: "revengeTracker", name: "4. 리벤지 트래커", category: "배틀", desc: "나에게 사고를 유발한 타깃 차량 자동 감지 및 간격 추적" },
    { key: "spotterLeft", name: "5-L. 좌측 근접 스포터", category: "안전", desc: "좌측 베젤 3단계 근접 경보 및 거리 표시" },
    { key: "spotterRight", name: "5-R. 우측 근접 스포터", category: "안전", desc: "우측 베젤 3단계 근접 경보 및 거리 표시" },
    { key: "fuelCalculator", name: "6. 연료 시뮬레이터", category: "전략", desc: "랩당 소비량 및 완주 필요 급유량 계산" },
    { key: "tireAnalysis", name: "7. 타이어 분석기", category: "전략", desc: "4륜 타이어 마모도, 압력(PSI), 온도 모니터링" },
    { key: "incidentHazard", name: "8. 전방 사고 경고", category: "안전", desc: "전방 400m 내 사고 발생 시 옐로우 플래그 점멸 경보" },
    { key: "weather", name: "9. 날씨 & 트랙 컨디션", category: "환경", desc: "노면 온도, 풍향 나침반, 우천 및 노면 상태" },
    { key: "multiclassRadar", name: "10. 멀티클래스 레이더", category: "배틀", desc: "상위 빠른 클래스 차량의 후방 고속 접근 경보" },
    { key: "trackMap", name: "11. 2D 실시간 트랙 맵", category: "맵", desc: "전체 서킷 2D 벡터 트랙 및 실시간 차량 위치" },
    { key: "telemetryHub", name: "콕핏 스티어링 허브", category: "콕핏", desc: "기어 단수, 디지털 속도계, 15구간 RPM LED, 페달 트레이스" },
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
        class="w-full max-w-[820px] bg-[#1a1a1e] border border-white/15 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col text-white font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Titlebar */}
        <div class="flex items-center justify-between px-5 py-3.5 bg-[#141417] border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <div class="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 cursor-pointer" onClick={closeControlPanel} title="닫기" />
            <div class="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-40" />
            <div class="w-3 h-3 rounded-full bg-[#27c93f] opacity-40" />
            <div class="h-4 w-px bg-white/10 mx-1" />
            <span class="text-xs font-semibold text-white/90">Free iRacing Overlay — 프로그램 제어판</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">v0.1.0</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[11px] text-[#30d158] flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#30d158]" />
              오버레이 백그라운드 활성
            </span>
            <button
              onClick={closeControlPanel}
              class="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="제어판 닫기 (오버레이는 계속 실행됨)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Window Body: Sidebar + Main Content */}
        <div class="flex flex-1 min-h-[440px]">
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
              <span>위젯 관리 ({activeCount()}/13)</span>
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
              <span>방송 테마 설정</span>
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
              <span>모니터 & 디스플레이</span>
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
              <span>단축키 & 조작 가이드</span>
            </button>
          </div>

          {/* Right Main Content Area */}
          <div class="flex-1 p-6 overflow-y-auto max-h-[500px]">
            {/* 1. 위젯 관리 탭 */}
            <Show when={activeTab() === "widgets"}>
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 class="text-base font-semibold text-white">11대 핵심 오버레이 위젯 활성화</h2>
                    <p class="text-xs text-white/50">게임 화면에 표시할 위젯을 선택하세요. 각 위젯은 오버레이에서 직접 크기 조절이 가능합니다.</p>
                  </div>
                  <button
                    onClick={() => {
                      closeControlPanel();
                      toggleEditMode();
                    }}
                    class="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>오버레이 배치 편집 (Alt+J)</span>
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-2">
                  <For each={widgetDefinitions}>
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
                              <span class="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">
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
                              <span>{isVis() ? "표시 중" : "숨김"}</span>
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
                  <h2 class="text-base font-semibold text-white">모터스포츠 방송 그래픽 테마</h2>
                  <p class="text-xs text-white/50">오버레이의 전체 디자인 룩앤필과 타이포그래피 스타일을 변경합니다.</p>
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
                          <span class="text-sm font-bold text-white">Formula 1 (F1 Broadcast HUD)</span>
                          <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#E10600]/20 text-[#ff453a] font-semibold">
                            현재 적용됨
                          </span>
                        </div>
                        <p class="text-xs text-white/50 mt-0.5">F1 공식 타이밍 타워, 고대비 타이포그래피, 매트 스티어링 LCD</p>
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
                      <span class="text-xs font-medium text-white/80">WEC (World Endurance Championship)</span>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40">업데이트 예정</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-[#202025]/50 border border-white/5 flex items-center justify-between opacity-50">
                    <div class="flex items-center gap-4">
                      <div class="h-6 w-20 flex items-center justify-center">
                        <LogoWRC class="h-5 w-auto" />
                      </div>
                      <span class="text-xs font-medium text-white/80">WRC (World Rally Championship)</span>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40">업데이트 예정</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-[#202025]/50 border border-white/5 flex items-center justify-between opacity-50">
                    <div class="flex items-center gap-4">
                      <div class="h-6 w-20 flex items-center justify-center">
                        <LogoIndyCar class="h-5 w-auto" />
                      </div>
                      <span class="text-xs font-medium text-white/80">IndyCar Series</span>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40">업데이트 예정</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-[#202025]/50 border border-white/5 flex items-center justify-between opacity-50">
                    <div class="flex items-center gap-4">
                      <div class="h-6 w-20 flex items-center justify-center">
                        <LogoIMSA class="h-5 w-auto" />
                      </div>
                      <span class="text-xs font-medium text-white/80">Daytona / IMSA SportsCar</span>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40">업데이트 예정</span>
                  </div>
                </div>
              </div>
            </Show>

            {/* 3. 모니터 & 디스플레이 탭 */}
            <Show when={activeTab() === "display"}>
              <div class="flex flex-col gap-4">
                <div class="border-b border-white/10 pb-3">
                  <h2 class="text-base font-semibold text-white">트리플 모니터 & 디스플레이 설정</h2>
                  <p class="text-xs text-white/50">초광폭 및 멀티 모니터 환경에서 왜곡 없이 시야각 중심에 배치합니다.</p>
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
                      <span class="text-sm font-bold text-white">중앙 16:9 모니터 영역 고정 (권장)</span>
                      <Show when={settings.tripleMonitorMode === "center-clamp"}>
                        <Check class="w-4 h-4 text-[#0a84ff]" />
                      </Show>
                    </div>
                    <p class="text-xs text-white/50 leading-relaxed">
                      트리플 모니터(5760x1080 / 7680x1440) 환경에서도 위젯들이 양 끝으로 멀어지지 않고 중앙 모니터 시야각 내에 집약됩니다.
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
                      <span class="text-sm font-bold text-white">전체 해상도 자유 배치 (Full Span)</span>
                      <Show when={settings.tripleMonitorMode === "full-span"}>
                        <Check class="w-4 h-4 text-[#0a84ff]" />
                      </Show>
                    </div>
                    <p class="text-xs text-white/50 leading-relaxed">
                      양 끝 모니터 베젤까지 모든 화면 전체 영역에 위젯을 자유롭게 배치합니다.
                    </p>
                  </div>
                </div>
              </div>
            </Show>

            {/* 4. 단축키 & 가이드 탭 */}
            <Show when={activeTab() === "shortcuts"}>
              <div class="flex flex-col gap-4">
                <div class="border-b border-white/10 pb-3">
                  <h2 class="text-base font-semibold text-white">단축키 및 작동 원리</h2>
                  <p class="text-xs text-white/50">오버레이와 제어판 프로그램의 동작 규칙입니다.</p>
                </div>

                <div class="flex flex-col gap-3">
                  <div class="p-4 rounded-xl bg-[#202025] border border-white/10 flex items-center justify-between">
                    <div>
                      <span class="text-sm font-bold text-white">오버레이 편집 모드 On / Off</span>
                      <p class="text-xs text-white/50 mt-0.5">주행 중 오버레이 위젯을 마우스로 드래그 이동하거나 크기(- / +)를 조절합니다.</p>
                    </div>
                    <kbd class="px-2.5 py-1 rounded bg-black/60 border border-white/20 font-mono text-xs font-bold text-white">
                      Alt + J
                    </kbd>
                  </div>

                  <div class="p-4 rounded-xl bg-[#202025] border border-white/10">
                    <span class="text-sm font-bold text-white">설정값 영구 저장 위치</span>
                    <p class="text-xs text-white/50 mt-1 leading-relaxed">
                      모든 위젯 좌표, 크기, 활성화 상태는 OS 표준 디렉터리의 <code class="text-white font-mono bg-black/40 px-1 py-0.5 rounded">config.json</code>에 저장됩니다.
                      프로그램을 껐다 켜도 저장된 오버레이가 자동으로 실행됩니다.
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
            설정값은 로컬 파일(<span class="font-mono text-white/60">config.json</span>)에 실시간 반영됩니다.
          </div>

          <div class="flex items-center gap-3">
            <button
              onClick={() => {
                closeControlPanel();
                toggleEditMode();
              }}
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              오버레이 편집 모드 (Alt+J)
            </button>
            <button
              onClick={() => {
                saveSettingsAsDefault();
                closeControlPanel();
              }}
              class="px-5 py-2 rounded-xl bg-[#30d158] hover:bg-[#28c840] active:scale-95 text-xs font-bold text-black shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check class="w-4 h-4 stroke-[2.5]" />
              <span>설정 저장 & 오버레이로 전환</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

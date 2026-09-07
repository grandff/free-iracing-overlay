import { Component, createSignal, Show } from "solid-js";
import {
  settings,
  updateSettings,
  updateWidgetTransform,
  saveSettingsAsDefault,
  toggleEditMode,
} from "../../stores/settingsStore.ts";
import { IconWarning, IconCompass, IconCrosshair, IconFuel, IconStopwatch } from "../../assets/icons/Icons.tsx";

export const SetupWizard: Component = () => {
  const [selectedTheme, setSelectedTheme] = createSignal<"f1">("f1");

  // Dragging state for Step 2
  const [draggingWidget, setDraggingWidget] = createSignal<string | null>(null);
  const [dragOffset, setDragOffset] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });

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
      class="fixed inset-0 z-50 flex flex-col select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ================= STEP 1: 테마 설정 화면 ================= */}
      <Show when={settings.setupStep === 1}>
        <div class="w-full h-full flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-6">
          <div class="max-w-3xl w-full bg-slate-900/90 border border-white/10 rounded-xl p-8 shadow-2xl flex flex-col gap-6 text-white">
            {/* Header */}
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-red-600 font-black text-xs">STEP 1/2</span>
                  <h1 class="text-xl font-black tracking-wide">iRacing 오버레이 테마 선택</h1>
                </div>
                <p class="text-sm text-slate-400 mt-1">
                  원하는 방송 그래픽 테마를 선택하세요. (설정 완료 후에도 언제든지 변경할 수 있습니다)
                </p>
              </div>
              <div class="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            </div>

            {/* Notice Badge */}
            <div class="bg-amber-500/15 border border-amber-500/40 rounded-lg p-3 text-xs text-amber-200 flex items-center gap-2">
              <span class="text-base">📢</span>
              <span>
                <strong>안내:</strong> 현재 버전에서는 <strong>오직 'F1 (Formula 1)' 테마</strong>로 우선 지원하며,
                WEC / WRC / IndyCar / GT 테마는 차기 업데이트에서 순차적으로 활성화됩니다.
              </span>
            </div>

            {/* Theme Cards Grid */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: F1 테마 (활성화 & 기본값) */}
              <div
                onClick={() => setSelectedTheme("f1")}
                class="relative border-2 border-red-500 bg-gradient-to-b from-red-950/40 to-slate-900 rounded-lg p-4 cursor-pointer shadow-lg hover:shadow-red-500/20 transition-all"
              >
                <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-600 text-[10px] font-bold">
                  ✓ 사용 가능
                </div>
                <div class="text-xs font-mono text-red-400 font-bold mb-1">OFFICIAL BROADCAST</div>
                <h3 class="text-lg font-black tracking-tight text-white mb-2">F1 테마</h3>
                <p class="text-xs text-slate-300 mb-4 leading-relaxed">
                  다크 카본 백그라운드, F1 시그니처 레드 포인트, 섹터 타임 미니바 및 고대비 타이포그래피.
                </p>
                <div class="flex items-center gap-1.5 text-[11px] font-mono text-red-300 bg-black/40 p-2 rounded">
                  <span class="w-2 h-2 rounded-full bg-red-500" />
                  <span>선택됨 (기본 권장 테마)</span>
                </div>
              </div>

              {/* Card 2: WEC 테마 (추후 제공) */}
              <div class="relative border border-white/10 bg-slate-900/40 rounded-lg p-4 opacity-50 cursor-not-allowed">
                <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium text-slate-400">
                  추후 제공
                </div>
                <div class="text-xs font-mono text-slate-500 font-bold mb-1">ENDURANCE 24H</div>
                <h3 class="text-lg font-bold text-slate-400 mb-2">WEC 르망</h3>
                <p class="text-xs text-slate-500 leading-relaxed">
                  르망 24시 스타일 글래스모피즘, Hypercar/LMP2/LMGT3 클래스 배지 및 스틴트 타이머.
                </p>
              </div>

              {/* Card 3: WRC 테마 (추후 제공) */}
              <div class="relative border border-white/10 bg-slate-900/40 rounded-lg p-4 opacity-50 cursor-not-allowed">
                <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium text-slate-400">
                  추후 제공
                </div>
                <div class="text-xs font-mono text-slate-500 font-bold mb-1">WORLD RALLY</div>
                <h3 class="text-lg font-bold text-slate-400 mb-2">WRC 랠리</h3>
                <p class="text-xs text-slate-500 leading-relaxed">
                  랠리 오렌지 & 형광 옐로우 고대비 스테이지 스플릿 타임 델타.
                </p>
              </div>

              {/* Card 4: IndyCar (추후 제공) */}
              <div class="relative border border-white/10 bg-slate-900/40 rounded-lg p-4 opacity-50 cursor-not-allowed">
                <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium text-slate-400">
                  추후 제공
                </div>
                <div class="text-xs font-mono text-slate-500 font-bold mb-1">OPEN-WHEEL</div>
                <h3 class="text-lg font-bold text-slate-400 mb-2">IndyCar</h3>
                <p class="text-xs text-slate-500 leading-relaxed">
                  인디 블루 & 레드, 원형 번호 라운델, P2P 카운터.
                </p>
              </div>

              {/* Card 5: GT Esports (추후 제공) */}
              <div class="relative border border-white/10 bg-slate-900/40 rounded-lg p-4 opacity-50 cursor-not-allowed">
                <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium text-slate-400">
                  추후 제공
                </div>
                <div class="text-xs font-mono text-slate-500 font-bold mb-1">GT WORLD</div>
                <h3 class="text-lg font-bold text-slate-400 mb-2">GT / Esports</h3>
                <p class="text-xs text-slate-500 leading-relaxed">
                  네온 시안/그린 악센트, 미니멀리스트 e스포츠 카본 카드.
                </p>
              </div>
            </div>

            {/* Footer Action */}
            <div class="flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  updateSettings("theme", "f1");
                  updateSettings("setupStep", 2);
                  updateSettings("isEditMode", true); // Auto-enable edit mode for step 2 preview
                }}
                class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 text-sm transition-all hover:scale-[1.02]"
              >
                <span>F1 테마로 진행 & 오버레이 배치 설정 (Step 2)</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* ================= STEP 2: 오버레이 미리보기 & Alt+J 크기/위치 조절 ================= */}
      <Show when={settings.setupStep === 2}>
        <div class="relative w-full h-full">
          {/* Top Instruction & Save Toolbar */}
          <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-slate-900/95 border border-red-500/50 rounded-xl shadow-2xl text-white">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-red-600 font-black text-xs">STEP 2/2</span>
              <span class="font-bold text-sm">오버레이 미리보기 및 배치 설정</span>
            </div>

            {/* Alt + J Shortcut Badge */}
            <button
              onClick={toggleEditMode}
              class={`px-3 py-1.5 rounded font-mono font-bold text-xs flex items-center gap-2 border transition-all ${
                settings.isEditMode
                  ? "bg-amber-500/30 text-amber-300 border-amber-400 animate-pulse"
                  : "bg-white/10 text-white/60 border-white/20"
              }`}
            >
              <span>{settings.isEditMode ? "🛠️ 편집 모드 켜짐" : "🔒 미리보기 모드"}</span>
              <span class="bg-black/50 px-1.5 py-0.5 rounded border border-white/20 text-white">Alt + J</span>
            </button>

            <div class="text-xs text-slate-300">
              {settings.isEditMode
                ? "위젯을 마우스로 드래그하여 이동하고, +/- 버튼으로 크기를 조절하세요."
                : "Alt + J 키를 눌러 위젯 이동/크기 조절을 활성화하세요."}
            </div>

            <div class="flex items-center gap-2 pl-3 border-l border-white/20">
              <button
                onClick={() => updateSettings("setupStep", 1)}
                class="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold"
              >
                ← 이전
              </button>

              <button
                onClick={saveSettingsAsDefault}
                class="px-5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <span>최종 저장 & 오버레이 시작</span>
                <span>✓</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview Overlay Area */}
          <div class="w-full h-full relative pointer-events-none">
            {/* Widget 1: Leaderboard (Preview Top-Left) */}
            <div
              onMouseDown={(e) => handleMouseDown("leaderboard", e)}
              style={{
                transform: `translate3d(${settings.widgets.leaderboard.x}px, ${settings.widgets.leaderboard.y}px, 0) scale(${settings.widgets.leaderboard.scale})`,
                "transform-origin": "top left",
              }}
              class={`fixed top-16 left-8 z-30 hud-panel p-3 w-80 select-none ${
                settings.isEditMode
                  ? "pointer-events-auto cursor-move ring-2 ring-amber-400 ring-offset-2 ring-offset-black/50"
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
                      class="px-1.5 bg-white/20 rounded text-xs font-bold"
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
                      class="px-1.5 bg-white/20 rounded text-xs font-bold"
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

            {/* Widget 2: Relative (Preview Bottom-Right) */}
            <div
              onMouseDown={(e) => handleMouseDown("relative", e)}
              style={{
                transform: `translate3d(${settings.widgets.relative.x}px, ${settings.widgets.relative.y}px, 0) scale(${settings.widgets.relative.scale})`,
                "transform-origin": "bottom right",
              }}
              class={`fixed bottom-8 right-8 z-30 hud-panel p-3 w-72 select-none ${
                settings.isEditMode
                  ? "pointer-events-auto cursor-move ring-2 ring-amber-400 ring-offset-2 ring-offset-black/50"
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
                      class="px-1.5 bg-white/20 rounded text-xs font-bold"
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
                      class="px-1.5 bg-white/20 rounded text-xs font-bold"
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

            {/* Widget 3: Telemetry Hub (Preview Bottom-Center) */}
            <div
              onMouseDown={(e) => handleMouseDown("telemetryHub", e)}
              style={{
                transform: `translate3d(${settings.widgets.telemetryHub.x}px, ${settings.widgets.telemetryHub.y}px, 0) scale(${settings.widgets.telemetryHub.scale})`,
                "transform-origin": "bottom center",
              }}
              class={`fixed bottom-8 left-1/2 -translate-x-1/2 z-30 hud-panel px-6 py-3 flex items-center gap-6 select-none ${
                settings.isEditMode
                  ? "pointer-events-auto cursor-move ring-2 ring-amber-400 ring-offset-2 ring-offset-black/50"
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
                    class="px-1.5 bg-white/20 rounded text-xs font-bold"
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
                    class="px-1.5 bg-white/20 rounded text-xs font-bold"
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

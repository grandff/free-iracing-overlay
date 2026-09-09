import { Component } from "solid-js";
import { WidgetKey, widgetBgAlpha, setWidgetBgAlpha } from "../../stores/settingsStore.ts";
import { t } from "../../i18n/index.ts";

/**
 * Background-transparency control for one widget, shown only in edit mode.
 *
 * Lives on the wrapper rather than inside each of the 15 widgets: the wrapper
 * already owns the widget key and sets --hud-bg-alpha, so one component covers
 * every widget instead of fifteen near-identical toolbar edits.
 *
 * Anchored bottom-LEFT on purpose — the resize handles sit on the right edge
 * and the widgets' own control bars sit along the top, so this is the one
 * corner that never collides.
 */
export const OpacityChip: Component<{ widgetKey: WidgetKey }> = (props) => {
  const pct = () => Math.round(widgetBgAlpha(props.widgetKey) * 100);

  return (
    <div
      class={`absolute bottom-1 ${
        props.widgetKey === "spotterRight" ? "right-0" : "left-1"
      } z-50 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/20 pointer-events-auto select-none`}
      onMouseDown={(e) => e.stopPropagation()}
      title={t().bgOpacityTitle}
    >
      <span class="text-[8px] font-bold tracking-wider text-white/50 uppercase">BG</span>
      <input
        type="range"
        min="15"
        max="100"
        step="5"
        value={pct()}
        onInput={(e) => setWidgetBgAlpha(props.widgetKey, e.currentTarget.valueAsNumber / 100)}
        class="w-16 h-1 accent-[#E10600] cursor-pointer"
      />
      <span class="text-[9px] font-mono tabular-nums text-white/70 w-7 text-right">{pct()}%</span>
    </div>
  );
};

import { Component, For, Show, createSignal, createMemo } from "solid-js";
import { createPresence } from "../../utils/presence.ts";
import { CountryFlag } from "../../assets/icons/CountryFlags.tsx";
import { t } from "../../i18n/index.ts";

export interface RelativeEntry {
  carNumber: string;
  code: string;
  name: string;
  country?: string;
  teamColor: string;
  tireCompound: "S" | "M" | "H" | "I" | "W";
  gapSeconds: number;
  isPlayer?: boolean;
}

interface Props {
  entries?: RelativeEntry[];
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
  maxVisible?: number;
}

const defaultEntries: RelativeEntry[] = [
  { carNumber: "16", code: "LEC", name: "C. Leclerc", country: "MC", teamColor: "#E8002D", tireCompound: "S", gapSeconds: -0.421 },
  { carNumber: "1", code: "YOU", name: "K. Jeongmin", country: "KR", teamColor: "#3671C6", tireCompound: "M", gapSeconds: 0.000, isPlayer: true },
  { carNumber: "44", code: "HAM", name: "L. Hamilton", country: "GB", teamColor: "#27F4D2", tireCompound: "H", gapSeconds: 1.025 },
  { carNumber: "4", code: "NOR", name: "L. Norris", country: "GB", teamColor: "#FF8000", tireCompound: "M", gapSeconds: 2.185 },
  { carNumber: "55", code: "SAI", name: "C. Sainz", country: "ES", teamColor: "#E8002D", tireCompound: "H", gapSeconds: 3.840 },
];

export const Relative: Component<Props> = (props) => {
  const list = () => props.entries || defaultEntries;
  const editPresence = createPresence(() => !props.isEditMode, 160);

  const tireBadge = (c: "S" | "M" | "H" | "I" | "W") => {
    switch (c) {
      case "S": return { border: "border-[#e10600]", text: "text-[#e10600]", bg: "bg-[#e10600]/15" };
      case "M": return { border: "border-[#ffd100]", text: "text-[#ffd100]", bg: "bg-[#ffd100]/15" };
      case "H": return { border: "border-white", text: "text-white", bg: "bg-white/15" };
      case "I": return { border: "border-[#39b54a]", text: "text-[#39b54a]", bg: "bg-[#39b54a]/15" };
      case "W": return { border: "border-[#0090ff]", text: "text-[#0090ff]", bg: "bg-[#0090ff]/15" };
    }
  };

  return (
    <div class="relative flex flex-col w-[300px] font-sans select-none shadow-2xl">
      {/* Sleek Floating Apple Scale Capsule (Only in Edit Mode) */}
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-0 right-0 z-40 flex items-center justify-between px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${
            editPresence.visible() ? "is-visible" : "is-hidden"
          }`}
        >
          <span class="text-[10px] font-medium text-white/70">{t().wRelative}</span>
          <div class="flex items-center gap-1.5">
            <button
              onClick={() => props.onScaleChange && props.onScaleChange(Math.max(0.7, (props.scale || 1) - 0.1))}
              class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              -
            </button>
            <span class="text-[10px] font-mono font-semibold w-8 text-center">{Math.round((props.scale || 1) * 100)}%</span>
            <button
              onClick={() => props.onScaleChange && props.onScaleChange(Math.min(1.5, (props.scale || 1) + 0.1))}
              class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </Show>

      {/* Header */}
      <div class="flex items-center justify-between bg-[#15151e] border-b-2 border-white/20 px-3 py-1.5 rounded-t-sm">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#ffd100]" />
          <span class="text-[11px] font-mono font-extrabold tracking-wider text-white">
            RELATIVE INTERVAL
          </span>
        </div>
        <span class="text-[9px] font-mono text-white/50">±5 CARS</span>
      </div>

      {/* Subheader */}
      <div class="grid grid-cols-[1fr_32px_74px] items-center px-2 py-0.5 bg-black/80 text-[9px] font-mono text-white/45 tracking-wider border-b border-white/[0.06]">
        <span class="pl-2">DRIVER</span>
        <span class="text-center">TYRE</span>
        <span class="text-right pr-1">GAP</span>
      </div>

      {/* Rows */}
      <div class="flex flex-col gap-[1px] bg-black/50">
        <For each={list()}>
          {(d) => {
            const badge = tireBadge(d.tireCompound);
            const isAhead = d.gapSeconds < 0;
            const formattedGap = d.isPlayer
              ? "0.000s"
              : `${isAhead ? "" : "+"}${d.gapSeconds.toFixed(3)}s`;

            return (
              <div
                class={`grid grid-cols-[1fr_32px_74px] items-center h-[28px] transition-colors duration-150 ${
                  d.isPlayer
                    ? "bg-[#1e2336] ring-1 ring-inset ring-[#00d26a]/60 shadow-[0_0_12px_rgba(0,210,106,0.15)]"
                    : "bg-[#13141c]/95 hover:bg-[#181a24]/95"
                }`}
              >
                {/* Team stripe, Flag, Driver */}
                <div class="flex items-center h-full pl-0 relative overflow-hidden">
                  <div
                    class="w-[3px] h-full mr-1.5 shrink-0"
                    style={{ "background-color": d.teamColor }}
                  />
                  <span class="text-[10px] font-mono text-white/40 w-5 shrink-0 text-center">
                    #{d.carNumber}
                  </span>
                  <CountryFlag
                    code={d.country || "US"}
                    class="w-4 h-2.5 rounded-[1.5px] border border-white/20 shadow-sm shrink-0 mr-1.5"
                  />
                  <span
                    class={`text-[12px] truncate tracking-tight ${
                      d.isPlayer ? "text-white font-bold" : isAhead ? "text-[#f5f5f7] font-medium" : "text-white/80"
                    }`}
                  >
                    {d.name}
                  </span>
                </div>

                {/* Tyre badge */}
                <div class="flex items-center justify-center">
                  <span
                    class={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono font-black ${badge.border} ${badge.text} ${badge.bg}`}
                  >
                    {d.tireCompound}
                  </span>
                </div>

                {/* Gap */}
                <div class="text-right pr-2">
                  <span
                    class={`font-mono text-xs font-bold tabular-nums tracking-wider ${
                      d.isPlayer
                        ? "text-[#00d26a]"
                        : isAhead
                        ? "text-[#ff9f0a]"
                        : "text-white/90"
                    }`}
                  >
                    {formattedGap}
                  </span>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

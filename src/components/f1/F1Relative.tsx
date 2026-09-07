import { Component, For, Show } from "solid-js";
import { createPresence } from "../../utils/presence.ts";

export interface RelativeEntry {
  carNumber: string;
  code: string;
  name: string;
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
}

const defaultEntries: RelativeEntry[] = [
  { carNumber: "16", code: "LEC", name: "C. Leclerc", teamColor: "#E8002D", tireCompound: "S", gapSeconds: -0.421 },
  { carNumber: "1", code: "VER", name: "M. Verstappen", teamColor: "#3671C6", tireCompound: "M", gapSeconds: 0.000, isPlayer: true },
  { carNumber: "44", code: "HAM", name: "L. Hamilton", teamColor: "#27F4D2", tireCompound: "H", gapSeconds: 1.025 },
  { carNumber: "4", code: "NOR", name: "L. Norris", teamColor: "#FF8000", tireCompound: "M", gapSeconds: 2.185 },
];

export const F1Relative: Component<Props> = (props) => {
  const list = () => props.entries || defaultEntries;
  const editPresence = createPresence(() => !!props.isEditMode, 160);

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
    <div class="relative flex flex-col w-[280px] font-f1 select-none">
      {/* Sleek Floating Apple Scale Capsule (Only in Edit Mode) */}
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-0 right-0 z-40 flex items-center justify-between px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${ editPresence.visible() ? "is-visible" : "is-hidden" }`}
        >
          <span class="text-[10px] font-medium text-white/70">렐러티브 크기</span>
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
          <span class="text-[11px] font-f1-wide font-extrabold tracking-wider text-white">
            RELATIVE INTERVAL
          </span>
        </div>
      </div>

      {/* Subheader */}
      <div class="grid grid-cols-[1fr_26px_68px] items-center px-2 py-0.5 bg-black/80 text-[9px] font-f1-wide text-white/45 tracking-wider border-b border-white/[0.06]">
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
                class={`grid grid-cols-[1fr_26px_68px] items-center h-[28px] transition-colors duration-150 ${ d.isPlayer ? "bg-[#1e2336] ring-1 ring-inset ring-[#00d26a]/60 shadow-[0_0_12px_rgba(0,210,106,0.15)]" : "bg-[#13141c]/95 hover:bg-[#181a24]/95" }`}
              >
                {/* Team stripe & Driver */}
                <div class="flex items-center h-full pl-0 relative overflow-hidden">
                  <div
                    class="w-[4px] h-full shrink-0"
                    style={{ "background-color": d.teamColor }}
                  />

                  <div class="flex items-center gap-1.5 pl-2">
                    <span class="text-[12px] font-f1-bold font-extrabold tracking-wider text-white uppercase">
                      {d.code}
                    </span>
                    <span class="text-[10px] font-f1-num text-white/40 font-medium">
                      #{d.carNumber}
                    </span>
                    <Show when={d.isPlayer}>
                      <span class="text-[8px] font-f1-wide font-black px-1 py-0.5 bg-[#00d26a]/20 text-[#00d26a] rounded border border-[#00d26a]/30">
                        YOU
                      </span>
                    </Show>
                  </div>
                </div>

                {/* Tire */}
                <div class="flex items-center justify-center">
                  <div
                    class={`w-[17px] h-[17px] rounded-full border ${badge.border} ${badge.bg} flex items-center justify-center`}
                  >
                    <span class={`text-[9px] font-f1 font-black ${badge.text}`}>
                      {d.tireCompound}
                    </span>
                  </div>
                </div>

                {/* Gap */}
                <div class="text-right pr-2 font-f1-num text-[11px] font-bold tracking-tight">
                  <span
                    class={
                      d.isPlayer
                        ? "text-[#00d26a] font-extrabold"
                        : isAhead
                        ? "text-[#ffd100]"
                        : "text-[#f7f8fb]"
                    }
                  >
                    {formattedGap}
                  </span>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      <div class="h-1 bg-[#15151e] rounded-b-sm border-t border-white/[0.06]" />
    </div>
  );
};

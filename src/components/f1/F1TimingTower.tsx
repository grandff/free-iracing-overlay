import { Component, For, Show } from "solid-js";
import { LogoF1 } from "../../assets/icons/Icons.tsx";

export interface TimingTowerDriver {
  position: number;
  carNumber: string;
  code: string;
  name: string;
  teamColor: string;
  teamName: string;
  tireCompound: "S" | "M" | "H" | "I" | "W";
  gap: string;
  isPlayer?: boolean;
  inPit?: boolean;
}

interface Props {
  drivers?: TimingTowerDriver[];
  lapCurrent?: number;
  lapTotal?: number;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

const defaultDrivers: TimingTowerDriver[] = [
  { position: 1, carNumber: "1", code: "VER", name: "M. Verstappen", teamColor: "#3671C6", teamName: "Red Bull", tireCompound: "M", gap: "LEADER", isPlayer: true },
  { position: 2, carNumber: "16", code: "LEC", name: "C. Leclerc", teamColor: "#E8002D", teamName: "Ferrari", tireCompound: "S", gap: "+0.421" },
  { position: 3, carNumber: "4", code: "NOR", name: "L. Norris", teamColor: "#FF8000", teamName: "McLaren", tireCompound: "M", gap: "+1.185" },
  { position: 4, carNumber: "44", code: "HAM", name: "L. Hamilton", teamColor: "#27F4D2", teamName: "Mercedes", tireCompound: "H", gap: "+2.340" },
  { position: 5, carNumber: "55", code: "SAI", name: "C. Sainz", teamColor: "#E8002D", teamName: "Ferrari", tireCompound: "S", gap: "+3.912" },
  { position: 6, carNumber: "81", code: "PIA", name: "O. Piastri", teamColor: "#FF8000", teamName: "McLaren", tireCompound: "M", gap: "+4.480" },
  { position: 7, carNumber: "63", code: "RUS", name: "G. Russell", teamColor: "#27F4D2", teamName: "Mercedes", tireCompound: "H", gap: "+5.120" },
  { position: 8, carNumber: "14", code: "ALO", name: "F. Alonso", teamColor: "#229971", teamName: "Aston Martin", tireCompound: "H", gap: "+8.940" },
];

export const F1TimingTower: Component<Props> = (props) => {
  const driverList = () => props.drivers || defaultDrivers;
  const currentLap = () => props.lapCurrent || 24;
  const totalLaps = () => props.lapTotal || 57;

  const tireColor = (c: "S" | "M" | "H" | "I" | "W") => {
    switch (c) {
      case "S": return { border: "border-[#e10600]", text: "text-[#e10600]", bg: "bg-[#e10600]/15" };
      case "M": return { border: "border-[#ffd100]", text: "text-[#ffd100]", bg: "bg-[#ffd100]/15" };
      case "H": return { border: "border-white", text: "text-white", bg: "bg-white/15" };
      case "I": return { border: "border-[#39b54a]", text: "text-[#39b54a]", bg: "bg-[#39b54a]/15" };
      case "W": return { border: "border-[#0090ff]", text: "text-[#0090ff]", bg: "bg-[#0090ff]/15" };
    }
  };

  return (
    <div class="flex flex-col w-[295px] font-f1 select-none drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)]">
      {/* 1. Official F1 Timing Header */}
      <div class="flex items-center justify-between bg-[#15151e] border-b-2 border-[#e10600] px-3 py-1.5 rounded-t-sm shadow-sm">
        <div class="flex items-center gap-2">
          <LogoF1 class="h-3.5 w-auto" />
          <span class="text-[11px] font-f1-wide font-extrabold tracking-wider text-white">
            LAP {currentLap()}/{totalLaps()}
          </span>
        </div>

        <Show
          when={props.isEditMode}
          fallback={
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-[#00d26a] animate-pulse" />
              <span class="text-[9px] font-f1-wide tracking-widest text-white/70">LIVE</span>
            </div>
          }
        >
          <div class="flex items-center gap-1">
            <button
              onClick={() => props.onScaleChange && props.onScaleChange(Math.max(0.7, (props.scale || 1) - 0.1))}
              class="px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded text-[10px] font-bold text-white cursor-pointer"
            >
              -
            </button>
            <span class="text-[9px] font-mono text-white/80">{Math.round((props.scale || 1) * 100)}%</span>
            <button
              onClick={() => props.onScaleChange && props.onScaleChange(Math.min(1.5, (props.scale || 1) + 0.1))}
              class="px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded text-[10px] font-bold text-white cursor-pointer"
            >
              +
            </button>
          </div>
        </Show>
      </div>

      {/* 2. Column Subheader */}
      <div class="grid grid-cols-[28px_1fr_26px_68px] items-center px-2 py-0.5 bg-black/75 text-[9px] font-f1-wide text-white/45 tracking-wider border-b border-white/[0.06]">
        <span class="text-center">POS</span>
        <span class="pl-2">DRIVER</span>
        <span class="text-center">TYRE</span>
        <span class="text-right pr-1">GAP</span>
      </div>

      {/* 3. Driver Rows */}
      <div class="flex flex-col gap-[1px] bg-black/40">
        <For each={driverList()}>
          {(d) => {
            const tire = tireColor(d.tireCompound);
            return (
              <div
                class={`grid grid-cols-[28px_1fr_26px_68px] items-center h-[28px] transition-colors duration-150 ${
                  d.isPlayer
                    ? "bg-[#1f2334] ring-1 ring-inset ring-white/35"
                    : "bg-[#14141c]/95 hover:bg-[#1a1a26]/95"
                }`}
              >
                {/* Position */}
                <div class="flex items-center justify-center h-full bg-black/40 text-[11px] font-f1-num font-bold text-white">
                  {d.position}
                </div>

                {/* Team Stripe & Driver Info */}
                <div class="flex items-center h-full pl-0 relative overflow-hidden">
                  <div
                    class="w-[3.5px] h-full shrink-0"
                    style={{ "background-color": d.teamColor }}
                  />

                  <div class="flex items-center gap-1.5 pl-2">
                    <span class="text-xs font-f1-bold font-bold tracking-wider text-white uppercase">
                      {d.code}
                    </span>
                    <span class="text-[10px] font-f1-num text-white/40 font-medium">
                      #{d.carNumber}
                    </span>
                    <Show when={d.isPlayer}>
                      <span class="text-[8px] font-f1-wide font-extrabold px-1 py-0.2 bg-[#00d26a]/20 text-[#00d26a] rounded border border-[#00d26a]/30">
                        YOU
                      </span>
                    </Show>
                  </div>
                </div>

                {/* Tire Badge */}
                <div class="flex items-center justify-center">
                  <div
                    class={`w-[17px] h-[17px] rounded-full border ${tire.border} ${tire.bg} flex items-center justify-center`}
                  >
                    <span class={`text-[9px] font-f1 font-extrabold ${tire.text}`}>
                      {d.tireCompound}
                    </span>
                  </div>
                </div>

                {/* Gap */}
                <div class="text-right pr-2 font-f1-num text-[11px] font-semibold tracking-tight">
                  <span
                    class={
                      d.gap === "LEADER"
                        ? "text-white/40 text-[9px] font-f1-wide"
                        : "text-[#f7f8fb]"
                    }
                  >
                    {d.gap}
                  </span>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* 4. Footer */}
      <div class="h-1 bg-[#15151e] rounded-b-sm border-t border-white/[0.06]" />
    </div>
  );
};

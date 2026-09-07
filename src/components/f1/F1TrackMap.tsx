import { Component, For, Show } from "solid-js";
import { createPresence } from "../../utils/presence.ts";

interface CarMapPoint {
  carIdx: number;
  carNumber: string;
  lapDistPct: number; // 0.0 ~ 1.0
  color: string;
  isPlayer?: boolean;
}

interface Props {
  cars?: CarMapPoint[];
  trackName?: string;
  isEditMode?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

const defaultCars: CarMapPoint[] = [
  { carIdx: 1, carNumber: "1", lapDistPct: 0.42, color: "#00d2ff", isPlayer: true },
  { carIdx: 2, carNumber: "16", lapDistPct: 0.40, color: "#E8002D" },
  { carIdx: 3, carNumber: "4", lapDistPct: 0.36, color: "#FF8000" },
  { carIdx: 4, carNumber: "44", lapDistPct: 0.28, color: "#27F4D2" },
  { carIdx: 5, carNumber: "55", lapDistPct: 0.72, color: "#E8002D" },
  { carIdx: 6, carNumber: "81", lapDistPct: 0.85, color: "#FF8000" },
];

export const F1TrackMap: Component<Props> = (props) => {
  const cars = () => props.cars || defaultCars;
  const trackName = () => props.trackName || "CIRCUIT DE MONACO";
  const editPresence = createPresence(() => !!props.isEditMode, 160);

  // SVG path for GP Circuit layout
  const circuitPath = "M 40 160 C 40 100, 70 40, 140 40 C 200 40, 230 70, 260 90 C 280 100, 310 80, 320 120 C 330 160, 280 200, 240 220 C 200 240, 160 210, 120 220 C 80 230, 40 220, 40 160 Z";

  // Approximate coordinate mapping along loop
  const getCoordinates = (pct: number) => {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    const cx = 140;
    const cy = 110;
    const rx = 100;
    const ry = 65;
    const x = cx + rx * Math.cos(angle) + 12 * Math.sin(2 * angle);
    const y = cy + ry * Math.sin(angle) - 8 * Math.cos(2 * angle);
    return { x, y };
  };

  return (
    <div class="relative flex flex-col w-[260px] font-f1 select-none">
      {/* Floating Scale Pill */}
      <Show when={editPresence.mounted()}>
        <div
          class={`absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 px-3 py-1 bg-[#1c1c24]/95 border border-white/20 rounded-full shadow-lg text-white pointer-events-auto apple-pill-enter ${ editPresence.visible() ? "is-visible" : "is-hidden" }`}
        >
          <span class="text-[10px] font-medium text-white/70 whitespace-nowrap">트랙 맵 크기</span>
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

      {/* Main Track Map Container */}
      <div class="bg-[#12131a]/95 border border-white/15 rounded-lg overflow-hidden shadow-2xl">
        <div class="flex items-center justify-between bg-[#1a1b24] border-b border-white/10 px-3 py-1.5">
          <span class="text-[10px] font-f1-wide font-extrabold tracking-wider text-white">
            2D TRACK MAP
          </span>
          <span class="text-[9px] font-mono text-white/50 tracking-wide truncate max-w-[130px]">
            {trackName()}
          </span>
        </div>

        {/* 2D Vector Canvas */}
        <div class="relative w-full h-[150px] p-2 flex items-center justify-center">
          <svg viewBox="0 0 280 220" class="w-full h-full overflow-visible">
            {/* Circuit Outline */}
            <path
              d={circuitPath}
              fill="none"
              stroke="#2c2d38"
              stroke-width="10"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d={circuitPath}
              fill="none"
              stroke="#505264"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            {/* Start / Finish line */}
            <line x1="40" y1="150" x2="40" y2="170" stroke="#ffffff" stroke-width="2.5" />

            {/* Cars on Track */}
            <For each={cars()}>
              {(c) => {
                const pos = getCoordinates(c.lapDistPct);
                return (
                  <g transform={`translate(${pos.x}, ${pos.y})`}>
                    <Show
                      when={c.isPlayer}
                      fallback={
                        <circle
                          r="4"
                          fill={c.color}
                          stroke="#ffffff"
                          stroke-width="1"
                          class=""
                        />
                      }
                    >
                      {/* Player Marker (Neon Cyan Arrow + Ping) */}
                      <circle r="7" fill="none" stroke="#00d2ff" stroke-width="1.5" class=" opacity-75" />
                      <circle r="5" fill="#00d2ff" stroke="#ffffff" stroke-width="1.5" />
                      <text
                        y="-8"
                        text-anchor="middle"
                        fill="#00d2ff"
                        font-size="8"
                        font-weight="bold"
                        font-family="monospace"
                      >
                        #{c.carNumber}
                      </text>
                    </Show>
                  </g>
                );
              }}
            </For>
          </svg>
        </div>
      </div>
    </div>
  );
};
import { Component, For, Show, createEffect, createSignal, onCleanup } from "solid-js";
import { CarBrandIcon } from "../../assets/icons/CarBrandIcons.tsx";
import { t } from "../../i18n/index.ts";
import type {
  RadioTelemetry,
  SystemEventKind,
  SystemMessageTelemetry,
} from "../../services/telemetry/types.ts";
import { settings } from "../../stores/settingsStore.ts";

export interface TeamRadioProps {
  radio?: RadioTelemetry;
  systemMessage?: SystemMessageTelemetry;
  isEditMode: boolean;
  scale?: number;
  width?: number;
  onScaleChange?: (scale: number) => void;
  onWidthChange?: (width: number) => void;
}

const WAVEFORM = [10, 19, 14, 25, 17, 22, 13, 29, 20, 34, 18, 24, 16, 27, 21, 14, 23, 11];

function getTeamAccentColor(brand = ""): string {
  const value = brand.toLowerCase();
  if (value.includes("red bull") || value.includes("redbull")) return "#3671c6";
  if (value.includes("ferrari")) return "#e80020";
  if (value.includes("mercedes") || value.includes("amg")) return "#00d2be";
  if (value.includes("mclaren")) return "#ff8700";
  if (value.includes("aston")) return "#229971";
  if (value.includes("alpine")) return "#0090ff";
  if (value.includes("williams")) return "#005aff";
  if (value.includes("haas")) return "#e0e0e0";
  if (value.includes("audi") || value.includes("sauber")) return "#52e252";
  if (value.includes("porsche")) return "#e10600";
  if (value.includes("bmw")) return "#1c69d4";
  if (value.includes("lamborghini")) return "#e0b020";
  if (value.includes("nissan")) return "#c00000";
  return "#00e5ff";
}

function getDriverLastName(fullName = ""): string {
  const lastName = fullName.trim().split(/\s+/).at(-1) || "DRIVER";
  return lastName.replace(/[^\p{L}\p{N}]/gu, "").toUpperCase() || "DRIVER";
}

function translateSystemMessage(event: SystemEventKind, fallback: string): string {
  if (!settings.translateSystemMessages) return fallback;
  switch (event) {
    case "yellowFlag": return t().sysYellowFlag;
    case "blueFlag": return t().sysBlueFlag;
    case "meatballFlag": return t().sysMeatballFlag;
    case "blackFlag": return t().sysBlackFlag;
    case "disqualified": return t().sysDisqualified;
    case "checkeredFlag": return t().sysCheckeredFlag;
    case "pitEntry": return t().sysPitEntry;
    case "pitExit": return t().sysPitExit;
    case "pitComplete": return t().sysPitComplete;
    case "hazardAhead": return t().sysHazardAhead;
    default: return fallback;
  }
}

function getSystemSource(event: SystemEventKind): string {
  if (event === "pitEntry" || event === "pitExit" || event === "pitComplete") return "PIT WALL";
  if (event === "blackFlag" || event === "meatballFlag" || event === "disqualified") return "STEWARDS";
  if (event === "hazardAhead") return "SPOTTER";
  return "RACE CONTROL";
}

interface RadioCardData {
  driverName: string;
  carNumber: string;
  brand: string;
  accent: string;
  source: string;
  message: string;
  distanceMeters?: number;
}

export const TeamRadio: Component<TeamRadioProps> = (props) => {
  const [preview, setPreview] = createSignal<0 | 1 | 2>(0);
  const [card, setCard] = createSignal<RadioCardData>();
  const [isVisible, setIsVisible] = createSignal(false);
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let clearTimer: ReturnType<typeof setTimeout> | undefined;
  let lastCardKey = "";

  const profileCard = (source: string, message: string, distanceMeters?: number): RadioCardData => {
    const brand = settings.userProfile?.carBrand || "Porsche";
    return {
      driverName: settings.userProfile?.driverName || "K. Jeongmin",
      carNumber: settings.userProfile?.carNumber || "7",
      brand,
      accent: getTeamAccentColor(brand),
      source,
      message,
      distanceMeters,
    };
  };

  const showCard = (next: RadioCardData) => {
    if (hideTimer) clearTimeout(hideTimer);
    if (clearTimer) clearTimeout(clearTimer);
    hideTimer = undefined;
    clearTimer = undefined;

    // ponytail: telemetry arrives at 60Hz; redraw only when the displayed message changes.
    const key = `${next.driverName}|${next.carNumber}|${next.brand}|${next.source}|${next.message}|${next.distanceMeters ?? ""}`;
    if (key !== lastCardKey) {
      lastCardKey = key;
      setCard(next);
    }
    setIsVisible(true);
  };

  createEffect(() => {
    if (props.isEditMode) {
      const samples = [
        profileCard("RACE CONTROL", "YELLOW FLAG - SECTOR 2 CAUTION", 240),
        profileCard("PIT WALL", "PIT LANE ENTRY - 60 KM/H LIMIT"),
        profileCard("STEWARDS", "BLACK FLAG - PENALTY"),
      ] as const;
      showCard(samples[preview()]);
      return;
    }

    const systemMessage = props.systemMessage;
    if (systemMessage?.activeEvent && systemMessage.activeEvent !== "none") {
      showCard(profileCard(
        getSystemSource(systemMessage.activeEvent),
        translateSystemMessage(systemMessage.activeEvent, systemMessage.rawText || "RACE ALERT"),
        systemMessage.distanceMeters,
      ));
      return;
    }

    const radio = props.radio;
    if (radio?.isTransmitting) {
      const brand = radio.carBrand || settings.userProfile?.carBrand || "Porsche";
      showCard({
        driverName: radio.driverName || settings.userProfile?.driverName || "DRIVER",
        carNumber: radio.carNumber || settings.userProfile?.carNumber || "",
        brand,
        accent: getTeamAccentColor(brand),
        source: radio.channelName || "TEAM RADIO",
        message: radio.messageText?.trim() || `${radio.channelName || "TEAM"} CHANNEL ACTIVE`,
      });
      return;
    }

    if (isVisible() && !hideTimer) {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        hideTimer = undefined;
        clearTimer = setTimeout(() => {
          setCard(undefined);
          lastCardKey = "";
          clearTimer = undefined;
        }, 220);
      }, 2200);
    }
  });

  onCleanup(() => {
    if (hideTimer) clearTimeout(hideTimer);
    if (clearTimer) clearTimeout(clearTimer);
  });

  return (
    <div
      class={`gpu-layer flex flex-col select-none transition-[opacity,transform] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-opacity ${
        isVisible() ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-1 scale-[0.985] opacity-0"
      }`}
      style={{ width: `${Math.max(300, Math.min(480, props.width ?? 340))}px` }}
    >
      <Show when={props.isEditMode}>
        <div
          class="flex items-center justify-between rounded-t border border-b-0 border-white/15 hud-surface-deep px-2.5 py-1 text-white"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setPreview((value) => ((value + 1) % 3) as 0 | 1 | 2)}
            class="cursor-pointer rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white/80 transition-colors hover:bg-white/10 active:scale-[0.98]"
          >
            {t().testRadioBtn}: {preview() === 0 ? "CONTROL" : preview() === 1 ? "PIT" : "PENALTY"}
          </button>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => props.onScaleChange?.(Math.max(0.7, (props.scale || 1) - 0.1))}
              class="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-white/15 bg-white/5 text-xs font-bold transition-colors hover:bg-white/10 active:scale-[0.96]"
              title="축소"
            >
              -
            </button>
            <span class="w-9 text-center text-[10px] font-semibold tabular-nums text-white/80">
              {Math.round((props.scale || 1) * 100)}%
            </span>
            <button
              type="button"
              onClick={() => props.onScaleChange?.(Math.min(1.5, (props.scale || 1) + 0.1))}
              class="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-white/15 bg-white/5 text-xs font-bold transition-colors hover:bg-white/10 active:scale-[0.96]"
              title="확대"
            >
              +
            </button>
          </div>
        </div>
      </Show>

      <Show when={card()}>
        {(info) => (
          <section
            class={`relative overflow-hidden border border-white/10 hud-surface text-white shadow-[0_14px_34px_rgba(0,0,0,0.58)] ${
              props.isEditMode ? "rounded-b" : "rounded-[6px]"
            }`}
            aria-label={`${getDriverLastName(info().driverName)} radio message`}
          >
            <div class="h-[3px] w-full" style={{ background: info().accent }} />

            <div class="flex items-center px-4 pb-2 pt-3">
              <div class="flex min-w-0 items-center gap-2">
                <span
                  class="truncate text-[20px] font-bold italic leading-none tracking-[-0.035em]"
                  style={{ color: info().accent }}
                >
                  {getDriverLastName(info().driverName)}
                </span>
                <CarBrandIcon brand={info().brand} class="h-7 w-7 shrink-0 object-contain" />
                <span class="font-f1-wide text-[19px] font-bold leading-none text-white">RADIO</span>
              </div>
            </div>

            <div class="flex h-10 items-end gap-[3px] overflow-hidden px-4" aria-hidden="true">
              <For each={WAVEFORM}>
                {(height, index) => (
                  <span
                    class="w-full min-w-[3px] rounded-t-[1px] opacity-80 animate-pulse motion-reduce:animate-none"
                    style={{
                      height: `${height}px`,
                      background: info().accent,
                      "animation-delay": `${index() * 70}ms`,
                      "animation-duration": "1.35s",
                    }}
                  />
                )}
              </For>
            </div>
            <div class="mx-4 h-[2px]" style={{ background: info().accent }} />

            <div class="px-4 pb-4 pt-3">
              <div class="mb-1.5 flex items-center justify-between gap-3 text-[9px] font-bold tracking-[0.14em] text-white/45">
                <span>{info().source}</span>
                <span class="flex items-center gap-2 tabular-nums">
                  <Show when={info().distanceMeters}>
                    <span>{info().distanceMeters} M AHEAD</span>
                  </Show>
                  <span>#{info().carNumber}</span>
                </span>
              </div>
              <p
                class="break-words text-[17px] font-medium leading-[1.28] tracking-[-0.018em]"
                style={{ color: info().accent }}
                role="status"
                aria-live="polite"
              >
                “{info().message}”
              </p>
            </div>
          </section>
        )}
      </Show>
    </div>
  );
};

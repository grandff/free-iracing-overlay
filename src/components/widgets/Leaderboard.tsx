/**
 * M2.1: 순위표 (Leaderboard / Standings)
 *
 * ⚠️ iRacing 텔레메트리 연동 기준 (AGENTS.md §3.0 준수):
 * 1. 실시간 텔레메트리 (60Hz 공유 메모리):
 *    - CarIdxPosition[carIdx] -> overallPosition (순위)
 *    - CarIdxClassPosition[carIdx] -> classPosition (클래스별 순위)
 *    - CarIdxClass[carIdx] -> carClass (차량 클래스)
 *    - CarIdxLap[carIdx] -> lap (현재 주행 랩)
 *    - CarIdxLapDistPct[carIdx] -> lapDistPct (0.0~1.0 트랙 진행률)
 *    - CarIdxBestLapTime[carIdx] -> bestLapTime (초 단위 float)
 *    - CarIdxLastLapTime[carIdx] -> lastLapTime (초 단위 float)
 *    - CarIdxTrackSurface[carIdx] -> trackSurface (0=OffTrack, 1=InPitLane, 2=PitStall, 3=OnTrack)
 *    - CarIdxOnPitRoad[carIdx] -> inPit (bool, 피트 진입 여부)
 * 2. 세션 YAML (irsdk_getSessionInfoStr -> DriverInfo.Drivers[carIdx]):
 *    - UserName -> driverName (드라이버 성명)
 *    - CarNumber -> carNumber (차량 번호)
 *    - ClubName / CountryCode -> country (ISO 2자리/iRacing 클럽)
 *    - CarScreenName / CarPath -> carBrand (차량 제조사 브랜드)
 *    - IRating -> irating (iRating 정수)
 *    - LicString / LicSubLevel -> safetyRating (라이선스 등급 및 SR 수치)
 */
import { Component, For, Show, createSignal, createMemo, onCleanup } from "solid-js";
import { CarTelemetry, LicenseClass, SessionType } from "../../services/telemetry/types.ts";
import { t } from "../../i18n/index.ts";
import { CarBrandIcon } from "../../assets/icons/CarBrandIcons.tsx";
import { CountryFlag } from "../../assets/icons/CountryFlags.tsx";
import { IconPit, IconStopwatch, LogoF1, LogoWEC, LogoWRC, LogoIndyCar, LogoIMSA } from "../../assets/icons/Icons.tsx";
import { settings, ThemeType } from "../../stores/settingsStore.ts";
import { createReorderFlip } from "../../utils/reorderFlip.ts";

export interface LeaderboardProps {
  cars?: CarTelemetry[];
  lapCurrent?: number;
  lapTotal?: number;
  sessionType?: SessionType; // from telemetry (Sessions[SessionNum].SessionType)
  sessionTimeRemain?: number; // seconds
  playerCarIdx?: number;
  isEditMode?: boolean;
  scale?: number;
  width?: number; // custom width in px
  maxRows?: number; // number of displayed rows
  showThemeLogo?: boolean;
  theme?: ThemeType;
  onScaleChange?: (newScale: number) => void;
  onWidthChange?: (newWidth: number) => void;
  onMaxRowsChange?: (newRows: number) => void;
}

// Fallback cars for preview or pre-connection states (25 authentic cars)
const defaultCars: CarTelemetry[] = [
  { carIdx: 1, carNumber: "7", driverName: "K. Jeongmin", country: "KR", carBrand: "Porsche", irating: 6840, safetyRating: { license: "S", value: 4.98 }, classPosition: 1, overallPosition: 1, positionDelta: 2, lap: 24, lapDistPct: 0.15, lastLapTime: 84.12, bestLapTime: 83.89, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 245, gapToPlayerSeconds: 0, trackSurface: 3 },
  { carIdx: 2, carNumber: "1", driverName: "M. Verstappen", country: "NL", carBrand: "Red Bull", irating: 7850, safetyRating: { license: "P", value: 4.99 }, classPosition: 2, overallPosition: 2, positionDelta: -1, lap: 24, lapDistPct: 0.145, lastLapTime: 84.34, bestLapTime: 84.05, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 242, gapToPlayerSeconds: -0.42, trackSurface: 3 },
  { carIdx: 3, carNumber: "6", driverName: "K. Estre", country: "FR", carBrand: "Porsche", irating: 7120, safetyRating: { license: "A", value: 4.88 }, classPosition: 3, overallPosition: 3, positionDelta: 0, lap: 24, lapDistPct: 0.138, lastLapTime: 84.62, bestLapTime: 84.11, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 240, gapToPlayerSeconds: -1.02, trackSurface: 3 },
  { carIdx: 4, carNumber: "51", driverName: "A. Pier Guidi", country: "IT", carBrand: "Ferrari", irating: 6920, safetyRating: { license: "A", value: 3.95 }, classPosition: 4, overallPosition: 4, positionDelta: 1, lap: 24, lapDistPct: 0.165, lastLapTime: 84.25, bestLapTime: 84.15, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 248, gapToPlayerSeconds: +1.28, trackSurface: 3 },
  { carIdx: 5, carNumber: "24", driverName: "J. Gordon", country: "US", carBrand: "Corvette", irating: 6350, safetyRating: { license: "B", value: 3.82 }, classPosition: 5, overallPosition: 5, positionDelta: -2, lap: 24, lapDistPct: 0.115, lastLapTime: 87.80, bestLapTime: 87.35, inPit: true, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 65, gapToPlayerSeconds: -2.95, trackSurface: 1 },
  { carIdx: 6, carNumber: "01", driverName: "S. Bourdais", country: "FR", carBrand: "Cadillac", irating: 6420, safetyRating: { license: "A", value: 4.10 }, classPosition: 6, overallPosition: 6, positionDelta: 0, lap: 24, lapDistPct: 0.11, lastLapTime: 85.10, bestLapTime: 84.45, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 241, gapToPlayerSeconds: -3.20, trackSurface: 3 },
  { carIdx: 7, carNumber: "10", driverName: "R. Taylor", country: "US", carBrand: "Acura", irating: 6280, safetyRating: { license: "A", value: 3.75 }, classPosition: 7, overallPosition: 7, positionDelta: 1, lap: 24, lapDistPct: 0.105, lastLapTime: 85.35, bestLapTime: 84.60, inPit: false, carClass: "Hypercar", carClassColor: "#E10600", speedKmh: 239, gapToPlayerSeconds: -3.85, trackSurface: 3 },
  { carIdx: 8, carNumber: "911", driverName: "L. Vanthoor", country: "BE", carBrand: "Porsche", irating: 6890, safetyRating: { license: "B", value: 3.45 }, classPosition: 1, overallPosition: 8, positionDelta: 1, lap: 23, lapDistPct: 0.12, lastLapTime: 94.55, bestLapTime: 94.20, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 235, gapToPlayerSeconds: -4.55, trackSurface: 3 },
  { carIdx: 9, carNumber: "63", driverName: "M. Bortolotti", country: "IT", carBrand: "Lamborghini", irating: 6480, safetyRating: { license: "C", value: 3.75 }, classPosition: 2, overallPosition: 9, positionDelta: 0, lap: 23, lapDistPct: 0.10, lastLapTime: 94.85, bestLapTime: 94.30, inPit: true, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 0, gapToPlayerSeconds: -5.10, trackSurface: 2 },
  { carIdx: 10, carNumber: "23", driverName: "T. Matsuda", country: "JP", carBrand: "Nissan", irating: 5950, safetyRating: { license: "D", value: 2.65 }, classPosition: 3, overallPosition: 10, positionDelta: 1, lap: 23, lapDistPct: 0.09, lastLapTime: 95.10, bestLapTime: 94.50, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 233, gapToPlayerSeconds: -5.80, trackSurface: 3 },
  { carIdx: 11, carNumber: "3", driverName: "A. Garcia", country: "ES", carBrand: "Corvette", irating: 6120, safetyRating: { license: "C", value: 2.85 }, classPosition: 4, overallPosition: 11, positionDelta: -1, lap: 23, lapDistPct: 0.08, lastLapTime: 95.15, bestLapTime: 94.60, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 233, gapToPlayerSeconds: -6.40, trackSurface: 3 },
  { carIdx: 12, carNumber: "77", driverName: "M. Goetz", country: "DE", carBrand: "Mercedes", irating: 6210, safetyRating: { license: "D", value: 3.20 }, classPosition: 5, overallPosition: 12, positionDelta: 0, lap: 23, lapDistPct: 0.07, lastLapTime: 95.25, bestLapTime: 94.75, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 234, gapToPlayerSeconds: -7.00, trackSurface: 3 },
  { carIdx: 13, carNumber: "44", driverName: "L. Hamilton", country: "GB", carBrand: "Mercedes", irating: 7120, safetyRating: { license: "Rookie", value: 2.90 }, classPosition: 6, overallPosition: 13, positionDelta: -2, lap: 23, lapDistPct: 0.065, lastLapTime: 95.40, bestLapTime: 94.90, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 231, gapToPlayerSeconds: -7.60, trackSurface: 3 },
  { carIdx: 14, carNumber: "888", driverName: "R. Marciello", country: "CH", carBrand: "Audi", irating: 6720, safetyRating: { license: "Rookie", value: 2.45 }, classPosition: 7, overallPosition: 14, positionDelta: 0, lap: 23, lapDistPct: 0.06, lastLapTime: 95.60, bestLapTime: 95.05, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 229, gapToPlayerSeconds: -8.10, trackSurface: 3 },
  { carIdx: 15, carNumber: "16", driverName: "C. Leclerc", country: "MC", carBrand: "Ferrari", irating: 7420, safetyRating: { license: "P", value: 4.80 }, classPosition: 8, overallPosition: 15, positionDelta: 2, lap: 23, lapDistPct: 0.055, lastLapTime: 95.30, bestLapTime: 94.40, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 236, gapToPlayerSeconds: -8.60, trackSurface: 3 },
  { carIdx: 16, carNumber: "14", driverName: "F. Alonso", country: "ES", carBrand: "Aston Martin", irating: 7250, safetyRating: { license: "S", value: 4.60 }, classPosition: 9, overallPosition: 16, positionDelta: 1, lap: 23, lapDistPct: 0.05, lastLapTime: 95.45, bestLapTime: 94.70, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 234, gapToPlayerSeconds: -9.10, trackSurface: 3 },
  { carIdx: 17, carNumber: "4", driverName: "L. Norris", country: "GB", carBrand: "McLaren", irating: 7310, safetyRating: { license: "A", value: 4.50 }, classPosition: 10, overallPosition: 17, positionDelta: 0, lap: 23, lapDistPct: 0.045, lastLapTime: 95.50, bestLapTime: 94.80, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 235, gapToPlayerSeconds: -9.70, trackSurface: 3 },
  { carIdx: 18, carNumber: "11", driverName: "M. Wittmann", country: "DE", carBrand: "BMW", irating: 6150, safetyRating: { license: "B", value: 3.60 }, classPosition: 11, overallPosition: 18, positionDelta: -1, lap: 23, lapDistPct: 0.04, lastLapTime: 95.80, bestLapTime: 95.10, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 232, gapToPlayerSeconds: -10.30, trackSurface: 3 },
  { carIdx: 19, carNumber: "55", driverName: "C. Sainz", country: "ES", carBrand: "Ferrari", irating: 6980, safetyRating: { license: "A", value: 4.15 }, classPosition: 12, overallPosition: 19, positionDelta: 0, lap: 23, lapDistPct: 0.035, lastLapTime: 95.90, bestLapTime: 95.20, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 233, gapToPlayerSeconds: -10.90, trackSurface: 3 },
  { carIdx: 20, carNumber: "81", driverName: "O. Piastri", country: "AU", carBrand: "McLaren", irating: 6820, safetyRating: { license: "B", value: 3.90 }, classPosition: 13, overallPosition: 20, positionDelta: 2, lap: 23, lapDistPct: 0.03, lastLapTime: 96.00, bestLapTime: 95.30, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 234, gapToPlayerSeconds: -11.50, trackSurface: 3 },
  { carIdx: 21, carNumber: "70", driverName: "K. Kobayashi", country: "JP", carBrand: "Toyota", irating: 6650, safetyRating: { license: "A", value: 4.40 }, classPosition: 14, overallPosition: 21, positionDelta: -1, lap: 23, lapDistPct: 0.025, lastLapTime: 96.10, bestLapTime: 95.40, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 231, gapToPlayerSeconds: -12.10, trackSurface: 3 },
  { carIdx: 22, carNumber: "97", driverName: "S. van Gisbergen", country: "NZ", carBrand: "Ford", irating: 6540, safetyRating: { license: "A", value: 3.85 }, classPosition: 15, overallPosition: 22, positionDelta: 1, lap: 23, lapDistPct: 0.02, lastLapTime: 96.25, bestLapTime: 95.50, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 232, gapToPlayerSeconds: -12.80, trackSurface: 3 },
  { carIdx: 23, carNumber: "5", driverName: "D. Cameron", country: "US", carBrand: "Porsche", irating: 6380, safetyRating: { license: "B", value: 3.55 }, classPosition: 16, overallPosition: 23, positionDelta: 0, lap: 23, lapDistPct: 0.015, lastLapTime: 96.40, bestLapTime: 95.60, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 230, gapToPlayerSeconds: -13.50, trackSurface: 3 },
  { carIdx: 24, carNumber: "56", driverName: "H. Tincknell", country: "GB", carBrand: "Ford", irating: 6020, safetyRating: { license: "C", value: 3.10 }, classPosition: 17, overallPosition: 24, positionDelta: -2, lap: 23, lapDistPct: 0.01, lastLapTime: 96.70, bestLapTime: 95.80, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 228, gapToPlayerSeconds: -14.20, trackSurface: 3 },
  { carIdx: 25, carNumber: "98", driverName: "N. Yelloly", country: "GB", carBrand: "BMW", irating: 5890, safetyRating: { license: "D", value: 2.80 }, classPosition: 18, overallPosition: 25, positionDelta: 0, lap: 23, lapDistPct: 0.005, lastLapTime: 96.90, bestLapTime: 96.00, inPit: false, carClass: "GT3", carClassColor: "#00CC88", speedKmh: 227, gapToPlayerSeconds: -15.00, trackSurface: 3 },
];

// iRacing Safety Rating License Tier Colors (P, S, A, B, C, D, Rookie)
const srTierStyles: Record<LicenseClass, { border: string; bg: string; text: string }> = {
  P: { border: "border-[#AF52DE]/80", bg: "bg-[#AF52DE]/20", text: "text-[#BF5AF2]" }, // Pro: Purple (iRacing official Pro)
  S: { border: "border-[#D946EF]/80", bg: "bg-[#D946EF]/20", text: "text-[#E879F9]" }, // S Tier: Vivid Fuchsia
  A: { border: "border-[#0072CE]/70", bg: "bg-[#0072CE]/15", text: "text-[#0A84FF]" }, // Class A: Blue
  B: { border: "border-[#00A859]/70", bg: "bg-[#00A859]/15", text: "text-[#30D158]" }, // Class B: Green
  C: { border: "border-[#FED100]/70", bg: "bg-[#FED100]/15", text: "text-[#FFD60A]" }, // Class C: Yellow
  D: { border: "border-[#FC6A03]/70", bg: "bg-[#FC6A03]/15", text: "text-[#FF9F0A]" }, // Class D: Orange
  Rookie: { border: "border-[#E03A3E]/70", bg: "bg-[#E03A3E]/15", text: "text-[#FF453A]" }, // Rookie: Red
  R: { border: "border-[#E03A3E]/70", bg: "bg-[#E03A3E]/15", text: "text-[#FF453A]" }, // Rookie: Red
};

// iRacing's badge is always a single letter; the session YAML LicString spells
// "Rookie" out, which overflows the SR cell in the wide F1 display face.
const srLetter = (license?: LicenseClass) => (license === "Rookie" ? "R" : license ?? "B");

// Row height drives both the rendered row and the vertical drag-resize math.
// Kept as one constant so the drag can never drift out of sync with the layout.
const ROW_HEIGHT = 34;

function formatLapTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "-:--.---";
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, "0")}`;
}

function formatSessionTime(seconds?: number): string {
  if (seconds === undefined || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const Leaderboard: Component<LeaderboardProps> = (props) => {
  // Width control: default to 460px (Detailed), minimum 220px, maximum 720px
  const currentWidth = () => Math.max(220, Math.min(720, props.width ?? 520));
  // Rows control: default to 10 rows, minimum 3 rows, maximum 25 rows
  const currentRows = () => Math.max(3, Math.min(25, props.maxRows ?? 10));
  const currentLap = () => props.lapCurrent || 24;
  const totalLaps = () => props.lapTotal || 57;

  // Session type follows the live session (iRacing SessionType), never a user toggle.
  const currentSessionType = () => props.sessionType ?? "RACE";
  // Broadcast wordmark, F1-style: PRACTICE / QUALIFYING / RACE
  const sessionLabel = () =>
    currentSessionType() === "QUALIFY" ? "QUALIFYING" : currentSessionType();

  // Dynamic Theme-Adaptive Series Logo
  const renderThemeLogo = () => {
    const isVisible = props.showThemeLogo !== undefined ? props.showThemeLogo : (settings.showThemeLogo !== false);
    if (!isVisible) return null;
    const currentTheme = props.theme || settings.theme || "f1";
    switch (currentTheme) {
      case "f1":
        return <LogoF1 class="h-3.5 w-auto select-none shrink-0" />;
      case "wec":
        return <LogoWEC class="h-3 w-auto select-none shrink-0 text-white" />;
      case "wrc":
        return <LogoWRC class="h-3 w-auto select-none shrink-0 text-white" />;
      case "indycar":
        return <LogoIndyCar class="h-3 w-auto select-none shrink-0 text-white" />;
      case "gt":
        return <LogoIMSA class="h-3 w-auto select-none shrink-0 text-white" />;
      default:
        return <LogoF1 class="h-3.5 w-auto select-none shrink-0" />;
    }
  };

  // Width Responsive Hierarchy. Thresholds are derived from the actual column
  // costs (base 54 + SR 66 + iR 48 + BEST 68 + LAST 68 + BRAND 44) so a narrow
  // board drops a whole column instead of squeezing the driver name to nothing.
  // - Minimum (~220px): [순위] [국기 + 이름] [최근랩타임]
  // - Level 1 (>= 300px): + [베스트랩타임]
  // - Level 2 (>= 380px): + [IR]
  // - Level 3 (>= 450px): + [SR 사각 배지]
  // - Level 4 (>= 520px): + [차량브랜드]
  const showBestLap = () => currentWidth() >= 300;
  const showIR = () => currentWidth() >= 380;
  const showSR = () => currentWidth() >= 450;
  const showBrand = () => currentWidth() >= 520;
  // Car number is an extra, not part of the M2.1 column spec: first to go.
  const showCarNumber = () => currentWidth() >= 560;

  const isPlayer = (car: CarTelemetry) => car.carIdx === (props.playerCarIdx ?? 1);

  // 1등(P1)부터 순차 정렬 보장 (사용자가 설정한 currentRows 대수만큼 렌더링)
  // 예선(QUALIFY)에서는 베스트 랩타임 기준 정렬
  const sortedCars = createMemo(() => {
    const list = props.cars && props.cars.length > 0 ? [...props.cars] : defaultCars;
    if (currentSessionType() === "QUALIFY") {
      return [...list]
        .sort((a, b) => {
          const aTime = a.bestLapTime > 0 ? a.bestLapTime : 999999;
          const bTime = b.bestLapTime > 0 ? b.bestLapTime : 999999;
          return aTime - bTime;
        })
        .slice(0, currentRows());
    }
    return [...list].sort((a, b) => a.overallPosition - b.overallPosition).slice(0, currentRows());
  });

  // 순위 변동 시 행이 위아래로 자리를 바꾸는 애니메이션 (전 테마 공통)
  const flip = createReorderFlip(() => sortedCars().map((c) => c.carIdx));

  // Interactive Horizontal Drag Resizing for Edit Mode (Width)
  const [isResizingWidth, setIsResizingWidth] = createSignal(false);
  // Interactive Vertical Drag Resizing for Edit Mode (Height / Rows)
  const [isResizingHeight, setIsResizingHeight] = createSignal(false);
  // Interactive Corner Drag Resizing for Edit Mode (Both Width & Height)
  const [isResizingCorner, setIsResizingCorner] = createSignal(false);

  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startRows = 0;

  // 1. 가로 너비 드래그 핸들러
  const handleResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingWidth(true);
    startX = e.clientX;
    startW = currentWidth();

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const newWidth = Math.max(220, Math.min(720, startW + deltaX));
      props.onWidthChange?.(Math.round(newWidth));
    };

    const handleMouseUp = () => {
      setIsResizingWidth(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // 2. 세로 높이/표시 행 수 드래그 핸들러 (행당 ROW_HEIGHT px)
  const handleHeightResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingHeight(true);
    startY = e.clientY;
    startRows = currentRows();

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaY = ev.clientY - startY;
      const rowDelta = Math.round(deltaY / ROW_HEIGHT);
      const newRows = Math.max(3, Math.min(25, startRows + rowDelta));
      props.onMaxRowsChange?.(newRows);
    };

    const handleMouseUp = () => {
      setIsResizingHeight(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // 3. 우하단 코너 동시 크기 조절 핸들러 (너비 + 높이)
  const handleCornerResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingCorner(true);
    startX = e.clientX;
    startW = currentWidth();
    startY = e.clientY;
    startRows = currentRows();

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;
      const newWidth = Math.max(220, Math.min(720, startW + deltaX));
      const rowDelta = Math.round(deltaY / ROW_HEIGHT);
      const newRows = Math.max(3, Math.min(25, startRows + rowDelta));
      props.onWidthChange?.(Math.round(newWidth));
      props.onMaxRowsChange?.(newRows);
    };

    const handleMouseUp = () => {
      setIsResizingCorner(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  onCleanup(() => {
    setIsResizingWidth(false);
    setIsResizingHeight(false);
    setIsResizingCorner(false);
  });

  return (
    <div
      class="relative flex flex-col font-sans select-none rounded-sm overflow-visible text-white shadow-2xl transition-all"
      style={{
        width: `${currentWidth()}px`,
      }}
    >
      {/* Edit Mode Top Shaded Bar: "순위표" + [RACE / QUAL / PRAC] + " - 100% + " */}
      <Show when={props.isEditMode}>
        <div class="absolute bottom-full inset-x-0 flex items-center justify-between px-3 py-1.5 hud-surface-deep backdrop-blur-md border-t border-x border-white/20 rounded-t text-white select-none gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold tracking-wider text-white/95 shrink-0">
              {t().leaderboardTitle || "순위표"}
            </span>

          </div>

          <div class="flex items-center gap-1.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onScaleChange?.(Math.max(0.7, (props.scale || 1) - 0.1));
              }}
              class="w-5 h-5 rounded bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer transition-all border border-white/15"
              title="축소"
            >
              -
            </button>
            <span class="text-[11px] font-mono font-bold w-9 text-center text-white/90">
              {Math.round((props.scale || 1) * 100)}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onScaleChange?.(Math.min(1.5, (props.scale || 1) + 0.1));
              }}
              class="w-5 h-5 rounded bg-white/10 hover:bg-white/25 active:scale-90 flex items-center justify-center text-xs font-bold cursor-pointer transition-all border border-white/15"
              title="확대"
            >
              +
            </button>
          </div>
        </div>
      </Show>

      {/* 1. Broadcast title lockup: [logo] SESSION  |  LAP n/N  (F1 world-feed styling) */}
      <div
        class={`flex items-center justify-between hud-surface-band px-2.5 py-2 ${
          props.isEditMode ? "border-x border-t border-white/20" : "border border-white/10 rounded-t-[3px]"
        }`}
      >
        <div class="flex items-center gap-2 min-w-0">
          {renderThemeLogo()}
          <span class="font-wide text-[15px] leading-none font-black tracking-[0.01em] text-white shrink-0">
            {sessionLabel()}
          </span>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <Show
            when={currentSessionType() === "RACE"}
            fallback={
              <span class="text-[11px] leading-none font-bold tracking-wide text-white/50 uppercase tnum">
                {formatSessionTime(props.sessionTimeRemain)}
              </span>
            }
          >
            <span class="text-[11px] leading-none font-bold tracking-wide text-white/50 uppercase">
              LAP{" "}
              <span class="text-[15px] font-black text-white tnum">{currentLap()}</span>
              <span class="text-white/45 tnum">/{totalLaps()}</span>
            </span>
          </Show>
          <span class="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" />
        </div>
      </div>

      {/* Red F1 accent rule under the title lockup */}
      <div class="h-[3px] bg-[#e10600]" />

      {/* 2. Dynamic Table Column Header */}
      <div class="flex items-center px-2 py-[3px] bg-[#0D0D12] text-[8px] font-bold text-white/35 tracking-[0.12em] uppercase">
        {/* Pos */}
        <span class="w-7 text-center font-bold">POS</span>
        <span class="w-[4px] mr-1.5 shrink-0" />

        {/* Optional Car Brand */}
        <Show when={showBrand()}>
          <span class="w-11 text-center font-bold">BRAND</span>
        </Show>

        {/* Driver Name & Flag (Always Visible, fills space) */}
        <span class="flex-1 pl-1.5 text-left truncate font-bold">DRIVER</span>

        {/* Optional Safety Rating Badge */}
        <Show when={showSR()}>
          <span class="w-[66px] text-center">SR</span>
        </Show>

        {/* Optional iRating */}
        <Show when={showIR()}>
          <span class="w-[48px] text-right pr-1.5">iR</span>
        </Show>

        {/* Optional Best Lap with Stopwatch Icon */}
        <Show when={showBestLap()}>
          <span class="w-[68px] text-right pr-2 flex items-center justify-end gap-1">
            <IconStopwatch class="w-2.5 h-2.5 text-purple-300/80" />
            BEST
          </span>
        </Show>

        {/* Last Lap Time (Always Visible) */}
        <span class="w-[68px] text-right pr-2">LAST</span>
      </div>

      {/* 3. Driver Rows (Starting strictly from P1) */}
      <div class="flex flex-col gap-[1px] bg-black/60">
        <For each={sortedCars()}>
          {(car, idx) => {
            const srStyle = () =>
              srTierStyles[car.safetyRating?.license || "B"] || srTierStyles.B;
            const displayPos = () => (currentSessionType() === "QUALIFY" ? idx() + 1 : car.overallPosition);
            const isLeader = () => displayPos() === 1;

            return (
              <div
                ref={flip.row(car.carIdx)}
                style={{ height: `${ROW_HEIGHT}px` }}
                class={`flex items-center px-2 transition-colors duration-100 ${
                  isPlayer(car)
                    ? "bg-[#1D2338] ring-1 ring-inset ring-[#30d158]/50"
                    : isLeader()
                    ? "bg-[#26262F]"
                    : "hud-surface-raised hover:bg-[#22222B]"
                }`}
              >
                {/* 1. Pos with Gain/Loss Indicator (▲/▼/–) & F1 Quali P1 Solid Red Badge */}
                <div class="w-7 flex items-center justify-center gap-0.5 h-full text-[13px] font-black tnum">
                  <Show
                    when={currentSessionType() === "QUALIFY" && isLeader()}
                    fallback={
                      <span
                        class={
                          isLeader()
                            ? "text-white font-black"
                            : displayPos() <= 3
                            ? "text-white/95 font-black"
                            : "text-white/65 font-bold"
                        }
                      >
                        {displayPos()}
                      </span>
                    }
                  >
                    <span class="w-4.5 h-4.5 rounded-[2px] bg-[#e10600] text-white font-black flex items-center justify-center text-[10px] shadow-sm">
                      1
                    </span>
                  </Show>
                  <Show when={currentSessionType() === "RACE" && car.positionDelta !== undefined && car.positionDelta !== 0} fallback={
                    <Show when={currentSessionType() === "RACE"}>
                      <span class="text-[7px] text-white/20 font-bold">−</span>
                    </Show>
                  }>
                    <span
                      class={`text-[7px] font-black ${
                        car.positionDelta! > 0 ? "text-[#30d158]" : "text-[#ff453a]"
                      }`}
                      title={`${car.positionDelta! > 0 ? "+" : ""}${car.positionDelta} Pos`}
                    >
                      {car.positionDelta! > 0 ? "▲" : "▼"}
                    </span>
                  </Show>
                </div>

                {/* Vertical Accent Color Stripe */}
                <div
                  class="w-[4px] h-full shrink-0 mr-1.5"
                  style={{ "background-color": car.carClassColor || "#E10600" }}
                />

                {/* 2. Optional Car Brand: 24x24 white vector mark, text fallback */}
                <Show when={showBrand()}>
                  <div class="w-11 flex items-center justify-center shrink-0">
                    <CarBrandIcon
                      brand={car.carBrand}
                      class="w-4 h-4 object-contain select-none pointer-events-none opacity-90"
                    />
                  </div>
                </Show>

                {/* 3. Driver Name & Flag (Always Visible) */}
                <div class="flex-1 min-w-0 flex items-center gap-1.5 pl-1.5">
                  <CountryFlag
                    code={car.country}
                    class="w-4.5 h-3 rounded-[1.5px] border border-white/20 shadow-sm shrink-0"
                  />
                  <span class="text-[12px] font-bold uppercase tracking-[-0.01em] text-white truncate">
                    {car.driverName}
                  </span>
                  <Show when={showCarNumber()}>
                    <span class="text-[9px] font-bold text-white/30 shrink-0 tnum">
                      #{car.carNumber}
                    </span>
                  </Show>
                  <Show when={car.inPit || car.trackSurface === 1 || car.trackSurface === 2}>
                    <span class="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[8px] font-mono font-bold shrink-0" title="In Pit / Pit Lane">
                      <IconPit class="w-2.5 h-2.5 text-amber-400" />
                      PIT
                    </span>
                  </Show>
                  <Show when={isPlayer(car)}>
                    <span class="text-[8px] font-mono font-bold px-1 py-0.5 bg-[#30d158]/20 text-[#30d158] rounded border border-[#30d158]/30 shrink-0">
                      YOU
                    </span>
                  </Show>
                </div>

                {/* 5. Optional Safety Rating (Rounded Rectangle Badge with clear gap) */}
                <Show when={showSR()}>
                  <div class="w-[66px] flex items-center justify-center shrink-0">
                    <div
                      class={`px-1.5 py-0.5 rounded-[2px] border ${srStyle().border} ${srStyle().bg} flex items-center gap-1.5`}
                    >
                      <span class={`text-[9px] font-mono font-black ${srStyle().text}`}>
                        {srLetter(car.safetyRating?.license)}
                      </span>
                      <span class="text-[9px] font-mono font-bold text-white/90">
                        {car.safetyRating?.value?.toFixed(2) || "3.50"}
                      </span>
                    </div>
                  </div>
                </Show>

                {/* 6. Optional iRating */}
                <Show when={showIR()}>
                  <div class="w-[48px] text-right pr-1.5 text-[10.5px] text-white/70 shrink-0 tnum">
                    {car.irating ? car.irating.toLocaleString() : "2,500"}
                  </div>
                </Show>

                {/* 7. Optional Best Lap */}
                <Show when={showBestLap()}>
                  <div class="w-[68px] text-right pr-2 text-[10.5px] text-[#B055F5] shrink-0 tnum">
                    {formatLapTime(car.bestLapTime)}
                  </div>
                </Show>

                {/* 8. Last Lap Time (Always Visible) */}
                <div class="w-[68px] text-right pr-2 text-[10.5px] font-bold text-white shrink-0 tnum">
                  {formatLapTime(car.lastLapTime)}
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* Bottom Border Accent */}
      <div class="h-[5px] hud-surface-band rounded-b-[3px] border-t border-white/[0.06]" />

      {/* 1. Horizontal Drag Resize Handle (Right Edge: Width) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleResizeMouseDown}
          class="absolute -right-2.5 top-6 bottom-6 w-4 flex items-center justify-center cursor-ew-resize group z-50 pointer-events-auto select-none"
          title={`가로 너비 조절 (현재 ${currentWidth()}px)`}
        >
          <div
            class={`w-1.5 h-14 rounded-full shadow-lg border border-black/40 transition-all ${
              isResizingWidth() ? "bg-[#E10600] h-20 scale-110" : "bg-white/70 group-hover:bg-white"
            }`}
          />
        </div>
      </Show>

      {/* 2. Vertical Drag Resize Handle (Bottom Edge: Height / Displayed Rows) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleHeightResizeMouseDown}
          class="absolute -bottom-3 left-6 right-6 h-5 flex items-center justify-center cursor-ns-resize group z-50 pointer-events-auto select-none"
          title={`세로 높이 조절 (현재 ${currentRows()}대 표시)`}
        >
          <div
            class={`h-1.5 w-16 rounded-full shadow-lg border border-black/40 transition-all flex items-center justify-center ${
              isResizingHeight() ? "bg-[#E10600] w-24 scale-110" : "bg-white/70 group-hover:bg-white"
            }`}
          >
            <Show when={isResizingHeight()}>
              <span class="text-[8px] font-mono font-black text-black tracking-tight">
                {currentRows()} ROWS
              </span>
            </Show>
          </div>
        </div>
      </Show>

      {/* 3. Corner Drag Resize Handle (Bottom-Right: Width & Height simultaneously) */}
      <Show when={props.isEditMode}>
        <div
          onMouseDown={handleCornerResizeMouseDown}
          class="absolute -right-2.5 -bottom-2.5 w-5 h-5 flex items-center justify-center cursor-nwse-resize group z-50 pointer-events-auto select-none"
          title={`대각선 크기 조절 (가로 ${currentWidth()}px × 세로 ${currentRows()}대)`}
        >
          <div
            class={`w-3.5 h-3.5 rounded-full shadow-xl border-2 border-black/60 transition-all ${
              isResizingCorner() ? "bg-[#E10600] scale-125 ring-2 ring-[#E10600]/30" : "bg-white/70 group-hover:bg-white group-hover:scale-110"
            }`}
          />
        </div>
      </Show>
    </div>
  );
};

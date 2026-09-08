# AGENTS.md - Free & Ultra-Lightweight iRacing Overlay (프로젝트 헌장 및 개발 지침)

이 문서는 **완전 무료(Free)** 이자 **초경량(Ultra-Lightweight)** 아이레이싱(iRacing) 전용 오버레이 소프트웨어 개발을 위한 아키텍처 원칙, 기술 스택, 기능 명세, 그리고 AI 및 개발자를 위한 실행 지침입니다.

---

## 1. 프로젝트 비전 및 핵심 가치 (Core Principles)

1. **100% 영구 무료 (Free & Open Source)**
   - 구독제(구 iOverlay, Racelab, Kapps 등)나 유료 결제 유도 기능이 일체 없는 순수 무료 오픈소스.
2. **초경량성 & 제로 프레임 드롭 (Ultra-Lightweight & Zero Stutter)**
   - **타겟 리소스:** RAM 사용량 **< 50MB**, CPU 사용률 **< 1%** (60Hz 텔레메트리 기준).
   - Electron 및 다중 무거운 브라우저 인스턴스(CEF)의 불필요한 메모리 낭비와 마이크로 스터터(Micro-stutter) 완전 배제.
   - VR 및 트리플 모니터 유저에게 프레임 손실을 주지 않는 구조.
3. **포니테일 원칙 (Ponytail Principle / YAGNI)**
   - 불필요한 추상화 계층, 오버엔지니어링, 무거운 외부 의존성 제거.
   - 표준 라이브러리 및 네이티브 OS 기능을 최우선 활용 (`// ponytail: intentional simplification`).
4. **방송 그래픽 수준의 모터스포츠 테마 (Multi-Motorsport Broadcast HUD)**
   - F1, WRC, WEC, IndyCar, GT 등 공식 중계 스타일의 완성도 높은 디자인 및 즉시 전환 가능한 테마 시스템.
5. **직관적인 모터스포츠 아이콘 시스템 (Iconography First)**
   - 모든 위젯과 텔레메트리 지표에는 텍스트뿐만 아니라 가독성을 극대화하는 **고해상도 초경량 벡터(SVG) 아이콘 필수 적용**.
6. **Apple Design 디자인 원칙 엄격 준수 (Apple Design Standard)**
   - 모든 UI/UX, 설정 위자드, 온보딩, 오버레이 위젯은 `.skill/apple-design/SKILL.md` 지침을 **무조건 필수 준수**합니다.
   - 촌스럽고 조잡한 AI 스타일의 알록달록한 카드/박스 나열을 일체 금지하고, 절제된 반투명 재질(`backdrop-blur`), 정교한 보더(`border-white/10`), SF 프로 감성의 광학적 타이포그래피, 스프링 반응(`active:scale-[0.98]`) 기반의 극도로 세련된 미니멀 디자인을 적용합니다.
7. **F1 스타일 모터스포츠 레이싱 오버레이 디자인 엄격 준수 (Formula Style Standard)**
   - 모든 레이싱 HUD와 방송 그래픽 오버레이(순위표, 렐러티브, 텔레메트리 등)는 `.skill/f1-design/SKILL.md` 지침을 **무조건 필수 준수**합니다.
   - 단순한 빨간/검정 사선 상자가 아닌, **실제 F1 방송 타이밍 타워(팀 컬러 수직 인디케이터, 드라이버 3글자 약칭, 타이어 컴파운드 배지 S/M/H, 고정 너비 tabular numerals), 콕핏 스티어링 HUD(기어, 동적 RPM LED, 페달 트레이스, 델타 색상 규칙)**를 완벽 구현합니다.
   - 공식 폰트(`Formula1`) 및 고품질 오픈소스 모터스포츠 폰트(`Titillium Web`, `Chakra Petch`, `Barlow Condensed`) 연동 및 자동 웹폰트 로딩 시스템을 지원합니다.

---

## 2. 권장 기술 스택 및 선정 이유 (Tech Stack & Architecture)

### 2.1 스택 선정

| 영역 | 기술 스택 | 선정 이유 및 장점 |
| :--- | :--- | :--- |
| **코어/백엔드** | **Rust** | • Windows Shared Memory (`Local\IRSDKMemMapFileName`) 제로 카피(Zero-copy) 직접 매핑<br>• GC(가비지 컬렉션) 부하 0, 60fps 틱 루프에서 지연 시간 마이크로초 단위 처리<br>• 메모리 안전성 및 최소 리소스 소비 |
| **데스크톱 프레임워크** | **Tauri v2** | • 번들 크기 < 15MB, 유휴 메모리 30~50MB (Electron의 1/10 수준)<br>• Windows 10/11 기본 탑재 **WebView2 (Evergreen)** 활용하여 추가 런타임 설치 불필요<br>• 투명 윈도우, 클릭스루(Click-through), Always-on-Top OS 네이티브 제어 |
| **프론트엔드 UI** | **Solid.js** + TypeScript | • Virtual DOM 없음 (컴포넌트 단위 재렌더링 X, 변경된 바인딩만 직접 DOM 갱신)<br>• 60Hz 고주파수 텔레메트리 수신 시 브라우저 렌더링 랙 0<br>• 번들 크기 10KB 미만 |
| **스타일링/테마** | **CSS Variables** + Tailwind CSS | • CSS 변수 동적 전환을 통한 무지연(Zero-lag) 테마 교체 (F1, WRC, WEC 등)<br>• GPU 가속 CSS Transform/Opacity 기반 애니메이션 |
| **개발 & 시뮬레이터** | **Mock iRacing Telemetry Engine** | • macOS/Linux 환경에서도 iRacing 주행 없이 실시간 60Hz 텔레메트리/IBT 리플레이 재생 및 UI 검증 가능 |
| **설정 영구 저장** | **OS 표준 파일 (`config.json`)** | • SQLite 등 무거운 DB 엔진 의존성 0 (포니테일 원칙: YAGNI)<br>• Windows `%APPDATA%`, macOS `Application Support`에 Rust 표준 파일 I/O로 영구 보존<br>• 브라우저 캐시 삭제에도 안전하며 메모장/텍스트 편집기로 직접 열람 및 백업 가능 |

---

## 3. 기능 요구사항 상세 명세 (16대 핵심 기능)

### 3.0 ⚠️ 기능 구현 전 필수 선행 규칙 (Telemetry-First Rule)

> **모든 기능 구현·수정 시, 코드를 한 줄이라도 쓰기 전에 반드시 아래 기준 문서를 먼저 확인합니다. 예외 없습니다.**

| 기준 문서 | 역할 |
| :--- | :--- |
| **[`docs/IRACING_TELEMETRY_REFERENCE.md`](docs/IRACING_TELEMETRY_REFERENCE.md)** | **1순위 기준 문서.** iRacing SDK가 실제로 노출하는 전체 변수(293개), 타입/배열 크기/단위, Enum·Bitfield 해석표, 위젯별 필요 변수 매핑. |
| [`docs/IRACING_TELEMETRY_MEMO.md`](docs/IRACING_TELEMETRY_MEMO.md) | 핵심 변수 활용 사례 요약 메모. |

#### 필수 준수 사항

1. **변수명·타입·단위를 추측하지 않습니다.**
   레퍼런스에 적힌 정확한 이름(`LapDeltaToSessionLastlLap`)과 타입(`float[1]`)과 단위(`s`)를 그대로 씁니다.
   추측으로 만든 변수명은 실제 게임 연동 시 100% 값이 비어 있게 됩니다.
2. **iRacing이 이미 계산해주는 값을 직접 구현하지 않습니다. (포니테일 원칙 §1.3)**
   구현 전에 레퍼런스를 검색해서 **이미 제공되는 값이 있는지 먼저 확인**합니다.
   - 랩 델타 → `LapDeltaToSessionLastlLap` / `LapDeltaToBestLap` (직접 계산 금지)
   - 좌우 근접 차량 → `CarLeftRight` bitfield (거리 직접 계산 금지)
   - 세션 플래그/황기 → `SessionFlags` bitfield (자체 사고 감지 로직보다 우선)
3. **데이터 출처를 구분합니다.**
   - **텔레메트리 (60Hz 공유 메모리):** 속도, 랩, 연료, 위치 등 실시간 수치.
   - **세션 YAML (`irsdk_getSessionInfoStr`):** 드라이버 이름·차량 번호·국가·iRating·SR·차종·트랙 정보.
     ➜ **드라이버 메타데이터는 텔레메트리에 존재하지 않습니다.** 순위표/렐러티브 구현 시 반드시 YAML 경로를 사용합니다.
4. **갱신 주기 제약을 명시합니다.**
   타이어 마모·온도(`LFwearL` 등)는 **피트인 후에만 갱신**됩니다. 주행 중 실시간 값이 아니므로 추정 모델과 확정 데이터를 UI에서 구분 표기합니다.
5. **단위 변환을 코드 주석에 남깁니다.**
   `Speed`=m/s(×3.6→km/h), `WindDir`/`Yaw`/`SteeringWheelAngle`=라디안, 타이어 압력=kPa, `LapDistPct`=0.0~1.0(설명의 `%` 표기에 속지 말 것).
6. **레퍼런스에 없는 값이 필요하면, 임의로 만들지 말고 문서를 먼저 갱신합니다.**
   목업(`mockEngine.ts`)에만 존재하고 실제 SDK에 없는 필드는 **M5 실기기 연동 시 전부 터집니다.**
   목업 필드를 추가할 때는 레퍼런스의 어떤 변수에서 파생되는지 반드시 주석으로 근거를 남깁니다.

#### 검증 규칙

- 각 기능의 **"텔레메트리 변수"** 항목에 적힌 이름은 레퍼런스 문서와 **1:1로 일치해야 합니다.**
- `docs/CHECKLIST.md`에 DoD PASS를 기록할 때, 해당 위젯이 사용한 실제 SDK 변수명을 검증 근거로 함께 적습니다.

---

### 기능 1: 순위표 (Leaderboard / Standings)
- **설명:** 현재 세션 참가 차량의 실시간 순위 및 랩 정보 표시. (P1부터 순차 정렬, 가로 너비 220px~720px 및 세로 행 수 3대~25대 3방향 실시간 마우스 드래그 조절 지원).
- **아이콘 및 에셋:** 순위 변동 아이콘(▲/▼/–), 클래스 배지, 피트 인 렌치(`IconPit`), 베스트 랩 스톱워치(`IconStopwatch`), 드라이버별 영구 국기(SVG), 실제 공식 제조사 브랜드 고해상도 로고 이미지(PNG/SVG 28종).
- **텔레메트리 변수:** `CarIdxClassPosition`, `CarIdxLap`, `CarIdxLapDistPct`, `CarIdxBestLapTime`, `CarIdxLastLapTime`, `CarIdxTrackSurface`, `CarIdxPaceLine`.

### 기능 2: 렐러티브 (Relative - 내 기준 위/아래 2~5대)
- **설명:** 현재 트랙 위치 기준으로 내 앞뒤 근접 차량과의 실시간 시간/거리 간격 표시.
- **아이콘 및 인디케이터:** 3분할 섹터(`S1/S2/S3`) 컬러 인디케이터(Yellow/Green/Purple), 타이어 컴파운드 아이콘(S/M/H/I/W), 클래스 컬러 태그, 동일 랩/백마커 인디케이터.
- **옵션 설정:** 가로 너비(280~520px) 및 위/아래 표시 차량 수(2대 ~ 5대) 마우스 드래그 조절.

### 기능 3: 직전 랩타임 비교 (Last Lap Delta)
- **설명:** 가로형 3분할 섹터(`S1 / S2 / S3`) HUD를 통해 옐로우(지연), 그린(개인 최고), 퍼플(세션 최고) 실시간 색상 표시 및 실시간 델타 초 단위 비교 게이지 (`VS BEST` / `VS LAST`).
- **아이콘 및 게이지:** 3분할 섹터 박스, 스톱워치(`IconStopwatch`), 실시간 센터 0 좌우 델타 게이지 바, 빠름(녹색/보라색 음수) / 느림(적색/황색 양수).
- **텔레메트리 변수:** `LapDeltaToSessionLastlLap`, `LapDeltaToBestLap`, `LapLastLapTime`, `LapBestLapTime`, YAML `SplitTimeInfo`.

### 기능 4: 리벤지 트래커 (사고 유발 드라이버 추적 & 간격)
- **설명:** 나에게 +4x/접촉 사고를 유발한 드라이버 자동 감지 및 HUD 전용 박스에 "Revenge Target" 고정 추적.
- **아이콘:** 타깃 조준선(`Crosshair`), 위험 경고(`AlertTriangle`), 랩타임 간격 타이머.

### 기능 5: 근접 스포터 (Proximity Spotter - 좌/우 독립 제어)
- **설명:** 차량 좌우에 상대 차량 접근 시 화면 양옆에 거리별 3단계 점멸 인디케이터.
- **아이콘:** 좌/우 차량 접근 레이더 화살표, 안전(Green) → 경고(Yellow) → 위험(Blinking Red).
- **핵심 제어:** 좌측(Left) / 우측(Right) 각각 활성화 토글 및 민감도(1.5m ~ 5m) 독립 설정.

### 기능 6: 연료 시뮬레이터 (Fuel Simulator & Calculator)
- **설명:** 완주 필요 연료량 및 피트스탑 시 급유량 정밀 계산.
- **아이콘:** 주유기(`FuelPump`), 드롭 카운터(`Droplet`), 연비 게이지(`Gauge`).
- **계산 모델:** 최근 3~5랩 그린 플래그 기준 평균 소비량($L/\text{lap}$) $\times$ 남은 랩 수 $-$ 현재 연료량 (Safety Margin $+1.5\text{L}$).

### 기능 7: 타이어 분석 (Tire Analysis)
- **설명:** 4륜 타이어 마모도, 압력(PSI), 온도 상태 분석.
- **아이콘:** 타이어 실루엣, 타이어 공기압 게이지(`TirePSI`), 온도계(`Thermometer`).
- **iRacing 제약 대응:** 주행 중에는 휠 슬립/횡가속도/노면온도 기반 추정치 시각화 + 피트 진입 시 확정 데이터 표시.

### 기능 8: 전방 사고 지점 경고 (Incident Hazard Meter & Blinker)
- **설명:** 내 전방 0m ~ 400m 내 사고(스핀, 코스아웃, 속도 급감) 발생 시 잔여 거리(m)와 함께 고휘도 점멸 경고.
- **아이콘:** 경고 삼각 플래셔(`AlertTriangle`), 사고 차량 번호 태그.

### 기능 9: 날씨 & 트랙 컨디션 (Weather & Tempest Info)
- **설명:** 기온, 트랙 노면 온도, 풍속/풍향, 날씨 변화, 비(Rain) 및 노면 젖음 상태.
- **아이콘:** 풍향 나침반(`WindCompass`), 노면 온도계(`TrackThermometer`), 우천 구름/빗방울(`CloudRain`).

### 기능 10: 멀티클래스 접근 경고 (Multiclass Approaching Alert)
- **설명:** 상위 빠른 클래스 차량이 후방 3초 이내로 고속 접근 시 시각 경보.
- **아이콘:** 고속 접근 레이더(`ClosingSpeedRadar`), 클래스 엠블럼.

### 기능 11: 실시간 트랙 맵 (Live 2D Track Map Overlay)
- **설명:** 전체 서킷 레이아웃을 2D 벡터(SVG)로 렌더링하고 모든 차량의 실시간 트랙 위치를 미니맵에 시각화.
- **아이콘 & 렌더링 요소:**
  - 내 차량: 고휘도 시안/네온 컬러 화살표(`Arrow`) 및 차량 번호 표시.
  - 상대 차량: 클래스별 고유 컬러 점(Dot) (Hypercar 레드, LMP2 블루, GT3 그린 등).
  - 피트 레인: 피트 진입 중인 차량은 반투명/렌치 아이콘 표시.
  - 옐로우 플래그 섹터: 사고 발생 섹터 트랙 라인을 고휘도 옐로우로 발광 하이라이트.
  - 리벤지 타깃: 사고 유발 차량 위치에 타깃 조준선(`Crosshair`) 오버레이.

### 기능 12: 페달 인풋 트레이스 (Input Telemetry / Pedal Trace)
- **설명:** 스로틀(가속), 브레이크(감속), 클러치, 스티어링 휠 조향각의 실시간 입력값과 직전 3초간의 실시간 입력 파형(Waveform) 그래프를 표시하여 트레일 브레이킹 및 조작 분석 지원.
- **아이콘:** 페달 게이지, 스티어링 휠 각도계, 파형 트레이스 캔버스.
- **텔레메트리 변수:** `Throttle`, `Brake`, `Clutch`, `SteeringWheelAngle` (60Hz 실시간 공유 메모리).

### 기능 13: 실시간 예상 iRating 증감 & SOF 계산기 (Live iRating Gain/Loss & SOF)
- **설명:** 현재 참가한 스플릿의 공식 SOF(Strength of Field) 난이도를 표기하고, 현재 내 주행 순위로 완주할 경우 경기 종료 후 변동될 예상 iRating(예: `+38 iR`, `-15 iR`)을 실시간 계산하여 HUD에 표기.
- **아이콘:** SOF 트로피, iRating 상승(Green ▲) / 하강(Red ▼) 델타 배지.
- **텔레메트리 변수:** 세션 YAML `DriverInfo: Drivers[carIdx].IRating`, `CarIdxPosition`, 공식 iRacing ELO 공식 기반 알고리즘.

### 기능 14: 피트박스 카운트다운 & 리미터 헬퍼 (Pit Box Countdown & Pit Lane Helper)
- **설명:** 피트 레인 진입 시 제한 속도 초과 경고 표시 및 내 피트 스톨(Pit Stall) 정차 지점까지 남은 거리(m)와 50m ➔ 30m ➔ 10m ➔ STOP! 정밀 카운트다운 표시로 피트 실수 원천 차단.
- **아이콘:** 속도 제한 피트 리미터 게이지, 피트스탑 스톱사인(`IconPit`), 거리 카운트다운 바.
- **텔레메트리 변수:** `CarIdxTrackSurface`, `Speed`, `PitSvFlags`, `CarIdxLapDistPct`.

### 기능 15: 디지플래그 / 세션 플래그 경보 (Digiflag / Prominent Session Flag HUD)
- **설명:** 황기(사고/서행 차량 진입), 청기(뒤에서 빠른 클래스 또는 랩 선두 접근 중 - 추월 차량 번호 함께 표기), 흑백 반반기(Meatball/강제 수리 지시), 백기, 체커기 등 트랙 상황을 F1 및 공식 레이스 전광판 스타일로 고휘도 발광 경보.
- **아이콘:** 디지털 플래그 LED 애니메이션(Yellow, Blue, Green, Red, Checkered, Meatball).
- **텔레메트리 변수:** `SessionFlags` (Bitfield 네이티브 플래그).

### 기능 16: 테마별 RPM 시프트 라이트 LED 바 (Theme-Adaptive RPM Shift Light LED Bar)
- **설명:** 단일 스타일에 고정되지 않고 **사용자가 선택한 테마에 맞춰 외형과 점멸 스타일이 동적으로 적응**하는 고반응성 타코미터 & 변속 인디케이터 (F1 수평 아치형 LED, WEC/GT3 시퀀셜 듀얼 LED, IndyCar 스타일 등). 차종별 최적 변속 RPM 도달 시 고휘도 점멸.
- **아이콘:** 테마별 변속 LED 바, RPM 게이지, 기어 인디케이터.
- **텔레메트리 변수:** `RPM`, `EngineWarnings`, YAML `DriverInfo.DriverCarSLFirstRPM`, `DriverInfo.DriverCarSLShiftRPM`, `DriverInfo.DriverCarSLLastRPM`, `DriverInfo.DriverCarSLBlinkRPM`.

---

## 4. 모터스포츠 테마 전략 및 2단계 초기 설정 흐름 (Onboarding & Themes)

### 4.1 초기 실행 및 설정 관리 흐름 (Initial Launch Flow)
1. **설정 존재 여부 자동 확인:** 프로그램 설치 또는 실행 시 저장된 설정(`localStorage`)이 있는지 검사.
2. **설정 1번 화면 (테마 선택):**
   - 설정이 없을 시 초기 설정 화면으로 진입.
   - 제공 예정 테마 중 하나를 선택하도록 안내 (추후 언제든 재변경 가능).
   - **중요:** 현재 단계에서는 **오직 'F1 (Formula 1)' 테마**로만 집중 개발 및 우선 제공하며, 나머지 테마(WEC, WRC, IndyCar, GT)는 '추후 제공(Coming Soon)'으로 표시.
3. **설정 2번 화면 (오버레이 미리보기 & 배치 조절):**
   - 테마를 선택하면 각 오버레이 위젯을 실시간 미리보기 형태로 표시.
   - 사용자는 화면을 보며 **단축키 `Alt + J`**로 편집 모드를 켜고 끄며 크기 확대/축소 및 위치를 자유롭게 이동.
4. **최종 저장 (Save as Default):**
   - [최종 저장]을 누르면 설정값이 영구 저장되며, 이후 실행 시마다 항상 이 설정값이 기본값(Default)으로 자동 로드되어 게임 주행 모드로 즉시 진입.

### 4.2 테마 라인업
- **F1 (Formula 1 Broadcast) 테마 [현재 활성화]:** 다크 카본 슬레이트, F1 Red (`#E10600`), 타이밍 셰브론, 볼드 고대비 폰트.
- **WEC / WRC / IndyCar / GT 테마 [추후 순차 제공]:** F1 완성 후 확장 지원.

---

## 5. 포니테일(Ponytail) 개발 원칙 및 단축키 제어 규칙

1. **Keep It Simple & Minimal**
   - 불필요한 무거운 의존성 배제. 아이콘은 수 메가바이트의 거대한 아이콘 폰트 번들 대신 **필요한 SVG 코드만 인라인 컴포넌트로 최소화**하여 번들 크기 0KB 수준 유지.
2. **메모리 & 틱 최적화**
   - 트랙 맵 및 순위표는 10~15Hz, 스포터 및 렐러티브는 60Hz로 렌더링 주기를 분리하여 CPU 사용률 < 1% 달성.
3. **윈도우 관리 및 단축키 제어**
   - 투명 오버레이 모드(`transparent: true`, `decorations: false`, `always_on_top: true`).
   - **`Alt + J`** 단축키로 **[오버레이 고정/클릭스루 주행 모드]** ↔ **[위젯 드래그/크기 조절 편집 모드]** 간 즉시 전환.
   - 게임 주행 중에는 iRacing이 키보드 포커스를 점유하므로, `Alt + J`는 **반드시 OS 레벨 전역 단축키(`tauri-plugin-global-shortcut`)로 등록**합니다. 웹뷰 `keydown` 리스너는 인게임에서 절대 발화하지 않습니다.
   - 클릭스루는 CSS `pointer-events`로 구현할 수 없습니다. **반드시 네이티브 `set_ignore_cursor_events()`** 로 제어합니다.
4. **기능 구현 전 텔레메트리 기준 문서 확인 (필수)**
   - 모든 기능 구현·수정은 **[§3.0 Telemetry-First Rule](#30-️-기능-구현-전-필수-선행-규칙-telemetry-first-rule)** 을 먼저 따릅니다.
   - 변수명·타입·단위는 [`docs/IRACING_TELEMETRY_REFERENCE.md`](docs/IRACING_TELEMETRY_REFERENCE.md) 에서 확인하고, **추측으로 만들지 않습니다.**

---

## 6. 저장소 구조 (Directory Layout)

```
free-iracing-overlay/
├── AGENTS.md                  # 본 프로젝트 개발 지침 및 아키텍처
├── README.md                  # 사용자 및 기여자 안내 문서
├── docs/
│   ├── IRACING_TELEMETRY_REFERENCE.md  # ⚠️ 기능 구현 1순위 기준 문서 (SDK 변수 293종)
│   ├── IRACING_TELEMETRY_MEMO.md       # 핵심 변수 활용 사례 메모
│   ├── MILESTONES.md          # 마일스톤 로드맵
│   └── CHECKLIST.md           # 마일스톤 검증 체크리스트 (DoD)
├── src-tauri/                 # Tauri v2 (Rust) 백엔드
│   ├── Cargo.toml
│   ├── tauri.conf.json        # 윈도우 투명도, 권한, 크기 설정
│   └── src/
│       ├── main.rs            # 앱 엔트리포인트 및 IPC 핸들러
│       ├── iracing/           # iRacing 텔레메트리 모듈
│       │   ├── memory.rs      # Windows Shared Memory Reader
│       │   ├── mock.rs        # macOS/개발용 가상 텔레메트리 발생기
│       │   └── parser.rs      # iRacing 헤더 및 버퍼 파서
│       └── services/          # 연료 계산, 사고 감지, 트랙 맵 좌표 계산
└── src/                       # Solid.js 프론트엔드
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx            # 메인 오버레이 뷰포트
    │   ├── assets/
    │   │   └── icons/         # 초경량 인라인 SVG 아이콘 모음
    │   ├── styles/            # 테마별 CSS 변수 및 기본 스타일
    │   │   ├── themes.css     # F1, WRC, WEC, IndyCar, GT 테마 정의
    │   │   └── global.css
    │   ├── stores/            # 경량 Solid 스토어
    │   │   ├── telemetry.ts   # 텔레메트리 반응형 상태
    │   │   └── settings.ts    # 위젯 위치/크기/테마 설정
    │   └── components/        # 11대 위젯 컴포넌트
    │       ├── Leaderboard/
    │       ├── Relative/
    │       ├── LapDelta/
    │       ├── RevengeTracker/
    │       ├── ProximitySpotter/
    │       ├── FuelSimulator/
    │       ├── TireAnalysis/
    │       ├── IncidentHazard/
    │       ├── WeatherWidget/
    │       ├── MulticlassRadar/
    │       └── TrackMap/      # 신규: 2D 트랙 맵 오버레이
```

---

## 7. 고주사율(144Hz+) 및 트리플 모니터 대응 아키텍처 (High-Refresh & Triple Screen)

### 7.1 고주사율(144Hz, 165Hz, 240Hz) 렌더링 파이프라인
- **배경:** iRacing 내부 텔레메트리 업데이트 주기는 **60Hz (16.6ms)**로 고정되어 있습니다.
- **문제점:** 144Hz/240Hz 고주사율 게이밍 모니터에서 단순 60Hz 갱신 시 주행 화면과 오버레이 간의 미세한 버벅임(Judder / Stutter)이 체감될 수 있습니다.
- **해결책 (LERP 선형 보간 엔진):**
  1. **텔레메트리 수신 계층 (60Hz):** Shared Memory에서 최신 상태(`Current`)와 이전 상태(`Previous`)를 유지.
  2. **렌더링 계층 (디스플레이 주사율 동기화):** 브라우저 `requestAnimationFrame`을 통해 모니터 주사율(144Hz/240Hz)에 맞춰 선형 보간(Linear Interpolation, LERP) 수행.
     - $\text{Value}_{render} = \text{Previous} + (\text{Current} - \text{Previous}) \times \alpha$
     - 트랙 맵 상의 차량 이동, 델타 바, 타코미터 게이지의 움직임이 144Hz 모니터 위에서 물 흐르듯 부드럽게 렌더링.
  3. **GPU 가속:** 모든 위치 및 크기 변동 애니메이션은 CPU Reflow 대신 GPU 컴포지터 계층(`transform: translate3d`)에서 처리하여 CPU 부하 < 1% 유지.

### 7.2 트리플 모니터 (Triple Screen / 48:9 서라운드) 완벽 지원
- **배경:** 심레이싱 유저는 3대의 모니터를 연결하여 가로 5760x1080 또는 7680x1440 초광폭(Ultra-wide) 환경에서 주행합니다.
- **문제점:** 일반 오버레이는 16:9 기준 단일 화면으로 동작하여 양 끝 모니터로 위젯이 과도하게 멀어지거나(목을 90도 돌려야 함), UI 비율이 찢어지는 현상 발생.
- **해결책 (Multi-Monitor Viewport & Bezel Anchoring):**
  1. **중앙 모니터 집중 모드 (Center Screen Clamp):**
     - 전체 창이 트리플 해상도를 덮더라도, 위젯들의 바운더리를 **중앙 모니터(가로 1920 또는 2560 영역) 내에 안전 배치**하여 주행 시야각(FOV) 중심에 정보를 집약.
  2. **모니터 단위 앵커링 (Per-Monitor Magnetic Snapping):**
     - 위젯별로 기준 앵커를 `[좌측 모니터]`, `[중앙 모니터]`, `[우측 모니터]` 중 선택하여 자석처럼 고정 가능.
  3. **근접 스포터(Spotter) 베젤 커스텀:**
     - 스포터 인디케이터를 '트리플 맨 바깥쪽 끝'에 둘지, '중앙 모니터 양쪽 베젤(가장 즉각적인 시야각)'에 둘지 유저가 1클릭으로 선택 가능.
  4. **비례 왜곡 방지:**
     - 단순 `vw/vh` 백분율 대신 **CSS Container Queries 및 고정 픽셀 스케일링**을 채택하여 48:9 초광폭 비율에서도 폰트와 아이콘이 찌그러지지 않고 1:1 완벽 픽셀 유지.

---

## 8. 마일스톤 검증 및 CHECKLIST 관리 규칙 (Verification & Audit Rules)

본 프로젝트는 사용자 및 타 AI 모델이 개발 진척도와 품질을 언제든 정밀 교차 검증(Cross-Verification Audit)할 수 있도록 엄격한 체크리스트 관리 원칙을 준수합니다.

1. **`docs/CHECKLIST.md` 필수 동기화:**
   - 각 마일스톤의 개발이 완료될 때마다, `docs/CHECKLIST.md`의 "완료 검증 기준 (Definition of Done / DoD)" 체크박스를 갱신해야 합니다.
2. **구체적 실증 데이터(Evidence) 기록:**
   - 단순 체크(`[x]`)에 그치지 않고, 각 기준을 입증하는 **실제 측정 데이터**(빌드 크기(KB), 빌드 소요 시간(ms), 텔레메트리 틱 레이트(Hz), 렌더링 프레임(FPS), 메모리 점유율(MB), CPU 사용률(%), 로컬 테스트 URL 등)를 검증 근거로 함께 기록합니다.
3. **타 모델 및 사용자 교차 검토 보장:**
   - 사용자와 외부 AI 감사 모델이 `docs/CHECKLIST.md`만 보고도 각 마일스톤의 요구사항이 포니테일 원칙(경량성, 불필요한 추상화 배제)과 기술 사양에 부합하는지 즉시 판정할 수 있도록 명확하고 객관적인 증거를 유지합니다.
4. **텔레메트리 변수 근거 명시 (§3.0 연계):**
   - 위젯 관련 DoD를 PASS 처리할 때는, 그 위젯이 실제로 읽는 **SDK 변수명을 [`docs/IRACING_TELEMETRY_REFERENCE.md`](docs/IRACING_TELEMETRY_REFERENCE.md) 기준으로 나열**합니다.
   - 목업 데이터로만 동작하는 경우 반드시 **`(mock only — 실 SDK 미검증)`** 이라고 병기합니다.
5. **"구현함"과 "검증함"을 구분해서 기록:**
   - `[x]` + **PASS**는 **실제로 실행해서 동작을 확인한 경우에만** 사용합니다.
   - 코드만 작성하고 빌드·실행으로 확인하지 않았다면 **`IMPLEMENTED (미검증)`** 으로 표기합니다.
   - 특히 Rust(`src-tauri/`) 변경은 `cargo check` 통과 여부를 근거로 남깁니다. 컴파일하지 않은 코드는 PASS가 아닙니다.

---

## 9. 로컬 개발 서버 및 실행 명령어 (Development Commands)

> **⚠️ 실행 원칙:** AI 모델은 개발 서버(`dev`)를 백그라운드로 임의 자동 실행하지 않으며, **사용자가 직접 터미널에서 필요에 따라 실행**합니다.

### 9.1 프론트엔드 웹 개발 서버 (브라우저 & Mock 텔레메트리 모드)
macOS/Linux/Windows 환경에서 iRacing 게임 없이 브라우저를 통해 60Hz 가상 텔레메트리와 오버레이 UI, `Alt + J` 편집 기능을 즉시 확인 및 디버깅할 때 사용합니다.

```bash
npm run dev
```
- **로컬 접속 주소:** `http://localhost:1420`
- **시뮬레이션 엔진:** iRacing 게임이 켜져 있지 않아도 `MockTelemetryEngine`이 60Hz 가상 주행 텔레메트리를 자동 방출하여 순위표, 델타, 트랙 맵 등의 실시간 반응을 확인할 수 있습니다.

### 9.2 데스크톱 네이티브 오버레이 실행 (Tauri v2 윈도우 모드)
실제 데스크톱 투명 윈도우, 클릭스루(Click-through), 항상 위에 표시(Always-on-Top) 등 네이티브 OS 윈도우 런타임 환경에서 실행할 때 사용합니다.

```bash
npm run tauri dev
```

### 9.3 타입 체크 및 프로덕션 번들 빌드
TypeScript 컴파일 무결점 검증 및 Vite 프로덕션 번들 생성을 검증할 때 사용합니다.

```bash
npm run build
```
- `tsc --noEmit && vite build` 파이프라인이 동작하여 타입 에러 0건 여부와 초경량 번들 크기(< 250KB)를 확인합니다.

### 9.4 공식 에셋(실물 브랜드 로고 & F1 폰트) 셋업
초기 설치나 새로운 클론 환경에서 실물 공식 브랜드 이미지 28종 및 F1 웹폰트를 일괄 셋업할 때 사용합니다.

```bash
npm run setup-brands   # 공식 car-logos-dataset 기반 제조사 실물 고해상도 로고(PNG) 다운로드
npm run setup-fonts    # 공식 Formula1 WOFF2 폰트 다운로드 및 로컬 캐싱
```

---

## 10. 보안 및 라이선스 검증 규칙 (Security & License Gate — 커밋 전 필수)

> 본 저장소는 **공개(Public) 오픈소스**입니다. 커밋·PR·릴리스는 아래 게이트를 **반드시** 통과해야 합니다.
> 한 항목이라도 실패하면 커밋하지 않고 먼저 수정합니다.

### 10.1 커밋 전 필수 확인 (Pre-commit Security Gate)

1. **민감정보 0건:** API 키, 토큰, 비밀번호, 개인 이메일, 사설 URL, 실계정 자격증명이 스테이징 diff에 없을 것.
   ```bash
   git diff --cached | grep -nE "(api[_-]?key|secret|password|token|ghp_|github_pat_|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY)"
   ```
   출력이 있으면 **커밋 금지**. 이미 푸시된 경우 해당 크리덴셜을 즉시 폐기(rotate)합니다.

2. **런타임 원격 출처 금지:** 앱 실행 중 서드파티 호스트에서 코드·폰트·이미지를 가져오지 않을 것.
   우리가 통제하지 않는 계정(예: 임의 GitHub 저장소의 raw URL)은 언제든 파일을 바꿔치기할 수 있으므로
   **공급망 공격 경로**입니다. 에셋은 셋업 스크립트로 **빌드 전에 1회** 받아 로컬에 둡니다.

3. **CSP 유지:** `src-tauri/tauri.conf.json`의 `app.security.csp`는 **절대 `null`로 되돌리지 않습니다.**
   새 출처가 필요하면 해당 지시문에만 정확히 추가하고, 이유를 커밋 메시지에 적습니다.

4. **개발 서버 노출 금지:** `vite.config.ts`의 `server.host`는 루프백(`127.0.0.1`)만 허용.
   `0.0.0.0` / `allowedHosts: true`는 개발 중인 소스 전체를 같은 네트워크의 모든 기기에 공개하므로 금지합니다.

5. **Tauri IPC 최소 권한:** `src-tauri/capabilities/*.json`에 필요한 권한만 추가합니다.
   새 `#[tauri::command]`는 프론트엔드가 넘긴 인자를 **신뢰하지 않고** 검증합니다
   (특히 경로·파일 I/O는 앱 전용 디렉터리 밖으로 나가지 못하게 할 것).

6. **가짜 데이터 표시 금지:** 목업 텔레메트리는 **브라우저 개발 모드 전용**입니다
   (`import.meta.env.DEV && isBrowserPreview`). 패키징된 Tauri 빌드는 실제 프레임이 없으면
   위젯을 비워 둡니다. 스포터·사고 경보 위젯이 없는 데이터를 지어내면 **주행 중 안전 오정보**가 됩니다.

### 10.2 라이선스 및 상표 규칙 (License & Trademark)

7. **저장소 라이선스:** 소스 코드는 [`LICENSE`](LICENSE)(MIT). README의 "무료·오픈소스" 문구와 반드시 일치시킵니다.

8. **독점 에셋 커밋 금지:** `Formula1-*.woff2` 등 상용/독점 폰트는 **저장소에 커밋하지 않습니다**
   (`.gitignore` 적용됨). 셋업 스크립트로 각자 내려받습니다. 없으면 Roboto로 폴백되어 정상 동작합니다.

9. **상표 고지 유지:** 새 브랜드·시리즈 로고를 추가하면 [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md)에
   출처와 라이선스를 함께 기재합니다. 본 프로젝트는 iRacing·F1·FIA·제조사와 **무관한 비공식 도구**임을
   README와 고지 파일에 계속 명시합니다.

10. **의존성 추가 시:** 라이선스를 확인하고 `THIRD-PARTY-NOTICES.md` 표에 추가합니다.
    포니테일 원칙상 몇 줄로 되는 일에 새 의존성을 추가하지 않습니다.

### 10.3 릴리스 전 확인 (Pre-release Gate)

11. **독점 폰트 임베드 금지:** `vite build`는 `public/` 전체를 `dist/`로 복사하고
    `tauri build`는 그 `dist/`를 설치 파일에 넣습니다. 즉 `public/fonts/*.woff2`가 남아 있으면
    **공개 릴리스 설치 파일에 독점 F1 폰트가 그대로 배포됩니다.** git 추적 해제만으로는 막히지 않습니다.
    ```bash
    rm public/fonts/*.woff2   # 릴리스 빌드 전
    npm run setup-fonts       # 로컬 개발 재개 시 다시 받기
    ```
    릴리스 스크립트에 이 검사가 하드 게이트로 들어가 있어야 합니다(사람이 기억하는 방식 금지).

12. **릴리스 아티팩트 점검:** 업로드 직전 번들에 목업 데이터·독점 에셋·개발 서버 설정이
    포함되지 않았는지 확인합니다.
    ```bash
    grep -c "Spa-Francorchamps GP\|MockTelemetryEngine" dist/assets/*.js   # 0 이어야 함
    ls dist/fonts/*.woff2 2>/dev/null && echo "STOP: 독점 폰트 포함됨"
    ```

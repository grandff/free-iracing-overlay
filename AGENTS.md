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

---

## 3. 기능 요구사항 상세 명세 (11대 핵심 기능)

### 기능 1: 순위표 (Leaderboard / Standings)
- **설명:** 현재 세션 참가 차량의 실시간 순위 및 랩 정보 표시.
- **아이콘:** 순위 변동 아이콘(▲/▼/–), 클래스 배지, 피트 인 렌치 아이콘(`Wrench`), 베스트 랩 스톱워치(`Stopwatch`).
- **텔레메트리 변수:** `CarIdxClassPosition`, `CarIdxLap`, `CarIdxLapDistPct`, `CarIdxBestLapTime`, `CarIdxLastLapTime`, `CarIdxTrackSurface`, `CarIdxPaceLine`.

### 기능 2: 렐러티브 (Relative - 내 기준 위/아래 2~5대)
- **설명:** 현재 트랙 위치 기준으로 내 앞뒤 근접 차량과의 실시간 시간/거리 간격 표시.
- **아이콘:** 타이어 컴파운드 아이콘(S/M/H), 클래스 컬러 태그, 동일 랩/백마커 인디케이터.
- **옵션 설정:** 위/아래 표시 차량 수(2대 ~ 5대) 조절 슬라이더.

### 기능 3: 직전 랩타임 비교 (Last Lap Delta)
- **설명:** 내가 기록한 직전 랩타임과 타깃 차량과의 델타 초 단위 비교 ($\Delta = \text{MyLastLap} - \text{TargetLastLap}$).
- **아이콘:** 타임 게이지 아이콘, 빠름(녹색 음수) / 느림(적색 양수) 셰브론 화살표.

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

---

## 4. 모터스포츠 테마 시스템 (Theme Engine)

5가지 대표 모터스포츠 방송 그래픽 스타일을 CSS Variables 기반으로 완전 지원:

1. **F1 (Formula 1 Broadcast) 테마**
   - 폰트: 볼드 산세리프, F1 Red (`#E10600`), Carbon Black (`#15151E`), 타이어 컴파운드 배지.
2. **WRC (World Rally Championship) 테마**
   - 폰트: 다이내믹 이탤릭 슬랩, Rally Orange (`#FF5500`), Vivid Yellow (`#FFD200`), 스플릿 타임 델타.
3. **WEC (World Endurance Championship / Le Mans) 테마**
   - 폰트: 캡슐 타이포, 글래스모피즘, Hypercar/LMP2/LMGT3 클래스 배지, 스틴트 중심 레이아웃.
4. **IndyCar 테마**
   - 폰트: 미국 오픈휠 방송 스타일, Indy Blue (`#002F6C`), Push-to-Pass (P2P) 카운터, 라운델 번호.
5. **GT / Esports (Fanatec GT World Challenge) 테마**
   - 폰트: 모던 테크 폰트, 네온 시안/애시드 그린 포인트, 카본 텍스처, 미니멀리스트 e스포츠 스타일.

---

## 5. 포니테일(Ponytail) 개발 원칙 및 코드 규칙

1. **Keep It Simple & Minimal**
   - 불필요한 무거운 의존성 배제. 아이콘은 수 메가바이트의 거대한 아이콘 폰트 번들 대신 **필요한 SVG 코드만 인라인 컴포넌트로 최소화**하여 번들 크기 0KB 수준 유지.
2. **메모리 & 틱 최적화**
   - 트랙 맵 및 순위표는 10~15Hz, 스포터 및 렐러티브는 60Hz로 렌더링 주기를 분리하여 CPU 사용률 < 1% 달성.
3. **윈도우 관리**
   - 투명 오버레이 모드(`transparent: true`, `decorations: false`, `always_on_top: true`).
   - `Ctrl + Shift + O`로 **[오버레이 고정/클릭스루 모드]** 와 **[위젯 드래그/설정 모드]** 간 즉시 전환.

---

## 6. 저장소 구조 (Directory Layout)

```
free-iracing-overlay/
├── AGENTS.md                  # 본 프로젝트 개발 지침 및 아키텍처
├── README.md                  # 사용자 및 기여자 안내 문서
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



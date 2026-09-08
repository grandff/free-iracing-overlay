# Free & Ultra-Lightweight iRacing Overlay

> **100% 영구 무료(Free & Open Source)** 이자 시스템 자원을 극도로 절약하는 **초경량(Ultra-Lightweight, RAM < 50MB, CPU < 1%)** 아이레이싱(iRacing) 전용 방송 그래픽 HUD 오버레이 소프트웨어입니다.

---

## 🎯 1. 프로젝트 목적 (Purpose)

기존의 대표적인 레이싱 오버레이 프로그램들(Racelab, 구 iOverlay, Kapps 등)은 다음과 같은 치명적인 한계를 안고 있습니다:
- **유료 구독제 강제:** 필수 기능(상대 거리, 연료 계산, 텔레메트리 등)에 매달 구독료를 부과.
- **무거운 Electron 구조:** Chromium 브라우저 기반으로 실행되어 **RAM 1GB 이상 소비**, CPU/GPU 오버헤드로 인한 **인게임 마이크로 스터터(Micro-stutter / 미세 프레임 드랍)** 발생.

본 프로젝트는 이러한 문제를 근본적으로 해결하기 위해 시작되었습니다:
1. **100% 영구 무료 (Free & Open Source):** 모든 핵심 위젯과 기능을 결제 유도나 유료 플랜 없이 완전 무료로 영구 제공합니다.
2. **초경량성 및 제로 프레임 드랍 (Zero Stutter):** 
   - Windows Shared Memory를 **Rust 코어로 제로 카피(Zero-copy)** 매핑하여 C 수준의 마이크로초 틱 처리를 수행합니다.
   - 가상 DOM이 없는 **Solid.js**와 Windows 내장 **WebView2**를 결합하여 **RAM 점유율 < 50MB, CPU 사용률 < 1%**를 달성합니다.
3. **144Hz+ 고주사율 & 트리플 모니터 완벽 지원:**
   - 60Hz 텔레메트리를 144Hz/240Hz 모니터 주사율에 맞춰 **선형 보간(LERP) 렌더링**하여 트랙 맵과 델타 바의 움직임이 물 흐르듯 부드럽습니다.
   - **트리플 모니터(5760x1080, 7680x1440 등 48:9 서라운드):** 화면 왜곡 없이 중앙 모니터 안전 구역 스냅 및 개별 모니터 앵커링을 지원합니다.
4. **방송 그래픽 품질의 모터스포츠 테마:** F1, WRC, WEC, IndyCar 등 공식 중계 화면 수준의 완성도 높은 HUD 테마를 제공합니다.

---

## ⚡ 2. 주요 기능 (Features)

텍스트 위주의 지루한 UI 대신 **고해상도 초경량 벡터(SVG) 아이콘**을 전면 배치하여, 고속 주행 중에도 한눈에 상황을 직관적으로 파악할 수 있습니다.

### 11대 핵심 텔레메트리 위젯
| # | 기능 명칭 | 설명 |
| :-: | :--- | :--- |
| **1** | **순위표 (Leaderboard)** | 세션 전체 참가 차량의 실시간 순위, 클래스 배지, 랩타임, 피트 상태(Wrench) 표시 |
| **2** | **렐러티브 (Relative)** | 내 차량 기준 앞/뒤 근접 차량(2대 ~ 5대 설정 가능)과의 실시간 시간/거리 간격 표시 |
| **3** | **직전 랩타임 비교 (Lap Delta)** | 직전 랩에서 나와 타깃 드라이버 간의 초 단위 격차($\pm \Delta$)를 직관적 화살표로 비교 |
| **4** | **리벤지 트래커 (Revenge Tracker)** | 나에게 충돌 사고(+4x)를 유발한 차량을 자동 감지하여 전용 타깃 박스에 실시간 간격 고정 추적 |
| **5** | **근접 스포터 (Proximity Spotter)** | 사각지대 차량 접근 시 화면 좌/우 테두리에서 3단계(안전/경고/위험)로 점멸 (좌/우 감지 거리 독립 설정) |
| **6** | **연료 시뮬레이터 (Fuel Calculator)** | 최근 랩 기준 랩당 평균 소비량, 완주 필요 연료량, 피트스탑 권장 주유량, 연료 세이빙 타겟 계산 |
| **7** | **타이어 분석기 (Tire Analysis)** | 4륜 타이어의 압력(PSI), 온도, 마모 상태 표시 (피트 확정 데이터 + 주행 중 노면 부하 추정 모델) |
| **8** | **전방 사고 지점 경고 (Incident Hazard)** | 내 전방 400m 이내 사고(스핀/코스아웃) 발생 시 남은 거리(m)와 함께 고휘도 점멸 경고 |
| **9** | **날씨 & 트랙 컨디션 (Weather)** | 실시간 기온, 노면 온도, 풍향 나침반, 습도, Tempest 우천 강수량 및 노면 젖음 상태 표시 |
| **10** | **멀티클래스 접근 경고 (Multiclass Radar)**| 상위 빠른 클래스(GTP, LMP2 등)가 후방 3초 이내로 고속 접근할 때 시각적 경보 |
| **11** | **실시간 2D 트랙 맵 (Live Circuit Map)** | 서킷 레이아웃 미니맵 위 실시간 GPS 차량 위치, 옐로우 플래그 섹터 발광, 피트 차량 및 리벤지 타깃 표시 |

---

### 🎨 5대 모터스포츠 방송 공식 테마 (Theme Engine)
CSS 변수 기반의 테마 엔진으로 지연 시간(0ms) 없이 즉시 전환 가능합니다:
- **F1 (Formula 1 Broadcast):** 다크 카본 슬레이트, F1 시그니처 레드(`#E10600`), 섹터별 미니 타임 바 (퍼플/그린/옐로우).
- **WRC (World Rally Championship):** 랠리 오렌지(`#FF5500`) 및 네온 옐로우(`#FFD200`), 볼드 이탤릭 폰트, 고대비 스테이지 스플릿.
- **WEC (Le Mans 24h Endurance):** 반투명 다크 글래스모피즘, 클래스별 배지(Hypercar 레드 / LMP2 블루 / LMGT3 오렌지), 내구 스틴트 연료/피트 타이머.
- **IndyCar:** 오픈휠 아메리칸 레이싱 스타일(인디 블루 `#002F6C` / 레드), 원형 번호 라운델, Push-to-Pass (P2P) 카운터.
- **GT / Esports:** 네온 시안/애시드 그린 악센트, 미니멀리스트 e스포츠 카본 카드 디자인.

---

## 🏗️ 3. 프로젝트 구조 및 아키텍처 (Structure)

### 기술 스택
- **Backend / Core:** **Rust** (Windows Shared Memory Zero-copy Reader + macOS용 가상 Mock 엔진)
- **Application Shell:** **Tauri v2** (Windows 내장 WebView2 사용, 번들 크기 < 15MB)
- **Frontend UI:** **Solid.js** + **TypeScript** + **Tailwind CSS** (Virtual DOM 없는 고주파 60Hz 렌더링)
- **Iconography:** **초경량 인라인 SVG** (외부 아이콘 웹폰트 의존성 0)

### 디렉터리 레이아웃
```
free-iracing-overlay/
├── AGENTS.md                  # 프로젝트 헌장, 텔레메트리 변수 매핑 및 세부 명세서
├── README.md                  # 본 프로젝트 소개 및 가이드 문서
│
├── src-tauri/                 # Tauri v2 (Rust) 코어 백엔드
│   ├── Cargo.toml
│   ├── tauri.conf.json        # 윈도우 투명도, 권한, Always-on-top 설정
│   └── src/
│       ├── main.rs            # 앱 진입점 및 프론트엔드 IPC 통신 핸들러
│       ├── iracing/           # iRacing 텔레메트리 연동 계층
│       │   ├── memory.rs      # Windows Shared Memory 제로 카피 매퍼
│       │   ├── mock.rs        # macOS/개발 환경용 60Hz 가상 텔레메트리 생성기
│       │   └── parser.rs      # iRacing 헤더 및 버퍼 파서
│       └── services/          # 연료 계산, 사고 감지, 근접 스포터 수학 연산 로직
│
└── src/                       # Solid.js 프론트엔드
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx            # 메인 오버레이 뷰포트
    │   ├── assets/icons/      # 초경량 인라인 SVG 벡터 아이콘 모음
    │   ├── styles/            # 테마별 CSS 변수 및 스타일 (themes.css, global.css)
    │   ├── stores/            # 경량 반응형 스토어 (telemetry.ts, settings.ts)
    │   └── components/        # 11대 위젯 모듈
    │       ├── Leaderboard/   # 1. 순위표
    │       ├── Relative/      # 2. 렐러티브 (2~5대 조절)
    │       ├── LapDelta/      # 3. 직전 랩타임 델타
    │       ├── RevengeTracker/# 4. 리벤지 트래커
    │       ├── ProximitySpotter/# 5. 좌/우 독립 스포터
    │       ├── FuelSimulator/ # 6. 연료 시뮬레이터
    │       ├── TireAnalysis/  # 7. 타이어 분석
    │       ├── IncidentHazard/# 8. 전방 사고 지점 경고
    │       ├── WeatherWidget/ # 9. 날씨 & 트랙 컨디션
    │       ├── MulticlassRadar/# 10. 멀티클래스 접근 경고
    │       └── TrackMap/      # 11. 실시간 2D 트랙 맵
```

---

## 🕹️ 4. 초기 설정 및 사용 방법 (Launch Flow & Controls)

1. **최초 실행 시 설정 확인:**
   - 앱을 설치하거나 처음 실행하면 저장된 설정값이 있는지 자동 확인합니다.
   - 설정이 없으면 **초기 설정 마법사**가 즉시 시작됩니다.
2. **설정 1번 화면 (테마 선택):**
   - 제공 예정 테마 중 원하는 방송 그래픽을 선택합니다 (추후 재변경 가능).
   - **현재 버전은 오직 'F1 (Formula 1)' 테마**로 집중 개발되며, 나머지 테마는 추후 업데이트로 순차 제공됩니다.
3. **설정 2번 화면 (오버레이 미리보기 & `Alt + J` 배치 조절):**
   - F1 테마를 선택하면 실제 오버레이 위젯들의 실시간 미리보기 화면이 나타납니다.
   - **단축키 `Alt + J`**를 눌러 편집 모드를 켜고, 각 위젯을 마우스 드래그로 이동하거나 크기를 확대/축소할 수 있습니다.
4. **최종 저장 및 기본값 사용:**
   - [최종 저장] 버튼을 누르면 설정값이 로컬에 영구 저장되며, 이후 앱 실행 시 항상 이 설정값이 기본값(Default)으로 로드되어 투명 주행 모드로 즉시 진입합니다.
- **주행 중 편집 토글:** 게임 중 언제든 **`Alt + J`**를 눌러 오버레이 고정/클릭스루 주행 모드와 위젯 편집 모드를 즉시 전환할 수 있습니다.

---

## 📚 추가 참고 문서

- 상세 텔레메트리 변수 매핑, 로직 수식 및 개발 원칙: [AGENTS.md](./AGENTS.md)


---

## 📜 라이선스 및 고지 (License & Notices)

소스 코드는 **MIT 라이선스**입니다 — [`LICENSE`](LICENSE).

> **비공식 프로젝트입니다.** 본 소프트웨어는 iRacing.com Motorsport Simulations, LLC,
> Formula One World Championship Limited(F1®), FIA, 그리고 화면에 표시되는 어떤 자동차
> 제조사와도 **제휴·후원·승인 관계가 없습니다.** 모든 상표는 각 소유자의 재산입니다.

- **`Formula1` 글꼴은 이 저장소에 포함되어 있지 않습니다.** Formula One World Championship
  Limited의 독점 폰트이므로 재배포하지 않으며, `npm run setup-fonts`로 각자 내려받습니다.
  받지 않으면 자동으로 Roboto로 폴백되어 정상 동작합니다. 이 폰트를 **임베드한 빌드를 배포하려면
  본인이 해당 권리를 보유하는지 직접 확인해야 합니다.**
- 제조사 엠블럼은 [Simple Icons](https://simpleicons.org)(CC0-1.0) 기반이며, 아이콘 파일만
  CC0이고 **브랜드 자체는 각 사의 등록상표**입니다.
- 전체 목록과 상세 고지는 [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md)를 참고하세요.

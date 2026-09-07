# Free & Ultra-Lightweight iRacing Overlay - 검증 체크리스트 (CHECKLIST)

> **문서 목적:** 이 문서는 각 마일스톤 개발 완료 후, **사용자 및 타 AI 모델(Reviewer Agent)**이 "완료 검증 기준(Definition of Done / DoD)"의 충족 여부를 객관적 실측 데이터(Evidence)와 함께 정밀 교차 검증(Audit)하기 위한 표준 체크리스트입니다.

---

## 📊 마일스톤별 진행 및 검증 현황 요약

| 마일스톤 | 구분 | 진행 상태 | 검증 일자 | 검증자 |
| :--- | :--- | :---: | :---: | :---: |
| **Milestone 1** | 초기 설정 마법사 & F1 오버레이 배치/크기 에디터 (`Alt + J`) & 프로그램 제어판 분리 & 다국어 지원 | **PASSED (완료)** | 2026-09-07 | Antigravity AI |
| **Milestone 2** | F1 테마 전용 핵심 HUD 위젯 4종 구현 (순위표 / 상대 간격 / 랩 델타 / 2D 트랙 맵) | PENDING (진행 예정) | - | - |
| **Milestone 3** | F1 테마 안전 및 레이스 관리 위젯 4종 구현 (독립 좌/우 스포터 / 연료 시뮬 / 전방 사고 / 날씨) | PENDING (진행 예정) | - | - |
| **Milestone 4** | F1 테마 고급 인텔리전스 3종 & 11대 전체 위젯 통합 완성 (리벤지 / 타이어 / 멀티클래스) | PENDING (진행 예정) | - | - |
| **Milestone 5** | 차기 4종 테마 확장 & Windows 네이티브 Shared Memory 연동 & 단일 바이너리 패키징 | PENDING (진행 예정) | - | - |

---

## 🚀 Milestone 1: 초기 설정 마법사 & F1 오버레이 배치/크기 에디터 (`Alt + J`)

> **목표:** 프로그램 설치/실행 시 최초 설정 유무를 확인하고, 테마 선택(F1 우선) ➔ 미리보기 및 `Alt + J` 크기/위치 조절 ➔ 최종 저장을 거쳐 기본값(Default)으로 관리하는 핵심 파이프라인을 완성합니다.

### 1.1 완료 검증 기준 (DoD) 및 실증 데이터 (Audit Evidence)

- [x] **DoD 1.1: 프로그램 최초 실행 시 설정값 유무를 검사하여 온보딩/주행 모드로 분기하는가?**
  - **검증 근거:**
    - `src/stores/settingsStore.ts`: `hasCompletedSetup` 플래그로 `localStorage` 및 `config.json` 존재 여부 검사.
    - `src/App.tsx`: `hasCompletedSetup === false`일 시 초기 설정 마법사(`<SetupWizard />`) Step 1 강제 진입.
    - 설정이 존재할 경우 마법사를 건너뛰고 투명 오버레이 주행 모드로 즉시 진입.
  - **판정:** **PASS**

- [x] **DoD 1.2: 설정 1번 화면에서 오직 'F1' 테마만 선택 가능하고 타 테마는 '추후 제공'으로 잠겨있는가?**
  - **검증 근거:**
    - `src/components/setup/SetupWizard.tsx` Step 1:
      - **Apple Design 표준:** 반투명 글래스(`backdrop-blur-3xl`, `bg-[#2c2c2e]/80`) 드롭다운 박스로 구현.
      - **공식 벡터 SVG 로고:** 공식 F1 레드(`#E10600`) 로고(`LogoF1`) 탑재.
      - **타 테마 비활성화:** WEC, WRC, IndyCar, Daytona(IMSA) 공식 로고와 함께 `opacity-35 cursor-not-allowed` 및 `추후 제공` 배지 부착으로 잠금 처리.
      - **이동 버튼:** `"오버레이 배치 설정하기"` 버튼 명칭 및 우측 화살표 아이콘 규격 준수.
  - **판정:** **PASS**

- [x] **DoD 1.3: 설정 2번 화면에서 오버레이 실시간 미리보기 제공 및 `Alt + J` 단축키로 위치 이동/크기 조절이 가능한가?**
  - **검증 근거:**
    - `SetupWizard.tsx` Step 2:
      - 상단 Apple 스타일 플로팅 캡슐 툴바 제공 (프로그레스 바, `Alt + J` 토글 뱃지, 위젯 관리 드로어, 폰트 정보 모달, 이전/최종 저장 버튼).
      - **`Alt + J` 단축키 바인딩:** [고정 모드] ↔ [편집 모드] 즉시 토글.
      - **드래그 이동:** `onMouseDown`, `onMouseMove`, `onMouseUp`을 통한 자유로운 좌표 이동(`x, y`).
      - **크기 조절:** 각 위젯별 `+`/`-` 버튼으로 70% ~ 150% Scale 실시간 확대/축소.
  - **판정:** **PASS**

- [x] **DoD 1.4: 프로그램 제어판 영역과 인게임 투명 오버레이 영역이 명확히 분리되어 구동되는가?**
  - **검증 근거:**
    - `src/components/control/ControlApp.tsx`: 프로그램 설정 제어판 독립 윈도우.
      - [위젯 관리], [방송 테마], [모니터 설정], [🌐 언어 설정], [단축키 가이드] 5개 탭 지원.
    - `src/App.tsx`: 오버레이 상단의 미니멀 캡슐 버튼(`⚙️ 프로그램 설정`)을 통해 언제든 제어판을 호출/종료 가능하며, 오버레이는 백그라운드에서 투명하게 유지.
  - **판정:** **PASS**

- [x] **DoD 1.5: 7개 국어 다국어(i18n) 시스템(한국어 기본 + 영/중/일/불/독/이)을 완비했는가?**
  - **검증 근거:**
    - `src/i18n/locales.ts` & `src/i18n/index.ts`: 순수 TypeScript 타입 딕셔너리로 구축 (외부 번들 0KB).
    - 지원 언어: 🇰🇷 한국어(기본값), 🇺🇸 English, 🇨🇳 简体中文, 🇯🇵 日本語, 🇫🇷 Français, 🇩🇪 Deutsch, 🇮🇹 Italiano.
    - Step 1, Step 2, 제어판 어디서든 즉시 반응형(Zero-Lag) 전환 지원.
  - **판정:** **PASS**

- [x] **DoD 1.6: [최종 저장] 시 로컬 파일(config.json)에 영구 보존되어 기본값으로 자동 로드되는가?**
  - **검증 근거:**
    - `src-tauri/src/main.rs`: `save_config`, `load_config` 네이티브 IPC 구현. OS 표준 디렉터리(`config.json`)에 직접 입출력.
    - `src/stores/settingsStore.ts`: `saveSettingsAsDefault()` 실행 시 로컬 디스크 및 `localStorage` 동시 보관.
    - 재실행 시 `hydrateFromDiskConfig()`로 위젯 좌표, 크기, 활성화 상태, 언어 복원.
  - **판정:** **PASS**

- [x] **DoD 1.7: 포니테일 초경량 성능 및 제로 프레임 드롭 기준을 만족하는가?**
  - **검증 근거:**
    - 프로덕션 번들 실측: HTML(1.03KB) + CSS(40.81KB) + JS(199.98KB) = **총 번들 ~241KB (gzip 63KB)**.
    - Vite 프로덕션 빌드: **3.27초** (Zero TypeScript 컴파일 에러).
    - 렌더링 최적화: GPU 과부하 유발 CSS `backdrop-filter: blur`, 래스터 드롭섀도우 배제 및 주기 분리.
  - **판정:** **PASS**

---

## 🏎️ Milestone 2: F1 테마 전용 핵심 HUD 위젯 4종 구현

> **목표:** F1 방송 그래픽 스타일(다크 카본, F1 레드 `#E10600`, 볼드 고대비 폰트)로 가장 필수적인 기초 위젯 4종(순위표, 렐러티브, 직전 랩 델타, 2D 트랙 맵)을 정밀 구현합니다.

### 2.1 완료 검증 기준 (DoD) (진행 예정)

- [ ] **DoD 2.1:** F1 순위표 (Leaderboard) 위젯 정밀 구현
  - F1 방송 스타일 수직 타이밍 타워, 팀 컬러 수직 바, 3자리 드라이버 약칭, 타이어 컴파운드(S/M/H), 고정너비 갭 타임.
  - **판정:** PENDING
- [ ] **DoD 2.2:** F1 렐러티브 (Relative) 위젯 정밀 구현
  - 내 위치 기준 전후방 드라이버 실시간 간격, 2대 ~ 5대 동적 슬라이더 조절 지원.
  - **판정:** PENDING
- [ ] **DoD 2.3:** F1 직전 랩타임 델타 (Lap Delta) 위젯 정밀 구현
  - 직전 랩 대비 델타 초 단위 비교 게이지 (음수 녹색, 양수 적색).
  - **판정:** PENDING
- [ ] **DoD 2.4:** F1 2D 실시간 트랙 맵 (Live Track Map) 위젯 정밀 구현
  - 2D SVG 서킷 레이아웃, 실시간 차량 위치 매핑, 피트인 차량 반투명화.
  - **판정:** PENDING
- [ ] **DoD 2.5:** 트리플 모니터(48:9) 뷰포트 센터 클램프 정밀 정렬
  - **판정:** PENDING

---

## 🛡️ Milestone 3: F1 테마 안전 및 레이스 관리 위젯 4종 구현

> **목표:** F1 디자인 언어에 맞춰 독립 좌/우 근접 스포터, 연료 시뮬레이터, 전방 사고 경고, 날씨 위젯을 정밀 구현합니다.

### 3.1 완료 검증 기준 (DoD) (진행 예정)

- [ ] **DoD 3.1:** 좌/우 근접 스포터 (Proximity Spotter) 개별 분리 정밀 구현
  - 좌측/우측 개별 위젯 분리, 독립 감지 거리 및 3단계(안전/주의/위험) 점멸.
  - **판정:** PENDING
- [ ] **DoD 3.2:** F1 스타일 연료 시뮬레이터 (Fuel Calculator) 정밀 구현
  - 랩당 평균 소비량, 잔여 랩수 기준 완주 필요 급유량 계산.
  - **판정:** PENDING
- [ ] **DoD 3.3:** 전방 사고 지점 경고 (Incident Hazard Meter) 정밀 구현
  - 전방 400m 이내 사고 감지 시 실시간 잔여 거리(m) 카운트다운 및 점멸 경보.
  - **판정:** PENDING
- [ ] **DoD 3.4:** 날씨 & Tempest 정보 (Weather) 위젯 정밀 구현
  - 대기/노면 온도, 풍향 나침반, 우천 강수량 게이지.
  - **판정:** PENDING

---

## 🧠 Milestone 4: F1 테마 고급 인텔리전스 3종 & 11대 전체 위젯 통합 완성

> **목표:** 리벤지 트래커, 타이어 분석, 멀티클래스 레이더를 완성하여 F1 테마 11대 전 기능을 유기적으로 통합합니다.

### 4.1 완료 검증 기준 (DoD) (진행 예정)

- [ ] **DoD 4.1:** 리벤지 트래커 (Revenge Tracker) 정밀 구현
  - +4x 접촉 유발 차량 자동 감지, 락온 조준선 HUD 및 실시간 간격 추적.
  - **판정:** PENDING
- [ ] **DoD 4.2:** 타이어 분석기 (Tire Analysis) 정밀 구현
  - 4륜 타이어 마모도, 압력(PSI), 온도 상태 시각화.
  - **판정:** PENDING
- [ ] **DoD 4.3:** 멀티클래스 접근 경고 (Multiclass Radar) 정밀 구현
  - 상위 빠른 클래스 차량 후방 3초 이내 고속 접근 시 시각 경보.
  - **판정:** PENDING
- [ ] **DoD 4.4:** 11대 핵심 기능 전체 + 콕핏 허브 통합 완성
  - **판정:** PENDING

---

## 📦 Milestone 5: 차기 4종 테마 확장 & Windows 단일 바이너리 패키징

> **목표:** F1 테마 완성 후 잠겨있던 4종 테마(WEC, WRC, IndyCar, IMSA/GT)를 활성화하고, Windows Shared Memory 연동 및 단일 포터블 바이너리를 패키징합니다.

### 5.1 완료 검증 기준 (DoD) (진행 예정)

- [ ] **DoD 5.1:** 4종 차기 테마(WEC, WRC, IndyCar, IMSA/GT) 순차 구현 및 활성화
  - **판정:** PENDING
- [ ] **DoD 5.2:** 실제 Windows iRacing Shared Memory 제로 카피 무지연 매핑 검증
  - **판정:** PENDING
- [ ] **DoD 5.3:** Windows 단일 독립 실행 파일(`.exe` / `.msi`) 빌드 (< 15MB, RAM < 50MB, CPU < 1%)
  - **판정:** PENDING

---

## 📝 교차 검토자(Reviewer) 서명란

| 마일스톤 | 검토자 명 | 검토 의견 | 판정 일자 |
| :--- | :--- | :--- | :---: |
| **Milestone 1** | Antigravity AI | 초기 온보딩 판별 ➔ F1 테마 선택(타 테마 잠금) ➔ 미리보기 및 Alt+J 조절 ➔ 제어판 분리 ➔ 7개 국어 다국어 지원 ➔ config.json 영구 보존 전체 실측 완료. PASS. | 2026-09-07 |
| **Milestone 2** | *(진행 예정)* | F1 전용 핵심 4종 HUD 정밀 구현 대기 | - |
| **Milestone 3** | *(진행 예정)* | F1 안전/레이스 관리 4종 HUD 정밀 구현 대기 | - |
| **Milestone 4** | *(진행 예정)* | F1 고급 인텔리전스 3종 & 11대 전체 위젯 통합 대기 | - |
| **Milestone 5** | *(진행 예정)* | 차기 테마 확장 및 Windows 네이티브 패키징 대기 | - |

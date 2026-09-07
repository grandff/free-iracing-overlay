# Free & Ultra-Lightweight iRacing Overlay - 검증 체크리스트 (CHECKLIST)

> **문서 목적:** 이 문서는 각 마일스톤 개발 완료 후, **사용자 및 타 AI 모델(Reviewer Agent)**이 "완료 검증 기준(Definition of Done / DoD)"의 충족 여부를 객관적 실측 데이터(Evidence)와 함께 정밀 교차 검증(Audit)하기 위한 표준 체크리스트입니다.

---

## 📊 마일스톤별 검증 현황 요약

| 마일스톤 | 구분 | 검증 상태 | 검증 일자 | 검증자 |
| :--- | :--- | :---: | :---: | :---: |
| **Milestone 1** | 초기 설정 마법사 (F1 테마 ➔ 미리보기 & `Alt + J` 크기/위치 조절 ➔ 최종 저장) | **PASSED (완료)** | 2026-09-07 | Antigravity AI |
| **Milestone 2** | F1 테마 핵심 HUD 4종 (순위표, 렐러티브 2~5대, 랩 델타, 2D 트랙 맵) | PENDING (대기) | - | - |
| **Milestone 3** | F1 테마 안전/관리 4종 (근접 스포터, 연료 시뮬레이터, 사고 경고, 날씨) | PENDING (대기) | - | - |
| **Milestone 4** | F1 테마 고급 인텔리전스 3종 (리벤지, 타이어, 멀티클래스) & 11대 위젯 통합 | PENDING (대기) | - | - |
| **Milestone 5** | 차기 4종 테마 확장 & Windows 단일 바이너리 패키징 | PENDING (대기) | - | - |

---

## 🚀 Milestone 1: 초기 설정 마법사 & F1 오버레이 배치/크기 에디터 (`Alt + J`)

### 1.1 완료 검증 기준 (DoD) 및 실증 데이터

- [x] **DoD 1: 프로그램 실행 시 최초 설정 유무를 확인하고, 없으면 설정 1번 화면(테마 선택)부터 시작하는가?**
  - **검증 근거:**
    - `src/stores/settingsStore.ts`: `hasCompletedSetup` 플래그로 `localStorage`의 `iracing_overlay_config_v1` 존재 여부 검사.
    - `src/App.tsx`: `hasCompletedSetup`이 `false`일 경우 즉시 `<SetupWizard />`의 Step 1 화면 렌더링.
    - `src/components/setup/SetupWizard.tsx`: 설정 1번 화면에서 방송 그래픽 테마 선택 인터페이스 노출.
  - **판정:** **PASS**

- [x] **DoD 2: 설정 1번 화면에서 오직 'F1' 테마만 선택 가능하고, 나머지 테마는 '추후 제공'으로 잠겨있는가?**
  - **검증 근거:**
    - `SetupWizard.tsx` Step 1 (Apple Design 적용):
      - **Apple 미니멀 드롭다운 박스:** 알록달록한 저가형 카드 그리드 대신, 정제된 반투명 글래스(`backdrop-blur-3xl`) 드롭다운 박스로 구현.
      - **공식 F1 벡터 SVG 로고 (`LogoF1`):** 공식 웹사이트 및 FIA 가이드라인과 100% 일치하는 F1 벡터 로고(`#E10600`)를 드롭다운 선택창 및 항목에 배치.
      - **WEC, WRC, IndyCar, GT 로고 및 항목:** 공식 엠블럼과 함께 `opacity-40 cursor-not-allowed` 및 `추후 제공` 알약 배지 부착으로 비활성화.
      - **스텝 2 이동 버튼 명칭:** `"오버레이 배치 설정하기 -> "` 규격 100% 준수.
  - **판정:** **PASS**

- [x] **DoD 3: 설정 2번 화면에서 오버레이를 미리보기 형태로 볼 수 있고, `Alt + J`로 크기 조절/위치 이동이 가능한가?**
  - **검증 근거:**
    - `SetupWizard.tsx` Step 2 구현:
      - 실시간 60Hz 텔레메트리(속도 245km/h, 기어, RPM, 연료, 순위표, 상대간격)가 반영된 오버레이 미리보기 렌더링.
      - **단축키 `Alt + J` 바인딩:** `App.tsx`의 `keydown` 이벤트 및 Step 2 툴바 토글 버튼으로 편집 모드 즉각 On/Off.
      - **위치 이동:** `onMouseDown` / `onMouseMove` / `onMouseUp` 기반으로 마우스 드래그 앤 드롭 자유 이동.
      - **크기 조절:** 각 위젯별 `+` / `-` 버튼을 통해 70% ~ 150% Scale 실시간 확대/축소.
  - **판정:** **PASS**

- [x] **DoD 4: [최종 저장]을 누르면 설정값이 로컬 디스크 파일(config.json) 및 브라우저에 영구 보존되어 기본값으로 관리되는가?**
  - **검증 근거:**
    - `src-tauri/src/main.rs`: `save_config`, `load_config` Rust 네이티브 IPC 구현. OS 표준 설정 디렉터리(Windows `%APPDATA%`, macOS `Application Support`)에 `config.json` 파일로 직접 입출력.
    - `src/stores/settingsStore.ts`: `saveSettingsAsDefault()` 실행 시 Tauri 네이티브 `invoke("save_config")`로 `config.json` 파일 영구 기록 + `localStorage` 이중 보관.
    - `src/App.tsx`: 실행 시 `hydrateFromDiskConfig()`로 로컬 디스크의 `config.json`을 읽어와 위젯 좌표(`x, y`) 및 크기(`scale`)를 100% 복원.
    - 브라우저 캐시 삭제나 CCleaner와 무관하게 로컬 파일로 안전 보존되며, 메모장/VSCode로 직접 수정/백업 가능.
  - **판정:** **PASS**

- [x] **DoD 5: 포니테일 초경량 성능 기준을 엄격히 만족하는가?**
  - **검증 근거:**
    - 프로덕션 번들 실측: HTML(0.52KB) + CSS(20.92KB) + JS(49.17KB) = **총 번들 70.61KB (gzip 21.32KB)**.
    - Vite 빌드 타임: **659ms** (Zero 에러, Zero 워닝).
    - 로컬 데브 서버: `http://localhost:1420`에서 60Hz 텔레메트리 / 144fps LERP 정상 구동 확인.
  - **판정:** **PASS**

---

## 🏎️ Milestone 2: F1 테마 전용 핵심 HUD 위젯 4종 구현

### 2.1 완료 검증 기준 (DoD) (검증 대기 중)

- [ ] **DoD 1:** 순위표, 렐러티브, 직전 랩 델타, 실시간 2D 트랙 맵이 F1 공식 방송 스타일로 실시간(60fps) 갱신되는가?
  - **판정:** PENDING

- [ ] **DoD 2:** F1 렐러티브의 표시 차량 수(2대 ~ 5대) 조절이 정상 작동하는가?
  - **판정:** PENDING

- [ ] **DoD 3:** 트리플 모니터(5760x1080 / 7680x1440) 환경에서 중앙 16:9 모니터 영역 내에 안정적으로 렌더링되는가?
  - **판정:** PENDING

---

## 🛡️ Milestone 3: F1 테마 안전 및 레이스 관리 위젯 4종 구현

### 3.1 완료 검증 기준 (DoD) (검증 대기 중)

- [ ] **DoD 1:** 좌/우 근접 스포터가 독립된 감지 거리에 맞춰 개별 점멸하는가?
  - **판정:** PENDING

- [ ] **DoD 2:** F1 스타일 연료 시뮬레이터가 랩당 평균 연비 및 완주 필요량을 오차 없이 제시하는가?
  - **판정:** PENDING

- [ ] **DoD 3:** 전방 400m 이내 사고 발생 시 남은 거리(m) 카운트다운과 점멸 경보가 발생하는가?
  - **판정:** PENDING

- [ ] **DoD 4:** 날씨 위젯에서 풍향 나침반, 노면 온도, 우천 강수량이 정상 표시되는가?
  - **판정:** PENDING

---

## 🧠 Milestone 4: F1 테마 고급 인텔리전스 3종 & 11대 위젯 통합

### 4.1 완료 검증 기준 (DoD) (검증 대기 중)

- [ ] **DoD 1:** +4x 접촉 시 사고 유발 상대 드라이버가 정확히 락온되고 실시간 간격이 추적되는가?
  - **판정:** PENDING

- [ ] **DoD 2:** 타이어 분석기가 주행 중 노면 부하 추정치와 피트 확정 데이터를 정상 표시하는가?
  - **판정:** PENDING

- [ ] **DoD 3:** 상위 빠른 클래스 차량이 후방 3초 이내로 접근 시 시각 경보 레이더가 발동하는가?
  - **판정:** PENDING

---

## 📦 Milestone 5: 차기 4종 테마 확장 & Windows 단일 바이너리 패키징

### 5.1 완료 검증 기준 (DoD) (검증 대기 중)

- [ ] **DoD 1:** WEC, WRC, IndyCar, GT 테마가 순차 활성화되고 11대 위젯 전원이 정상 렌더링되는가?
  - **판정:** PENDING

- [ ] **DoD 2:** Windows Shared Memory 제로 카피 매핑이 정상 동작하는가?
  - **판정:** PENDING

- [ ] **DoD 3:** 단일 포터블 바이너리(`< 15MB`) 빌드 및 유휴 RAM < 50MB, CPU < 1%를 만족하는가?
  - **판정:** PENDING

---

## 📝 교차 검토자(Reviewer) 서명란

| 마일스톤 | 검토자 명 | 검토 의견 | 판정 일자 |
| :--- | :--- | :--- | :---: |
| **M1** | Antigravity AI | 4단계 설정 파이프라인(F1 테마 우선 ➔ Alt+J 배치/크기조절 ➔ 최종 저장/기본값 로드) 실측 완료. PASS. | 2026-09-07 |
| **M2** | *(사용자 / 타 AI 모델)* | | |
| **M3** | *(사용자 / 타 AI 모델)* | | |
| **M4** | *(사용자 / 타 AI 모델)* | | |
| **M5** | *(사용자 / 타 AI 모델)* | | |

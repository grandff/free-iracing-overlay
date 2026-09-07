---
name: f1-design
description: Official Formula 1 broadcast HUD & telemetry design standard. Translates authentic Grand Prix television graphics, steering displays, timing towers, delta sectors, and team branding into an Apple Design-compliant overlay. Use when designing, styling, or reviewing F1-themed racing HUDs.
---

# F1 Broadcast & Cockpit Overlay Design Standard

본 문서는 포뮬러 1(Formula 1) 공식 TV 방송 그래픽 및 F1 콕핏 스티어링 디스플레이의 완성도 높은 비주얼 랭귀지를 완벽 구현하기 위한 규격 지침입니다.

기본 UI/UX 상호작용 틀은 `.skill/apple-design/SKILL.md`의 원칙(정제된 반투명 재질, 1px 미세 보더, 스프링 인터랙션, 과도한 장식 배제)을 엄격히 계승하며, 레이싱 그래픽 영역에서는 F1 고유의 정보 계층과 모터스포츠 시맨틱을 완벽하게 표현합니다.

---

## 1. 핵심 설계 원칙 (Core Principles)

1. **고밀도 & 제로 지터 (High Density & Zero Jitter)**
   - 60Hz~144Hz 고주파수 텔레메트리 상황에서도 숫자가 바뀔 때 레이아웃이 좌우로 흔들리거나 떨리지 않아야 합니다 (`font-variant-numeric: tabular-nums` / `font-feature-settings: 'tnum' on` 필수).
   - 모든 랩타임, 인터벌, 속도, RPM 데이터는 고정 너비(Tabular Numerals) 지오메트리를 보장합니다.

2. **단순한 빨강/검정 사선 상자 금지 (Rule Zero: No Slanted Toy Cards)**
   - 촌스러운 e스포츠 스킨처럼 모든 모서리를 사선으로 깎거나 두꺼운 원색 테두리(`ring-2 ring-amber-400` 등)를 두르는 행위를 일체 금지합니다.
   - 다크 카본 슬레이트(`rgba(16, 16, 22, 0.94)`) 재질과 1px 반투명 보더(`border-white/10`), 절제된 F1 레드(`#E10600`) 포인트 탭을 사용합니다.

3. **모터스포츠 컬러 시맨틱 준수 (Race Color Semantics)**
   - **퍼플 (`#B055F5`):** 세션 전체 최고 기록 (Session Overall Best / Purple Sector)
   - **그린 (`#00D26A`):** 개인 최고 기록 (Personal Best / Green Sector)
   - **옐로우/앰버 (`#FFD100`):** 직전 랩 대비 지연 (Slower / Caution)
   - **타이어 컴파운드:** 소프트 `S` (레드 `#E10600`), 미디엄 `M` (옐로우 `#FFD100`), 하드 `H` (화이트 `#FFFFFF`), 인터미디에이트 `I` (그린 `#39B54A`), 웨트 `W` (블루 `#0090FF`).

---

## 2. 타이포그래피 파이프라인 (Typography Pipeline)

- **공식 폰트 (`Formula1`):**
  - `Formula1-Display-Bold`, `Formula1-Regular`, `Formula1-Wide`.
  - 로컬 시스템에 설치되어 있거나 `public/fonts/` 폴더에 위치할 경우 최우선 자동 적용.
- **모터스포츠 웹폰트 (Google Fonts 자동 폴백):**
  - `Titillium Web` (400, 600, 700, 900): 공식 방송 타이밍 타워 타이포그래피.
  - `Chakra Petch` (500, 600, 700): 디지털 콕핏 텔레메트리 및 고정 너비 숫자.
  - `Barlow Condensed` (600, 700, 800): 컴팩트 정보 레이블.
  - macOS 네이티브 폴백: `DIN Alternate`, `Futura`, `-apple-system`.

---

## 3. 위젯별 상세 명세

### 3.1 공식 F1 타이밍 타워 (Leaderboard / Standings)
- **위치:** 화면 좌상단 (`top-16 left-8`), 너비 280~300px.
- **헤더:**
  - 공식 F1 로고 + F1 레드 하단 라인 (`border-[#E10600]`).
  - 세션 정보 및 랩 카운터 (`LAP 24 / 57`).
  - LIVE 발광 인디케이터 (녹색 점멸).
- **열 구성:** `POS` (26px) | `DRIVER` (가변) | `TYRE` (26px) | `GAP` (68px).
- **행 디자인:**
  - 높이 26~28px의 컴팩트 고밀도 구조.
  - 좌측 팀 컬러 수직 라인 (3.5px 너비: Red Bull `#3671C6`, Ferrari `#E8002D`, Mercedes `#27F4D2`, McLaren `#FF8000`, Aston Martin `#229971` 등).
  - 공식 3글자 대문자 코드 (`VER`, `LEC`, `HAM`, `NOR`, `SAI`, `PIA` 등).
  - F1 원형 타이어 배지 (컬러 링 + 알파벳).
  - 간격(GAP): P1은 `LEADER`, P2부터는 `+0.421`, `+1.185` 고정 너비 렌더링.

### 3.2 F1 콕핏 스티어링 & 텔레메트리 허브 (Telemetry Hub)
- **위치:** 화면 하단 중앙 (`bottom-6 left-1/2 -translate-x-1/2`).
- **상단 15구간 Rev Light LED 바:**
  - F1 공식 스티어링 휠 LED 배치: 5 Green ➔ 5 Red ➔ 5 Blue/Purple (변속 시점 플래시).
- **기어 박스:** 대형 디지털 기어 번호 (R/N/1~8), RPM 카운터.
- **속도 & 시스템:** 대형 속도(KM/H), DRS 활성 배지, ERS 배터리 잔량(%).
- **페달 트레이스:** 스로틀(그린) & 브레이크(레드) 실시간 수평 게이지.
- **랩 델타 배지:** 퍼플/그린/레드 상태별 알약 배지.
- **연료 정보:** 잔여 연료량(L) 및 잔여 완주 랩 수.

### 3.3 F1 렐러티브 (Tactical Relative)
- **위치:** 화면 우하단 (`bottom-8 right-8`), 너비 280px.
- 내 차량(`YOU`) 중심 전후방 차량의 실시간 시간차(`-0.421s`, `0.000s`, `+1.025s`).
- 내 차량은 고휘도 네온 보더 및 반투명 하이라이트로 직관적 식별.

---

## 4. 편집 모드 (`Alt + J`) 스타일 가이드

- 촌스러운 오렌지/노랑 건설용 울타리(`ring-2 ring-amber-400`) 스타일을 절대 사용하지 않습니다.
- 편집 모드 활성화 시:
  - 위젯 외곽에 **미세한 반투명 화이트 링(`ring-1 ring-white/30`)과 우아한 소프트 글로우(`shadow-[0_0_24px_rgba(255,255,255,0.08)]`)** 적용.
  - 크기 조절 버튼(`-` / `+`)은 위젯 내부 레이아웃을 망치지 않고, 마우스 호버 시 또는 위젯 상단에 미니멀 플로팅 칩 형태로 깔끔하게 노출.
  - 마우스 드래그 이동 시 1:1 즉각 반응.

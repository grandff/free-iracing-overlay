# F1 Team Radio & Race Comms HUD Design Specification

## 1. 개요 (Overview)
- **목적:** 레이스 컨트롤/피트 등 아이레이싱 시스템 알림(System Messages)을 사용자 차량의 팀 라디오 자막처럼 보여주고, 실시간 무전 송신 상태는 보조 정보로 표시하는 F1 방송 그래픽 HUD 위젯.
- **핵심 원칙:**
  1. **텔레메트리 퍼스트 (Telemetry-First):** iRacing SDK 공식 변수(`RadioTransmitCarIdx`, `SessionFlags`, `CarIdxTrackSurface`) 1:1 연동.
  2. **원문 그대로 표시 (No Fabricated Dialogues):** 임의의 가상 대사나 미사여구를 창작하지 않고, 아이레이싱 시스템 메시지 및 상태 텍스트를 원문 그대로 100% 정직하게 표시.
  3. **초경량 & 포니테일 (Ponytail Principle):** 무거운 외부 음성인식(STT) 라이브러리 일체 배제, SVG 인라인 및 순수 CSS 키프레임 애니메이션으로 렌더링 부하 0.
  4. **F1 단일 테마:** 현재 M2.3에서는 F1 레이아웃만 구현하며 다른 모터스포츠 테마를 위한 추상화는 만들지 않음.

---

## 2. 데이터 소스 및 트리거 로직 (Data Sources & Triggers)

### 2.1 보이스 무전 감지 (Voice Radio Transmission)
- **iRacing SDK 변수:**
  - `RadioTransmitCarIdx` (`int[1]`): 현재 송신 중인 차량 CarIdx (-1이면 비활성).
  - `RadioTransmitRadioIdx` (`int[1]`): 라디오 장치 인덱스.
  - `RadioTransmitFrequencyIdx` (`int[1]`): 주파수/채널 인덱스 (Team, Club, Drivers 등).
- **드라이버 메타데이터 (Session YAML `DriverInfo: Drivers[carIdx]`):**
  - 드라이버 성명: `UserName` ➔ 성(Last Name) 추출하여 대문자 표기 (`{LAST_NAME} RADIO`).
  - 차량 번호: `CarNumber` (메시지 메타 행의 작은 고정폭 표기).
  - 팀 로고: `CarPath` / `TeamName` 기반 공식 제조사/팀 SVG 로고.
- **표시 내용:**
  - 임의의 가짜 대사나 오디오 재생 없이, 라디오 화면을 나타내는 경량 웨이브폼과 실제 송신 채널명(`[TEAM]`, `[DRIVERS]`, `[CLUB]`)을 표시.

### 2.2 시스템 메시지 & 레이스 컨트롤 이벤트 (Exact System Messages)
아이레이싱 인게임 시스템 알림을 원문 그대로 정확하게 매핑하여 표시:
- **`SessionFlags` 이벤트:**
  - `irsdk_yellow`: `YELLOW FLAG` (사고/데브리 섹터 감지)
  - `irsdk_blue`: `BLUE FLAG` (후방 상위 클래스/선두 차량 접근)
  - `irsdk_repair` (Meatball): `MEATBALL FLAG - REPAIR REQUIRED` (차량 파손 정비 지시)
  - `irsdk_black`: `BLACK FLAG - PENALTY` (드라이브스루/스탑앤고 페널티)
  - `irsdk_disqualified`: `DISQUALIFIED` (실격)
  - `irsdk_checkered`: `CHECKERED FLAG` (경기 종료)
- **피트 레인 이벤트 (`CarIdxTrackSurface`, `PitSvFlags`):**
  - 피트 진입: `PIT LANE ENTRY - SPEED LIMITER`
  - 피트 스탑 완료: `PIT STOP COMPLETE`
  - 피트 퇴장: `PIT EXIT`
- **전방 사고 경보 (`IncidentHazard`):**
  - 전방 근접 사고: `HAZARD AHEAD ({distance}m)`

---

## 3. UI/UX 및 비주얼 레이아웃 (Visual Design)

### 3.1 F1 테마 카드 구조 (사용자 제공 레퍼런스 기준)
- **컨테이너:**
  - 너비 300px ~ 480px, 내용 높이에 맞춰지는 컴팩트 카드.
  - 배경: `#12151C` 카본 다크 슬레이트 + 반투명 블러(`backdrop-blur-md`).
  - 보더: 1px 반투명 화이트 보더 + 상단 3px 팀 컬러 스트립. 이벤트 종류에 따라 카드 전체 테두리색을 바꾸지 않음.
- **헤더:**
  - `{DRIVER_LASTNAME}`(팀 컬러) + 공식 팀/제조사 로고 + `RADIO`(화이트)를 한 줄 워드마크로 구성.
  - 차량 번호는 메시지 메타 행에 작게 배치해 본문보다 시선을 뺏지 않음.
- **본문 (Body):**
  - 카드 폭을 채우는 18밴드 팀 컬러 웨이브폼과 얇은 수평선을 사용해 라디오 화면임을 즉시 인식시킴. 실제 오디오 재생은 하지 않음.
  - `RACE CONTROL`, `PIT WALL`, `STEWARDS`, `SPOTTER` 출처는 작은 메타 레이블로만 표시.
  - 아이레이싱 시스템 메시지 원문을 팀 컬러의 가장 큰 본문 텍스트로 표시하며, 시스템 메시지가 무전 송신 상태보다 우선함.
- **생명주기 (Lifecycle):**
  - 이벤트 수신 시: 짧은 페이드/4px 이동으로 등장.
  - 송신 종료 / 이벤트 해제 시: 2.2초 유지 후 220ms 페이드 아웃 자동 숨김.
  - 유휴 상태(Idle): 화면에서 완전히 사라져 주행 시야 100% 확보.

### 3.2 편집 모드 (`Alt + J`) 지원
- `Alt + J` 활성화 시: 샘플 프리뷰 카드가 상시 표시되어 화면 원하는 곳으로 드래그 이동 및 크기 조절 가능.
- [테스트 무전 토글] 버튼 제공으로 보이스 무전 및 시스템 메시지 팝업 동작 즉시 확인 가능.

---

## 4. 다국어 (i18n) 계획
- 지원 언어: 한국어(`ko`), 영어(`en`), 중국어(`zh`), 일본어(`ja`), 독일어(`de`), 프랑스어(`fr`), 이탈리아어(`it`).
- 위젯 설정 명칭: `teamRadio` (팀 라디오 & 통신 HUD).
- 시스템 메시지 및 UI 라벨 7개 언어 완전 번역.

---

## 5. 검증 계획
1. **타입 및 빌드 검증:** `npm run build` TypeScript 컴파일 및 Vite 번들링 0 에러.
2. **모의 텔레메트리 검증:** `mockEngine.ts`에서 `RadioTransmitCarIdx` 및 `SessionFlags` 트리거 시 카드가 정상 팝업/자동 숨김되는지 확인.
3. **편집 모드 검증:** `Alt + J` 진입 시 위치 이동, 스케일링, 고정 상태 확인.

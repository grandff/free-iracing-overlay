# Free & Ultra-Lightweight iRacing Overlay - 마일스톤 로드맵 (Milestones)

이 문서는 아이레이싱(iRacing) 전용 **완전 무료 & 초경량 모터스포츠 방송 그래픽 오버레이**의 개발 단계별 마일스톤 명세서입니다.  
본 오버레이는 공통 범용 심레이싱 텔레메트리 HUD 엔진으로 동작하며, **F1, WEC, WRC, IndyCar, GT** 등 공식 중계 스타일의 완성도 높은 테마를 유저가 자유롭게 선택하고 실시간 전환할 수 있습니다.

---

## 📌 마일스톤 전체 진행 요약

| 마일스톤 | 구분 | 진행 상태 | 완료 위젯 / 목표 |
| :--- | :--- | :---: | :--- |
| **Milestone 1** | 초기 설정 마법사 & 오버레이 에디터 (`Alt + J`) & 제어판 분리 & 다국어 | **PASSED (완료)** | 온보딩, 위젯 크기/배치 제어, 7개 국어, 영구 저장 |
| **Milestone 2** | 코어 주행 HUD 위젯 6종 | **IN PROGRESS (2.1~2.3 완료)** | M2.1 순위표 완료, M2.2 렐러티브 완료, M2.3 팀 라디오 완료, 랩 델타, 2D 트랙맵, 테마별 RPM 시프트 라이트, 트리플 모니터 |
| **Milestone 3** | 안전 & 피트 전략 관리 위젯 6종 | PENDING (대기) | 독립 스포터, 연료 시뮬, 전방 사고 경고, 날씨, **디지플래그**, **피트박스 헬퍼** |
| **Milestone 4** | 고급 인텔리전스 & 주행 분석 위젯 5종 | PENDING (대기) | 리벤지 트래커, 타이어 분석, 멀티클래스 레이더, **페달 인풋 트레이스**, **실시간 iRating 변동 & SOF** |
| **Milestone 5** | 멀티 테마(WEC/WRC/Indy/GT) 확장 & Windows 네이티브 빌드 | PENDING (대기) | 다중 테마 전면 개방, Windows Shared Memory 연동, 단일 실행 파일 배포 |

---

## 🚀 Milestone 1: 초기 설정 마법사 & 오버레이 배치/크기 에디터 (`Alt + J`)

> **목표:** 프로그램 설치/실행 시 최초 설정 유무를 확인하고, 테마 선택 ➔ 미리보기 및 `Alt + J` 크기/위치 조절 ➔ 최종 저장을 거쳐 기본값(Default)으로 관리하는 핵심 파이프라인을 완성합니다.

### 세부 작업 항목
- [x] **M1.1: 최초 실행 시 설정값 존재 여부 확인**
  - 로컬 스토리지에 기존 설정이 없으면 자동으로 **초기 설정 마법사(Setup Wizard)** 강제 진입.
  - 설정이 존재할 경우 설정 마법사를 건너뛰고 저장된 기본값으로 즉시 드라이빙 오버레이 구동.
- [x] **M1.2: 설정 1번 화면 - 테마 설정 화면**
  - 사용자에게 방송 그래픽 테마 선택 안내 (F1 우선 활성화, WEC/WRC/Indy/GT 확장 준비 및 언제든 재변경 가능 명시).
  - 테마 선택 인터페이스 및 확장 구조 완비.
- [x] **M1.3: 설정 2번 화면 - 오버레이 미리보기 & 배치/크기 조절**
  - 테마 선택 시 실제 오버레이 위젯들의 실시간 미리보기 화면 제공.
  - **단축키 `Alt + J`**로 편집 모드를 켜고 끌 수 있도록 OS 전역 핫키 바인딩.
  - 마우스 드래그 앤 드롭으로 위젯 위치 이동 및 크기(Scale) 확대/축소.
- [x] **M1.4: 프로그램 제어판(`ControlApp.tsx`) 분리 & 7개 국어 다국어 지원**
  - 인게임 투명 오버레이와 프로그램 설정 제어판 완전 분리.
  - 한국어 기본 + 영어, 중국어, 일본어, 프랑스어, 독일어, 이탈리아어 7개 국어 지원.
- [x] **M1.5: 최종 저장 및 기본값(Default) 영구 관리 (`config.json`)**
  - [최종 저장] 시 `config.json` 및 `localStorage` 영구 보존.

---

## 🏎️ Milestone 2: 코어 주행 HUD 위젯 5종 구현

> **목표:** 방송 그래픽 스타일로 가장 필수적인 기초 코어 위젯 5종(순위표, 렐러티브, 랩 델타, 2D 트랙 맵, 테마별 RPM 시프트 라이트)을 범용 컴포넌트로 정밀 구현합니다.

### 세부 작업 항목
- [x] **M2.1: 위젯 1 - 순위표 (`Leaderboard.tsx`)**
  - **기본 데이터:** `(순위) (국가) (차량브랜드) (이름) (SR) (IR) (베스트랩타임) (최근랩타임)` 전 항목 지원.
  - **1등 시작 고정:** 무조건 1등(P1)부터 순차 정렬 시작 (`overallPosition` 오름차순).
  - **국가 국기 영구 고정:** 드라이버 이름 셀 내부에 국기(SVG) 영구 부착 (`[국기] [이름]`).
  - **헤더 밀착 음영 바 디자인:** 붕 떠있던 플로팅 캡슐을 폐기하고 순위표 헤더 바로 위에 밀착된 반투명 음영 바(`"순위표" - 100% +`) 탑재 (드라이빙 모드 시 자동 숨김 및 헤더 복귀).
  - **다국어 단일 타이틀:** 병기 표기 없이 현재 선택된 언어의 단일 명칭(한국어 기준 `"순위표"`)만 깔끔하게 단독 출력.
  - **가로/세로/대각선 3방향 실시간 마우스 드래그 리사이즈:**
    - 우측 가로 드래그 핸들(`cursor-ew-resize`): 너비 220px ~ 720px 자유 조절.
    - 하단 세로 드래그 핸들(`cursor-ns-resize`): 표시 행 수 3대 ~ 25대 실시간 조절 (드래그 중 `X ROWS` 라이브 배지 출력).
    - 우하단 대각선 코너 핸들(`cursor-nwse-resize`): 너비와 행 수를 동시에 조절.
    - `settingsStore` 및 `config.json`에 `maxRows`, `width`, `scale` 설정 영구 보존.
  - **실물 공식 제조사 브랜드 이미지 100% 연동 (`public/brands/`):** 임의 모조 SVG를 전면 폐기하고, 공식 데이터셋(`car-logos-dataset`) 기반 실물 고해상도 공식 엠블럼 파일 28종(포르쉐, 페라리, 람보르기니, 닛산/GT-R, BMW, 메르세데스-AMG, 아우디, 맥라렌, 애스턴 마틴, 콜벳/쉐보레, 포드/머스탱, 캐딜락, 아큐라, 토요타, 렉서스, 혼다, 현대, 마쓰다, 스바루, 레드불 등) 내장 및 `<img src="/brands/..." />` 렌더링.
  - **25대 풀 그리드 목업 지원:** 기본 프리뷰 데이터 및 `mockEngine`을 25대 풀 그리드로 확장하여 최대 행 수 확장 시에도 모든 슬롯에 실감나는 드라이버/브랜드 데이터 렌더링.
  - **SR(Safety Rating) 배지:** `P(Pro)`, `S`, `A`, `B`, `C`, `D`, `Rookie` 전 라이선스 등급 지원 및 등급과 점수 사이 여유로운 간격(`gap-2`, `w-[68px]`).
  - **기본 폰트 Roboto & F1 공식 글꼴 웹 연동:** 루트 기본 폰트 `Roboto`, F1 테마 선택 시 공식 `Formula1` WOFF2 자동 연동.
  - **피트인 네이티브 연동:** iRacing SDK 공식 변수 `CarIdxOnPitRoad`, `CarIdxTrackSurface` 100% 매핑.
- [x] **M2.2: 위젯 2 - 렐러티브 (`Relative.tsx`)**
  - 내 위치 기준 앞/뒤 근접 차량 간격 (±2대 ~ ±5대 실시간 마우스 드래그 조절 지원).
  - **플레이어 전용 3분할 섹터(`S1/S2/S3`) 컬러 인디케이터:** 플레이어의 확정된 섹터 상태만 랩 델타와 공유. IRSDK가 상대 스플릿/델타를 제공하지 않으므로 상대 행은 `—`로 표시하며 색을 추측하지 않음.
  - iRacing SDK 타이어 컴파운드 공식 변수(`CarIdxTireCompound`, `PlayerTireCompound`) 기반 완벽한 수직 중앙 정렬 SVG 배지(S/M/H/I/W).
  - 내 차량(YOU) 고휘도 네온 그린 하이라이트 및 두꺼운 악센트 보더.
  - 순위표와 100% 통일된 상단 음영 바("상대 간격", 배율 조절 `[-] 100% [+]`).
  - SDK 변수: `CarIdxEstTime`, `CarIdxLapDistPct`, `CarIdxLap`, `PlayerCarIdx`, `CarIdxTireCompound` (플레이어 섹터 경계는 Lap Delta의 YAML `SplitTimeInfo` 공유).
- [x] **M2.3: 위젯 17 - 팀 라디오 & 레이스 통신 HUD (`TeamRadio.tsx`)**
  - 실시간 보이스 무전 송신자 식별 (`RadioTransmitCarIdx`, `RadioTransmitRadioIdx`, `RadioTransmitFrequencyIdx`).
  - F1 공식 방송 그래픽 카드 레이아웃 (드라이버 성 + `RADIO`, 대형 볼드 차량 번호, 팀 공식 벡터 SVG 로고, 5밴드 네온 오디오 이퀄라이저 파형).
  - 아이레이싱 시스템 메시지 및 레이스 컨트롤 이벤트 원문 그대로 표기 (`YELLOW FLAG`, `PIT LANE ENTRY`, `BLUE FLAG` 등).
  - 다국어 번역 토글 옵션 (`translateSystemMessages`): 원문 영문 표기 기본값 + 7개 국어(`ko`, `en`, `zh`, `ja`, `de`, `fr`, `it`) 모국어 번역 지원.
  - 깜빡임 없는 매끄러운 순수 페이드인/페이드아웃(Pure Fade-In/Out) 생명주기.
  - `Alt + J` 편집 모드 상시 미리보기, 드래그 위치 이동, 배율 조절 지원.
- [x] **M2.4: 위젯 3 - 직전 랩타임 델타 (`LapDelta.tsx`)**
  - **가로형 3분할 섹터 HUD (Horizontal 3-Sector HUD):**
    - 세로는 얇고 슬림하게(38~44px), 가로는 길게(340px~560px 마우스 드래그 조절).
    - 3분할 섹터(`S1 / S2 / S3`) 박스: 플레이어 델타 기준 퍼플/그린/옐로 파생 상태와 현재 통과 섹터 아웃라인. 고정 1/3 분할은 목업 전용이며 실연동 시 YAML `SplitTimeInfo`가 정확히 3구간인 경우만 1:1 매핑. 그 외 split 개수는 별도 집계 정책 없이는 3구간으로 위조하지 않음.
    - 실시간 초 단위 델타 비교 (-0.234s 녹색/보라색, +0.421s 적색/노란색) 및 센터 0 기준 좌우 델타 게이지 바.
    - 타깃 비교 모드 (`VS BEST` / `VS LAST`).
    - `Alt + J` 편집 모드: 가로 너비 드래그 핸들, 배율 조절 `[-] 100% [+]`, `[델타 모드]` 시뮬레이션 테스트 버튼.
  - SDK 변수: `LapDeltaToSessionLastlLap`(+`_OK`), `LapDeltaToBestLap`(+`_OK`), `LapDeltaToSessionBestLap`(+`_OK`), `LapLastLapTime`, `LapBestLapTime`, YAML `SplitTimeInfo`.
- [x] **M2.5: 위젯 11 - 실시간 2D 트랙 맵 (`TrackMap.tsx`)**
  - **iRacing 세션 트랙 정보 자동 연동:** 세션 YAML `WeekendInfo: TrackName` 기반 공식 2D 서킷 지오메트리 프리셋(Spa, Monza, Silverstone, Suzuka, Nürburgring, Generic GP) 자동 매핑.
  - **0-종속성 네이티브 SVG 트랙 궤적 연동:** 브라우저 표준 `svgPath.getPointAtLength(lapDistPct * totalLength)`를 통해 외부 라이브러리 없이 0.01px 오차 없는 트랙 위 주행 및 탄젠트 방향 회전.
  - **사고 발생 지점(Hazard Beacon) 표시:** `SessionFlags` 황기 및 코스아웃/스핀 차량(`CarIdxTrackSurface === 0`)의 위치에 고휘도 옐로우 점멸 비콘(🚨/⚠️ + 사고 차량 번호 태그) 렌더링. 사고 섹터 노란색 펄스 발광.
  - **내 3섹터(S1/S2/S3) 퍼플/그린/옐로우 동적 트랙 라인 컬러링:** SVG `pathLength="100"` 기반 `stroke-dasharray` 분할 렌더링으로 세션 최고(보라), 개인 최고(초록), 지연(노랑), 주행 중(화이트 펄스) 트랙 라인 발광.
  - **차량 클래스 도트 & 피트 투명도:** 플레이어(#7 YOU) 네온 인디케이터, 상대 차량 클래스 도트, 피트 진입 차량 반투명화 및 렌치(`IconPit`) 표기.
  - **`Alt + J` 편집 모드:** 가로 너비 조절, 배율 조절 `[-] 100% [+]`, `[사고 테스트]` 토글, `[트랙 변경]` 테스트 버튼 탑재.
  - SDK 변수: `WeekendInfo: TrackName/TrackID`, `CarIdxLapDistPct`, `CarIdxTrackSurface`, `CarIdxOnPitRoad`, `SessionFlags`, `SplitTimeInfo: Sectors`.
- [x] **M2.6: 위젯 16 - 테마별 RPM 시프트 라이트 LED 바 (`ShiftLight.tsx`)**
  - **테마 적응형 타코미터:** F1(수평 아치형 LED 리본), GT3/WEC(양끝 수렴 듀얼 윙), IndyCar(초광폭 슬림 바) 스타일 동적 지원.
  - **15-LED 모터스포츠 프로그레션:** 5 Green ➔ 5 Red ➔ 5 Blue/Purple 고휘도 발광 인디케이터.
  - **디지털 기어 & 텔레메트리:** 중앙 대형 기어(`1..8`, `N`, `R`), 실시간 속도(km/h), RPM 표시.
  - **스트로브 플래시 & 피트 리미터:** 변속 한계(`blinkRpm`/`irsdk_revLimiterActive`) 도달 시 15개 전체 화이트 플래시, 피트 리미터(`irsdk_pitSpeedLimiter`) 시 청색/황색 교차 점멸 및 `PIT LIMITER / 60 KM/H` 배너.
  - **`Alt + J` 편집 모드:** 가로 너비(300~680px) 실시간 조절, 배율 조절, `[RPM 테스트]`(LIVE/T1~T5), `[스타일 전환]`(F1/GT3/INDYCAR).
  - SDK 변수: `RPM`, `EngineWarnings` (`0x10`, `0x20`), YAML `DriverInfo.DriverCarSLFirstRPM`, `DriverCarSLShiftRPM`, `DriverCarSLLastRPM`, `DriverCarSLBlinkRPM`.
- [x] **M2.7: 트리플 모니터(48:9) 뷰포트 센터 클램프 & 베젤 정밀 정렬**
  - **초광폭(5760x1080 / 7680x1440) 중앙 시야 클램프:** FHD(1920px) / QHD(2560px) 중앙 모니터 너비 옵션(`centerClampWidth`).
  - **스포터 베젤 앵커링 (`spotterBezelAnchor`):** 좌/우 근접 스포터를 화면 최외곽 대신 중앙 모니터 좌/우 베젤 경계선에 정밀 정렬.
  - **`Alt + J` 편집 모드 베젤 점선 가이드라인:** 중앙 모니터 좌/우 베젤 물리적 경계 위치에 옐로우 점선 가이드(`◀ LEFT BEZEL`, `RIGHT BEZEL ▶`) 표시.

---

## 🛡️ Milestone 3: 안전 & 피트 전략 관리 위젯 6종 구현

> **목표:** 모터스포츠 디자인 언어에 맞춰 독립 좌/우 근접 스포터, 연료 시뮬레이터, 전방 사고 경고, 날씨 정보, 디지플래그, 피트박스 카운트다운을 완성합니다.

### 세부 작업 항목
- [x] **M3.1: 위젯 5 - 독립 좌/우 근접 스포터 (`SpotterLeft.tsx`, `SpotterRight.tsx`)**
  - **좌/우 완전 독립 제어:** 좌/우 위젯 분리, 독립 드래그 이동 및 자유로운 2D 크기 조절(가로 140~380px, 세로 44~160px, 배율 `[-] 100% [+]`).
  - **iRacing 데이터 맞춤 2단계(경고/위험) 레이더:** 1단계 경고(Amber 1대 근접 `irsdk_LRCarLeft`/`Right`, 싱글 셰브론) / 2단계 위험(Red 2대 근접 `irsdk_LR2CarsLeft`/`Right`, 더블 셰브론, 고속 펄스).
  - **`Alt + J` 편집 모드 인터랙티브 테스트:** 좌/우 각각 `[스포터 테스트]`(LIVE/WARN/DANGER) 독립 테스트 스위처 탑재.
  - SDK 변수: `CarLeftRight` bitfield.
- [x] **M3.2: 위젯 6 - 연료 시뮬레이터 & 전략 계산기 (`FuelSimulator.tsx`)**
  - **5대 킬러 차별화:** Clean Green Lap 필터링(황기/페이스랩 왜곡 배제), 선두 0:00 결승선 통과 기반 Extra Lap 수학적 판정, Lift & Coast 실시간 절약 타겟 바, Pit Window(Open/Optimal/Close) & Pit Loss 시간 예측, 인게임 F4 블랙박스(`PitSvFuel`, `irsdk_FuelFill`) 감사 경고.
  - **F1 Broadcast + Apple Design:** 컴팩트 레이스 바 + 원클릭 확장 전략 서랍, `Alt + J` 5단계 인터랙티브 테스트 스위처 및 가로 너비(240~380px) 리사이즈 지원.
  - SDK 변수: `FuelLevel`, `FuelLevelPct`, `FuelUsePerHour`, `PitSvFuel`, `PitSvFlags`, `SessionFlags`, `CarIdxPosition`, `CarIdxLapDistPct`, `CarIdxEstTime`, YAML `DriverCarFuelMaxLtr`.
- [x] **M3.3: 위젯 8 - 전방 사고 지점 경고 (`IncidentHazard.tsx`)**
  - **엄격한 사고 필터링 (Zero False Positives):** 단순 연석 밟기/경미한 트랙리밋 이탈(10cm 오프트랙, 고속 주행)은 완전 무시. 오직 방호벽/트랙리밋 충돌(`collision`), 차간 충돌(`collision`), 스핀/제어 상실(`spin` / lose control, 속도 < 40 km/h 또는 급감속), 트랙 위 정차(`stopped`, 속도 < 10 km/h), 공식 로컬 황기(`yellowFlag`) 수준의 실제 위험 사고만 선별 경보.
  - **2단계 정밀 거리 감지 (0~400m):**
    - **1단계 주의 (Caution Ahead, 200m~400m):** 레이싱 앰버(`#F59E0B`), ⚠️ 경고 아이콘, 실시간 거리(m) 카운트다운, 사고 유형 배지, 차량 번호 및 통과 속도, `PREPARE TO SLOW` 감속 대비 안내.
    - **2단계 위험 (Critical Danger, 0m~200m):** F1 솔리드 레드(`#E10600`), 🚨 고속 점멸 비콘, 심홍색 슬래브, 24px 볼드 고대비 폰트, `SLOW DOWN NOW!` 긴급 감속 지시.
  - **F1 브로드캐스트 + Apple Design:** 각진 슬래브, 좌측 세로 악센트 탭(3.5px), oblique(이탤릭) 타이포그래피, tabular-nums 고정폭 숫자(지터 방지), 주행 중 사고 미발생 시 완전 투명화(화면 가림 0).
  - **`Alt + J` 편집 모드:** 가로 너비(280~480px) 마우스 드래그 리사이즈, 배율 조절 `[-] 100% [+]`, 5단계 인터랙티브 테스트 스위처(`LIVE` ➔ `SPIN (140m)` ➔ `CRASH (65m)` ➔ `STOPPED (280m)` ➔ `CLEAR`).
  - SDK 변수: `SessionFlags` (`irsdk_yellow`, `irsdk_yellowWaving`, `irsdk_caution`, `irsdk_debris`), `CarIdxTrackSurface` (`irsdk_OffTrack`), `CarIdxLapDistPct`, 속도(Speed m/s $\times$ 3.6).
- [ ] **M3.4: 위젯 9 - 날씨 & Tempest 정보 (`WeatherWidget.tsx`)**
  - 대기/노면 온도, 풍향 나침반, 우천 강수량 게이지.
  - SDK 변수: `AirTemp`, `TrackTempCrew`, `WindVel`, `WindDir`, `RelativeHumidity`.
- [ ] **M3.5: 위젯 15 - 디지플래그 / 세션 플래그 경보 (`Digiflag.tsx`)**
  - 황기(Yellow), 청기(Blue - 추월 접근 차량 번호 함께 표기), 흑백 반반기(Meatball 수리 지시), 백기, 체커기 고휘도 전광판 발광 경보.
  - SDK 변수: `SessionFlags` (Bitfield).
- [ ] **M3.6: 위젯 14 - 피트박스 카운트다운 & 리미터 헬퍼 (`PitBoxHelper.tsx`)**
  - 피트 레인 진입 시 속도 초과 경고 + 내 피트 스톨(Pit Stall) 잔여 거리(50m ➔ 30m ➔ 10m ➔ STOP!) 정밀 카운트다운.
  - SDK 변수: `CarIdxTrackSurface`, `Speed`, `PitSvFlags`, `CarIdxLapDistPct`.

---

## 🧠 Milestone 4: 고급 인텔리전스 & 주행 분석 위젯 5종 구현

> **목표:** 리벤지 트래커, 타이어 분석, 멀티클래스 레이더, 페달 인풋 트레이스, 실시간 예상 iRating 변동 & SOF 계산기를 완성합니다.

### 세부 작업 항목
- [ ] **M4.1: 위젯 4 - 리벤지 트래커 (`RevengeTracker.tsx`)**
  - +4x 접촉 사고 유발 상대 드라이버 자동 감지 및 실시간 간격 고정 추적.
  - SDK 변수: `PlayerCarMyIncidentCount`, `CarLeftRight`, `CarIdxLapDistPct`.
- [ ] **M4.2: 위젯 7 - 타이어 분석기 (`TireAnalysis.tsx`)**
  - 4륜 타이어 공기압(PSI), 온도, 마모율(%) 시각화.
  - SDK 변수: `LFwearL/M/R`, `LFtempCL/CM/CR`, `LFcoldPressure`.
- [ ] **M4.3: 위젯 10 - 멀티클래스 접근 경고 (`MulticlassRadar.tsx`)**
  - 상위 빠른 클래스 차량 후방 3초 이내 고속 접근 시 시각 경보.
  - SDK 변수: `CarIdxClass`, `CarIdxEstTime`, `CarIdxLapDistPct`.
- [ ] **M4.4: 위젯 12 - 페달 인풋 트레이스 (`InputTelemetry.tsx`)**
  - 스로틀(가속), 브레이크(감속), 클러치, 스티어링 휠 조향각의 실시간 수치 및 직전 3초 파형(Waveform) 그래프.
  - SDK 변수: `Throttle`, `Brake`, `Clutch`, `SteeringWheelAngle` (60Hz).
- [ ] **M4.5: 위젯 13 - 실시간 예상 iRating 증감 & SOF 계산기 (`IRatingGain.tsx`)**
  - 세션 공식 SOF 표기 및 현재 순위 완주 시 획득/차감될 예상 iRating(±) 실시간 ELO 계산.
  - SDK 변수: 세션 YAML `DriverInfo: Drivers[carIdx].IRating`, `CarIdxPosition`.
- [ ] **M4.6: 16대 위젯 통합 및 콕핏 텔레메트리 연동**
  - 16대 전 위젯 간 반응형 데이터 동기화 및 렌더링 부하 최적화 (< 1% CPU).

---

## 📦 Milestone 5: 차기 테마(WEC/WRC/Indy/GT) 확장 & Windows 빌드 파이프라인

> **목표:** Windows Shared Memory 제로 카피 드라이버 연동, 다중 모터스포츠 테마 전면 활성화, 1-클릭 빌드 스크립트, GitHub Actions 자동 릴리즈 파이프라인을 완성합니다.

### 세부 작업 항목
- [ ] **M5.1: 다중 모터스포츠 테마(WEC, WRC, IndyCar, GT) 전면 활성화**
  - 테마별 CSS 변수 및 위젯 레이아웃/아이콘/색상 세트 완성.
- [ ] **M5.2: 실제 Windows iRacing Shared Memory 무지연 매핑 드라이버 (`src-tauri/src/iracing/memory.rs`)**
  - `Local\IRSDKMemMapFileName` 제로 카피 실시간 파싱 및 폴백 엔진 완비.
- [ ] **M5.3: Windows 1-클릭 빌드 (`build-windows.bat`) 및 GitHub Actions CI (`.github/workflows/build-windows.yml`)**
  - 번들 크기 < 250KB 초경량 달성, NSIS 인스톨러 및 단독 실행 파일 자동 빌드 파이프라인 완성.

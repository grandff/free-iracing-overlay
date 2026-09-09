# iRacing 텔레메트리 변수 레퍼런스 (irsdk Variable Reference)

> **출처:** [iRon (L. E. Spalt, MIT)](https://github.com/lespalt/iRon) 의 `iracing.h` / `irsdk/irsdk_defines.h` 에서 기계적으로 추출.
> iRacing SDK가 `Local\IRSDKMemMapFileName` 공유 메모리로 실제 노출하는 변수 전체 목록입니다.

> **읽는 법:** `float[64]` = 64대 차량 전체 배열 (인덱스 = `carIdx`), `float[1]` = 내 차량 단일 값, `float[6]` = 360Hz 서브샘플 6개.
> `bitfield` 는 비트 마스킹으로 해석 (하단 Enum 표 참조).

> **총 293개 변수 / 12개 분류.** 우리 프로젝트 위젯 11종이 필요로 하는 값은 전부 이 안에 있습니다.

---

## 📇 목차

- [01. 세션 / 플래그](#세션--플래그) — 14개
- [02. 전체 차량 배열 (CarIdx*, 64대)](#전체-차량-배열-caridx-64대) — 26개
- [03. 내 차량 상태 (Player*)](#내-차량-상태-player) — 17개
- [04. 랩타임 & 델타](#랩타임--델타) — 27개
- [05. 콕핏 입력 / 구동계](#콕핏-입력--구동계) — 26개
- [06. 날씨 / 트랙 컨디션](#날씨--트랙-컨디션) — 11개
- [07. 연료](#연료) — 4개
- [08. 타이어 (마모/온도/압력)](#타이어-마모온도압력) — 50개
- [09. 피트 / 정비](#피트--정비) — 29개
- [10. 엔진 상태](#엔진-상태) — 8개
- [11. 물리 / 차체 거동](#물리--차체-거동) — 39개
- [12. 기타 (리플레이/카메라/진단)](#기타-리플레이카메라진단) — 42개
- [Enum / Bitfield 해석표](#enum--bitfield-해석표)
- [위젯별 필요 변수 매핑](#위젯별-필요-변수-매핑)

---

## 세션 / 플래그

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `PaceMode` | `int[1]` | `irsdk_PaceMode` | Are we pacing or not |
| `RaceLaps` | `int[1]` | — | Laps completed in race |
| `SessionFlags` | `bitfield[1]` | `irsdk_Flags` | Session flags |
| `SessionLapsRemain` | `int[1]` | — | Old laps left till session ends use SessionLapsRemainEx |
| `SessionLapsRemainEx` | `int[1]` | — | New improved laps left till session ends |
| `SessionLapsTotal` | `int[1]` | — | Total number of laps in session |
| `SessionNum` | `int[1]` | — | Session number |
| `SessionState` | `int[1]` | `irsdk_SessionState` | Session state |
| `SessionTick` | `int[1]` | — | Current update number |
| `SessionTime` | `double[1]` | `s` | Seconds since session start |
| `SessionTimeOfDay` | `float[1]` | `s` | Time of day in seconds |
| `SessionTimeRemain` | `double[1]` | `s` | Seconds left till session ends |
| `SessionTimeTotal` | `double[1]` | `s` | Total number of seconds in session |
| `SessionUniqueID` | `int[1]` | — | Session ID |

## 전체 차량 배열 (CarIdx*, 64대)

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `CarIdxBestLapNum` | `int[64]` | — | Cars best lap number |
| `CarIdxBestLapTime` | `float[64]` | `s` | Cars best lap time |
| `CarIdxClass` | `int[64]` | — | Cars class id by car index |
| `CarIdxClassPosition` | `int[64]` | — | Cars class position in race by car index |
| `CarIdxEstTime` | `float[64]` | `s` | Estimated time to reach current location on track |
| `CarIdxF2Time` | `float[64]` | `s` | Race time behind leader or fastest lap time otherwise |
| `CarIdxFastRepairsUsed` | `int[64]` | — | How many fast repairs each car has used |
| `CarIdxGear` | `int[64]` | — | -1=reverse  0=neutral  1..n=current gear by car index |
| `CarIdxLap` | `int[64]` | — | Laps started by car index |
| `CarIdxLapCompleted` | `int[64]` | — | Laps completed by car index |
| `CarIdxLapDistPct` | `float[64]` | `%` | Percentage distance around lap by car index |
| `CarIdxLastLapTime` | `float[64]` | `s` | Cars last lap time |
| `CarIdxOnPitRoad` | `bool[64]` | — | On pit road between the cones by car index |
| `CarIdxP2P_Count` | `int[64]` | — | Push2Pass count of usage (or remaining in Race) |
| `CarIdxP2P_Status` | `bool[64]` | — | Push2Pass active or not |
| `CarIdxPaceFlags` | `int[64]` | `irsdk_PaceFlags` | Pacing status flags for each car |
| `CarIdxPaceLine` | `int[64]` | — | What line cars are pacing in  or -1 if not pacing |
| `CarIdxPaceRow` | `int[64]` | — | What row cars are pacing in  or -1 if not pacing |
| `CarIdxPosition` | `int[64]` | — | Cars position in race by car index |
| `CarIdxQualTireCompound` | `int[64]` | — | Cars Qual tire compound |
| `CarIdxQualTireCompoundLocked` | `bool[64]` | — | Cars Qual tire compound is locked-in |
| `CarIdxRPM` | `float[64]` | `revs/min` | Engine rpm by car index |
| `CarIdxSteer` | `float[64]` | `rad` | Steering wheel angle by car index |
| `CarIdxTireCompound` | `int[64]` | — | Cars current tire compound |
| `CarIdxTrackSurface` | `int[64]` | `irsdk_TrkLoc` | Track surface type by car index |
| `CarIdxTrackSurfaceMaterial` | `int[64]` | `irsdk_TrkSurf` | Track surface material type by car index |

## 내 차량 상태 (Player*)

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `PlayerCarClass` | `int[1]` | — | Player car class id |
| `PlayerCarClassPosition` | `int[1]` | — | Players class position in race |
| `PlayerCarDriverIncidentCount` | `int[1]` | — | Teams current drivers incident count for this session |
| `PlayerCarDryTireSetLimit` | `int[1]` | — | Players dry tire set limit |
| `PlayerCarIdx` | `int[1]` | — | Players carIdx |
| `PlayerCarInPitStall` | `bool[1]` | — | Players car is properly in there pitstall |
| `PlayerCarMyIncidentCount` | `int[1]` | — | Players own incident count for this session |
| `PlayerCarPitSvStatus` | `int[1]` | `irsdk_PitSvStatus` | Players car pit service status bits |
| `PlayerCarPosition` | `int[1]` | — | Players position in race |
| `PlayerCarPowerAdjust` | `float[1]` | `%` | Players power adjust |
| `PlayerCarTeamIncidentCount` | `int[1]` | — | Players team incident count for this session |
| `PlayerCarTowTime` | `float[1]` | `s` | Players car is being towed if time is greater than zero |
| `PlayerCarWeightPenalty` | `float[1]` | `kg` | Players weight penalty |
| `PlayerFastRepairsUsed` | `int[1]` | — | Players car number of fast repairs used |
| `PlayerTireCompound` | `int[1]` | — | Players car current tire compound |
| `PlayerTrackSurface` | `int[1]` | `irsdk_TrkLoc` | Players car track surface type |
| `PlayerTrackSurfaceMaterial` | `int[1]` | `irsdk_TrkSurf` | Players car track surface material type |

## 랩타임 & 델타

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `Lap` | `int[1]` | — | Laps started count |
| `LapBestLap` | `int[1]` | — | Players best lap number |
| `LapBestLapTime` | `float[1]` | `s` | Players best lap time |
| `LapBestNLapLap` | `int[1]` | — | Player last lap in best N average lap time |
| `LapBestNLapTime` | `float[1]` | `s` | Player best N average lap time |
| `LapCompleted` | `int[1]` | — | Laps completed count |
| `LapCurrentLapTime` | `float[1]` | `s` | Estimate of players current lap time as shown in F3 box |
| `LapDeltaToBestLap` | `float[1]` | `s` | Delta time for best lap |
| `LapDeltaToBestLap_DD` | `float[1]` | `s/s` | Rate of change of delta time for best lap |
| `LapDeltaToBestLap_OK` | `bool[1]` | — | Delta time for best lap is valid |
| `LapDeltaToOptimalLap` | `float[1]` | `s` | Delta time for optimal lap |
| `LapDeltaToOptimalLap_DD` | `float[1]` | `s/s` | Rate of change of delta time for optimal lap |
| `LapDeltaToOptimalLap_OK` | `bool[1]` | — | Delta time for optimal lap is valid |
| `LapDeltaToSessionBestLap` | `float[1]` | `s` | Delta time for session best lap |
| `LapDeltaToSessionBestLap_DD` | `float[1]` | `s/s` | Rate of change of delta time for session best lap |
| `LapDeltaToSessionBestLap_OK` | `bool[1]` | — | Delta time for session best lap is valid |
| `LapDeltaToSessionLastlLap` | `float[1]` | `s` | Delta time for session last lap |
| `LapDeltaToSessionLastlLap_DD` | `float[1]` | `s/s` | Rate of change of delta time for session last lap |
| `LapDeltaToSessionLastlLap_OK` | `bool[1]` | — | Delta time for session last lap is valid |
| `LapDeltaToSessionOptimalLap` | `float[1]` | `s` | Delta time for session optimal lap |
| `LapDeltaToSessionOptimalLap_DD` | `float[1]` | `s/s` | Rate of change of delta time for session optimal lap |
| `LapDeltaToSessionOptimalLap_OK` | `bool[1]` | — | Delta time for session optimal lap is valid |
| `LapDist` | `float[1]` | `m` | Meters traveled from S/F this lap |
| `LapDistPct` | `float[1]` | `%` | Percentage distance around lap |
| `LapLasNLapSeq` | `int[1]` | — | Player num consecutive clean laps completed for N average |
| `LapLastLapTime` | `float[1]` | `s` | Players last lap time |
| `LapLastNLapTime` | `float[1]` | `s` | Player last N average lap time |

## 콕핏 입력 / 구동계

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `Brake` | `float[1]` | `%` | 0=brake released to 1=max pedal force |
| `BrakeABSactive` | `bool[1]` | — | true if abs is currently reducing brake force pressure |
| `BrakeRaw` | `float[1]` | `%` | Raw brake input 0=brake released to 1=max pedal force |
| `Clutch` | `float[1]` | `%` | 0=disengaged to 1=fully engaged |
| `Gear` | `int[1]` | — | -1=reverse  0=neutral  1..n=current gear |
| `HandbrakeRaw` | `float[1]` | `%` | Raw handbrake input 0=handbrake released to 1=max force |
| `RPM` | `float[1]` | `revs/min` | Engine rpm |
| `ShiftGrindRPM` | `float[1]` | `RPM` | RPM of shifter grinding noise |
| `ShiftIndicatorPct` | `float[1]` | `%` | DEPRECATED use DriverCarSLBlinkRPM instead |
| `ShiftPowerPct` | `float[1]` | `%` | Friction torque applied to gears when shifting or grinding |
| `SteeringWheelAngle` | `float[1]` | `rad` | Steering wheel angle |
| `SteeringWheelAngleMax` | `float[1]` | `rad` | Steering wheel max angle |
| `SteeringWheelLimiter` | `float[1]` | `%` | Force feedback limiter strength limits impacts and oscillation |
| `SteeringWheelMaxForceNm` | `float[1]` | `N*m` | Value of strength or max force slider in Nm for FFB |
| `SteeringWheelPctDamper` | `float[1]` | `%` | Force feedback % max damping |
| `SteeringWheelPctTorque` | `float[1]` | `%` | Force feedback % max torque on steering shaft unsigned |
| `SteeringWheelPctTorqueSign` | `float[1]` | `%` | Force feedback % max torque on steering shaft signed |
| `SteeringWheelPctTorqueSignStops` | `float[1]` | `%` | Force feedback % max torque on steering shaft signed stops |
| `SteeringWheelPeakForceNm` | `float[1]` | `N*m` | Peak torque mapping to direct input units for FFB |
| `SteeringWheelTorque` | `float[1]` | `N*m` | Output torque on steering shaft |
| `SteeringWheelTorque_ST` | `float[6]` | `N*m` | Output torque on steering shaft at 360 Hz |
| `SteeringWheelUseLinear` | `bool[1]` | — | True if steering wheel force is using linear mode |
| `Throttle` | `float[1]` | `%` | 0=off throttle to 1=full throttle |
| `ThrottleRaw` | `float[1]` | `%` | Raw throttle input 0=off throttle to 1=full throttle |
| `dcBrakeBias` | `float[1]` | — | In car brake bias adjustment |
| `dcStarter` | `bool[1]` | — | In car trigger car starter |

## 날씨 / 트랙 컨디션

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `AirDensity` | `float[1]` | `kg/m^3` | Density of air at start/finish line |
| `AirPressure` | `float[1]` | `Hg` | Pressure of air at start/finish line |
| `AirTemp` | `float[1]` | `C` | Temperature of air at start/finish line |
| `FogLevel` | `float[1]` | `%` | Fog level |
| `RelativeHumidity` | `float[1]` | `%` | Relative Humidity |
| `Skies` | `int[1]` | — | Skies (0=clear/1=p cloudy/2=m cloudy/3=overcast) |
| `TrackTemp` | `float[1]` | `C` | Deprecated  set to TrackTempCrew |
| `TrackTempCrew` | `float[1]` | `C` | Temperature of track measured by crew around track |
| `WeatherType` | `int[1]` | — | Weather type (0=constant  1=dynamic) |
| `WindDir` | `float[1]` | `rad` | Wind direction at start/finish line |
| `WindVel` | `float[1]` | `m/s` | Wind velocity at start/finish line |

## 연료

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `FuelLevel` | `float[1]` | `l` | Liters of fuel remaining |
| `FuelLevelPct` | `float[1]` | `%` | Percent fuel remaining |
| `FuelPress` | `float[1]` | `bar` | Engine fuel pressure |
| `FuelUsePerHour` | `float[1]` | `kg/h` | Engine fuel used instantaneous |

## 타이어 (마모/온도/압력)

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `FrontTireSetsAvailable` | `int[1]` | — | How many front tire sets are remaining  255 is unlimited |
| `FrontTireSetsUsed` | `int[1]` | — | How many front tire sets used so far |
| `LFTiresAvailable` | `int[1]` | — | How many left front tires are remaining  255 is unlimited |
| `LFTiresUsed` | `int[1]` | — | How many left front tires used so far |
| `LFcoldPressure` | `float[1]` | `kPa` | LF tire cold pressure  as set in the garage |
| `LFtempCL` | `float[1]` | `C` | LF tire left carcass temperature |
| `LFtempCM` | `float[1]` | `C` | LF tire middle carcass temperature |
| `LFtempCR` | `float[1]` | `C` | LF tire right carcass temperature |
| `LFwearL` | `float[1]` | `%` | LF tire left percent tread remaining |
| `LFwearM` | `float[1]` | `%` | LF tire middle percent tread remaining |
| `LFwearR` | `float[1]` | `%` | LF tire right percent tread remaining |
| `LRTiresAvailable` | `int[1]` | — | How many left rear tires are remaining  255 is unlimited |
| `LRTiresUsed` | `int[1]` | — | How many left rear tires used so far |
| `LRcoldPressure` | `float[1]` | `kPa` | LR tire cold pressure  as set in the garage |
| `LRtempCL` | `float[1]` | `C` | LR tire left carcass temperature |
| `LRtempCM` | `float[1]` | `C` | LR tire middle carcass temperature |
| `LRtempCR` | `float[1]` | `C` | LR tire right carcass temperature |
| `LRwearL` | `float[1]` | `%` | LR tire left percent tread remaining |
| `LRwearM` | `float[1]` | `%` | LR tire middle percent tread remaining |
| `LRwearR` | `float[1]` | `%` | LR tire right percent tread remaining |
| `LeftTireSetsAvailable` | `int[1]` | — | How many left tire sets are remaining  255 is unlimited |
| `LeftTireSetsUsed` | `int[1]` | — | How many left tire sets used so far |
| `RFTiresAvailable` | `int[1]` | — | How many right front tires are remaining  255 is unlimited |
| `RFTiresUsed` | `int[1]` | — | How many right front tires used so far |
| `RFcoldPressure` | `float[1]` | `kPa` | RF tire cold pressure  as set in the garage |
| `RFtempCL` | `float[1]` | `C` | RF tire left carcass temperature |
| `RFtempCM` | `float[1]` | `C` | RF tire middle carcass temperature |
| `RFtempCR` | `float[1]` | `C` | RF tire right carcass temperature |
| `RFwearL` | `float[1]` | `%` | RF tire left percent tread remaining |
| `RFwearM` | `float[1]` | `%` | RF tire middle percent tread remaining |
| `RFwearR` | `float[1]` | `%` | RF tire right percent tread remaining |
| `RRTiresAvailable` | `int[1]` | — | How many right rear tires are remaining  255 is unlimited |
| `RRTiresUsed` | `int[1]` | — | How many right rear tires used so far |
| `RRcoldPressure` | `float[1]` | `kPa` | RR tire cold pressure  as set in the garage |
| `RRtempCL` | `float[1]` | `C` | RR tire left carcass temperature |
| `RRtempCM` | `float[1]` | `C` | RR tire middle carcass temperature |
| `RRtempCR` | `float[1]` | `C` | RR tire right carcass temperature |
| `RRwearL` | `float[1]` | `%` | RR tire left percent tread remaining |
| `RRwearM` | `float[1]` | `%` | RR tire middle percent tread remaining |
| `RRwearR` | `float[1]` | `%` | RR tire right percent tread remaining |
| `RearTireSetsAvailable` | `int[1]` | — | How many rear tire sets are remaining  255 is unlimited |
| `RearTireSetsUsed` | `int[1]` | — | How many rear tire sets used so far |
| `RightTireSetsAvailable` | `int[1]` | — | How many right tire sets are remaining  255 is unlimited |
| `RightTireSetsUsed` | `int[1]` | — | How many right tire sets used so far |
| `TireLF_RumblePitch` | `float[1]` | `Hz` | Players LF Tire Sound rumblestrip pitch |
| `TireLR_RumblePitch` | `float[1]` | `Hz` | Players LR Tire Sound rumblestrip pitch |
| `TireRF_RumblePitch` | `float[1]` | `Hz` | Players RF Tire Sound rumblestrip pitch |
| `TireRR_RumblePitch` | `float[1]` | `Hz` | Players RR Tire Sound rumblestrip pitch |
| `TireSetsAvailable` | `int[1]` | — | How many tire sets are remaining  255 is unlimited |
| `TireSetsUsed` | `int[1]` | — | How many tire sets used so far |

## 피트 / 정비

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `FastRepairAvailable` | `int[1]` | — | How many fast repairs left  255 is unlimited |
| `FastRepairUsed` | `int[1]` | — | How many fast repairs used so far |
| `OnPitRoad` | `bool[1]` | — | Is the player car on pit road between the cones |
| `PitOptRepairLeft` | `float[1]` | `s` | Time left for optional repairs if repairs are active |
| `PitRepairLeft` | `float[1]` | `s` | Time left for mandatory pit repairs if repairs are active |
| `PitSvFlags` | `bitfield[1]` | `irsdk_PitSvFlags` | Bitfield of pit service checkboxes |
| `PitSvFuel` | `float[1]` | `l` | Pit service fuel add amount |
| `PitSvLFP` | `float[1]` | `kPa` | Pit service left front tire pressure |
| `PitSvLRP` | `float[1]` | `kPa` | Pit service left rear tire pressure |
| `PitSvRFP` | `float[1]` | `kPa` | Pit service right front tire pressure |
| `PitSvRRP` | `float[1]` | `kPa` | Pit service right rear tire pressure |
| `PitSvTireCompound` | `int[1]` | — | Pit service pending tire compound |
| `Pitch` | `float[1]` | `rad` | Pitch orientation |
| `PitchRate` | `float[1]` | `rad/s` | Pitch rate |
| `PitchRate_ST` | `float[6]` | `rad/s` | Pitch rate at 360 Hz |
| `PitsOpen` | `bool[1]` | — | True if pit stop is allowed for the current player |
| `PitstopActive` | `bool[1]` | — | Is the player getting pit stop service |
| `dpFastRepair` | `float[1]` | — | Pitstop fast repair set |
| `dpFuelAddKg` | `float[1]` | `kg` | Pitstop fuel add ammount |
| `dpFuelFill` | `float[1]` | — | Pitstop fuel fill flag |
| `dpLFTireColdPress` | `float[1]` | `Pa` | Pitstop lf tire cold pressure adjustment |
| `dpLRTireColdPress` | `float[1]` | `Pa` | Pitstop lr tire cold pressure adjustment |
| `dpLTireChange` | `float[1]` | — | Pitstop left tire change request |
| `dpRFTireColdPress` | `float[1]` | `Pa` | Pitstop rf cold tire pressure adjustment |
| `dpRRTireColdPress` | `float[1]` | `Pa` | Pitstop rr cold tire pressure adjustment |
| `dpRTireChange` | `float[1]` | — | Pitstop right tire change request |
| `dpWeightJackerLeft` | `float[1]` | — | Pitstop left wedge/weight jacker adjustment |
| `dpWeightJackerRight` | `float[1]` | — | Pitstop right wedge/weight jacker adjustment |
| `dpWindshieldTearoff` | `float[1]` | — | Pitstop windshield tearoff |

## 엔진 상태

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `EngineWarnings` | `bitfield[1]` | `irsdk_EngineWarnings` | Bitfield for warning lights |
| `ManifoldPress` | `float[1]` | `bar` | Engine manifold pressure |
| `OilLevel` | `float[1]` | `l` | Engine oil level |
| `OilPress` | `float[1]` | `bar` | Engine oil pressure |
| `OilTemp` | `float[1]` | `C` | Engine oil temperature |
| `Voltage` | `float[1]` | `V` | Engine voltage |
| `WaterLevel` | `float[1]` | `l` | Engine coolant level |
| `WaterTemp` | `float[1]` | `C` | Engine coolant temp |

## 물리 / 차체 거동

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `Alt` | `float[1]` | `m` | Altitude in meters |
| `LFSHshockDefl` | `float[1]` | `m` | LFSH shock deflection |
| `LFSHshockDefl_ST` | `float[6]` | `m` | LFSH shock deflection at 360 Hz |
| `LFSHshockVel` | `float[1]` | `m/s` | LFSH shock velocity |
| `LFSHshockVel_ST` | `float[6]` | `m/s` | LFSH shock velocity at 360 Hz |
| `LRSHshockDefl` | `float[1]` | `m` | LRSH shock deflection |
| `LRSHshockDefl_ST` | `float[6]` | `m` | LRSH shock deflection at 360 Hz |
| `LRSHshockVel` | `float[1]` | `m/s` | LRSH shock velocity |
| `LRSHshockVel_ST` | `float[6]` | `m/s` | LRSH shock velocity at 360 Hz |
| `Lat` | `double[1]` | `deg` | Latitude in degrees |
| `LatAccel` | `float[1]` | `m/s^2` | Lateral acceleration (including gravity) |
| `LatAccel_ST` | `float[6]` | `m/s^2` | Lateral acceleration (including gravity) at 360 Hz |
| `Lon` | `double[1]` | `deg` | Longitude in degrees |
| `LongAccel` | `float[1]` | `m/s^2` | Longitudinal acceleration (including gravity) |
| `LongAccel_ST` | `float[6]` | `m/s^2` | Longitudinal acceleration (including gravity) at 360 Hz |
| `RFSHshockDefl` | `float[1]` | `m` | RFSH shock deflection |
| `RFSHshockDefl_ST` | `float[6]` | `m` | RFSH shock deflection at 360 Hz |
| `RFSHshockVel` | `float[1]` | `m/s` | RFSH shock velocity |
| `RFSHshockVel_ST` | `float[6]` | `m/s` | RFSH shock velocity at 360 Hz |
| `RRSHshockDefl` | `float[1]` | `m` | RRSH shock deflection |
| `RRSHshockDefl_ST` | `float[6]` | `m` | RRSH shock deflection at 360 Hz |
| `RRSHshockVel` | `float[1]` | `m/s` | RRSH shock velocity |
| `RRSHshockVel_ST` | `float[6]` | `m/s` | RRSH shock velocity at 360 Hz |
| `Roll` | `float[1]` | `rad` | Roll orientation |
| `RollRate` | `float[1]` | `rad/s` | Roll rate |
| `RollRate_ST` | `float[6]` | `rad/s` | Roll rate at 360 Hz |
| `Speed` | `float[1]` | `m/s` | GPS vehicle speed |
| `VelocityX` | `float[1]` | `m/s` | X velocity |
| `VelocityX_ST` | `float[6]` | `m/s at 360 Hz` | X velocity |
| `VelocityY` | `float[1]` | `m/s` | Y velocity |
| `VelocityY_ST` | `float[6]` | `m/s at 360 Hz` | Y velocity |
| `VelocityZ` | `float[1]` | `m/s` | Z velocity |
| `VelocityZ_ST` | `float[6]` | `m/s at 360 Hz` | Z velocity |
| `VertAccel` | `float[1]` | `m/s^2` | Vertical acceleration (including gravity) |
| `VertAccel_ST` | `float[6]` | `m/s^2` | Vertical acceleration (including gravity) at 360 Hz |
| `Yaw` | `float[1]` | `rad` | Yaw orientation |
| `YawNorth` | `float[1]` | `rad` | Yaw orientation relative to north |
| `YawRate` | `float[1]` | `rad/s` | Yaw rate |
| `YawRate_ST` | `float[6]` | `rad/s` | Yaw rate at 360 Hz |

## 기타 (리플레이/카메라/진단)

| 변수 | 타입 | 단위 | 설명 |
| :--- | :--- | :--- | :--- |
| `CamCameraNumber` | `int[1]` | — | Active camera number |
| `CamCameraState` | `bitfield[1]` | `irsdk_CameraState` | State of camera system |
| `CamCarIdx` | `int[1]` | — | Active camera's focus car index |
| `CamGroupNumber` | `int[1]` | — | Active camera group number |
| `CarLeftRight` | `bitfield[1]` | `irsdk_CarLeftRight` | Notify if car is to the left or right of driver |
| `ChanAvgLatency` | `float[1]` | `s` | Communications average latency |
| `ChanClockSkew` | `float[1]` | `s` | Communications server clock skew |
| `ChanLatency` | `float[1]` | `s` | Communications latency |
| `ChanPartnerQuality` | `float[1]` | `%` | Partner communications quality |
| `ChanQuality` | `float[1]` | `%` | Communications quality |
| `CpuUsageBG` | `float[1]` | `%` | Percent of available tim bg thread took with a 1 sec avg |
| `CpuUsageFG` | `float[1]` | `%` | Percent of available tim fg thread took with a 1 sec avg |
| `DCDriversSoFar` | `int[1]` | — | Number of team drivers who have run a stint |
| `DCLapStatus` | `int[1]` | — | Status of driver change lap requirements |
| `DisplayUnits` | `int[1]` | — | Default units for the user interface 0 = english 1 = metric |
| `DriverMarker` | `bool[1]` | — | Driver activated flag |
| `EnterExitReset` | `int[1]` | — | Indicate action the reset key will take 0 enter 1 exit 2 reset |
| `FrameRate` | `float[1]` | `fps` | Average frames per second |
| `GpuUsage` | `float[1]` | `%` | Percent of available tim gpu took with a 1 sec avg |
| `IsDiskLoggingActive` | `bool[1]` | — | 0=disk based telemetry file not being written  1=being written |
| `IsDiskLoggingEnabled` | `bool[1]` | — | 0=disk based telemetry turned off  1=turned on |
| `IsInGarage` | `bool[1]` | — | 1=Car in garage physics running |
| `IsOnTrack` | `bool[1]` | — | 1=Car on track physics running with player in car |
| `IsOnTrackCar` | `bool[1]` | — | 1=Car on track physics running |
| `IsReplayPlaying` | `bool[1]` | — | 0=replay not playing  1=replay playing |
| `LoadNumTextures` | `bool[1]` | — | True if the car_num texture will be loaded |
| `ManualBoost` | `bool[1]` | — | Hybrid manual boost state |
| `ManualNoBoost` | `bool[1]` | — | Hybrid manual no boost state |
| `MemPageFaultSec` | `float[1]` | — | Memory page faults per second |
| `OkToReloadTextures` | `bool[1]` | — | True if it is ok to reload car textures at this time |
| `PushToPass` | `bool[1]` | — | Push to pass button state |
| `RadioTransmitCarIdx` | `int[1]` | — | The car index of the current person speaking on the radio |
| `RadioTransmitFrequencyIdx` | `int[1]` | — | The frequency index of the current person speaking on the radio |
| `RadioTransmitRadioIdx` | `int[1]` | — | The radio index of the current person speaking on the radio |
| `ReplayFrameNum` | `int[1]` | — | Integer replay frame number (60 per second) |
| `ReplayFrameNumEnd` | `int[1]` | — | Integer replay frame number from end of tape |
| `ReplayPlaySlowMotion` | `bool[1]` | — | 0=not slow motion  1=replay is in slow motion |
| `ReplayPlaySpeed` | `int[1]` | — | Replay playback speed |
| `ReplaySessionNum` | `int[1]` | — | Replay session number |
| `ReplaySessionTime` | `double[1]` | `s` | Seconds since replay session start |
| `VidCapActive` | `bool[1]` | — | True if video currently being captured |
| `VidCapEnabled` | `bool[1]` | — | True if video capture system is enabled |

---

## Enum / Bitfield 해석표

### `irsdk_Flags`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_checkered` | `0x00000001` |  |
| `irsdk_white` | `0x00000002` |  |
| `irsdk_green` | `0x00000004` |  |
| `irsdk_yellow` | `0x00000008` |  |
| `irsdk_red` | `0x00000010` |  |
| `irsdk_blue` | `0x00000020` |  |
| `irsdk_debris` | `0x00000040` |  |
| `irsdk_crossed` | `0x00000080` |  |
| `irsdk_yellowWaving` | `0x00000100` |  |
| `irsdk_oneLapToGreen` | `0x00000200` |  |
| `irsdk_greenHeld` | `0x00000400` |  |
| `irsdk_tenToGo` | `0x00000800` |  |
| `irsdk_fiveToGo` | `0x00001000` |  |
| `irsdk_randomWaving` | `0x00002000` |  |
| `irsdk_caution` | `0x00004000` |  |
| `irsdk_cautionWaving` | `0x00008000` |  |
| `irsdk_black` | `0x00010000` |  |
| `irsdk_disqualify` | `0x00020000` |  |
| `irsdk_servicible` | `0x00040000` | car is allowed service (not a flag) |
| `irsdk_furled` | `0x00080000` |  |
| `irsdk_repair` | `0x00100000` |  |
| `irsdk_startHidden` | `0x10000000` |  |
| `irsdk_startReady` | `0x20000000` |  |
| `irsdk_startSet` | `0x40000000` |  |
| `irsdk_startGo` | `0x80000000` |  |

### `irsdk_TrkLoc`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_NotInWorld` | `-1` |  |
| `irsdk_OffTrack` | — |  |
| `irsdk_InPitStall` | — |  |
| `irsdk_AproachingPits` | — |  |
| `irsdk_OnTrack` | — |  |

### `irsdk_TrkSurf`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_SurfaceNotInWorld` | `-1` |  |
| `irsdk_UndefinedMaterial` | `0` |  |
| `irsdk_Asphalt1Material` | — |  |
| `irsdk_Asphalt2Material` | — |  |
| `irsdk_Asphalt3Material` | — |  |
| `irsdk_Asphalt4Material` | — |  |
| `irsdk_Concrete1Material` | — |  |
| `irsdk_Concrete2Material` | — |  |
| `irsdk_RacingDirt1Material` | — |  |
| `irsdk_RacingDirt2Material` | — |  |
| `irsdk_Paint1Material` | — |  |
| `irsdk_Paint2Material` | — |  |
| `irsdk_Rumble1Material` | — |  |
| `irsdk_Rumble2Material` | — |  |
| `irsdk_Rumble3Material` | — |  |
| `irsdk_Rumble4Material` | — |  |
| `irsdk_Grass1Material` | — |  |
| `irsdk_Grass2Material` | — |  |
| `irsdk_Grass3Material` | — |  |
| `irsdk_Grass4Material` | — |  |
| `irsdk_Dirt1Material` | — |  |
| `irsdk_Dirt2Material` | — |  |
| `irsdk_Dirt3Material` | — |  |
| `irsdk_Dirt4Material` | — |  |
| `irsdk_SandMaterial` | — |  |
| `irsdk_Gravel1Material` | — |  |
| `irsdk_Gravel2Material` | — |  |
| `irsdk_GrasscreteMaterial` | — |  |
| `irsdk_AstroturfMaterial` | — |  |

### `irsdk_SessionState`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_StateInvalid` | — |  |
| `irsdk_StateGetInCar` | — |  |
| `irsdk_StateWarmup` | — |  |
| `irsdk_StateParadeLaps` | — |  |
| `irsdk_StateRacing` | — |  |
| `irsdk_StateCheckered` | — |  |
| `irsdk_StateCoolDown` | — |  |

### `irsdk_CarLeftRight`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_LROff` | — |  |
| `irsdk_LRClear` | — | no cars around us. |
| `irsdk_LRCarLeft` | — | there is a car to our left. |
| `irsdk_LRCarRight` | — | there is a car to our right. |
| `irsdk_LRCarLeftRight` | — | there are cars on each side. |
| `irsdk_LR2CarsLeft` | — | there are two cars to our left. |
| `irsdk_LR2CarsRight` | — | there are two cars to our right. |

### `irsdk_PitSvFlags`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_LFTireChange` | `0x0001` |  |
| `irsdk_RFTireChange` | `0x0002` |  |
| `irsdk_LRTireChange` | `0x0004` |  |
| `irsdk_RRTireChange` | `0x0008` |  |
| `irsdk_FuelFill` | `0x0010` |  |
| `irsdk_WindshieldTearoff` | `0x0020` |  |
| `irsdk_FastRepair` | `0x0040` |  |

### `irsdk_PitSvStatus`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_PitSvNone` | `0` |  |
| `irsdk_PitSvInProgress` | — |  |
| `irsdk_PitSvComplete` | — |  |
| `irsdk_PitSvTooFarLeft` | `100` |  |
| `irsdk_PitSvTooFarRight` | — |  |
| `irsdk_PitSvTooFarForward` | — |  |
| `irsdk_PitSvTooFarBack` | — |  |
| `irsdk_PitSvBadAngle` | — |  |
| `irsdk_PitSvCantFixThat` | — |  |

### `irsdk_PaceMode`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_PaceModeSingleFileStart` | `0` |  |
| `irsdk_PaceModeDoubleFileStart` | — |  |
| `irsdk_PaceModeSingleFileRestart` | — |  |
| `irsdk_PaceModeDoubleFileRestart` | — |  |
| `irsdk_PaceModeNotPacing` | — |  |

### `irsdk_PaceFlags`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_PaceFlagsEndOfLine` | `0x01` |  |
| `irsdk_PaceFlagsFreePass` | `0x02` |  |
| `irsdk_PaceFlagsWavedAround` | `0x04` |  |

### `irsdk_EngineWarnings`

| 상수 | 값 | 비고 |
| :--- | :--- | :--- |
| `irsdk_waterTempWarning` | `0x01` |  |
| `irsdk_fuelPressureWarning` | `0x02` |  |
| `irsdk_oilPressureWarning` | `0x04` |  |
| `irsdk_engineStalled` | `0x08` |  |
| `irsdk_pitSpeedLimiter` | `0x10` |  |
| `irsdk_revLimiterActive` | `0x20` |  |
| `irsdk_oilTempWarning` | `0x40` |  |
---

## 위젯별 필요 변수 매핑

AGENTS.md §3의 11대 기능을 만들 때 **실제로 읽어야 할 변수**만 추린 표입니다.
M2~M4 구현 시 이 표의 변수명을 그대로 `src/services/telemetry/types.ts` 에 매핑하면 됩니다.

| # | 위젯 | 핵심 변수 | 비고 |
| :-: | :--- | :--- | :--- |
| 1 | **순위표 (Leaderboard)** | `CarIdxPosition`, `CarIdxClassPosition`, `CarIdxClass`, `CarIdxLap`, `CarIdxLapCompleted`, `CarIdxLastLapTime`, `CarIdxBestLapTime`, `CarIdxOnPitRoad`, `CarIdxTrackSurface`, `CarIdxTireCompound` | 드라이버 이름·국가·iRating·SR은 텔레메트리가 아니라 **세션 YAML(`DriverInfo`)** 에서 읽어야 함 |
| 2 | **렐러티브 (Relative)** | `CarIdxEstTime`, `CarIdxLapDistPct`, `CarIdxLap`, `PlayerCarIdx`, `CarIdxClass` | 갭 = 내 `EstTime` − 상대 `EstTime`. **IRSDK는 상대 차량의 섹터 스플릿/델타를 제공하지 않으므로 상대 행의 S1/S2/S3 색은 표시하지 않음.** 플레이어 행만 아래 Lap Delta의 확정 상태를 공유 |
| 3 | **랩 델타 (Lap Delta)** | `LapDeltaToSessionLastlLap`(+`_OK`), `LapDeltaToBestLap`(+`_OK`), `LapDeltaToSessionBestLap`(+`_OK`), `LapLastLapTime`, `LapBestLapTime`, YAML `SplitTimeInfo` | iRacing이 **플레이어의 연속 랩 델타**를 직접 계산. split 경계와 개수는 `SplitTimeInfo.Sectors[].SectorStartPct`로 판정하고 `_OK=false`면 표시 억제. 섹터별 색은 경계 통과 시 플레이어 델타를 샘플링해 비교한 파생값이며, 상대/세션 전체의 공식 섹터 기록은 아님 |
| 4 | **리벤지 트래커** | `PlayerCarMyIncidentCount`, `CarLeftRight`, `CarIdxLapDistPct`, `CarIdxEstTime` | 인시던트 카운트 **증가 순간**에 좌우/근접 차량을 범인으로 락온 |
| 5 | **근접 스포터 (좌/우)** | `CarLeftRight` (bitfield) | iRacing 내장 스포터. 직접 거리 계산할 필요 없음. 값 해석은 아래 `irsdk_CarLeftRight` 표 |
| 6 | **연료 시뮬레이터** | `FuelLevel`, `FuelLevelPct`, `FuelUsePerHour`, `LapCompleted`, `SessionLapsRemainEx`, `SessionTimeRemain` | 랩당 소비량은 랩 완료 시점의 `FuelLevel` 차이를 직접 누적 (3~5랩 이동평균) |
| 7 | **타이어 분석** | `LFwearL/M/R`, `RFwearL/M/R`, `LRwearL/M/R`, `RRwearL/M/R`, `LFtempCL/CM/CR`(4륜), `LFcoldPressure`(4륜) | ⚠️ **마모·온도는 피트인 후에만 갱신됩니다.** 주행 중 실시간 값 아님 (AGENTS.md §3 기능7의 "추정치" 필요 이유) |
| 8 | **전방 사고 경고** | `SessionFlags`(`irsdk_yellow`/`yellowWaving`/`debris`), `CarIdxTrackSurface`(`irsdk_OffTrack`), `CarIdxLapDistPct`, `LapDistPct` | 전방 거리 = (상대 `LapDistPct` − 내 `LapDistPct`) × 트랙 길이 |
| 9 | **날씨 & 트랙** | `AirTemp`, `TrackTempCrew`, `WindVel`, `WindDir`, `Skies`, `RelativeHumidity`, `FogLevel`, `WeatherType` | `TrackTemp`은 deprecated → `TrackTempCrew` 사용. `WindDir`은 **라디안** |
| 10 | **멀티클래스 접근 경고** | `CarIdxClass`, `PlayerCarClass`, `CarIdxEstTime`, `SessionFlags`(`irsdk_blue`) | 상위 클래스 판정 후 `EstTime` 차 < 3초면 경보 |
| 11 | **2D 트랙 맵** | `WeekendInfo: TrackName/TrackID`, `CarIdxLapDistPct`, `CarIdxTrackSurface`, `CarIdxOnPitRoad`, `CarIdxClass`, `PlayerCarIdx`, `SessionFlags`, `SplitTimeInfo: Sectors` | 서킷 SVG 경로는 세션 TrackName 기반 매핑. `LapDistPct`(0.0~1.0)를 SVG path 길이에 매핑. 사고 지점(Hazard) 및 3섹터 동적 컬러링 연동 |
| — | **콕핏 허브** | `Gear`, `RPM`, `Speed`, `Throttle`, `Brake`, `Clutch`, `SteeringWheelAngle`, `PushToPass` | `Speed`는 **m/s** → km/h는 ×3.6 |

> **섹터 정확도 경계:** `SplitTimeInfo`를 사용하면 트랙이 정의한 split 경계는 정확히 구분할 수 있지만, split 개수는 트랙에 따라 달라 F1식 3구간을 보장하지 않습니다. 정확히 3구간인 세션만 S1/S2/S3에 1:1 매핑하고, 그 외에는 별도 집계 정책 없이는 3섹터로 재해석하지 않습니다. 또한 공유 메모리에는 상대 차량별 섹터 스플릿/델타가 없고 클라이언트 델타 변수도 플레이어 전용이므로, 렐러티브 상대 행의 Purple/Green/Yellow 및 F1의 전체 드라이버 기준 Purple은 네이티브 데이터만으로 확정할 수 없습니다. 현재 M2.4는 목업 프리뷰이며 실제 `SplitTimeInfo` 파서는 M5에서 연결합니다.

### 구현 시 자주 틀리는 것

- **단위:** `Speed`=m/s, `WindDir`/`Yaw`/`SteeringWheelAngle`=라디안, 타이어 압력=kPa, 온도=°C. `DisplayUnits`(0=english/1=metric)로 유저 설정 확인 가능.
- **`LapDistPct`는 0.0~1.0** 입니다(설명의 `(%)` 표기에 속지 말 것).
- **`CarIdx*` 배열은 항상 64칸 고정**이고, 빈 슬롯은 `-1` 또는 `0`이 들어있습니다. `PlayerCarIdx`로 내 인덱스를 찾고, `CarIdxLap == -1`인 슬롯은 걸러내야 합니다.
- **드라이버 메타데이터(이름/번호/국가/iRating/SR/차종)는 텔레메트리에 없습니다.** 세션 YAML 문자열을 파싱해야 합니다 (`irsdk_getSessionInfoStr`).
- **`_ST` 접미사 변수는 360Hz 샘플 6개 묶음**입니다. 60Hz 오버레이에서는 마지막 값 하나만 쓰거나 무시하면 됩니다.
- **`SessionFlags`는 비트필드**라 `flags & irsdk_yellow` 형태로 검사합니다. 여러 플래그가 동시에 켜집니다.

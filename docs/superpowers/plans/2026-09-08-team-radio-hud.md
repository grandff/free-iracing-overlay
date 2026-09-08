# F1 Team Radio & Race Comms HUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the ultra-lightweight F1 Team Radio & Race Comms HUD widget integrating real-time voice transmission speaker detection (`RadioTransmitCarIdx`) and official iRacing system event notifications verbatim with optional 7-language localization.

**Architecture:** Pure Solid.js reactive component with Tailwind CSS, SVG animated audio waveform, auto-hide timer lifecycle, zero external heavy dependencies, seamless Alt+J dragging and scaling, 100% i18n support.

**Tech Stack:** Solid.js, TypeScript, Tailwind CSS, Vite.

## Global Constraints
- RAM < 50MB, CPU < 1% at 60Hz.
- Telemetry-First Rule: `RadioTransmitCarIdx`, `SessionFlags`, `CarIdxTrackSurface`.
- No fabricated dialogue: verbatim system messages by default with optional 7-language translation.
- 100% i18n across `ko`, `en`, `zh`, `ja`, `de`, `fr`, `it`.
- Ponytail principle: zero heavy external sound processing libraries.

---

### Task 1: Store & i18n Localization Definitions

**Files:**
- Modify: `src/stores/settingsStore.ts`
- Modify: `src/i18n/locales.ts`

- [ ] **Step 1: Update `settingsStore.ts` with `teamRadio` settings**
Add widget configuration for `teamRadio` including `translateSystemMessages: false` (default verbatim original).

- [ ] **Step 2: Update `locales.ts` with all 7 languages**
Add dictionary keys for widget names, settings descriptions, and exact system message translations for `ko`, `en`, `zh`, `ja`, `de`, `fr`, `it`.

- [ ] **Step 3: Verify TypeScript compilation**
Run: `npm run build`

---

### Task 2: Mock Telemetry Engine Updates

**Files:**
- Modify: `src/services/telemetry/mockEngine.ts`

- [ ] **Step 1: Add radio and system event fields to mock engine**
Provide `RadioTransmitCarIdx`, `RadioTransmitRadioIdx`, and periodic radio speaker simulation (`carIdx: 1` Max Verstappen, `carIdx: 44` Lewis Hamilton, `carIdx: 0` Player) and flag events in mock telemetry.

- [ ] **Step 2: Verify TypeScript compilation**
Run: `npm run build`

---

### Task 3: Implement `TeamRadio.tsx` Widget Component

**Files:**
- Create: `src/components/widgets/TeamRadio.tsx`

- [ ] **Step 1: Build F1 Broadcast Radio Card layout**
- Header with `{DRIVER_LASTNAME} RADIO`, prominent bold car number in team accent color, official SVG team logo.
- Animated audio waveform equalizer bars (5 bars pulsing via CSS animation).
- Message body: verbatim system message (or localized if setting enabled) or transmission status `[TEAM RADIO]`.
- Auto-hide lifecycle: fades in on event/transmission, auto-hides after 3.5 seconds of silence.
- Alt+J edit mode: displays interactive preview with drag handle, scale controls, and a [Test Radio] toggle.

- [ ] **Step 2: Connect to `telemetryStore` and `settingsStore`**
Reactively listen to `RadioTransmitCarIdx`, `SessionFlags`, pit surface, and hazard distance.

- [ ] **Step 3: Verify TypeScript compilation**
Run: `npm run build`

---

### Task 4: Integrate Widget into `App.tsx` and Control Panel

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/control/ControlApp.tsx`

- [ ] **Step 1: Add `TeamRadio` to `App.tsx`**
Mount `TeamRadio` within the overlay canvas when enabled.

- [ ] **Step 2: Add `TeamRadio` toggles to Control Panel**
Allow toggling widget visibility and switching `translateSystemMessages` in settings.

- [ ] **Step 3: Verify TypeScript compilation and bundling**
Run: `npm run build`

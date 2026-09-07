---
name: f1-style-overlay-design
description: Design, implement, or review racing-game HUDs and broadcast overlays with a modern Formula-style visual language: timing towers, lap and sector timing, telemetry, race-control alerts, and high-speed motion. Use for in-race driver HUDs, spectator overlays, replays, telemetry screens, or requests for an "F1-style" racing interface. Do not use for ordinary automotive websites or unrelated dashboards.
---

# F1-Style Racing Overlay Design

Create racing interfaces that feel fast, exact, competitive, and broadcast-ready while remaining readable during actual driving. Treat Formula 1 as a reference for information hierarchy and race semantics, not as a kit of logos, fonts, and decorative slashes to copy.

The defining quality is **high information density under motion, with zero ambiguity about what matters now**.

## Non-negotiable outcome

The finished overlay must:

- Communicate the current race state in one glance.
- Keep the road, braking point, apex, mirrors, and nearby cars unobstructed.
- Give numbers stable geometry so live values never make the layout jump (`font-variant-numeric: tabular-nums`).
- Distinguish urgent state, live performance, and secondary context.
- Use motion to explain change, not to decorate idle UI.
- Remain usable across bright tracks, night races, rain, cockpit shake, and replay cameras.
- Feel inspired by elite motorsport without claiming to be an official Formula 1 product.

## Rule zero: do not reduce the style to red, black, and slanted boxes

That treatment produces a generic esports skin. The real design language comes from:

1. Strong ordering of live information.
2. Dense but disciplined typography (`Formula1`, `Titillium Web`, `Chakra Petch`, `Barlow Condensed`).
3. Stable timing columns and tabular numerals (`tnum`).
4. Dark, compact surfaces with restrained accent rails.
5. Race colors that carry established meanings (Purple: overall best, Green: personal best, Yellow: slower/caution).
6. Crisp, directional transitions tied to events.
7. Team color identifiers (Red Bull, Ferrari, Mercedes, McLaren, Aston Martin, etc.) as vertical color bars.
8. Tire compound badges (Soft `S` in red, Medium `M` in yellow, Hard `H` in white, Intermediate `I` in green, Wet `W` in blue).

## Information hierarchy

Organize every datum into one of four tiers:

| Tier | Purpose | Examples | Treatment |
| --- | --- | --- | --- |
| 1 | Immediate safety or required action | red/yellow flag, pit limiter, penalty, critical fault | Highest contrast, explicit label, protected position |
| 2 | Continuous driving state | gear, shift point, delta, position, lap | Persistent, large enough for peripheral recognition |
| 3 | Tactical context | gaps, tyre age, energy, active aero/DRS, pit window, map | Compact and persistent or easily revealed |
| 4 | Diagnostic detail | temperatures, wear, damage breakdown, strategy detail | On demand; never compete with Tier 1–2 |

## Visual system

### Palette

Use near-black layered surfaces rather than pure black slabs. Keep white for primary data, cool gray for labels, and team/race accents for identity and emphasis.

```css
:root {
  --race-ink: #080a0e;
  --race-panel: rgba(14, 17, 23, 0.92);
  --race-panel-soft: rgba(14, 17, 23, 0.76);
  --race-panel-raised: rgba(28, 32, 41, 0.96);
  --race-text: #f7f8fb;
  --race-text-muted: #a9b0bc;
  --race-line: rgba(255, 255, 255, 0.14);
  --race-accent: #e10600;

  /* Official Motorsport Delta & Sector Colors */
  --race-sector-best: #b055f5;       /* Purple: Session Best */
  --race-sector-personal: #00d26a;   /* Green: Personal Best */
  --race-sector-slower: #e5b932;     /* Yellow: Slower / Caution */

  /* Official Tire Compounds */
  --tire-soft: #e10600;
  --tire-medium: #ffd100;
  --tire-hard: #ffffff;
  --tire-inter: #39b54a;
  --tire-wet: #0090ff;
}
```

### Typography

- Primary display and numbers: `Formula1`, `Titillium Web`, `Chakra Petch`, or `Barlow Condensed` with `font-variant-numeric: tabular-nums`.
- Live timing numbers must never jitter horizontally when changing values.
- Monospace or tabular numerals with fixed character widths are mandatory.
- Driver names formatted with bold surname or 3-letter timing code (`VER`, `LEC`, `HAM`, `NOR`).

### Timing Tower (Leaderboard)

- Slim, compact vertical layout on the left edge.
- Position (`P1`, `P2`, `P3`) in tabular font.
- Team color vertical pill (3-4px wide) on the left of each row.
- Driver timing abbreviation (`VER`, `LEC`, `HAM`) or `Firstname. SURNAME`.
- Tire compound circular badge with colored rim (`S`, `M`, `H`).
- Delta column: `LEADER`, `+0.421`, `+1.825` in crisp monospace with fixed widths.
- Interval vs Leader delta mode.

### Cockpit Telemetry Hub

- Centered on the bottom of the screen.
- Giant, crisp gear display with shift point flash.
- Dynamic curved or segmented RPM rev LED bar (Green -> Red -> Blue/Purple shift flash).
- Speed in large tabular digits with unit `KM/H`.
- Real-time throttle (Green bar) and brake (Red bar) input indicators.
- Live Lap Delta badge with purple/green/yellow dynamic color fill.

### Tactical Relative (Nearby Cars)

- 내 차량 기준 앞뒤 근접 차량 표시.
- Clear distinction for driver's own car (highlighted row with team/cyan accent).
- Time gap relative to driver (`-0.42s`, `0.00s`, `+1.02s`).
- Lapped / backmarker indicator (dimmed text / blue flag indicator).

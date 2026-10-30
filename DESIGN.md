 er 

# Learnish — Design System: Dark Geometric & Amber Precision

# Learnish — Design System: Bauhaus

## 1. Aesthetic Identity & Philosophy

- **Mode:** Operate (Precision Lexical Instrument).
- **Adult, Academic, Mechanical:** An authoritative, distraction-free learning instrument. Zero childish gamification (no confetti, no bouncing mascots, no emoji icons).
- **Dark Architectural Planes:** Deep obsidian ground (`#0D0E12`), charcoal active surfaces (`#181A20`), and quiet secondary panels (`#242730`) separated by crisp 2px structural borders (`#2A2D37`).
- **Mechanical Neo-Brutalist Interaction:** Zero-radius square geometry (`0px`), hard pure-black offset shadows (`4px 4px 0px #000000` / `6px 6px 0px #000000`) with zero blur, and physical depression on click (`translate`) with `80ms cubic-bezier(0.2, 0, 0, 1)` snap timing.
- **Typographic Authority:** `Host Grotesk` for display, headings, and lexical items; `JetBrains Mono` (`tabular-nums`) for counters, keyboard bindings, phonetics, and telemetry.

## 1. Aesthetic Identity

- Off-white ground, black seams, flat red / blue / yellow planes. No gradients, glass or soft shadows.
- Square corners everywhere; circles are reserved for the primary dashboard action. One blue triangle sits in the brand cell.
- Hard black offset shadows; press collapses the shadow, hover changes fill. No animated travel (`--dp-motion-snap: 0s`).
- Active state = blue plane + yellow text + red edge + triangle marker (never colour alone).
- The logo asset (`logo.svg`) is fixed and untouched.
- Typography: Host Grotesk (display 800, action 750); JetBrains Mono for counters and telemetry.

## 2. Design Tokens

- `--dp-color-ground`: `#0D0E12`
- `--dp-color-surface`: `#181A20`
- `--dp-color-quiet`: `#242730`
- `--dp-color-accent`: `#E89D1F`
- `--dp-color-field`: `#54311C`
- `--dp-color-field-support`: `#FCE179`
- `--dp-color-ink`: `#F4F1EA`
- `--dp-color-ink-muted`: `#8B8E98`
- `--dp-color-border`: `#2A2D37`
- `--dp-color-border-accent`: `#E89D1F`
- `--dp-color-success`: `#2E7D32`
- `--dp-color-success-bg`: `rgba(46, 125, 50, 0.15)`
- `--dp-color-error`: `#D32F2F`
- `--dp-color-error-bg`: `rgba(211, 47, 47, 0.15)`
- `--dp-radius-square`: `0px`
- `--dp-border-heavy`: `2px solid var(--dp-color-border)`
- `--dp-shadow-hard-lg`: `6px 6px 0px #000000`
- `--dp-shadow-hard-md`: `4px 4px 0px #000000`
- `--dp-motion-snap`: `80ms cubic-bezier(0.2, 0, 0, 1)`

## 2. Tokens (light default, `[data-theme="dark"]` = same planes on black)

- `--dp-color-ground` `#F5F4EE` · `--dp-color-surface` `#FFFFFF` · `--dp-color-quiet` `#E8E8E8`
- `--dp-color-accent` `#FF0000` (red plane; text on it is black)
- `--dp-color-field` `#0000FF` (blue plane; text on it is yellow/white)
- `--dp-color-field-support` `#FFFF00`
- `--dp-color-emphasis` `#0000FF` (text on ground/surface) · `--dp-color-accent-ink` `#C40000` (small red text)
- `--dp-color-ink` `#000000` · `--dp-color-border` `#000000`
- `--dp-border-rule` `4px` · `--dp-border-rule-compact` `3px` · `--dp-radius-circle` `50%`

## 3. Rules of thumb

- Yellow text only on blue or black; never on off-white/white.
- Red text on light planes uses `--dp-color-accent-ink`.
- Composition overrides live in section 10 of `app.css`.

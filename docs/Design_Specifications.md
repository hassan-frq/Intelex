# Intelex — Design Specifications (Gold/Navy Theme)

This is the current, authoritative design spec for the Intelex app shell.
It supersedes `ui_guidelines.md`, which documents an old zinc/blue theme
that is no longer used anywhere in the app.

**Already built to this spec:** Sidebar, Navbar, Dashboard, Case Book,
Speech to Text, Settings.

**Still needed:** Previous Cases, Generate Document, Preview. Follow this
document exactly when building those so the whole app stays visually
consistent — don't introduce new colors, spacing, or component patterns.

Auth pages (Login, Register) intentionally use a **different** theme
(light/navy split-screen with serif accents) and are out of scope for
this document.

---

## Color Palette

| Purpose | Value |
|---|---|
| App background | `#0f1923` |
| Sidebar / navbar background | `#111c27` |
| Card / panel background | `#111c27` |
| Transcript / inset background | `#0a1420` |
| Border | `#1e2d3d` |
| Primary accent (gold) | `#c9a84c` |
| Gold tint background | `rgba(201, 168, 76, 0.08)` |
| Gold tint border | `rgba(201, 168, 76, 0.2)` |
| Gold active nav background | `rgba(201, 168, 76, 0.12)` |
| Primary text | `#e8e0d0` |
| Secondary text | `#8a9baa` |
| Muted text | `#4d6070` |
| Deep muted (hints, disabled) | `#2d4a5e` |
| Error / recording active | `#e05555` |
| Idle indicator | `#2d4a3e` |
| Success (in use for Settings) | `#4caf82` |
| Subtle dark surface (buttons, insets) | `#162030` |

**Gold is the only accent color.** Don't introduce blue, purple, or any
other accent — replace it with gold or fall back to the neutral/muted
palette above. No pure black (`#000000`) or pure white (`#ffffff`)
anywhere — use `#0f1923` and `#e8e0d0` respectively.

---

## Typography

- Font family: Inter for all UI chrome. Georgia serif reserved
  **only** for transcript/document display text (e.g. the speech-to-text
  transcript body) — never for buttons, labels, or nav.
- Page eyebrow: `10px`, `letter-spacing: 0.15em`, uppercase, gold
  (`#c9a84c`), weight 500 — sits above every page title
- Page title: `22px`, weight 600, primary text
- Page subtitle: `13px`, muted text
- Navbar title: `11px`, `letter-spacing: 0.05em`, uppercase, muted text
- Sidebar logo: `16px`, weight 700, primary text, `letter-spacing: 0.02em`
- Nav items: `13px`, muted text inactive, gold when active
- Card section labels: `10px`, `letter-spacing: 0.12em`, uppercase, muted
  text, weight 500
- Body / button text: `13px`, weight 500
- Hint / caption text: `11px`, deep muted (`#2d4a5e`)
- Status labels: `11px`, `letter-spacing: 0.1em`, uppercase

All section/card labels are uppercase at the small sizes above — never
sentence case at label size. The gold uppercase eyebrow above every page
title is the signature element tying every page together — don't skip it
on new pages.

---

## Border Radius

| Element | Radius |
|---|---|
| Cards | `12px` (`rounded-xl`) |
| Buttons and inputs | `8px` (`rounded-lg`) |
| Keyword / tag pills | `20px` |
| Logo mark | `6px` |
| Status dot | `50%` |
| Nav items | `8px` (`rounded-lg`) |

---

## Spacing

- Content area padding: `28px 32px` (`py-7 px-8`)
- Card internal padding: `20px` (`p-5`)
- Gap between cards/sections: `16px` (`gap-4`)
- Sidebar width: `220px`
- Navbar height: `52px`
- Sidebar internal padding: `24px 16px`
- Logo bottom margin: `32px`
- Nav item padding: `9px 12px`
- Pill gap: `8px`
- Pill padding: `5px 12px`

---

## Layout

- Fixed sidebar on the left, full height (`fixed`, `w-[220px]`)
- Navbar fixed at top of content area, `52px` tall
- Content area scrollable, sits to the right of the sidebar, below the
  navbar
- **All pages share the same Sidebar and Navbar** (`MainLayout.jsx`) —
  only the content area changes per page. Don't build a page-specific
  layout wrapper.
- No centered-card layout for inner pages — content flows from top-left
  with the standard content padding above

---

## Components

### Sidebar
- Background `#111c27`, right border `#1e2d3d`
- Logo mark: gold square (`#c9a84c`) with dark letter/icon, bold
  "Intelex" text beside it
- Nav items: icon + label. Inactive: muted text, transparent border.
  Active: gold text, gold tint background (`rgba(201,168,76,0.12)`),
  gold tint border (`rgba(201,168,76,0.2)`)
- Icons: `react-icons/fi` (Feather outline style), `15px`

### Navbar
- Same navy as sidebar (`#111c27`), bottom border `#1e2d3d`
- Left: current page name, small uppercase muted text
- Right: user pill (icon + name) and a logout button, both in a subtle
  dark container (`#162030` background, `#1e2d3d` border)

### Page header
- Gold uppercase eyebrow label above every page title (e.g. "OPERATIONS
  OVERVIEW", "CASE LAW", "DOCUMENT GENERATION") — pick a short
  descriptor fitting the page
- Page title below the eyebrow: `22px`, weight 600, primary text
- Optional one-line subtitle below the title, muted text

### Cards
- Background `#111c27`, border `#1e2d3d`, `border-radius: 12px`,
  `padding: 20px`
- Card section label at the top, in the uppercase muted label style,
  before any content
- Inset areas within a card (text display, transcript, document
  preview): background `#0a1420`, same border, `border-radius: 8px`

### Buttons
- **Primary action** (e.g. record, submit, create): gold tint
  background, gold tint border, gold text — **never a solid filled
  button**
- **Secondary action** (e.g. extract, generate, cancel): `#162030`
  background, `#1e2d3d` border, secondary text — quieter than primary
- Both: full width where appropriate, `border-radius: 8px`, `13px`
  weight 500 text, icon + label
- **Destructive** (delete): same shape as secondary, but text color
  `#e05555`, hover border `rgba(224,85,85,0.35)`

### Inputs and textareas
- Background `#0a1420` (inset dark), border `#1e2d3d`,
  `border-radius: 8px`
- Text color: secondary (`#8a9baa`)
- Focus border: gold (`#c9a84c`)
- Label above the input, in card-label style (uppercase, muted, `10px`)

### Status indicators
- Small circle dot (`8px`, `border-radius: 50%`) + uppercase label
  beside it
- Active/recording: red dot (`#e05555`) + red label
- Idle: dark green dot (`#2d4a3e`) + muted label

### Pills / tags
- Gold tint background, gold tint border, gold text
- `border-radius: 20px`, `padding: 5px 12px`, `12px` font size
- Used for keywords, tags, filters, and status badges (e.g. Case Book's
  Open/In Progress/Closed — see note below)

### Borders throughout
- Default: `1px solid #1e2d3d`
- Active/focus: `1px solid rgba(201, 168, 76, 0.3)` or full gold
  `#c9a84c`
- No box shadows — borders carry the elevation instead (exception: the
  floating "+" action button on Case Book, which does use a subtle
  shadow since it floats above content)

---

## Critical implementation note: hover states need real classes

**Do not put a color that needs a hover variant into an inline `style`
prop.** Inline styles always win over CSS classes in specificity, so a
Tailwind `hover:border-...` or `hover:bg-...` class can never override a
color set via `style={{ borderColor: ... }}`. If a card, button, or nav
item needs to visibly react on hover, its `background`/`border`/`text`
color must be set via Tailwind's arbitrary-value classes
(`bg-[#162030]`, `border-[#1e2d3d]`, `hover:bg-[#1c2a3a]`, etc.), not
`style`. Reserve `style={{}}` only for values that never change (e.g. a
badge whose color depends on status but has no hover behavior).

This caused a real bug on the first pass of the Dashboard and Case Book
(buttons had `transition hover:...` classes that did nothing) — don't
repeat it on Previous Cases or Generate Document.

---

## Status color mapping (reference — Case Book)

The spec's palette only defines gold, red (error), and dark green
(idle) as distinct colors. When a page needs more than two/three status
states (e.g. Case Book's Open / In Progress / Closed), use this mapping
so new pages stay consistent rather than inventing new hues:

- **Open / active / primary state** → gold tint pill
- **In progress / neutral / pending state** → secondary pill (`#162030`
  background, `#1e2d3d` border, `#8a9baa` text)
- **Closed / done / success state** → green tint pill (`#4caf82` text,
  `rgba(76,175,130,0.08)` background, `rgba(76,175,130,0.3)` border —
  same green Settings already introduced for its success message)

---

## Building Previous Cases and Generate Document

1. Use `MainLayout.jsx` — don't build a custom layout, the shared
   Sidebar/Navbar apply automatically.
2. Start every page with the eyebrow + title + subtitle header pattern.
3. Handle loading / empty / populated states explicitly (see Case
   Book's empty-state pattern: dashed border card, muted icon, heading,
   helper text, gold-tint CTA button).
4. Use the color values and component patterns in this document exactly
   — don't eyeball colors from a screenshot, use the hex/rgba values
   above.
5. Create a matching `*Service.js` file in `frontend/src/services/` for
   any API calls, following `caseService.js` as the pattern.
6. If you need a new status/tag color that doesn't fit the mapping
   above, flag it with the team before inventing a new hue — the whole
   point of this palette is that gold is the only accent.
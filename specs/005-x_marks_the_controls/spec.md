<!-- vt.idd:spec -->
## Specification

<!-- vt.idd:spec -->
## Specification

**Feature:** Initial-screen control guide — a "?" button that points a callout at every visible control
**Issue:** #5
**Screen:** `SandboxComponent` (`src/app/sandbox/`). Extends the shared callout from #6 (`src/app/callout/`).

### Summary

The initial screen shows six controls (gear, camera, gamepad, book, pencil, and the 3D view) with no labels, so a first-time user has to guess what each does. This feature adds a **"?" button** alone in the top-right corner, level with the toolbar. Tapping it turns on a **guide**: one callout bubble beside each visible control, each with a short line saying what the control does. Tapping "?" again, pressing Esc, or a tap on the 3D view turns the guide off.

The guide is built as a **reusable multi-callout mode** of the #6 `CalloutComponent`, so the game screen (#35) can reuse it without copying code. The single-callout parameter help from #6 is unchanged. On screens too narrow for the bubbles to sit beside their controls (phones), the toolbar's bubbles stack in a **staircase** below the toolbar, each joined to its icon by a thin leader line.

### User Stories

**US1 — See what each control does (P1)**
As a first-time visitor to the initial screen, I want to reveal a short explanation of every on-screen control at once, so that I understand what I can do without opening each menu to find out.

- **Acceptance 1.1** — *Given* the initial screen with the guide off, *When* I tap the "?" button, *Then* a callout appears beside each of the six controls (gear, camera, gamepad, book, pencil, 3D view) plus the "?" itself, each showing its own title and one short line.
- **Acceptance 1.2** — *Given* the guide is on at 390 px, *When* the bubbles cannot fit beside their icons, *Then* the top row's bubbles (the toolbar and the corner "?") stack in a staircase below it, each joined to its icon by a leader line, with no two bubbles overlapping and no line crossing a bubble.
- **Acceptance 1.3** — *Given* the guide is on, *When* I read the 3D-view bubble, *Then* it sits in open space and its arrow (or line) points at the shell.

**US2 — Turn the guide off (P1)**
As a user who has read the guide, I want obvious ways to dismiss it, so that it does not stay in my way.

- **Acceptance 2.1** — *Given* the guide is on, *When* I tap the "?" again, *Then* every callout disappears and the "?" reports itself not pressed.
- **Acceptance 2.2** — *Given* the guide is on, *When* I press Esc, *Then* the guide turns off.
- **Acceptance 2.3** — *Given* the guide is on, *When* I tap (press and release without dragging) on the 3D view, *Then* the guide turns off.
- **Acceptance 2.4** — *Given* the guide is off, *When* I open the parameters panel, the pencil panel, a parameter ⓘ, or the welcome pop-up, *Then* the guide stays off; and *Given* the guide is on, *When* I open any of those, *Then* the guide turns off first (only one kind of help at a time).
- **Acceptance 2.5** — *Given* the guide is off, *When* I turn it on, *Then* any open panel and any open ⓘ callout close.

**US3 — Keep using the controls while the guide is on (P2)**
As a user exploring the screen, I want the controls to keep working while the guide is visible, so that I can act on what a bubble tells me.

- **Acceptance 3.1** — *Given* the guide is on, *When* I click any toolbar control (gear, camera, gamepad, book, pencil), *Then* it performs its normal action (the callouts never take the pointer).
- **Acceptance 3.2** — *Given* the guide is on, *When* I drag on the 3D view to rotate, or zoom with the wheel or a pinch, *Then* the shell rotates/zooms and the guide stays on.

**US4 — Reuse on the game screen (P2)**
As the developer of #35 (the game's guide), I want the multi-callout guide to be a reusable mode of the shared callout, so that the game screen adds its own guide without duplicating placement or a11y code.

- **Acceptance 4.1** — *Given* the shared callout component, *When* the guide passes it several callouts with anchors, *Then* it places and shows them all together, and the placement is a pure function unit-tested without a DOM.
- **Acceptance 4.2** — *Given* the #6 single-callout parameter help, *When* this feature ships, *Then* every parameter ⓘ still opens its one callout exactly as before.

**US5 — Accessible guide (P3)**
As a user of assistive technology or reduced motion, I want the guide to be announced and calm, so that it works for me too.

- **Acceptance 5.1** — *Given* a screen reader, *When* the guide turns on, *Then* its text is announced through a polite live region, in the order the controls appear on screen.
- **Acceptance 5.2** — *Given* `prefers-reduced-motion: reduce`, *When* the guide turns on, *Then* the callouts appear without animation.
- **Acceptance 5.3** — *Given* the "?" button, *When* inspected, *Then* it has an accessible name ("Mostrar ayuda"), `aria-pressed` matching the guide's state, and `aria-controls` pointing at the guide.

### Requirements (Functional)

- **FR-001** The initial screen MUST include a new "?" button alone in the top-right corner, level with the toolbar and as far from the right edge as the gear is from the left, drawn as an inline SVG matching the toolbar icons (rounded-square border, same content colour and hover colours), sized like them. *(Amended 2026-09-29, decision 14: it was "in the toolbar, after the book".)*
- **FR-002** The "?" button MUST be visible without opening any menu at 320 px, 338 px, 360 px, 390 px, 1280 px and 844×390, MUST NOT overlap another icon, and the toolbar and the "?" MUST stay on one row at those sizes (56 px corner icons under 356 px wide, decision 15).
- **FR-003** The "?" button's hit area MUST be at least 44×44 px.
- **FR-004** Tapping the "?" button MUST toggle the guide on and off.
- **FR-005** When on, the guide MUST show one callout for each of: gear, camera, gamepad, book, pencil, the 3D view, and the "?" button, each with its own title and text.
- **FR-006** Each callout MUST point at its control: with the #6 arrow when it sits beside/adjacent, or with a thin leader line in the staircase layout.
- **FR-007** The 3D-view callout MUST sit in open space with its pointer aimed at the shell.
- **FR-008** Where callouts cannot fit beside their controls, the top row's callouts (the toolbar and the corner "?") MUST stack in a staircase below it (rightmost icon's bubble nearest the row, each dropping only below what is in its way), with no two callouts overlapping, no leader line crossing a callout, and none covering a control — at 360×800, 390×844, 1280×800 and 844×390, and on short phone screens 320×568, 338×643, 360×560, 360×640 and 375×553 (decision 16). 320×454 and 667×320 are best effort.
- **FR-009** The guide MUST turn off on: a second tap of "?", the Esc key, or a tap (press-release without drag) on the 3D view.
- **FR-010** A drag on the 3D view (rotate) and a wheel/pinch zoom MUST work and MUST leave the guide on.
- **FR-011** Opening the parameters panel, the pencil (visualization) panel, a parameter ⓘ, or the welcome pop-up MUST turn the guide off.
- **FR-012** Turning the guide on MUST close any open panel and any open parameter ⓘ callout.
- **FR-013** While the guide is on, all controls MUST remain operable; the callout layer and leader lines MUST NOT capture pointer events.
- **FR-014** The guide MUST re-place every callout when the window resizes or the device rotates, preserving FR-008's no-overlap rule.
- **FR-015** The guide MUST be announced through a polite live region when it turns on, in on-screen order.
- **FR-016** Under `prefers-reduced-motion: reduce`, callouts MUST appear without animation.
- **FR-017** The "?" button MUST expose an accessible name ("Mostrar ayuda"), `aria-pressed` reflecting the guide state, and `aria-controls` referencing the guide.
- **FR-018** The guide MUST be implemented as a reusable multi-callout mode of the shared `CalloutComponent`, with its placement/layout as a pure, unit-tested function, so #35 can reuse it.
- **FR-019** The #6 single-callout parameter help MUST keep working unchanged on both screens.
- **FR-020** Each callout's text MUST be a title plus one short line (about 45 characters, at most 52), stored in `app-strings.ts`, so all callouts fit at 844×390. The wording is the owner's (approved 2026-09-29; the book's bubble is "Bienvenida").
- **FR-021** The "?" callout MUST tell the user how to dismiss the guide ("Toca de nuevo para cerrar", approved).
- **FR-022** The full set of callouts MUST fit without overlap at every supported size; at 844×390 the toolbar callouts MAY sit beside their icons (using the wide axis) rather than stacking, and the layout function MUST guarantee the no-overlap rule by choosing per-callout placement. On short screens (under 700 px tall) the bubbles are more compact, and the 3D view's bubble MAY sit further from the shell, joined by a line through a gap (decision 16).
- **FR-023** On the 3D view, a press-release whose pointer movement stays under a small threshold (≈10 px) and produces no rotation MUST count as a tap (closes the guide); any larger movement is a drag handled by OrbitControls (guide stays on).
- **FR-024** Actions that do not open a competing help surface (e.g. saving the image with the camera) MUST leave the guide on; only opening a panel, a parameter ⓘ, or a pop-up turns it off (FR-011).

### Key Entities

- **GuideCallout** — a callout with an anchor selector, title and text, plus (in staircase layout) a computed leader-line path. Extends the #6 `Callout`.
- **ControlGuide** — the initial screen's guide state: whether it is on, and the list of `GuideCallout`s. Owns toggle/close, mirrors the `ParameterHelp` pattern from #6.
- **Multi-callout layout** — a pure function taking the anchors' boxes, the bubbles' sizes and the viewport, returning each bubble's placement and (when stacked) its leader line — the reusable core #35 consumes.

### Architecture

```mermaid
flowchart TD
  Q["? button (aria-pressed)"] -->|toggle| CG[ControlGuide state]
  CG -->|callouts[]| CC[CalloutComponent guide mode]
  CC --> LAYOUT["layoutGuide() pure fn: beside vs staircase + leader lines"]
  LAYOUT --> LAYER["fixed callout layer (pointer-events: none, polite live region)"]
  PH[ParameterHelp #6] -->|single callout| CC
  CG -. closes .-> PANELS[parameters / pencil panels]
  CG -. closes .-> PH
  CANVAS[3D view] -->|tap| CG
  CANVAS -->|drag / zoom| ORBIT[OrbitControls]
```

The existing `CalloutComponent` renders one bubble from an `@Input() active: Callout`. This feature generalises it to render a set of bubbles (guide mode) while keeping the single-bubble input for #6. A new `layoutGuide()` pure function decides, per bubble, whether it sits beside its anchor (arrow) or in the staircase (leader line), and returns viewport coordinates — unit-tested without a DOM, exactly as `placeCallout()` is today. `SandboxComponent` gains a `ControlGuide` alongside its `ParameterHelp`, wires the "?" button, and extends its existing close rules (menu open, canvas click, Esc) to keep only one help mechanism active.

### Risk Assessments

**Security**

| Risk | Severity | Mitigation |
|------|----------|------------|
| New help text is static app copy; no user input, no new data flow | Low | No handling needed; text lives in `app-strings.ts` |

**Quality**

| Risk | Severity | Mitigation |
|------|----------|------------|
| Six-plus bubbles overlap or run off-screen on small/landscape phones | High | Staircase layout + no-overlap assertions at 9 sizes incl. short phone screens; layout is a pure unit-tested function; 320×454 and 667×320 best effort |
| Tap-to-close conflicts with drag-to-rotate on the 3D view; canvas listens for `mousedown` today, which touch drags may not fire | High | Distinguish tap (press-release, no move) from drag; verify tap AND drag on touch, not only mouse |
| Generalising `CalloutComponent` regresses the #6 single-callout help | Medium | Keep the single `active` input working; #6 specs stay green (FR-019) |
| Leader lines capture pointer events and block controls | Medium | Layer stays `pointer-events: none`; hit-test a control through a line in tests |
| "?" crowds the toolbar on narrow phones (five 68 px icons ≈ 345 px) | Medium | Realised at 338 px (owner's report): the "?" moved to the top-right corner and the corner icons are 56 px under 356 px; one-row assertions at 320/338 px |

### Testing Strategy

- **Unit (pure):** `layoutGuide()` — beside vs staircase decision, leader-line targets, no-overlap, clamped inside viewport; mirrors the existing `placeCallout` spec.
- **Component (Karma, iframe resized to 360×800 / 390×844 / 1280×800 / 844×390):** "?" visible + 44 px hit area + aria; toggle on/off; all seven callouts present; guide-on closes panels/ⓘ; Esc and canvas-tap close; drag/zoom keep it on; pointer passes through to a control; polite live region; reduced-motion.
- **Regression:** the #6 sandbox and game single-callout specs stay green.
- Coverage target and 2-core runs follow the project convention.

### Verification Matrix

| ID | Requirement(s) | Acceptance scenario | Evidence | Status |
|----|----------------|---------------------|----------|--------|
| VM-001 | FR-001,002,003 | "?" alone in the top-right corner, 44 px, one top row, non-overlapping at 320/338/360/390/1280/844×390 | sandbox `the "?" button` (3, incl. `sits on its own in the upper-right corner`) + `shows the "?" on screen, clear of the other icons` ×6 sizes | Pass |
| VM-002 | FR-004,005 | Tapping "?" shows a callout for all seven anchors with title+text | sandbox `shows a bubble beside each control, in reading order, and reports the "?" as pressed` | Pass |
| VM-003 | FR-006,008 | Staircase at 390 px: leader lines, no overlap, no line crossing a bubble | sandbox `stacks the toolbar's bubbles in a staircase on a phone` + `…clear of the lines` ×9 sizes; layoutGuide staircase + `counts controls level with each other as one row` + `a bubble drops only below what is in its way` | Pass |
| VM-004 | FR-007 | 3D-view bubble in open space, pointer at the shell | sandbox `points the 3D view's bubble at the shell` (ShellViewer.shellScreenBox, #shell-region) | Pass |
| VM-005 | FR-004,009,017 | Second "?" tap closes; aria-pressed flips | sandbox `turns off when the "?" is tapped again` | Pass |
| VM-006 | FR-009 | Esc closes the guide | sandbox `turns off with Esc` | Pass |
| VM-007 | FR-009 | A tap on the 3D view closes the guide | sandbox `turns the guide off with a tap (mouse)` / `(touch)…` | Pass |
| VM-008 | FR-010 | Drag rotate / wheel / pinch zoom keep the guide on | sandbox `keeps the guide on while dragging, and the drag rotates the shell` / `…pinching` / `…wheel` | Pass |
| VM-009 | FR-011 | Opening a panel / ⓘ / welcome closes the guide | sandbox `turns off when the parameters panel / pencil panel / a parameter ⓘ / the welcome pop-up opens` | Pass |
| VM-010 | FR-012 | Turning the guide on closes open panels and ⓘ | sandbox `closes the parameters panel and its open ⓘ when it turns on` / `…pencil panel…` | Pass |
| VM-011 | FR-013 | A control works through the callout layer/line (pointer passes) | sandbox `leaves every control reachable` + `lets a press on a bubble or a line through`; callout `never takes the pointer` | Pass |
| VM-012 | FR-008,014 | Resize / rotation re-places callouts, still no overlap | sandbox `re-places the bubbles when the phone turns, still tidy`; callout `re-places the bubbles when the window is resized` | Pass |
| VM-013 | FR-015 | Polite live region announces guide text in on-screen order | callout `reads the guide out politely, bubble by bubble in the given order, skipping the lines` | Pass |
| VM-014 | FR-016 | Reduced motion: no animation | callout `turns off the animation of the bubbles and the lines under prefers-reduced-motion` (mutation-checked) | Pass |
| VM-015 | FR-018 | `layoutGuide()` places a set of callouts; pure, DOM-free unit test | `src/app/callout/layout-guide.spec.ts`: DOM-free, 4 sizes + staircase, beside, bottom row, order | Pass |
| VM-016 | FR-019 | #6 single-callout parameter help unchanged (specs green) | #6 sandbox/game ⓘ specs unchanged (git diff dev: no line removed) and green | Pass |
| VM-017 | FR-020,021 | Text is title + one short line in app-strings; "?" bubble says how to close | `control-guide.spec.ts` (title+short line, "?" says cerrar); text in app-strings, owner approval → SC-006 | Pass |
| VM-018 | FR-022 | The whole callout set fits with no overlap at 844×390, and on short phone screens (the 3D view's bubble may use a line) | sandbox `keeps every bubble on screen, apart…` at 844×390, 320×568, 338×643, 360×560, 360×640, 375×553; layoutGuide `reaches the shell with a line…` | Pass |
| VM-019 | FR-023,024 | Tap under threshold closes; drag rotates and keeps guide on; camera save leaves guide on | sandbox tap / drag specs + `stays on while an image is saved` | Pass |

### Success Criteria

| ID | Criterion | Evidence | Status |
|----|-----------|----------|--------|
| SC-001 | A first-time user can see what every visible control does from one tap, without opening a menu | VM rows above; 305/305 on 2 cores, lint, tsc, build; revert check 50 #5 specs fail on dev templates, 8/8 mutations caught; browser 146/146 | Pass |
| SC-002 | The guide reads cleanly (no overlaps, all on-screen) at 360 px, 390 px, 1280 px and 844×390, and on short phone screens | VM rows above; 305/305 on 2 cores, lint, tsc, build; revert check 50 #5 specs fail on dev templates, 8/8 mutations caught; browser 146/146 (real input, 8 sizes); owner manual §1–§6 | Pass |
| SC-003 | Every control still works while the guide is on, including rotate/zoom on the 3D view | VM rows above; 305/305 on 2 cores, lint, tsc, build; revert check 50 #5 specs fail on dev templates, 8/8 mutations caught; browser 146/146 | Pass |
| SC-004 | The multi-callout guide is reusable by #35 (shared component, pure layout) with #6 help unchanged | VM rows above; 305/305 on 2 cores, lint, tsc, build; revert check 50 #5 specs fail on dev templates, 8/8 mutations caught; browser 146/146 | Pass |
| SC-005 | The guide is keyboard-dismissable, screen-reader announced, and respects reduced motion | VM rows above; 305/305 on 2 cores, lint, tsc, build; revert check 50 #5 specs fail on dev templates, 8/8 mutations caught; browser 146/146 | Pass |
| SC-006 | Owner approves the guide's Spanish text and the screenshots | Text approved 2026-09-29 (owner's wording, `cb0a60a`, pinned by `uses the owner's wording`); screenshots pending on issuecomment-5899391235 | Pending |

### Applicable Conventions

- Angular 17.3 NgModule app; declare any new component in `app.module.ts`.
- Reuse the `--modal-*` CSS tokens and the #6 callout look (80 % background, teal border/arrow).
- UI strings live in `app-strings.ts` (Spanish).
- Tests: Karma/Jasmine in ChromeHeadless; resize the context iframe for viewport specs; ESLint clean; 2-core runs.
- Branch from `dev` (0 behind `main`).

### Complexity

Medium. One new reusable layout mode on an existing component, one screen wired up, one new inline SVG icon, and careful tap-vs-drag handling on the WebGL canvas. No backend, no data model, no new dependency.

### Decisions Made

1. **Help model — callouts pointing at each control** (vs a single pop-up with sections). *Rationale:* the owner's choice; reuses #6 and points directly at each control. (Agreed 2026-09-29.)
2. **Entry point — a new "?" icon**, the book stays for the welcome text (vs repurposing the book). *Rationale:* the book already opens the intro; a dedicated affordance is clearer. *(Its place moved from "in the toolbar, after the book" to the top-right corner: decision 14.)*
3. **Phone layout — staircase with leader lines** (vs titles-only side by side, vs numbers + legend). *Rationale:* keeps a real sentence and a clear pointer per control where side-by-side bubbles would collide.
4. **3D-view pointer — at the shell** (vs a plain bottom-centre bubble). *Rationale:* gives the arrow a concrete target.
5. **3D view while guide on — tap closes, drag/zoom keep it** (vs any touch closes). *Rationale:* lets the user try "drag to rotate" without dismissing the guide.
6. **"?" icon — drawn inline to match the toolbar** (vs waiting for a designer asset). *Rationale:* unblocks the work; approved with the screenshots.
7. **Text — title + one short line ≤~45 chars.** *Rationale:* all callouts must fit at 844×390.
8. **Sizes — add 360 px** to 390/1280/844×390. *Rationale:* the owner's phone; the toolbar is tightest there with the "?" added. *(Extended by decisions 14–16: 320 and 338 px wide, and short phone screens.)*
9. **Reuse — generalise `CalloutComponent` to a multi-callout mode with a pure layout function.** *Rationale:* #35 (the game's guide) reuses it without copying placement/a11y code.
10. **Fit at 844×390 — per-callout placement, beside-when-it-fits, staircase only when narrow** (vs always stacking). *Rationale:* landscape has horizontal room; stacking seven bubbles in 390 px of height would overflow. The layout function guarantees no overlap by choosing placement per callout. (CLARIFY, 2026-09-29.)
11. **Tap vs drag — a press-release under ≈10 px with no rotation is a tap; more is a drag** (vs any touch closing). *Rationale:* the canvas listens for `mousedown` today, and touch drags may not fire it, so the build distinguishes tap from drag and verifies both on touch. (CLARIFY, 2026-09-29.)
12. **Guide persistence — only help-competing surfaces close the guide; a camera save leaves it on** (vs any control action closing it). *Rationale:* the user may act on a bubble (save an image) and keep reading. (CLARIFY, 2026-09-29.)
13. **Leader lines are decorative** (`aria-hidden`); the callout text carries the meaning for assistive tech. *Rationale:* the line is a visual pointer only. (CLARIFY, minor.)
14. **The "?" in the top-right corner, not after the book** (owner, 2026-09-29, after a 338×643 report). *Rationale:* in the toolbar the five icons wrapped to two rows under 345 px; the gear's line ran through the "?" and Ayuda fell back onto Introducción. `findRows()` now counts level controls as one row however far apart, and a stacked bubble drops only below what is in its way.
15. **56 px corner icons under 356 px wide** (vs letting the toolbar wrap, vs teaching the layout two rows). *Rationale:* one row down to 320 px keeps the staircase valid; 56 px is still well over the 44 px hit area.
16. **Short screens: compact bubbles under 700 px tall, and the 3D view's bubble further out with a line** (vs a two-step guide, vs best effort). *Rationale:* phones inside a browser lose 100–150 px; 360×640, 360×560, 375×553 and 320×568 now fit. 320×454 and 667×320 stay best effort.

### Post-Mortem

_(filled after merge)_




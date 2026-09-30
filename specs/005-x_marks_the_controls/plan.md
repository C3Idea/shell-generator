<!-- vt.idd:plan -->
<!-- vt.idd:plan -->
## Implementation Plan

> **Deploy-time snapshot (2026-09-29).** Superseded in places by the spec's decisions 14–17: the "?" is alone in the top-right corner (not after the book), 56 px corner icons under 356 px, compact bubbles and a line for the 3D view on short screens, a 95 % guide background; and by the as-built `layoutGuide(items, measure, viewport)` with `geometry.ts` and a `#shell-region` anchor (not a zero-size canvas marker). `tasks.md`/`tasks.json` are generated from this plan and carry the same snapshot. The spec is the current record.

**Feature:** Initial-screen control guide (#5) — a "?" button opening a callout beside every visible control
**Branch base:** `dev` (0 behind `main`)

### Technical Context

- Angular 17.3 NgModule app; new/changed components declared in `src/app/app.module.ts`.
- Reuses the #6 `CalloutComponent` (`src/app/callout/`), its `--modal-*` tokens and 80 % background, and the `ParameterHelp` state pattern (`src/app/parameter-help.ts`).
- `SandboxComponent` (`src/app/sandbox/`) owns the toolbar and the `<canvas>`; the 3D view is driven by `OrbitControls` on `renderer.domElement` (`src/app/shell-viewer.ts:49`). The canvas already wires `(mousedown)="canvasClickEvent()"`.
- Tests: Karma/Jasmine ChromeHeadless, iframe resized per viewport; ESLint; 2-core runs.

### Gap Analysis (exists vs. to build)

| Area | Exists | To build |
|------|--------|----------|
| Callout rendering | One bubble from `@Input() active: Callout`; `placeCallout()` pure fn | A multi-callout **guide mode** (`@Input() guide: Callout[]`) + `layoutGuide()` pure fn (beside vs staircase, leader lines) |
| Screen help state | `ParameterHelp` (single ⓘ) | `ControlGuide` (on/off + the guide's callouts), close interplay with `ParameterHelp` and the panels |
| Toolbar | 4 inline-SVG icons + bottom-left pencil | A 5th inline-SVG "?" icon, `aria-pressed`/`aria-controls` |
| Canvas interaction | `(mousedown)` closes menus | Tap-vs-drag: a press-release under ≈10 px with no rotation closes the guide; drag/zoom pass to OrbitControls |
| Strings | `app-strings.ts` (Spanish) | 7 title+line pairs, the "?" accessible name and its "how to close" line |
| CSS | callout look, panel caps | staircase offsets + leader-line pseudo-elements; no pointer capture |

### Design

**1. `CalloutComponent` guide mode.** Add `@Input() guide: Callout[] | null`. When set, the component renders each callout in the same `.callout-layer` (still `pointer-events: none`, still a polite live region). Placement calls a new pure function:

```
layoutGuide(anchors: Box[], bubbles: Size[], viewport: Size): GuidePlacement[]
```

Each `GuidePlacement` is a `CalloutPlacement` (reused from #6) plus an optional `leader` (line from the bubble edge to the anchor centre). The function places each bubble beside its anchor when it fits (reusing `placeCallout`'s beside/below/above logic); where the toolbar's bubbles would collide, it stacks them in a staircase below the toolbar (rightmost icon's bubble nearest the toolbar) and returns a leader line for each. It guarantees no two bubbles overlap and none leaves the viewport — pure, unit-tested without a DOM, like `placeCallout`. The `active` single-callout input is untouched (FR-019).

**2. `ControlGuide` (new, `src/app/control-guide.ts`).** Mirrors `ParameterHelp`: `on: boolean`, `callouts: Callout[]`, `toggle()`, `close()`. The callout set is built from anchors (`#help-button`, `#parameters-button`, …) and strings. Its `calloutId`/`aria` helpers feed the "?" button.

**3. `SandboxComponent` wiring.**
- Add `guide = new ControlGuide()` beside `help`. The "?" click calls `guide.toggle()`; turning it on calls `help.close()` and hides both panels (FR-012).
- Give the toolbar buttons stable ids so the guide can anchor to them (gear, camera, gamepad, book already; add ids; the pencil is `#visualization-button`).
- Extend the existing close rules: `hideMenu`/`showMenu`/`showVisualizationMenu` and the parameter-ⓘ handlers call `guide.close()` (FR-011); `onEscape()` also closes the guide.
- **Tap vs drag:** replace the bare `(mousedown)` with `(pointerdown)`/`(pointerup)` on the canvas; record the down point, and on up, if the guide is on and movement < ~10 px, treat it as a tap and `guide.close()`. Larger movement is a drag already consumed by OrbitControls; the camera save and other non-panel actions leave the guide on (FR-024).
- A 3D-view "anchor" for the guide's bubble: a zero-size marker at the shell's screen centre (canvas centre) so `layoutGuide` aims a line at it (FR-007).

**4. The "?" icon.** New inline SVG in the template matching the others: `rect.svg-border` + a "?" glyph in `path.svg-content`, same `viewBox="0 0 67 67"`, same hover rules. Placed after the book button in `#toolbar`.

**5. Strings** (`app-strings.ts`): `GUIDE_*` title/text pairs for gear, camera, gamepad, book, pencil, view, help; `BUTTON_HELP_TITLE = "Mostrar ayuda"`. Draft copy from the issue; owner approves.

**6. CSS** (`callout.component.css`, `sandbox.component.css`): staircase offsets driven by the layout output; a leader line as an absolutely-positioned element or SVG in the layer, `aria-hidden`, `pointer-events: none`. Reduced-motion rule already covers the bubbles.

### Architecture

```mermaid
flowchart TD
  BTN["? button<br/>aria-pressed / aria-controls"] -->|toggle| CG[ControlGuide]
  CG -->|callouts[]| CC["CalloutComponent<br/>guide mode"]
  CC --> LG["layoutGuide() pure fn"]
  LG --> LAYER["callout-layer<br/>pointer-events:none, live region"]
  PH[ParameterHelp #6] -->|active| CC
  CG -. close .-> PH
  CG -. hide .-> PANELS[parameters / visualization panels]
  CANVAS["canvas (pointerdown/up)"] -->|tap<10px| CG
  CANVAS -->|drag/zoom| ORBIT[OrbitControls]
```

### Project Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/app/callout/callout.component.ts` | Modify | Add `@Input() guide`; render the set; call `layoutGuide` |
| `src/app/callout/callout.component.html` | Modify | Loop callouts; add the leader-line element |
| `src/app/callout/callout.component.css` | Modify | Leader-line styles; staircase positioning hooks |
| `src/app/callout/layout-guide.ts` (or in component) | Add | `layoutGuide()` pure fn + `GuidePlacement` type |
| `src/app/callout/callout.component.spec.ts` | Modify | Guide-mode render, live region, pass-through |
| `src/app/callout/layout-guide.spec.ts` | Add | Pure-fn cases: beside, staircase, no-overlap, clamped |
| `src/app/control-guide.ts` | Add | `ControlGuide` state + anchors/strings mapping |
| `src/app/sandbox/sandbox.component.ts` | Modify | `guide`, "?" handler, tap-vs-drag, close rules |
| `src/app/sandbox/sandbox.component.html` | Modify | "?" button; toolbar ids; `<app-callout [guide]>`; pointer events |
| `src/app/sandbox/sandbox.component.css` | Modify | "?" icon fit at 360/390/844×390 |
| `src/app/sandbox/sandbox.component.spec.ts` | Modify | "?" a11y; toggle; close rules; tap/drag; viewports |
| `src/app/app-strings.ts` | Modify | Guide strings + "Mostrar ayuda" |

### Constitution Check

No `.vt/memory/constitution.md` or `foundational-principles.md` in the repo — no architectural gate applies. No new dependency, no data model, no backend, no new external service.

### Testing Strategy

- **RED first** on `layoutGuide()` and the guide-mode component and the sandbox "?" behaviour; assert the guide is actually shown/hidden before asserting placement (the #6 lesson).
- Viewport specs resize Karma's iframe to 360×800 / 390×844 / 1280×800 / 844×390.
- Regression: #6 single-callout specs stay green.
- Revert guard: new specs fail on `dev`.
- Owner-facing: screenshots at the four sizes; a real-device tap/drag check.

### Known Limitations / Risks

- The canvas moves from `mousedown` to pointer events; must confirm menus still close on a plain click and OrbitControls still gets its events.
- Very short screens may still be tight with seven bubbles; `layoutGuide` guarantees no overlap by placement, but a real-device pass at 360 px and 844×390 is the check.
- Real-Chrome (Claude in Chrome) may be unavailable (as in #6); the owner's manual pass covers it.


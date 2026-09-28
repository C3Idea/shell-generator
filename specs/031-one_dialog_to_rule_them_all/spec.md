<!-- vt.idd:spec -->
## Specification

## Summary

Replace the six hand-built pop-ups on the initial (`SandboxComponent`) and game (`GameComponent`) screens with **one shared `ModalComponent`** built on the native `<dialog>` element and styled after [Pico.css](https://picocss.com/docs/modal) v2's modal design rules (layout, spacing, rounding, shadow, structure — **not** the Pico dependency; the app keeps its Lucida fonts and teal `#77aca2` accents). The component centralises the duplicated `.modal*` CSS, the manual `style.display` open/close logic and the `modalMouseDown` backdrop-close chains into one place, closing the `.modal-button-bar` duplicate-definition conflict in `game.component.css`.

**Why:** six pop-ups are each built from scratch with duplicated CSS (the white box is written four times under four names), duplicated open/close logic, and accessibility gaps (only *Nuevo juego* has `role="dialog"` and Esc support). This component is the base for #3, #10 and #17, which then change only content or styling on the shared box.

This issue closes **#1** (translucent backdrop) as well as **#31**: the shared `::backdrop` gives every pop-up on both screens the same full-viewport 40% black overlay, so the PR closes both.

## User Stories

### US-1 — Player closes any pop-up consistently (P1)
As a player, I want every pop-up to close the same three ways, so the app feels predictable.

- **Scenario 1** — *Given* any of the six pop-ups is open, *When* I press **Esc**, *Then* the pop-up closes and its backdrop is removed.
- **Scenario 2** — *Given* any of the six pop-ups is open, *When* I click the backdrop outside the box, *Then* the pop-up closes.
- **Scenario 3** — *Given* any of the six pop-ups is open, *When* I click the header **✕** button, *Then* the pop-up closes.
- **Scenario 4** — *Given* a pop-up closes by any means, *When* it closes, *Then* the parent component's open state is updated (the `(closed)` output fires) so the pop-up will not silently reopen.

### US-2 — Player uses each pop-up's existing behaviour unchanged (P1)
As a player, I want each pop-up to behave exactly as it does today apart from its new look.

- **Scenario 5** — *Given* the initial screen loads, *When* it finishes initialising, *Then* the welcome pop-up opens automatically.
- **Scenario 6** — *Given* the game screen loads, *When* it finishes initialising, *Then* the how-to pop-up opens automatically.
- **Scenario 7** — *Given* I reach the target in a game, *When* the win is detected, *Then* the ¡Victoria! pop-up opens with its Jugar / Sandbox actions.
- **Scenario 8** — *Given* the how-to and ¡Victoria! pop-ups would both be open on load, *When* the game initialises, *Then* ¡Victoria! renders on top of the how-to pop-up.
- **Scenario 9** — *Given* the Nuevo juego pop-up is open, *When* I choose "Con clave", *Then* the key input row appears and the key input receives focus.
- **Scenario 10** — *Given* the Nuevo juego pop-up opens, *When* it opens, *Then* focus lands on its first choice button (not the ✕).
- **Scenario 11** — *Given* any ⓘ parameter-help button (including "Resolución" on the initial screen), *When* I click it, *Then* the help pop-up opens with that parameter's title and text.
- **Scenario 12** — *Given* a game is already won and its ¡Victoria! pop-up is open, *When* another slider release re-runs the win check, *Then* no error is thrown and the pop-up stays open.

### US-3 — Player on any screen size sees a well-fitted, layered pop-up (P1)
As a player on phone, tablet or desktop, I want the pop-up to fit the screen and sit above everything.

- **Scenario 13** — *Given* any pop-up is open at 390, 768 or 1280 px wide, or at 844×390 landscape, *When* it renders, *Then* the box fits inside the viewport with nothing clipped and long content scrolling inside the box.
- **Scenario 14** — *Given* any pop-up is open on either screen, *When* it renders, *Then* it and its 40% black full-viewport backdrop sit above the 3D canvas, the toolbar, the heat bar and the #11 buttons.
- **Scenario 15** — *Given* a pop-up is open, *When* I try to scroll, *Then* the page behind it does not scroll.

### US-4 — Assistive-technology user reaches pop-ups correctly (P2)
As a screen-reader user, I want each pop-up announced as a modal dialog with its title.

- **Scenario 16** — *Given* any pop-up is open, *When* a screen reader inspects it, *Then* it exposes `role="dialog"` / `aria-modal` (native `<dialog>`) and `aria-labelledby` pointing at the pop-up's `<h2>` title.
- **Scenario 17** — *Given* any pop-up, *When* AT inspects the ✕ button, *Then* it has `aria-label="Cerrar"` (`AppStrings.LABEL_CLOSE`).

## Requirements

### Functional Requirements

- **FR-001** The system MUST provide a shared `ModalComponent` (`<app-modal>`) that wraps a native `<dialog>` rendering an `<article>` with a `<header>` (title + ✕ close button), a projected body, and an optional `<footer>` for action buttons.
- **FR-002** The component MUST open via `showModal()` and close via `close()`, driven by an `[open]` input, and MUST NOT set `style.display` anywhere.
- **FR-003** The component MUST emit a `(closed)` output whenever the dialog closes by any means (✕ click, Esc/native `cancel`, backdrop click).
- **FR-004** The component MUST support opening from code (welcome and how-to open on load: their flags are set in `ngOnInit`, before the first render, and each `<app-modal>` opens in its own `ngAfterViewInit`).
- **FR-005** Calling open while the dialog is already open MUST be a no-op (guard against `showModal()`'s `InvalidStateError`).
- **FR-006** The component MUST close on Esc via the native `cancel` event and MUST emit `(closed)`; the game's `@HostListener('document:keydown.escape')` / `onEscape` (#23) MUST be removed.
- **FR-007** The component MUST close on a backdrop click (click landing on the `<dialog>` element itself, outside the `<article>`) and MUST emit `(closed)`.
- **FR-008** The ✕ close button MUST carry `aria-label="Cerrar"` (`AppStrings.LABEL_CLOSE`), and the dialog MUST set `aria-labelledby` to the id of its `<h2>` title.
- **FR-009** The component MUST support specifying which element receives focus on open (default the ✕; Nuevo juego overrides to its first choice button).
- **FR-010** All six pop-ups (¡Victoria!, Nuevo juego, how-to, game parameter-help, welcome, initial parameter-help) MUST be rendered through `ModalComponent`.
- **FR-011** No `.modal*-content` box classes MAY remain, and neither `game.component.css` nor `sandbox.component.css` MAY retain pop-up rules, apart from content-specific inner layout that must stay local. The duplicate `.modal-button-bar` MUST be removed.
- **FR-012** No component MAY open or close a pop-up by setting `style.display`; the `modalMouseDown` chains MUST be removed.
- **FR-013** Modal styling MUST live as one set of `--modal-*` CSS custom properties in `src/styles.css`, modelled on Pico v2 tokens (spacing 1 rem, border radius 0.25 rem, Pico's box shadow, overlay colour), read by the component's styles. *Amended after review:* inner padding `--modal-padding` 1.5 rem (1.25 rem under 576 px), body line-height 1.65, 1.1 em between paragraphs; the tokens are declared on `:root, ::backdrop` so the overlay also resolves on engines where `::backdrop` doesn't inherit (before Chrome 122 / Firefox 120 / Safari 17.4).
- **FR-014** The box width MUST be capped by breakpoint following Pico (~510 px, widening to ~700 px on large screens, full width minus spacing on phones); height MUST be capped to the viewport with the body scrolling inside.
- **FR-015** Footer buttons MUST order secondary (close/cancel) first, primary (confirm) last, per Pico. Footer "Cerrar" buttons are dropped; footers keep only real actions (¡Victoria!'s Jugar/Sandbox; Nuevo juego's choices + key row). Help, how-to and welcome have no footer.
- **FR-016** The backdrop MUST be a plain `rgba(0, 0, 0, 0.4)` full-viewport overlay via `::backdrop`, set from a custom property, with **no blur**, covering the 3D canvas, toolbar, heat bar and #11 buttons on both screens.
- **FR-017** Pop-up titles MUST render as `<h2>` (the `aria-labelledby` target) and text lines as `<p>`, keeping existing class names used by specs (e.g. `.label-howto-line`).
- **FR-018** Pop-up copy MUST be unchanged (copy changes belong to #3 and #10). The welcome pop-up's empty `<img id="img-intro-equation">` stays for #3.
- **FR-019** The component SHOULD play a short (~150–200 ms) fade/scale on open and close, disabled under `prefers-reduced-motion`.
- **FR-020** Primary buttons MUST be filled teal `#77aca2` with dark ink `#14232a` text (6.3:1; white on this teal is 2.6:1, below WCAG AA) and a `#5f9a90` hover; secondary buttons MUST have a teal outline; the header divider MUST be a light teal tint; fonts stay the app's Lucida stack.
- **FR-021** The component SHOULD offer an opt-in centred variant (`<app-modal class="modal-centered">`: title, text and buttons centred, the ✕ kept at the right). ¡Victoria! uses it; its content is unchanged (the rest of the ¡Victoria! redesign stays in #17).

### Key Entities

- **ModalComponent** — shared Angular component wrapping `<dialog>`; inputs: `[open]`, an initial-focus target; output: `(closed)`; content-projected header title, body and optional footer.
- **AppStrings** — existing string table; `LABEL_CLOSE` = "Cerrar" reused for the ✕ `aria-label`.
- **Host components** — `GameComponent` (four pop-ups) and `SandboxComponent` (two pop-ups) drive `ModalComponent` instances via `[open]`/`(closed)`.

## Approach / Architecture

### Technical Summary

Introduce a presentational `ModalComponent` declared in `AppModule`, wrapping a `<dialog>` accessed via `@ViewChild`/`ElementRef`. An `[open]` input calls `showModal()`/`close()` (guarded); the native `cancel` and backdrop `click` events, plus the ✕ button, all funnel through one close path that emits `(closed)`. The six pop-ups become `<app-modal>` instances with projected content. All modal CSS moves to `--modal-*` custom properties in `src/styles.css` consumed by the component's stylesheet.

### Architecture

```mermaid
flowchart TB
  subgraph Before
    G1[GameComponent]-->|style.display + modalMouseDown|M1[4 hand-built .modal divs]
    S1[SandboxComponent]-->|style.display + modalMouseDown|M2[2 hand-built .modal divs]
    C1[game.component.css]-.dup .modal / .modal-button-bar.->M1
    C2[sandbox.component.css]-.dup .modal.->M2
  end
  subgraph After
    G2[GameComponent]-->|open input / closed output|AM[app-modal ModalComponent]
    S2[SandboxComponent]-->|open input / closed output|AM
    AM-->|showModal/close on dialog|D[native dialog + ::backdrop]
    ST[src/styles.css --modal-* tokens]-->AM
  end
```

### Tech Context

Angular 17.3 (NgModule, not standalone), TypeScript, Karma + Jasmine unit tests. Native `<dialog>` (Safari/iOS 15.4+, 2022 — accepted). No new dependencies; Pico is a style reference only, credited (MIT) in a CSS comment.

### Project Structure Impact

- **Add:** `src/app/modal/modal.component.ts`, `.html`, `.css`, `.spec.ts`.
- **Modify:** `src/app/app.module.ts` (declare `ModalComponent`); `src/app/game/game.component.{html,ts,css,spec.ts}`; `src/app/sandbox/sandbox.component.{html,ts,css,spec.ts}`; `src/styles.css` (add `--modal-*` tokens + `::backdrop`).
- **Remove:** duplicated `.modal*`/`.modal-button-bar` rules from both component CSS files; `onEscape`/`modalMouseDown` and `style.display` toggles from both components.

### Applicable Conventions

- Angular NgModule component declaration (`app.module.ts`).
- `AppStrings` for all user-facing text; specs assert on existing class/id names.
- TestBed specs must register `ModalComponent` wherever `GameComponent`/`SandboxComponent` are rendered.
- Issues/branches per [[workflow-issues-and-branching]]: branch from `dev` (in sync, not behind `main`).

### Decisions Made

- **Close affordances (D1):** *Options* — keep footer "Cerrar" buttons / header ✕ only / both. *Selected:* header ✕ in every pop-up (incl. ¡Victoria!), footer "Cerrar" dropped, footers keep only real actions. *Rationale:* Pico structure; ✕ is consistent and frees the footer for genuine actions. (Owner-confirmed.)
- **Colours (D2):** *Options* — full Pico theme / app teal on Pico layout. *Selected:* white box, teal `#77aca2` primaries, teal-outline secondaries, light-teal header divider, Lucida fonts, `rgba(0,0,0,0.4)` backdrop. *Rationale:* full Pico would restyle every button/input/slider incl. heat bar; keep app identity.
- **Animation (D3):** *Selected:* short (~150–200 ms) fade/scale, off under `prefers-reduced-motion`. *Rationale:* matches Pico; respects motion preferences.
- **#1 fold-in (D4):** *Selected:* #1's backdrop criteria join #31; PR closes both. *Rationale:* one shared `::backdrop` settles #1 definitively.
- **Pico version (D5):** *Selected:* Pico **v2** modal tokens (spacing 1 rem, radius 0.25 rem, v2 shadow, ~510/~700 px widths). *Rationale:* current Pico line.
- **Scroll lock (D6):** *Options* — build a scroll lock / rely on existing. *Selected:* rely on existing `html, body { overflow: hidden }`. *Rationale:* page already cannot scroll; no new code needed.
- **Stacking on load (D7):** *Selected:* ¡Victoria! renders above the how-to via `showModal()` top-layer ordering. *Rationale:* the top layer stacks by open order: a later win opens ¡Victoria! after the how-to, and a win on load opens both in the same pass in template order, so ¡Victoria! is last in `game.component.html` (guarded by a spec).
- **Look refinements after clarification (D8):** *Options* — keep white text on the teal / dark ink; Pico's 1 rem padding / more room; left-aligned ¡Victoria! / centred. *Selected:* dark ink `#14232a` (+ `#5f9a90` hover) for contrast; `--modal-padding` 1.5 rem (1.25 rem on phones), line-height 1.65, 1.1 em paragraphs; ¡Victoria! centred via `modal-centered`. *Rationale:* WCAG AA contrast, and the owner's review of the live build ("the text needs space to breathe", "center the Victoria content").

## Risk Assessments

### Security & Vulnerabilities

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| Projected content injection | Low | Body content is static `AppStrings`, no user HTML | Keep interpolation only; no `innerHTML` |
| Focus trap escape | Low | Native `<dialog>` traps focus; misconfig could leak | Rely on native `showModal()`; test initial focus |

### Regression & Quality

| Risk | Severity | Affected Systems | Mitigation |
|------|----------|------------------|------------|
| `showModal()` on already-open dialog throws | Medium | Game win re-check on each slider release | FR-005 open guard + Scenario 12 spec |
| Removing `onEscape`/`modalMouseDown` breaks close paths | Medium | Both components' close flows | Centralised close path + US-1 specs |
| Existing specs assert `style.display` (~11 refs) | Medium | Game/sandbox spec suites | Migrate assertions to `dialog.open`; register `ModalComponent` in TestBeds |
| `<dialog>` top-layer above canvas/toolbar/heat bar | Medium | Both screens' z-order | `::backdrop` + top-layer; Scenario 14 visual check |
| Landscape/phone clipping | Medium | 844×390 and 390 px | Breakpoint width cap + viewport-capped height, body scroll; Scenario 13 |
| Nuevo juego #23 flows regress | Medium | Key-entry focus flow | Initial-focus input (FR-009); Scenarios 9–10 |

### Testing Strategy

- **New `modal.component.spec.ts`:** open/close via `[open]`, Esc (`cancel`), backdrop click, ✕ click, `(closed)` emitted, `aria-labelledby` set, open-while-open no-op, initial-focus target.
- **Migrated specs:** ~11 `.modal`/`style.display` assertions in game/sandbox specs move to `dialog.open`; every TestBed rendering `GameComponent`/`SandboxComponent` registers `ModalComponent`.
- **Manual/visual:** before/after screenshots of all six pop-ups at 390/768/1280 px (and 844×390) approved on this issue before merge.
- All unit tests pass on the 2-core harness convention if a harness run is requested.

## Verification Matrix

| ID | Acceptance Scenario | Evidence | Status |
|----|--------------------|----------|--------|
| VM-001 | S1: Esc closes any pop-up + removes backdrop | [pending] | Pending |
| VM-002 | S2: backdrop click closes | [pending] | Pending |
| VM-003 | S3: ✕ closes | [pending] | Pending |
| VM-004 | S4: `(closed)` updates parent open state | [pending] | Pending |
| VM-005 | S5: welcome opens on initial-screen load | [pending] | Pending |
| VM-006 | S6: how-to opens on game load | [pending] | Pending |
| VM-007 | S7: ¡Victoria! opens on win with actions | [pending] | Pending |
| VM-008 | S8: ¡Victoria! renders above how-to | [pending] | Pending |
| VM-009 | S9: "Con clave" reveals + focuses key input | [pending] | Pending |
| VM-010 | S10: Nuevo juego opens focusing first choice button | [pending] | Pending |
| VM-011 | S11: parameter help (incl. Resolución) opens with right title/text | [pending] | Pending |
| VM-012 | S12: win re-check while open throws nothing, stays open | [pending] | Pending |
| VM-013 | S13: fits viewport at 390/768/1280 + 844×390, scrolls inside | [pending] | Pending |
| VM-014 | S14: pop-up + backdrop above canvas/toolbar/heat bar/#11 buttons | [pending] | Pending |
| VM-015 | S15: page behind does not scroll | [pending] | Pending |
| VM-016 | S16: `role=dialog`/`aria-modal` + `aria-labelledby` → `<h2>` | [pending] | Pending |
| VM-017 | S17: ✕ has `aria-label="Cerrar"` | [pending] | Pending |

## Success Criteria

| ID | Criterion | Evidence | Status |
|----|-----------|----------|--------|
| SC-001 | All six pop-ups render through the shared `ModalComponent`; no `.modal*-content` classes or duplicate `.modal-button-bar` remain | [pending] | Pending |
| SC-002 | No component uses `style.display` or `modalMouseDown` to open/close pop-ups; `onEscape` removed | [pending] | Pending |
| SC-003 | Every pop-up closes via Esc, backdrop click and ✕, emitting `(closed)` | [pending] | Pending |
| SC-004 | Every pop-up exposes `role=dialog`/`aria-modal` and `aria-labelledby`→`<h2>`; ✕ has `aria-label="Cerrar"` | [pending] | Pending |
| SC-005 | Every pop-up fits the viewport at 390/768/1280 px and 844×390 with inner scrolling; page behind does not scroll | [pending] | Pending |
| SC-006 | Pop-ups + 40% black backdrop sit above canvas, toolbar, heat bar and #11 buttons on both screens (closes #1) | [pending] | Pending |
| SC-007 | All existing pop-up behaviours (auto-open welcome/how-to, ¡Victoria! on win, #23 Nuevo juego flows, parameter help incl. Resolución) preserved; copy unchanged | [pending] | Pending |
| SC-008 | Modal styling is one `--modal-*` token set in `src/styles.css`; Pico credited (MIT) in a CSS comment; no Pico dependency added | [pending] | Pending |
| SC-009 | New component specs + migrated `dialog.open` specs pass; all tests green | [pending] | Pending |
| SC-010 | Before/after screenshots of all six pop-ups at 390/768/1280 px approved on this issue before merge | [pending] | Pending |

## Complexity Considerations

- **Size:** Medium. One new component + refactor of six call-sites across two components; ~11 spec migrations; CSS consolidation. Deliverable in one PR, suggested in stages (component + specs → game's 4 → initial's 2 → screenshots).
- **Open questions:** none blocking — decisions D1–D7 resolved with the owner (comment 5821228870). Firefox/WebKit visual parity is manual/screenshot-based; no automated cross-browser run planned unless requested.

## Post-Mortem

_Filled after merge. Do not complete during specification._

| Category | Finding |
|----------|---------|
| Risks that materialized but were not declared | |
| Declared risks that did not materialize | |
| Review findings the risk assessment missed | |
| Template sections that were not useful | |
| Process improvements for next feature | |

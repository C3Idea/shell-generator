<!-- vt.idd:plan -->
<!-- vt.idd:plan -->
## Implementation Plan

**Generated**: 2026-09-30
**Issue**: #3 — [Initial screen] Welcome pop-up: new copy mentioning the game + show the equation

### Technical Context

Angular 17 (NgModule app), TypeScript, Karma/Jasmine + ChromeHeadless (single
headless run since #18), viewport pinned via `src/testing/viewport.ts`. The welcome
pop-up is `#modal-intro`, a shared `<app-modal>` (#31) in
`src/app/sandbox/sandbox.component.html`, opened on `ngOnInit` and from the intro
(book) button. Styling uses the `--modal-*` tokens from `src/styles.css`. **No new
runtime dependency** — the equation is native MathML markup. Decisions D1–D8 from the
spec are fixed inputs.

### Research Findings

- **Equation source**: `surfaceFunction()` in `src/app/shell-viewer.ts:186-218` is
  Atractor Shell Model IV. `x = d·[A·sinβ·cosθ + r_e·cos(s+φ)·cos(θ+Ω) −
  r_e·sin(s+φ)·sinμ·sin(θ+Ω)]·e^(θcotα)`, etc.; `r_e = 1/√((cos s/a)²+(sin s/b)²)`.
  `d` (= D) is fixed at 1 for every preset and the random shell, so the displayed full
  form omits D. `s` is drawn over 0..4π and θ up to `theta·π` in code; the pop-up shows
  the model ranges (0≤s≤2π, θ≥0).
- **a/b/θ help are string-only**: `parameter-help.ts` maps `a`→`LABEL_PARAM_A1_*`,
  `b`→`LABEL_PARAM_B_*`, `theta`→`LABEL_PARAM_THETA_*`. Fixing the wording touches only
  `app-strings.ts`; the map and the game wiring are unchanged. The `a` help is shared
  with `GameComponent`, so `game.component.spec.ts` must expect the new `a` text.
- **Expander pattern**: the parameter ⓘ buttons already use
  `[attr.aria-expanded]`/`[attr.aria-controls]` (`sandbox.component.html:142` etc.).
  The equation expander reuses that pattern (D8) with a boolean field on
  `SandboxComponent` (e.g. `fullEquationOpen`).
- **"Jugar"**: `SandboxComponent.navigateToGame()` (`sandbox.component.ts:254`) already
  does `router.navigate(['game'])`; the button closes the pop-up then calls it.
- **MathML**: MathML Core is baseline in the app's target evergreen browsers (D7); a
  visually-hidden text alternative covers AT and the no-MathML case (FR-009, FR-014).
- **Current intro spec** (`sandbox.component.spec.ts:121-129`) asserts
  `img#img-intro-equation` — that assertion is replaced.

### Data Model

No persistent data. One new UI state field on `SandboxComponent`:
`fullEquationOpen: boolean = false` (the expander's open/closed). New/changed strings
in `app-strings.ts`:

- Rewrite `LABEL_INTRO_LINE1, LINE2, LINE4, LINE5`; **remove** `LABEL_INTRO_LINE3`.
- Add `LABEL_INTRO_EQUATION_CAPTION` ("Con matemáticas… en una sola ecuación:"),
  `LABEL_INTRO_EQUATION_SHOW` ("Ver ecuación completa"),
  `LABEL_INTRO_EQUATION_HIDE` ("Ocultar ecuación completa"),
  `LABEL_INTRO_EQUATION_ALT` (text alternative of the equation),
  `LABEL_INTRO_MORE` ("Conoce más"),
  `LABEL_INTRO_MORE_ARIA` ("Conoce más sobre el modelo en Atractor (se abre en una pestaña nueva)"),
  `LABEL_INTRO_MORE_URL` ("https://www.atractor.pt/mat/conchas/texto1-_en.html"),
  `LABEL_INTRO_PLAY` ("Jugar").
- Fix `LABEL_PARAM_A1_HELP_TITLE/CONTENT` (horizontal), `LABEL_PARAM_B_HELP_TITLE/CONTENT`
  (vertical), `LABEL_PARAM_THETA_HELP_TITLE/CONTENT` (half-turns) per the issue's Text table.

### API Contracts

No network/API. User actions: tap "Ver/Ocultar ecuación completa" → toggles
`fullEquationOpen`; tap "Conoce más" → browser opens the URL in a new tab; tap "Jugar"
→ `introOpen=false` then `navigateToGame()`.

### Architecture

```mermaid
flowchart TD
  ngOnInit --> introOpen[introOpen = true]
  introOpen --> modal["#modal-intro (app-modal)"]
  modal --> copy["LABEL_INTRO_* paragraphs"]
  modal --> eqshort["MathML: helix + ellipse (always shown)"]
  eqshort --> toggle["button aria-expanded=fullEquationOpen"]
  toggle --> eqfull["MathML: full Model IV (hidden until open)"]
  modal --> more["a Conoce más -> atractor (new tab)"]
  modal --> play["button Jugar -> introOpen=false + navigateToGame()"]
  strings["app-strings.ts a/b/θ help"] -.shared.-> game["GameComponent ⓘ"]
```

### Project Structure

- **Modify** `src/app/app-strings.ts` — rewrite intro copy, remove `LINE3`, add the new
  intro labels, fix a/b/θ help wording.
- **Modify** `src/app/sandbox/sandbox.component.html` — remove `<img id="img-intro-equation">`;
  add the equation caption, the MathML fragment (short form + hidden full form), the
  expander button, the "Conoce más" link, the "Jugar" button; rewrite the intro paragraphs.
- **Modify** `src/app/sandbox/sandbox.component.ts` — add `fullEquationOpen`, a toggle
  method, and a "Jugar" handler (close + `navigateToGame()`).
- **Modify** `src/app/sandbox/sandbox.component.css` — remove `#img-intro-equation`; add
  `#intro-equation` box styles (overflow-x:auto inside the box only), expander and link
  styles, using `--modal-*` tokens; reduced-motion rule for the expander (FR-012).
- **Modify** `src/app/sandbox/sandbox.component.spec.ts` — replace the `<img>` assertion;
  add specs for the MathML presence, the expander (label + aria-expanded), Conoce más
  (href/target/rel/aria), Jugar (closes + navigates), a/b/θ help text, no side-scroll at
  the listed sizes, opens on load + book button.
- **Modify** `src/app/game/game.component.spec.ts` — expect the corrected `a` help text.
- **Candidate**: extract the MathML into a small presentational component
  (`src/app/equation/…`) if the inline template grows unwieldy; decided during Wave 2.
  Default is inline template markup to avoid a component for a static fragment.

### Waves

1. **Strings & help fix** — `app-strings.ts`: intro copy (accents, game mention),
   remove `LINE3`, add new intro labels, fix a/b/θ wording. Update `game.component.spec.ts`
   and the sandbox help specs. Low risk; unblocks copy approval.
2. **Equation view** — build the MathML (short helix+ellipse always shown; full Model IV
   in a hidden block), lines pre-split for Chromium; text alternative. Decide
   inline-vs-component.
3. **Wire the pop-up** — edit `#modal-intro`: remove `<img>`, add caption, equation,
   expander (button + aria, `fullEquationOpen`), Conoce más, Jugar; TS handlers; CSS
   (equation box scroll containment, reduced motion). 
4. **Specs & verification** — replace the `<img>` spec; add the equation/expander/link/
   Jugar/help/no-side-scroll/open specs; run lint + tsc + build; keep #31, #5, #6 green.
   Manual: screenshots at 390 & 1280 px (collapsed + expanded); optional screen-reader pass.

### Constitution Check

No `.vt/memory/constitution.md` present — gate is a no-op. No MUST/SHOULD violations
identified. UI/content-only change; the single external surface (the Atractor link) is
mitigated with `rel="noopener"` and a fixed URL.

### Gap Analysis Summary

Everything the plan needs already exists: the shared modal (#31), the aria-expanded ⓘ
pattern (#5/#6), and `navigateToGame()`. The only genuinely new thing is static MathML
markup. Watch points: MathML line-breaking at 320–390 px (contain the sideways scroll to
the equation box), the shared `a` help text rippling into the game spec, and replacing
the existing `<img>` assertion.


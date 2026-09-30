<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Welcome pop-up: new copy mentioning the game + the shell equation

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-30T11:38:23-06:00

---

## Wave 0: Setup

**Purpose**: Baseline

- [x] T001 [W0] Baseline on the branch: full Karma suite (2 cores), lint, build; record counts.

**Wave Gate**: passed

---

## Wave 1: Foundational: strings

**Purpose**: New intro labels and copy

- [x] T002 [W1] Strings in src/app/app-strings.ts: rewrite LABEL_INTRO_LINE1/2/4/5 per #3's Text table (short, accents, names the game), remove LABEL_INTRO_LINE3, add LABEL_INTRO_EQUATION_CAPTION / _SHOW / _HIDE / _ALT, LABEL_INTRO_MORE / _MORE_ARIA / _MORE_URL, LABEL_INTRO_PLAY.

**Wave Gate**: passed

---

## Wave 2: US1: copy that mentions the game

**Purpose**: New paragraphs, empty image removed

- [x] T003 [W2] [US1] US1 copy in #modal-intro (src/app/sandbox/sandbox.component.html): new paragraphs in order, remove the empty <img id="img-intro-equation"> and its CSS rule; replace the <img> assertion in sandbox.component.spec.ts with specs for the new copy (game named, LINE3 gone) and for opening on load and from the book button.

**Wave Gate**: passed

---

## Wave 3: US2: the shell equation

**Purpose**: MathML short + full form, expander

- [x] T004 [W3] [TDD] [US2] US2 equation: native MathML in #modal-intro — helix + ellipse form always shown, full Model IV (no D, lines split by hand) in a block behind a button with aria-expanded/aria-controls (fullEquationOpen + toggle in sandbox.component.ts, label Ver/Ocultar), visually-hidden text alternative; CSS: equation box scrolls sideways inside itself only, no animation under reduced motion. Specs: MathML present, expander toggles label/aria/visibility, no pop-up/page sideways scroll at 320x568, 360, 390, 1280, 844x390 collapsed and expanded, text alternative present.

**Wave Gate**: passed

---

## Wave 4: US3: learn more and play

**Purpose**: Conoce más link, Jugar button, short screens

- [x] T005 [W4] [TDD] [US3] US3 links: "Conoce más" <a> (href LABEL_INTRO_MORE_URL, target=_blank, rel=noopener, aria-label) and "Jugar" button (closes the pop-up, navigateToGame()) in #modal-intro; specs for href/target/rel/name, Jugar closes + navigates, and close button + Jugar reachable by scrolling inside the pop-up at 320x568 and 844x390.

**Wave Gate**: passed

---

## Wave 5: US4: correct parameter help

**Purpose**: a/b/θ help texts

- [ ] T006 [P] [W5] [US4] US4 help: fix LABEL_PARAM_A1_HELP_* (horizontal), LABEL_PARAM_B_HELP_* (vertical), LABEL_PARAM_THETA_HELP_* (medias vueltas) in app-strings.ts per #3's table; specs on the initial screen (a, b, θ ⓘ) and the game (a ⓘ) in game.component.spec.ts.

**Wave Gate**: pending

---

## Wave 6: Polish

**Purpose**: No regressions, verification, owner approval

- [ ] T007 [W6] [US5] US5 + polish: #5 guide's Bienvenida bubble/layout unchanged (existing specs green), #31 modal specs green; full Karma suite on 2 cores, lint, tsc, production build; update PR body with results.
- [ ] T008 [W6] Owner approval: post the copy + ⓘ wording and screenshots (390 and 1280 px, collapsed and expanded) on #3 for approval (FR-011, SC-005, SC-007).

**Wave Gate**: pending

---

## Summary

- **Total Tasks**: 8
- **Completed**: 5
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 62%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

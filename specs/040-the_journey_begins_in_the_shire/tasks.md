<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Welcome pop-up: Comenzar stays in the sandbox

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-10-01T13:37:53-06:00

---

## Wave 0: US1: Comenzar closes and stays

**Purpose**: String, template, handler

- [x] T001 [W0] [TDD] [US1] In src/app/app-strings.ts replace LABEL_INTRO_PLAY with LABEL_INTRO_START = 'Comenzar'. In src/app/sandbox/sandbox.component.html rename #intro-play-button to #intro-start-button, bind (click)=startButtonClick() and LABEL_INTRO_START, update the <app-modal> comment. In sandbox.component.ts replace playButtonClick() with startButtonClick() that only calls closeIntro(); update closeIntro()'s comment. Keep navigateToGame() (toolbar). No initialFocus.

**Wave Gate**: passed

---

## Wave 1: US1/US2: specs

**Purpose**: Footer, no navigation, focus, centring, reach

- [x] T002 [W1] [US2] In src/app/sandbox/sandbox.component.spec.ts: #31 footer spec expects only 'Comenzar'; #3 centring spec and 'Conoce más and Comenzar' describe use #intro-start-button; rewrite 'closes the pop-up and opens the game' to 'closes the pop-up and stays in the sandbox' (Router.navigate not called, introOpen false, parameters unchanged); on-screen specs at 320×568/844×390 use the new button; expander 'collapses on every close' clicks Comenzar; add a focus-on-open spec (document.activeElement is not Comenzar). Revert check: dev's template/component/strings fail only the #40 specs.

**Wave Gate**: passed

---

## Wave 2: Polish: #3 archive and verification

**Purpose**: Superseded notes; lint, test, build

- [x] T003 [W2] Add a 'Superseded by #40' note and inline markers to specs/003-to_infinity_and_the_equation/spec.md and plan.md (D4, FR-007, US3, VM-009, VM-010, other 'Jugar' mentions); comment on #3. Run lint, tests (taskset -c 0,1) and build.

**Wave Gate**: passed

---

## Summary

- **Total Tasks**: 3
- **Completed**: 3
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 100%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Game control guide: a "?" button pointing a callout at every game control

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-29T22:07:39-06:00

---

## Wave 0: Setup

**Purpose**: Baseline

- [x] T001 [W0] Baseline on the branch: full Karma suite (2 cores), lint, build; record counts.

**Wave Gate**: passed

---

## Wave 1: Foundational: shared pieces

**Purpose**: Shared gesture/shell-region helper, parameterised ControlGuide, sandbox migrated

- [x] T002 [W1] [TDD] Extract the canvas tap-vs-drag gesture (presses/pinching, TAP_SLOP, primary-button reset; pointerUp returns tap|gesture) and the shell-region follow (SHELL_REGION_SCALE, position an element from shellScreenBox()) out of SandboxComponent into src/app/shell-region.ts, no Angular dependency. Specs first in shell-region.spec.ts: tap under 10 px, drag over, pinch never a tap, non-primary buttons never tap, primary down resets a lost gesture, follow math at 70 %, null box leaves the element.
- [x] T003 [P] [W1] [TDD] ControlGuide takes its callout list as a constructor parameter; export the initial screen's list (unchanged) and add the game's ten callouts in reading order (gear, camera, home, book, ?, 3D view region, switch, heat bar, Nuevo juego, Compartir) with GUIDE_GAME_* strings (draft wording from the issue). Specs first in control-guide.spec.ts: the list is the one passed in, refresh gives a new array, game list order/ids/anchors, wording pinned.
- [x] T004 [W1] SandboxComponent uses shell-region.ts and new ControlGuide(its list); behaviour unchanged. Gate: #5 and #6 sandbox specs stay green with no spec edits.

**Wave Gate**: passed

---

## Wave 2: US1/US2: the game's guide

**Purpose**: The "?", ids, both canvases, on/off

- [x] T005 [W2] [TDD] [US1] Game: the "?" button alone in the top-right corner (inline SVG like #5, 44x44, name Mostrar ayuda, aria-pressed, aria-controls), ids on the toolbar buttons, heat bar, Nuevo juego and Compartir; <app-callout [guide]>; #shell-region over the VISIBLE viewer; pointer handlers on both canvases. Toggle on/off, Esc, a canvas tap closes, drag/pinch/wheel keep it. Specs first in game.component.spec.ts.

**Wave Gate**: passed

---

## Wave 3: US3: using the screen

**Purpose**: Close rules, keep-on actions, switch flip, resize

- [x] T006 [W3] [TDD] [US3] Game close rules and keep-on actions: turning the guide on closes the gear menu and any ⓘ (and pop-ups in code); opening the menu, a ⓘ, how-to, Nuevo juego or ¡Victoria! closes it; save image, Compartir (alert stubbed) and a switch flip keep it, the flip re-aims #shell-region at the newly visible shell; window resize re-follows the shell with one layout pass. Specs first.

**Wave Gate**: passed

---

## Wave 4: US4/US5: layout and accessibility

**Purpose**: 56 px rule, size sweep, a11y

- [x] T007 [W4] [TDD] [US4] Game layout: @media (max-width:355px) 56 px toolbar icons and "?"; top row on one line at 320-1280 and 844x390. Specs at 360x800, 390x844, 1280x800, 844x390, 320x568, 338x643, 360x640, 360x560, 375x553 on Usuario and Objetivo: every callout on screen, no overlap, no line crossing a callout, none covering a control; resize re-places. Record any size that can only be best effort for the owner.
- [x] T008 [P] [W4] [TDD] [US5] Game accessibility: live region reads the ten callouts in reading order, leader lines aria-hidden, reduced motion removes the animation, the "?" name/aria-pressed/aria-controls/44x44 and matching toolbar look. Specs first.

**Wave Gate**: passed

---

## Wave 5: Polish

**Purpose**: Verification and owner approval

- [ ] T009 [W5] Verify: full suite x3 on 2 cores, lint, tsc, build; revert check (dev game templates/css make the #35 specs fail and nothing else); confirm no copied gesture/layout code (grep TAP_SLOP/SHELL_REGION_SCALE only in shell-region.ts).
- [ ] T010 [W5] Browser check at the listed sizes on Usuario and Objetivo; post the draft wording table and screenshots on #35 for the owner's approval (SC-005, SC-006).

**Wave Gate**: pending

---

## Summary

- **Total Tasks**: 10
- **Completed**: 8
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 80%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

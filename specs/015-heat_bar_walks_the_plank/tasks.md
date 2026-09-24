<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Move the heat bar out of the gear menu

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-23T18:17:19-06:00

---

## Wave 0: Foundational: the heat bar leaves the gear menu

**Purpose**: #result-container becomes a sibling of the menu, fixed bottom-center

- [x] T001 [W0] Move #result-container out of <form #parameters-menu> to a top-level sibling in src/app/game/game.component.html, and give it a base fixed bottom-center position in game.component.css that doesn't depend on the menu.

**Wave Gate**: passed

---

## Wave 1: US1/US2: visible and updating, menu open or closed, both views

**Purpose**: No menuVisible coupling; same update event

- [x] T002 [W1] [US1] Keep the bar visible with the gear menu closed and in place while it's open (no menuVisible coupling); confirm it updates on a parameter slider change and shows in the Objetivo view.

**Wave Gate**: passed

---

## Wave 2: US3: no layout collisions

**Purpose**: Breakpoint row; checked at 390/768/1280 px

- [x] T003 [W2] [US3] Responsive layout in game.component.css: one row between the switch and the #11 buttons on wide screens, its own row above the buttons below a measured breakpoint (~760 px). No overlap or clipping at 390/768/1280 px, clear of the top-right #13 corner, .modal stays above. Record the breakpoint and bar width on #15.

**Wave Gate**: passed

---

## Wave 3: US4 + cleanup

**Purpose**: New help line, aria-label, dead CSS/TS removed

- [x] T004 [W3] [US4] Replace AppStrings.LABEL_HOWTO_WINDOW_LINE3 in src/app/app-strings.ts with the approved text; add aria-label="Qué tan cerca estás del objetivo" to #distance-range.
- [x] T005 [W3] Delete the unused .heat-range.blue / .heat-range.read thumb styles (game.component.css) and the unused distanceRange getter and its @ViewChild (game.component.ts).

**Wave Gate**: passed

---

## Wave 4: Polish: tests and verification

**Purpose**: #11 spec rewritten, new specs, build/test, screenshots

- [x] T006 [W4] Tests in src/app/game/game.component.spec.ts: rewrite the #11 spec that expected the bar inside the menu; add specs for the bar outside the menu, visible with the menu closed and open, value updating on a slider change, LINE3 text and aria-label. Run ng build and ng test on 2 cores; take before/after screenshots at 390/768/1280 px (menu open and closed) for approval on #15.

**Wave Gate**: passed

---

## Summary

- **Total Tasks**: 6
- **Completed**: 6
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 100%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

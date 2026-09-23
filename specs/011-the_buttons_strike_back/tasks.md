<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Move New Game and share-link buttons out of the gear menu

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-23T12:41:40-06:00

---

## Wave 0: Foundational: the buttons leave the gear menu

**Purpose**: #game-actions outside #parameters-menu; #menu-button-row removed

- [ ] T001 [W0] [TDD] Move the buttons (FR-001, FR-002 markup, FR-009): remove #menu-button-row from #parameters-menu and add a #game-actions group (outside the menu, in #main-container) holding <button type="button"> Nuevo juego (newGameButtonClick) and Compartir (generateTargetLinkButtonClick) with their BUTTON_*_TITLE tooltips. RED first in game.component.spec.ts: with the view rendered, both buttons exist outside #parameters-menu; #parameters-menu contains no New Game/share button and still renders its 4 sliders and the heat bar.

**Wave Gate**: pending

---

## Wave 1: US1: Find New Game and share without the menu

**Purpose**: Same handlers from the new place; hidden while the menu is open

- [ ] T002 [W1] [TDD] [US1] US1 behaviour + hide-with-menu (FR-004, FR-005, FR-010): the #game-actions group is rendered only while the gear menu is closed (*ngIf="!menuVisible"). RED: clicking the new Nuevo juego opens the #23 pop-up and leaves the menu closed; clicking Compartir runs the share path (navigator.clipboard.writeText spied, called with the #12 link); after menuButtonClick opens the menu the group is absent, and it returns when the menu closes.

**Wave Gate**: pending

---

## Wave 2: US2: Understand the share button

**Purpose**: "Compartir" + accurate tooltip

- [ ] T003 [W2] [TDD] [US2] US2 copy (FR-006): LABEL_SHARE_GAME "Link" → "Compartir"; BUTTON_SHARE_GAME_TITLE → a tooltip about sharing the player's own shell as a challenge (proposed "Copiar enlace para retar con tu caracol"; final wording approved on #11). RED: the share button's text equals AppStrings.LABEL_SHARE_GAME === 'Compartir' and its title doesn't contain 'objetivo'.

**Wave Gate**: pending

---

## Wave 3: Polish: layout and verification

**Purpose**: CSS at 390/1280, screenshots, harness

- [ ] T004 [W3] Polish: style #game-actions (FR-002, FR-003, FR-007, FR-008): position fixed bottom 5px right 5px, flex row, toolbar palette (teal #77aca2 border, cream #f4e9cd text, hover #e2c16e/#468189); remove #menu-button-row/.menu-action-button rules; at 390 px the group sits on its own row above #toggle-switch; .modal backdrops cover it. Check with Playwright at 390 and 1280 px: visible with the menu closed, no overlap with the switch/toolbar/each other, >= 5 px from edges, labels fit, covered by an open pop-up; screenshots for #11.
- [ ] T005 [W3] Verify acceptance criteria (SC-001..SC-006): npm test green; ng lint no new problems vs dev; tsc clean; npm run build OK; validation harness in ~/00_C3_code/validaciones/shell_generator/11/ (local CI vs dev, revert guard: the new specs fail on dev's code, e2e/visual: visible menu-closed at both widths, hidden menu-open, handlers fire, backdrop covers them, Tab reachable; 2 cores) plus a manual-validation guide.

**Wave Gate**: pending

---

## Summary

- **Total Tasks**: 5
- **Completed**: 0
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 0%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

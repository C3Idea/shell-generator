<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: New Game pop-up: Aleatorio or Introducir clave

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-23T10:51:26-06:00

---

## Wave 0: Foundational: the pop-up exists

**Purpose**: Strings, #modalNewGame markup + ARIA, opened instead of window.prompt

- [ ] T001 [W0] [TDD] New Game pop-up skeleton (FR-001, FR-002 opening, FR-009, FR-010): add AppStrings entries (title, Aleatorio, Introducir clave, confirm, key placeholder/label) and remove the "Clave de juego" literal; add #modalNewGame to game.component.html (.modal backdrop + rounded box, role="dialog", aria-modal="true", aria-labelledby → title; Aleatorio / Introducir clave buttons; hidden key row with a labelled input + confirm; close button); newGameButtonClick() opens it instead of window.prompt (origin 'menu' hides the gear menu). RED first in game.component.spec.ts: newGameButtonClick never calls window.prompt and shows #modalNewGame; the gear menu is hidden; the dialog ARIA attributes and the input label are present.

**Wave Gate**: pending

---

## Wave 1: US1: Random game without a key

**Purpose**: Aleatorio starts an unseeded game

- [ ] T002 [W1] [TDD] [US1] US1 Aleatorio (FR-003, FR-008): randomGameButtonClick → startNewGameFromPopup(undefined), which sets gameId='', closes #modalNewGame and Victoria, and calls newGame(undefined). RED: two Aleatorio in a row give different targets; newGame is called with undefined (never a string); pop-up closed, gear menu still hidden, ?target cleared, cameras at default.

**Wave Gate**: pending

---

## Wave 2: US2: Keyed game to compete

**Purpose**: Key field, trim, case-sensitive, empty = random

- [ ] T003 [W2] [TDD] [US2] US2 Introducir clave (FR-004..FR-006): enterKeyButtonClick reveals the key row and focuses the input; confirmKeyButtonClick (button or Enter) trims newGameKey → startNewGameFromPopup(key) or undefined when empty; gameId = trimmed key; newGameKey resets to '' and the key row hides on every open. RED: same key ⇒ same target to 2 decimals; 'reto1' target equals ShellParameters.randomParameters('reto1'); ' abc ' == 'abc'; 'abc' != 'ABC'; empty and whitespace-only keys ⇒ unseeded, two in a row differ; field empty on reopen; input focused after reveal; Enter confirms.

**Wave Gate**: pending

---

## Wave 3: US3: Cancel without disturbing the game

**Purpose**: Close button, Esc, backdrop

- [ ] T004 [W3] [TDD] [US3] US3 Cancel (FR-007): close button, Esc (HostListener scoped to when #modalNewGame is open) and a backdrop click (modalMouseDown) close the pop-up without calling newGame; the gear menu stays hidden. RED: each of the three paths leaves targetParameters, parameters and gameId unchanged and newGame not called; Esc with the pop-up closed does nothing.

**Wave Gate**: pending

---

## Wave 4: US4: Play again from ¡Victoria!

**Purpose**: Jugar opens the pop-up; cancel keeps Victoria

- [ ] T005 [W4] [TDD] [US4] US4 Play again from ¡Victoria! (FR-002, FR-007): Jugar opens the pop-up with origin 'victory' and leaves #modalWindow shown; cancelling keeps #modalWindow shown; starting a game from it closes both. RED: Jugar shows #modalNewGame while #modalWindow stays displayed; close (all three paths) leaves #modalWindow displayed; Aleatorio/key start hides both.

**Wave Gate**: pending

---

## Wave 5: Polish: styling and verification

**Purpose**: CSS, 390/1280 fit, screenshots, harness

- [ ] T006 [W5] Polish: style #modalNewGame in game.component.css reusing the game's modal look (rounded box, button bar, key row); check that both buttons and the key row fit with no overflow at 390 px and 1280 px; capture before/after screenshots for #23 approval (SC-002, SC-007). No behaviour change.
- [ ] T007 [W5] Verify acceptance criteria (SC-001..SC-007, FR-011): npm test green; ng lint no new problems vs dev; tsc app/spec clean; npm run build OK; grep -n 'window.prompt("Clave de juego"' src/ is empty; validation harness in ~/00_C3_code/validaciones/shell_generator/23/ (local CI vs dev, revert guard: the new specs fail on dev's code, e2e: no window.prompt, Aleatorio twice differs, key parity; 2 cores) plus a manual-validation guide.

**Wave Gate**: pending

---

## Summary

- **Total Tasks**: 7
- **Completed**: 0
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 0%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

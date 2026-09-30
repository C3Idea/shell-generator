<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: How-to pop-up in short sections

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-30T15:38:51-06:00

---

## Wave 0: Setup

**Purpose**: Baseline

- [x] T001 [W0] Baseline on the branch: full Karma suite (2 cores), lint, build; record counts.

**Wave Gate**: passed

---

## Wave 1: Foundational: strings

**Purpose**: New LABEL_HOWTO_* strings

- [ ] T002 [W1] Add the LABEL_HOWTO_* strings from the plan's Data Model to src/app/app-strings.ts (goal, section texts, the two new titles, closing, ¡A jugar!); keep LINE1..4 until T003 removes their last use.

**Wave Gate**: pending

---

## Wave 2: US1+US2: sections

**Purpose**: Goal, five titled sections, closing line

- [ ] T003 [W2] [US1] Rewrite #modal-howto in src/app/game/game.component.html: goal line, five <p class="label-howto-section"><strong>title</strong> · text</p> (three titles bound to GUIDE_GAME_*_TITLE), ⚙ aria-hidden, closing line; remove LABEL_HOWTO_WINDOW_LINE1..4; replace the two old-text specs in game.component.spec.ts with #10 specs for content, order, titles, no position words and no "amarillo".

**Wave Gate**: pending

---

## Wave 3: US3: ¡A jugar!

**Purpose**: Footer button and closing

- [ ] T004 [W3] [US3] Add the "¡A jugar!" footer button (#howto-play-button) and howToPlayButtonClick() in game.component.ts; specs: it closes the pop-up, ✕/Esc/backdrop still close it, the book button reopens it and turns the "?" guide off.

**Wave Gate**: pending

---

## Wave 4: US4: sizes

**Purpose**: No sideways scroll; footer reachable

- [ ] T005 [W4] [US4] Specs at 360, 390, 1280 px and 844×390: no sideways scroll of the pop-up or page; at 844×390 ✕ and ¡A jugar! reachable by scrolling inside the pop-up. Adjust game.component.css section spacing only if needed.

**Wave Gate**: pending

---

## Wave 5: Polish

**Purpose**: Full suite, lint, build, screenshots

- [ ] T006 [W5] Full Karma suite (2 cores), lint and build green; after screenshots at 390 and 1280 px for the owner's approval on #10 (FR-010).

**Wave Gate**: pending

---

## Summary

- **Total Tasks**: 6
- **Completed**: 1
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 16%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

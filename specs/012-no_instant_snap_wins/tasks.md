<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Shared challenge link can start the game already won

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-22T16:14:46-06:00

---

## Wave 0: Clamp link values

**Purpose**: Clamp decoded ?target values to the ShellParameters slider ranges

- [x] T001 [W0] Clamp each decoded value to its ShellParameters min/max in decodeTargetParameters() in src/app/game/game.component.ts; malformed links still return null

**Wave Gate**: passed

---

## Wave 1: Random start for link games

**Purpose**: Link games start A/alpha/beta/a at a random, non-winning position

- [x] T002 [W1] Add fromLink parameter to setupGame() in src/app/game/game.component.ts: randomize A/alpha/beta/a within slider ranges, re-roll while checkParametersAreSimilar() is true (capped at MAX_START_ATTEMPTS), then fall back to the slider end farther from the target
- [x] T003 [W1] Pass fromLink from the constructor (true only when targetParametersFromRoute() returned a target) and false from newGame() in src/app/game/game.component.ts

**Wave Gate**: passed

---

## Wave 2: Clear ?target on New Game

**Purpose**: New Game drops the shared challenge from the URL

- [x] T004 [W2] Remove the ?target query param from the URL in newGame() in src/app/game/game.component.ts via the injected Router, keeping the /game hash route

**Wave Gate**: passed

---

## Wave 3: Verify

**Purpose**: Build and manual verification against the Verification Matrix

- [x] T005 [W3] Run ng build and verify VM-001..VM-005 manually in the browser

**Wave Gate**: passed

---

## Summary

- **Total Tasks**: 5
- **Completed**: 5
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 100%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Compartir shares the objetivo shell

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-10-01T12:24:44-06:00

---

## Wave 0: US1: share the objetivo

**Purpose**: Link encodes the golden shell; tooltip and how-to wording

- [x] T001 [W0] [TDD] [US1] In src/app/game/game.component.ts make getShareableGameLink() encode this.targetParameters (not this.parameters) with the existing encodeTargetParameters; update the comment above it. In src/app/app-strings.ts set BUTTON_SHARE_GAME_TITLE to 'Copiar enlace para retar con el caracol objetivo' and LABEL_HOWTO_NEW_GAME_SHARE to 'Empieza otra partida, o copia el enlace para retar a alguien con el caracol objetivo.'. Leave GUIDE_GAME_SHARE_TEXT, decode/clamp, random start and clearTargetFromUrl alone.

**Wave Gate**: passed

---

## Wave 1: US1/US2: specs

**Purpose**: Specs pin the target link, round trip and new wording

- [ ] T002 [W1] [US2] In src/app/game/game.component.spec.ts: rewrite the 'sharing' spec to assert the link equals the target (2 decimals) and is unchanged after moving the sliders; make the clipboard and prompt specs check the objetivo values, not only the '#/game?target=' prefix; add a round-trip spec (second GameComponent built from the link has the same target to 2 decimals and a non-winning start); tooltip spec expects the new text (drop the 'not objetivo' assertion, reword its title); update the pinned how-to text (~line 1715); reword the #12 spec comments. Revert check: restoring this.parameters fails the new specs and nothing else.

**Wave Gate**: pending

---

## Wave 2: Polish: docs and verification

**Purpose**: Amend #12's archive; lint, test, build

- [ ] T003 [W2] Amend specs/012-no_instant_snap_wins/ spec.md and plan.md (and any other archive text) that say the link shares the player's shell so they point to #39 as reversing that decision. Run lint, tests (taskset -c 0,1) and build.

**Wave Gate**: pending

---

## Summary

- **Total Tasks**: 3
- **Completed**: 1
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 33%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

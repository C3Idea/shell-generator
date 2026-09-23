<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Unit test suite never runs

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-22T19:08:45-06:00

---

## Wave 0: Suite runs green

**Purpose**: Spec discovery on Angular 17, single-run npm test, stale specs fixed

- [x] T001 [W0] Delete src/test.ts; in angular.json test target remove main and set polyfills to [zone.js, zone.js/testing]; drop src/test.ts from tsconfig.spec.json files; package.json test -> ng test --watch=false --browsers=ChromeHeadless, add test:watch -> ng test
- [ ] T002 [W0] Fix stale specs: FormsModule + router in game.component.spec.ts, FormsModule in sandbox.component.spec.ts, real assertion for AppComponent should render title

**Wave Gate**: pending

---

## Wave 1: #12 regression specs

**Purpose**: GameComponent specs guarding the shared-link fix

- [ ] T003 [W1] game.component.spec.ts: decoding specs (clamp incl. Infinity/negatives, d pinned to 1, malformed links -> no-link game) via a fake ActivatedRoute
- [ ] T004 [W1] game.component.spec.ts: random start never wins (incl. Math.random forced onto the target -> farther-end fallback), no-link start at minimums, getShareableGameLink encodes the player's shell

**Wave Gate**: pending

---

## Wave 2: Docs and verification

**Purpose**: README, revert guard, lint comparison

- [ ] T005 [W2] README: document npm test (single headless run) and npm run test:watch
- [ ] T006 [W2] Verify: #12 specs fail on a temp git revert -m 1 6fb91ce and pass without it; ng lint shows no new problems vs dev; test:watch starts watch mode

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

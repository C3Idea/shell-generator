<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Heat bar: normalize the distance so it spans ✗ to ✓ and every parameter counts equally

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-24T12:47:37-06:00

---

## Wave 0: Foundational: one shared played-parameter list

**Purpose**: PlayedParameterKey + ShellParameters.playedParameterKeys; GameComponent uses it

- [x] T001 [W0] In src/app/shell-parameters.ts add `export type PlayedParameterKey = 'A' | 'alpha' | 'beta' | 'a'` and `static readonly playedParameterKeys`. In src/app/game/game.component.ts delete `playerParameterKeys` and make randomizePlayerStart iterate ShellParameters.playedParameterKeys. The #12 link-start specs must still pass.

**Wave Gate**: passed

---

## Wave 1: US1/US2: normalized distance

**Purpose**: distance() over A, α, β, a divided by range, √Σnᵢ²/2×100, with explicit-value specs

- [x] T002 [W1] [TDD] [US1] TDD: add a distance() describe block to src/app/shell-parameters.spec.ts with explicit values: minimums vs maximums ≥ 95 (100); a match reads 0; each of A, α, β, a across its full range with the others matching reads 50 ± 1 and all four are within 1; changing b, μ, ω, φ or θ doesn't change the value. Then rewrite ShellParameters.distance() in src/app/shell-parameters.ts: nᵢ = |Δᵢ| / (maxᵢ − minᵢ) over playedParameterKeys, √Σnᵢ² / 2 × 100.

**Wave Gate**: passed

---

## Wave 2: US2 S4 / US3: game-level guards

**Purpose**: Win-threshold characterization, rescaled bar after release, start reads 0–100

- [ ] T003 [W2] [US3] In src/app/game/game.component.spec.ts add: a win-threshold characterization spec (attempt inside every threshold → checkParametersAreSimilar() true; each of A, α, β, a just outside → false); a spec that the bar shows the rescaled value after a slider release with an explicit target; a spec that a game starting at the slider minimums reads between 0 and 100 for targets at the minimums, midpoints and maximums. No random targets.

**Wave Gate**: pending

---

## Wave 3: Polish: verification

**Purpose**: Lint, test, build on 2 cores; win check/template/CSS unchanged

- [ ] T004 [W3] Verification on 2 cores (taskset -c 0,1, NG_BUILD_MAX_WORKERS=2): ng lint, ng test --watch=false --browsers=ChromeHeadless (repeat the new specs to rule out flakiness), ng build. Confirm the diff against dev leaves checkParametersAreSimilar(), the template and the CSS unchanged.

**Wave Gate**: pending

---

## Summary

- **Total Tasks**: 4
- **Completed**: 2
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 50%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

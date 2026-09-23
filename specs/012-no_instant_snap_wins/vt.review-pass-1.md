<!-- vt.idd:pr-review:pass-1 -->
## Code Review — PR #16: fix: shared challenge link can start the game already won (#12)

> **Codex tip**: Ask here for deeper context on any finding before approving —
> e.g. "walk me through M1 option A", "what files does M1 touch?",
> "combine M1+m1 into one fix". The table rationale is a summary; Codex has
> full diff context.
>
> **Copilot review**: Skipped by config/flag: review.copilot_integration is not set (no vt.config.yaml in this repo).
>
> **Verification**: Not run.

| Severity | Count | IDs |
|----------|-------|-----|
| Critical (C) | 0 | — |
| Security (S) | 0 | — |
| Major (M) | 1 | M1 |
| Minor (m) | 2 | m1, m2 |
| Documentation (D) | 3 | D1, D2, D3 |
| **Total** | **6** | |

---

## Findings

<!-- vt.idd:finding:M1 -->
<!-- vt.idd:recommended:M1:A -->
<details>
<summary><strong>M1 — parameterRanges typed Partial, forcing ! assertions and a dead no-clamp branch</strong> <em>(Major · FG-1 · quality reviewer)</em></summary>

**M1 — parameterRanges typed Partial, forcing ! assertions and a dead no-clamp branch** *(Major · FG-1)*

**File**: `src/app/game/game.component.ts`, L24-L36, L158, L167, L416

**Description**: `parameterRanges` is declared `Readonly<Partial<Record<TargetParameterKey, …>>>` although the literal has all 10 keys. That forces `parameterRanges[key]!` in `randomizePlayerStart()` and a `range ? clamp : value` ternary in `decodeTargetParameters()` whose unclamped branch is unreachable today. If a key is ever added without a range, the compiler stays silent: the random start would produce `NaN` sliders and decoding would stop clamping that key, quietly reopening the hole #12 closes.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Type it as `Readonly<Record<TargetParameterKey, readonly [number, number]>>`; drop both `!` and the ternary so the clamp always runs. | The compiler then requires a range for every key; no runtime change today. | ✓ |
| **B** | Keep `Partial` but throw when a range is missing instead of falling back to the unclamped value. | Fails loudly at runtime, but later than A and keeps the `!` pattern. |  |
| **C** | Leave as is. | Correct today; relies on whoever adds a parameter remembering the range. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:M1 -->

---

<!-- vt.idd:finding:m1 -->
<!-- vt.idd:recommended:m1:C -->
<details>
<summary><strong>m1 — Parameter key lists overlap across three static structures</strong> <em>(Minor · FG-1 · quality reviewer)</em></summary>

**m1 — Parameter key lists overlap across three static structures** *(Minor · FG-1)*

**File**: `src/app/game/game.component.ts`, L18, L24, L38

**Description**: `targetParameterKeys`, `parameterRanges` and `playerParameterKeys` each enumerate overlapping key sets, so adding or removing a parameter touches up to three places.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Derive one list from another (e.g. `targetParameterKeys` from `Object.keys(parameterRanges)`). | Single source of truth, but ties the link's wire order to object key order. |  |
| **B** | Add a comment above each list pointing at the others. | Documents the coupling; relies on discipline. |  |
| **C** | No change: with M1-A, a key missing from `parameterRanges` is a compile error, and `targetParameterKeys` must stay an explicit ordered list because its order is the shared link format. | M1-A removes the drift risk the finding describes; deriving would make the link format depend on object key order. | ✓ |

- [ ] **A**
- [ ] **B**
- [x] **C** *(recommended)*
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m1 -->

---

<!-- vt.idd:finding:m2 -->
<!-- vt.idd:recommended:m2:B -->
<details>
<summary><strong>m2 — `src/util` import differs from the file's relative imports</strong> <em>(Minor · FG-1 · quality reviewer)</em></summary>

**m2 — `src/util` import differs from the file's relative imports** *(Minor · FG-1)*

**File**: `src/app/game/game.component.ts`, L6

**Description**: `import { random } from 'src/util'` is baseUrl-rooted while the other imports in this file are relative.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Use `'../../util'`. | Consistent inside this file. |  |
| **B** | Keep `'src/util'`. | Every existing importer of util (`shell-parameters.ts`, `shell-viewer.ts`) uses `"src/util"`, so this matches the codebase convention for that module. | ✓ |
| **C** | Switch all three util imports to relative paths. | Uniform, but touches files outside this PR's scope. |  |

- [ ] **A**
- [x] **B** *(recommended)*
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m2 -->

---

<!-- vt.idd:finding:D1 -->
<!-- vt.idd:recommended:D1:A -->
<details>
<summary><strong>D1 — Plan names `randomWithGenerator`; the code uses `random`</strong> <em>(Documentation · FG-2 · documentation reviewer)</em></summary>

**D1 — Plan names `randomWithGenerator`; the code uses `random`** *(Documentation · FG-2)*

**File**: `specs/012-no_instant_snap_wins/plan.md`, Technical Context, Research Findings

**Description**: plan.md says the random start reuses `randomWithGenerator(min, max, Math.random)`; `game.component.ts` imports `random` from `src/util` and calls `random(min, max)`. A reader tracing plan to code won't find the named call.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Update both mentions to `random(min, max)` from `src/util.ts`, on the issue's plan comment and the cached plan.md. | Restores plan-to-code traceability; the issue comment is authoritative, so both change together. | ✓ |
| **B** | Leave it as a point-in-time design record. | Plans may diverge, but this archive is presented as the technical record. |  |
| **C** | Add a short "as implemented" note under Research Findings. | Keeps the original text and records the delta. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D1 -->

---

<!-- vt.idd:finding:D2 -->
<!-- vt.idd:recommended:D2:A -->
<details>
<summary><strong>D2 — Plan's `?target` clearing call doesn't match the implementation</strong> <em>(Documentation · FG-2 · documentation reviewer)</em></summary>

**D2 — Plan's `?target` clearing call doesn't match the implementation** *(Documentation · FG-2)*

**File**: `specs/012-no_instant_snap_wins/plan.md`, Research Findings

**Description**: plan.md describes `router.navigate([], { relativeTo: route, queryParams: {} })`, which would drop every query param and says nothing about history. The code uses `queryParams: { target: null }`, `queryParamsHandling: 'merge'` and `replaceUrl: true`; the last one is why Back and reload don't restore the challenge.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Rewrite the bullet to describe `{ target: null }` + `merge` + `replaceUrl: true`, on the issue's plan comment and the cached plan.md. | Matches what ships, including the detail that makes the fix reload-proof. | ✓ |
| **B** | Leave the original text. | Point-in-time record; misleads a reviewer checking the approach. |  |
| **C** | Add a one-line "refined during implementation" note. | Minimal; keeps the original rationale. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D2 -->

---

<!-- vt.idd:finding:D3 -->
<!-- vt.idd:recommended:D3:A -->
<details>
<summary><strong>D3 — Spec's "Clamp link values" omits pinning `d` to 1 (commit 354bb6e)</strong> <em>(Documentation · FG-3 · documentation reviewer)</em></summary>

**D3 — Spec's "Clamp link values" omits pinning `d` to 1 (commit 354bb6e)** *(Documentation · FG-3)*

**File**: `specs/012-no_instant_snap_wins/spec.md`, Proposed Fix, item 2

**Description**: Commit 354bb6e pins `d` (coiling direction, no slider) to 1 when decoding, so an edited link can't mirror the target. The spec's Proposed Fix doesn't mention `d`, while the PR description does.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add a sentence to "Clamp link values" that `d` is pinned to 1, on the issue's spec comment and the cached spec.md. | Keeps the authoritative spec complete and in line with the code and PR description. | ✓ |
| **B** | Leave it; the pinning came after the spec was written. | Expected staleness, but the spec is the acceptance record. |  |
| **C** | Add an addendum at the end of the spec referencing 354bb6e. | Records the delta without editing the original section. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D3 -->

---


## Fix Groups

<!-- vt.idd:fix-group:FG-1 -->
<!-- vt.idd:recommended-disposition:FG-1:Fix -->
**FG-1** — `src/app/game/game.component.ts` · M1, m1, m2 · _Hard (no file overlap with FG-2/FG-3)_

Only M1 changes code; m1 and m2 recommend no change.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-1 -->

<!-- vt.idd:fix-group:FG-2 -->
<!-- vt.idd:recommended-disposition:FG-2:Fix -->
**FG-2** — `specs/012-no_instant_snap_wins/plan.md` + issue #12 plan comment · D1, D2 · _Hard_

The issue comment is authoritative; the local file is re-cached from it.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-2 -->

<!-- vt.idd:fix-group:FG-3 -->
<!-- vt.idd:recommended-disposition:FG-3:Fix -->
**FG-3** — `specs/012-no_instant_snap_wins/spec.md` + issue #12 spec comment · D3 · _Hard_

The issue comment is authoritative; the local file is re-cached from it.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-3 -->


<!-- vt.idd:pr-review:approve -->
## Approve and Proceed

All findings reviewed? Check the box to authorize fix execution.

- [ ] **Approve and proceed** — I have reviewed all findings and dispositions above. Execute fixes per the checked dispositions.
<!-- /vt.idd:pr-review:approve -->
<!-- /vt.idd:pr-review:pass-1 -->

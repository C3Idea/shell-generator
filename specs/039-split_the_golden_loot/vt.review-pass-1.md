<!-- vt.idd:pr-review:pass-1 -->
## Code Review — PR #41: fix: Compartir shares the objetivo shell (#39)

> **Codex tip**: Ask here for deeper context on any finding before approving —
> e.g. "walk me through m1 option A", "what files does m1 touch?",
> "combine m1+m2 into one fix". The table rationale is a summary; Codex has
> full diff context.
>
> **Copilot review**: Copilot review: skipped by config/flag (no .vt/vt.config.yaml in this repo, so review.copilot_integration is not enabled). Visual E2E: no ui-visual-reviewer agent; covered by the Playwright browser check (15/15, validaciones/shell_generator/39). Verification pass: not run (no C/S findings). Security reviewer: no C/S findings (numbers-only query through encodeURIComponent, decode rejects malformed links and clamps, bounded random start, no new dependency). Reviewers: 3 role-scoped `reviewer` instances (security, quality, documentation). Reviewed head: 406b760.
>
> **Verification**: Not run.

| Severity | Count | IDs |
|----------|-------|-----|
| Critical (C) | 0 | — |
| Security (S) | 0 | — |
| Major (M) | 0 | — |
| Minor (m) | 4 | m1, m2, m3, m4 |
| Documentation (D) | 6 | D1, D2, D3, D4, D5, D6 |
| **Total** | **10** | |

---

## Findings

<!-- vt.idd:finding:m1 -->
<!-- vt.idd:recommended:m1:A -->
<details>
<summary><strong>m1 — The link format's key order is written out twice in the spec</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m1 — The link format's key order is written out twice in the spec** *(Minor · FG-1)*

**File**: `src/app/game/game.component.spec.ts`, 164-169, 517-522

**Description**: `encoded` (the 'sharing' describe) and `objetivoQuery` (the #11 buttons describe) both hard-code `[d, A, alpha, beta, a, b, mu, omega, phi, theta]` and `toFixed(2)`. If the format changes, one helper can be updated and the other forgotten (it would fail loudly, so it's drift, not a hidden bug).



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Hoist one top-level helper `encodeObjetivo(p)` and build both `encoded` and `objetivoQuery` from it. | Keeps the order pinned independently of the component (the point of the test), in one place. | ✓ |
| **B** | Read `GameComponent['targetParameterKeys']` in the spec. | Removes duplication but mirrors the implementation, so it can't catch an order change. |  |
| **C** | Leave as is. | The order is deliberately pinned and a mismatch fails. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m1 -->

---

<!-- vt.idd:finding:m2 -->
<!-- vt.idd:recommended:m2:A -->
<details>
<summary><strong>m2 — The link-to-query extraction is repeated inline</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m2 — The link-to-query extraction is repeated inline** *(Minor · FG-1)*

**File**: `src/app/game/game.component.spec.ts`, 193-197

**Description**: `valuesOf` already does `decodeURIComponent(link.split('target=')[1])`; the round-trip spec repeats the expression inline because it needs the string form.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add `targetOf(link)` and use it in `valuesOf` and the round-trip spec. | One parse of the link format in the spec. | ✓ |
| **B** | Leave as is. | Two short copies of a one-liner. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m2 -->

---

<!-- vt.idd:finding:m3 -->
<!-- vt.idd:recommended:m3:A -->
<details>
<summary><strong>m3 — "Same link however the sliders move" doesn't prove the sliders moved</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m3 — "Same link however the sliders move" doesn't prove the sliders moved** *(Minor · FG-1)*

**File**: `src/app/game/game.component.spec.ts`, 185-192

**Description**: The spec assigns the slider maxima and expects an unchanged link, but never checks that the player's shell actually changed. If the start ever equalled the maxima, it would pass vacuously.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Snapshot the player's A/α/β/a before, and assert they differ after the move. | Cheap; makes the intent explicit. | ✓ |
| **B** | Assert the player-side query would differ. | More elaborate for the same guarantee. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m3 -->

---

<!-- vt.idd:finding:m4 -->
<!-- vt.idd:recommended:m4:B -->
<details>
<summary><strong>m4 — Share specs don't positively exclude the player's shell</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m4 — Share specs don't positively exclude the player's shell** *(Minor · FG-1)*

**File**: `src/app/game/game.component.spec.ts`, 538-573

**Description**: The clipboard and prompt specs assert the objetivo query is contained; nothing asserts the player's query is absent.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add `not.toContain` for the player's query (needs m1's helper). | Guards against a link carrying both shells. |  |
| **B** | Skip it. | The 'sharing' spec already pins the whole value list by exact equality, and the revert check proves the specs tell the shells apart. | ✓ |
| **C** |  |  |  |

- [ ] **A**
- [x] **B** *(recommended)*
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m4 -->

---

<!-- vt.idd:finding:D1 -->
<!-- vt.idd:recommended:D1:A -->
<details>
<summary><strong>D1 — `deployed_at` is a placeholder timestamp</strong> <em>(Documentation · FG-2 · Documentation reviewer)</em></summary>

**D1 — `deployed_at` is a placeholder timestamp** *(Documentation · FG-2)*

**File**: `specs/039-split_the_golden_loot/github-metadata.json`, 16

**Description**: `2026-10-01T00:00:00Z` is earlier than the PR's `createdAt` (18:17:25Z), so it's impossible; other archives record a real time 20–40 s before the PR.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Set it to the deployment comment's real time, just before the PR's createdAt. | Matches the other archives. | ✓ |
| **B** | Use the PR's createdAt. | Simpler, slightly off the convention. |  |
| **C** | Leave it. | A visible fake. |  |

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
<summary><strong>D2 — #12 archive: the "Superseded" note doesn't reach every stale claim</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D2 — #12 archive: the "Superseded" note doesn't reach every stale claim** *(Documentation · FG-3)*

**File**: `specs/012-no_instant_snap_wins/spec.md`, 15, 33, 37, 65, 75

**Description**: Lines 33/37 say `getShareableGameLink()` is unchanged; VM-002/SC-002 rows still read "target equals the sharer's shell" with Pass. A reader of the table alone sees no marker.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Keep the note and add short inline markers "(superseded by #39: now the objetivo)" on those lines. | Each line corrects itself where it's read. | ✓ |
| **B** | Widen the note to list every section it covers. | One place, but the rows still read as current. |  |
| **C** | Leave it. | The note sits near the top. |  |

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
<summary><strong>D3 — Plan says "update the comment above getShareableGameLink" — there was none</strong> <em>(Documentation · FG-2 · Documentation reviewer)</em></summary>

**D3 — Plan says "update the comment above getShareableGameLink" — there was none** *(Documentation · FG-2)*

**File**: `specs/039-split_the_golden_loot/plan.md`, 21, 29

**Description**: A new two-line comment was added instead. The same wording is in the issue's plan comment and T001's description.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Reword the plan (archive + issue comment) to "add a short comment"; leave tasks.json as the as-executed record. | Plan matches what was built. | ✓ |
| **B** | Add an "as built" note to the plan. | Keeps the original wording. |  |
| **C** | Leave it. | Minor. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D3 -->

---

<!-- vt.idd:finding:D4 -->
<!-- vt.idd:recommended:D4:A -->
<details>
<summary><strong>D4 — Line-number references are inconsistent and point at the pre-change file</strong> <em>(Documentation · FG-2 · Documentation reviewer)</em></summary>

**D4 — Line-number references are inconsistent and point at the pre-change file** *(Documentation · FG-2)*

**File**: `specs/039-split_the_golden_loot/spec.md`, Risk table; plan.md 11-12

**Description**: Spec says the tooltip spec is at ~561, plan says ~557; the how-to pin '~1715' is now ~1745. Readers on the branch won't find them.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Cite describe/spec names instead of line numbers. | Names survive edits. | ✓ |
| **B** | Label numbers "on dev @8f1ea05" and unify them. | Accurate but brittle. |  |
| **C** | Leave it. | Approximate pointers. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D4 -->

---

<!-- vt.idd:finding:D5 -->
<!-- vt.idd:recommended:D5:A -->
<details>
<summary><strong>D5 — Plan diagram labels likely break Mermaid</strong> <em>(Documentation · FG-2 · Documentation reviewer)</em></summary>

**D5 — Plan diagram labels likely break Mermaid** *(Documentation · FG-2)*

**File**: `specs/039-split_the_golden_loot/plan.md`, Architecture

**Description**: Unquoted labels with parentheses and `#` (`C[encodeTargetParameters(this.targetParameters)]`, `D[#/game?target=…]`) are Mermaid parse errors.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Quote the labels. | Smallest change that renders. | ✓ |
| **B** | Reword labels without parentheses or #. | Also renders, loses the exact names. |  |
| **C** | Replace the diagram with a text flow. | Overkill. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D5 -->

---

<!-- vt.idd:finding:D6 -->
<!-- vt.idd:recommended:D6:A -->
<details>
<summary><strong>D6 — Archive and PR body: wave labels, VM-003 evidence, #12 comment trail</strong> <em>(Documentation · FG-2 · Documentation reviewer)</em></summary>

**D6 — Archive and PR body: wave labels, VM-003 evidence, #12 comment trail** *(Documentation · FG-2)*

**File**: `specs/039-split_the_golden_loot/plan.md`, W1–W3; spec.md VM-003

**Description**: (a) The plan promises amending #12's comment trail (done: issuecomment-5937440039) but nothing says so; (b) plan waves W1–W3 vs tasks Wave 0–2; (c) VM-003 claims the heat bar/distance use the sender's objetivo, but the round-trip spec only checks the target and a non-winning start (the heat bar part was only seen in the browser check).



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Relabel plan waves W0–W2; extend the round-trip spec to assert the recipient's distance is measured against the objetivo; mention the #12 comment in the PR body. | Every claim gets committed evidence. | ✓ |
| **B** | Only reword VM-003 to cite the browser check. | Evidence stays outside the repo. |  |
| **C** | Leave it. | Cosmetic. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D6 -->

---


## Fix Groups

<!-- vt.idd:fix-group:FG-1 -->
<!-- vt.idd:recommended-disposition:FG-1:Fix -->
**FG-1** — `src/app/game/game.component.spec.ts` · m1, m2, m3, m4 · _Soft boundary with FG-2 (D6c adds a distance assertion to the same round-trip spec)_

Spec tidy-ups only; no production change. m4 recommends no change.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-1 -->

<!-- vt.idd:fix-group:FG-2 -->
<!-- vt.idd:recommended-disposition:FG-2:Fix -->
**FG-2** — `specs/039-split_the_golden_loot/{plan.md,spec.md,github-metadata.json}`, issue #39 spec/plan comments, PR body · D1, D3, D4, D5, D6 · _Hard boundary (docs only), soft with FG-1 for D6c_

Keeps the archive and the GitHub comments in sync.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-2 -->

<!-- vt.idd:fix-group:FG-3 -->
<!-- vt.idd:recommended-disposition:FG-3:Fix -->
**FG-3** — `specs/012-no_instant_snap_wins/spec.md` · D2 · _Hard boundary_

Inline markers on #12's stale lines.

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

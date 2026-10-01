<!-- vt.idd:pr-review:pass-1 -->
## Code Review — PR #42: feat: welcome pop-up "Comenzar" stays in the sandbox (#40)

> **Codex tip**: Ask here for deeper context on any finding before approving —
> e.g. "walk me through m1 option A", "what files does m1 touch?",
> "combine m1+m2 into one fix". The table rationale is a summary; Codex has
> full diff context.
>
> **Copilot review**: Copilot review: skipped by config/flag (no .vt/vt.config.yaml in this repo, so review.copilot_integration is not enabled). Visual E2E: no ui-visual-reviewer agent; covered by the Playwright browser check (65/65 at 320×568, 390×844, 1280×800, 844×390; validaciones/shell_generator/40). Verification pass: not run (no C/S findings). Security reviewer: no C/S findings (static interpolated label, no new input/URL/binding, navigateToGame() keeps its fixed route). Reviewers: 3 role-scoped `reviewer` instances (security, quality, documentation). Reviewed head: 59e78f3.
>
> **Verification**: Not run.

| Severity | Count | IDs |
|----------|-------|-----|
| Critical (C) | 0 | — |
| Security (S) | 0 | — |
| Major (M) | 0 | — |
| Minor (m) | 3 | m1, m2, m3 |
| Documentation (D) | 7 | D1, D2, D3, D4, D5, D6, D7 |
| **Total** | **10** | |

---

## Findings

<!-- vt.idd:finding:m1 -->
<!-- vt.idd:recommended:m1:A -->
<details>
<summary><strong>m1 — The focus spec only says "not Comenzar"; it can pass vacuously</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m1 — The focus spec only says "not Comenzar"; it can pass vacuously** *(Minor · FG-1)*

**File**: `src/app/sandbox/sandbox.component.spec.ts`, ~1143

**Description**: `expect(document.activeElement).not.toBe(start())` also passes if focus is on `body` or on another wrong element (e.g. an `initialFocus` pointed at "Conoce más"). `modal.component.spec.ts:206` shows showModal does move focus to the ✕ in Karma.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Assert the positive outcome: `activeElement` is the header ✕ (keep the not-Comenzar assertion). | Pins the owner decision "focus stays on the ✕" and fails on any other element. | ✓ |
| **B** | Assert the intro `<app-modal>` has no `initialFocus`. | Guards intent, not outcome. |  |
| **C** | Rename the spec to say it only excludes Comenzar. | Weakest. |  |

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
<summary><strong>m2 — "Comenzar doesn't open the ? guide" isn't pinned</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m2 — "Comenzar doesn't open the ? guide" isn't pinned** *(Minor · FG-1)*

**File**: `src/app/sandbox/sandbox.component.spec.ts`, ~1127-1140

**Description**: The closes-and-stays spec checks the pop-up, the router and the sliders, but not `component.guide.on`. A future handler that also opened the guide (a discussed alternative) would pass.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add `expect(component.guide.on).toBeFalse()` to the closes-and-stays spec. | One line pins decision 4. | ✓ |
| **B** | A separate guide spec. | More code, same coverage. |  |
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
<summary><strong>m3 — No assertion on the router URL after Comenzar</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m3 — No assertion on the router URL after Comenzar** *(Minor · FG-1)*

**File**: `src/app/sandbox/sandbox.component.spec.ts`, ~1127-1140

**Description**: Only `navigate`/`navigateByUrl` are spied; the component has one navigation path, so coverage is already good.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add `expect(router.url).toBe('/')`. | Cheap, states the outcome directly. | ✓ |
| **B** | Leave it. | The spies cover the only navigation path. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m3 -->

---

<!-- vt.idd:finding:D1 -->
<!-- vt.idd:recommended:D1:A -->
<details>
<summary><strong>D1 — #3 archive: inline markers promised by FR-008 are missing on many "Jugar" lines</strong> <em>(Documentation · FG-2 · Documentation reviewer)</em></summary>

**D1 — #3 archive: inline markers promised by FR-008 are missing on many "Jugar" lines** *(Documentation · FG-2)*

**File**: `specs/003-to_infinity_and_the_equation/plan.md`, 36-117, 149; spec.md 54-320

**Description**: plan.md has one blockquote (mid-list) and no inline markers; its Mermaid `play[... navigateToGame()]` and handler steps read as current. spec.md marks US3, FR-007, D4, VM-009/010, SC-004 but not FR-008, its Mermaid node, the US2/VM-016 close lists or line ~295.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add short inline markers on the unmarked lines in both files; move plan.md's note to the top. | Delivers what FR-008 and the PR promise. | ✓ |
| **B** | Keep the note-only approach and reword FR-008/plan/PR. | Smaller archive diff, more spec churn. |  |
| **C** | Mark only the Mermaid nodes and VM-016; move the plan note. | Minimal. |  |

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
<summary><strong>D2 — #3 VM-009/VM-010/SC-004 cite spec names that #40 renamed, still "Pass"</strong> <em>(Documentation · FG-2 · Documentation reviewer)</em></summary>

**D2 — #3 VM-009/VM-010/SC-004 cite spec names that #40 renamed, still "Pass"** *(Documentation · FG-2)*

**File**: `specs/003-to_infinity_and_the_equation/spec.md`, 313-314, 329

**Description**: The evidence names "Conoce más and Jugar › \"Jugar\" closes the pop-up and opens the game" and "…\"Jugar\" on screen…"; those specs are now "Conoce más and Comenzar" / "closes and stays".



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Extend the marker: the evidence describes the #3-era behaviour; renamed in #40, see #40's VM-002/VM-004. | Keeps history, points forward. | ✓ |
| **B** | Rewrite the evidence cells. | Rewrites history. |  |
| **C** | Set Status to "Superseded (#40)". | Breaks the plain Pass/Fail/Pending convention. |  |

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
<summary><strong>D3 — #40 SC-002/FR-003 say no "Jugar" remains, but history comments mention it</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D3 — #40 SC-002/FR-003 say no "Jugar" remains, but history comments mention it** *(Documentation · FG-3)*

**File**: `specs/040-the_journey_begins_in_the_shire/spec.md`, FR-003, SC-002

**Description**: `sandbox.component.ts` (`was #3's "Jugar"`) and two spec lines mention Jugar on purpose.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Reword: no "Jugar" button, id, label constant or handler remains; history comments may mention it (archive + issue spec comment). | Accurate, keeps useful history. | ✓ |
| **B** | Drop the history comments. | Loses context. |  |
| **C** | Leave it. | Cosmetic. |  |

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
<summary><strong>D4 — #40 spec describes the focus check more strongly than the unit spec did</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D4 — #40 spec describes the focus check more strongly than the unit spec did** *(Documentation · FG-3)*

**File**: `specs/040-the_journey_begins_in_the_shire/spec.md`, Testing Strategy, VM-005

**Description**: "Focus is the ✕" was only evidenced by the browser check.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Resolved by m1 (unit spec asserts the ✕); cite both at stamping. | Spec text becomes true as written. | ✓ |
| **B** | Reword the Testing Strategy. | Weaker claim. |  |
| **C** | Leave it. | Mismatch stays. |  |

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
<summary><strong>D5 — Plan wave list reads "1. W0, 2. W1, 3. W2"</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D5 — Plan wave list reads "1. W0, 2. W1, 3. W2"** *(Documentation · FG-3)*

**File**: `specs/040-the_journey_begins_in_the_shire/plan.md`, Architecture

**Description**: Numbered list next to zero-based wave names.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Use bullets for the waves (archive + issue plan comment). | No double numbering. | ✓ |
| **B** | Leave it. | Matches tasks.json already. |  |
| **C** |  |  |  |

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
<summary><strong>D6 — FR-009 (before/after image) has no task; PR item unchecked</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D6 — FR-009 (before/after image) has no task; PR item unchecked** *(Documentation · FG-3)*

**File**: `specs/040-the_journey_begins_in_the_shire/spec.md`, FR-009

**Description**: The sheets exist (validaciones/shell_generator/40/capturas) but gh can't attach images; nothing says FR-009 is outside the task list.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Say in the PR body where the sheets are and that attaching them is the owner's step; stamp VM/SC at review. | Honest status. | ✓ |
| **B** | Leave it. | Unclear status. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D6 -->

---

<!-- vt.idd:finding:D7 -->
<!-- vt.idd:recommended:D7:B -->
<details>
<summary><strong>D7 — Timestamp formats in tasks.json are mixed (tool output)</strong> <em>(Documentation · FG-4 · Documentation reviewer)</em></summary>

**D7 — Timestamp formats in tasks.json are mixed (tool output)** *(Documentation · FG-4)*

**File**: `specs/040-the_journey_begins_in_the_shire/tasks.json`, meta/state

**Description**: UTC vs -06:00 offsets come from the scripts; same as #39.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Normalize by hand. | Breaks the rule that tasks.json is only written by the scripts. |  |
| **B** | Leave it. | Tool-generated; consistent with other archives. | ✓ |
| **C** |  |  |  |

- [ ] **A**
- [x] **B** *(recommended)*
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D7 -->

---


## Fix Groups

<!-- vt.idd:fix-group:FG-1 -->
<!-- vt.idd:recommended-disposition:FG-1:Fix -->
**FG-1** — `src/app/sandbox/sandbox.component.spec.ts` · m1, m2, m3 · _Hard boundary_

Spec tightening only; m1 also resolves D4.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-1 -->

<!-- vt.idd:fix-group:FG-2 -->
<!-- vt.idd:recommended-disposition:FG-2:Fix -->
**FG-2** — `specs/003-to_infinity_and_the_equation/{spec,plan}.md` · D1, D2 · _Hard boundary_

Inline markers on #3's remaining "Jugar" lines.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-2 -->

<!-- vt.idd:fix-group:FG-3 -->
<!-- vt.idd:recommended-disposition:FG-3:Fix -->
**FG-3** — `specs/040-the_journey_begins_in_the_shire/{spec,plan}.md`, issue #40 spec/plan comments, PR body · D3, D4, D5, D6 · _Soft boundary with FG-1 (D4 resolved by m1)_

Archive and GitHub text match the build.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-3 -->

<!-- vt.idd:fix-group:FG-4 -->
<!-- vt.idd:recommended-disposition:FG-4:Acknowledge -->
**FG-4** — `specs/040-the_journey_begins_in_the_shire/tasks.json` · D7 · _Hard boundary_

Script-owned file; no hand edits.

- [ ] **Fix**
- [x] **Acknowledge** *(recommended)*
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-4 -->


<!-- vt.idd:pr-review:approve -->
## Approve and Proceed

All findings reviewed? Check the box to authorize fix execution.

- [ ] **Approve and proceed** — I have reviewed all findings and dispositions above. Execute fixes per the checked dispositions.
<!-- /vt.idd:pr-review:approve -->
<!-- /vt.idd:pr-review:pass-1 -->

<!-- vt.idd:pr-review:pass-1 -->
## Code Review — PR #36: feat: game control guide, the "?" in the top-right corner (#35)

> **Codex tip**: Ask here for deeper context on any finding before approving —
> e.g. "walk me through m1 option A", "what files does m1 touch?",
> "combine m1+m2 into one fix". The table rationale is a summary; Codex has
> full diff context.
>
> **Copilot review**: Copilot review: skipped by config/flag (no .vt/vt.config.yaml in this repo, so review.copilot_integration is not enabled). Visual E2E: covered by the local harness (validaciones/shell_generator/35: real Chromium, mouse / touch / keyboard at 9 sizes on Usuario and Objetivo, the owner's 125 % Windows case) and the owner's manual pass §1–§6. Verification pass: not run (no C/S findings); every finding was checked against the code before posting — the quality reviewer's worry that a row could span both halves of the screen doesn't hold (pairwise same-half grouping), so m3 is a comment. Security reviewer: no C/S findings (static strings by interpolation, hard-coded selectors and ids, no new dependency, bounded pointer map). Reviewers: 3 role-scoped `reviewer` instances (security, quality, documentation); m4 = D10 and m5 = D11 merged. Reviewed head: e6d1596.
>
> **Verification**: Not run.

| Severity | Count | IDs |
|----------|-------|-----|
| Critical (C) | 0 | — |
| Security (S) | 0 | — |
| Major (M) | 0 | — |
| Minor (m) | 7 | m1, m2, m3, m4, m5, m6, m7 |
| Documentation (D) | 10 | D1, D2, D3, D4, D5, D6, D7, D8, D9, D10 |
| **Total** | **17** | |

---

## Findings

<!-- vt.idd:finding:m1 -->
<!-- vt.idd:recommended:m1:A -->
<details>
<summary><strong>m1 — Spec comment claims leader lines never cross a control; row lines do</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m1 — Spec comment claims leader lines never cross a control; row lines do** *(Minor · FG-1)*

**File**: `src/app/callout/layout-guide.spec.ts`, 280

**Description**: `expectTidyLayout`'s comment says 'no line across a bubble or a control', but only line-vs-bubble is asserted, and a stacked row's leader starts on its control and runs past the stack: on phones the switch's line crosses the heat bar. That's intended (the owner saw it and passed manual §6), so the comment is what's wrong.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Reword the comment: lines never cross a bubble; a stacked row's lines may pass over the controls stacked above. | Matches the behaviour the owner accepted and what the spec checks. | ✓ |
| **B** | Forbid row lines over other controls and defer such members to the lone path. | Changes the phone layout the owner approved; the stack would break on every phone. |  |
| **C** | Assert line-vs-control only for non-row lines. | More test code for a rule nobody asked for. |  |

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
<summary><strong>m2 — A clamped line position can leave a row bubble's arrow off its corner</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m2 — A clamped line position can leave a row bubble's arrow off its corner** *(Minor · FG-1)*

**File**: `src/app/callout/layout-guide.ts`, 213-230

**Description**: `lineX` is clamped to `anchor.left + 1`; for a control narrower than ~26 px or right of the previous line, the clamp lifts the line back within `LINE_SPACING` of its neighbour, so `leftBound` can pass `lineAt - ARROW_INSET`: the arrow sits off the bubble's corner (the component clamps the drawn arrow, so the leader line and arrow then disagree) and `maxWidth` can reach 0. No control that narrow exists today.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | When the clamp moves a line, place that member like a lone control (push it to `leftOver`); spec with two narrow stacked controls. | Falls back to tested paths; no new geometry. | ✓ |
| **B** | Clamp `arrow` into [ARROW_INSET, width − ARROW_INSET] and `maxWidth` ≥ 1. | Hides the symptom; the leader line still misses the arrow. |  |
| **C** | Document that controls under ~26 px are unsupported. | Leaves a trap for the next screen. |  |

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
<summary><strong>m3 — findRows' same-half rule isn't stated where placeRow relies on it</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m3 — findRows' same-half rule isn't stated where placeRow relies on it** *(Minor · FG-1)*

**File**: `src/app/callout/layout-guide.ts`, 206, 281-300

**Description**: `placeRow` takes `downward` from `row[0]` alone. The reviewer worried a chained row could span both halves; it can't — a stacked pair joins only when both are in the same half, so by transitivity the whole row is (level controls share a top) — but nothing says so next to `downward`.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Comment at `downward`: every member of a row lies in the same half (findRows), so the first one decides. | Records the invariant the code relies on; no behaviour change. | ✓ |
| **B** | Compute `downward` from the row's centroid. | Same result for every possible row; extra code. |  |
| **C** | Leave it. | The next reader re-derives it. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m3 -->

---

<!-- vt.idd:finding:m4 -->
<!-- vt.idd:recommended:m4:A -->
<details>
<summary><strong>m4 — Comments still count ten bubbles on the game</strong> <em>(Minor · FG-2 · Quality + Documentation reviewers (m4 = D10))</em></summary>

**m4 — Comments still count ten bubbles on the game** *(Minor · FG-2)*

**File**: `src/app/callout/callout.component.css; src/app/game/game.component.spec.ts`, 109; best-effort block

**Description**: `callout.component.css` says 'The game's guide has ten bubbles' and the game spec's best-effort comment says 'ten bubbles don't fit'; since D8 the guide has nine.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Say nine (or drop the count where it isn't the point). | Comments match the code. | ✓ |
| **B** | Leave them. | Misleads the next reader about the bubble count. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m4 -->

---

<!-- vt.idd:finding:m5 -->
<!-- vt.idd:recommended:m5:A -->
<details>
<summary><strong>m5 — gameScreen fixture comment reads as a leftover</strong> <em>(Minor · FG-1 · Quality + Documentation reviewers (m5 = D11))</em></summary>

**m5 — gameScreen fixture comment reads as a leftover** *(Minor · FG-1)*

**File**: `src/app/callout/layout-guide.spec.ts`, ~250-256

**Description**: After the D8 edit the comment reads 'Nuevo juego / Compartir (right). No bubble for the 3D view there. On one bottom row on wide screens; …' — two thoughts run together.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Reflow into: what the screen has, where the rows go, and that there's no 3D-view item. | Reads as one description. | ✓ |
| **B** | Leave it. | Cosmetic. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m5 -->

---

<!-- vt.idd:finding:m6 -->
<!-- vt.idd:recommended:m6:A -->
<details>
<summary><strong>m6 — The short-phone layout spec can't fail</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m6 — The short-phone layout spec can't fail** *(Minor · FG-1)*

**File**: `src/app/callout/layout-guide.spec.ts`, 330-341

**Description**: 'still places all nine bubbles on screen (best effort)' only checks the screen bounds, which the final clamp fallback guarantees for any input, so a regression that stacks every bubble on one point still passes. The name promises more than it checks.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Rename to what it proves (a placement per item, clamped on screen) and add one real guard: every stackable row member is placed in its staircase (has a leader) at these sizes. | Honest name plus a check that fails if the stacked-rows path regresses on short phones. | ✓ |
| **B** | Ratchet: record each size's overlap count and fail if it grows. | Catches regressions but brittle to every font change. |  |
| **C** | Rename only. | Honest, still no guard. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m6 -->

---

<!-- vt.idd:finding:m7 -->
<!-- vt.idd:recommended:m7:A -->
<details>
<summary><strong>m7 — A spec hard-codes the 10 px gap</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m7 — A spec hard-codes the 10 px gap** *(Minor · FG-1)*

**File**: `src/app/callout/layout-guide.spec.ts`, 357

**Description**: 'keeps a bottom row's staircase near its row' asserts `rowTop - 10`; the 10 is `GAP` from geometry.ts.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Import `GAP` and use `rowTop - GAP`. | The spec follows the constant. | ✓ |
| **B** | Leave the literal. | Breaks silently-wrong if GAP changes. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m7 -->

---

<!-- vt.idd:finding:D1 -->
<!-- vt.idd:recommended:D1:A -->
<details>
<summary><strong>D1 — plan.md has no snapshot note and describes the pre-D7/D8 design</strong> <em>(Documentation · FG-4 · Documentation reviewer)</em></summary>

**D1 — plan.md has no snapshot note and describes the pre-D7/D8 design** *(Documentation · FG-4)*

**File**: `specs/035-a_parrot_on_every_control/plan.md`, Generated line

**Description**: The plan still says ten callouts, `#shell-region` over the visible shell, 3D-view aim; a reader takes it as the current design.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add a 'Plan snapshot note' under the Generated line (as #5 did): written 2026-09-29, before D7/D8; now nine callouts, no `#shell-region` on the game; see spec D7/D8. | Keeps the snapshot; points to the truth. | ✓ |
| **B** | Rewrite the plan to the current state. | Loses the deployment-time snapshot. |  |
| **C** |  |  |  |

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
<summary><strong>D2 — tasks record a 3D-view callout and #shell-region that D8 removed</strong> <em>(Documentation · FG-4 · Documentation reviewer)</em></summary>

**D2 — tasks record a 3D-view callout and #shell-region that D8 removed** *(Documentation · FG-4)*

**File**: `specs/035-a_parrot_on_every_control/tasks.json`, T003, T005, T008

**Description**: T003 (ten callouts incl. the 3D view), T005 (#shell-region, 3D-view aim) and T008 descriptions predate D8; nothing in the task record says so.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add `completion.notes` on T003/T005/T008: superseded by D8 (709aa40) — nine callouts, no #shell-region on the game; re-render tasks.md. | Keeps history, records the change where the task lives. | ✓ |
| **B** | Edit the descriptions. | Rewrites history. |  |
| **C** |  |  |  |

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
<summary><strong>D3 — Spec summary: 'ten controls or areas'</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D3 — Spec summary: 'ten controls or areas'** *(Documentation · FG-3)*

**File**: `specs/035-a_parrot_on_every_control/spec.md`, Summary

**Description**: Next to the 'nine bubbles' amendment, 'ten controls or areas' reads as a contradiction.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | 'nine controls and the 3D view, with no on-screen labels'. | Both numbers make sense together. | ✓ |
| **B** | Keep it and add '(the 3D view has no bubble)'. | Still two counts to reconcile. |  |
| **C** |  |  |  |

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
<summary><strong>D4 — Spec D2 is muddled after the amendment</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D4 — Spec D2 is muddled after the amendment** *(Documentation · FG-3)*

**File**: `specs/035-a_parrot_on_every_control/spec.md`, Decisions — D2

**Description**: D2 says 'ten bubbles total … the issue body's "nine controls" count predates this; the guide has ten bubbles', then 'Amended: nine'.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Selected option: 'one callout each (ten then; nine since D8)'; drop the 'predates' parenthetical. | One current count, history in brackets. | ✓ |
| **B** | Strike the old text. | Loses why ten was chosen. |  |
| **C** |  |  |  |

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
<summary><strong>D5 — Spec D3 still selects reuse for the 3D view</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D5 — Spec D3 still selects reuse for the 3D view** *(Documentation · FG-3)*

**File**: `specs/035-a_parrot_on_every_control/spec.md`, Decisions — D3

**Description**: 'reuse for the "?" and 3D view (selected)' — the game has no 3D-view bubble; it reuses the "?" and camera strings.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | 'reuse for the "?" and the camera (the 3D view's bubble was withdrawn, D8)'. | Matches app-strings.ts and the specs. | ✓ |
| **B** | Append '(3D view withdrawn, D8)'. | Keeps a wrong first half. |  |
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
<summary><strong>D6 — Spec Testing Strategy: '3D-view bubble aims at the visible shell and re-aims on flip'</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D6 — Spec Testing Strategy: '3D-view bubble aims at the visible shell and re-aims on flip'** *(Documentation · FG-3)*

**File**: `specs/035-a_parrot_on_every_control/spec.md`, Testing Strategy

**Description**: Describes specs that no longer exist.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Replace with 'no 3D-view bubble on either shell; a flip keeps the guide on'. | Describes the real specs. | ✓ |
| **B** | Mark '(withdrawn, D8)'. | Keeps stale text. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D6 -->

---

<!-- vt.idd:finding:D7 -->
<!-- vt.idd:recommended:D7:A -->
<details>
<summary><strong>D7 — Spec risk: 'Ten bubbles can't fit the shortest phones'</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D7 — Spec risk: 'Ten bubbles can't fit the shortest phones'** *(Documentation · FG-3)*

**File**: `specs/035-a_parrot_on_every_control/spec.md`, Risk Assessments

**Description**: Stale count.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | 'The bubbles can't all fit the shortest phones (D7: best effort)'. | Current and points to the decision. | ✓ |
| **B** | Leave as history. | Reads as current. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D7 -->

---

<!-- vt.idd:finding:D8 -->
<!-- vt.idd:recommended:D8:A -->
<details>
<summary><strong>D8 — Spec D7's '52-character limit' reads as current</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D8 — Spec D7's '52-character limit' reads as current** *(Documentation · FG-3)*

**File**: `specs/035-a_parrot_on_every_control/spec.md`, Decisions — D7

**Description**: D7 says the switch line was shortened 'to fit the 52-character limit'; D8 raised the game's limit to 75.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | '…the then 52-character limit (75 since D8, for Compartir)'. | History stays accurate. | ✓ |
| **B** | Drop the number from D7. | Loses why the switch line was shortened. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D8 -->

---

<!-- vt.idd:finding:D9 -->
<!-- vt.idd:recommended:D9:A -->
<details>
<summary><strong>D9 — Spec still presents the shell-region follow as part of the game's deliverable</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D9 — Spec still presents the shell-region follow as part of the game's deliverable** *(Documentation · FG-3)*

**File**: `specs/035-a_parrot_on_every_control/spec.md`, Key Entities; Technical Summary

**Description**: The shared helper is described as 'shell-region + tap-vs-drag'; the game uses only CanvasTap, followShell serves the initial screen.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | 'tap-vs-drag helper (CanvasTap, both screens) and the shell-region follow (followShell, the initial screen only)'. | Says who uses what. | ✓ |
| **B** | Leave the D8 parentheticals. | Reads as an afterthought. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D9 -->

---

<!-- vt.idd:finding:D10 -->
<!-- vt.idd:recommended:D10:A -->
<details>
<summary><strong>D10 — Spec header duplicated</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D10 — Spec header duplicated** *(Documentation · FG-3)*

**File**: `specs/035-a_parrot_on_every_control/spec.md; spec comment 5903114606`, 1-5

**Description**: '<!-- vt.idd:spec --> ## Specification' appears twice (post-spec.sh added it on top of the draft's own).



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Remove the duplicate in the comment and the archive. | One tag, one heading. | ✓ |
| **B** | Leave it. | Harmless but sloppy; tag-based discovery still works. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D10 -->

---


## Fix Groups

<!-- vt.idd:fix-group:FG-1 -->
<!-- vt.idd:recommended-disposition:FG-1:Fix -->
**FG-1** — `src/app/callout/layout-guide.ts`, `src/app/callout/layout-guide.spec.ts` · m1, m2, m3, m5, m6, m7 · _Hard boundary (no file shared with other groups)_

m2 is the only behaviour change (a clamped line → lone placement), RED first with two narrow stacked controls; m6 adds the stacked-rows guard on short phones; the rest are comments and a constant.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-1 -->

<!-- vt.idd:fix-group:FG-2 -->
<!-- vt.idd:recommended-disposition:FG-2:Fix -->
**FG-2** — `src/app/callout/callout.component.css`, `src/app/game/game.component.spec.ts` · m4 · _Hard boundary_

Two comments: nine, not ten.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-2 -->

<!-- vt.idd:fix-group:FG-3 -->
<!-- vt.idd:recommended-disposition:FG-3:Fix -->
**FG-3** — `specs/035-a_parrot_on_every_control/spec.md` + spec comment 5903114606 on #35 · D3, D4, D5, D6, D7, D8, D9, D10 · _Hard boundary_

Edit the spec comment on #35 (authoritative) and mirror it into the archive.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-3 -->

<!-- vt.idd:fix-group:FG-4 -->
<!-- vt.idd:recommended-disposition:FG-4:Fix -->
**FG-4** — `specs/035-a_parrot_on_every_control/plan.md`, `tasks.json`, `tasks.md` · D1, D2 · _Hard boundary_

Snapshot notes, not rewrites; tasks.md re-rendered from tasks.json.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-4 -->


<!-- vt.idd:pr-review:approve -->
## Approve and Proceed

All findings reviewed? Check the box to authorize fix execution.

- [ ] **Approve and proceed** — I have reviewed all findings and dispositions above. Execute fixes per the checked dispositions.
<!-- /vt.idd:pr-review:approve -->
<!-- /vt.idd:pr-review:pass-1 -->

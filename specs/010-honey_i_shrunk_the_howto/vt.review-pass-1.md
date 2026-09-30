<!-- vt.idd:pr-review:pass-1 -->
## Code Review — PR #38: feat: how-to pop-up in short sections (#10)

> **Codex tip**: Ask here for deeper context on any finding before approving —
> e.g. "walk me through M1 option A", "what files does M1 touch?",
> "combine M1+m1 into one fix". The table rationale is a summary; Codex has
> full diff context.
>
> **Copilot review**: Copilot review: skipped by config/flag (no .vt/vt.config.yaml in this repo, so review.copilot_integration is not enabled). Visual E2E: no ui-visual-reviewer agent; covered by the #10 specs at 320×568/360/390/1280/844×390 and the before/after screenshots in validaciones/shell_generator/10. Verification pass: not run (no C/S findings); M1's recommended fix changes spec decision D6 / FR-011, checked by hand against the template and spec before posting. Security reviewer: no C/S findings (compile-time strings through {{ }} interpolation only; no innerHTML, URL or new dependency). Reviewers: 3 role-scoped `reviewer` instances (security, quality, documentation). Reviewed head: 34ba52a.
>
> **Verification**: Not run.

| Severity | Count | IDs |
|----------|-------|-----|
| Critical (C) | 0 | — |
| Security (S) | 0 | — |
| Major (M) | 1 | M1 |
| Minor (m) | 8 | m1, m2, m3, m4, m5, m6, m7, m8 |
| Documentation (D) | 5 | D1, D2, D3, D4, D5 |
| **Total** | **14** | |

---

## Findings

<!-- vt.idd:finding:M1 -->
<!-- vt.idd:recommended:M1:A -->
<details>
<summary><strong>M1 — Screen readers hear "Abre y mueve los sliders…" with nothing after "Abre"</strong> <em>(Major · FG-1 · Quality reviewer)</em></summary>

**M1 — Screen readers hear "Abre y mueve los sliders…" with nothing after "Abre"** *(Major · FG-1)*

**File**: `src/app/game/game.component.html`, 214-216

**Description**: The ⚙ is `aria-hidden`, so the spoken Parámetros section is "Parámetros · Abre y mueve los sliders para cambiar tu caracol." and never says what to open. The #10 wording spec pins that exact spoken string. FR-011/D6 assumed the section title covers it, but the title is read before the sentence, not in it.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Replace `aria-hidden` on `.howto-gear` with `role="img"` and `[attr.aria-label]` = `GUIDE_GAME_PARAMETERS_TITLE`, so it is read "Abre Parámetros y mueve…"; update the spoken-text spec and amend FR-011/D6. | The standard labelled-glyph pattern. The visible text is unchanged, and it reuses an approved string. | ✓ |
| **B** | Keep `aria-hidden` and reword to "Abre el menú Parámetros (⚙) y mueve…". | The sentence stands on its own, but it changes the approved visible wording. |  |
| **C** | Leave it and record the trade-off in D6. | No change, but screen readers keep the broken sentence. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:M1 -->

---

<!-- vt.idd:finding:m1 -->
<!-- vt.idd:recommended:m1:A -->
<details>
<summary><strong>m1 — The #31 paragraph spec now pins the count 7, duplicating the #10 order spec</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m1 — The #31 paragraph spec now pins the count 7, duplicating the #10 order spec** *(Minor · FG-1)*

**File**: `src/app/game/game.component.spec.ts`, 836-840

**Description**: 'keeps the how-to text as paragraphs' (#31) asserts `length` 7 and all-P; the #10 'opens on load…' spec already pins the seven children by id. Any added paragraph fails two specs.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Keep only the #31 guarantee: at least one child, and every child a <p>. | Each spec guards one thing; the #10 spec owns the order and count. | ✓ |
| **B** | Delete the #31 spec. | The #10 spec covers it, but #31's intent (paragraphs, not labels) would lose its own name. |  |
| **C** | Leave it. | Harmless duplication. |  |

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
<summary><strong>m2 — The five section titles are written out twice in the #10 specs</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m2 — The five section titles are written out twice in the #10 specs** *(Minor · FG-1)*

**File**: `src/app/game/game.component.spec.ts`, 1695, 1798

**Description**: The same five-title array appears in the bold-titles spec and the book-button spec.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Hoist `const TITLES = [...]` into the describe and use it in both. | One list to edit when a section changes. | ✓ |
| **B** | Compare the reopened titles with the ones read on first load. | No constant needed, but the first read has to be captured before closing. |  |
| **C** | Leave it. | Small duplication. |  |

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
<summary><strong>m3 — The goal and closing paragraphs have no id, so the order spec mixes ids and classes</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m3 — The goal and closing paragraphs have no id, so the order spec mixes ids and classes** *(Minor · FG-1)*

**File**: `src/app/game/game.component.html`, 212, 230

**Description**: Sections are identified by id, the goal and closing by class, so the spec needs `p.id || p.className`.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add ids `howto-goal` and `howto-closing` (keeping the classes) and assert on `p.id`. | Uniform, readable assertion; ids already name the sections. | ✓ |
| **B** | Select everything by class. | Also uniform, but the sections' ids are already used by other specs. |  |
| **C** | Leave it. | Works as is. |  |

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
<summary><strong>m4 — The layout spec checks every section twice, and the right-edge loop is near-vacuous</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m4 — The layout spec checks every section twice, and the right-edge loop is near-vacuous** *(Minor · FG-1)*

**File**: `src/app/game/game.component.spec.ts`, 1790-1800

**Description**: `[...sections(), ...body().children]` repeats the sections, since they are body children. The scrollWidth checks are the real overflow guard.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Iterate `body().children` only. | Same coverage without the repeat. | ✓ |
| **B** | Drop the right-edge loop. | Relies only on the scrollWidth checks. |  |
| **C** | Leave it. | Only redundant. |  |

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
<summary><strong>m5 — The 'text scrolling between them' spec never checks that the text overflows</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m5 — The 'text scrolling between them' spec never checks that the text overflows** *(Minor · FG-1)*

**File**: `src/app/game/game.component.spec.ts`, 1805-1815

**Description**: It asserts overflow-y auto/scroll and that the ✕ and ¡A jugar! are on screen, but not `scrollHeight > clientHeight`, so if the text fits, the scroll part tests nothing.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Assert the body really overflows at the sizes where it does (measure; at least 320×568), and word the title to match. | Makes the test exercise the case FR-007 worries about. | ✓ |
| **B** | Rename to 'keeps ✕ and ¡A jugar! on screen'. | Honest title, but it doesn't strengthen the test. |  |
| **C** | Leave it. | The on-screen checks still hold. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m5 -->

---

<!-- vt.idd:finding:m6 -->
<!-- vt.idd:recommended:m6:B -->
<details>
<summary><strong>m6 — "Nuevo juego y Compartir" re-types the two guide titles</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m6 — "Nuevo juego y Compartir" re-types the two guide titles** *(Minor · FG-1)*

**File**: `src/app/app-strings.ts`, 82

**Description**: `LABEL_HOWTO_NEW_GAME_SHARE_TITLE` repeats `GUIDE_GAME_NEW_GAME_TITLE` and `GUIDE_GAME_SHARE_TITLE` and can drift from them.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Compose it in the template: `{{GUIDE_GAME_NEW_GAME_TITLE}} y {{GUIDE_GAME_SHARE_TITLE}}`. | No duplicate, but it puts Spanish ("y") in the template. |  |
| **B** | Keep the string and add a spec asserting that it contains both guide titles. | Catches drift, and all copy stays in AppStrings. | ✓ |
| **C** | Leave it. | Low drift risk. |  |

- [ ] **A**
- [x] **B** *(recommended)*
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m6 -->

---

<!-- vt.idd:finding:m7 -->
<!-- vt.idd:recommended:m7:A -->
<details>
<summary><strong>m7 — The bold check depends on the browser reporting font-weight '700'</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m7 — The bold check depends on the browser reporting font-weight '700'** *(Minor · FG-1)*

**File**: `src/app/game/game.component.spec.ts`, 1680

**Description**: `<strong>` is `bolder`; Chrome reports 700 today, but a font-weight on the paragraph would change the number without the text looking less bold.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Assert `Number(fontWeight) >= 600`. | Checks 'bold', not a precise value. | ✓ |
| **B** | Leave it. | Stable in the only browser the specs run in. |  |
| **C** | Only check the tag is STRONG. | Weaker; wouldn't catch a CSS reset. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m7 -->

---

<!-- vt.idd:finding:m8 -->
<!-- vt.idd:recommended:m8:A -->
<details>
<summary><strong>m8 — howToPlayButtonClick() is a one-liner beside the inline (closed) binding</strong> <em>(Minor · FG-2 · Quality reviewer)</em></summary>

**m8 — howToPlayButtonClick() is a one-liner beside the inline (closed) binding** *(Minor · FG-2)*

**File**: `src/app/game/game.component.ts`, 530-534

**Description**: It only sets `howToOpen = false`, the same as `(closed)`. That matches the named-handler style of the other footers.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Keep it. | Consistent with the other footer handlers, and the comment explains why it's enough. | ✓ |
| **B** | Inline `(click)="this.howToOpen = false"`. | One less method, but it breaks the pattern. |  |
| **C** | Route (closed) through the same handler. | One close path, but (closed) serves every close. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m8 -->

---

<!-- vt.idd:finding:D1 -->
<!-- vt.idd:recommended:D1:A -->
<details>
<summary><strong>D1 — The Deployment Started comment says 4 tasks in 2 waves; 6 tasks in 6 waves were built</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D1 — The Deployment Started comment says 4 tasks in 2 waves; 6 tasks in 6 waves were built** *(Documentation · FG-3)*

**File**: `specs/010-honey_i_shrunk_the_howto/plan.md`, 97-102

**Description**: The plan's waves group the work in 2 while tasks.json has W0–W5, so the issue thread shows 4/2 then 6/6 at "Wave 5/6".



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add a line under the plan's Waves (archive + plan comment) saying tasks.json splits them into 6 waves. | Explains the jump without editing the automated comment. | ✓ |
| **B** | Edit the Deployment Started comment. | Rewrites an automated historical record. |  |
| **C** | Leave it. | A known plan→tasks expansion. |  |

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
<summary><strong>D2 — The plan's Data Model lists LABEL_HOWTO_PARAMETERS, which doesn't exist</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D2 — The plan's Data Model lists LABEL_HOWTO_PARAMETERS, which doesn't exist** *(Documentation · FG-3)*

**File**: `specs/010-honey_i_shrunk_the_howto/plan.md`, 40-52

**Description**: It was built as `LABEL_HOWTO_PARAMETERS_BEFORE` / `_GEAR` / `_AFTER`, and the hedge under the table doesn't name them.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Replace the row with the three built constants and state what was built (archive + plan comment). | The plan matches the code a reader will grep for. | ✓ |
| **B** | Add "(built as _BEFORE/_GEAR/_AFTER)" to the row. | Smaller edit. |  |
| **C** | Leave it. | The plan is pre-implementation. |  |

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
<summary><strong>D3 — Spec and PR predict playButtonClick and a CSS change; neither exists</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D3 — Spec and PR predict playButtonClick and a CSS change; neither exists** *(Documentation · FG-3)*

**File**: `specs/010-honey_i_shrunk_the_howto/spec.md`, 149-153

**Description**: The built method is `howToPlayButtonClick()`, and there is no CSS change in the diff.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Name `howToPlayButtonClick` and "CSS: none needed" in the spec (archive + comment); replace Predicted Files with the actual files in the PR body. | Records match the diff. | ✓ |
| **B** | Only fix the PR body. | The spec keeps the stale name. |  |
| **C** | Leave it. | These were predictions. |  |

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
<summary><strong>D4 — Nothing says the before/after screenshots exist or what is still pending</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D4 — Nothing says the before/after screenshots exist or what is still pending** *(Documentation · FG-3)*

**File**: `specs/010-honey_i_shrunk_the_howto/tasks.json`, T006

**Description**: FR-010/SC-005 require before and after shots at 390/1280. T006 mentions only the after shots, although howto-before-390/1280 and howto-after-* exist in validaciones/shell_generator/10.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | State in the PR body which before/after shots exist and that owner approval on #10 is pending. | Makes the merge gate visible. | ✓ |
| **B** | Amend T006 to say before/after. | Fixes the task record only. |  |
| **C** | Drop 'before' from FR-010. | Weakens the gate the owner asked for. |  |

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
<summary><strong>D5 — The spec's sizes omit 320×568, which the specs also test</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D5 — The spec's sizes omit 320×568, which the specs also test** *(Documentation · FG-3)*

**File**: `specs/010-honey_i_shrunk_the_howto/spec.md`, FR-007, VM-008/009

**Description**: The layout specs run 320×568 (no sideways scroll plus ✕/¡A jugar! reachable), but FR-007/US4/VM-008/009 list only 360/390/1280/844×390.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add 320×568 to FR-007, US4, VM-008/009 (archive + spec comment) and the PR Test Plan. | The spec states what is verified. | ✓ |
| **B** | Leave it. | The tests exceed the requirement. |  |
| **C** | Mention it only in the PR Test Plan. | Partial. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D5 -->

---


## Fix Groups

<!-- vt.idd:fix-group:FG-1 -->
<!-- vt.idd:recommended-disposition:FG-1:Fix -->
**FG-1** — `src/app/game/game.component.html`, `src/app/game/game.component.spec.ts` (+ `spec.md` FR-011/D6 for M1, soft-shared with FG-3) · M1, m1, m2, m3, m4, m5, m6, m7 · _Soft boundary with FG-3 (spec.md, different sections)_

M1 is the only behaviour change (what screen readers hear); the rest tighten specs. M1 changes decision D6 / FR-011, so it's recorded on the spec comment.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-1 -->

<!-- vt.idd:fix-group:FG-2 -->
<!-- vt.idd:recommended-disposition:FG-2:Acknowledge -->
**FG-2** — `src/app/game/game.component.ts` · m8 · _Hard boundary_

Recommended: keep as is.

- [ ] **Fix**
- [x] **Acknowledge** *(recommended)*
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-2 -->

<!-- vt.idd:fix-group:FG-3 -->
<!-- vt.idd:recommended-disposition:FG-3:Fix -->
**FG-3** — `specs/010-honey_i_shrunk_the_howto/spec.md`, `plan.md`, PR body (+ spec comment 5919834790, plan comment 5919851072) · D1, D2, D3, D4, D5 · _Soft boundary with FG-1 (spec.md)_

Docs only; spec and plan edits go to the issue comments and the archive together.

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

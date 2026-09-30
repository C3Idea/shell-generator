<!-- vt.idd:pr-review:pass-1 -->
## Code Review — PR #37: feat: welcome pop-up copy and shell equation (#3)

> **Codex tip**: Ask here for deeper context on any finding before approving —
> e.g. "walk me through M1 option A", "what files does M1 touch?",
> "combine M1+M2 into one fix". The table rationale is a summary; Codex has
> full diff context.
>
> **Copilot review**: Copilot review: skipped by config/flag (no .vt/vt.config.yaml in this repo, so review.copilot_integration is not enabled). Visual E2E: covered by the local harness (validaciones/shell_generator/3: real Chromium at 7 sizes collapsed/expanded, 125 % window, mouse/keyboard/touch; 109/109 on f179581) and the owner's manual pass §1–§10. Verification pass: not run (no C/S findings). Security reviewer: no C/S findings (only compile-time constants reach innerHTML; rel=noopener on the one external link; no new dependency). Reviewers: 3 role-scoped `reviewer` instances (security, quality, documentation). Reviewed head: 9cdd55d.
>
> **Verification**: Not run.

| Severity | Count | IDs |
|----------|-------|-----|
| Critical (C) | 0 | — |
| Security (S) | 0 | — |
| Major (M) | 2 | M1, M2 |
| Minor (m) | 5 | m1, m2, m3, m4, m5 |
| Documentation (D) | 9 | D1, D2, D3, D4, D5, D6, D7, D8, D9 |
| **Total** | **16** | |

---

## Findings

<!-- vt.idd:finding:M1 -->
<!-- vt.idd:recommended:M1:B -->
<details>
<summary><strong>M1 — Collapse specs check the hidden flag, not that the full system is really hidden</strong> <em>(Major · FG-1 · Quality reviewer)</em></summary>

**M1 — Collapse specs check the hidden flag, not that the full system is really hidden** *(Major · FG-1)*

**File**: `src/app/sandbox/sandbox.component.spec.ts`, 1205

**Description**: The three collapse specs ('keeps the full system collapsed at first', 'Ocultar… collapses it again', 'starts collapsed again each time the pop-up opens') assert `full().hidden` only. `app-equation { display: block }` overrides the browser's `[hidden]` rule, so if `app-equation[hidden] { display: none }` is lost the full system stays on screen and all three still pass. The harness's `hidden-shows` mutation targets exactly this gap.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | In the three specs also assert the full system takes no space (`shown(full())` false / computed display none). | Guards what the user sees, not just the attribute. |  |
| **B** | A shared `collapsed()` helper that checks the attribute and that the element renders nothing, used by all three specs. | One definition of collapsed keeps the three specs consistent. | ✓ |
| **C** | Drop `display: block` from `app-equation` so the browser's `[hidden]` always wins. | Removes the trap, but the block layout is what gives each equation its own scroll box. |  |

- [ ] **A**
- [x] **B** *(recommended)*
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:M1 -->

---

<!-- vt.idd:finding:M2 -->
<!-- vt.idd:recommended:M2:A -->
<details>
<summary><strong>M2 — Equation content specs can't catch a wrong sign or function</strong> <em>(Major · FG-1 · Quality reviewer)</em></summary>

**M2 — Equation content specs can't catch a wrong sign or function** *(Major · FG-1)*

**File**: `src/app/sandbox/sandbox.component.spec.ts`, 1222

**Description**: The specs only check that pieces such as `x(θ,s)`, `φ`, `Ω`, `μ`, `cotα` appear, and that there's no `D`; `a` and `b` are trivially present. A swapped `sen`/`cos`, a lost `−` or a dropped term would still pass, so 'what is shown is what is drawn' (the heart of #3) isn't pinned. The current MathML does match `surfaceFunction` (checked by hand).



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Pin the exact text of both forms (invisible operators stripped) in equation.component.spec.ts, row by row, with a comment mapping each row to surfaceFunction. | Any sign, function or term change fails; cheap and deterministic. | ✓ |
| **B** | Evaluate the rows numerically against surfaceFunction. | Stronger, but the MathML is markup, so this means writing a small parser. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:M2 -->

---

<!-- vt.idd:finding:m1 -->
<!-- vt.idd:recommended:m1:A -->
<details>
<summary><strong>m1 — Spoken full system is ambiguous about what the trig functions apply to</strong> <em>(Minor · FG-2 · Quality reviewer)</em></summary>

**m1 — Spoken full system is ambiguous about what the trig functions apply to** *(Minor · FG-2)*

**File**: `src/app/app-strings.ts`, 41

**Description**: LABEL_INTRO_EQUATION_FULL_ALT says 'coseno de s más phi por coseno de theta más omega', which a listener can hear as cos(s) + φ·cos(θ) + Ω, not cos(s+φ)·cos(θ+Ω). The MathML has the parentheses; the spoken version loses them.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Say 'coseno de la suma de s y phi' (and likewise for each sum inside a function). | Unambiguous when heard, still natural Spanish. | ✓ |
| **B** | Say 'coseno de, abre paréntesis, s más phi, cierra paréntesis'. | Mirrors the notation but is long and robotic. |  |
| **C** |  |  |  |

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
<summary><strong>m2 — `instanceof MathMLElement` throws where MathML is missing</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m2 — `instanceof MathMLElement` throws where MathML is missing** *(Minor · FG-1)*

**File**: `src/app/equation/equation.component.spec.ts`, 38

**Description**: In a browser without MathML, `MathMLElement` is undefined, so the spec fails with a ReferenceError rather than a readable assertion. Same pattern in the sandbox spec.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Guard it: `typeof MathMLElement !== 'undefined' && m instanceof MathMLElement`, next to the namespace check. | Keeps the 'laid out as MathML' check and fails with a clear message. | ✓ |
| **B** | Check only `namespaceURI`. | Simpler, but a right namespace doesn't prove the browser laid it out. |  |
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
<summary><strong>m3 — Centring spec uses unexplained tolerances</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m3 — Centring spec uses unexplained tolerances** *(Minor · FG-1)*

**File**: `src/app/sandbox/sandbox.component.spec.ts`, 1130

**Description**: `close.right > box.right - 60` and the `< 2` px centre tolerance aren't explained. (The a/b/θ help specs in the sandbox plus the a-only spec in the game are intentional: a is the shared string.)



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Name the tolerances with a short comment (the ✕ sits in the header's right padding; 2 px for sub-pixel rounding). | Readers see why the numbers are what they are. | ✓ |
| **B** | Leave as is. | Works, but the next reader has to guess. |  |
| **C** |  |  |  |

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
<summary><strong>m4 — Spoken text's absolutely positioned span has no positioned ancestor in the component</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m4 — Spoken text's absolutely positioned span has no positioned ancestor in the component** *(Minor · FG-1)*

**File**: `src/app/equation/equation.component.css`, 56

**Description**: `.visually-hidden` is `position: absolute` inside an unpositioned `app-equation`, so its containing block is whichever ancestor is positioned (the dialog). It's 1 px and clipped, so harmless today, but it depends on markup outside the component.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add `position: relative` to `app-equation`. | Keeps the hidden text inside the component that owns it. | ✓ |
| **B** | Leave as is. | Harmless at 1 px, but an implicit dependency. |  |
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
<summary><strong>m5 — Expander reset lives only in showIntroWindow</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m5 — Expander reset lives only in showIntroWindow** *(Minor · FG-1)*

**File**: `src/app/sandbox/sandbox.component.ts`, 330

**Description**: `fullEquationOpen` is reset when the pop-up opens through showIntroWindow; closing (✕, Esc, backdrop, Jugar) leaves it expanded until then, and any future path that sets `introOpen = true` directly would skip the reset.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | One `closeIntro()` used by the modal's (closed) and by Jugar, which resets the expander; keep the reset on open too. | The pop-up's state has one owner; any way in or out leaves it collapsed. | ✓ |
| **B** | Leave as is. | Covered today by the reset on open and its spec. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m5 -->

---

<!-- vt.idd:finding:D1 -->
<!-- vt.idd:recommended:D1:A -->
<details>
<summary><strong>D1 — Spec's Key Entities / Project Structure still call the component a 'candidate' and list parameter-help.ts</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D1 — Spec's Key Entities / Project Structure still call the component a 'candidate' and list parameter-help.ts** *(Documentation · FG-3)*

**File**: `specs/003-to_infinity_and_the_equation/spec.md`, 132

**Description**: Key Entities, Technical Summary and Project Structure Impact describe the equation as a candidate component or inline block and say the a/b/θ fix touches parameter-help.ts. The PR adds `<app-equation>` + `shell-equation.ts` (required by the Angular namespace bug), declares it in app.module.ts, adds handlers to sandbox.component.ts, and changes only app-strings.ts for the help.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Rewrite those sections to what was built, on the issue's spec comment and the archive. | The spec then matches the merged code. | ✓ |
| **B** | Add a decision noting the component instead of editing the body. | Keeps history but leaves the body contradicting the code. |  |
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
<summary><strong>D2 — 'Equation box' scrolling wording predates f179581</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D2 — 'Equation box' scrolling wording predates f179581** *(Documentation · FG-3)*

**File**: `specs/003-to_infinity_and_the_equation/spec.md`, 47

**Description**: US2, FR-005, D2, VM-006, the MathML risk row and Testing Strategy say the 'equation box' is the only sideways scroller. Since f179581 each `<app-equation>` scrolls on its own and the block with the button never does; the spec doesn't say the button must stay put.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Reword each place to 'each equation scrolls sideways inside itself; the pop-up, the page, the block around them and the button never do'. | Matches the behaviour and the spec that pins it. | ✓ |
| **B** | Only edit FR-005 and note f179581 in D2. | Smaller, but the other rows stay loose. |  |
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
<summary><strong>D3 — Stale line reference to the old <img> assertion</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D3 — Stale line reference to the old <img> assertion** *(Documentation · FG-3)*

**File**: `specs/003-to_infinity_and_the_equation/spec.md`, 265

**Description**: The risk row cites `sandbox.component.spec.ts:129` (and plan.md `:121-129`) for the <img> assertion, which was replaced by the 'no equation placeholder and no empty equation image left' spec.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Name the spec instead of a line number, in spec and plan. | Names survive edits; line numbers rot. | ✓ |
| **B** | Update the line numbers. | Rots again on the next edit. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D3 -->

---

<!-- vt.idd:finding:D4 -->
<!-- vt.idd:recommended:D4:B -->
<details>
<summary><strong>D4 — Plan and T002 list LABEL_INTRO_EQUATION_CAPTION, which was never added</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D4 — Plan and T002 list LABEL_INTRO_EQUATION_CAPTION, which was never added** *(Documentation · FG-3)*

**File**: `specs/003-to_infinity_and_the_equation/plan.md`, 48

**Description**: The plan's Data Model and T002 add a CAPTION string; LABEL_INTRO_LINE2 is the caption, and LABEL_INTRO_EQUATION_FULL_ALT (added) isn't listed.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Rewrite plan and T002's description. | Clean, but rewrites a completed task's record. |  |
| **B** | Note the deviation: in the plan (CAPTION dropped, LINE2 is the caption, FULL_ALT added) and as T002's completion note in tasks.json, re-rendering tasks.md. | Keeps the task record honest without rewriting history. | ✓ |
| **C** |  |  |  |

- [ ] **A**
- [x] **B** *(recommended)*
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D4 -->

---

<!-- vt.idd:finding:D5 -->
<!-- vt.idd:recommended:D5:B -->
<details>
<summary><strong>D5 — Plan says inline markup by default; a component was built</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D5 — Plan says inline markup by default; a component was built** *(Documentation · FG-3)*

**File**: `specs/003-to_infinity_and_the_equation/plan.md`, 97

**Description**: Project Structure and Wave 2 call the component a candidate ('default is inline template markup'); the scroll rule is described on #intro-equation; the link placement from D9 isn't there.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Rewrite Project Structure and Wave 2. | Plan matches code, loses the original plan. |  |
| **B** | Add a 'Deviations from the plan' section: component (namespace bug), no CAPTION, per-equation scroll, D9/D10. | Keeps the plan as planned and makes the drift explicit. | ✓ |
| **C** |  |  |  |

- [ ] **A**
- [x] **B** *(recommended)*
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D5 -->

---

<!-- vt.idd:finding:D6 -->
<!-- vt.idd:recommended:D6:A -->
<details>
<summary><strong>D6 — Plan names decisions D1–D8; the spec has D1–D10</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D6 — Plan names decisions D1–D8; the spec has D1–D10** *(Documentation · FG-3)*

**File**: `specs/003-to_infinity_and_the_equation/plan.md`, 15

**Description**: D9 (lines after the equation, Conoce más last) and D10 (centred, no-break space) change the markup the plan describes.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Say D1–D10 and point to the deviations section. | Readers don't apply the older layout. | ✓ |
| **B** | Leave as is. | The plan predates D9/D10 by design. |  |
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
<summary><strong>D7 — Plan claims the pop-up shows the model's ranges; it doesn't</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D7 — Plan claims the pop-up shows the model's ranges; it doesn't** *(Documentation · FG-3)*

**File**: `specs/003-to_infinity_and_the_equation/plan.md`, 24

**Description**: Research says 'the pop-up shows the model ranges (0≤s≤2π, θ≥0)'; neither form nor the spoken versions show ranges, and no FR asks for them.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Say the code's ranges (s 0..4π, θ up to theta·π) and that the pop-up shows none. | True to what shipped. | ✓ |
| **B** | Add the ranges to the equation. | Scope change the owner didn't ask for. |  |
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
<summary><strong>D8 — T004's record doesn't mention the component or the per-equation scroll</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D8 — T004's record doesn't mention the component or the per-equation scroll** *(Documentation · FG-3)*

**File**: `specs/003-to_infinity_and_the_equation/tasks.json`, 194

**Description**: T004 describes an 'equation box' and inline MathML; the work added src/app/equation/* and, after f179581, per-equation scrolling. The plan also cites drifted line numbers (sandbox.component.html:142, sandbox.component.ts:254).



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add a completion note to T004 (component, per-equation scroll) and drop the plan's line numbers. | Task record points at what implements it. | ✓ |
| **B** | Leave as is. | History, but misleading to a reader. |  |
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
<summary><strong>D9 — 'Collapsed again each time it opens' is built and tested but not specified</strong> <em>(Documentation · FG-3 · Documentation reviewer)</em></summary>

**D9 — 'Collapsed again each time it opens' is built and tested but not specified** *(Documentation · FG-3)*

**File**: `specs/003-to_infinity_and_the_equation/spec.md`, 118

**Description**: showIntroWindow resets the expander and a spec pins it, but FR-004/US2 never say so.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add it to FR-004 and as a US2 scenario with its VM row (VM-016). | Documents behaviour a spec already asserts; keeps VM rows = scenarios. | ✓ |
| **B** | Record it as a decision instead. | Lower churn, still traceable. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D9 -->

---


## Fix Groups

<!-- vt.idd:fix-group:FG-1 -->
<!-- vt.idd:recommended-disposition:FG-1:Fix -->
**FG-1** — `src/app/sandbox/sandbox.component.spec.ts`, `src/app/equation/equation.component.spec.ts`, `src/app/equation/equation.component.css`, `src/app/sandbox/sandbox.component.ts`/`.html` · M1, M2, m2, m3, m4, m5 · _Hard boundary (no file shared with other groups)_

Specs first: M1 and M2 tighten what is checked (the harness's hidden-shows mutation should then be caught); m5 is the only behaviour change (a closeIntro() that also collapses the expander); m2/m3/m4 are small.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-1 -->

<!-- vt.idd:fix-group:FG-2 -->
<!-- vt.idd:recommended-disposition:FG-2:Fix -->
**FG-2** — `src/app/app-strings.ts` · m1 · _Hard boundary_

Spoken text only; nothing on screen changes.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-2 -->

<!-- vt.idd:fix-group:FG-3 -->
<!-- vt.idd:recommended-disposition:FG-3:Fix -->
**FG-3** — `specs/003-to_infinity_and_the_equation/spec.md`, `plan.md`, `tasks.json`/`tasks.md` (+ spec comment 5915732075 on #3) · D1, D2, D3, D4, D5, D6, D7, D8, D9 · _Hard boundary_

Docs only; the spec edits go to the issue comment and the archive together. D9 adds a US2 scenario and VM-016.

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

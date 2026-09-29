<!-- vt.idd:pr-review:pass-1 -->
## Code Review — PR #33: feat: callout help for every parameter ⓘ + clearer shell panel (#6)

> **Codex tip**: Ask here for deeper context on any finding before approving —
> e.g. "walk me through M1 option A", "what files does M1 touch?",
> "combine M1+m1 into one fix". The table rationale is a summary; Codex has
> full diff context.
>
> **Copilot review**: Copilot review: skipped by config/flag (no .vt/vt.config.yaml in this repo, so review.copilot_integration is not enabled). Visual E2E: covered by the local harness (validaciones/shell_generator/6: browser layer at 1280/768/390 px, 360×800 touch and 844×390, before/after sheets) and the owner's manual pass (approved, incl. the 80 % background). Verification pass: not run (no C/S findings); M1 reproduced in the browser instead. Security reviewer: no C/S findings — help text is interpolated constants, no innerHTML, the layer can't intercept input, no new dependency. Reviewer: inline (no sub-agents). Reviewed head: c42d252.
>
> **Verification**: Not run.

| Severity | Count | IDs |
|----------|-------|-----|
| Critical (C) | 0 | — |
| Security (S) | 0 | — |
| Major (M) | 1 | M1 |
| Minor (m) | 5 | m1, m2, m3, m4, m5 |
| Documentation (D) | 4 | D1, D2, D3, D4 |
| **Total** | **10** | |

---

## Findings

<!-- vt.idd:finding:M1 -->
<!-- vt.idd:recommended:M1:A -->
<details>
<summary><strong>M1 — The callout stays put when its panel scrolls, so it points at the wrong row (or at nothing)</strong> <em>(Major · FG-1 · Quality reviewer)</em></summary>

**M1 — The callout stays put when its panel scrolls, so it points at the wrong row (or at nothing)** *(Major · FG-1)*

**File**: `src/app/callout/callout.component.ts`, 91-110

**Description**: The bubble is `position: fixed` and is only re-placed on `window:resize` (and on `recomputeKey`, which nothing binds). #6 made the shell panel scroll on short screens (`max-height: calc(100vh - 150px)`; the game menu likewise), so at 844×390 a user who opens an ⓘ and then scrolls the panel leaves the bubble behind. Reproduced in the browser: with b's callout open, scrolling the panel to the top moved b's ⓘ from y=293 to y=443 (below the panel's visible area) while the bubble stayed at y=247, its arrow now pointing at a different row. #6's criterion is "stays attached to its ⓘ"; the unit and e2e specs only check window resize.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Re-place on any scroll (a capture-phase `scroll` listener in CalloutComponent) and hide the bubble while its ⓘ is scrolled out of its panel's visible box; add a spec that scrolls the panel. | Keeps the bubble attached whatever scrolls, with no new wiring in the screens; hiding a bubble whose ⓘ is out of view avoids an arrow pointing at nothing. | ✓ |
| **B** | Close the callout when its panel scrolls. | Simplest and predictable, but a small accidental scroll on a phone closes the help the user just opened. |  |
| **C** | Re-place on scroll only. | Stays attached while the ⓘ is visible, but points past the panel's edge when the ⓘ scrolls out. |  |

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
<summary><strong>m1 — `recomputeKey` is an input nothing binds</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m1 — `recomputeKey` is an input nothing binds** *(Minor · FG-1)*

**File**: `src/app/callout/callout.component.ts`, 62-63

**Description**: `@Input() recomputeKey` (ported from gato_magico, where the board bumps it on resize) is bound by no parent in this app; only the callout's own spec sets it. Once the component listens to scroll itself (M1), it has no purpose left and reads as a contract the screens are supposed to honour.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Remove the input and move its spec to the scroll/resize triggers. | Dead API removed; the behaviour it guarded is covered by the real triggers. | ✓ |
| **B** | Bind it from each panel's `(scroll)`. | Works, but duplicates what one listener in the component does. |  |
| **C** | Keep it and document it as an escape hatch. | Leaves unused surface. |  |

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
<summary><strong>m2 — The help state is duplicated in the initial screen and the game</strong> <em>(Minor · FG-2 · Quality reviewer)</em></summary>

**m2 — The help state is duplicated in the initial screen and the game** *(Minor · FG-2)*

**File**: `src/app/sandbox/sandbox.component.ts, src/app/game/game.component.ts`, sandbox 52-58, 242-262; game 107-113, 473-490

**Description**: `helpKey`, `helpCallout`, `calloutId`, `toggleHelp()`, `closeHelp()` and the Esc `@HostListener` are the same ~25 lines in both components. The close rules are the part most likely to be tuned (they already were, twice, during validation); two copies can drift.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Move the state into a small `ParameterHelp` class in `parameter-help.ts` (`key`, `callout`, `toggle(key)`, `close()`); each screen owns one instance and keeps its own Esc listener and panel wiring. | One implementation of toggle/replace/close; the screens only say when to close. | ✓ |
| **B** | An injectable service. | The state is per screen and short-lived; a service adds DI for no gain. |  |
| **C** | Acknowledge. | Small today, but the drift risk stays. |  |

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
<summary><strong>m3 — The ≤380 px rule still forces a permanent scrollbar on the panels</strong> <em>(Minor · FG-3 · Quality reviewer)</em></summary>

**m3 — The ≤380 px rule still forces a permanent scrollbar on the panels** *(Minor · FG-3)*

**File**: `src/app/sandbox/sandbox.component.css, src/app/game/game.component.css`, sandbox 203-208; game 404-409

**Description**: `@media (max-width: 380px) { #parameters-menu { width: 96%; overflow-y: scroll; } }` predates #6 and overrides its new `overflow-y: auto`. On 360-px phones (the Galaxy A55 the owner tested) a desktop Chrome in device mode shows a scrollbar gutter even when the panel fits, narrowing every row by ~15 px.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Drop `overflow-y: scroll` from the ≤380 px rules (the base rule's `auto` already scrolls when needed). | One declaration each; the panel scrolls only when it has to, at every width. | ✓ |
| **B** | Change it to `auto` in the media rule. | Same effect, one redundant declaration kept. |  |
| **C** | Acknowledge (pre-existing). | Leaves the gutter on small phones. |  |

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
<summary><strong>m4 — `placeCallout` can cover its ⓘ on a very short screen, despite its comment</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m4 — `placeCallout` can cover its ⓘ on a very short screen, despite its comment** *(Minor · FG-1)*

**File**: `src/app/callout/callout.component.ts`, 32-47

**Description**: When the bubble fits neither to the right nor below, it goes above with `top = max(MARGIN, …)`; if above doesn't fit either (e.g. 568×320 with an ⓘ near the panel's bottom edge) the clamp pushes it over the ⓘ. The comment says it never covers the anchor.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | When neither below nor above fits, take the side with more room, and make the comment state the limit. | Minimises overlap in the rare case and keeps the comment true. | ✓ |
| **B** | Cap the bubble's height to the larger side with `overflow: auto`. | Never overlaps, but a scrolling bubble is awkward with `pointer-events: none`. |  |
| **C** | Fix the comment only. | Honest, but leaves the avoidable overlap. |  |

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
<summary><strong>m5 — The empty live region is also a named landmark on every screen</strong> <em>(Minor · FG-1 · Quality reviewer)</em></summary>

**m5 — The empty live region is also a named landmark on every screen** *(Minor · FG-1)*

**File**: `src/app/callout/callout.component.html`, 1

**Description**: The layer is `role="region" aria-label="Ayuda de parámetros"`, always in the DOM. Screen-reader landmark lists (NVDA D, VoiceOver rotor) show an empty "Ayuda de parámetros" region on both screens even when no bubble is open. `aria-live` alone is enough for the announcement.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Drop `role` and `aria-label` from the layer (keep `aria-live="polite"`) and the now-unused `LABEL_PARAM_HELP_REGION` string. | Announcements unchanged; no phantom landmark; one string fewer. | ✓ |
| **B** | Render the landmark only while a bubble is open. | Changing a live region's presence can drop the first announcement. |  |
| **C** | Acknowledge. | Keeps the empty landmark. |  |

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
<summary><strong>D1 — The callout stylesheet says its shadow and background come from the tokens</strong> <em>(Documentation · FG-1 · Documentation reviewer)</em></summary>

**D1 — The callout stylesheet says its shadow and background come from the tokens** *(Documentation · FG-1)*

**File**: `src/app/callout/callout.component.css`, 1-2

**Description**: The header comment says colours, font, rounding and shadow come from `--modal-*`. The shadow is its own (`0 0.25rem 1rem rgba(20, 35, 42, 0.18)`, stronger than Pico's over the 3D view) and the background is the token mixed to 80 %.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Say which parts use the tokens and why the shadow and background differ. | The next restyle (#17) won't look for a shadow token that isn't used. | ✓ |
| **B** | Switch to `var(--modal-box-shadow)`. | Consistent, but the owner approved the current look. |  |
| **C** | Remove the comment. | Loses the pointer to the tokens. |  |

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
<summary><strong>D2 — Plan and tasks describe code that changed during validation</strong> <em>(Documentation · FG-4 · Documentation reviewer)</em></summary>

**D2 — Plan and tasks describe code that changed during validation** *(Documentation · FG-4)*

**File**: `specs/006-attack_of_the_callouts/plan.md, tasks.json`, plan Waves/Project Structure; T010, T011

**Description**: T011 says the slider fix leaves the shell rows unchanged, but `.slider` is now `flex: 1` for every row (T009). T010 says the cap is "under the 75 px offset"; it's 150 px (above the pencil) since 40befed, and the game menu got a 126 px cap (2e7768d) that the plan's Project Structure doesn't list. The plan describes `recomputeKey` as the re-placement trigger. The 80 % background and the ⓘ flex-shrink fix aren't in the plan.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Update plan.md (local and the plan comment on #6) and the T009–T011 descriptions to the code as merged. | The archive is the post-mortem record; it should match what shipped. | ✓ |
| **B** | Add an addendum at the end of plan.md. | Keeps history, but readers see contradicting sections. |  |
| **C** | Acknowledge. | Leaves a stale record. |  |

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
<summary><strong>D3 — Spec and issue say the callout re-places only on window resize</strong> <em>(Documentation · FG-4 · Documentation reviewer)</em></summary>

**D3 — Spec and issue say the callout re-places only on window resize** *(Documentation · FG-4)*

**File**: `spec comment on #6 (FR-008), #6 acceptance criteria`, FR-008; Placement criteria

**Description**: FR-008 and the issue's Placement criterion only require the bubble to stay attached "on resize". With M1 fixed it also follows panel scrolling (and hides while its ⓘ is scrolled away); the criterion should say so, or the fix isn't covered by the acceptance record.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Extend FR-008 and the Placement criterion to panel scroll, and add a verification row. | Makes the M1 behaviour part of what /vt.review stamps. | ✓ |
| **B** | Note it in Decisions Made only. | Recorded, but not checked. |  |
| **C** | Acknowledge. | Leaves the criterion narrower than the code. |  |

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
<summary><strong>D4 — The PR body predates the validation fixes</strong> <em>(Documentation · FG-4 · Documentation reviewer)</em></summary>

**D4 — The PR body predates the validation fixes** *(Documentation · FG-4)*

**File**: `PR #33 body`, Summary, Predicted Files, Test Plan

**Description**: The body doesn't mention the two landscape fixes (shell panel above the pencil, game menu above the switch), the ⓘ flex-shrink fix, the 80 % background, `parameter-help.ts`, or the game CSS menu cap; the Test Plan boxes are all unticked although the owner's manual pass and the harness ran.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Rewrite Summary/Files/Test Plan to the merged code and tick what's verified. | The PR body is what a reviewer reads first. | ✓ |
| **B** | Add a 'Changes since opening' section. | Quicker, but the lists above it stay wrong. |  |
| **C** | Acknowledge. | Leaves a misleading PR description. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D4 -->

---


## Fix Groups

<!-- vt.idd:fix-group:FG-1 -->
<!-- vt.idd:recommended-disposition:FG-1:Fix -->
**FG-1** — `src/app/callout/callout.component.{ts,html,css,spec.ts}`, `src/app/app-strings.ts` · M1, m1, m4, m5, D1 · _Hard boundary_

One commit on the callout: follow panel scrolling (hide while its ⓘ is out of view), drop recomputeKey, better fallback side, no phantom landmark, accurate comment. RED first: a spec that scrolls a panel.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-1 -->

<!-- vt.idd:fix-group:FG-2 -->
<!-- vt.idd:recommended-disposition:FG-2:Fix -->
**FG-2** — `src/app/parameter-help.ts`, `src/app/sandbox/sandbox.component.{ts,html}`, `src/app/game/game.component.{ts,html}` · m2 · _Hard boundary_

Refactor only; the existing callout specs on both screens must stay green unchanged.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-2 -->

<!-- vt.idd:fix-group:FG-3 -->
<!-- vt.idd:recommended-disposition:FG-3:Fix -->
**FG-3** — `src/app/sandbox/sandbox.component.css`, `src/app/game/game.component.css` · m3 · _Soft boundary (FG-2 touches the same components, not the CSS)_

Two one-line CSS removals.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-3 -->

<!-- vt.idd:fix-group:FG-4 -->
<!-- vt.idd:recommended-disposition:FG-4:Fix -->
**FG-4** — `specs/006-attack_of_the_callouts/{plan.md,spec.md,tasks.json}`, issue #6, PR #33 body · D2, D3, D4 · _Hard boundary_

Docs only, after FG-1–FG-3 land so they describe the final code.

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

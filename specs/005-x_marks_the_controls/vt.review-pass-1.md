<!-- vt.idd:pr-review:pass-1 -->
## Code Review — PR #34: feat: initial-screen control guide (#5)

> **Codex tip**: Ask here for deeper context on any finding before approving —
> e.g. "walk me through M1 option A", "what files does M1 touch?",
> "combine M1+M2 into one fix". The table rationale is a summary; Codex has
> full diff context.
>
> **Copilot review**: Copilot review: skipped by config/flag (no .vt/vt.config.yaml in this repo, so review.copilot_integration is not enabled). Visual E2E: covered by the local harness (validaciones/shell_generator/5: real Chromium, mouse and touch at 8 sizes incl. short phone screens, 146/146) and the owner's manual pass §1–§6. Verification pass: not run (no C/S findings); the M findings were checked against the code before posting. Security reviewer: no C/S findings (static strings by interpolation, hardcoded selectors and ids, no new dependency). Reviewers: 3 role-scoped `reviewer` instances (security, quality, documentation). Reviewed head: 9eab9a1.
>
> **Verification**: Not run.

| Severity | Count | IDs |
|----------|-------|-----|
| Critical (C) | 0 | — |
| Security (S) | 0 | — |
| Major (M) | 4 | M1, M2, M3, M4 |
| Minor (m) | 4 | m1, m2, m3, m4 |
| Documentation (D) | 9 | D1, D2, D3, D4, D5, D6, D7, D8, D9 |
| **Total** | **17** | |

---

## Findings

<!-- vt.idd:finding:M1 -->
<!-- vt.idd:recommended:M1:A -->
<details>
<summary><strong>M1 — Viewport test helper restores the wrong size when a spec calls it twice</strong> <em>(Major · FG-1 · Quality reviewer)</em></summary>

**M1 — Viewport test helper restores the wrong size when a spec calls it twice** *(Major · FG-1)*

**File**: `src/app/callout/callout.component.spec.ts`, 271-285

**Description**: `setViewport()` records `before` from the iframe's *current* size and overwrites `restoreViewport` on each call. The guide-mode `beforeEach` sets 390×844 and 're-places the bubbles when the window is resized' sets 1280×800, so `afterEach` restores 390×844, not the original. The sandbox #5 block does the same (390→844×390, plus nested `beforeEach` calls). With Jasmine's random order, the leaked iframe size can make unrelated layout specs (modal, game, panel layout) depend on the seed.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Capture the original size only once per spec (first call), and always apply the new size. | Smallest correct fix: `afterEach` always restores the true original. | ✓ |
| **B** | Leave it and reset the iframe in a global `afterEach`. | Hides the bug instead of fixing the helper. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:M1 -->

---

<!-- vt.idd:finding:M2 -->
<!-- vt.idd:recommended:M2:A -->
<details>
<summary><strong>M2 — The Karma-iframe viewport helper is copy-pasted into several specs</strong> <em>(Major · FG-1 · Quality reviewer)</em></summary>

**M2 — The Karma-iframe viewport helper is copy-pasted into several specs** *(Major · FG-1)*

**File**: `src/app/sandbox/sandbox.component.spec.ts`, 387, 533

**Description**: The same resize + `pending()` + restore closure exists at sandbox.component.spec.ts:387 and :533, callout.component.spec.ts:271 and game.component.spec.ts (from #6). A fix to one copy (M1) doesn't reach the others. `src/testing/frame-pump.ts` already holds shared test helpers.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add `src/testing/viewport.ts` exporting `useViewport()` (a `set(width, height)` that captures the original once, restored by an `afterEach` it registers) and use it in every spec. | One place to fix and reason about, next to the existing frame pump. | ✓ |
| **B** | Dedupe only the two new #5 copies. | Less churn, but leaves the older copies with the bug. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:M2 -->

---

<!-- vt.idd:finding:M3 -->
<!-- vt.idd:recommended:M3:A -->
<details>
<summary><strong>M3 — Geometry constants and `clamp` duplicated between the callout and layoutGuide, with a type-only import cycle</strong> <em>(Major · FG-2 · Quality reviewer)</em></summary>

**M3 — Geometry constants and `clamp` duplicated between the callout and layoutGuide, with a type-only import cycle** *(Major · FG-2)*

**File**: `src/app/callout/layout-guide.ts`, 1, 37-57

**Description**: layout-guide.ts imports `Box`/`Size` from callout.component.ts, which imports `layoutGuide` back. It's type-only today, but breaks as soon as either becomes a value import. `GAP = 10`, `MARGIN = 8`, `ARROW_INSET = 14` and `clamp` are redefined in both files: if #6's spacing changes, the guide silently diverges from the single bubble.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add `src/app/callout/geometry.ts` exporting `Box`, `Size`, `GAP`, `MARGIN`, `ARROW_INSET`, `clamp` and `overlaps`; import it from the component, layoutGuide and the specs. | Removes the cycle and the duplicated constants without changing behaviour. | ✓ |
| **B** | Export the constants from layout-guide.ts and import them in the component. | Smaller, but makes #6 code depend on the guide module. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:M3 -->

---

<!-- vt.idd:finding:M4 -->
<!-- vt.idd:recommended:M4:A -->
<details>
<summary><strong>M4 — The 'reaches the shell with a line' spec asserts nothing when no line is drawn</strong> <em>(Major · FG-1 · Quality reviewer)</em></summary>

**M4 — The 'reaches the shell with a line' spec asserts nothing when no line is drawn** *(Major · FG-1)*

**File**: `src/app/callout/layout-guide.spec.ts`, 213

**Description**: Its real assertions sit inside `if (view.leader) { … }`. With the fake measure at 360×640 the 3D view's bubble fits beside the shell, so `placeFar()` (column search, line start below covering boxes, line-vs-bubble collision) has no guaranteed coverage; the spec would still pass if `placeFar()` were deleted.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Build an item set that provably forces `placeFar()` (a staircase covering the region and a control right under it) and assert the line unconditionally: defined, starts on the region, ends at the arrow, crosses nothing. | Fails if the far-placement path stops being exercised. | ✓ |
| **B** | Also add specs for the `above` branch and the fallback clamp. | More coverage, more fixture code. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:M4 -->

---

<!-- vt.idd:finding:m1 -->
<!-- vt.idd:recommended:m1:A -->
<details>
<summary><strong>m1 — Every window resize lays the guide out twice</strong> <em>(Minor · FG-3 · Quality reviewer)</em></summary>

**m1 — Every window resize lays the guide out twice** *(Minor · FG-3)*

**File**: `src/app/sandbox/sandbox.component.ts`, 41

**Description**: On resize the sandbox's handler moves `#shell-region` and calls `guide.refresh()` (a new array → `ngOnChanges` → a full `place()`), and the callout's own `window:resize` handler places too. Each pass forces reflows per bubble and may run `placeFar()`'s scan; dragging a desktop window edge does this twice per event.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | On the resize path, only move `#shell-region`; let the callout's own resize handler re-place (the sandbox's listener, registered first, runs before it). | One layout pass per resize, on the updated region. | ✓ |
| **B** | Throttle the callout's resize handler with requestAnimationFrame. | Fewer passes but still two per frame. |  |
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
<summary><strong>m2 — `shellScreenBox()` isn't clipped to the canvas and projects points behind the camera</strong> <em>(Minor · FG-4 · Quality reviewer)</em></summary>

**m2 — `shellScreenBox()` isn't clipped to the canvas and projects points behind the camera** *(Minor · FG-4)*

**File**: `src/app/shell-viewer.ts`, 286

**Description**: Zoomed in close with the wheel, vertices behind the camera project to mirrored coordinates, and even valid ones aren't clamped to the canvas. After a drag, `followShell()` can then make `#shell-region` bigger than the screen, no side fits, and the 3D view's bubble falls back to a clamped spot pointing at nothing.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Skip points outside the view frustum's depth (`z` outside [-1, 1]) and intersect the box with the canvas; return null if nothing is left. | Keeps the region on the visible part of the shell. | ✓ |
| **B** | Clamp only in `followShell()`. | Simpler, but leaves the viewer returning bogus boxes. |  |
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
<summary><strong>m3 — A right-click counts as a tap, and a lost pointerup can block taps</strong> <em>(Minor · FG-3 · Quality reviewer)</em></summary>

**m3 — A right-click counts as a tap, and a lost pointerup can block taps** *(Minor · FG-3)*

**File**: `src/app/sandbox/sandbox.component.ts`, 190-210

**Description**: `canvasPointerUp` treats any button as a tap, so a right-click or middle-click (OrbitControls pan) without movement closes the guide. And `presses` is only cleared on pointerup/cancel: if one never arrives, the next press sees two pointers, `pinching` sticks at true, and taps never close the guide again until reload (Esc and the "?" still do).



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Count a tap only for the primary button (`button === 0`), and start fresh when a primary pointer goes down (`isPrimary`); add specs for both. | Small change that closes both holes. | ✓ |
| **B** | Track pointers through capture events and add pointercancel specs. | Stronger, more code. |  |
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
<summary><strong>m4 — Run-on line in the layoutGuide doc comment</strong> <em>(Minor · FG-2 · Quality reviewer)</em></summary>

**m4 — Run-on line in the layoutGuide doc comment** *(Minor · FG-2)*

**File**: `src/app/callout/layout-guide.ts`, 68

**Description**: One line joins two sentences and runs past the file's ~80-column wrapping. Same place as D8.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Rewrap the comment (fixed with D8). | Consistency. | ✓ |
| **B** |  |  |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m4 -->

---

<!-- vt.idd:finding:D1 -->
<!-- vt.idd:recommended:D1:A -->
<details>
<summary><strong>D1 — Issue #5 still sends the game screen's reuse to #10</strong> <em>(Documentation · FG-6 · Documentation reviewer)</em></summary>

**D1 — Issue #5 still sends the game screen's reuse to #10** *(Documentation · FG-6)*

**File**: `issue #5 body`, Suggested direction, Out of scope, Related

**Description**: The body says '#10 then reuses it', lists 'The game screen's guide and the how-to text (#10)' as out of scope and '#10: reuses this guide'. #10 is now the how-to text rewrite; the game's guide is #35. The spec already says #35.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Replace #10 with #35 where it means the game's guide; keep #10 for the how-to text. | The issue is what the PR closes; it should match the spec. | ✓ |
| **B** | Add a comment instead of editing the body. | Leaves the wrong link in the body. |  |
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
<summary><strong>D2 — Issue #5's 'Suggested direction' still puts the "?" in the toolbar</strong> <em>(Documentation · FG-6 · Documentation reviewer)</em></summary>

**D2 — Issue #5's 'Suggested direction' still puts the "?" in the toolbar** *(Documentation · FG-6)*

**File**: `issue #5 body`, Suggested direction

**Description**: 'Add a "?" button to the toolbar' contradicts 'Chosen values' in the same body (alone in the top-right corner) and the code.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Reword: 'Add a "?" button alone in the top-right corner, level with the toolbar'. | Removes the contradiction. | ✓ |
| **B** |  |  |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D2 -->

---

<!-- vt.idd:finding:D3 -->
<!-- vt.idd:recommended:D3:B -->
<details>
<summary><strong>D3 — The spec's conventions still give the guide the 80 % background</strong> <em>(Documentation · FG-5 · Documentation reviewer)</em></summary>

**D3 — The spec's conventions still give the guide the 80 % background** *(Documentation · FG-5)*

**File**: `specs/005-x_marks_the_controls/spec.md`, 167

**Description**: 'Reuse … the #6 callout look (80 % background, teal border/arrow)'. The guide's bubbles are 95 % (`.callout-guide`); only the ⓘ bubble stays at 80 %. The 95 % decision (owner, `c3d3133`) isn't among the spec's decisions.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Fix the conventions line. | Matches the CSS. |  |
| **B** | Fix the line and add decision 17 for the 95 % background. | Decisions 14–16 record the other owner changes; this one is missing. | ✓ |
| **C** |  |  |  |

- [ ] **A**
- [x] **B** *(recommended)*
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D3 -->

---

<!-- vt.idd:finding:D4 -->
<!-- vt.idd:recommended:D4:A -->
<details>
<summary><strong>D4 — The spec's Key Entities describe a layout signature and a type that don't exist</strong> <em>(Documentation · FG-5 · Documentation reviewer)</em></summary>

**D4 — The spec's Key Entities describe a layout signature and a type that don't exist** *(Documentation · FG-5)*

**File**: `specs/005-x_marks_the_controls/spec.md`, 113-115

**Description**: 'a pure function taking the anchors' boxes, the bubbles' sizes and the viewport': it's `layoutGuide(items: GuideItem[], measure, viewport)` with a measuring callback. 'GuideCallout … extends the #6 Callout': no such type; `Callout` gained an optional `region`, and the line lives in `GuidePlacement.leader`.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Describe the as-built entities: `GuideItem {anchor, region?}`, the `measure` callback, `GuidePlacement.leader`, `Callout.region`. | Matches the code and the PR's account. | ✓ |
| **B** | Add 'as built: see layout-guide.ts'. | Cheaper but leaves the stale text. |  |
| **C** |  |  |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D4 -->

---

<!-- vt.idd:finding:D5 -->
<!-- vt.idd:recommended:D5:B -->
<details>
<summary><strong>D5 — The PR still calls the guide's text 'draft'</strong> <em>(Documentation · FG-6 · Documentation reviewer)</em></summary>

**D5 — The PR still calls the guide's text 'draft'** *(Documentation · FG-6)*

**File**: `PR #34 body`, Files Changed, Test Plan

**Description**: The app-strings.ts row says 'draft text' and the last checkbox bundles the approved text with the pending screenshots.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Change 'draft text' to 'owner-approved text'. | Matches the code. |  |
| **B** | That, and split the checkbox: text approved (ticked), screenshots approved (open). | Shows exactly what is still pending. | ✓ |
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
<summary><strong>D6 — ControlGuide's comment leaves the "?" out of the reading order</strong> <em>(Documentation · FG-5 · Documentation reviewer)</em></summary>

**D6 — ControlGuide's comment leaves the "?" out of the reading order** *(Documentation · FG-5)*

**File**: `src/app/control-guide.ts`, 6

**Description**: 'in reading order (the toolbar left to right, the 3D view, the pencil)', but the array has the "?" (now in the top-right corner) between the book and the 3D view.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | '(the toolbar left to right, the "?" in the top-right corner, the 3D view, the pencil)'. | Describes the array and the order a screen reader hears. | ✓ |
| **B** |  |  |  |
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
<summary><strong>D7 — Callout comments still describe only the #6 ⓘ bubble</strong> <em>(Documentation · FG-2 · Documentation reviewer)</em></summary>

**D7 — Callout comments still describe only the #6 ⓘ bubble** *(Documentation · FG-2)*

**File**: `src/app/callout/callout.component.ts`, 4

**Description**: 'One help bubble (#6), shown for the ⓘ that was clicked'; the CSS header says the background is 80 % and the arrow 'points back at the ⓘ'. Guide bubbles point at controls and the shell region, at 95 %.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Mention the guide in the `Callout` and arrow comments, and '80 % for the ⓘ bubble, 95 % for the guide's' in the CSS header. | Stops the header contradicting `.callout-guide`. | ✓ |
| **B** |  |  |  |
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
<summary><strong>D8 — 'sits beside it instead' has no referent</strong> <em>(Documentation · FG-2 · Documentation reviewer)</em></summary>

**D8 — 'sits beside it instead' has no referent** *(Documentation · FG-2)*

**File**: `src/app/callout/layout-guide.ts`, 79

**Description**: The doc comment says the rightmost row control's bubble 'sits beside it instead' without saying it skips the staircase.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | 'Where there's room to its right, the rightmost control's bubble goes there and skips the staircase', rewrapped (with m4). | Says what the bubble is spared. | ✓ |
| **B** |  |  |  |
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
<summary><strong>D9 — The deploy-time plan reads as current design with nothing marking it as superseded</strong> <em>(Documentation · FG-5 · Documentation reviewer)</em></summary>

**D9 — The deploy-time plan reads as current design with nothing marking it as superseded** *(Documentation · FG-5)*

**File**: `specs/005-x_marks_the_controls/plan.md`, 11, 34, 41, 45

**Description**: plan.md states the "?" after the book, an 80 % background, `layoutGuide(anchors, bubbles, viewport)` and a zero-size canvas marker as design; tasks.md/tasks.json repeat them (generated; not to be hand-edited). Expected for a snapshot, but nothing says so.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Add a note under plan.md's title: deploy-time plan, superseded in places by spec decisions 14–17 and the as-built `layoutGuide(items, measure, viewport)`. | Cheap; the generated task files stay untouched. | ✓ |
| **B** | Leave it. | Both are snapshots; the issue and spec are current. |  |
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
**FG-1** — `src/testing/viewport.ts` (new), `src/app/callout/callout.component.spec.ts`, `src/app/sandbox/sandbox.component.spec.ts`, `src/app/game/game.component.spec.ts`, `src/app/callout/layout-guide.spec.ts` · M1, M2, M4 · _Soft boundary with FG-2 (layout-guide.spec.ts imports)_

One shared viewport helper that captures the original size once; every spec uses it; the far-placement spec forced and asserted unconditionally. RED first: the helper's once-only restore and the forced placeFar.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-1 -->

<!-- vt.idd:fix-group:FG-2 -->
<!-- vt.idd:recommended-disposition:FG-2:Fix -->
**FG-2** — `src/app/callout/geometry.ts` (new), `src/app/callout/callout.component.{ts,css}`, `src/app/callout/layout-guide.ts` · M3, D7, D8, m4 · _Soft boundary with FG-1_

Move the shared geometry out of the component, break the import cycle; fix the callout and layout comments. Behaviour unchanged; existing specs are the guard.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-2 -->

<!-- vt.idd:fix-group:FG-3 -->
<!-- vt.idd:recommended-disposition:FG-3:Fix -->
**FG-3** — `src/app/sandbox/sandbox.component.{ts,spec.ts}` · m1, m3 · _Hard boundary_

Primary-button taps, a fresh start on a primary press, one layout pass per resize. RED first: right-click and stale-press specs.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-3 -->

<!-- vt.idd:fix-group:FG-4 -->
<!-- vt.idd:recommended-disposition:FG-4:Fix -->
**FG-4** — `src/app/shell-viewer.{ts,spec.ts}` · m2 · _Hard boundary_

Clip the projected box to the canvas and drop points behind the camera. RED first: a zoomed-in camera spec.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-4 -->

<!-- vt.idd:fix-group:FG-5 -->
<!-- vt.idd:recommended-disposition:FG-5:Fix -->
**FG-5** — `specs/005-x_marks_the_controls/{spec,plan}.md`, `src/app/control-guide.ts` · D3, D4, D6, D9 · _Hard boundary_

Spec conventions + decision 17 (95 %), as-built entities, plan snapshot note, ControlGuide comment; the spec comment on #5 too.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-5 -->

<!-- vt.idd:fix-group:FG-6 -->
<!-- vt.idd:recommended-disposition:FG-6:Fix -->
**FG-6** — issue #5 body, PR #34 body · D1, D2, D5 · _Hard boundary (GitHub text only)_

#10 → #35 for the game's guide, the "?" in the corner, text approved vs screenshots pending.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-6 -->


<!-- vt.idd:pr-review:approve -->
## Approve and Proceed

All findings reviewed? Check the box to authorize fix execution.

- [ ] **Approve and proceed** — I have reviewed all findings and dispositions above. Execute fixes per the checked dispositions.
<!-- /vt.idd:pr-review:approve -->
<!-- /vt.idd:pr-review:pass-1 -->

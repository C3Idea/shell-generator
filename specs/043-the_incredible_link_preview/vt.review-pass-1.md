<!-- vt.idd:pr-review:pass-1 -->
## Code Review — PR #44: feat: add Open Graph link preview for shared links (#43)

> **Codex tip**: Ask here for deeper context on any finding before approving —
> e.g. "walk me through m1 option A", "what files does m1 touch?",
> "combine m1+D1 into one fix". The table rationale is a summary; Codex has
> full diff context.
>
> **Copilot review**: Copilot review: skipped by config/flag (no .vt/vt.config.yaml in this repo, so review.copilot_integration is not enabled). Visual E2E: no ui-visual-reviewer agent; covered by the Playwright browser check (36/36: crawler view of app URL and a real Compartir link, og:image 1200×630 JPEG, simulated cards, tab title/lang at 1280×800 and 390×844; validaciones/shell_generator/43). Verification pass: not run (no C/S findings). Reviewers: 1 omnibus `reviewer` instance (477-line diff, under the split threshold). Spec compliance: FR-001..FR-005, FR-008..FR-010 hold. Reviewed head: f335b34.
>
> **Verification**: Not run.

| Severity | Count | IDs |
|----------|-------|-----|
| Critical (C) | 0 | — |
| Security (S) | 0 | — |
| Major (M) | 0 | — |
| Minor (m) | 1 | m1 |
| Documentation (D) | 1 | D1 |
| **Total** | **2** | |

---

## Findings

<!-- vt.idd:finding:m1 -->
<!-- vt.idd:recommended:m1:A -->
<details>
<summary><strong>m1 — English <noscript> text left under lang="es"</strong> <em>(Minor · FG-1 · Omnibus reviewer)</em></summary>

**m1 — English <noscript> text left under lang="es"** *(Minor · FG-1)*

**File**: `src/index.html`, ~29

**Description**: The page now declares `<html lang="es">`, but `<noscript>Please enable JavaScript to continue using this application.</noscript>` is still English. Visitors without JavaScript see English, and screen readers read it with Spanish pronunciation. It is the last Angular scaffold leftover in the file; the PR's purpose (US2, SC-003) is for the page to present itself in Spanish.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Translate it: `<noscript>Activa JavaScript para usar esta aplicación.</noscript>`, and note it in the spec (FR-001 / Project Structure). | Completes the lang change with a one-line, zero-risk edit. | ✓ |
| **B** | Keep the English text and mark it `lang="en"`. | Metadata correct, but visitors still read English. |  |
| **C** | Leave it and record a follow-up. | No diff change, visible inconsistency stays. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:m1 -->

---

<!-- vt.idd:finding:D1 -->
<!-- vt.idd:recommended:D1:A -->
<details>
<summary><strong>D1 — Archive says mozjpeg; the built JPEG is baseline without the mozjpeg preset</strong> <em>(Documentation · FG-2 · Omnibus reviewer)</em></summary>

**D1 — Archive says mozjpeg; the built JPEG is baseline without the mozjpeg preset** *(Documentation · FG-2)*

**File**: `specs/043-the_incredible_link_preview/spec.md`, 45, 74 (plan.md W0/Research; tasks.json T001)

**Description**: Spec Technical Summary, plan.md (Research Findings, W0) and T001 say "JPEG with mozjpeg, quality about 85". `file src/assets/link_preview.jpg` reports baseline: sharp's mozjpeg preset forces progressive output, so it was dropped. The archive is the only record of how the asset was produced. FR-006/FR-007 don't require mozjpeg, so this is wording, not non-compliance.



| #     | Approach              | Rationale              |       Rec.       |
| ----- | --------------------- | ---------------------- | :--------------: |
| **A** | Reword spec.md, plan.md and tasks.json (re-render tasks.md) to "sharp JPEG q85, baseline (no mozjpeg preset, which forces progressive), optimised Huffman + trellis, metadata stripped"; mirror on the issue's spec/plan comments. | Archive matches the artifact and records why. | ✓ |
| **B** | Keep the plan text and add a Deviations note. | Documents the delta but leaves contradictory statements. |  |
| **C** | No change. | Text stays inaccurate. |  |

- [x] **A** *(recommended)*
- [ ] **B**
- [ ] **C**
- [ ] **Alternative**: *(describe)*

</details>
<!-- /vt.idd:finding:D1 -->

---


## Fix Groups

<!-- vt.idd:fix-group:FG-1 -->
<!-- vt.idd:recommended-disposition:FG-1:Fix -->
**FG-1** — `src/index.html`, `specs/043-the_incredible_link_preview/spec.md` · m1 · _Soft boundary (shares spec.md with FG-2, different sections)_

One-line translation plus a spec note.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-1 -->

<!-- vt.idd:fix-group:FG-2 -->
<!-- vt.idd:recommended-disposition:FG-2:Fix -->
**FG-2** — `specs/043-the_incredible_link_preview/{spec.md,plan.md,tasks.json,tasks.md}` · D1 · _Soft boundary (shares spec.md with FG-1, different sections)_

Text-only archive correction.

- [x] **Fix** *(recommended)*
- [ ] **Acknowledge**
- [ ] **Defer**
<!-- /vt.idd:fix-group:FG-2 -->


<!-- vt.idd:pr-review:approve -->
## Approve and Proceed

All findings reviewed? Check the box to authorize fix execution.

- [ ] **Approve and proceed** — I have reviewed all findings and dispositions above. Execute fixes per the checked dispositions.
<!-- /vt.idd:pr-review:approve -->
<!-- /vt.idd:pr-review:pass-1 -->

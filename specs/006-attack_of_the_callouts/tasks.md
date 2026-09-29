<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Parameter panels: callout help for every ⓘ + clearer shell panel layout

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-29T11:11:38-06:00

---

## Wave 0: Setup

**Purpose**: Green baseline on dev's tip

- [x] T001 [W0] Green baseline on dev's tip before any change: ng lint, ng build, ng test --watch=false --browsers=ChromeHeadless, pinned to 2 cores (taskset -c 0,1, NG_BUILD_MAX_WORKERS=2). Record the test count.

**Wave Gate**: passed

---

## Wave 1: Foundational: shared callout

**Purpose**: CalloutComponent ported from gato_magico, with its specs, declared in AppModule

- [x] T002 [W1] [TDD] [US1] Add src/app/callout/callout.component.{ts,html,css} ported from ../gato_magico/src/app/components/cue-overlay/ and declare CalloutComponent in src/app/app.module.ts (and in every TestBed that renders a host). Input active: {id,title,text,anchor} | null (one bubble on demand, not gato's fixed cue set) and recomputeKey. Position from the anchor's live getBoundingClientRect() via a pure placeBubble(rect, side): beside the anchor ('right') where there is room, else 'below'/'above' the row; clamp horizontally inside the viewport (8 px margin); render nothing when active is null or the anchor is absent. Layer pointer-events:none, role=region aria-live=polite; bubble role=note with the given id (for aria-controls), arrow toward the anchor; title + text via interpolation only. Styles read the --modal-* tokens (background, color, font, primary accent, radius, shadow); fade off under prefers-reduced-motion: reduce. position: fixed, mounted at the host component root (outside the 0.8-opacity panels). Write the specs first.
- [x] T003 [P] [W1] [TDD] [US1] src/app/callout/callout.component.spec.ts: nothing rendered for active=null; one bubble with title+text for an active callout; bubble id matches active.id; placeBubble for 'right'/'below'/'above' and null rect; absent anchor renders nothing; clamp keeps the bubble inside a narrow viewport; layer computes pointer-events:none; live region is polite; no animation under reduced motion (transition/animation none via a class or media check); recomputeKey change repositions.

**Wave Gate**: passed

---

## Wave 2: US1/US2/US6: initial-screen help

**Purpose**: Seven ⓘ → callout, close rules, a11y, 44 px hit area, modal-help removed, typo fixed

- [x] T004 [W2] [TDD] [US1] Initial screen, src/app/sandbox/sandbox.component.{ts,html}: the seven ⓘ handlers (A, α, β, a, b, θ, Resolución) toggle activeCallout (same key → null, other key → switch) instead of setting helpTitle/helpContent/helpOpen; a map key → {title, text from the existing LABEL_PARAM_*_HELP_* strings, anchor '#<id>-help-button'}. Mount one <app-callout> at the component root, outside #parameters-menu and #visualization-menu. Remove the modal-help <app-modal> and helpOpen/helpTitle/helpContent. Fix the typo in src/app/app-strings.ts LABEL_PARAM_QUAL_CONTENT: 'superfice' → 'superficie'. Specs first (T006).
- [x] T005 [W2] [TDD] [US2] Initial screen close rules and a11y: Esc (document keydown) clears activeCallout; canvasClickEvent, menuButtonClick/visualizationMenuButtonClick and hideMenu/hideVisualizationMenu clear it when the panel holding the active ⓘ closes; slider (change)/(ngModelChange) never touches it. Each ⓘ gets [attr.aria-expanded] and [attr.aria-controls] (the bubble id); clicking keeps focus on the ⓘ. src/app/sandbox/sandbox.component.css: .parameter-help-button hit area ≥ 44×44 px with the icon still 24 px (padding/box-sizing, not a bigger image).
- [x] T006 [P] [W2] [TDD] [US1] Rewrite src/app/sandbox/sandbox.component.spec.ts parameter help (the #31 block and the 'renders both through <app-modal>' check, now intro only): for each of the 7 ⓘ, click → callout with its own title and text (Resolución text has 'superficie'); modal-help absent from the DOM; second ⓘ replaces; same ⓘ closes; Esc, canvas mousedown and panel close all close; a slider change leaves it open; aria-expanded true/false and aria-controls = bubble id; no hover opening (mouseenter does nothing). Revert check: these specs fail on dev.

**Wave Gate**: passed

---

## Wave 3: US3: game-screen help

**Purpose**: Four ⓘ → callout, modal-help removed

- [x] T007 [W3] [TDD] [US3] Game screen, src/app/game/game.component.{ts,html}: the four ⓘ handlers (A, α, β, a) toggle activeCallout the same way; one <app-callout> at the component root, outside #parameters-menu; remove modal-help and helpOpen/helpTitle/helpContent; close on Esc, canvas mousedown and the menu hiding; aria-expanded/aria-controls on each ⓘ. src/app/game/game.component.css: ⓘ hit area ≥ 44×44 px. Keep the #31 Esc handling for the other pop-ups intact (they are <app-modal> and handle Esc themselves).
- [x] T008 [P] [W3] [TDD] [US3] Rewrite src/app/game/game.component.spec.ts parameter-help specs: each of the 4 ⓘ opens its callout with its own title and text; modal-help absent; replace / toggle-close / Esc / canvas close; slider change leaves it open; aria attributes; ¡Victoria!, how-to and Nuevo juego specs still pass unchanged. Revert check: these specs fail on dev.

**Wave Gate**: passed

---

## Wave 4: US4/US5: shell panel layout + Resolución

**Purpose**: Parameter names, 844×390 fit, Resolución label/slider

- [x] T009 [W4] [US4] Shell parameters panel names, src/app/sandbox/sandbox.component.{html,css}: each slider row shows the parameter name as text next to its icon (A, α, β, a, b, θ) in the panel's Lucida font; strings reuse the existing BUTTON_PARAM_*_TITLE values or new AppStrings constants (no other copy changes). Every control keeps its binding and still changes the shell. Spec: six rows each render their name.
- [x] T010 [W4] [US4] Landscape-phone fit, src/app/sandbox/sandbox.component.css: #parameters-menu gets max-height: calc(100vh - its top offset - margin) with overflow-y: auto (and/or tighter row height under a short-viewport media query) so every control is reachable at 844×390; portrait and desktop layout unchanged.
- [x] T011 [W4] [US5] 'Resolución' overlap, src/app/sandbox/sandbox.component.css: .parameter-label sizes to its text (width auto, flex-shrink 0, small right gap) and .slider takes the remaining width (flex: 1 instead of width: 96%) in the visualization panel's row, without changing the shell panel's icon rows. Spec: the label's right edge is ≤ the slider's left edge at 390 px and 1280 px host widths.
- [x] T012 [P] [W4] [US4] Layout specs in src/app/sandbox/sandbox.component.spec.ts for T009–T011 where a unit test can measure it (names present; Resolución label/slider don't overlap; panel scrolls when shorter than its content). Visual placement at the three sizes goes to T014's screenshots.

**Wave Gate**: passed

---

## Wave 5: Polish: verification and approval

**Purpose**: Full suite, dead-code grep, screenshots for the owner

- [x] T013 [W5] Verification: ng lint, ng build, full ng test green on 2 cores; grep shows no modal-help / helpOpen / helpTitle / helpContent left in src/app/{sandbox,game}; no new dependency in package.json; revert check recorded (new callout specs fail on dev).
- [ ] T014 [W5] [US6] Owner approval material: before/after screenshots of the shell parameters panel, the visualization panel and the game parameters menu, each with a callout open, at 390 px, 1280 px and 844×390; post on issue #6 for approval (SC-006). Only on the owner's go-ahead for live instances.

**Wave Gate**: pending

---

## Summary

- **Total Tasks**: 14
- **Completed**: 13
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 92%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Initial-screen control guide: a "?" button pointing a callout at every control

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-29T15:25:18-06:00

---

## Wave 0: Setup

**Purpose**: Baseline tests, lint and build on the branch

- [x] T001 [W0] Baseline on the branch: npm test (2 cores), ng lint and npm run build green on dev's code before any change; record the spec count.

**Wave Gate**: passed

---

## Wave 1: Foundational: guide mode

**Purpose**: layoutGuide() pure function and CalloutComponent guide mode

- [x] T002 [W1] [TDD] Add src/app/callout/layout-guide.ts: pure layoutGuide(anchors: Box[], bubbles: Size[], viewport: Size): GuidePlacement[] (GuidePlacement = CalloutPlacement + optional leader {x1,y1,x2,y2}). Per bubble: beside its anchor when it fits (reuse placeCallout's rules); where toolbar bubbles would collide, stack them in a staircase below the toolbar, rightmost anchor's bubble nearest, each with a leader line to its anchor centre that crosses no other bubble; never overlap, never leave the viewport (8 px margin), never cover its own anchor. Export placeCallout's Box/Size types from callout.component.ts. Write src/app/callout/layout-guide.spec.ts first (DOM-free): beside at 1280, staircase at 390/360, 844×390 fits without stacking past the screen, no pairwise overlap, lines cross no bubble, all inside the viewport.
- [x] T003 [W1] [TDD] CalloutComponent guide mode: new @Input() guide: Callout[] | null. Render each callout (role=note, own id) in the same .callout-layer (pointer-events:none, aria-live polite) in the given order, plus an aria-hidden leader-line element per staircase bubble; place all with layoutGuide on changes, resize and scroll. The single @Input() active path (#6) is unchanged. Styles: leader line 1 px var(--modal-primary), pointer-events none; reduced-motion rule covers guide bubbles. Specs first in callout.component.spec.ts: renders N bubbles with title/text, lines aria-hidden, pointer passes through, live region order, reduced motion, #6 single-callout specs untouched.

**Wave Gate**: passed

---

## Wave 2: US1: See what each control does

**Purpose**: ControlGuide, strings, the '?' button and the seven callouts

- [x] T004 [W2] [TDD] [US1] Add src/app/control-guide.ts: ControlGuide {on, callouts, readonly guideId, toggle(), close()} mirroring ParameterHelp; the seven callouts (gear, camera, gamepad, book, pencil, 3D view, ?) built from anchors and new app-strings GUIDE_*_TITLE/TEXT (draft text from #5) plus BUTTON_HELP_TITLE = 'Mostrar ayuda'. Each text is a title + one line ≤ ~45 chars. Unit specs first (toggle/close, seven callouts in on-screen order, text lengths).
- [x] T005 [W2] [TDD] [US1] Sandbox: add the '?' toolbar button after the book (inline SVG in the toolbar style: rect.svg-border + '?' path.svg-content, viewBox 0 0 67 67, same hover), id help-button, title/aria-label 'Mostrar ayuda', aria-pressed = guide.on, aria-controls = guide id. Give the toolbar buttons stable ids for anchors (parameters-button, save-image-button, game-button, intro-button; pencil is #visualization-button). A zero-size marker at the shell's screen centre anchors the 3D-view callout. Mount <app-callout [guide]>. Specs first: '?' shows seven callouts with their text; aria; 44 px hit area; 3D-view bubble points at the shell.

**Wave Gate**: passed

---

## Wave 3: US2: Turn the guide off

**Purpose**: Close rules and tap vs drag on the 3D view

- [x] T006 [W3] [TDD] [US2] Close rules in SandboxComponent: '?' again and Esc turn the guide off; turning it on closes both panels and any ⓘ callout; opening the parameters panel, the pencil panel, a parameter ⓘ or the welcome pop-up turns it off; camera save leaves it on. Specs first (assert the guide is on before each close).
- [x] T007 [W3] [TDD] [US2] Tap vs drag on the 3D view: replace the canvas (mousedown) with (pointerdown)/(pointerup); a press-release moving < ~10 px is a tap: closes the guide and keeps today's menu-closing behaviour; a larger move is a drag left to OrbitControls and keeps the guide on. Wheel zoom keeps the guide on. Specs first with synthetic pointer events (mouse and touch pointerType), and check menus still close on a plain click.

**Wave Gate**: passed

---

## Wave 4: US3: Keep using the controls

**Purpose**: Pass-through and the layout at four sizes

- [x] T008 [W4] [TDD] [US3] Controls work while the guide is on: specs that hit-test each toolbar control and the pencil through the callout layer and leader lines (elementFromPoint returns the control), clicking gear/pencil/book performs its action, camera export runs.
- [x] T009 [W4] [TDD] [US3] Layout at 360×800, 390×844, 1280×800 and 844×390 (Karma iframe resize): '?' visible and not overlapping another icon; every guide bubble on screen, no pairwise overlap, no leader line crossing a bubble, none covering its control; staircase at 390; resize re-places. Adjust sandbox/callout CSS as the specs demand.

**Wave Gate**: passed

---

## Wave 5: US4/US5: Reuse and accessibility

**Purpose**: #6 regression, reuse check, a11y

- [x] T010 [W5] [TDD] [US4] Reuse and regression: confirm the #6 parameter ⓘ specs on both screens pass unchanged; check that the game screen can mount <app-callout [guide]> with its own callouts with no copied code (a small spec with a host listing two anchors).
- [x] T011 [W5] [TDD] [US5] Accessibility pass: live region reads the guide in on-screen order, the '?' reports pressed/not pressed, leader lines aria-hidden, reduced motion shows no animation; ESLint clean.

**Wave Gate**: passed

---

## Wave 6: Polish

**Purpose**: Verification and screenshots for approval

- [ ] T012 [W6] Verification: full npm test ×3 on 2 cores, ng lint, tsc --noEmit (app + spec), npm run build; revert check that the new specs fail on dev; update the spec's Verification Matrix evidence.
- [ ] T013 [W6] Screenshots of the guide at 360, 390, 1280 and 844×390 posted on #5 for the owner's approval together with the guide's text (live instance only with the owner's go-ahead).

**Wave Gate**: pending

---

## Summary

- **Total Tasks**: 13
- **Completed**: 11
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 84%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

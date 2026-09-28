<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Shared pop-up component on <dialog>, styled after Pico.css

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-28T16:55:48-06:00

---

## Wave 0: Foundational: shared modal

**Purpose**: --modal-* tokens and ::backdrop, ModalComponent with its specs, declared in AppModule

- [x] T001 [W0] In src/styles.css add the --modal-* custom properties from Pico v2 (spacing 1rem, border radius 0.25rem, Pico v2 box shadow, width ~510px widening to ~700px on large screens and full width minus spacing on phones, overlay rgba(0,0,0,0.4), teal #77aca2 primary/outline/light divider tint, 150–200 ms animation duration) plus a dialog::backdrop rule that reads the overlay token (no backdrop-filter). Add a comment crediting Pico.css (MIT). Do not add any dependency.
- [x] T002 [W0] [TDD] [US1] Add src/app/modal/modal.component.{ts,html,css,spec.ts} and declare ModalComponent in src/app/app.module.ts. <dialog> with aria-labelledby=titleId, <article> with <header> (projected [modal-title] <h2> + ✕ button, aria-label AppStrings.LABEL_CLOSE), projected body, optional [modal-footer]. Inputs: open, titleId, initialFocus (default the ✕). Output: closed. Open calls showModal() only when !dialog.open, then focuses the initial-focus target; closing calls close(). Esc (cancel, preventDefault then close), a click whose target is the <dialog> itself, and the ✕ all go through one path that emits closed once. Styles read the --modal-* tokens: capped width, max-height within the viewport, body scrolls inside, footer buttons secondary before primary, fade/scale off under prefers-reduced-motion. Write the specs first: open/close via [open], Esc, backdrop click, ✕, closed emitted once, open-while-open no-op (no InvalidStateError), initial focus, aria-labelledby and the ✕ aria-label.

**Wave Gate**: passed

---

## Wave 1: US1/US2/US4: game pop-ups

**Purpose**: ¡Victoria!, Nuevo juego, how-to and parameter help on <app-modal>; onEscape, modalMouseDown and modal style.display removed

- [x] T003 [W1] [TDD] [US1] Update src/app/game/game.component.spec.ts first: declare ModalComponent in the TestBed; move the pop-up assertions from style.display to dialog.open; add specs for ¡Victoria! opening on a win and staying open with no error when checkGameIsOver() runs again, the how-to opening on load, Nuevo juego focusing its first choice button and 'Con clave' focusing the key input, each ⓘ opening help with its own title/text, Esc/backdrop/✕ closing each pop-up and resetting its open flag, <h2> titles referenced by aria-labelledby, and the .label-howto-line class still present.
- [x] T004 [W1] [US1] Move the game's 4 pop-ups to <app-modal> in src/app/game/game.component.{html,ts,css}. HTML: ¡Victoria! with a footer holding Jugar and Sandbox; Nuevo juego with the choices and key row in a <footer modal-footer> (as the issue specifies), initialFocus on the first choice button; how-to and help with no footer. Titles as <h2> with ids, text lines as <p> keeping their classes; copy unchanged; footer 'Cerrar' buttons removed. TS: a boolean per pop-up bound to [open] and reset in (closed); checkGameIsOver() sets the ¡Victoria! flag; ngOnInit opens the how-to and runs the load-time win check (setting a bound flag in ngAfterViewInit would change it after it was checked); delete onEscape/@HostListener('document:keydown.escape'), modalMouseDown and the pop-up @ViewChilds/style.display lines (keep keyEntryRow/gameKeyInput and the menu toggles). CSS: remove .modal, .modal-content, .modal-new-game-content, .modal-howto-content, .modal-help-content, .modal-close-button, .modal-title and both .modal-button-bar rules; keep content-only layout such as .new-game-choices and .key-entry-row.

**Wave Gate**: passed

---

## Wave 2: US1/US2/US4: initial-screen pop-ups

**Purpose**: Welcome and parameter help (incl. Resolución) on <app-modal>; modalMouseDown and modal style.display removed

- [x] T005 [W2] [TDD] [US2] Update src/app/sandbox/sandbox.component.spec.ts (and src/app/app.component.spec.ts if its TestBed renders the screens) first: declare ModalComponent; move the pop-up assertions from style.display to dialog.open; add specs for the welcome pop-up opening on load, each ⓘ (including Resolución) opening help with its own title/text, Esc/backdrop/✕ closing and resetting the open flag, <h2> titles referenced by aria-labelledby, and the .label-intro-line class and #img-intro-equation still present.
- [x] T006 [W2] [US2] Move the initial screen's welcome and parameter-help pop-ups to <app-modal> in src/app/sandbox/sandbox.component.{html,ts,css}: no footers, titles as <h2> with ids, text lines as <p> keeping their classes, the empty <img id="img-intro-equation"> kept, copy unchanged. TS: a boolean per pop-up bound to [open] and reset in (closed); ngOnInit opens the welcome; delete modalMouseDown and the pop-up @ViewChilds/style.display lines (keep the menu and visualizationMenu toggles). CSS: remove .modal, .modal-intro-content, .modal-help-content, .modal-close-button and .modal-button-bar.

**Wave Gate**: passed

---

## Wave 3: Polish: verification

**Purpose**: Lint, test, build on 2 cores; leftover-code checks

- [x] T007 [W3] Verification on 2 cores (taskset -c 0,1, NG_BUILD_MAX_WORKERS=2): ng lint, ng test --watch=false --browsers=ChromeHeadless, ng build. Grep src/ to confirm no .modal*-content class, no modalMouseDown, no onEscape/keydown.escape listener, and no style.display on a pop-up (only the side menus and keyEntryRow keep it). Confirm package.json has no new dependency and the pop-up copy in app-strings.ts is unchanged against dev.

**Wave Gate**: passed

---

## Summary

- **Total Tasks**: 7
- **Completed**: 7
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 100%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

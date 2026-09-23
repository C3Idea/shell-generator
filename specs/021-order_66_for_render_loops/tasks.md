<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: 3D render loops never stop

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-23T00:39:51-06:00

---

## Wave 0: Foundational: ShellViewer can stop

**Purpose**: Frame id, dispose(), resetCamera() in ShellViewer

- [x] T001 [W0] [TDD] ShellViewer lifecycle (FR-001..FR-004): store the requestAnimationFrame id in startRenderingLoop(); add dispose() — cancelAnimationFrame(id), dispose OrbitControls, graph geometry/materials and WebGLRenderer, then renderer.forceContextLoss(); idempotent and safe before init(); add public resetCamera() returning to the default view. RED first in src/app/shell-viewer.spec.ts with a manual rAF pump: after dispose() 0 further frames scheduled/rendered and cancelAnimationFrame got the id; dispose() before init() and twice don't throw; resetCamera() restores the default camera position.

**Wave Gate**: passed

---

## Wave 1: US1: New Game stays responsive

**Purpose**: newGame() reuses the two viewers and resets their cameras

- [x] T002 [W1] [TDD] [US1] New Game reuses viewers (FR-005; VM-001, VM-002, VM-003): newGame() stops calling setupShellViewers(); it rebuilds the graphs on the existing viewer/targetViewer and calls resetCamera() on both. RED first in src/app/game/game.component.spec.ts: after N New Games the component still holds the same 2 ShellViewer instances, only 2 viewers render per pumped frame, and both cameras are at the default view.

**Wave Gate**: passed

---

## Wave 2: US2: Leaving a screen releases its resources

**Purpose**: ngOnDestroy in GameComponent and SandboxComponent

- [x] T003 [P] [W2] [TDD] [US2] GameComponent implements OnDestroy (FR-006; VM-004): ngOnDestroy() disposes viewer and targetViewer, tolerating viewers that were never created (component never rendered, as in the #12 specs). RED first in game.component.spec.ts: destroying a rendered GameComponent leaves 0 frames rendered by its viewers; destroying one that never rendered doesn't throw.
- [x] T004 [P] [W2] [TDD] [US2] SandboxComponent implements OnDestroy (FR-007; VM-004): ngOnDestroy() disposes helper, tolerating a helper that was never init()ed. RED first in src/app/sandbox/sandbox.component.spec.ts: destroying a rendered SandboxComponent stops its viewer (0 further frames); destroying one that never rendered doesn't throw.

**Wave Gate**: passed

---

## Wave 3: US3: Unit suite stable and idle-clean

**Purpose**: Remove the #18 M1 stubs; suite green without them

- [x] T005 [W3] [US3] Remove the #18 M1 requestAnimationFrame stubs from game.component.spec.ts and sandbox.component.spec.ts and their #21 comment (FR-008; VM-006). Fixture teardown via ngOnDestroy now stops the loops. npm test green (headless, exits on its own); ng lint shows no new problems vs dev.

**Wave Gate**: passed

---

## Wave 4: Polish: verify acceptance criteria

**Purpose**: Harness measurements, revert check, build

- [x] T006 [W4] Verify the #21 acceptance criteria with the out-of-repo harness (2 cores): draw calls per frame stay at 4 after N New Games (VM-001); game <-> sandbox x20 logs no 'Too many active WebGL contexts' (VM-005); destroyed components render 0 frames (VM-004); npm run test:watch re-runs with 0 disconnects and CPU returns to idle (VM-007); new specs fail on dev's code and pass on the branch; ng build succeeds (FR-009).

**Wave Gate**: passed

---

## Summary

- **Total Tasks**: 6
- **Completed**: 6
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 100%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._

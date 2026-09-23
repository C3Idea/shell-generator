<!-- vt.idd:spec -->
## Specification

## Problem

The unit test suite never runs, so nothing in the repo guards against regressions. #12 had to be validated entirely with manual passes and an out-of-repo browser harness, and nothing stops that bug from coming back.

- `src/test.ts` discovers specs with webpack's `require.context`, unsupported by the Angular 17 builder: the suite fails before any spec loads (`TypeError: __webpack_require__(...).context is not a function`, `Executed 0 of 0 ERROR`). This is true on `dev` and every branch.
- `npm test` (`ng test`) runs in watch mode (`singleRun: false`) with a non-headless `Chrome` in `karma.conf.js`, so it never exits and opens a browser window. Anything that calls `npm test` — including the VT wave checkpoints — hangs.
- The existing specs have never run under this setup, and two are stale.

## Expected Behavior

- `npm test` runs once, headless, exits on its own, returns 0 on the branch, and reports more than 0 executed specs, all passing, with no "has no expectations" warnings.
- `npm run test:watch` starts Karma in watch mode for local development, and the README documents both commands.
- Regression specs cover #12's `GameComponent` link logic and fail if the #16 fix is reverted.
- `ng lint` gains no new problems from the new or changed spec files.

## Reproduction / Context

`ng test` on any branch → `require.context is not a function`, `Executed 0 of 0 ERROR`. Bare `npm test` never exits (watch mode).

Files in play: `src/test.ts` (deleted), `angular.json` (`test` target: drop `main`, set `polyfills`), `tsconfig.spec.json` (drop `src/test.ts` from `files`), `package.json` (`test`, `test:watch` scripts), `README.md` (unit-tests section), the six existing specs under `src/app/**`, and a new `game.component.spec.ts` block for #12.

Probe on a throwaway copy of `origin/dev` (not committed): after the discovery fix the builder finds the specs and **10 of 10 execute**, 8 pass. The 2 failures are stale specs — `GameComponent` (`No provider for ActivatedRoute`) and `SandboxComponent` (`Can't bind to 'ngModel'`); adding `FormsModule` + a router to both makes **10 of 10 pass**, three.js/WebGL working in ChromeHeadless. `AppComponent should render title` has no expectations.

## Proposed Fix

1. **Spec discovery on Angular 17**: delete `src/test.ts`; remove `main` from the `test` target; set its `polyfills` to `["zone.js", "zone.js/testing"]`; drop `src/test.ts` from `tsconfig.spec.json` `files`.
2. **Commands**: `npm test` → `ng test --watch=false --browsers=ChromeHeadless`; add `npm run test:watch` → `ng test`; update the README's "Running unit tests" section.
3. **Fix the stale specs**: `game.component.spec.ts` gets `FormsModule` + a router; `sandbox.component.spec.ts` gets `FormsModule`; `AppComponent should render title` gets a real assertion or is deleted.
4. **#12 regression specs** in `GameComponent`, testing through the component (fake `ActivatedRoute` snapshot carrying `?target`, assert on public `parameters`/`targetParameters`, bracket-access private helpers, stub `Math.random` with `spyOn`; no render, no WebGL; no production code changes):
   - decoding clamps every value to its slider range (incl. `Infinity` and negatives), pins `d` to 1, and ignores wrong-count / non-number links (no-link game);
   - a link game never starts won, incl. when every roll lands on the target (fallback to the farther slider end);
   - a game without a link starts at the slider minimums;
   - `getShareableGameLink()` encodes the player's current shell to 2 decimals, not the target.

**Out of scope**: CI setup, incl. `.gitlab-ci.yml` (#19); e2e browser tests; coverage reports/thresholds; container Chrome flags (`--no-sandbox`); changing Karma's watch browsers.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Regression specs pass whether or not the #12 fix is present (don't actually guard it) | High | Acceptance requires them to fail on a temporary `git revert -m 1 6fb91ce` and pass without it. |
| Making `npm test` single-run breaks a workflow that expects watch mode | Low | `npm run test:watch` preserves watch mode; the README documents both; the probe shows the single run exits 0. |
| WebGL/three.js unavailable in the CI-style headless browser, breaking component-render specs | Low | Probe confirms `GameComponent`/`SandboxComponent` render in ChromeHeadless; the #12 specs avoid render entirely. |
| `Math.random` can't be stubbed for `random()` imported from `src/util`, so the fallback path can't be forced | Medium | `random()` calls the global `Math.random`; `spyOn(Math,'random')` controls it. Verified reasoning against `src/util.ts`. |
| Fixed specs are shallow (only "should create"), giving false confidence | Low | In scope only to get them green; deeper coverage is future work, not this bug. |

## Verification Matrix

| ID | Scenario (Given/When/Then) | Evidence | Status |
|----|----------------------------|----------|--------|
| VM-001 | Given the branch, When `npm test` runs, Then it executes headless, exits on its own, returns 0, and reports >0 specs all passing with no "no expectations" warnings. | [pending] | Pending |
| VM-002 | Given local development, When `npm run test:watch` runs, Then Karma starts in watch mode; the README documents both commands. | [pending] | Pending |
| VM-003 | Given a `?target` link decoded in a spec, When values are out of range / `Infinity` / `d=-1` / malformed, Then they clamp to slider ranges, `d` pins to 1, and malformed links yield a no-link game. | [pending] | Pending |
| VM-004 | Given a link game in a spec (incl. `Math.random` forced onto the target), When it starts, Then it is never already won and the fallback moves each slider to the farther end. | [pending] | Pending |
| VM-005 | Given no link, When the game starts in a spec, Then A/α/β/a are at their minimums; and `getShareableGameLink()` encodes the player's current shell to 2 decimals. | [pending] | Pending |
| VM-006 | Given the #16 fix reverted (`git revert -m 1 6fb91ce`), When `npm test` runs, Then the #12 regression specs fail; with the fix present they pass. | [pending] | Pending |
| VM-007 | Given the branch, When `ng lint` runs, Then it reports no new problems from the new or changed spec files vs `dev`. | [pending] | Pending |

## Success Criteria

| ID | Criterion | Evidence | Status |
|----|-----------|----------|--------|
| SC-001 | A committed `npm test` command runs the unit suite headless and exits on its own, green, on the branch. | [pending] | Pending |
| SC-002 | The suite executes every existing spec (none skipped by broken discovery) and all pass. | [pending] | Pending |
| SC-003 | The #12 fix is protected by specs that fail when it is reverted. | [pending] | Pending |

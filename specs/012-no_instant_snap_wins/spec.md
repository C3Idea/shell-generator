<!-- vt.idd:spec -->
## Specification

## Problem

Opening a shared challenge link can start the game **already won** — the success pop-up shows immediately. This always happens when the sharer creates the link without moving the A, α, β or a sliders, and more generally whenever the shared A/α/β/a values fall within the win margins of the slider minimums.

The share link is a **challenge**: it encodes the sharer's current shell (`this.parameters`) as the target for the recipient to recreate. That behavior is correct and stays. The bug is entirely on the recipient's side.

## Expected Behavior

- Opening a link shared without moving any sliders starts an **unsolved** game.
- The recipient's target is the sharer's current shell, to 2 decimal places (unchanged).
- A link with out-of-range values (hand-edited) opens a **playable, winnable** game with the values clamped to the slider ranges.
- After pressing **New Game**, reloading the page does not bring the shared challenge back.
- Games opened **without** a link keep today's behavior: sliders start at their minimums.

## Reproduction / Context

Steps (always reproduces):
1. Open `/#/game` and don't move the A, α, β or a sliders.
2. Press the share-link button and open the resulting link.
3. The game starts won.

Root cause (`src/app/game/game.component.ts`):
- `checkParametersAreSimilar()` compares A, α, β, a, b, θ against per-key thresholds.
- `setupGame()` copies μ, φ, ω, **b and θ** from the target into the player's shell, so those always match.
- The recipient's player shell starts from `new ShellParameters()`, which sets A/α/β/a to their minimums (A=5, α=80, β=0, a=1).
- A sharer who didn't move those sliders shares exactly those minimums as the target, so the recipient starts on the target and `checkGameIsOver()` (called in `ngAfterViewInit`) reports a win.

Relevant methods: `constructor`, `setupGame()`, `newGame()`, `decodeTargetParameters()`, `targetParametersFromRoute()`, `getShareableGameLink()` (unchanged). Slider ranges and win thresholds live in `ShellParameters` (static `*Min`/`*Max`) and `checkParametersAreSimilar()` respectively.

## Proposed Fix

Three changes, all in `game.component.ts` (no changes to `getShareableGameLink()`):

1. **Random start for link games.** When the game opens from a `?target=` link, initialize the recipient's A, α, β, a at random values within the slider ranges (using the existing `randomWithGenerator`/`Math.random` helper). Re-roll if the start already satisfies `checkParametersAreSimilar()`. Cap the attempts; if they run out, fall back to placing each of A/α/β/a at whichever slider end is farther from the target, so the loop always terminates. Continue copying μ, φ, ω, b, θ from the target as `setupGame()` does today. Non-link games keep sliders at their minimums.

2. **Clamp link values.** In `decodeTargetParameters()`, clamp each decoded value to its `ShellParameters` min/max. `d` (coiling direction) has no slider and is always 1 in the game, so it's pinned to 1: an edited link with `d=-1` would otherwise mirror the target, which no slider can reproduce, while the win check (which ignores `d`) still accepts it. Malformed links (wrong count or non-numbers) keep today's behavior: ignored, and a random (non-link) game starts.

3. **Clear `?target` on New Game.** In `newGame()` (or its caller), remove `?target=…` from the URL so a reload doesn't restore the shared challenge.

## Out of Scope

- Random (non-link) games that happen to start won (~1 in 1,900).
- Sharing the game key ("Clave de juego") instead of raw values.
- Unit tests (verification is manual, by user choice).

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Random-start re-roll loop fails to terminate | Medium | Hard attempt cap with a deterministic "farther slider end" fallback; loop provably ends. |
| Clamping changes the intended target for valid in-range links | Low | Clamp is a no-op for in-range values; only hand-edited out-of-range links are affected. |
| Farther-end fallback still lands within a win margin on a pathological target | Low | Fallback only triggers after the capped random re-rolls; worst case is a near-solved start, not a false win pop-up, since the fallback maximizes distance per key. |
| `New Game` URL cleanup breaks Angular routing state | Low | Use the existing `Router`/`ActivatedRoute` (already injected) to drop only the `target` query param; hash-routing path is preserved. |

## Verification Matrix

| ID | Scenario (Given/When/Then) | Evidence | Status |
|----|----------------------------|----------|--------|
| VM-001 | Given a link shared without moving sliders, When the recipient opens it, Then the game starts unsolved (no win pop-up). | [pending] | Pending |
| VM-002 | Given any valid link, When opened, Then the target equals the sharer's shell to 2 decimals. | [pending] | Pending |
| VM-003 | Given a hand-edited out-of-range link, When opened, Then values are clamped and the game is winnable. | [pending] | Pending |
| VM-004 | Given a game opened from a link, When New Game is pressed and the page reloaded, Then the shared challenge does not return. | [pending] | Pending |
| VM-005 | Given no link, When the game opens, Then A/α/β/a start at their minimums. | [pending] | Pending |

## Success Criteria

| ID | Criterion | Evidence | Status |
|----|-----------|----------|--------|
| SC-001 | No shared link opens the game in a won state. | [pending] | Pending |
| SC-002 | Every shared link yields a solvable game whose target matches the sharer's shell. | [pending] | Pending |
| SC-003 | New Game durably clears the shared challenge from the URL. | [pending] | Pending |


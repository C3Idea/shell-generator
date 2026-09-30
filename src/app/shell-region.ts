// The pieces both screens' guides share (#5; moved here by #35 so the game
// uses the same code): telling a tap on the 3D view from a drag or a pinch,
// and keeping #shell-region over the drawn shell so the 3D view's bubble
// points at it.

// How far a press may move and still count as a tap on the 3D view.
export const TAP_SLOP = 10;

// How much of the shell's box #shell-region covers, around its middle, so
// the 3D view's arrow lands on the shell rather than a corner of its box.
export const SHELL_REGION_SCALE = 0.7;

// The parts of a PointerEvent a tap depends on.
export type TapPointer = Pick<PointerEvent, 'pointerId' | 'clientX' | 'clientY' | 'isPrimary' | 'button'>;

// A tap on the 3D view ends the guide; a drag (rotate) or a pinch (zoom)
// doesn't, so the user can try what its bubble says. A tap is one pointer,
// the primary button, released within TAP_SLOP px of where it went down;
// the right and middle buttons pan. A primary pointer going down starts a
// new gesture, so a press whose pointerup was lost can't leave a stale
// "pinch" behind.
export class CanvasTap {
  private presses = new Map<number, { x: number; y: number }>();
  private pinching = false;

  down(event: TapPointer): void {
    if (event.isPrimary) {
      this.presses.clear();
      this.pinching = false;
    }
    this.presses.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.presses.size > 1) {
      this.pinching = true;
    }
  }

  // Whether this pointerup ends a tap.
  up(event: TapPointer): boolean {
    const start = this.presses.get(event.pointerId);
    const tap = start !== undefined && !this.pinching && event.button === 0
      && Math.hypot(event.clientX - start.x, event.clientY - start.y) < TAP_SLOP;
    this.cancel(event);
    return tap;
  }

  cancel(event: TapPointer): void {
    this.presses.delete(event.pointerId);
    if (this.presses.size === 0) {
      this.pinching = false;
    }
  }
}

// Moves `region` over the shell's screen box (ShellViewer.shellScreenBox()),
// shrunk towards its middle. Returns whether it moved: false when the shell
// isn't on screen, which leaves the region where it was.
export function followShell(
  region: HTMLElement,
  box: { left: number; top: number; width: number; height: number } | null,
): boolean {
  if (!box) {
    return false;
  }
  const inset = (1 - SHELL_REGION_SCALE) / 2;
  region.style.left = `${box.left + box.width * inset}px`;
  region.style.top = `${box.top + box.height * inset}px`;
  region.style.width = `${box.width * SHELL_REGION_SCALE}px`;
  region.style.height = `${box.height * SHELL_REGION_SCALE}px`;
  return true;
}

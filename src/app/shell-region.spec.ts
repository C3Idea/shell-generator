import { CanvasTap, followShell, SHELL_REGION_SCALE, TAP_SLOP, TapPointer } from './shell-region';

// The pieces both screens' guides share (#5, moved here by #35): telling a
// tap on the 3D view from a drag or a pinch, and keeping #shell-region over
// the drawn shell.
describe('CanvasTap (#35)', () => {
  let tap: CanvasTap;
  const pointer = (id: number, x: number, y: number, extra: Partial<TapPointer> = {}): TapPointer =>
    ({ pointerId: id, clientX: x, clientY: y, isPrimary: id === 1, button: 0, ...extra });

  beforeEach(() => {
    tap = new CanvasTap();
  });

  it('counts a press released within TAP_SLOP px as a tap', () => {
    tap.down(pointer(1, 100, 100));
    expect(tap.up(pointer(1, 100 + TAP_SLOP - 1, 100))).toBeTrue();
  });

  it('counts a press that moved TAP_SLOP px or more as a drag', () => {
    tap.down(pointer(1, 100, 100));
    expect(tap.up(pointer(1, 100, 100 + TAP_SLOP))).toBeFalse();
  });

  it('never counts a pinch as a tap, even when both fingers barely move', () => {
    tap.down(pointer(1, 100, 100));
    tap.down(pointer(2, 200, 200));
    expect(tap.up(pointer(2, 200, 200))).toBeFalse();
    expect(tap.up(pointer(1, 100, 100))).toBeFalse();
  });

  it('only the primary button taps; the right and middle buttons pan', () => {
    tap.down(pointer(1, 100, 100, { button: 2 }));
    expect(tap.up(pointer(1, 100, 100, { button: 2 }))).toBeFalse();
    tap.down(pointer(1, 100, 100, { button: 1 }));
    expect(tap.up(pointer(1, 100, 100, { button: 1 }))).toBeFalse();
  });

  it('a primary pointer going down starts a new gesture, so a lost pointerup leaves no stale pinch', () => {
    tap.down(pointer(1, 100, 100));
    tap.down(pointer(2, 200, 200));
    // Both pointerups lost; a new single press must still tap.
    tap.down(pointer(3, 50, 50, { isPrimary: true }));
    expect(tap.up(pointer(3, 50, 50))).toBeTrue();
  });

  it('a cancelled press is not a tap', () => {
    tap.down(pointer(1, 100, 100));
    tap.cancel(pointer(1, 100, 100));
    expect(tap.up(pointer(1, 100, 100))).toBeFalse();
  });

  it('a pointerup with no press is not a tap', () => {
    expect(tap.up(pointer(1, 100, 100))).toBeFalse();
  });
});

describe('followShell (#35)', () => {
  let region: HTMLElement;

  beforeEach(() => {
    region = document.createElement('div');
  });

  it(`covers the middle ${SHELL_REGION_SCALE * 100} % of the shell's box`, () => {
    expect(followShell(region, { left: 100, top: 200, width: 400, height: 200 })).toBeTrue();
    const inset = (1 - SHELL_REGION_SCALE) / 2;
    expect(parseFloat(region.style.left)).toBeCloseTo(100 + 400 * inset, 5);
    expect(parseFloat(region.style.top)).toBeCloseTo(200 + 200 * inset, 5);
    expect(parseFloat(region.style.width)).toBeCloseTo(400 * SHELL_REGION_SCALE, 5);
    expect(parseFloat(region.style.height)).toBeCloseTo(200 * SHELL_REGION_SCALE, 5);
  });

  it('leaves the region where it was when there is no shell on screen', () => {
    region.style.left = '7px';
    expect(followShell(region, null)).toBeFalse();
    expect(region.style.left).toBe('7px');
  });
});

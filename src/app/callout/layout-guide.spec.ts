import { Box, box, overlaps, Size } from './geometry';
import { GuideItem, GuidePlacement, layoutGuide, lineBox, Measure } from './layout-guide';

// The guide's layout (#5), without a DOM. The anchors copy the initial
// screen: five 64 px toolbar buttons in a row at the top left (gear, camera,
// gamepad, book, "?"), the pencil at the bottom left, and the 3D view as the
// region where the shell is drawn.

// Stands in for the shell: the middle of the screen, half its shorter side across.
function centralRegion(area: Box): Box {
  const side = Math.min(area.width, area.height) / 2;
  return box(area.left + (area.width - side) / 2, area.top + (area.height - side) / 2, side, side);
}

// The icons are 64 px, 56 px under 356 px wide; the toolbar (gear, camera,
// gamepad, book) is at the top left and the "?" alone in the top-right corner.
function initialScreen(viewport: Size): GuideItem[] {
  const icon = viewport.width < 356 ? 56 : 64;
  const toolbar = [0, 1, 2, 3].map(i => ({ anchor: box(7 + (icon + 4) * i, 7, icon, icon) }));
  const help = { anchor: box(viewport.width - 7 - icon, 7, icon, icon) };
  const pencil = { anchor: box(7, viewport.height - 7 - icon, icon, icon) };
  const view = { anchor: centralRegion(box(0, 0, viewport.width, viewport.height)), region: true };
  return [...toolbar, help, pencil, view];
}

// A stand-in for the browser: each bubble holds `chars` characters at
// `perChar` px each (7 by default), wrapped to the width it is given, below
// a title line; `line` px a line (17.5 by default) plus `padding` px of
// padding and border (14).
function fakeMeasure(chars: number[], perChar = 7, line = 17.5, padding = 14): Measure {
  return (index, maxWidth) => {
    const natural = chars[index] * perChar;
    const width = Math.min(natural, maxWidth);
    const lines = Math.ceil(natural / width);
    return { width, height: padding + line * (1 + lines) };
  };
}

// The guide's draft text lengths: gear, camera, gamepad, book, "?", pencil, 3D view.
const TEXT = fakeMeasure([28, 29, 36, 36, 26, 32, 51]);

const PHONE = { width: 390, height: 844 };
const SMALL_PHONE = { width: 360, height: 800 };
const DESKTOP = { width: 1280, height: 800 };
const LANDSCAPE = { width: 844, height: 390 };
// The owner's DevTools size: under 356 px wide, so 56 px icons.
const NARROW = { width: 338, height: 643 };
const SHORT = { width: 360, height: 640 };
const SIZES = [NARROW, SHORT, SMALL_PHONE, PHONE, DESKTOP, LANDSCAPE];

function rect(p: GuidePlacement, index: number, measure: Measure): Box {
  const size = measure(index, p.maxWidth);
  return box(p.left, p.top, size.width, size.height);
}



// The point of the arrow: 9 px out from the bubble's edge, at --callout-arrow.
function arrowTip(p: GuidePlacement, r: Box): { x: number; y: number } {
  switch (p.side) {
    case 'right': return { x: r.left - 9, y: r.top + p.arrow };
    case 'left': return { x: r.right + 9, y: r.top + p.arrow };
    case 'below': return { x: r.left + p.arrow, y: r.top - 9 };
    case 'above': return { x: r.left + p.arrow, y: r.bottom + 9 };
  }
}

const inside = (pt: { x: number; y: number }, b: Box) =>
  pt.x >= b.left && pt.x <= b.right && pt.y >= b.top && pt.y <= b.bottom;

describe('layoutGuide (#5)', () => {
  for (const viewport of SIZES) {
    describe(`at ${viewport.width}×${viewport.height}`, () => {
      const items = initialScreen(viewport);
      const placements = layoutGuide(items, TEXT, viewport);
      const rects = placements.map((p, i) => rect(p, i, TEXT));

      it('places one bubble per item', () => {
        expect(placements.length).toBe(items.length);
      });

      it('keeps every bubble inside the screen, 8 px from its edges', () => {
        expect(placements.length).withContext('one placement per item').toBe(items.length);
        rects.forEach((r, i) => {
          expect(r.left).withContext(`bubble ${i} left`).toBeGreaterThanOrEqual(8);
          expect(r.top).withContext(`bubble ${i} top`).toBeGreaterThanOrEqual(8);
          expect(r.right).withContext(`bubble ${i} right`).toBeLessThanOrEqual(viewport.width - 8);
          expect(r.bottom).withContext(`bubble ${i} bottom`).toBeLessThanOrEqual(viewport.height - 8);
        });
      });

      it('never lets two bubbles overlap', () => {
        expect(placements.length).withContext('one placement per item').toBe(items.length);
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            expect(overlaps(rects[i], rects[j])).withContext(`bubbles ${i} and ${j}`).toBeFalse();
          }
        }
      });

      it('never covers a control (the 3D view excepted: the bubbles sit over it)', () => {
        expect(placements.length).withContext('one placement per item').toBe(items.length);
        rects.forEach((r, i) => {
          items.forEach((item, j) => {
            if (!item.region) {
              expect(overlaps(r, item.anchor)).withContext(`bubble ${i} over control ${j}`).toBeFalse();
            }
          });
        });
      });

      it("never draws a leader line across another bubble", () => {
        expect(placements.length).withContext('one placement per item').toBe(items.length);
        placements.forEach((p, i) => {
          if (p.leader) {
            rects.forEach((r, j) => {
              if (j !== i) {
                expect(overlaps(lineBox(p.leader!), r)).withContext(`line ${i} across bubble ${j}`).toBeFalse();
              }
            });
          }
        });
      });

      it('points every bubble at its control: the arrow, or its leader line, reaches it', () => {
        expect(placements.length).withContext('one placement per item').toBe(items.length);
        placements.forEach((p, i) => {
          const anchor = items[i].anchor;
          const tip = arrowTip(p, rects[i]);
          if (p.leader) {
            // The line runs from the control's edge to the arrow's point.
            expect(inside({ x: p.leader.x1, y: p.leader.y1 }, anchor)).withContext(`line ${i} start`).toBeTrue();
            expect(p.leader.x2).withContext(`line ${i} end x`).toBeCloseTo(tip.x, 0);
            expect(p.leader.y2).withContext(`line ${i} end y`).toBeCloseTo(tip.y, 0);
          } else if (items[i].region) {
            expect(inside(tip, anchor)).withContext(`arrow ${i} on the shell`).toBeTrue();
          } else {
            // Beside the control: the arrow's point is within 2 px of its edge.
            const grown = box(anchor.left - 2, anchor.top - 2, anchor.width + 4, anchor.height + 4);
            expect(inside(tip, grown)).withContext(`arrow ${i} at its control`).toBeTrue();
          }
        });
      });
    });
  }

  it('on a phone, stacks the top row\'s bubbles in a staircase, the corner "?" included: the rightmost icon nearest the top', () => {
    const items = initialScreen(PHONE);
    const placements = layoutGuide(items, TEXT, PHONE);
    const toolbar = placements.slice(0, 5);
    toolbar.forEach((p, i) => {
      expect(p.side).withContext(`bubble ${i}`).toBe('below');
      expect(p.leader).withContext(`bubble ${i} line`).toBeDefined();
      expect(p.leader!.x1).withContext(`bubble ${i} line x`).toBe(items[i].anchor.left + items[i].anchor.width / 2);
    });
    for (let i = 0; i < 4; i++) {
      expect(toolbar[i].top).withContext(`bubble ${i} below bubble ${i + 1}`).toBeGreaterThan(toolbar[i + 1].top);
    }
  });

  it('on a wide screen, keeps the corner "?"\'s bubble under it and the book\'s up top: a bubble drops only below what is in its way', () => {
    const items = initialScreen(DESKTOP);
    const placements = layoutGuide(items, TEXT, DESKTOP);
    const help = placements[4];
    expect(help.side).toBe('below');
    expect(help.top).toBe(items[4].anchor.bottom + 10);
    expect(help.left + TEXT(4, help.maxWidth).width).toBeLessThanOrEqual(DESKTOP.width - 8);
    // The book's bubble is far from the "?"'s, so it isn't pushed down.
    expect(placements[3].top).toBe(items[3].anchor.bottom + 10);
  });

  it('counts controls level with each other as one row, however far apart', () => {
    const viewport = DESKTOP;
    const row = [box(7, 7, 64, 64), box(75, 7, 64, 64), box(1209, 7, 64, 64)].map(anchor => ({ anchor }));
    const placements = layoutGuide(row, fakeMeasure([30, 30, 30]), viewport);
    placements.forEach((p, i) => expect(p.leader).withContext(`bubble ${i} in the staircase`).toBeDefined());
  });

  it('puts a lone control\'s bubble beside it, as the parameter help does', () => {
    const placements = layoutGuide(initialScreen(PHONE), TEXT, PHONE);
    expect(placements[5].side).toBe('right');
    expect(placements[5].leader).toBeUndefined();
  });

  it('stacks a row at the bottom of the screen upward', () => {
    const viewport = PHONE;
    const row = [0, 1, 2].map(i => ({ anchor: box(7 + 68 * i, viewport.height - 71, 64, 64) }));
    const measure = fakeMeasure([40, 40, 40]);
    const placements = layoutGuide(row, measure, viewport);
    expect(placements.length).toBe(3);
    placements.forEach((p, i) => {
      expect(p.side).withContext(`bubble ${i}`).toBe('above');
      expect(rect(p, i, measure).bottom).withContext(`bubble ${i}`).toBeLessThan(viewport.height - 71);
    });
  });

  it('reaches the shell with a line when nothing fits beside it', () => {
    // A row whose staircase covers the shell region, and a control right
    // under the region: no side is free, so the bubble sits further out and
    // a line joins it to the shell through a gap.
    const viewport = { width: 400, height: 400 };
    const shell = box(100, 60, 200, 100);
    const items: GuideItem[] = [
      { anchor: box(10, 10, 40, 40) },
      { anchor: box(60, 10, 40, 40) },
      { anchor: box(170, 168, 60, 60) },
      { anchor: shell, region: true },
    ];
    const measure: Measure = (index, maxWidth) => {
      const natural = [300, 300, 150, 150][index];
      return { width: Math.min(natural, maxWidth), height: 40 };
    };
    const placements = layoutGuide(items, measure, viewport);
    const rects = placements.map((p, i) => rect(p, i, measure));
    const view = placements[3];
    expect(view.leader).withContext('joined by a line').toBeDefined();
    const line = view.leader!;
    expect(inside({ x: line.x1, y: line.y1 }, shell)).withContext('line starts on the shell').toBeTrue();
    const tip = arrowTip(view, rects[3]);
    expect(line.x2).toBeCloseTo(tip.x, 0);
    expect(line.y2).toBeCloseTo(tip.y, 0);
    rects.forEach((r, i) => {
      if (i !== 3) {
        expect(overlaps(r, rects[3])).withContext(`bubble ${i}`).toBeFalse();
        expect(overlaps(lineBox(line), r)).withContext(`line across bubble ${i}`).toBeFalse();
      }
    });
    items.forEach((item, i) => {
      if (!item.region) {
        expect(overlaps(lineBox(line), item.anchor)).withContext(`line across control ${i}`).toBeFalse();
        expect(overlaps(rects[3], item.anchor)).withContext(`bubble over control ${i}`).toBeFalse();
      }
    });
  });

  it('gives the same result whether the 3D view is listed before or after the pencil', () => {
    for (const viewport of SIZES) {
      const items = initialScreen(viewport);
      const swapped = [...items.slice(0, 5), items[6], items[5]];
      const measure: Measure = (index, maxWidth) => TEXT(index === 5 ? 6 : index === 6 ? 5 : index, maxWidth);
      const a = layoutGuide(items, TEXT, viewport);
      const b = layoutGuide(swapped, measure, viewport);
      expect([b[0], b[1], b[2], b[3], b[4], b[6], b[5]])
        .withContext(`${viewport.width}×${viewport.height}`).toEqual(a);
    }
  });
});

// The game screen (#35): the toolbar (gear, camera, home, book) at the top
// left and the "?" in the top-right corner, as on the initial screen; at the
// bottom the Usuario/Objetivo switch (left), the heat bar (centre) and
// Nuevo juego / Compartir (right). On one bottom row on wide screens; the
// heat bar goes up a row at 800 px and less, the two buttons at 560 px and
// less (game.component.css).
function gameScreen(viewport: Size): GuideItem[] {
  const { width, height } = viewport;
  const icon = width < 356 ? 56 : 64;
  const toolbar = [0, 1, 2, 3].map(i => ({ anchor: box(7 + (icon + 4) * i, 7, icon, icon) }));
  const help = { anchor: box(width - 7 - icon, 7, icon, icon) };
  const view = { anchor: centralRegion(box(0, 0, width, height)), region: true };
  const bottom = (up: number) => height - 47 - up;
  const heatUp = width <= 560 ? 98 : width <= 800 ? 49 : 0;
  const buttonsUp = width <= 560 ? 49 : 0;
  const toggle = { anchor: box(7, bottom(0), 230, 40) };
  const heat = { anchor: box(width / 2 - 130, bottom(heatUp), 260, 40) };
  const newGame = { anchor: box(width - 241, bottom(buttonsUp), 124, 40) };
  const share = { anchor: box(width - 109, bottom(buttonsUp), 104, 40) };
  return [...toolbar, help, view, toggle, heat, newGame, share];
}

// The game guide's text lengths, in the same order, as the browser renders
// them: 6 px a character and 18.5 px lines (the gear's 45-character line is
// 271×51 px at 1280×800); the compact bubbles of phone widths and short
// screens take 5.5 px and 16 px lines (247×41 px).
const GAME_CHARS = [45, 29, 29, 33, 26, 51, 43, 33, 46, 52];
const gameText = (viewport: Size): Measure => viewport.width <= 560 || viewport.height < 700
  ? fakeMeasure(GAME_CHARS, 5.5, 16, 9)
  : fakeMeasure(GAME_CHARS, 6, 18.5, 14);

// The rules every guide layout keeps: on screen, apart, off the controls,
// no line across a bubble or a control, every bubble pointing at its item.
function expectTidyLayout(items: GuideItem[], measure: Measure, viewport: Size) {
  const placements = layoutGuide(items, measure, viewport);
  const rects = placements.map((p, i) => rect(p, i, measure));
  const at = `${viewport.width}×${viewport.height}`;
  expect(placements.length).withContext(at).toBe(items.length);
  rects.forEach((r, i) => {
    expect(r.left).withContext(`${at} bubble ${i} left`).toBeGreaterThanOrEqual(8);
    expect(r.top).withContext(`${at} bubble ${i} top`).toBeGreaterThanOrEqual(8);
    expect(r.right).withContext(`${at} bubble ${i} right`).toBeLessThanOrEqual(viewport.width - 8);
    expect(r.bottom).withContext(`${at} bubble ${i} bottom`).toBeLessThanOrEqual(viewport.height - 8);
    rects.slice(i + 1).forEach((other, k) =>
      expect(overlaps(r, other)).withContext(`${at} bubbles ${i} and ${i + 1 + k}`).toBeFalse());
    items.forEach((item, j) => {
      if (!item.region) {
        expect(overlaps(r, item.anchor)).withContext(`${at} bubble ${i} over control ${j}`).toBeFalse();
      }
    });
  });
  placements.forEach((p, i) => {
    const tip = arrowTip(p, rects[i]);
    if (p.leader) {
      const line = lineBox(p.leader);
      rects.forEach((r, j) => {
        if (j !== i) {
          expect(overlaps(line, r)).withContext(`${at} line ${i} across bubble ${j}`).toBeFalse();
        }
      });
      expect(inside({ x: p.leader.x1, y: p.leader.y1 }, items[i].anchor)).withContext(`${at} line ${i} start`).toBeTrue();
      expect(p.leader.x2).withContext(`${at} line ${i} end x`).toBeCloseTo(tip.x, 0);
      expect(p.leader.y2).withContext(`${at} line ${i} end y`).toBeCloseTo(tip.y, 0);
    } else if (items[i].region) {
      expect(inside(tip, items[i].anchor)).withContext(`${at} arrow ${i} on the shell`).toBeTrue();
    } else {
      const a = items[i].anchor;
      expect(inside(tip, box(a.left - 2, a.top - 2, a.width + 4, a.height + 4))).withContext(`${at} arrow ${i} at its control`).toBeTrue();
    }
  });
}

describe('layoutGuide on the game screen (#35)', () => {
  for (const viewport of [SMALL_PHONE, PHONE, DESKTOP, LANDSCAPE]) {
    it(`keeps all ten bubbles tidy at ${viewport.width}×${viewport.height}`, () => {
      expectTidyLayout(gameScreen(viewport), gameText(viewport), viewport);
    });
  }

  // Short phones: ten bubbles don't fit (owner, #35: best effort), but each
  // one is still placed, on screen.
  for (const viewport of [{ width: 320, height: 568 }, NARROW, { width: 360, height: 560 }, SHORT, { width: 375, height: 553 }]) {
    it(`still places all ten bubbles on screen at ${viewport.width}×${viewport.height} (best effort)`, () => {
      const measure = gameText(viewport);
      const placements = layoutGuide(gameScreen(viewport), measure, viewport);
      expect(placements.length).toBe(10);
      placements.forEach((p, i) => {
        const r = rect(p, i, measure);
        expect(r.left).withContext(`bubble ${i} left`).toBeGreaterThanOrEqual(8);
        expect(r.top).withContext(`bubble ${i} top`).toBeGreaterThanOrEqual(8);
        expect(r.right).withContext(`bubble ${i} right`).toBeLessThanOrEqual(viewport.width - 8);
        expect(r.bottom).withContext(`bubble ${i} bottom`).toBeLessThanOrEqual(viewport.height - 8);
      });
    });
  }

  it("keeps a bottom row's staircase near its row: bubbles placed up top aren't in its way", () => {
    // A top row already stacked down the left side, and a bottom row below
    // it: the bottom row's bubbles sit just above their row.
    const viewport = PHONE;
    const top = [0, 1, 2].map(i => ({ anchor: box(7 + 68 * i, 7, 64, 64) }));
    const bottom = [0, 1].map(i => ({ anchor: box(7 + 68 * i, viewport.height - 71, 64, 64) }));
    const measure = fakeMeasure([40, 40, 40, 20, 20]);
    const placements = layoutGuide([...top, ...bottom], measure, viewport);
    const rowTop = viewport.height - 71;
    // Nothing is in their way near the row, so the one stacked above it
    // sits 10 px above (the rightmost may go beside its control instead).
    const above = [3, 4].filter(i => placements[i].side === 'above');
    expect(above.length).withContext('one stacked above the row').toBeGreaterThan(0);
    expect(Math.max(...above.map(i => rect(placements[i], i, measure).bottom))).toBeCloseTo(rowTop - 10, 0);
    placements.slice(3).forEach((p, k) =>
      expect(rect(p, 3 + k, measure).top).withContext(`bottom bubble ${k}`).toBeGreaterThan(viewport.height / 2));
  });

  it("keeps a row's bubbles off the other controls, stacking past them", () => {
    // A bottom row with another control right above it, where its bubbles
    // would go.
    const viewport = PHONE;
    const row = [0, 1].map(i => ({ anchor: box(100 + 130 * i, viewport.height - 50, 120, 40) }));
    const above = { anchor: box(60, viewport.height - 100, 260, 40) };
    const measure = fakeMeasure([30, 30, 30]);
    const placements = layoutGuide([...row, above], measure, viewport);
    placements.slice(0, 2).forEach((p, i) =>
      expect(overlaps(rect(p, i, measure), above.anchor)).withContext(`bubble ${i}`).toBeFalse());
  });

  it("puts a crowded control's bubble further out, joined by a line that crosses no control", () => {
    // A wide control in the bottom-left corner under another one (too far
    // apart to be a row): no side has room, so its bubble goes above both,
    // with a line past the other.
    const viewport = { width: 390, height: 500 };
    const corner = { anchor: box(7, 453, 230, 40) };
    const over = { anchor: box(65, 393, 260, 40) };
    const measure = fakeMeasure([43, 33]);
    const placements = layoutGuide([corner, over], measure, viewport);
    const p = placements[0];
    expect(p.leader).withContext('joined by a line').toBeDefined();
    const r = rect(p, 0, measure);
    expect(overlaps(r, corner.anchor)).toBeFalse();
    expect(overlaps(r, over.anchor)).toBeFalse();
    expect(overlaps(lineBox(p.leader!), over.anchor)).withContext('line past the other control').toBeFalse();
    expect(inside({ x: p.leader!.x1, y: p.leader!.y1 }, corner.anchor)).withContext('line starts on its control').toBeTrue();
  });
});

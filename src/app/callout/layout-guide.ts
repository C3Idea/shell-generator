import { Box, Size } from './callout.component';

// The guide (#5): a bubble beside every control at once. layoutGuide() places
// the whole set together, so no two bubbles overlap. Pure, so it can be
// tested without a DOM; the component measures the bubbles for it.

// One control the guide points at. A region (the 3D view) is an area rather
// than a button: its bubble may sit over part of it, as long as the arrow
// points into it.
export interface GuideItem {
  anchor: Box;
  region?: boolean;
}

// A thin line from a control to its bubble's arrow, for a bubble that can't
// sit right beside its control.
export interface Leader { x1: number; y1: number; x2: number; y2: number; }

// Where a bubble goes, in viewport coordinates. `arrow` is where the arrow
// meets the bubble's edge, in px from its left edge (below, above) or its
// top edge (right, left), as in placeCallout(). `maxWidth` is the width the
// bubble was measured at; the component gives it that max-width.
export interface GuidePlacement {
  side: 'right' | 'left' | 'below' | 'above';
  left: number;
  top: number;
  arrow: number;
  maxWidth: number;
  leader?: Leader;
}

// The rendered size of bubble `index` when its max-width is `maxWidth`.
export type Measure = (index: number, maxWidth: number) => Size;

type Side = GuidePlacement['side'];

const GAP = 10;            // between a control and its bubble; room for the arrow
const MARGIN = 8;          // kept between a bubble and the viewport edge
const ARROW_INSET = 14;    // the arrow never sits closer than this to a corner
const ARROW_TIP = 9;       // how far the arrow's point sits outside the bubble
const MAX_WIDTH = 320;     // a guide bubble's widest
const STACK_GAP = 6;       // between two bubbles in a staircase
const LINE_CLEARANCE = 12; // between a leader line and the bubble to its right
const ROW_TOLERANCE = 4;   // controls this close in top and height share a row
const SLIDE_STEP = 2;      // how far a region's bubble moves per try

const box = (left: number, top: number, width: number, height: number): Box =>
  ({ left, top, width, height, right: left + width, bottom: top + height });

const overlaps = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

const inside = (x: number, y: number, b: Box) =>
  x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

const lineBox = (l: Leader) =>
  box(Math.min(l.x1, l.x2), Math.min(l.y1, l.y2), Math.abs(l.x2 - l.x1) || 1, Math.abs(l.y2 - l.y1) || 1);

// The middle of an area, half its shorter side across: roughly where the
// shell is drawn in the 3D view.
export function centralRegion(area: Box): Box {
  const side = Math.min(area.width, area.height) / 2;
  return box(area.left + (area.width - side) / 2, area.top + (area.height - side) / 2, side, side);
}

// Places a bubble beside every item: the order of `items` is the order of
// the result. Controls in a row (the toolbar) would crowd each other's
// bubbles, so theirs stack in a staircase away from the row (below it at the
// top of the screen, above it at the bottom), the rightmost control's bubble
// nearest the row, each joined to its control by a leader line that passes
// left of the bubbles above it. Where it fits, the rightmost control's bubble
// sits beside it instead. Every other bubble sits beside its control on the
// first side where it fits and covers nothing; a region's bubble may move
// into the region to find room.
export function layoutGuide(items: GuideItem[], measure: Measure, viewport: Size): GuidePlacement[] {
  const result: GuidePlacement[] = new Array(items.length);
  const taken: Box[] = [];
  const blocks = (r: Box, own: number) =>
    items.some((item, j) => j !== own && !item.region && overlaps(r, item.anchor)) || taken.some(t => overlaps(r, t));
  const fits = (r: Box) =>
    r.left >= MARGIN && r.top >= MARGIN && r.right <= viewport.width - MARGIN && r.bottom <= viewport.height - MARGIN;
  const widest = Math.min(MAX_WIDTH, viewport.width - 2 * MARGIN);

  const accept = (index: number, placement: GuidePlacement, size: Size) => {
    result[index] = placement;
    taken.push(box(placement.left, placement.top, size.width, size.height));
    if (placement.leader) {
      taken.push(lineBox(placement.leader));
    }
  };

  // Beside the control on `side`, `distance` px from its edge.
  const beside = (anchor: Box, size: Size, side: Side, distance: number): GuidePlacement => {
    const centreX = anchor.left + anchor.width / 2;
    const centreY = anchor.top + anchor.height / 2;
    if (side === 'right' || side === 'left') {
      const top = clamp(centreY - ARROW_INSET, MARGIN, viewport.height - MARGIN - size.height);
      const left = side === 'right' ? anchor.right + distance : anchor.left - distance - size.width;
      return { side, left, top, arrow: centreY - top, maxWidth: widest };
    }
    const left = clamp(centreX - size.width / 2, MARGIN, viewport.width - MARGIN - size.width);
    const top = side === 'below' ? anchor.bottom + distance : anchor.top - distance - size.height;
    return { side, left, top, arrow: centreX - left, maxWidth: widest };
  };

  const tip = (p: GuidePlacement, size: Size) => {
    switch (p.side) {
      case 'right': return { x: p.left - ARROW_TIP, y: p.top + p.arrow };
      case 'left': return { x: p.left + size.width + ARROW_TIP, y: p.top + p.arrow };
      case 'below': return { x: p.left + p.arrow, y: p.top - ARROW_TIP };
      case 'above': return { x: p.left + p.arrow, y: p.top + size.height + ARROW_TIP };
    }
  };

  // Tries each side in turn; for a region, also nearer, while the arrow
  // still points into it. Returns false when nothing fits.
  const placeBeside = (index: number, sides: Side[]): boolean => {
    const item = items[index];
    const size = measure(index, widest);
    const depth = Math.min(item.anchor.width, item.anchor.height) - ARROW_TIP;
    // A region's arrow points just inside it, so its bubble starts 1 px nearer.
    const nearest = item.region ? ARROW_TIP - 1 : GAP;
    for (const side of sides) {
      for (let distance = nearest; distance >= (item.region ? nearest - depth : GAP); distance -= SLIDE_STEP) {
        const placement = beside(item.anchor, size, side, distance);
        const r = box(placement.left, placement.top, size.width, size.height);
        const point = tip(placement, size);
        if (fits(r) && !blocks(r, index) && !taken.some(t => inside(point.x, point.y, t))) {
          accept(index, placement, size);
          return true;
        }
      }
    }
    return false;
  };

  const placeRow = (row: number[]) => {
    const centre = (i: number) => items[i].anchor.left + items[i].anchor.width / 2;
    const order = [...row].sort((a, b) => centre(b) - centre(a));
    if (placeBeside(order[0], ['right'])) {
      order.shift();
    }
    const first = items[row[0]].anchor;
    const downward = first.top + first.height / 2 < viewport.height / 2;
    let cursor = downward ? first.bottom + GAP : first.top - GAP;
    order.forEach((index, k) => {
      const anchor = items[index].anchor;
      const centreX = centre(index);
      const next = order[k + 1];
      const leftBound = next === undefined ? MARGIN : centre(next) + LINE_CLEARANCE;
      const maxWidth = Math.min(widest, viewport.width - MARGIN - leftBound);
      const size = measure(index, maxWidth);
      const left = Math.max(leftBound, Math.min(centreX - size.width / 2, viewport.width - MARGIN - size.width));
      const top = downward ? cursor : cursor - size.height;
      const leader = downward
        ? { x1: centreX, y1: anchor.bottom, x2: centreX, y2: top - ARROW_TIP }
        : { x1: centreX, y1: anchor.top, x2: centreX, y2: top + size.height + ARROW_TIP };
      accept(index, { side: downward ? 'below' : 'above', left, top, arrow: centreX - left, maxWidth, leader }, size);
      cursor = downward ? top + size.height + STACK_GAP : top - STACK_GAP;
    });
  };

  const rows = findRows(items);
  rows.forEach(placeRow);
  const inRow = new Set(rows.flat());
  items.forEach((item, index) => {
    if (inRow.has(index)) {
      return;
    }
    const sides: Side[] = item.region ? ['below', 'right', 'above', 'left'] : ['right', 'below', 'above', 'left'];
    if (!placeBeside(index, sides)) {
      // Nowhere free: the first side, clamped inside the screen.
      const size = measure(index, widest);
      const p = beside(item.anchor, size, sides[0], GAP);
      p.left = clamp(p.left, MARGIN, viewport.width - MARGIN - size.width);
      p.top = clamp(p.top, MARGIN, viewport.height - MARGIN - size.height);
      accept(index, p, size);
    }
  });
  return result;
}

// Controls (not regions) of the same top and height, each within one
// control's width of the next: two or more make a row.
function findRows(items: GuideItem[]): number[][] {
  const rows: number[][] = [];
  const seen = new Set<number>();
  items.forEach((item, i) => {
    if (item.region || seen.has(i)) {
      return;
    }
    const row = [i];
    seen.add(i);
    for (let grown = true; grown;) {
      grown = false;
      items.forEach((other, j) => {
        if (seen.has(j) || other.region) {
          return;
        }
        const a = other.anchor;
        const near = row.some(k => {
          const b = items[k].anchor;
          return Math.abs(a.top - b.top) <= ROW_TOLERANCE && Math.abs(a.height - b.height) <= ROW_TOLERANCE
            && Math.max(a.left - b.right, b.left - a.right) <= Math.max(a.width, b.width);
        });
        if (near) {
          row.push(j);
          seen.add(j);
          grown = true;
        }
      });
    }
    if (row.length > 1) {
      rows.push(row);
    }
  });
  return rows;
}

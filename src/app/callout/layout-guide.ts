import { ARROW_INSET, Box, box, clamp, GAP, MARGIN, overlaps, Size } from './geometry';

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

// GAP, MARGIN and ARROW_INSET are shared with the ⓘ bubble (geometry.ts).
const ARROW_TIP = 9;       // how far the arrow's point sits outside the bubble
const MAX_WIDTH = 320;     // a guide bubble's widest
const STACK_GAP = 6;       // between a stacked bubble and what it clears
const LINE_CLEARANCE = 12; // between a leader line and the bubble to its right
const LINE_SPACING = LINE_CLEARANCE + ARROW_INSET; // between two lines of a row
const ROW_TOLERANCE = 4;   // controls this close in top and height share a row
const STACK_REACH = 12;    // controls this close above or below each other share a row too
const SLIDE_STEP = 2;      // how far a region's bubble moves per try
const COLUMN_STEP = 4;     // between the columns tried for a region's line

const inside = (x: number, y: number, b: Box) =>
  x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;

// A vertical or horizontal line as a box at least 1 px across.
export const lineBox = (l: Leader) =>
  box(Math.min(l.x1, l.x2), Math.min(l.y1, l.y2), Math.abs(l.x2 - l.x1) || 1, Math.abs(l.y2 - l.y1) || 1);

// Places a bubble beside every item: the order of `items` is the order of
// the result. Controls in a row (the toolbar; or controls stacked just above
// one another, like the game's bottom controls on a phone) would crowd each
// other's bubbles, so theirs stack in a staircase away from the row (below
// it at the top of the screen, above it at the bottom), the rightmost
// control's bubble nearest the row, each joined to its control by a leader
// line that passes left of the bubbles above it. A bubble drops only past
// the bubbles, lines and other controls actually in its way, so far-apart
// controls keep theirs near the row. Where there's room to its right, the
// rightmost control's bubble goes there and skips the staircase; a row
// bubble that can't be stacked (off the screen, or its line across a
// bubble) is placed like a lone control. Every other bubble sits beside its
// control on the first side where it fits and covers nothing, controls
// before regions; a region's bubble may move into the region to find room.
// Failing that, a bubble sits further out, joined to its item by a line
// through a gap.
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

  // A bubble further out, when nothing fits beside its item: below (or
  // above) it, as near as possible, joined by a vertical line that crosses
  // no bubble and no other control. A region's line starts on the region,
  // past whatever already covers it there; a control's (#35) starts on the
  // control's edge. Tries columns from the item's middle outwards, and for
  // a control the side away from the nearer screen edge first.
  const placeFar = (index: number): boolean => {
    const item = items[index];
    const region = item.anchor;
    const size = measure(index, widest);
    const centreX = region.left + region.width / 2;
    const columns: number[] = [];
    for (let d = 0; d <= region.width / 2; d += COLUMN_STEP) {
      columns.push(centreX + d);
      if (d > 0) {
        columns.push(centreX - d);
      }
    }
    const upper = region.top + region.height / 2 < viewport.height / 2;
    const sides = item.region || upper ? ['below', 'above'] as const : ['above', 'below'] as const;
    for (const side of sides) {
      const from = side === 'below' ? region.bottom + ARROW_TIP : region.top - ARROW_TIP - size.height;
      const to = side === 'below' ? viewport.height - MARGIN - size.height : MARGIN;
      const step = side === 'below' ? SLIDE_STEP : -SLIDE_STEP;
      for (let top = from; side === 'below' ? top <= to : top >= to; top += step) {
        for (const x of columns) {
          const left = clamp(x - size.width / 2, MARGIN, viewport.width - MARGIN - size.width);
          if (x < left + ARROW_INSET || x > left + size.width - ARROW_INSET) {
            continue;
          }
          const r = box(left, top, size.width, size.height);
          if (!fits(r) || blocks(r, index)) {
            continue;
          }
          const end = side === 'below' ? top - ARROW_TIP : top + size.height + ARROW_TIP;
          const column = taken.filter(t => t.left <= x && x <= t.right);
          const start = !item.region ? (side === 'below' ? region.bottom : region.top)
            : side === 'below'
              ? Math.max(region.top, ...column.filter(t => t.top < end).map(t => t.bottom + 1))
              : Math.min(region.bottom, ...column.filter(t => t.bottom > end).map(t => t.top - 1));
          const onRegion = start >= region.top && start <= region.bottom;
          const clear = side === 'below' ? start < end : start > end;
          const line = { x1: x, y1: start, x2: x, y2: end };
          if (onRegion && clear && !taken.some(t => overlaps(lineBox(line), t))
            && !items.some((item, j) => j !== index && !item.region && overlaps(lineBox(line), item.anchor))) {
            accept(index, { side, left, top, arrow: x - left, maxWidth: widest, leader: line }, size);
            return true;
          }
        }
      }
    }
    return false;
  };

  // The first placed bubble, line or other control (not in `row`, not a
  // region) that a bubble at (left, top) would cover, if any.
  const obstacleAt = (left: number, top: number, size: Size, row: number[]): Box | undefined => {
    const r = box(left, top, size.width, size.height);
    return taken.find(t => overlaps(r, t))
      ?? items.find((item, j) => !row.includes(j) && !item.region && overlaps(r, item.anchor))?.anchor;
  };

  // Returns the members it couldn't stack (their bubble or line would run
  // off the screen or across a bubble already placed): they're placed like
  // lone controls afterwards.
  const placeRow = (row: number[]): number[] => {
    const centre = (i: number) => items[i].anchor.left + items[i].anchor.width / 2;
    const order = [...row].sort((a, b) => centre(b) - centre(a));
    if (placeBeside(order[0], ['right'])) {
      order.shift();
    }
    const anchors = row.map(i => items[i].anchor);
    const first = anchors[0];
    const downward = first.top + first.height / 2 < viewport.height / 2;
    // A row can be controls stacked one above the other (#35): the bubbles
    // start past the whole stack.
    const start = downward ? Math.max(...anchors.map(a => a.bottom)) + GAP : Math.min(...anchors.map(a => a.top)) - GAP;
    // Where each line leaves its control: its middle, or further left when
    // the control to its right is centred within LINE_SPACING of it (the
    // game's heat bar and Nuevo juego on a phone, #35), so the lines stay
    // apart and each arrow clears its bubble's corner.
    const lineX = new Map<number, number>();
    order.forEach((index, k) => {
      const previous = order[k - 1];
      const x = previous === undefined ? centre(index) : Math.min(centre(index), lineX.get(previous)! - LINE_SPACING);
      lineX.set(index, Math.max(x, items[index].anchor.left + 1));
    });
    const leftOver: number[] = [];
    order.forEach((index, k) => {
      const anchor = items[index].anchor;
      const lineAt = lineX.get(index)!;
      const next = order[k + 1];
      const leftBound = next === undefined ? MARGIN : lineX.get(next)! + LINE_CLEARANCE;
      const maxWidth = Math.min(widest, viewport.width - MARGIN - leftBound);
      const size = measure(index, maxWidth);
      const left = Math.max(leftBound, Math.min(lineAt - size.width / 2, viewport.width - MARGIN - size.width));
      // Nearest the row, then past whatever it would cover there (the
      // bubbles and lines of the controls to its right, and other controls),
      // one obstacle at a time, so what isn't in its way (a staircase from
      // the other end of the screen, #35) doesn't push it further.
      let top = downward ? start : start - size.height;
      for (let hit = obstacleAt(left, top, size, row); hit; hit = obstacleAt(left, top, size, row)) {
        top = downward ? hit.bottom + STACK_GAP : hit.top - STACK_GAP - size.height;
      }
      const leader = downward
        ? { x1: lineAt, y1: anchor.bottom, x2: lineAt, y2: top - ARROW_TIP }
        : { x1: lineAt, y1: anchor.top, x2: lineAt, y2: top + size.height + ARROW_TIP };
      if (!fits(box(left, top, size.width, size.height)) || taken.some(t => overlaps(lineBox(leader), t))) {
        leftOver.push(index);
        return;
      }
      accept(index, { side: downward ? 'below' : 'above', left, top, arrow: lineAt - left, maxWidth, leader }, size);
    });
    return leftOver;
  };

  const rows = findRows(items, viewport);
  const unstacked = rows.flatMap(placeRow);
  const inRow = new Set(rows.flat().filter(index => !unstacked.includes(index)));
  // Lone controls before regions: a region's bubble can move into the
  // region to make room, a control's can't.
  const singles = items.map((_, index) => index).filter(index => !inRow.has(index));
  const inOrder = [...singles.filter(i => !items[i].region), ...singles.filter(i => items[i].region)];
  inOrder.forEach(index => {
    const item = items[index];
    const sides: Side[] = item.region ? ['below', 'right', 'above', 'left'] : ['right', 'below', 'above', 'left'];
    if (!placeBeside(index, sides) && !placeFar(index)) {
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

// Controls (not regions) of the same top and height, however far apart
// (the toolbar and the "?" in the opposite corner), make a row; so do
// controls stacked within STACK_REACH px of each other in the same half of
// the screen (the game's bottom controls on a phone, #35). Two or more.
function findRows(items: GuideItem[], viewport: Size): number[][] {
  const upper = (b: Box) => b.top + b.height / 2 < viewport.height / 2;
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
          const level = Math.abs(a.top - b.top) <= ROW_TOLERANCE && Math.abs(a.height - b.height) <= ROW_TOLERANCE;
          const stacked = upper(a) === upper(b)
            && (Math.abs(a.top - b.bottom) <= STACK_REACH || Math.abs(b.top - a.bottom) <= STACK_REACH);
          return level || stacked;
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

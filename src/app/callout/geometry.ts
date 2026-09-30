// Geometry shared by the single help bubble (#6, placeCallout) and the guide
// (#5, layoutGuide), so both keep the same spacing. Viewport coordinates.

export interface Box { left: number; top: number; right: number; bottom: number; width: number; height: number; }
export interface Size { width: number; height: number; }

export const GAP = 10;         // between a control and its bubble; room for the arrow
export const MARGIN = 8;       // kept between a bubble and the viewport edge
export const ARROW_INSET = 14; // the arrow never sits closer than this to a corner

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export const box = (left: number, top: number, width: number, height: number): Box =>
  ({ left, top, width, height, right: left + width, bottom: top + height });

// Whether two boxes share any area (touching edges don't count).
export const overlaps = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

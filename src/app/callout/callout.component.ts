import { AfterViewChecked, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';

// One help bubble (#6), shown for the ⓘ that was clicked. `anchor` is a CSS
// selector for that ⓘ; `id` is the bubble's id, which the ⓘ points at with
// aria-controls.
export interface Callout {
  id: string;
  title: string;
  text: string;
  anchor: string;
}

export interface CalloutPlacement {
  side: 'right' | 'below' | 'above';
  left: number;
  top: number;
  // Where the arrow meets the bubble's edge, in px from its left edge (below,
  // above) or its top edge (right): the anchor's centre.
  arrow: number;
}

interface Box { left: number; top: number; right: number; bottom: number; width: number; height: number; }
interface Size { width: number; height: number; }

const GAP = 10;         // between the anchor and the bubble; room for the arrow
const MARGIN = 8;       // kept between the bubble and the viewport edge
const ARROW_INSET = 14; // the arrow never sits closer than this to a corner

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

// Where the bubble goes, in viewport coordinates: to the right of the anchor
// when all of it fits there, otherwise below it, or above it when only that
// fits, slid sideways to stay inside the viewport; then it doesn't cover the
// anchor. On a screen too short for either, it takes the side with more room
// and is clamped inside the viewport, so it may overlap the anchor. Pure, so
// it can be tested without a DOM.
export function placeCallout(anchor: Box, bubble: Size, viewport: Size): CalloutPlacement {
  const centreX = anchor.left + anchor.width / 2;
  const centreY = anchor.top + anchor.height / 2;
  if (anchor.right + GAP + bubble.width + MARGIN <= viewport.width) {
    const top = clamp(centreY - ARROW_INSET, MARGIN, viewport.height - MARGIN - bubble.height);
    return { side: 'right', left: anchor.right + GAP, top, arrow: centreY - top };
  }
  const left = clamp(centreX - bubble.width / 2, MARGIN, viewport.width - MARGIN - bubble.width);
  const roomBelow = viewport.height - MARGIN - GAP - anchor.bottom;
  const roomAbove = anchor.top - GAP - MARGIN;
  const below = roomBelow >= bubble.height || (roomAbove < bubble.height && roomBelow >= roomAbove);
  const top = below
    ? Math.min(anchor.bottom + GAP, viewport.height - MARGIN - bubble.height)
    : Math.max(MARGIN, anchor.top - GAP - bubble.height);
  return { side: below ? 'below' : 'above', left, top, arrow: centreX - left };
}

// The nearest ancestor that scrolls (the shell panel on short screens), if any.
function scrollParent(element: Element): Element | null {
  for (let e = element.parentElement; e; e = e.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight) {
      return e;
    }
  }
  return null;
}

// Adapted from gato_magico's cue overlay (its issue #4). The layer covers the
// viewport but takes no pointer events, so the sliders under it keep working;
// it is a polite live region, so a screen reader reads the help out when a
// bubble appears. The parent mounts it outside the side panels, which are
// translucent. It re-places the bubble when the window resizes or anything
// scrolls (the panel holding its ⓘ scrolls on short screens), and hides it
// while its ⓘ is scrolled out of that panel.
@Component({
  selector: 'app-callout',
  templateUrl: './callout.component.html',
  styleUrls: ['./callout.component.css']
})
export class CalloutComponent implements OnChanges, AfterViewChecked, OnDestroy {
  @Input() active: Callout | null = null;

  @ViewChild('bubble')
  private bubbleRef?: ElementRef<HTMLElement>;

  // The active callout, only while its anchor is on the page.
  shown: Callout | null = null;

  private anchorElement: Element | null = null;
  private needsPlacing = false;

  ngOnChanges(): void {
    this.anchorElement = this.active ? document.querySelector(this.active.anchor) : null;
    this.shown = this.anchorElement ? this.active : null;
    this.needsPlacing = true;
  }

  // Placing needs the rendered bubble's size, so it runs after the view is
  // updated and writes the position straight to the element's style.
  ngAfterViewChecked(): void {
    if (this.needsPlacing) {
      this.needsPlacing = false;
      this.place();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.place();
  }

  // Scroll events don't bubble, so one capture-phase listener on the document
  // sees the panel's scrolling as well as the page's.
  private readonly onScroll = () => this.place();

  constructor() {
    document.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.onScroll, true);
  }

  private place(): void {
    const bubble = this.bubbleRef?.nativeElement;
    if (!bubble || !this.anchorElement) {
      return;
    }
    const anchor = this.anchorElement.getBoundingClientRect();
    const panel = scrollParent(this.anchorElement)?.getBoundingClientRect();
    const centreY = anchor.top + anchor.height / 2;
    bubble.style.visibility = panel && (centreY < panel.top || centreY > panel.bottom) ? 'hidden' : 'visible';
    const viewport = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
    const size = { width: bubble.offsetWidth, height: bubble.offsetHeight };
    const placement = placeCallout(anchor, size, viewport);
    const edge = placement.side === 'right' ? size.height : size.width;
    bubble.dataset['side'] = placement.side;
    bubble.style.left = `${placement.left}px`;
    bubble.style.top = `${placement.top}px`;
    bubble.style.setProperty('--callout-arrow', `${clamp(placement.arrow, ARROW_INSET, edge - ARROW_INSET)}px`);
  }
}

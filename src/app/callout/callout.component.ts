import { AfterViewChecked, Component, ElementRef, HostListener, Input, OnChanges, ViewChild } from '@angular/core';
import { AppStrings } from '../app-strings';

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
// when all of it fits there, otherwise below it (or above it when the space
// below is too short), slid sideways to stay inside the viewport. It never
// covers the anchor. Pure, so it can be tested without a DOM.
export function placeCallout(anchor: Box, bubble: Size, viewport: Size): CalloutPlacement {
  const centreX = anchor.left + anchor.width / 2;
  const centreY = anchor.top + anchor.height / 2;
  if (anchor.right + GAP + bubble.width + MARGIN <= viewport.width) {
    const top = clamp(centreY - ARROW_INSET, MARGIN, viewport.height - MARGIN - bubble.height);
    return { side: 'right', left: anchor.right + GAP, top, arrow: centreY - top };
  }
  const left = clamp(centreX - bubble.width / 2, MARGIN, viewport.width - MARGIN - bubble.width);
  const fitsBelow = anchor.bottom + GAP + bubble.height + MARGIN <= viewport.height;
  const top = fitsBelow ? anchor.bottom + GAP : Math.max(MARGIN, anchor.top - GAP - bubble.height);
  return { side: fitsBelow ? 'below' : 'above', left, top, arrow: centreX - left };
}

// Adapted from gato_magico's cue overlay (its issue #4). The layer covers the
// viewport but takes no pointer events, so the sliders under it keep working;
// it is a polite live region, so a screen reader reads the help out when a
// bubble appears. The parent mounts it outside the side panels, which are
// translucent.
@Component({
  selector: 'app-callout',
  templateUrl: './callout.component.html',
  styleUrls: ['./callout.component.css']
})
export class CalloutComponent implements OnChanges, AfterViewChecked {
  @Input() active: Callout | null = null;

  // Bumped by the parent to re-place the bubble when its anchor moves.
  @Input() recomputeKey = 0;

  @ViewChild('bubble')
  private bubbleRef?: ElementRef<HTMLElement>;

  AppStrings = AppStrings;

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

  private place(): void {
    const bubble = this.bubbleRef?.nativeElement;
    if (!bubble || !this.anchorElement) {
      return;
    }
    const viewport = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
    const size = { width: bubble.offsetWidth, height: bubble.offsetHeight };
    const placement = placeCallout(this.anchorElement.getBoundingClientRect(), size, viewport);
    const edge = placement.side === 'right' ? size.height : size.width;
    bubble.dataset['side'] = placement.side;
    bubble.style.left = `${placement.left}px`;
    bubble.style.top = `${placement.top}px`;
    bubble.style.setProperty('--callout-arrow', `${clamp(placement.arrow, ARROW_INSET, edge - ARROW_INSET)}px`);
  }
}

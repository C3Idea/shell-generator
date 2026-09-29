import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Callout, CalloutComponent, placeCallout } from './callout.component';

// A host laid out like a side panel: an ⓘ the callout points at, a slider
// under the layer that must stay usable, and a scrolling panel with an ⓘ
// inside (the shell panel scrolls on short screens).
@Component({
  template: `
    <button type="button" id="anchor" [style.position]="'fixed'"
      [style.left.px]="anchorLeft" [style.top.px]="anchorTop"
      style="width: 24px; height: 24px; margin: 0; padding: 0; border: 0">i</button>
    <input type="range" id="slider" style="position: fixed; left: 20px; top: 20px; width: 200px" />
    <div id="scroller" style="position: fixed; left: 20px; top: 300px; width: 120px; height: 100px; overflow-y: auto">
      <div style="height: 400px; padding-top: 40px; box-sizing: border-box">
        <button type="button" id="inner" style="width: 24px; height: 24px; margin: 0; padding: 0; border: 0">i</button>
      </div>
    </div>
    <app-callout [active]="active"></app-callout>`
})
class HostComponent {
  active: Callout | null = null;
  anchorLeft = 20;
  anchorTop = 100;
}

describe('CalloutComponent (#6)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const help: Callout = { id: 'callout-test', title: 'Parámetro A', text: 'Texto de ayuda.', anchor: '#anchor' };

  const layer = () => fixture.nativeElement.querySelector('.callout-layer') as HTMLElement;
  const bubble = () => fixture.nativeElement.querySelector('.callout') as HTMLElement | null;
  const anchor = () => fixture.nativeElement.querySelector('#anchor') as HTMLElement;

  function show(callout: Callout | null) {
    host.active = callout;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HostComponent, CalloutComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders no bubble while nothing is active', () => {
    expect(bubble()).toBeNull();
  });

  it('shows one bubble with the title and text, under the given id', () => {
    show(help);
    expect(fixture.nativeElement.querySelectorAll('.callout').length).toBe(1);
    expect(bubble()!.id).toBe('callout-test');
    expect(bubble()!.querySelector('.callout-title')!.textContent!.trim()).toBe('Parámetro A');
    expect(bubble()!.querySelector('.callout-text')!.textContent!.trim()).toBe('Texto de ayuda.');
    expect(bubble()!.querySelector('.callout-arrow')).not.toBeNull();
  });

  it('switches to another callout and hides when cleared', () => {
    show(help);
    show({ ...help, id: 'callout-other', title: 'Otro' });
    expect(fixture.nativeElement.querySelectorAll('.callout').length).toBe(1);
    expect(bubble()!.id).toBe('callout-other');
    show(null);
    expect(bubble()).toBeNull();
  });

  it('renders nothing when the anchor is not on the page', () => {
    show({ ...help, anchor: '#missing' });
    expect(bubble()).toBeNull();
  });

  it('sits beside its anchor, without covering it, when there is room', () => {
    show(help);
    const a = anchor().getBoundingClientRect();
    const b = bubble()!.getBoundingClientRect();
    expect(bubble()!.dataset['side']).toBe('right');
    expect(b.left).toBeGreaterThanOrEqual(a.right);
    expect(b.top).toBeLessThanOrEqual(a.bottom);
    expect(b.bottom).toBeGreaterThanOrEqual(a.top);
  });

  it('stays inside the viewport and off its anchor when the anchor is near the right edge', () => {
    host.anchorLeft = document.documentElement.clientWidth - 30;
    fixture.detectChanges();
    show(help);
    const a = anchor().getBoundingClientRect();
    const b = bubble()!.getBoundingClientRect();
    expect(['below', 'above']).toContain(bubble()!.dataset['side']!);
    expect(b.left).toBeGreaterThanOrEqual(0);
    expect(b.right).toBeLessThanOrEqual(document.documentElement.clientWidth);
    const overlaps = b.left < a.right && b.right > a.left && b.top < a.bottom && b.bottom > a.top;
    expect(overlaps).toBeFalse();
  });

  it('follows its anchor when the window is resized', () => {
    show(help);
    const before = bubble()!.getBoundingClientRect().top;
    host.anchorTop = 200;
    fixture.detectChanges();
    window.dispatchEvent(new Event('resize'));
    expect(bubble()!.getBoundingClientRect().top).toBeGreaterThan(before + 50);
  });

  describe('in a scrolling panel', () => {
    const scroller = () => fixture.nativeElement.querySelector('#scroller') as HTMLElement;
    const inner = () => fixture.nativeElement.querySelector('#inner') as HTMLElement;
    // Scroll events are async after setting scrollTop; dispatch one so the
    // spec doesn't depend on frame timing.
    function scrollTo(top: number) {
      scroller().scrollTop = top;
      scroller().dispatchEvent(new Event('scroll'));
    }
    const arrowCentreY = () => {
      const a = bubble()!.querySelector('.callout-arrow')!.getBoundingClientRect();
      return a.top + a.height / 2;
    };

    it('follows its ⓘ when the panel scrolls', () => {
      show({ ...help, anchor: '#inner' });
      const i = inner().getBoundingClientRect();
      expect(arrowCentreY()).toBeCloseTo(i.top + i.height / 2, 0);
      const before = bubble()!.getBoundingClientRect().top;
      scrollTo(30);
      expect(bubble()!.getBoundingClientRect().top).toBeCloseTo(before - 30, 0);
      const j = inner().getBoundingClientRect();
      expect(arrowCentreY()).toBeCloseTo(j.top + j.height / 2, 0);
    });

    it('hides while its ⓘ is scrolled out of the panel, and comes back', () => {
      show({ ...help, anchor: '#inner' });
      scrollTo(200);
      expect(getComputedStyle(bubble()!).visibility).toBe('hidden');
      scrollTo(0);
      expect(getComputedStyle(bubble()!).visibility).toBe('visible');
    });

    it('stops listening once destroyed', () => {
      show({ ...help, anchor: '#inner' });
      fixture.destroy();
      expect(() => scrollTo(30)).not.toThrow();
    });
  });

  it('never takes the pointer: the layer lets clicks through to the controls', () => {
    show(help);
    expect(getComputedStyle(layer()).pointerEvents).toBe('none');
    expect(getComputedStyle(bubble()!).pointerEvents).toBe('none');
  });

  // Owner's request after the manual pass: the sliders under a bubble should
  // show through, so only its background is translucent (80 %); the text
  // stays solid.
  it('has an 80 % background, so the sliders under it show through, with solid text', () => {
    show(help);
    // Chrome reports rgb(r, g, b), rgba(r, g, b, a) or, for color-mix(),
    // color(srgb r g b / a).
    const alpha = (css: string) => {
      const slash = css.match(/\/\s*([\d.]+)\s*\)$/);
      if (slash) {
        return parseFloat(slash[1]);
      }
      const parts = css.replace(/^[a-z]+\(|\)$/g, '').split(/[ ,]+/).filter(Boolean);
      return css.startsWith('rgba') ? parseFloat(parts[3]) : 1;
    };
    const style = getComputedStyle(bubble()!);
    expect(alpha(style.backgroundColor)).toBeCloseTo(0.8, 2);
    expect(alpha(style.color)).toBe(1);
  });

  it('is a polite live region, so a screen reader announces the help', () => {
    expect(layer().getAttribute('aria-live')).toBe('polite');
    // Not a landmark: it's empty whenever no bubble is open.
    expect(layer().hasAttribute('role')).toBeFalse();
    expect(layer().hasAttribute('aria-label')).toBeFalse();
    show(help);
    expect(bubble()!.getAttribute('role')).toBe('note');
  });

  it('turns its animation off under prefers-reduced-motion', () => {
    const rules: CSSRule[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try { rules.push(...Array.from(sheet.cssRules)); } catch { /* cross-origin */ }
    }
    const reduced = rules.filter((r): r is CSSMediaRule =>
      r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion'));
    const offRule = reduced.flatMap(m => Array.from(m.cssRules) as CSSStyleRule[])
      .find(r => r.selectorText?.includes('.callout') && r.style.animationName === 'none');
    expect(offRule).toBeDefined();
  });

  describe('placeCallout', () => {
    const viewport = { width: 1280, height: 800 };
    const size = { width: 200, height: 80 };
    const rect = (left: number, top: number) =>
      ({ left, top, right: left + 24, bottom: top + 24, width: 24, height: 24 });

    it('goes to the right with the arrow at the anchor centre', () => {
      const p = placeCallout(rect(100, 300), size, viewport);
      expect(p.side).toBe('right');
      expect(p.left).toBeGreaterThan(124);
      expect(p.top + p.arrow).toBe(312);
    });

    it('goes below when there is no room on the right, clamped to the viewport', () => {
      const p = placeCallout(rect(1250, 300), size, viewport);
      expect(p.side).toBe('below');
      expect(p.top).toBeGreaterThan(324);
      expect(p.left + size.width).toBeLessThanOrEqual(viewport.width);
      expect(p.left + p.arrow).toBe(1262);
    });

    it('goes above when there is no room on the right or below', () => {
      const p = placeCallout(rect(1250, 760), size, viewport);
      expect(p.side).toBe('above');
      expect(p.top + size.height).toBeLessThan(760);
    });

    it('takes the side with more room when it fits neither below nor above', () => {
      const short = { width: 1280, height: 200 };
      const tall = { width: 200, height: 150 };
      expect(placeCallout(rect(1250, 60), tall, short).side).withContext('more room below').toBe('below');
      expect(placeCallout(rect(1250, 110), tall, short).side).withContext('more room above').toBe('above');
    });
  });
});

// The guide (#5): several bubbles at once. The host copies the initial
// screen's shape: three 64 px buttons in a row at the top left, a lone one at
// the bottom left, a large button (the 3D view) behind everything, and a
// region in the middle (where the shell is drawn).
@Component({
  template: `
    <button type="button" id="under" style="position: fixed; inset: 0; width: 100%; height: 100%; margin: 0; border: 0">3D</button>
    <button type="button" id="g1" style="position: fixed; left: 7px; top: 7px; width: 64px; height: 64px; margin: 0; padding: 0; border: 0">1</button>
    <button type="button" id="g2" style="position: fixed; left: 75px; top: 7px; width: 64px; height: 64px; margin: 0; padding: 0; border: 0">2</button>
    <button type="button" id="g3" style="position: fixed; left: 143px; top: 7px; width: 64px; height: 64px; margin: 0; padding: 0; border: 0">3</button>
    <button type="button" id="g4" style="position: fixed; left: 7px; bottom: 7px; width: 64px; height: 64px; margin: 0; padding: 0; border: 0">4</button>
    <div id="region" style="position: fixed; left: 100px; top: 350px; width: 190px; height: 150px; pointer-events: none"></div>
    <app-callout [guide]="guide"></app-callout>`
})
class GuideHostComponent {
  guide: Callout[] | null = null;
}

describe('CalloutComponent guide mode (#5)', () => {
  let fixture: ComponentFixture<GuideHostComponent>;
  let host: GuideHostComponent;
  let restoreViewport: (() => void) | null = null;

  const guide: Callout[] = [
    { id: 'guide-g1', title: 'Uno', text: 'El primer botón de la fila.', anchor: '#g1' },
    { id: 'guide-g2', title: 'Dos', text: 'El segundo botón de la fila.', anchor: '#g2' },
    { id: 'guide-g3', title: 'Tres', text: 'El tercer botón, con un texto más largo.', anchor: '#g3' },
    { id: 'guide-view', title: 'Vista', text: 'Arrastra para girar.', anchor: '#region', region: true },
    { id: 'guide-g4', title: 'Cuatro', text: 'El botón de abajo.', anchor: '#g4' },
  ];

  const bubbles = () => Array.from(fixture.nativeElement.querySelectorAll('.callout')) as HTMLElement[];
  const leaders = () => Array.from(fixture.nativeElement.querySelectorAll('.callout-leader')) as HTMLElement[];
  const rectOf = (el: Element) => el.getBoundingClientRect();
  const overlaps = (a: DOMRect, b: DOMRect) =>
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

  function setViewport(width: number, height: number) {
    const frame = window.frameElement as HTMLIFrameElement | null;
    if (!frame) {
      pending('needs the Karma iframe to set the viewport size');
      return;
    }
    const before = { width: frame.style.width, height: frame.style.height };
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    window.dispatchEvent(new Event('resize'));
    restoreViewport = () => {
      frame.style.width = before.width;
      frame.style.height = before.height;
    };
  }

  function show(callouts: Callout[] | null) {
    host.guide = callouts;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GuideHostComponent, CalloutComponent]
    }).compileComponents();
    setViewport(390, 844);
    fixture = TestBed.createComponent(GuideHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    restoreViewport?.();
    restoreViewport = null;
  });

  it('shows one bubble per callout, in the given order, each with its id, title, text and arrow', () => {
    show(guide);
    const shown = bubbles();
    expect(shown.map(b => b.id)).toEqual(guide.map(c => c.id));
    shown.forEach((b, i) => {
      expect(b.getAttribute('role')).withContext(b.id).toBe('note');
      expect(b.querySelector('.callout-title')!.textContent!.trim()).toBe(guide[i].title);
      expect(b.querySelector('.callout-text')!.textContent!.trim()).toBe(guide[i].text);
      expect(b.querySelector('.callout-arrow')).withContext(b.id).not.toBeNull();
    });
  });

  it('leaves out a callout whose control is not on the page, and clears when the guide ends', () => {
    show([...guide, { id: 'guide-missing', title: 'No', text: 'No está.', anchor: '#missing' }]);
    expect(bubbles().length).toBe(guide.length);
    show(null);
    expect(bubbles().length).toBe(0);
    expect(leaders().length).toBe(0);
  });

  it('keeps every bubble on screen, apart from the others and off every button', () => {
    show(guide);
    const rects = bubbles().map(rectOf);
    expect(rects.length).toBe(guide.length);
    const buttons = ['#g1', '#g2', '#g3', '#g4'].map(s => rectOf(fixture.nativeElement.querySelector(s)));
    rects.forEach((r, i) => {
      expect(r.left).withContext(`${guide[i].id} left`).toBeGreaterThanOrEqual(8);
      expect(r.top).withContext(`${guide[i].id} top`).toBeGreaterThanOrEqual(8);
      expect(r.right).withContext(`${guide[i].id} right`).toBeLessThanOrEqual(390 - 8 + 0.5);
      expect(r.bottom).withContext(`${guide[i].id} bottom`).toBeLessThanOrEqual(844 - 8 + 0.5);
      rects.slice(i + 1).forEach((other, k) =>
        expect(overlaps(r, other)).withContext(`${guide[i].id} and ${guide[i + 1 + k].id}`).toBeFalse());
      buttons.forEach((b, k) => expect(overlaps(r, b)).withContext(`${guide[i].id} over g${k + 1}`).toBeFalse());
    });
  });

  it('joins a stacked bubble to its button with a thin line that screen readers skip', () => {
    show(guide);
    const lines = leaders().filter(l => getComputedStyle(l).display !== 'none');
    expect(lines.length).withContext('lines shown on a phone').toBeGreaterThan(0);
    const row = ['#g1', '#g2', '#g3'].map(s => rectOf(fixture.nativeElement.querySelector(s)));
    lines.forEach(line => {
      const r = rectOf(line);
      expect(line.getAttribute('aria-hidden')).toBe('true');
      expect(r.width).toBeLessThanOrEqual(2);
      // It starts at the bottom of a button, under its centre.
      const start = row.find(b => Math.abs(b.left + b.width / 2 - r.left) <= 1.5);
      expect(start).withContext('line under a button centre').toBeDefined();
      expect(Math.abs(r.top - start!.bottom)).toBeLessThanOrEqual(1);
    });
  });

  it('never takes the pointer: bubbles and lines let clicks through to the controls', () => {
    show(guide);
    const targets = [...bubbles(), ...leaders().filter(l => getComputedStyle(l).display !== 'none')];
    expect(targets.length).toBeGreaterThan(guide.length);
    targets.forEach(t => {
      const r = rectOf(t);
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      expect(t.contains(hit)).withContext(t.id || t.className).toBeFalse();
    });
  });

  it('re-places the bubbles when the window is resized', () => {
    show(guide);
    const before = bubbles().map(b => b.style.left + ',' + b.style.top).join(';');
    setViewport(1280, 800);
    const after = bubbles().map(b => b.style.left + ',' + b.style.top).join(';');
    expect(after).not.toBe(before);
    const rects = bubbles().map(rectOf);
    rects.forEach((r, i) => rects.slice(i + 1).forEach(o => expect(overlaps(r, o)).toBeFalse()));
  });
});

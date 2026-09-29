import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Callout, CalloutComponent, placeCallout } from './callout.component';

// A host laid out like a side panel: an ⓘ the callout points at, and a slider
// under the layer that must stay usable.
@Component({
  template: `
    <button type="button" id="anchor" [style.position]="'fixed'"
      [style.left.px]="anchorLeft" [style.top.px]="anchorTop"
      style="width: 24px; height: 24px; margin: 0; padding: 0; border: 0">i</button>
    <input type="range" id="slider" style="position: fixed; left: 20px; top: 20px; width: 200px" />
    <app-callout [active]="active" [recomputeKey]="key"></app-callout>`
})
class HostComponent {
  active: Callout | null = null;
  key = 0;
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

  it('follows its anchor when recomputeKey changes', () => {
    show(help);
    const before = bubble()!.getBoundingClientRect().top;
    host.anchorTop = 200;
    host.key++;
    fixture.detectChanges();
    expect(bubble()!.getBoundingClientRect().top).toBeGreaterThan(before + 50);
  });

  it('never takes the pointer: the layer lets clicks through to the controls', () => {
    show(help);
    expect(getComputedStyle(layer()).pointerEvents).toBe('none');
    expect(getComputedStyle(bubble()!).pointerEvents).toBe('none');
  });

  it('is a polite live region, so a screen reader announces the help', () => {
    expect(layer().getAttribute('aria-live')).toBe('polite');
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
  });
});

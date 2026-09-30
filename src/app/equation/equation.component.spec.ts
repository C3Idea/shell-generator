import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquationComponent } from './equation.component';
import { AppStrings } from '../app-strings';

// #3: the shell equation, in MathML the browser lays out, drawn without
// needing a math font, with a spoken version for screen readers.
// Its styles start at the app-equation tag, so it's rendered through a host
// (TestBed's own host element is a <div>).
@Component({ template: `<app-equation [form]="form"></app-equation>` })
class HostComponent {
  form: 'short' | 'full' = 'short';
}

describe('EquationComponent (#3)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  function render(form: 'short' | 'full') {
    fixture.componentInstance.form = form;
    fixture.detectChanges();
  }
  const math = () => el.querySelector('math') as MathMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [ EquationComponent, HostComponent ] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    el = fixture.nativeElement;
  });

  // Each row's text, invisible operators and spaces removed ("re" is r_e).
  function rows(): string[] {
    return Array.from(el.querySelectorAll('math > mtable > mtr'))
      .map(r => (r.textContent ?? '').replace(/[\u2061\u2062\s]/g, ''));
  }

  // What is shown must be what ShellViewer.surfaceFunction() draws: any sign,
  // function or term that changes there has to change here (#3 review, M2).
  it('shows the helix + ellipse form, row by row', () => {
    render('short');
    expect(rows()).toEqual([
      'C(θ,s)=H(θ)+E(θ,s)',
      'H(θ)=Aeθcotα',                        // the A terms of surfaceFunction, times ecot
      '(senβcosθ,senβsenθ,−cosβ)',
      'E(θ,s)=eθcotαre(s)',                   // the ellipse before the φ, Ω, μ turns
      '(cosscosθ,cosssenθ,sens)',
      're(s)=1cos2s/a2+sen2s/b2',             // re = 1 / sqrt((cos s / a)² + (sin s / b)²)
    ]);
  });

  it('shows the full system exactly as surfaceFunction() computes x, y and z (D = 1 left out)', () => {
    render('full');
    expect(rows()).toEqual([
      // x = (A sinβ cosθ + re cos(s+φ) cos(θ+Ω) − re sin μ sin(s+φ) sin(θ+Ω)) · ecot
      'x(θ,s)=[Asenβcosθ+re(s)cos(s+φ)cos(θ+Ω)',
      '−re(s)sen(s+φ)senμsen(θ+Ω)]eθcotα',
      // y = (A sinβ sinθ + re cos(s+φ) sin(θ+Ω) + re sin μ sin(s+φ) cos(θ+Ω)) · ecot
      'y(θ,s)=[Asenβsenθ+re(s)cos(s+φ)sen(θ+Ω)',
      '+re(s)sen(s+φ)senμcos(θ+Ω)]eθcotα',
      // z = (−A cosβ + re sin(s+φ) cos μ) · ecot
      'z(θ,s)=[−Acosβ+re(s)sen(s+φ)cosμ]eθcotα',
    ]);
  });

  for (const form of ['short', 'full'] as const) {
    describe(form, () => {
      beforeEach(() => render(form));

      it('is one MathML block, laid out as MathML', () => {
        expect(el.querySelectorAll('math').length).toBe(1);
        expect(typeof MathMLElement !== 'undefined' && math() instanceof MathMLElement).toBeTrue();
        expect(math().getAttribute('display')).toBe('block');
        expect(math().getBoundingClientRect().height).toBeGreaterThan(0);
      });

      it('hides the MathML from screen readers and gives them the spoken version', () => {
        expect(math().getAttribute('aria-hidden')).toBe('true');
        expect(el.querySelector('.visually-hidden')?.textContent?.trim()).toBe(
          form === 'full' ? AppStrings.LABEL_INTRO_EQUATION_FULL_ALT : AppStrings.LABEL_INTRO_EQUATION_ALT);
      });

      // Without a math font, MathML's auto-italic letters (Unicode math
      // italics) draw as empty boxes; variables are italic from CSS instead.
      it('needs no math font: no auto-italic, every one-letter name is a variable in italics', () => {
        const names = Array.from(el.querySelectorAll('mi'));
        expect(names.length).toBeGreaterThan(0);
        for (const name of names) {
          expect(getComputedStyle(name).textTransform).withContext(name.textContent!).toBe('none');
          if ((name.textContent ?? '').length === 1) {
            expect(name.classList).withContext(name.textContent!).toContain('v');
            expect(getComputedStyle(name).fontStyle).toBe('italic');
          } else {
            expect(getComputedStyle(name).fontStyle).withContext(name.textContent!).toBe('normal');
          }
        }
      });

      it('uses the Spanish "sen" for the sine', () => {
        const functions = Array.from(el.querySelectorAll('mi:not(.v)')).map(m => m.textContent);
        expect(functions).toContain('sen');
        expect(functions).not.toContain('sin');
      });
    });
  }
});

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

  for (const form of ['short', 'full'] as const) {
    describe(form, () => {
      beforeEach(() => render(form));

      it('is one MathML block, laid out as MathML', () => {
        expect(el.querySelectorAll('math').length).toBe(1);
        expect(math() instanceof MathMLElement).toBeTrue();
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

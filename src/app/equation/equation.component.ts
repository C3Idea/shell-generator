import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppStrings } from '../app-strings';
import { FULL_EQUATION, SHORT_EQUATION } from './shell-equation';

// The shell equation (#3): the MathML, hidden from screen readers, and the
// spoken version they read instead (D7). 'short' is the helix + ellipse form,
// 'full' the whole Model IV system.
@Component({
  selector: 'app-equation',
  template: `<div class="equation-math" [innerHTML]="this.math"></div>` +
            `<span class="visually-hidden">{{this.spoken}}</span>`,
  styleUrls: ['./equation.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EquationComponent {
  @Input() form: 'short' | 'full' = 'short';

  private readonly short: SafeHtml;
  private readonly full: SafeHtml;

  // Trusted: both strings are constants built in shell-equation.ts. Angular's
  // sanitizer would strip MathML.
  constructor(sanitizer: DomSanitizer) {
    this.short = sanitizer.bypassSecurityTrustHtml(SHORT_EQUATION);
    this.full = sanitizer.bypassSecurityTrustHtml(FULL_EQUATION);
  }

  get math(): SafeHtml {
    return this.form === 'full' ? this.full : this.short;
  }

  get spoken(): string {
    return this.form === 'full' ? AppStrings.LABEL_INTRO_EQUATION_FULL_ALT : AppStrings.LABEL_INTRO_EQUATION_ALT;
  }
}

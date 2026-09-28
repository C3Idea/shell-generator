import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { SandboxComponent } from './sandbox.component';
import { ModalComponent } from '../modal/modal.component';
import { AppStrings } from '../app-strings';
import { FramePump, installFramePump } from '../../testing/frame-pump';

describe('SandboxComponent', () => {
  let component: SandboxComponent;
  let fixture: ComponentFixture<SandboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent ],
      providers: [ provideRouter([]) ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SandboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// #21: leaving the initial screen must stop its viewer's render loop.
// requestAnimationFrame is replaced by a manual frame pump, so pending frames
// = viewers still rendering.
describe('SandboxComponent render loop (#21)', () => {
  let frames: FramePump;

  function renderingViewers(): number {
    frames.pump();
    return frames.pending();
  }

  beforeEach(async () => {
    frames = installFramePump();
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent ],
      providers: [ provideRouter([]) ]
    }).compileComponents();
  });

  it('destroying the initial screen stops its render loop', () => {
    const fixture = TestBed.createComponent(SandboxComponent);
    fixture.detectChanges();
    expect(renderingViewers()).toBe(1);
    fixture.destroy();
    expect(renderingViewers()).withContext('viewers rendering after destroy').toBe(0);
  });

  it('destroying an initial screen that never rendered does not throw', () => {
    const unrendered = TestBed.createComponent(SandboxComponent);
    expect(() => unrendered.destroy()).not.toThrow();
  });
});

// #31: the initial screen's two pop-ups are the shared <app-modal> (a native
// <dialog>), each closed with Esc, a click on the backdrop or its header ✕.
describe('SandboxComponent pop-ups on the shared <dialog> (#31)', () => {
  let fixture: ComponentFixture<SandboxComponent>;
  let component: SandboxComponent;
  let el: HTMLElement;

  const dialog = (id: string) => el.querySelector(`#${id} > dialog`) as HTMLDialogElement;
  const intro = () => dialog('modal-intro');
  const help = () => dialog('modal-help');
  const render = () => fixture.detectChanges();
  const title = (d: HTMLDialogElement) => d.querySelector('header > h2') as HTMLElement;
  const closeX = (d: HTMLDialogElement) => d.querySelector('header > button') as HTMLButtonElement;

  // How each pop-up opens, and the flag bound to its [open].
  const popups: Record<string, { open: () => HTMLDialogElement, flag: () => boolean }> = {
    'welcome': {
      open: () => { component.introButtonClick(new Event('click')); render(); return intro(); },
      flag: () => component.introOpen },
    'parameter help': {
      open: () => { component.parameterHelpAButtonClick(new Event('click')); render(); return help(); },
      flag: () => component.helpOpen },
  };

  beforeEach(async () => {
    installFramePump();
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent ],
      providers: [ provideRouter([]) ]
    }).compileComponents();
    fixture = TestBed.createComponent(SandboxComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    render();
  });

  afterEach(() => {
    el.querySelectorAll('dialog').forEach(d => d.open && d.close());
  });

  it('renders both through <app-modal>, with no hand-built pop-up left', () => {
    for (const id of ['modal-intro', 'modal-help']) {
      expect(el.querySelector('#' + id)?.tagName).withContext(id).toBe('APP-MODAL');
      expect(dialog(id)).withContext(id).not.toBeNull();
    }
    expect(el.querySelector('[class*="modal-"][class$="-content"], .modal')).toBeNull();
  });

  it('opens the welcome pop-up on load', () => {
    expect(intro().open).toBeTrue();
    expect(intro().matches(':modal')).toBeTrue();
    expect(component.introOpen).toBeTrue();
  });

  it('keeps the welcome text as paragraphs and the equation image for #3', () => {
    expect(title(intro()).textContent?.trim()).toBe(AppStrings.LABEL_INTRO_WELCOME_TEXT);
    const lines = Array.from(intro().querySelectorAll('.label-intro-line'));
    expect(lines.map(l => l.tagName)).toEqual(['P', 'P', 'P', 'P']);
    expect(lines.map(l => l.textContent?.trim())).toEqual([
      AppStrings.LABEL_INTRO_LINE1, AppStrings.LABEL_INTRO_LINE2,
      AppStrings.LABEL_INTRO_LINE4, AppStrings.LABEL_INTRO_LINE5,
    ]);
    expect(intro().querySelector('img#img-intro-equation')).not.toBeNull();
  });

  describe('parameter help', () => {
    const helpButtons: [string, () => void, string, string][] = [
      ['A', () => component.parameterHelpAButtonClick(new Event('click')),
        AppStrings.LABEL_PARAM_A_HELP_TITLE, AppStrings.LABEL_PARAM_A_HELP_CONTENT],
      ['alpha', () => component.parameterHelpAlphaButtonClick(new Event('click')),
        AppStrings.LABEL_PARAM_ALPHA_HELP_TITLE, AppStrings.LABEL_PARAM_ALPHA_HELP_CONTENT],
      ['beta', () => component.parameterHelpBetaButtonClick(new Event('click')),
        AppStrings.LABEL_PARAM_BETA_HELP_TITLE, AppStrings.LABEL_PARAM_BETA_HELP_CONTENT],
      ['a', () => component.parameterHelpA1ButtonClick(new Event('click')),
        AppStrings.LABEL_PARAM_A1_HELP_TITLE, AppStrings.LABEL_PARAM_A1_HELP_CONTENT],
      ['b', () => component.parameterHelpBButtonClick(new Event('click')),
        AppStrings.LABEL_PARAM_B_HELP_TITLE, AppStrings.LABEL_PARAM_B_HELP_CONTENT],
      ['theta', () => component.parameterHelpThetaButtonClick(new Event('click')),
        AppStrings.LABEL_PARAM_THETA_HELP_TITLE, AppStrings.LABEL_PARAM_THETA_HELP_CONTENT],
      ['Resolución', () => component.parameterHelpQualButtonClick(new Event('click')),
        AppStrings.LABEL_PARAM_QUAL_TITLE, AppStrings.LABEL_PARAM_QUAL_CONTENT],
    ];

    for (const [name, click, expectedTitle, expectedContent] of helpButtons) {
      it(`ⓘ ${name} opens help with its own title and text`, () => {
        click();
        render();
        expect(help().open).toBeTrue();
        expect(title(help()).textContent?.trim()).toBe(expectedTitle);
        const content = help().querySelector('#label-help-content');
        expect(content?.textContent?.trim()).toBe(expectedContent);
        expect(content?.tagName).toBe('P');
      });
    }
  });

  for (const [name, { open, flag }] of Object.entries(popups)) {
    describe(name, () => {
      const closeWays: Record<string, (d: HTMLDialogElement) => void> = {
        'the ✕': d => closeX(d).click(),
        'Esc': d => d.dispatchEvent(new Event('cancel', { cancelable: true })),
        'a click on the backdrop': d => {
          d.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          d.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        },
      };

      for (const [way, close] of Object.entries(closeWays)) {
        it(`closes with ${way}`, () => {
          const d = open();
          expect(d.open).withContext('open').toBeTrue();
          close(d);
          render();
          expect(d.open).toBeFalse();
          expect(flag()).withContext('[open] flag reset by (closed)').toBeFalse();
        });
      }

      it('reopens after being closed', () => {
        const d = open();
        closeX(d).click();
        render();
        expect(d.open).toBeFalse();
        open();
        expect(d.open).toBeTrue();
      });

      it('is named by its <h2> title and has a ✕ labelled "Cerrar"', () => {
        const d = open();
        const labelledBy = d.getAttribute('aria-labelledby');
        expect(labelledBy).withContext('aria-labelledby').toBeTruthy();
        expect(title(d).id).toBe(labelledBy!);
        expect(title(d).textContent?.trim()).not.toBe('');
        expect(closeX(d).getAttribute('aria-label')).toBe(AppStrings.LABEL_CLOSE);
      });

      it('has no footer', () => {
        const d = open();
        expect(d.querySelector('footer')).toBeNull();
        const texts = Array.from(d.querySelectorAll('button')).map(b => b.textContent?.trim());
        expect(texts).not.toContain(AppStrings.LABEL_CLOSE);
      });
    });
  }
});

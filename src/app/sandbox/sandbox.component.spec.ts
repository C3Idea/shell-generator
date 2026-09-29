import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { SandboxComponent } from './sandbox.component';
import { ModalComponent } from '../modal/modal.component';
import { CalloutComponent } from '../callout/callout.component';
import { AppStrings } from '../app-strings';
import { FramePump, installFramePump } from '../../testing/frame-pump';

describe('SandboxComponent', () => {
  let component: SandboxComponent;
  let fixture: ComponentFixture<SandboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent ],
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
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent ],
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

// #31: the initial screen's pop-up is the shared <app-modal> (a native
// <dialog>), closed with Esc, a click on the backdrop or its header ✕.
// Parameter help is a callout since #6 (below).
describe('SandboxComponent pop-ups on the shared <dialog> (#31)', () => {
  let fixture: ComponentFixture<SandboxComponent>;
  let component: SandboxComponent;
  let el: HTMLElement;

  const dialog = (id: string) => el.querySelector(`#${id} > dialog`) as HTMLDialogElement;
  const intro = () => dialog('modal-intro');
  const render = () => fixture.detectChanges();
  const title = (d: HTMLDialogElement) => d.querySelector('header > h2') as HTMLElement;
  const closeX = (d: HTMLDialogElement) => d.querySelector('header > button') as HTMLButtonElement;

  // How each pop-up opens, and the flag bound to its [open].
  const popups: Record<string, { open: () => HTMLDialogElement, flag: () => boolean }> = {
    'welcome': {
      open: () => { component.introButtonClick(new Event('click')); render(); return intro(); },
      flag: () => component.introOpen },
  };

  beforeEach(async () => {
    installFramePump();
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent ],
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

  it('renders the welcome through <app-modal>, with no hand-built pop-up and no help pop-up left', () => {
    expect(el.querySelector('#modal-intro')?.tagName).toBe('APP-MODAL');
    expect(intro()).not.toBeNull();
    expect(el.querySelector('#modal-help')).withContext('#6: help is a callout').toBeNull();
    expect(el.querySelectorAll('app-modal').length).toBe(1);
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

  for (const [name, { open, flag }] of Object.entries(popups)) {
    describe(name, () => {
      const closeWays: Record<string, (d: HTMLDialogElement) => void> = {
        'the ✕': d => closeX(d).click(),
        'Esc': d => d.dispatchEvent(new Event('cancel', { cancelable: true })),
        'a click on the backdrop': d => {
          d.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          d.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
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

// #6: each parameter ⓘ shows its help in a callout beside it instead of a
// pop-up. One at a time; Esc, a click on the canvas or closing its panel
// closes it; moving a slider doesn't.
describe('SandboxComponent parameter help callouts (#6)', () => {
  let fixture: ComponentFixture<SandboxComponent>;
  let component: SandboxComponent;
  let el: HTMLElement;

  const render = () => fixture.detectChanges();
  const callouts = () => el.querySelectorAll('.callout');
  const callout = () => el.querySelector('.callout') as HTMLElement | null;
  const info = (key: string) => el.querySelector(`#${key}-help-button`) as HTMLInputElement;
  const toolbarButton = (title: string) =>
    el.querySelector(`#toolbar button[title="${title}"]`) as HTMLButtonElement;

  // [key, panel it lives in, title, text]
  const helpButtons: [string, 'shell' | 'visualization', string, string][] = [
    ['A', 'shell', AppStrings.LABEL_PARAM_A_HELP_TITLE, AppStrings.LABEL_PARAM_A_HELP_CONTENT],
    ['alpha', 'shell', AppStrings.LABEL_PARAM_ALPHA_HELP_TITLE, AppStrings.LABEL_PARAM_ALPHA_HELP_CONTENT],
    ['beta', 'shell', AppStrings.LABEL_PARAM_BETA_HELP_TITLE, AppStrings.LABEL_PARAM_BETA_HELP_CONTENT],
    ['a', 'shell', AppStrings.LABEL_PARAM_A1_HELP_TITLE, AppStrings.LABEL_PARAM_A1_HELP_CONTENT],
    ['b', 'shell', AppStrings.LABEL_PARAM_B_HELP_TITLE, AppStrings.LABEL_PARAM_B_HELP_CONTENT],
    ['theta', 'shell', AppStrings.LABEL_PARAM_THETA_HELP_TITLE, AppStrings.LABEL_PARAM_THETA_HELP_CONTENT],
    ['qual', 'visualization', AppStrings.LABEL_PARAM_QUAL_TITLE, AppStrings.LABEL_PARAM_QUAL_CONTENT],
  ];

  function openPanel(panel: 'shell' | 'visualization') {
    if (panel === 'shell') {
      component.menuButtonClick(new Event('click'));
    }
    else {
      component.visualizationMenuButtonClick(new Event('click'));
    }
    render();
  }

  function clickInfo(key: string) {
    info(key).click();
    render();
  }

  beforeEach(async () => {
    installFramePump();
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent ],
      providers: [ provideRouter([]) ]
    }).compileComponents();
    fixture = TestBed.createComponent(SandboxComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    render();
    // The welcome opens on load; close it so it isn't in the way.
    component.introOpen = false;
    render();
  });

  afterEach(() => {
    el.querySelectorAll('dialog').forEach(d => d.open && d.close());
  });

  for (const [key, panel, title, text] of helpButtons) {
    it(`ⓘ ${key} shows its own title and text in a callout, not a pop-up`, () => {
      openPanel(panel);
      clickInfo(key);
      expect(callouts().length).toBe(1);
      expect(callout()!.id).toBe(`callout-${key}`);
      expect(callout()!.querySelector('.callout-title')!.textContent!.trim()).toBe(title);
      expect(callout()!.querySelector('.callout-text')!.textContent!.trim()).toBe(text);
      expect(el.querySelector('#modal-help')).toBeNull();
      expect(Array.from(el.querySelectorAll('dialog')).some(d => d.open)).toBeFalse();
    });
  }

  it('shows the Resolución help with the typo fixed', () => {
    openPanel('visualization');
    clickInfo('qual');
    const text = callout()!.querySelector('.callout-text')!.textContent!;
    expect(text).toContain('superficie');
    expect(text).not.toContain('superfice');
  });

  it('mounts the callout outside the translucent side panels', () => {
    openPanel('shell');
    clickInfo('A');
    expect(callout()!.closest('#parameters-menu, #visualization-menu')).toBeNull();
  });

  it('shows one callout at a time: another ⓘ replaces it', () => {
    openPanel('shell');
    clickInfo('A');
    clickInfo('alpha');
    expect(callouts().length).toBe(1);
    expect(callout()!.id).toBe('callout-alpha');
  });

  it('closes when the same ⓘ is clicked again', () => {
    openPanel('shell');
    clickInfo('A');
    expect(callout()).withContext('open before closing').not.toBeNull();
    clickInfo('A');
    expect(callout()).toBeNull();
  });

  it('closes on Esc', () => {
    openPanel('shell');
    clickInfo('A');
    expect(callout()).withContext('open before closing').not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    render();
    expect(callout()).toBeNull();
  });

  it('closes on a click on the canvas', () => {
    openPanel('shell');
    clickInfo('A');
    expect(callout()).withContext('open before closing').not.toBeNull();
    el.querySelector('#canvas')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    render();
    expect(callout()).toBeNull();
  });

  it('closes when its panel is closed with the menu button', () => {
    openPanel('shell');
    clickInfo('A');
    expect(callout()).withContext('open before closing').not.toBeNull();
    toolbarButton(AppStrings.BUTTON_PARAMETERS_TITLE).click();
    render();
    expect(callout()).toBeNull();
  });

  it('closes the Resolución callout when the visualization panel closes', () => {
    openPanel('visualization');
    clickInfo('qual');
    expect(callout()).withContext('open before closing').not.toBeNull();
    openPanel('shell');
    expect(callout()).toBeNull();
  });

  it('stays open while a slider moves, and the shell updates', () => {
    openPanel('shell');
    clickInfo('A');
    const createGraph = spyOn(component.helper, 'createGraph');
    const slider = el.querySelector('#parameters-menu input[type=range]') as HTMLInputElement;
    slider.value = slider.max;
    slider.dispatchEvent(new Event('input'));
    slider.dispatchEvent(new Event('change'));
    render();
    expect(createGraph).toHaveBeenCalled();
    expect(callout()).not.toBeNull();
  });

  it('opens on click only, not on hover', () => {
    openPanel('shell');
    for (const type of ['mouseenter', 'mouseover', 'pointerenter', 'pointerover']) {
      info('A').dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    render();
    expect(callout()).toBeNull();
    clickInfo('A');
    expect(callout()).withContext('a click opens it').not.toBeNull();
  });

  it('marks each ⓘ with aria-expanded and aria-controls, and keeps focus on it', () => {
    openPanel('shell');
    for (const [key] of helpButtons) {
      expect(info(key).getAttribute('aria-expanded')).withContext(key).toBe('false');
      expect(info(key).getAttribute('aria-controls')).withContext(key).toBe(`callout-${key}`);
    }
    info('A').focus();
    clickInfo('A');
    expect(info('A').getAttribute('aria-expanded')).toBe('true');
    expect(info('alpha').getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(info('A'));
    clickInfo('A');
    expect(info('A').getAttribute('aria-expanded')).toBe('false');
  });

  it('gives each ⓘ a hit area of at least 44×44 px', () => {
    openPanel('shell');
    for (const [key, panel] of helpButtons) {
      if (panel === 'visualization') {
        openPanel('visualization');
      }
      const box = info(key).getBoundingClientRect();
      expect(box.width).withContext(`${key} width`).toBeGreaterThanOrEqual(44);
      expect(box.height).withContext(`${key} height`).toBeGreaterThanOrEqual(44);
    }
  });
});

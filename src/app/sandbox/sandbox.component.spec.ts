import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { useViewport } from '../../testing/viewport';

import { SandboxComponent } from './sandbox.component';
import { ModalComponent } from '../modal/modal.component';
import { CalloutComponent } from '../callout/callout.component';
import { EquationComponent } from '../equation/equation.component';
import { AppStrings } from '../app-strings';
import { FramePump, installFramePump } from '../../testing/frame-pump';

describe('SandboxComponent', () => {
  let component: SandboxComponent;
  let fixture: ComponentFixture<SandboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent, EquationComponent ],
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
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent, EquationComponent ],
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
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent, EquationComponent ],
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

  it('keeps the welcome text as paragraphs', () => {
    expect(title(intro()).textContent?.trim()).toBe(AppStrings.LABEL_INTRO_WELCOME_TEXT);
    const lines = Array.from(intro().querySelectorAll('.label-intro-line'));
    expect(lines.map(l => l.tagName)).toEqual(['P', 'P', 'P', 'P']);
    expect(lines.map(l => l.textContent?.trim())).toEqual([
      AppStrings.LABEL_INTRO_LINE1, AppStrings.LABEL_INTRO_LINE2,
      AppStrings.LABEL_INTRO_LINE4, AppStrings.LABEL_INTRO_LINE5,
    ]);
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

      // It closes with the ✕ only; its footer holds just "Jugar" (#3).
      it('has no Cerrar button, and only "Jugar" in its footer', () => {
        const d = open();
        const footer = Array.from(d.querySelectorAll('footer button')).map(b => b.textContent?.trim());
        expect(footer).toEqual([AppStrings.LABEL_INTRO_PLAY]);
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
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent, EquationComponent ],
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

// #6: the shell parameters panel names each parameter, fits a landscape
// phone, and the "Resolución" label no longer runs under its slider. Karma
// runs the specs in an iframe, so resizing it gives the page a real viewport.
describe('SandboxComponent panel layout (#6)', () => {
  let fixture: ComponentFixture<SandboxComponent>;
  let component: SandboxComponent;
  let el: HTMLElement;

  const render = () => fixture.detectChanges();
  const shellMenu = () => el.querySelector('#parameters-menu') as HTMLElement;
  const shellRows = () => Array.from(shellMenu().querySelectorAll('.form-row'))
    .filter(row => row.querySelector('.parameter-icon')) as HTMLElement[];
  const viewportHeight = () => document.documentElement.clientHeight;

  const viewport = useViewport();
  const setViewport = (width: number, height: number) => viewport.set(width, height);

  beforeEach(async () => {
    installFramePump();
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent, EquationComponent ],
      providers: [ provideRouter([]) ]
    }).compileComponents();
    fixture = TestBed.createComponent(SandboxComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    render();
    component.introOpen = false;
    render();
  });

  afterEach(() => {
    el.querySelectorAll('dialog').forEach(d => d.open && d.close());
  });

  it('shows each parameter\'s name as text next to its icon, labelling its slider', () => {
    component.menuButtonClick(new Event('click'));
    render();
    const rows = shellRows();
    expect(rows.length).toBe(6);
    const names = rows.map(row => row.querySelector('.parameter-name') as HTMLLabelElement | null);
    expect(names.map(n => n?.textContent?.trim())).toEqual(['A', 'α', 'β', 'a', 'b', 'θ']);
    rows.forEach((row, i) => {
      const name = names[i]!;
      const icon = row.querySelector('.parameter-icon') as HTMLElement;
      const slider = row.querySelector('input.slider') as HTMLInputElement;
      expect(name.tagName).withContext(`row ${i}`).toBe('LABEL');
      expect(name.htmlFor).withContext(`row ${i}`).toBe(slider.id);
      expect(slider.id).withContext(`row ${i}`).not.toBe('');
      expect(name.getBoundingClientRect().left).withContext(`row ${i}: name after icon`)
        .toBeGreaterThanOrEqual(icon.getBoundingClientRect().right - 1);
    });
  });

  for (const [width, height] of [[844, 390], [390, 844], [1280, 800]]) {
    it(`keeps every shell control reachable at ${width}×${height}`, () => {
      setViewport(width, height);
      component.menuButtonClick(new Event('click'));
      render();
      const menu = shellMenu();
      expect(menu.getBoundingClientRect().bottom).withContext('panel bottom')
        .toBeLessThanOrEqual(viewportHeight());
      menu.scrollTop = menu.scrollHeight;
      const last = el.querySelector('#theta-help-button') as HTMLElement;
      expect(last.getBoundingClientRect().bottom).withContext('last ⓘ after scrolling')
        .toBeLessThanOrEqual(Math.min(viewportHeight(), menu.getBoundingClientRect().bottom) + 0.5);
      // The pencil (visualization) button sits bottom-left, under the panel.
      const pencil = el.querySelector('#visualization-button') as HTMLElement;
      expect(menu.getBoundingClientRect().bottom).withContext('panel ends above the pencil button')
        .toBeLessThanOrEqual(pencil.getBoundingClientRect().top);
    });
  }

  it('shows no scrollbar on a 360 px phone when the panel fits', () => {
    setViewport(360, 800);
    component.menuButtonClick(new Event('click'));
    render();
    const menu = shellMenu();
    expect(getComputedStyle(menu).overflowY).toBe('auto');
    expect(menu.scrollHeight).withContext('fits').toBeLessThanOrEqual(menu.clientHeight);
  });

  it('keeps an open callout on its ⓘ while the panel scrolls at 844×390', () => {
    setViewport(844, 390);
    component.menuButtonClick(new Event('click'));
    render();
    const menu = shellMenu();
    menu.scrollTop = menu.scrollHeight;
    (el.querySelector('#b-help-button') as HTMLElement).click();
    render();
    const bubble = () => el.querySelector('.callout') as HTMLElement;
    const aligned = () => {
      const i = el.querySelector('#b-help-button')!.getBoundingClientRect();
      const a = bubble().querySelector('.callout-arrow')!.getBoundingClientRect();
      return Math.abs((a.top + a.height / 2) - (i.top + i.height / 2)) < 1.5;
    };
    expect(aligned()).withContext('open, scrolled to the bottom').toBeTrue();
    menu.scrollTop = menu.scrollHeight - menu.clientHeight - 60;
    menu.dispatchEvent(new Event('scroll'));
    expect(aligned()).withContext('after scrolling up 60 px').toBeTrue();
    menu.scrollTop = 0;
    menu.dispatchEvent(new Event('scroll'));
    expect(getComputedStyle(bubble()).visibility).withContext('b scrolled out of the panel').toBe('hidden');
  });

  for (const width of [390, 1280]) {
    it(`shows the whole "Resolución" label, clear of its slider, at ${width} px`, () => {
      setViewport(width, 800);
      component.visualizationMenuButtonClick(new Event('click'));
      render();
      const label = el.querySelector('#visualization-menu .parameter-label') as HTMLElement;
      const slider = el.querySelector('#visualization-menu input.slider') as HTMLElement;
      expect(label.textContent?.trim()).toBe(AppStrings.QUAL_TEXT);
      expect(label.scrollWidth).withContext('text fits its box').toBeLessThanOrEqual(label.clientWidth);
      expect(label.getBoundingClientRect().right).withContext('label ends before the slider')
        .toBeLessThanOrEqual(slider.getBoundingClientRect().left);
    });
  }
});

// #5: the "?" button turns on a guide, a callout beside every control.
describe('SandboxComponent control guide (#5)', () => {
  let fixture: ComponentFixture<SandboxComponent>;
  let component: SandboxComponent;
  let el: HTMLElement;
  let frames: FramePump;

  const render = () => fixture.detectChanges();
  const helpButton = () => el.querySelector('#help-button') as HTMLButtonElement;
  const guideBubbles = () => Array.from(el.querySelectorAll('.callout-guide')) as HTMLElement[];
  const rectOf = (e: Element) => e.getBoundingClientRect();

  // The guide's bubbles, in reading order: the toolbar left to right, the
  // 3D view, the pencil.
  const expected: [string, string][] = [
    ['guide-parameters', AppStrings.GUIDE_PARAMETERS_TITLE],
    ['guide-save-image', AppStrings.GUIDE_SAVE_IMAGE_TITLE],
    ['guide-game', AppStrings.GUIDE_GAME_TITLE],
    ['guide-intro', AppStrings.GUIDE_INTRO_TITLE],
    ['guide-help', AppStrings.GUIDE_HELP_TITLE],
    ['guide-view', AppStrings.GUIDE_VIEW_TITLE],
    ['guide-visualization', AppStrings.GUIDE_VISUALIZATION_TITLE],
  ];

  const viewport = useViewport();
  const setViewport = (width: number, height: number) => viewport.set(width, height);

  function toggleGuide() {
    helpButton().click();
    render();
  }

  beforeEach(async () => {
    frames = installFramePump();
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent, EquationComponent ],
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

  describe('the "?" button', () => {
    it('sits on its own in the upper-right corner, drawn like the toolbar icons', () => {
      const buttons = Array.from(el.querySelectorAll('#toolbar button')) as HTMLButtonElement[];
      expect(buttons.map(b => b.id)).toEqual(['parameters-button', 'save-image-button', 'game-button', 'intro-button']);
      expect(el.querySelector('#toolbar #help-button')).withContext('not in the toolbar').toBeNull();
      const gear = rectOf(buttons[0]);
      const help = rectOf(helpButton());
      expect(help.width).toBe(gear.width);
      expect(help.height).toBe(gear.height);
      expect(help.top).withContext('level with the toolbar').toBe(gear.top);
      // As far from the right edge as the gear is from the left one.
      expect(document.documentElement.clientWidth - help.right).toBeCloseTo(gear.left, 0);
      expect(helpButton().classList).toContain('toolbar-button');
      expect(helpButton().querySelector('svg rect.svg-border')).not.toBeNull();
      expect(helpButton().querySelector('svg path.svg-content')).not.toBeNull();
    });

    it('is named "Mostrar ayuda", reports the guide as not pressed, and points at its bubbles', () => {
      expect(helpButton().getAttribute('aria-label')).toBe(AppStrings.BUTTON_HELP_TITLE);
      expect(helpButton().title).toBe(AppStrings.BUTTON_HELP_TITLE);
      expect(helpButton().getAttribute('aria-pressed')).toBe('false');
      expect(helpButton().getAttribute('aria-controls')).toBe(component.guide.controls);
    });

    it('has a hit area of at least 44×44 px', () => {
      const r = rectOf(helpButton());
      expect(r.width).toBeGreaterThanOrEqual(44);
      expect(r.height).toBeGreaterThanOrEqual(44);
    });
  });

  describe('one kind of help at a time', () => {
    const shellMenu = () => el.querySelector('#parameters-menu') as HTMLElement;
    const pencilMenu = () => el.querySelector('#visualization-menu') as HTMLElement;
    const info = (key: string) => el.querySelector(`#${key}-help-button`) as HTMLInputElement;
    const singleCallout = () => el.querySelector('.callout:not(.callout-guide)');

    function guideOn() {
      toggleGuide();
      expect(guideBubbles().length).withContext('guide on first').toBe(expected.length);
    }

    function expectGuideOff() {
      expect(component.guide.on).toBeFalse();
      expect(guideBubbles().length).toBe(0);
      expect(helpButton().getAttribute('aria-pressed')).toBe('false');
    }

    it('turns off when the "?" is tapped again', () => {
      guideOn();
      toggleGuide();
      expectGuideOff();
    });

    it('turns off with Esc', () => {
      guideOn();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      render();
      expectGuideOff();
    });

    it('closes the parameters panel and its open ⓘ when it turns on', () => {
      (el.querySelector('#parameters-button') as HTMLButtonElement).click();
      render();
      info('A').click();
      render();
      expect(shellMenu().style.display).withContext('panel open first').toBe('block');
      expect(singleCallout()).withContext('ⓘ open first').not.toBeNull();
      guideOn();
      expect(shellMenu().style.display).toBe('none');
      expect(component.help.key).toBeNull();
      expect(singleCallout()).toBeNull();
    });

    it('closes the pencil panel and its open ⓘ when it turns on', () => {
      (el.querySelector('#visualization-button') as HTMLButtonElement).click();
      render();
      info('qual').click();
      render();
      expect(pencilMenu().style.display).withContext('panel open first').toBe('block');
      expect(singleCallout()).withContext('ⓘ open first').not.toBeNull();
      guideOn();
      expect(pencilMenu().style.display).toBe('none');
      expect(component.help.key).toBeNull();
      expect(singleCallout()).toBeNull();
    });

    it('turns off when the parameters panel opens', () => {
      guideOn();
      (el.querySelector('#parameters-button') as HTMLButtonElement).click();
      render();
      expectGuideOff();
      expect(shellMenu().style.display).toBe('block');
    });

    it('turns off when the pencil panel opens', () => {
      guideOn();
      (el.querySelector('#visualization-button') as HTMLButtonElement).click();
      render();
      expectGuideOff();
      expect(pencilMenu().style.display).toBe('block');
    });

    it('turns off when a parameter ⓘ opens', () => {
      guideOn();
      info('A').click();
      render();
      expectGuideOff();
      expect(component.help.key).toBe('A');
    });

    it('turns off when the welcome pop-up opens', () => {
      guideOn();
      (el.querySelector('#intro-button') as HTMLButtonElement).click();
      render();
      expectGuideOff();
      expect(component.introOpen).toBeTrue();
    });

    it('stays on while an image is saved', () => {
      spyOn(HTMLAnchorElement.prototype, 'click');
      guideOn();
      (el.querySelector('#save-image-button') as HTMLButtonElement).click();
      render();
      expect(HTMLAnchorElement.prototype.click).withContext('image saved').toHaveBeenCalled();
      expect(component.guide.on).toBeTrue();
      expect(guideBubbles().length).toBe(expected.length);
    });
  });

  describe('the 3D view while the guide is on', () => {
    const canvas = () => el.querySelector('#canvas') as HTMLCanvasElement;

    function pointer(type: string, x: number, y: number, id = 1, pointerType = 'mouse', extra: PointerEventInit = {}) {
      canvas().dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id, pointerType,
        isPrimary: id === 1, button: 0, buttons: type === 'pointerup' ? 0 : 1, ...extra,
      }));
    }

    function guideOn() {
      toggleGuide();
      expect(guideBubbles().length).withContext('guide on first').toBe(expected.length);
    }

    beforeEach(() => {
      // OrbitControls captures the pointer; a synthetic pointer can't be.
      spyOn(Element.prototype, 'setPointerCapture');
      spyOn(Element.prototype, 'releasePointerCapture');
    });

    it('turns the guide off with a tap (mouse)', () => {
      guideOn();
      pointer('pointerdown', 200, 400);
      pointer('pointerup', 200, 400);
      render();
      expect(component.guide.on).toBeFalse();
      expect(guideBubbles().length).toBe(0);
    });

    it('turns the guide off with a tap (touch), even if the finger moves a little', () => {
      guideOn();
      pointer('pointerdown', 200, 400, 7, 'touch');
      pointer('pointermove', 205, 403, 7, 'touch');
      pointer('pointerup', 205, 403, 7, 'touch');
      render();
      expect(component.guide.on).toBeFalse();
    });

    it('keeps the guide on while dragging, and the drag rotates the shell', () => {
      guideOn();
      const camera = (component.helper as unknown as { camera: { position: { clone(): { distanceTo(p: unknown): number } } } }).camera;
      const before = camera.position.clone();
      pointer('pointerdown', 200, 400);
      pointer('pointermove', 230, 400);
      pointer('pointermove', 260, 410);
      pointer('pointerup', 260, 410);
      frames.pump(2);
      render();
      expect(component.guide.on).toBeTrue();
      expect(guideBubbles().length).toBe(expected.length);
      expect(before.distanceTo(camera.position)).withContext('camera moved').toBeGreaterThan(0.01);
    });

    it("moves the 3D view's bubble with the shell once a drag ends", () => {
      guideOn();
      const marker = () => (el.querySelector('#shell-region') as HTMLElement).getBoundingClientRect();
      const before = marker();
      pointer('pointerdown', 200, 400);
      pointer('pointermove', 300, 380);
      frames.pump(2);
      pointer('pointerup', 300, 380);
      render();
      const after = marker();
      const shell = component.helper.shellScreenBox()!;
      expect([after.left, after.top, after.width, after.height])
        .withContext('marker moved').not.toEqual([before.left, before.top, before.width, before.height]);
      expect(after.left).toBeGreaterThanOrEqual(shell.left - 0.5);
      expect(after.right).toBeLessThanOrEqual(shell.left + shell.width + 0.5);
    });

    it('keeps the guide on after a right-click or middle-click on the 3D view (they pan)', () => {
      guideOn();
      for (const button of [1, 2]) {
        pointer('pointerdown', 200, 400, 1, 'mouse', { button, buttons: button === 1 ? 4 : 2 });
        pointer('pointerup', 200, 400, 1, 'mouse', { button, buttons: 0 });
      }
      render();
      expect(component.guide.on).toBeTrue();
    });

    it('still turns the guide off with a tap after a touch whose pointerup never arrived', () => {
      guideOn();
      // A finger went down and its pointerup was lost (e.g. the browser took the gesture).
      pointer('pointerdown', 150, 400, 7, 'touch', { isPrimary: true });
      // The next touch starts a new gesture: its finger is the primary one.
      pointer('pointerdown', 200, 400, 8, 'touch', { isPrimary: true });
      pointer('pointerup', 200, 400, 8, 'touch', { isPrimary: true });
      render();
      expect(component.guide.on).toBeFalse();
    });

    it('keeps the guide on while pinching with two fingers', () => {
      guideOn();
      pointer('pointerdown', 180, 400, 7, 'touch');
      pointer('pointerdown', 220, 400, 8, 'touch');
      pointer('pointermove', 178, 400, 7, 'touch');
      pointer('pointermove', 222, 400, 8, 'touch');
      pointer('pointerup', 178, 400, 7, 'touch');
      pointer('pointerup', 222, 400, 8, 'touch');
      render();
      expect(component.guide.on).toBeTrue();
    });

    it('keeps the guide on while zooming with the wheel', () => {
      guideOn();
      canvas().dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100, clientX: 200, clientY: 400 }));
      render();
      expect(component.guide.on).toBeTrue();
    });
  });

  describe('using the screen while the guide is on', () => {
    const controls = ['#parameters-button', '#save-image-button', '#game-button', '#intro-button', '#help-button', '#visualization-button'];
    const centre = (e: Element) => {
      const r = rectOf(e);
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    beforeEach(() => {
      setViewport(390, 844);
      toggleGuide();
      expect(guideBubbles().length).withContext('guide on first').toBe(expected.length);
    });

    it('leaves every control reachable: nothing of the guide sits on top of it', () => {
      controls.forEach(selector => {
        const control = el.querySelector(selector)!;
        const { x, y } = centre(control);
        const hit = document.elementFromPoint(x, y);
        expect(control.contains(hit)).withContext(selector).toBeTrue();
      });
    });

    it('lets a press on a bubble or a line through to what is under it', () => {
      const layer = el.querySelector('.callout-layer')!;
      const lines = Array.from(el.querySelectorAll('.callout-leader'))
        .filter(l => getComputedStyle(l).display !== 'none');
      expect(lines.length).withContext('lines on a phone').toBeGreaterThan(0);
      [...guideBubbles(), ...lines].forEach(target => {
        const { x, y } = centre(target);
        const hit = document.elementFromPoint(x, y)!;
        expect(layer.contains(hit)).withContext(`${target.id || 'line'} took the press`).toBeFalse();
      });
      // A bubble over the middle of the screen lets the press reach the 3D view.
      const { x, y } = centre(el.querySelector('#guide-view')!);
      expect(document.elementFromPoint(x, y)!.id).toBe('canvas');
    });

    it('still goes to the game from the gamepad', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);
      (el.querySelector('#game-button') as HTMLButtonElement).click();
      expect(router.navigate).toHaveBeenCalledWith(['game']);
    });
  });

  describe('layout', () => {
    const controls = ['#parameters-button', '#save-image-button', '#game-button', '#intro-button', '#help-button', '#visualization-button'];
    const overlaps = (a: DOMRect, b: DOMRect) =>
      a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
    const shownLines = () => (Array.from(el.querySelectorAll('.callout-leader')) as HTMLElement[])
      .filter(l => getComputedStyle(l).display !== 'none');

    function expectTidy(width: number, height: number) {
      const bubbles = guideBubbles().map(b => ({ id: b.id, r: rectOf(b) }));
      expect(bubbles.length).withContext('guide on').toBe(expected.length);
      const controlRects = controls.map(c => ({ id: c, r: rectOf(el.querySelector(c)!) }));
      bubbles.forEach(({ id, r }, i) => {
        expect(r.left).withContext(`${id} left`).toBeGreaterThanOrEqual(8 - 0.5);
        expect(r.top).withContext(`${id} top`).toBeGreaterThanOrEqual(8 - 0.5);
        expect(r.right).withContext(`${id} right`).toBeLessThanOrEqual(width - 8 + 0.5);
        expect(r.bottom).withContext(`${id} bottom`).toBeLessThanOrEqual(height - 8 + 0.5);
        bubbles.slice(i + 1).forEach(other =>
          expect(overlaps(r, other.r)).withContext(`${id} and ${other.id}`).toBeFalse());
        controlRects.forEach(c => expect(overlaps(r, c.r)).withContext(`${id} over ${c.id}`).toBeFalse());
      });
      shownLines().forEach(line => {
        const l = rectOf(line);
        bubbles.forEach(({ id, r }) => expect(overlaps(l, r)).withContext(`a line across ${id}`).toBeFalse());
      });
    }

    for (const [width, height] of [[320, 568], [338, 643], [360, 800], [390, 844], [1280, 800], [844, 390]]) {
      it(`shows the "?" on screen, clear of the other icons, at ${width}×${height}`, () => {
        setViewport(width, height);
        render();
        const help = rectOf(helpButton());
        expect(help.left).toBeGreaterThanOrEqual(0);
        expect(help.top).toBeGreaterThanOrEqual(0);
        expect(help.right).toBeLessThanOrEqual(width);
        expect(help.bottom).toBeLessThanOrEqual(height);
        controls.filter(c => c !== '#help-button').forEach(c =>
          expect(overlaps(help, rectOf(el.querySelector(c)!))).withContext(c).toBeFalse());
        // One row: the toolbar and the "?" all level with the gear.
        const top = rectOf(el.querySelector('#parameters-button')!).top;
        controls.filter(c => c !== '#visualization-button').forEach(c =>
          expect(rectOf(el.querySelector(c)!).top).withContext(`${c} on the top row`).toBe(top));
        // Still a comfortable hit area on the narrowest phones.
        controls.forEach(c => expect(rectOf(el.querySelector(c)!).width).withContext(c).toBeGreaterThanOrEqual(44));
      });

    }

    // Full phone screens and what's left of them inside a browser (its bars
    // take 100-150 px): 360×640 / 360×560 small Android, 375×553 iPhone SE in
    // Safari, 320×568 the first iPhone SE, 338×643 the owner's report.
    for (const [width, height] of [[320, 568], [338, 643], [360, 560], [360, 640], [375, 553], [360, 800], [390, 844], [1280, 800], [844, 390]]) {
      it(`keeps every bubble on screen, apart, off the controls and clear of the lines at ${width}×${height}`, () => {
        setViewport(width, height);
        toggleGuide();
        expectTidy(width, height);
      });
    }

    it('stacks the toolbar\'s bubbles in a staircase on a phone, joined by lines', () => {
      setViewport(390, 844);
      toggleGuide();
      const toolbar = ['guide-parameters', 'guide-save-image', 'guide-game', 'guide-intro', 'guide-help']
        .map(id => el.querySelector(`#${id}`) as HTMLElement);
      toolbar.forEach(b => expect(b.dataset['side']).withContext(b.id).toBe('below'));
      const tops = toolbar.map(b => rectOf(b).top);
      for (let i = 0; i < tops.length - 1; i++) {
        expect(tops[i]).withContext(`${toolbar[i].id} below ${toolbar[i + 1].id}`).toBeGreaterThan(tops[i + 1]);
      }
      expect(shownLines().length).toBe(toolbar.length);
    });

    it('re-places the bubbles when the phone turns, still tidy and still pointing at the shell', () => {
      setViewport(390, 844);
      toggleGuide();
      expectTidy(390, 844);
      setViewport(844, 390);
      render();
      expectTidy(844, 390);
      // The 3D view's bubble aims at where the shell is now, not where it was.
      const view = el.querySelector('#guide-view') as HTMLElement;
      const r = rectOf(view);
      const arrow = parseFloat(view.style.getPropertyValue('--callout-arrow'));
      const side = view.dataset['side'];
      const tip = side === 'below' ? { x: r.left + arrow, y: r.top - 9 } : side === 'above' ? { x: r.left + arrow, y: r.bottom + 9 }
        : side === 'right' ? { x: r.left - 9, y: r.top + arrow } : { x: r.right + 9, y: r.top + arrow };
      const shell = component.helper.shellScreenBox()!;
      expect(tip.x).toBeGreaterThanOrEqual(shell.left - 1);
      expect(tip.x).toBeLessThanOrEqual(shell.left + shell.width + 1);
      expect(tip.y).toBeGreaterThanOrEqual(shell.top - 1);
      expect(tip.y).toBeLessThanOrEqual(shell.top + shell.height + 1);
    });

    it('lays the guide out once per window resize', () => {
      setViewport(390, 844);
      toggleGuide();
      const callout = fixture.debugElement.query(By.directive(CalloutComponent)).componentInstance as CalloutComponent;
      const passes = spyOn(callout as unknown as { placeGuide(): void }, 'placeGuide').and.callThrough();
      window.dispatchEvent(new Event('resize'));
      render();
      expect(passes).toHaveBeenCalledTimes(1);
    });
  });

  describe('turning the guide on', () => {
    it('shows a bubble beside each control, in reading order, and reports the "?" as pressed', () => {
      expect(guideBubbles().length).withContext('before').toBe(0);
      toggleGuide();
      const bubbles = guideBubbles();
      expect(bubbles.map(b => b.id)).toEqual(expected.map(([id]) => id));
      bubbles.forEach((b, i) =>
        expect(b.querySelector('.callout-title')!.textContent!.trim()).withContext(b.id).toBe(expected[i][1]));
      expect(helpButton().getAttribute('aria-pressed')).toBe('true');
    });

    it("points the 3D view's bubble at the shell", () => {
      setViewport(390, 844);
      toggleGuide();
      const bubble = el.querySelector('#guide-view') as HTMLElement;
      expect(bubble).withContext('3D view bubble').not.toBeNull();
      const r = rectOf(bubble);
      const arrow = parseFloat(bubble.style.getPropertyValue('--callout-arrow'));
      const side = bubble.dataset['side'];
      const tip = side === 'below' ? { x: r.left + arrow, y: r.top - 9 }
        : side === 'above' ? { x: r.left + arrow, y: r.bottom + 9 }
        : side === 'right' ? { x: r.left - 9, y: r.top + arrow }
        : { x: r.right + 9, y: r.top + arrow };
      const shell = component.helper.shellScreenBox()!;
      expect(shell).withContext('shell drawn').not.toBeNull();
      expect(tip.x).toBeGreaterThanOrEqual(shell.left);
      expect(tip.x).toBeLessThanOrEqual(shell.left + shell.width);
      expect(tip.y).toBeGreaterThanOrEqual(shell.top);
      expect(tip.y).toBeLessThanOrEqual(shell.top + shell.height);
    });

    it('marks where the shell is with an invisible box that takes no pointer', () => {
      setViewport(390, 844);
      toggleGuide();
      const marker = el.querySelector('#shell-region') as HTMLElement;
      const m = rectOf(marker);
      const shell = component.helper.shellScreenBox()!;
      expect(m.width).toBeGreaterThan(0);
      expect(m.left).toBeGreaterThanOrEqual(shell.left - 0.5);
      expect(m.right).toBeLessThanOrEqual(shell.left + shell.width + 0.5);
      expect(m.top).toBeGreaterThanOrEqual(shell.top - 0.5);
      expect(m.bottom).toBeLessThanOrEqual(shell.top + shell.height + 0.5);
      expect(marker.getAttribute('aria-hidden')).toBe('true');
      expect(getComputedStyle(marker).pointerEvents).toBe('none');
    });
  });
});

// #3: the welcome pop-up's new copy, the shell equation, the credit link and
// the way into the game.
describe('SandboxComponent welcome pop-up (#3)', () => {
  let fixture: ComponentFixture<SandboxComponent>;
  let component: SandboxComponent;
  let el: HTMLElement;

  const intro = () => el.querySelector('#modal-intro > dialog') as HTMLDialogElement;
  const render = () => fixture.detectChanges();
  const text = () => intro().textContent ?? '';

  beforeEach(async () => {
    installFramePump();
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent, ModalComponent, CalloutComponent, EquationComponent ],
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

  describe('copy', () => {
    it('opens on load with the new copy, which names the game', () => {
      expect(intro().open).toBeTrue();
      for (const line of [AppStrings.LABEL_INTRO_LINE1, AppStrings.LABEL_INTRO_LINE2,
                          AppStrings.LABEL_INTRO_LINE4, AppStrings.LABEL_INTRO_LINE5]) {
        expect(text()).toContain(line);
      }
      expect(AppStrings.LABEL_INTRO_LINE5).toContain('modo juego');
    });

    it('has no equation placeholder and no empty equation image left', () => {
      expect(text()).not.toContain('Mostrar ecuación');
      expect((AppStrings as unknown as Record<string, unknown>)['LABEL_INTRO_LINE3']).toBeUndefined();
      expect(intro().querySelector('img')).toBeNull();
      expect(el.querySelector('#img-intro-equation')).toBeNull();
    });

    it('spells the copy with its accents', () => {
      expect(text()).not.toMatch(/muchisimos|fisica/);
      expect(AppStrings.LABEL_INTRO_LINE2).toContain('matemáticas');
      expect(AppStrings.LABEL_INTRO_LINE2).toContain('ecuación');
    });

    it('opens again from the book button after it was closed', () => {
      (intro().querySelector('header > button') as HTMLButtonElement).click();
      render();
      expect(intro().open).toBeFalse();
      (el.querySelector('#intro-button') as HTMLButtonElement).click();
      render();
      expect(intro().open).toBeTrue();
      expect(text()).toContain(AppStrings.LABEL_INTRO_LINE1);
    });
  });

  describe('Conoce más and Jugar', () => {
    const viewport = useViewport();
    const link = () => intro().querySelector('#intro-more-link') as HTMLAnchorElement;
    const play = () => intro().querySelector('#intro-play-button') as HTMLButtonElement;
    const onScreen = (e: Element) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight + 1 && r.right <= window.innerWidth + 1;
    };

    it('credits Atractor with a "Conoce más" link right after the equation', () => {
      expect(link().tagName).toBe('A');
      expect(link().textContent?.trim()).toBe(AppStrings.LABEL_INTRO_MORE);
      expect(intro().querySelector('#intro-equation')?.nextElementSibling).toBe(link().closest('p'));
    });

    it('opens the start of Atractor\'s shells pages in a new tab, safely', () => {
      expect(link().getAttribute('href')).toBe('https://www.atractor.pt/mat/conchas/texto1-_en.html');
      expect(link().getAttribute('target')).toBe('_blank');
      expect(link().getAttribute('rel')?.split(' ')).toContain('noopener');
      expect(link().getAttribute('aria-label')).toBe(AppStrings.LABEL_INTRO_MORE_ARIA);
    });

    it('has a "Jugar" button in the pop-up\'s footer', () => {
      expect(play().tagName).toBe('BUTTON');
      expect(play().type).toBe('button');
      expect(play().textContent?.trim()).toBe(AppStrings.LABEL_INTRO_PLAY);
      expect(play().closest('footer')).not.toBeNull();
    });

    it('"Jugar" closes the pop-up and opens the game', () => {
      const router = TestBed.inject(Router);
      const navigate = spyOn(router, 'navigate').and.resolveTo(true);
      play().click();
      render();
      expect(component.introOpen).toBeFalse();
      expect(intro().open).toBeFalse();
      expect(navigate).toHaveBeenCalledWith(['game']);
    });

    for (const [width, height] of [[320, 568], [844, 390]]) {
      it(`keeps the ✕ and "Jugar" on screen at ${width}×${height}, the text scrolling between them`, () => {
        viewport.set(width, height);
        render();
        expect(onScreen(intro().querySelector('header > button')!)).withContext('✕').toBeTrue();
        expect(onScreen(play())).withContext('Jugar').toBeTrue();
        const body = intro().querySelector('.modal-body') as HTMLElement;
        expect(getComputedStyle(body).overflowY).toMatch(/auto|scroll/);
      });
    }
  });

  describe('the equation', () => {
    const MATHML = 'http://www.w3.org/1998/Math/MathML';
    const viewport = useViewport();
    const box = () => intro().querySelector('#intro-equation') as HTMLElement;
    const short = () => intro().querySelector('#intro-equation-short') as HTMLElement;
    const full = () => intro().querySelector('#intro-equation-full') as HTMLElement;
    const toggle = () => intro().querySelector('#intro-equation-toggle') as HTMLButtonElement;
    const shown = (e: HTMLElement) => !e.hidden && e.getBoundingClientRect().height > 0;
    // The MathML's text, without its invisible operators (function
    // application, invisible times).
    const mathText = (e: HTMLElement) =>
      Array.from(e.querySelectorAll('math')).map(m => m.textContent ?? '').join(' ')
        .replace(/[\u2061\u2062]/g, '');

    it('sits right after the line that introduces it', () => {
      const lines = Array.from(intro().querySelectorAll('.label-intro-line'));
      expect(lines[1].nextElementSibling).toBe(box());
    });

    it('is written in MathML, no image and no library', () => {
      const maths = short().querySelectorAll('math');
      expect(maths.length).toBeGreaterThan(0);
      maths.forEach(m => {
        expect(m.namespaceURI).toBe(MATHML);
        expect(m instanceof MathMLElement).withContext('laid out as MathML').toBeTrue();
      });
      expect(box().querySelector('img, svg, canvas')).toBeNull();
    });

    it('shows the helix + ellipse form: C = H + E, H(θ), E(θ,s) and r_e(s)', () => {
      expect(shown(short())).toBeTrue();
      const math = mathText(short()).replace(/\s+/g, '');
      for (const piece of ['C(θ,s)', 'H(θ)', 'E(θ,s)', 'cotα', 'β', 'a', 'b']) {
        expect(math).withContext(piece).toContain(piece);
      }
      expect(math).toMatch(/r\s*e\(s\)|re\(s\)/);
    });

    it('keeps the full system collapsed at first', () => {
      expect(toggle().textContent?.trim()).toBe(AppStrings.LABEL_INTRO_EQUATION_SHOW);
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
      expect(toggle().getAttribute('aria-controls')).toBe('intro-equation-full');
      expect(full().hidden).toBeTrue();
      expect(component.fullEquationOpen).toBeFalse();
    });

    it('"Ver ecuación completa" shows the full Model IV system, with φ, Ω and μ and no D', () => {
      toggle().click();
      render();
      expect(shown(full())).toBeTrue();
      expect(toggle().textContent?.trim()).toBe(AppStrings.LABEL_INTRO_EQUATION_HIDE);
      expect(toggle().getAttribute('aria-expanded')).toBe('true');
      const math = mathText(full()).replace(/\s+/g, '');
      for (const piece of ['x(θ,s)', 'y(θ,s)', 'z(θ,s)', 'φ', 'Ω', 'μ', 'cotα']) {
        expect(math).withContext(piece).toContain(piece);
      }
      expect(math).not.toContain('D');
    });

    it('"Ocultar ecuación completa" collapses it again', () => {
      toggle().click();
      render();
      toggle().click();
      render();
      expect(full().hidden).toBeTrue();
      expect(toggle().textContent?.trim()).toBe(AppStrings.LABEL_INTRO_EQUATION_SHOW);
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
    });

    it('starts collapsed again each time the pop-up opens', () => {
      toggle().click();
      render();
      (intro().querySelector('header > button') as HTMLButtonElement).click();
      render();
      (el.querySelector('#intro-button') as HTMLButtonElement).click();
      render();
      expect(full().hidden).toBeTrue();
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
    });

    it('is a real button', () => {
      expect(toggle().tagName).toBe('BUTTON');
      expect(toggle().type).toBe('button');
    });

    describe('for a screen reader', () => {
      it('reads a spoken version instead of the MathML', () => {
        short().querySelectorAll('math').forEach(m => expect(m.getAttribute('aria-hidden')).toBe('true'));
        const alt = short().querySelector('.visually-hidden') as HTMLElement;
        expect(alt.textContent?.trim()).toBe(AppStrings.LABEL_INTRO_EQUATION_ALT);
        expect(alt.getBoundingClientRect().width).toBeLessThanOrEqual(1);
      });

      it('reads the full system\'s spoken version once expanded', () => {
        toggle().click();
        render();
        full().querySelectorAll('math').forEach(m => expect(m.getAttribute('aria-hidden')).toBe('true'));
        expect(full().querySelector('.visually-hidden')?.textContent?.trim())
          .toBe(AppStrings.LABEL_INTRO_EQUATION_FULL_ALT);
      });
    });

    it('expands without animation', () => {
      toggle().click();
      render();
      const style = getComputedStyle(full());
      expect(style.animationName).toBe('none');
      expect(parseFloat(style.transitionDuration)).toBe(0);
    });

    describe('layout', () => {
      const sizes: Array<[number, number]> = [[320, 568], [360, 640], [390, 844], [1280, 800], [844, 390]];
      const noSideScroll = (e: Element, what: string) =>
        expect(e.scrollWidth).withContext(`${what} scrolls sideways`).toBeLessThanOrEqual(e.clientWidth + 1);

      for (const expanded of [false, true]) {
        for (const [width, height] of sizes) {
          it(`never scrolls the pop-up or the page sideways at ${width}×${height}` +
             (expanded ? ', expanded' : ''), () => {
            viewport.set(width, height);
            if (expanded) {
              toggle().click();
            }
            render();
            noSideScroll(document.documentElement, 'the page');
            noSideScroll(intro(), 'the pop-up');
            noSideScroll(intro().querySelector('article')!, 'the pop-up box');
            noSideScroll(intro().querySelector('.modal-body')!, 'the pop-up body');
            const dialog = intro().getBoundingClientRect();
            expect(dialog.right).toBeLessThanOrEqual(window.innerWidth + 1);
            expect(box().getBoundingClientRect().width).toBeLessThanOrEqual(dialog.width);
            expect(getComputedStyle(box()).overflowX).toBe('auto');
          });
        }
      }
    });
  });
});

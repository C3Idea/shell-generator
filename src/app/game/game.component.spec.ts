import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { ShellParameters } from '../shell-parameters';
import { GameComponent } from './game.component';
import { AppStrings } from '../app-strings';
import { FramePump, installFramePump } from '../../testing/frame-pump';

// Configures TestBed and renders a GameComponent: the setup shared by every
// describe that needs the view. The #12 specs construct without rendering and
// keep their own configure().
async function renderGame(): Promise<ComponentFixture<GameComponent>> {
  await TestBed.configureTestingModule({
    imports: [ FormsModule ],
    declarations: [ GameComponent ],
    providers: [ provideRouter([]) ]
  }).compileComponents();
  const fixture = TestBed.createComponent(GameComponent);
  fixture.detectChanges();
  return fixture;
}

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async () => {
    fixture = await renderGame();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// #12: a shared challenge link must never start the game already won. These
// specs only construct the component (no detectChanges, so no view or WebGL):
// the link is read and the player's start is set up in the constructor.
describe('GameComponent shared challenge link (#12)', () => {
  const P = ShellParameters;

  function configure(target: string | null): void {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ GameComponent ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(target === null ? {} : { target }) } }
        }
      ]
    });
  }

  function create(): GameComponent {
    return TestBed.createComponent(GameComponent).componentInstance;
  }

  describe('decoding the link', () => {
    it('clamps every value to its slider range, including Infinity and negatives', () => {
      configure('1,99,-5,500,Infinity,-3,1000,-50,0,40');
      const t = create().targetParameters;
      expect(t.A).toBe(P.AMax);
      expect(t.alpha).toBe(P.alphaMin);
      expect(t.beta).toBe(P.betaMax);
      expect(t.a).toBe(P.aMax);
      expect(t.b).toBe(P.bMin);
      expect(t.mu).toBe(P.muMax);
      expect(t.omega).toBe(P.omegaMin);
      expect(t.phi).toBe(P.phiMin);
      expect(t.theta).toBe(P.thetaMax);
    });

    it('keeps in-range values unchanged', () => {
      configure('1,9,85,40,3,2.5,10,0,50,8');
      const t = create().targetParameters;
      expect([t.d, t.A, t.alpha, t.beta, t.a, t.b, t.mu, t.omega, t.phi, t.theta])
        .toEqual([1, 9, 85, 40, 3, 2.5, 10, 0, 50, 8]);
    });

    it('pins d (coiling direction, no slider) to 1', () => {
      configure('-1,9,85,40,3,2.5,10,0,50,8');
      expect(create().targetParameters.d).toBe(1);
    });

    for (const [label, target] of [
      ['a wrong number of values', '1,5,80,0,1,2.5,10,0,50'],
      ['a non-number', '1,5,80,abc,1,2.5,10,0,50,8'],
      ['an empty value', ''],
    ]) {
      it(`ignores a link with ${label} and starts a no-link game`, () => {
        configure(target);
        spyOn(ShellParameters, 'randomParameters').and.callThrough();
        const p = create().parameters;
        expect(ShellParameters.randomParameters).toHaveBeenCalled();
        expect([p.A, p.alpha, p.beta, p.a]).toEqual([P.AMin, P.alphaMin, P.betaMin, P.aMin]);
      });
    }
  });

  describe('the player\'s start', () => {
    // The issue's repro: a sharer who never moved A/α/β/a shares the minimums.
    const REPRO = '1,5,80,0,1,2.5,10,0,50,8';

    it('never starts a link game already won', () => {
      configure(REPRO);
      for (let i = 0; i < 25; i++) {
        const game = create();
        expect(game.checkParametersAreSimilar()).withContext(`start #${i}`).toBeFalse();
        const p = game.parameters;
        expect(p.A).toBeGreaterThanOrEqual(P.AMin); expect(p.A).toBeLessThanOrEqual(P.AMax);
        expect(p.alpha).toBeGreaterThanOrEqual(P.alphaMin); expect(p.alpha).toBeLessThanOrEqual(P.alphaMax);
        expect(p.beta).toBeGreaterThanOrEqual(P.betaMin); expect(p.beta).toBeLessThanOrEqual(P.betaMax);
        expect(p.a).toBeGreaterThanOrEqual(P.aMin); expect(p.a).toBeLessThanOrEqual(P.aMax);
      }
    });

    it('still copies μ, φ, ω, b and θ from the target', () => {
      configure(REPRO);
      const game = create();
      const p = game.parameters, t = game.targetParameters;
      expect([p.mu, p.phi, p.omega, p.b, p.theta]).toEqual([t.mu, t.phi, t.omega, t.b, t.theta]);
    });

    it('falls back to the far slider ends when every roll lands on a target at the minimums', () => {
      configure(REPRO);
      spyOn(Math, 'random').and.returnValue(0); // random(min, max) === min === the target
      const game = create();
      const p = game.parameters;
      expect([p.A, p.alpha, p.beta, p.a]).toEqual([P.AMax, P.alphaMax, P.betaMax, P.aMax]);
      expect(game.checkParametersAreSimilar()).toBeFalse();
    });

    it('falls back to the near-minimum ends when every roll lands on a target near the maximums', () => {
      configure('1,12,89,80,5.5,2.5,10,0,50,8');
      // One fraction per player slider (A, α, β, a), repeated for every attempt,
      // so each roll lands exactly on the target.
      const fractions = [(12 - P.AMin) / (P.AMax - P.AMin), (89 - P.alphaMin) / (P.alphaMax - P.alphaMin),
                         (80 - P.betaMin) / (P.betaMax - P.betaMin), (5.5 - P.aMin) / (P.aMax - P.aMin)];
      let call = 0;
      spyOn(Math, 'random').and.callFake(() => fractions[call++ % fractions.length]);
      const game = create();
      const p = game.parameters;
      expect([p.A, p.alpha, p.beta, p.a]).toEqual([P.AMin, P.alphaMin, P.betaMin, P.aMin]);
      expect(game.checkParametersAreSimilar()).toBeFalse();
    });

    it('starts a game without a link at the slider minimums', () => {
      configure(null);
      const p = create().parameters;
      expect([p.A, p.alpha, p.beta, p.a]).toEqual([P.AMin, P.alphaMin, P.betaMin, P.aMin]);
    });
  });

  describe('sharing', () => {
    it('encodes the player\'s current shell to 2 decimals, not the target', () => {
      configure(null);
      const game = create();
      Object.assign(game.parameters, { A: 11.237, alpha: 84.519, beta: 33.333, a: 2.468 });
      const link: string = (game as any)['getShareableGameLink']();
      expect(link).toContain('#/game?target=');
      const values = decodeURIComponent(link.split('target=')[1]).split(',').map(Number);
      const p = game.parameters;
      expect(values).toEqual([p.d, 11.24, 84.52, 33.33, 2.47, p.b, p.mu, p.omega, p.phi, p.theta]
        .map(v => +v.toFixed(2)));
      expect(values[1]).not.toBe(+game.targetParameters.A.toFixed(2));
    });
  });
});

// #21: the game's 3D viewers must not pile up. requestAnimationFrame is
// replaced by a manual frame pump: every live render loop schedules exactly
// one frame per pumped frame, so pending frames = viewers still rendering.
describe('GameComponent render loops (#21)', () => {
  let frames: FramePump;
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;

  function renderingViewers(): number {
    frames.pump();
    return frames.pending();
  }

  beforeEach(async () => {
    frames = installFramePump();
    fixture = await renderGame();
    component = fixture.componentInstance;
  });

  it('starts with two viewers rendering (player + target)', () => {
    expect(renderingViewers()).toBe(2);
  });

  it('New Game keeps the same two viewers instead of creating more', () => {
    const viewer = component.viewer;
    const targetViewer = component.targetViewer;
    for (let i = 0; i < 3; i++) {
      (component as any)['newGame'](`key-${i}`);
    }
    expect(component.viewer).toBe(viewer);
    expect(component.targetViewer).toBe(targetViewer);
    expect(renderingViewers()).withContext('viewers rendering after 3 New Games').toBe(2);
  });

  it('New Game puts both cameras back at the default view', () => {
    const viewers = [component.viewer, component.targetViewer];
    const defaults = viewers.map(v => (v as any)['camera'].position.clone());
    viewers.forEach(v => {
      (v as any)['camera'].position.set(-30, 5, 70);
      (v as any)['controls'].update();
    });
    (component as any)['newGame']('key');
    viewers.forEach((v, i) => {
      expect(component.viewer === v || component.targetViewer === v).withContext('same viewer after New Game').toBeTrue();
      expect((v as any)['camera'].position.distanceTo(defaults[i])).toBeLessThan(1e-6);
    });
  });

  it('destroying the game stops both render loops', () => {
    expect(renderingViewers()).toBe(2);
    fixture.destroy();
    expect(renderingViewers()).withContext('viewers rendering after destroy').toBe(0);
  });

  it('destroying a game that never rendered does not throw', () => {
    const unrendered = TestBed.createComponent(GameComponent);
    expect(() => unrendered.destroy()).not.toThrow();
  });
});

// #23: New Game opens an in-app pop-up ("Aleatorio" / "Introducir clave")
// instead of window.prompt. The view is rendered, and the frame pump keeps the
// render loops from running on their own.
describe('GameComponent New Game pop-up (#23)', () => {
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let el: HTMLElement;

  const popup = () => el.querySelector('#modal-new-game') as HTMLDivElement;
  const menu = () => el.querySelector('#parameters-menu') as HTMLFormElement;
  const shown = (e: HTMLElement) => e.style.display === 'block';
  const button = (text: string) => Array.from(popup().querySelectorAll('button'))
    .find(b => b.textContent?.trim() === text) as HTMLButtonElement;
  // A target's ten values to 2 decimals, the precision the issue compares at.
  const values = (p: ShellParameters) =>
    [p.d, p.A, p.alpha, p.beta, p.a, p.b, p.mu, p.omega, p.phi, p.theta].map(v => +v.toFixed(2));
  const target = () => values(component.targetParameters);
  let prompt: jasmine.Spy;

  beforeEach(async () => {
    installFramePump();
    // A real window.prompt would block the headless browser.
    prompt = spyOn(window, 'prompt').and.returnValue(null);
    fixture = await renderGame();
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  describe('opening', () => {
    it('Nuevo juego opens the pop-up instead of window.prompt', () => {
      component.newGameButtonClick(new Event('click'));
      expect(prompt).not.toHaveBeenCalled();
      expect(shown(popup())).toBeTrue();
    });

    it('opening from the gear menu hides the menu', () => {
      component.menuButtonClick(new Event('click'));
      expect(component.menuVisible).toBeTrue();
      component.newGameButtonClick(new Event('click'));
      expect(component.menuVisible).toBeFalse();
      expect(menu().style.display).toBe('none');
    });

    it('is an accessible dialog with a labelled key field', () => {
      const dialog = popup().querySelector('[role="dialog"]') as HTMLElement;
      expect(dialog).withContext('role="dialog"').not.toBeNull();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      const title = el.querySelector('#' + dialog.getAttribute('aria-labelledby'));
      expect(title?.textContent?.trim()).toBe(AppStrings.LABEL_NEW_GAME_POPUP_TITLE);
      const input = popup().querySelector('input[type="text"]') as HTMLInputElement;
      const label = popup().querySelector(`label[for="${input.id}"]`);
      expect(label?.textContent?.trim()).toBe(AppStrings.LABEL_GAME_KEY);
    });
  });

  describe('Aleatorio', () => {
    it('starts an unseeded game and closes the pop-up', () => {
      const newGame = spyOn(component as any, 'newGame').and.callThrough();
      component.newGameButtonClick(new Event('click'));
      button(AppStrings.LABEL_RANDOM_GAME).click();
      expect(newGame).toHaveBeenCalledTimes(1);
      expect(newGame.calls.mostRecent().args[0]).toBeUndefined();
      expect(component.gameId).toBe('');
      expect(shown(popup())).toBeFalse();
      expect(component.menuVisible).toBeFalse();
    });

    it('gives a different target each time', () => {
      component.newGameButtonClick(new Event('click'));
      button(AppStrings.LABEL_RANDOM_GAME).click();
      const first = target();
      component.newGameButtonClick(new Event('click'));
      button(AppStrings.LABEL_RANDOM_GAME).click();
      expect(target()).not.toEqual(first);
    });
  });

  describe('Introducir clave', () => {
    const keyRow = () => el.querySelector('.key-entry-row') as HTMLDivElement;
    const keyInput = () => el.querySelector('#game-key-input') as HTMLInputElement;

    function playKey(key: string, confirm: 'button' | 'enter' = 'button'): number[] {
      component.newGameButtonClick(new Event('click'));
      button(AppStrings.LABEL_ENTER_KEY).click();
      keyInput().value = key;
      if (confirm === 'enter') {
        keyInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      }
      else {
        button(AppStrings.LABEL_START_KEYED_GAME).click();
      }
      return target();
    }

    it('reveals an empty, focused key field', () => {
      component.newGameButtonClick(new Event('click'));
      expect(keyRow().style.display).toBe('none');
      button(AppStrings.LABEL_ENTER_KEY).click();
      expect(keyRow().style.display).not.toBe('none');
      expect(keyInput().value).toBe('');
      expect(document.activeElement).toBe(keyInput());
    });

    it('starts the game seeded with the key, like today\'s prompt', () => {
      const newGame = spyOn(component as any, 'newGame').and.callThrough();
      expect(playKey('reto1')).toEqual(values(ShellParameters.randomParameters('reto1')));
      expect(newGame.calls.mostRecent().args[0]).toBe('reto1');
      expect(component.gameId).toBe('reto1');
      expect(shown(popup())).toBeFalse();
    });

    it('gives the same target for the same key', () => {
      expect(playKey('reto2')).toEqual(playKey('reto2'));
    });

    it('trims the key but keeps its case', () => {
      expect(playKey(' abc ')).toEqual(playKey('abc'));
      expect(component.gameId).toBe('abc');
      expect(playKey('abc')).not.toEqual(playKey('ABC'));
    });

    it('treats an empty or whitespace-only key as random', () => {
      const newGame = spyOn(component as any, 'newGame').and.callThrough();
      const first = playKey('');
      expect(newGame.calls.mostRecent().args[0]).toBeUndefined();
      expect(component.gameId).toBe('');
      const second = playKey('   ');
      expect(newGame.calls.mostRecent().args[0]).toBeUndefined();
      expect(second).not.toEqual(first);
    });

    it('confirms with Enter', () => {
      expect(playKey('reto1', 'enter')).toEqual(values(ShellParameters.randomParameters('reto1')));
      expect(shown(popup())).toBeFalse();
    });

    it('opens empty and hidden again after a keyed game', () => {
      playKey('reto1');
      component.newGameButtonClick(new Event('click'));
      expect(keyRow().style.display).toBe('none');
      expect(keyInput().value).toBe('');
    });
  });

  describe('closing without starting a game', () => {
    const closeWays: Record<string, () => void> = {
      'the close button': () => button(AppStrings.LABEL_CLOSE).click(),
      'Esc': () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })),
      'a click on the backdrop': () => popup().dispatchEvent(new MouseEvent('mousedown', { bubbles: true })),
    };

    for (const [way, close] of Object.entries(closeWays)) {
      it(`${way} leaves the current game unchanged`, () => {
        const before = { target: target(), player: values(component.parameters), gameId: component.gameId };
        const newGame = spyOn(component as any, 'newGame').and.callThrough();
        component.newGameButtonClick(new Event('click'));
        close();
        expect(shown(popup())).toBeFalse();
        expect(newGame).not.toHaveBeenCalled();
        expect({ target: target(), player: values(component.parameters), gameId: component.gameId }).toEqual(before);
        expect(component.menuVisible).toBeFalse();
      });
    }

    it('a click inside the box does not close it', () => {
      component.newGameButtonClick(new Event('click'));
      popup().querySelector('[role="dialog"]')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      expect(shown(popup())).toBeTrue();
    });

    it('Esc with the pop-up closed leaves the other pop-ups alone', () => {
      const howTo = el.querySelector('.modal-howto-content')!.parentElement as HTMLDivElement;
      expect(shown(howTo)).withContext('how-to shown at start').toBeTrue();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(shown(howTo)).toBeTrue();
    });
  });

  describe('from ¡Victoria!', () => {
    const victory = () => el.querySelector('.modal-content')!.parentElement as HTMLDivElement;
    const jugar = () => Array.from(victory().querySelectorAll('button'))
      .find(b => b.textContent?.trim() === AppStrings.LABEL_PLAY_AGAIN) as HTMLButtonElement;

    beforeEach(() => {
      victory().style.display = 'block';
    });

    it('Jugar opens the New Game pop-up over ¡Victoria!', () => {
      jugar().click();
      expect(prompt).not.toHaveBeenCalled();
      expect(shown(popup())).toBeTrue();
      expect(shown(victory())).toBeTrue();
    });

    it('closing the pop-up goes back to ¡Victoria!', () => {
      jugar().click();
      button(AppStrings.LABEL_CLOSE).click();
      expect(shown(popup())).toBeFalse();
      expect(shown(victory())).toBeTrue();
    });

    it('starting a game closes both', () => {
      jugar().click();
      button(AppStrings.LABEL_RANDOM_GAME).click();
      expect(shown(popup())).toBeFalse();
      expect(shown(victory())).toBeFalse();
    });
  });
});


// #11: New Game and share live on the game screen (bottom-right), not inside
// the gear menu. Native dialogs are stubbed: they would block headless Chrome.
describe('GameComponent action buttons outside the gear menu (#11)', () => {
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let el: HTMLElement;

  const menu = () => el.querySelector('#parameters-menu') as HTMLFormElement;
  const actions = () => el.querySelector('#game-actions') as HTMLDivElement | null;
  const actionButton = (text: string) => Array.from(el.querySelectorAll('#game-actions button'))
    .find(b => b.textContent?.trim() === text) as HTMLButtonElement | undefined;

  beforeEach(async () => {
    installFramePump();
    spyOn(window, 'prompt').and.returnValue(null);
    spyOn(window, 'alert');
    fixture = await renderGame();
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  describe('placement', () => {
    it('shows Nuevo juego and the share button outside the gear menu', () => {
      expect(actions()).withContext('#game-actions').not.toBeNull();
      expect(menu().contains(actions())).toBeFalse();
      expect(actionButton(AppStrings.LABEL_NEW_GAME)).withContext('Nuevo juego').toBeDefined();
      expect(actionButton(AppStrings.LABEL_SHARE_GAME)).withContext('share').toBeDefined();
      for (const b of Array.from(el.querySelectorAll('#game-actions button'))) {
        expect(b.getAttribute('type')).toBe('button');
      }
    });

    it('leaves the gear menu with its sliders but no action buttons', () => {
      expect(menu().querySelector('#menu-button-row')).toBeNull();
      expect(menu().querySelectorAll('button').length).toBe(0);
      expect(menu().querySelectorAll('input.slider').length).toBe(4);
      // #15 moved the heat bar out of the menu too.
      expect(menu().querySelector('#distance-range')).toBeNull();
    });
  });

  describe('behaviour', () => {
    it('Nuevo juego opens the New Game pop-up (#23)', () => {
      actionButton(AppStrings.LABEL_NEW_GAME)!.click();
      const popup = el.querySelector('#modal-new-game') as HTMLDivElement;
      expect(popup.style.display).toBe('block');
      expect(window.prompt).not.toHaveBeenCalled();
    });

    it('the share button copies the challenge link and says so (#12)', async () => {
      const write = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
      actionButton(AppStrings.LABEL_SHARE_GAME)!.click();
      await fixture.whenStable();
      expect(write).toHaveBeenCalledTimes(1);
      expect(write.calls.mostRecent().args[0]).toContain('#/game?target=');
      expect(window.alert).toHaveBeenCalledWith(AppStrings.LABEL_LINK_COPIED);
    });

    it('the share button falls back to the prompt when copying fails', async () => {
      spyOn(navigator.clipboard, 'writeText').and.rejectWith(new Error('denied'));
      actionButton(AppStrings.LABEL_SHARE_GAME)!.click();
      await fixture.whenStable();
      expect(window.prompt).toHaveBeenCalledWith(AppStrings.LABEL_LINK_PROMPT, jasmine.stringContaining('#/game?target='));
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('is hidden while the gear menu is open', () => {
      component.menuButtonClick(new Event('click'));
      fixture.detectChanges();
      expect(actions()).withContext('menu open').toBeNull();
      component.menuButtonClick(new Event('click'));
      fixture.detectChanges();
      expect(actions()).withContext('menu closed').not.toBeNull();
    });
  });

  describe('share button copy', () => {
    it('is labelled "Compartir" with a tooltip about sharing your own shell', () => {
      const share = actionButton(AppStrings.LABEL_SHARE_GAME)!;
      expect(share.textContent?.trim()).toBe('Compartir');
      expect(share.title).toBe(AppStrings.BUTTON_SHARE_GAME_TITLE);
      expect(share.title.toLowerCase()).not.toContain('objetivo');
    });
  });
});



// #15: the heat bar lives on the game screen (bottom center), not inside the
// gear menu, and stays put while the menu is open.
describe('GameComponent heat bar outside the gear menu (#15)', () => {
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let el: HTMLElement;

  const menu = () => el.querySelector('#parameters-menu') as HTMLFormElement;
  const bar = () => el.querySelector('#result-container') as HTMLDivElement;
  const range = () => el.querySelector('#distance-range') as HTMLInputElement;
  const toggleMenu = () => {
    component.menuButtonClick(new Event('click'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    installFramePump();
    fixture = await renderGame();
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  describe('placement', () => {
    it('renders the bar, with its ✗ and ✓, outside the gear menu', () => {
      expect(bar()).withContext('#result-container').not.toBeNull();
      expect(menu().contains(bar())).toBeFalse();
      expect(bar().contains(range())).toBeTrue();
      expect(bar().querySelectorAll('img.result-image').length).toBe(2);
    });

    it('is a fixed control shown with the gear menu closed', () => {
      const style = getComputedStyle(bar());
      expect(style.position).toBe('fixed');
      expect(style.display).not.toBe('none');
      expect(bar().getBoundingClientRect().width).toBeGreaterThan(0);
    });

    it('stays shown, in the same place, while the gear menu is open', () => {
      const closed = bar().getBoundingClientRect();
      toggleMenu();
      expect(getComputedStyle(menu()).display).withContext('menu open').toBe('block');
      const open = bar().getBoundingClientRect();
      expect(getComputedStyle(bar()).display).not.toBe('none');
      expect([open.left, open.top, open.width]).toEqual([closed.left, closed.top, closed.width]);
    });

    it('sits below the pop-ups', () => {
      const modal = el.querySelector('.modal') as HTMLDivElement;
      expect(Number(getComputedStyle(bar()).zIndex)).toBeLessThan(Number(getComputedStyle(modal).zIndex));
    });
  });

  describe('behaviour', () => {
    it('updates when a parameter slider is released', async () => {
      toggleMenu();
      await fixture.whenStable();
      const before = component.distance;
      const beta = menu().querySelectorAll('input.slider')[2] as HTMLInputElement;
      // Move the player's β to the far end: the player starts at betaMin, so
      // choosing by the target's β would sometimes leave it where it was.
      beta.value = component.parameters.beta > 42 ? '0' : '85';
      beta.dispatchEvent(new Event('input'));
      beta.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.distance).not.toBe(before);
      expect(Math.abs(Number(range().value) - component.distance)).toBeLessThanOrEqual(0.5);
    });

    it('stays shown in the Objetivo view', () => {
      component.targetVisible = true;
      component.switchButtonClick(new Event('change'));
      fixture.detectChanges();
      // If the bar moved back into the (hidden) gear menu, its own display
      // would still read 'flex', so check it has a size and isn't in the menu.
      expect(menu().contains(bar())).toBeFalse();
      expect(bar().getBoundingClientRect().width).toBeGreaterThan(0);
    });
  });

  describe('copy', () => {
    it('labels the bar for screen readers', () => {
      expect(range().getAttribute('aria-label')).toBe('Qué tan cerca estás del objetivo');
    });

    it('the welcome text points at the bottom of the screen', () => {
      const line3 = el.querySelectorAll('.label-howto-line')[2] as HTMLLabelElement;
      expect(AppStrings.LABEL_HOWTO_WINDOW_LINE3).toBe(
        'En la parte inferior de la pantalla encontrarás una barra de calor que te indica qué tan cerca estás de lograrlo.');
      expect(line3.textContent?.trim()).toBe(AppStrings.LABEL_HOWTO_WINDOW_LINE3);
    });
  });
});

// #28: the heat bar reads the normalized distance (0 = ✓, 100 = ✗); the win
// check keeps its own per-parameter thresholds. Every spec sets the target and
// the attempt explicitly.
describe('GameComponent heat bar scale (#28)', () => {
  const P = ShellParameters;
  const shell = (values: Partial<Record<keyof ShellParameters, number>> = {}) =>
    Object.assign(new ShellParameters(), values);

  // Constructs without rendering (no view or WebGL), with no link, so the
  // player starts at the slider minimums against the given target.
  function createAgainst(target: ShellParameters): GameComponent {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ GameComponent ],
      providers: [ provideRouter([]) ]
    });
    spyOn(ShellParameters, 'randomParameters').and.returnValue(target);
    return TestBed.createComponent(GameComponent).componentInstance;
  }

  describe('a new game from the slider minimums', () => {
    for (const [label, target, expected] of [
      ['at the minimums', shell(), 0],
      ['at the midpoints', shell({ A: 9, alpha: 85, beta: 42.5, a: 3.5 }), 50],
      ['at the maximums', shell({ A: P.AMax, alpha: P.alphaMax, beta: P.betaMax, a: P.aMax }), 100],
    ] as const) {
      it(`reads between 0 and 100 for a target ${label}`, () => {
        const game = createAgainst(target);
        expect(game.distance).toBeGreaterThanOrEqual(P.distMin);
        expect(game.distance).toBeLessThanOrEqual(P.distMax);
        expect(game.distance).toBeCloseTo(expected, 6);
      });
    }
  });

  // Pins today's thresholds (A 1.5, α 1.5, β 8, a 1) so a change to the bar
  // can't quietly change when the player wins.
  describe('the win check', () => {
    const target = shell({ A: 9, alpha: 85, beta: 40, a: 3.5, b: 3.5, theta: 9 });
    const inside = { A: 1.4, alpha: 1.4, beta: 7.9, a: 0.9 };
    const outside = { A: 1.6, alpha: 1.6, beta: 8.1, a: 1.1 };
    const attempt = (offsets: Partial<Record<keyof typeof inside, number>>) => {
      const game = createAgainst(target);
      for (const key of P.playedParameterKeys) {
        game.parameters[key] = target[key] + (offsets[key] ?? 0);
      }
      return game;
    };

    it('wins with every played parameter just inside its threshold', () => {
      expect(attempt(inside).checkParametersAreSimilar()).toBeTrue();
    });

    for (const key of P.playedParameterKeys) {
      it(`doesn't win with ${key} just outside its threshold`, () => {
        expect(attempt({ ...inside, [key]: outside[key] }).checkParametersAreSimilar()).toBeFalse();
      });
    }
  });

  describe('on the game screen', () => {
    let fixture: ComponentFixture<GameComponent>;
    let component: GameComponent;
    let el: HTMLElement;

    beforeEach(async () => {
      installFramePump();
      fixture = await renderGame();
      component = fixture.componentInstance;
      el = fixture.nativeElement;
    });

    it('shows the rescaled value after a slider release', async () => {
      // Target and player both at the minimums, so only β will differ.
      component.targetParameters = shell();
      component.parameters = shell();
      component.menuButtonClick(new Event('click'));
      fixture.detectChanges();
      await fixture.whenStable();
      const beta = el.querySelectorAll('#parameters-menu input.slider')[2] as HTMLInputElement;
      beta.value = String(P.betaMax);
      beta.dispatchEvent(new Event('input'));
      beta.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();
      // β across its whole range is one of four parameters fully off: 50, not the raw 85.
      expect(component.parameters.beta).toBe(P.betaMax);
      expect(component.distance).toBeCloseTo(50, 6);
      expect(Number((el.querySelector('#distance-range') as HTMLInputElement).value)).toBe(50);
    });
  });
});

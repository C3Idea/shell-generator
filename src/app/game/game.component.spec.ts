import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { useViewport } from '../../testing/viewport';

import { ShellParameters } from '../shell-parameters';
import { GameComponent } from './game.component';
import { ModalComponent } from '../modal/modal.component';
import { CalloutComponent } from '../callout/callout.component';
import { AppStrings } from '../app-strings';
import { FramePump, installFramePump } from '../../testing/frame-pump';

// Configures TestBed and renders a GameComponent: the setup shared by every
// describe that needs the view. The #12 specs construct without rendering and
// keep their own configure().
async function renderGame(): Promise<ComponentFixture<GameComponent>> {
  await TestBed.configureTestingModule({
    imports: [ FormsModule ],
    declarations: [ GameComponent, ModalComponent, CalloutComponent ],
    providers: [ provideRouter([]) ]
  }).compileComponents();
  const fixture = TestBed.createComponent(GameComponent);
  fixture.detectChanges();
  return fixture;
}

// The share link's values in their wire order (d, A, α, β, a, b, μ, ω, φ, θ),
// to 2 decimals. Written out here, not read from the component, so a change to
// the link format fails the share specs (#39).
function encodeObjetivo(p: ShellParameters): number[] {
  return [p.d, p.A, p.alpha, p.beta, p.a, p.b, p.mu, p.omega, p.phi, p.theta].map(v => +v.toFixed(2));
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
      declarations: [ GameComponent, ModalComponent, CalloutComponent ],
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

  // #39 reverses #12's choice: the link carries the objetivo (golden shell),
  // not the player's.
  describe('sharing', () => {
    const linkOf = (game: GameComponent): string => (game as any)['getShareableGameLink']();
    const targetOf = (link: string): string => decodeURIComponent(link.split('target=')[1]);
    const valuesOf = (link: string): number[] => targetOf(link).split(',').map(Number);

    it('encodes the objetivo to 2 decimals, not the player\'s shell', () => {
      configure(null);
      const game = create();
      Object.assign(game.targetParameters, { A: 11.237, alpha: 84.519, beta: 33.333, a: 2.468 });
      const link = linkOf(game);
      expect(link).toContain('#/game?target=');
      const values = valuesOf(link);
      expect(values).toEqual(encodeObjetivo(game.targetParameters));
      expect(values.slice(1, 5)).toEqual([11.24, 84.52, 33.33, 2.47]);
      expect(values[1]).not.toBe(+game.parameters.A.toFixed(2));
    });

    it('gives the same link however the sliders move', () => {
      configure(null);
      const game = create();
      const before = linkOf(game);
      const start = [game.parameters.A, game.parameters.alpha, game.parameters.beta, game.parameters.a];
      Object.assign(game.parameters, { A: P.AMax, alpha: P.alphaMax, beta: P.betaMax, a: P.aMax });
      expect([game.parameters.A, game.parameters.alpha, game.parameters.beta, game.parameters.a])
        .withContext('the sliders moved').not.toEqual(start);
      expect(linkOf(game)).toBe(before);
    });

    it('opens on the sender\'s objetivo, from a start that doesn\'t win', () => {
      configure(null);
      const sender = create();
      const link = linkOf(sender);
      TestBed.resetTestingModule();
      configure(targetOf(link));
      const recipient = create();
      expect(encodeObjetivo(recipient.targetParameters)).toEqual(encodeObjetivo(sender.targetParameters));
      expect(recipient.checkParametersAreSimilar()).toBeFalse();
      // The heat bar reads this distance: it's measured against the objetivo.
      expect(recipient.distance).toBe(recipient.parameters.distance(recipient.targetParameters));
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

  const popup = () => el.querySelector('#modal-new-game > dialog') as HTMLDialogElement;
  const menu = () => el.querySelector('#parameters-menu') as HTMLFormElement;
  // #31: pop-ups are <dialog>s driven by [open], so render before looking.
  const shown = (d: HTMLDialogElement) => {
    fixture.detectChanges();
    return d.open;
  };
  const button = (text: string) => Array.from(popup().querySelectorAll('button'))
    .find(b => b.textContent?.trim() === text) as HTMLButtonElement;
  const closeX = (d: HTMLDialogElement) => d.querySelector('header button') as HTMLButtonElement;
  // Nuevo juego, rendered as the app does after the click.
  const openPopup = () => {
    component.newGameButtonClick(new Event('click'));
    fixture.detectChanges();
  };
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
      openPopup();
      expect(prompt).not.toHaveBeenCalled();
      expect(shown(popup())).toBeTrue();
    });

    it('opening from the gear menu hides the menu', () => {
      component.menuButtonClick(new Event('click'));
      expect(component.menuVisible).toBeTrue();
      openPopup();
      expect(component.menuVisible).toBeFalse();
      expect(menu().style.display).toBe('none');
    });

    it('is an accessible dialog with a labelled key field', () => {
      openPopup();
      expect(shown(popup())).toBeTrue();
      const dialog = popup();
      expect(dialog.matches(':modal')).withContext('modal <dialog>').toBeTrue();
      const title = dialog.querySelector('#' + dialog.getAttribute('aria-labelledby'));
      expect(title?.textContent?.trim()).toBe(AppStrings.LABEL_NEW_GAME_POPUP_TITLE);
      const input = popup().querySelector('input[type="text"]') as HTMLInputElement;
      const label = popup().querySelector(`label[for="${input.id}"]`);
      expect(label?.textContent?.trim()).toBe(AppStrings.LABEL_GAME_KEY);
    });
  });

  describe('Aleatorio', () => {
    it('starts an unseeded game and closes the pop-up', () => {
      const newGame = spyOn(component as any, 'newGame').and.callThrough();
      openPopup();
      button(AppStrings.LABEL_RANDOM_GAME).click();
      expect(newGame).toHaveBeenCalledTimes(1);
      expect(newGame.calls.mostRecent().args[0]).toBeUndefined();
      expect(component.gameId).toBe('');
      expect(shown(popup())).toBeFalse();
      expect(component.menuVisible).toBeFalse();
    });

    it('gives a different target each time', () => {
      openPopup();
      button(AppStrings.LABEL_RANDOM_GAME).click();
      const first = target();
      openPopup();
      button(AppStrings.LABEL_RANDOM_GAME).click();
      expect(target()).not.toEqual(first);
    });
  });

  describe('Introducir clave', () => {
    const keyRow = () => el.querySelector('.key-entry-row') as HTMLDivElement;
    const keyInput = () => el.querySelector('#game-key-input') as HTMLInputElement;

    function playKey(key: string, confirm: 'button' | 'enter' = 'button'): number[] {
      openPopup();
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
      openPopup();
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
      openPopup();
      expect(keyRow().style.display).toBe('none');
      expect(keyInput().value).toBe('');
    });
  });

  describe('closing without starting a game', () => {
    const closeWays: Record<string, () => void> = {
      'the ✕': () => closeX(popup()).click(),
      // The browser turns Esc into a cancel event on the top dialog.
      'Esc': () => popup().dispatchEvent(new Event('cancel', { cancelable: true })),
      'a click on the backdrop': () => {
        popup().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        popup().dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        popup().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      },
    };

    for (const [way, close] of Object.entries(closeWays)) {
      it(`${way} leaves the current game unchanged`, () => {
        const before = { target: target(), player: values(component.parameters), gameId: component.gameId };
        const newGame = spyOn(component as any, 'newGame').and.callThrough();
        openPopup();
        expect(shown(popup())).toBeTrue();
        close();
        expect(shown(popup())).toBeFalse();
        expect(component.newGameOpen).toBeFalse();
        expect(newGame).not.toHaveBeenCalled();
        expect({ target: target(), player: values(component.parameters), gameId: component.gameId }).toEqual(before);
        expect(component.menuVisible).toBeFalse();
      });
    }

    it('a click inside the box does not close it', () => {
      openPopup();
      expect(shown(popup())).toBeTrue();
      const title = popup().querySelector('h2') as HTMLElement;
      title.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      title.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      title.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(shown(popup())).toBeTrue();
    });

    it('Esc on the pop-up leaves the how-to under it open', () => {
      const howTo = el.querySelector('#modal-howto > dialog') as HTMLDialogElement;
      expect(shown(howTo)).withContext('how-to shown at start').toBeTrue();
      openPopup();
      expect(shown(popup())).toBeTrue();
      popup().dispatchEvent(new Event('cancel', { cancelable: true }));
      expect(shown(popup())).toBeFalse();
      expect(shown(howTo)).toBeTrue();
    });
  });

  describe('from ¡Victoria!', () => {
    const victory = () => el.querySelector('#modal-victory > dialog') as HTMLDialogElement;
    const jugar = () => Array.from(victory().querySelectorAll('button'))
      .find(b => b.textContent?.trim() === AppStrings.LABEL_PLAY_AGAIN) as HTMLButtonElement;

    beforeEach(() => {
      component.victoryOpen = true;
      fixture.detectChanges();
    });

    it('Jugar opens the New Game pop-up over ¡Victoria!', () => {
      jugar().click();
      fixture.detectChanges();
      expect(prompt).not.toHaveBeenCalled();
      expect(shown(popup())).toBeTrue();
      expect(shown(victory())).toBeTrue();
    });

    it('closing the pop-up goes back to ¡Victoria!', () => {
      jugar().click();
      fixture.detectChanges();
      expect(shown(popup())).toBeTrue();
      closeX(popup()).click();
      expect(shown(popup())).toBeFalse();
      expect(shown(victory())).toBeTrue();
    });

    it('starting a game closes both', () => {
      jugar().click();
      fixture.detectChanges();
      expect(shown(popup())).toBeTrue();
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
  // The objetivo's query, built here so the share specs check which shell the
  // link carries (#39), not only its prefix.
  const objetivoQuery = () => '#/game?target=' + encodeURIComponent(encodeObjetivo(component.targetParameters).join(','));

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
      fixture.detectChanges();
      const popup = el.querySelector('#modal-new-game > dialog') as HTMLDialogElement;
      expect(popup.open).toBeTrue();
      expect(window.prompt).not.toHaveBeenCalled();
    });

    it('the share button copies the challenge link and says so (#12)', async () => {
      const write = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
      actionButton(AppStrings.LABEL_SHARE_GAME)!.click();
      await fixture.whenStable();
      expect(write).toHaveBeenCalledTimes(1);
      expect(write.calls.mostRecent().args[0]).toContain(objetivoQuery());
      expect(window.alert).toHaveBeenCalledWith(AppStrings.LABEL_LINK_COPIED);
    });

    it('the share button falls back to the prompt when copying fails', async () => {
      spyOn(navigator.clipboard, 'writeText').and.rejectWith(new Error('denied'));
      actionButton(AppStrings.LABEL_SHARE_GAME)!.click();
      await fixture.whenStable();
      expect(window.prompt).toHaveBeenCalledWith(AppStrings.LABEL_LINK_PROMPT, jasmine.stringContaining(objetivoQuery()));
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
    it('is labelled "Compartir" with a tooltip about sharing the objetivo (#39)', () => {
      const share = actionButton(AppStrings.LABEL_SHARE_GAME)!;
      expect(share.textContent?.trim()).toBe('Compartir');
      expect(share.title).toBe(AppStrings.BUTTON_SHARE_GAME_TITLE);
      expect(share.title).toBe('Copiar enlace para retar con el caracol objetivo');
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

    // #31: pop-ups are modal <dialog>s in the top layer, over everything.
    it('sits below the pop-ups', () => {
      const howTo = el.querySelector('#modal-howto > dialog') as HTMLDialogElement;
      expect(howTo.open).withContext('how-to open at start').toBeTrue();
      const r = bar().getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      expect(hit).withContext('the bar\'s centre is inside the test viewport').not.toBeNull();
      expect(howTo.contains(hit)).withContext('the backdrop covers the bar').toBeTrue();
      expect(bar().contains(hit)).toBeFalse();
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

    // The how-to names the bar by its guide title, not by where it sits (#10).
    it('the how-to explains the bar in its Progreso section', () => {
      const progress = el.querySelector('#howto-progress') as HTMLElement;
      expect(progress.querySelector('strong')?.textContent?.trim()).toBe(AppStrings.GUIDE_GAME_HEAT_TITLE);
      expect(progress.textContent).toContain(AppStrings.LABEL_HOWTO_PROGRESS);
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
      declarations: [ GameComponent, ModalComponent, CalloutComponent ],
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

// #31: the game's pop-ups are the shared <app-modal> (a native <dialog>),
// each closed with Esc, a click on the backdrop or its header ✕. Parameter
// help is a callout since #6 (below).
describe('GameComponent pop-ups on the shared <dialog> (#31)', () => {
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let el: HTMLElement;

  const dialog = (id: string) => el.querySelector(`#${id} > dialog`) as HTMLDialogElement;
  const victory = () => dialog('modal-victory');
  const newGame = () => dialog('modal-new-game');
  const howTo = () => dialog('modal-howto');
  const render = () => fixture.detectChanges();
  const title = (d: HTMLDialogElement) => d.querySelector('header > h2') as HTMLElement;
  const closeX = (d: HTMLDialogElement) => d.querySelector('header > button') as HTMLButtonElement;

  // The player copies every compared parameter of the target: a win.
  function win() {
    Object.assign(component.parameters, component.targetParameters);
    component.checkGameIsOver();
    render();
  }

  // The pop-up drawn at a point, found by what the browser hit-tests there.
  function dialogAt(d: HTMLDialogElement): HTMLDialogElement | null {
    const r = d.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    expect(hit).withContext('the pop-up\'s centre is inside the test viewport').not.toBeNull();
    return hit?.closest('dialog') ?? null;
  }

  // How each pop-up opens, and the flag bound to its [open].
  const popups: Record<string, { open: () => HTMLDialogElement, flag: () => boolean }> = {
    '¡Victoria!': {
      open: () => { win(); return victory(); },
      flag: () => component.victoryOpen },
    'Nuevo juego': {
      open: () => { component.newGameButtonClick(new Event('click')); render(); return newGame(); },
      flag: () => component.newGameOpen },
    'how-to': {
      open: () => { component.howToButtonClick(new Event('click')); render(); return howTo(); },
      flag: () => component.howToOpen },
  };

  beforeEach(async () => {
    installFramePump();
    spyOn(window, 'prompt').and.returnValue(null);
    fixture = await renderGame();
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  afterEach(() => {
    el.querySelectorAll('dialog').forEach(d => d.open && d.close());
  });

  it('renders all three through <app-modal>, with no hand-built pop-up and no help pop-up left', () => {
    for (const id of ['modal-victory', 'modal-new-game', 'modal-howto']) {
      const host = el.querySelector('#' + id);
      expect(host?.tagName).withContext(id).toBe('APP-MODAL');
      expect(dialog(id)).withContext(id).not.toBeNull();
    }
    expect(el.querySelector('#modal-help')).withContext('#6: help is a callout').toBeNull();
    expect(el.querySelectorAll('app-modal').length).toBe(3);
    expect(el.querySelector('[class*="modal-"][class$="-content"], .modal-content, .modal')).toBeNull();
  });

  it('opens the how-to on load, over the game', () => {
    expect(howTo().open).toBeTrue();
    expect(howTo().matches(':modal')).toBeTrue();
    expect(component.howToOpen).toBeTrue();
  });

  it('keeps the how-to text as paragraphs', () => {
    const body = howTo().querySelector('.modal-body')!;
    const paragraphs = Array.from(body.children);
    expect(paragraphs.length).toBeGreaterThan(0);
    paragraphs.forEach(p => expect(p.tagName).toBe('P'));
  });

  describe('¡Victoria!', () => {
    it('opens on a win with Sandbox then Jugar in its footer', () => {
      expect(victory().open).toBeFalse();
      win();
      expect(victory().open).toBeTrue();
      const buttons = Array.from(victory().querySelectorAll('footer button'));
      expect(buttons.map(b => b.textContent?.trim())).toEqual([AppStrings.LABEL_GO_HOME, AppStrings.LABEL_PLAY_AGAIN]);
      expect(buttons[0].classList).toContain('secondary');
      expect(buttons[1].classList).not.toContain('secondary');
    });

    it('stays open, without an error, when the win check runs again', () => {
      win();
      const showModal = spyOn(victory(), 'showModal').and.callThrough();
      expect(() => { component.checkGameIsOver(); render(); component.checkGameIsOver(); render(); }).not.toThrow();
      expect(showModal).not.toHaveBeenCalled();
      expect(victory().open).toBeTrue();
    });

    it('centres its title and buttons, with the ✕ still at the right', () => {
      win();
      const header = title(victory()).getBoundingClientRect();
      const box = victory().getBoundingClientRect();
      const centre = (r: DOMRect) => r.left + r.width / 2;
      expect(getComputedStyle(title(victory())).textAlign).toBe('center');
      expect(Math.abs(centre(header) - centre(box))).toBeLessThan(1);
      const buttons = Array.from(victory().querySelectorAll('footer button')).map(b => b.getBoundingClientRect());
      const row = { left: Math.min(...buttons.map(b => b.left)), right: Math.max(...buttons.map(b => b.right)) };
      expect(Math.abs((row.left + row.right) / 2 - centre(box))).toBeLessThan(1);
      expect(closeX(victory()).getBoundingClientRect().right).toBeGreaterThan(box.right - 40);
    });

    it('opens on top of the how-to', () => {
      expect(howTo().open).withContext('how-to open at start').toBeTrue();
      win();
      expect(dialogAt(victory())).toBe(victory());
    });

    // A win on load opens both in the same pass: each <app-modal> calls
    // showModal() in template order, so ¡Victoria! must come after the how-to.
    it('is on top of the how-to when both open on load', () => {
      fixture.destroy();
      const loaded = TestBed.createComponent(GameComponent);
      Object.assign(loaded.componentInstance.parameters, loaded.componentInstance.targetParameters);
      loaded.detectChanges();
      el = loaded.nativeElement;
      expect(howTo().open).withContext('how-to open').toBeTrue();
      expect(victory().open).withContext('¡Victoria! open').toBeTrue();
      expect(dialogAt(victory())).toBe(victory());
      loaded.destroy();
    });
  });

  describe('Nuevo juego', () => {
    it('focuses its first choice on open', () => {
      popups['Nuevo juego'].open();
      const first = newGame().querySelector('.new-game-choices button') as HTMLButtonElement;
      expect(first.textContent?.trim()).toBe(AppStrings.LABEL_RANDOM_GAME);
      expect(document.activeElement).toBe(first);
    });
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

      it('has no footer "Cerrar" button', () => {
        const d = open();
        const texts = Array.from(d.querySelectorAll('button')).map(b => b.textContent?.trim());
        expect(texts).not.toContain(AppStrings.LABEL_CLOSE);
      });
    });
  }
});

// #6: the game's four parameter ⓘ show their help in a callout beside them,
// like the initial screen's. One at a time; Esc, a click on the canvas or
// closing the menu closes it; moving a slider doesn't.
describe('GameComponent parameter help callouts (#6)', () => {
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let el: HTMLElement;

  const render = () => fixture.detectChanges();
  const callouts = () => el.querySelectorAll('.callout');
  const callout = () => el.querySelector('.callout') as HTMLElement | null;
  const info = (key: string) => el.querySelector(`#${key}-help-button`) as HTMLInputElement;
  const helpButtons: [string, string, string][] = [
    ['A', AppStrings.LABEL_PARAM_A_HELP_TITLE, AppStrings.LABEL_PARAM_A_HELP_CONTENT],
    ['alpha', AppStrings.LABEL_PARAM_ALPHA_HELP_TITLE, AppStrings.LABEL_PARAM_ALPHA_HELP_CONTENT],
    ['beta', AppStrings.LABEL_PARAM_BETA_HELP_TITLE, AppStrings.LABEL_PARAM_BETA_HELP_CONTENT],
    ['a', AppStrings.LABEL_PARAM_A1_HELP_TITLE, AppStrings.LABEL_PARAM_A1_HELP_CONTENT],
  ];

  function openMenu() {
    component.menuButtonClick(new Event('click'));
    render();
  }

  function clickInfo(key: string) {
    info(key).click();
    render();
  }

  beforeEach(async () => {
    installFramePump();
    fixture = await renderGame();
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    // The how-to opens on load; close it so it isn't in the way.
    component.howToOpen = false;
    render();
  });

  afterEach(() => {
    el.querySelectorAll('dialog').forEach(d => d.open && d.close());
  });

  // #3: the shared help for a names the ellipse's horizontal axis.
  it('ⓘ a describes the horizontal axis (#3)', () => {
    openMenu();
    clickInfo('a');
    const shown = callout()?.textContent ?? '';
    expect(shown).toContain('horizontal');
    expect(shown).not.toContain('vertical');
  });

  for (const [key, title, text] of helpButtons) {
    it(`ⓘ ${key} shows its own title and text in a callout, not a pop-up`, () => {
      openMenu();
      clickInfo(key);
      expect(callouts().length).toBe(1);
      expect(callout()!.id).toBe(`callout-${key}`);
      expect(callout()!.querySelector('.callout-title')!.textContent!.trim()).toBe(title);
      expect(callout()!.querySelector('.callout-text')!.textContent!.trim()).toBe(text);
      expect(el.querySelector('#modal-help')).toBeNull();
      expect(Array.from(el.querySelectorAll('dialog')).some(d => d.open)).toBeFalse();
    });
  }

  it('mounts the callout outside the translucent menu', () => {
    openMenu();
    clickInfo('A');
    expect(callout()!.closest('#parameters-menu')).toBeNull();
  });

  it('shows one callout at a time, and the same ⓘ closes it', () => {
    openMenu();
    clickInfo('A');
    expect(callout()).withContext('open before closing').not.toBeNull();
    clickInfo('beta');
    expect(callouts().length).toBe(1);
    expect(callout()!.id).toBe('callout-beta');
    clickInfo('beta');
    expect(callout()).toBeNull();
  });

  it('closes on Esc', () => {
    openMenu();
    clickInfo('A');
    expect(callout()).withContext('open before closing').not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    render();
    expect(callout()).toBeNull();
  });

  it('closes on a click on the canvas', () => {
    openMenu();
    clickInfo('A');
    expect(callout()).withContext('open before closing').not.toBeNull();
    el.querySelector('#canvas')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    render();
    expect(callout()).toBeNull();
  });

  it('closes when the menu closes', () => {
    openMenu();
    clickInfo('A');
    expect(callout()).withContext('open before closing').not.toBeNull();
    openMenu();
    expect(component.menuVisible).toBeFalse();
    expect(callout()).toBeNull();
  });

  it('stays open while a slider moves, and the heat bar updates', () => {
    openMenu();
    clickInfo('beta');
    const before = component.distance;
    const beta = el.querySelectorAll('#parameters-menu input.slider')[2] as HTMLInputElement;
    beta.value = component.parameters.beta > 42 ? '0' : '85';
    beta.dispatchEvent(new Event('input'));
    beta.dispatchEvent(new Event('change'));
    render();
    expect(component.distance).not.toBe(before);
    expect(callout()).not.toBeNull();
  });

  it('opens on click only, not on hover', () => {
    openMenu();
    for (const type of ['mouseenter', 'mouseover', 'pointerenter', 'pointerover']) {
      info('A').dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    render();
    expect(callout()).toBeNull();
    clickInfo('A');
    expect(callout()).withContext('a click opens it').not.toBeNull();
  });

  it('marks each ⓘ with aria-expanded and aria-controls, and keeps focus on it', () => {
    openMenu();
    for (const [key] of helpButtons) {
      expect(info(key).getAttribute('aria-expanded')).withContext(key).toBe('false');
      expect(info(key).getAttribute('aria-controls')).withContext(key).toBe(`callout-${key}`);
    }
    info('alpha').focus();
    clickInfo('alpha');
    expect(info('alpha').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(info('alpha'));
  });

  it('gives each ⓘ a hit area of at least 44×44 px', () => {
    openMenu();
    for (const [key] of helpButtons) {
      const box = info(key).getBoundingClientRect();
      expect(box.width).withContext(`${key} width`).toBeGreaterThanOrEqual(44);
      expect(box.height).withContext(`${key} height`).toBeGreaterThanOrEqual(44);
    }
  });
});

// #6: at every checked size the game's parameters menu stays on screen and
// ends above the Usuario/Objetivo switch, scrolling when it's taller. Karma
// runs the specs in an iframe, so resizing it gives the page a real viewport.
describe('GameComponent parameters menu fit (#6)', () => {
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let el: HTMLElement;

  const viewport = useViewport();
  const setViewport = (width: number, height: number) => viewport.set(width, height);

  beforeEach(async () => {
    installFramePump();
    fixture = await renderGame();
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    component.howToOpen = false;
    fixture.detectChanges();
  });

  afterEach(() => {
    el.querySelectorAll('dialog').forEach(d => d.open && d.close());
  });

  it('shows no forced scrollbar on a 360 px phone', () => {
    setViewport(360, 800);
    component.menuButtonClick(new Event('click'));
    fixture.detectChanges();
    expect(getComputedStyle(el.querySelector('#parameters-menu') as HTMLElement).overflowY).toBe('auto');
  });

  for (const [width, height] of [[844, 390], [390, 844], [1280, 800]]) {
    it(`keeps every control reachable and clear of the switch at ${width}×${height}`, () => {
      setViewport(width, height);
      component.menuButtonClick(new Event('click'));
      fixture.detectChanges();
      const menu = el.querySelector('#parameters-menu') as HTMLElement;
      const toggle = el.querySelector('#toggle-switch') as HTMLElement;
      const bottom = menu.getBoundingClientRect().bottom;
      expect(bottom).withContext('menu bottom').toBeLessThanOrEqual(document.documentElement.clientHeight);
      expect(bottom).withContext('menu ends above the switch').toBeLessThanOrEqual(toggle.getBoundingClientRect().top);
      menu.scrollTop = menu.scrollHeight;
      const last = el.querySelector('#a-help-button') as HTMLElement;
      expect(last.getBoundingClientRect().bottom).withContext('last ⓘ after scrolling').toBeLessThanOrEqual(bottom + 0.5);
    });
  }
});

// #35: the "?" button turns on a guide on the game too, a callout beside
// every control. The shared pieces are #5's; these specs cover the game's
// wiring.
describe('GameComponent control guide (#35)', () => {
  const TARGET = ShellParameters.randomParameters('guide-35');
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let el: HTMLElement;
  let frames: FramePump;

  const render = () => fixture.detectChanges();
  const helpButton = () => el.querySelector('#help-button') as HTMLButtonElement;
  const guideBubbles = () => Array.from(el.querySelectorAll('.callout-guide')) as HTMLElement[];
  const rectOf = (e: Element) => e.getBoundingClientRect();

  // The guide's bubbles, in reading order: the toolbar left to right, the
  // "?", then the bottom row. No bubble for the 3D view (too crowded, owner
  // 2026-09-30).
  const expected: [string, string][] = [
    ['guide-game-parameters', AppStrings.GUIDE_GAME_PARAMETERS_TITLE],
    ['guide-game-save-image', AppStrings.GUIDE_SAVE_IMAGE_TITLE],
    ['guide-game-home', AppStrings.GUIDE_GAME_HOME_TITLE],
    ['guide-game-howto', AppStrings.GUIDE_GAME_HOWTO_TITLE],
    ['guide-game-help', AppStrings.GUIDE_HELP_TITLE],
    ['guide-game-switch', AppStrings.GUIDE_GAME_SWITCH_TITLE],
    ['guide-game-heat', AppStrings.GUIDE_GAME_HEAT_TITLE],
    ['guide-game-new-game', AppStrings.GUIDE_GAME_NEW_GAME_TITLE],
    ['guide-game-share', AppStrings.GUIDE_GAME_SHARE_TITLE],
  ];

  const viewport = useViewport();

  function toggleGuide() {
    helpButton().click();
    render();
  }

  function guideOn() {
    toggleGuide();
    expect(guideBubbles().length).withContext('guide on first').toBe(expected.length);
  }

  function expectGuideOff() {
    expect(component.guide.on).toBeFalse();
    expect(guideBubbles().length).toBe(0);
    expect(helpButton().getAttribute('aria-pressed')).toBe('false');
  }

  // Flips the Usuario/Objetivo switch the way a player does.
  function flipSwitch() {
    const input = el.querySelector('#shell-switch input') as HTMLInputElement;
    input.click();
    render();
  }

  beforeEach(async () => {
    frames = installFramePump();
    spyOn(window, 'prompt').and.returnValue(null);
    spyOn(window, 'alert');
    // The same target every run, so the shell on Objetivo (and so the
    // layout) doesn't change between runs.
    spyOn(ShellParameters, 'randomParameters').and.returnValue(TARGET);
    fixture = await renderGame();
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    // The how-to opens on load; close it so it isn't in the way.
    component.howToOpen = false;
    render();
  });

  afterEach(() => {
    el.querySelectorAll('dialog').forEach(d => d.open && d.close());
  });

  describe('the "?" button', () => {
    it('sits on its own in the upper-right corner, drawn like the toolbar icons', () => {
      const buttons = Array.from(el.querySelectorAll('#toolbar button')) as HTMLButtonElement[];
      expect(buttons.map(b => b.id)).toEqual(['parameters-button', 'save-image-button', 'home-button', 'howto-button']);
      expect(helpButton()).withContext('#help-button').not.toBeNull();
      expect(el.querySelector('#toolbar #help-button')).withContext('not in the toolbar').toBeNull();
      const gear = rectOf(buttons[0]);
      const help = rectOf(helpButton());
      expect(help.width).toBe(gear.width);
      expect(help.height).toBe(gear.height);
      expect(help.top).withContext('level with the toolbar').toBe(gear.top);
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
      expect(component.guide.controls.split(' ').length).toBe(expected.length);
    });

    it('has a hit area of at least 44×44 px', () => {
      const r = rectOf(helpButton());
      expect(r.width).toBeGreaterThanOrEqual(44);
      expect(r.height).toBeGreaterThanOrEqual(44);
    });

    it('gives every control the guide points at an id', () => {
      ['#parameters-button', '#save-image-button', '#home-button', '#howto-button', '#help-button',
        '#toggle-switch', '#result-container', '#new-game-button', '#share-button']
        .forEach(id => expect(el.querySelector(id)).withContext(id).not.toBeNull());
      expect((el.querySelector('#new-game-button') as HTMLElement).textContent!.trim()).toBe(AppStrings.LABEL_NEW_GAME);
      expect((el.querySelector('#share-button') as HTMLElement).textContent!.trim()).toBe(AppStrings.LABEL_SHARE_GAME);
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

    it('has no bubble for the 3D view, and no shell marker (owner, 2026-09-30)', () => {
      toggleGuide();
      expect(el.querySelector('#guide-game-view')).toBeNull();
      expect(el.querySelector('#shell-region')).toBeNull();
    });
  });

  describe('turning the guide off', () => {
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
  });

  describe('one kind of help at a time', () => {
    const menu = () => el.querySelector('#parameters-menu') as HTMLElement;
    const info = (key: string) => el.querySelector(`#${key}-help-button`) as HTMLInputElement;
    const singleCallout = () => el.querySelector('.callout:not(.callout-guide)');
    const click = (id: string) => {
      (el.querySelector(id) as HTMLButtonElement).click();
      render();
    };

    it('closes the gear menu and its open ⓘ when it turns on', () => {
      click('#parameters-button');
      info('A').click();
      render();
      expect(menu().style.display).withContext('menu open first').toBe('block');
      expect(singleCallout()).withContext('ⓘ open first').not.toBeNull();
      guideOn();
      expect(menu().style.display).toBe('none');
      expect(component.menuVisible).toBeFalse();
      expect(component.help.key).toBeNull();
      expect(singleCallout()).toBeNull();
    });

    // A pop-up covers the "?", so this can't happen from the screen; the
    // rule still holds in code.
    for (const popup of ['howToOpen', 'newGameOpen', 'victoryOpen'] as const) {
      it(`closes an open pop-up (${popup}) when it turns on`, () => {
        component[popup] = true;
        render();
        component.helpButtonClick(new Event('click'));
        render();
        expect(component[popup]).toBeFalse();
        expect(component.guide.on).toBeTrue();
      });
    }

    it('turns off when the gear menu opens', () => {
      guideOn();
      click('#parameters-button');
      expectGuideOff();
      expect(menu().style.display).toBe('block');
    });

    it('turns off when a parameter ⓘ opens', () => {
      guideOn();
      info('A').click();
      render();
      expectGuideOff();
      expect(component.help.key).toBe('A');
    });

    it('turns off when the how-to opens', () => {
      guideOn();
      click('#howto-button');
      expectGuideOff();
      expect(component.howToOpen).toBeTrue();
    });

    it('turns off when Nuevo juego opens', () => {
      guideOn();
      click('#new-game-button');
      expectGuideOff();
      expect(component.newGameOpen).toBeTrue();
    });

    it('turns off when ¡Victoria! opens', () => {
      guideOn();
      spyOn(component, 'checkParametersAreSimilar').and.returnValue(true);
      component.checkGameIsOver();
      render();
      expectGuideOff();
      expect(component.victoryOpen).toBeTrue();
    });
  });

  describe('using the screen while the guide is on', () => {
    it('stays on while an image is saved', () => {
      spyOn(HTMLAnchorElement.prototype, 'click');
      guideOn();
      (el.querySelector('#save-image-button') as HTMLButtonElement).click();
      render();
      expect(HTMLAnchorElement.prototype.click).withContext('image saved').toHaveBeenCalled();
      expect(component.guide.on).toBeTrue();
      expect(guideBubbles().length).toBe(expected.length);
    });

    it('stays on while Compartir copies the link', async () => {
      const copy = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
      guideOn();
      (el.querySelector('#share-button') as HTMLButtonElement).click();
      await fixture.whenStable();
      render();
      expect(copy).withContext('link copied').toHaveBeenCalled();
      expect(component.guide.on).toBeTrue();
      expect(guideBubbles().length).toBe(expected.length);
    });

    it('stays on when the switch flips', () => {
      guideOn();
      flipSwitch();
      expect(component.targetVisible).toBeTrue();
      expect(component.guide.on).toBeTrue();
      expect(guideBubbles().length).toBe(expected.length);
    });

    it('lays the guide out once per window resize', () => {
      viewport.set(390, 844);
      guideOn();
      const callout = fixture.debugElement.query(By.directive(CalloutComponent)).componentInstance as CalloutComponent;
      const passes = spyOn(callout as unknown as { placeGuide(): void }, 'placeGuide').and.callThrough();
      window.dispatchEvent(new Event('resize'));
      render();
      expect(passes).toHaveBeenCalledTimes(1);
      expect(guideBubbles().length).toBe(expected.length);
    });
  });

  describe('layout', () => {
    const toolbarRow = ['#parameters-button', '#save-image-button', '#home-button', '#howto-button', '#help-button'];
    const controls = [...toolbarRow, '#toggle-switch', '#result-container', '#new-game-button', '#share-button'];
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
      it(`shows the "?" on screen, clear of the other icons, with the toolbar on one row at ${width}×${height}`, () => {
        viewport.set(width, height);
        render();
        const help = rectOf(helpButton());
        expect(help.left).toBeGreaterThanOrEqual(0);
        expect(help.top).toBeGreaterThanOrEqual(0);
        expect(help.right).toBeLessThanOrEqual(width);
        expect(help.bottom).toBeLessThanOrEqual(height);
        controls.filter(c => c !== '#help-button').forEach(c =>
          expect(overlaps(help, rectOf(el.querySelector(c)!))).withContext(c).toBeFalse());
        const top = rectOf(el.querySelector('#parameters-button')!).top;
        toolbarRow.forEach(c =>
          expect(rectOf(el.querySelector(c)!).top).withContext(`${c} on the top row`).toBe(top));
        toolbarRow.forEach(c => expect(rectOf(el.querySelector(c)!).width).withContext(c).toBeGreaterThanOrEqual(44));
      });
    }

    it('uses the compact bubbles on phone widths, where nine bubbles need the room (owner, #35)', () => {
      const fontSize = () => parseFloat(getComputedStyle(guideBubbles()[0]).fontSize);
      viewport.set(390, 844);
      toggleGuide();
      expect(fontSize()).withContext('390×844').toBe(12);
      viewport.set(1280, 800);
      render();
      expect(fontSize()).withContext('1280×800').toBe(13);
    });

    it('shrinks the toolbar icons and the "?" to 56 px under 356 px wide, and keeps 64 px above', () => {
      viewport.set(355, 640);
      render();
      toolbarRow.forEach(c => expect(rectOf(el.querySelector(c)!).width).withContext(`${c} at 355`).toBe(56));
      viewport.set(356, 640);
      render();
      toolbarRow.forEach(c => expect(rectOf(el.querySelector(c)!).width).withContext(`${c} at 356`).toBe(64));
    });

    // Tall phones, a desktop and a phone on its side, with each shell shown.
    for (const [width, height] of [[360, 800], [390, 844], [1280, 800], [844, 390]]) {
      for (const objetivo of [false, true]) {
        it(`keeps every bubble on screen, apart, off the controls and clear of the lines at ${width}×${height} on ${objetivo ? 'Objetivo' : 'Usuario'}`, () => {
          viewport.set(width, height);
          render();
          if (objetivo) {
            flipSwitch();
          }
          toggleGuide();
          expectTidy(width, height);
        });
      }
    }

    // Short phones (a phone inside its browser): nine bubbles don't fit
    // under the toolbar's staircase and the game's three bottom rows, so
    // these are best effort (owner, #35): every bubble still shows, on
    // screen.
    for (const [width, height] of [[320, 568], [338, 643], [360, 560], [360, 640], [375, 553]]) {
      it(`still shows every bubble on screen at ${width}×${height} (best effort)`, () => {
        viewport.set(width, height);
        render();
        toggleGuide();
        const bubbles = guideBubbles();
        expect(bubbles.length).toBe(expected.length);
        bubbles.forEach(b => {
          const r = rectOf(b);
          expect(r.left).withContext(`${b.id} left`).toBeGreaterThanOrEqual(8 - 0.5);
          expect(r.top).withContext(`${b.id} top`).toBeGreaterThanOrEqual(8 - 0.5);
          expect(r.right).withContext(`${b.id} right`).toBeLessThanOrEqual(width - 8 + 0.5);
          expect(r.bottom).withContext(`${b.id} bottom`).toBeLessThanOrEqual(height - 8 + 0.5);
        });
      });
    }

    it('re-places the bubbles when the phone turns, still tidy', () => {
      viewport.set(390, 844);
      toggleGuide();
      expectTidy(390, 844);
      viewport.set(844, 390);
      render();
      expectTidy(844, 390);
    });
  });

  describe('for a screen reader', () => {
    it('reads the guide out politely, bubble by bubble in reading order, skipping the lines and arrows', () => {
      viewport.set(390, 844);
      toggleGuide();
      const layer = el.querySelector('.callout-layer') as HTMLElement;
      expect(layer.getAttribute('aria-live')).toBe('polite');
      const notes = Array.from(layer.querySelectorAll('[role="note"]')) as HTMLElement[];
      expect(notes.map(n => n.id)).toEqual(expected.map(([id]) => id));
      notes.forEach(n => expect(n.querySelector('.callout-arrow')!.getAttribute('aria-hidden')).withContext(n.id).toBe('true'));
      const lines = Array.from(el.querySelectorAll('.callout-leader')) as HTMLElement[];
      expect(lines.length).withContext('lines on a phone').toBeGreaterThan(0);
      lines.forEach(l => expect(l.getAttribute('aria-hidden')).toBe('true'));
    });

    it("lists exactly the guide's bubbles in the \"?\"'s aria-controls, and they exist while it is on", () => {
      toggleGuide();
      const ids = helpButton().getAttribute('aria-controls')!.split(' ');
      expect(ids).toEqual(expected.map(([id]) => id));
      ids.forEach(id => expect(el.querySelector(`#${id}`)).withContext(id).not.toBeNull());
    });

    it('draws its bubbles and lines with the shared callout styles, which drop the animation under reduced motion (#5)', () => {
      viewport.set(390, 844);
      toggleGuide();
      guideBubbles().forEach(b => expect(b.matches('.callout.callout-guide')).withContext(b.id).toBeTrue());
      (Array.from(el.querySelectorAll('.callout-leader')) as HTMLElement[])
        .forEach(l => expect(l.matches('.callout-leader')).toBeTrue());
      const rules: CSSRule[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try { rules.push(...Array.from(sheet.cssRules)); } catch { /* cross-origin */ }
      }
      const off = rules.filter((r): r is CSSMediaRule =>
        r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion'))
        .flatMap(m => Array.from(m.cssRules) as CSSStyleRule[])
        .filter(r => r.style?.animationName === 'none')
        .flatMap(r => r.selectorText.split(',').map(sel => sel.trim()));
      expect(off.some(sel => /^\.callout(\[|$)/.test(sel))).withContext('bubbles').toBeTrue();
      expect(off.some(sel => /^\.callout-leader(\[|$)/.test(sel))).withContext('lines').toBeTrue();
    });
  });

  describe('the 3D view while the guide is on', () => {
    const canvases = ['#canvas', '#target-canvas'];

    function pointer(on: string, type: string, x: number, y: number, id = 1, pointerType = 'mouse', extra: PointerEventInit = {}) {
      el.querySelector(on)!.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id, pointerType,
        isPrimary: id === 1, button: 0, buttons: type === 'pointerup' ? 0 : 1, ...extra,
      }));
    }

    beforeEach(() => {
      // OrbitControls captures the pointer; a synthetic pointer can't be.
      spyOn(Element.prototype, 'setPointerCapture');
      spyOn(Element.prototype, 'releasePointerCapture');
    });

    for (const canvas of canvases) {
      it(`turns the guide off with a tap on ${canvas} (mouse)`, () => {
        guideOn();
        pointer(canvas, 'pointerdown', 200, 400);
        pointer(canvas, 'pointerup', 200, 400);
        render();
        expectGuideOff();
      });

      it(`turns the guide off with a tap on ${canvas} (touch), even if the finger moves a little`, () => {
        guideOn();
        pointer(canvas, 'pointerdown', 200, 400, 7, 'touch');
        pointer(canvas, 'pointermove', 205, 403, 7, 'touch');
        pointer(canvas, 'pointerup', 205, 403, 7, 'touch');
        render();
        expectGuideOff();
      });

      it(`keeps the guide on while pinching on ${canvas}`, () => {
        guideOn();
        pointer(canvas, 'pointerdown', 180, 400, 7, 'touch');
        pointer(canvas, 'pointerdown', 220, 400, 8, 'touch');
        pointer(canvas, 'pointerup', 178, 400, 7, 'touch');
        pointer(canvas, 'pointerup', 222, 400, 8, 'touch');
        render();
        expect(component.guide.on).toBeTrue();
      });

      it(`keeps the guide on after a right-click or middle-click on ${canvas} (they pan)`, () => {
        guideOn();
        for (const button of [1, 2]) {
          pointer(canvas, 'pointerdown', 200, 400, 1, 'mouse', { button, buttons: button === 1 ? 4 : 2 });
          pointer(canvas, 'pointerup', 200, 400, 1, 'mouse', { button, buttons: 0 });
        }
        render();
        expect(component.guide.on).toBeTrue();
      });

      it(`keeps the guide on while zooming with the wheel on ${canvas}`, () => {
        guideOn();
        el.querySelector(canvas)!.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100, clientX: 200, clientY: 400 }));
        render();
        expect(component.guide.on).toBeTrue();
      });
    }

    it('keeps the guide on while dragging, and the drag rotates your shell', () => {
      guideOn();
      const camera = (component.viewer as unknown as { camera: { position: { clone(): { distanceTo(p: unknown): number } } } }).camera;
      const before = camera.position.clone();
      pointer('#canvas', 'pointerdown', 200, 400);
      pointer('#canvas', 'pointermove', 230, 400);
      pointer('#canvas', 'pointermove', 260, 410);
      pointer('#canvas', 'pointerup', 260, 410);
      frames.pump(2);
      render();
      expect(component.guide.on).toBeTrue();
      expect(guideBubbles().length).toBe(expected.length);
      expect(before.distanceTo(camera.position)).withContext('camera moved').toBeGreaterThan(0.01);
    });
  });
});

// #10: the how-to in short sections, one per control or concept, each opening
// with its title in bold. The first three titles are the "?" guide's (#35).
describe('GameComponent how-to pop-up (#10)', () => {
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let el: HTMLElement;

  const howTo = () => el.querySelector('#modal-howto > dialog') as HTMLDialogElement;
  const body = () => howTo().querySelector('.modal-body') as HTMLElement;
  const render = () => fixture.detectChanges();
  const squash = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
  const sections = () => Array.from(body().querySelectorAll('.label-howto-section')) as HTMLElement[];
  const titleOf = (p: HTMLElement) => squash(p.querySelector('strong')?.textContent);
  // What a screen reader reads: nothing aria-hidden, and a labelled image
  // by its label.
  const spoken = (e: HTMLElement) => {
    const copy = e.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('[aria-hidden="true"]').forEach(h => h.remove());
    copy.querySelectorAll('[role="img"][aria-label]').forEach(i => i.replaceWith(i.getAttribute('aria-label')!));
    return squash(copy.textContent);
  };
  const TITLES = [
    AppStrings.GUIDE_GAME_PARAMETERS_TITLE, AppStrings.GUIDE_GAME_SWITCH_TITLE,
    AppStrings.GUIDE_GAME_HEAT_TITLE, AppStrings.LABEL_HOWTO_NEW_GAME_SHARE_TITLE,
    AppStrings.LABEL_HOWTO_WHERE_TITLE,
  ];

  beforeEach(async () => {
    installFramePump();
    fixture = await renderGame();
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  afterEach(() => {
    el.querySelectorAll('dialog').forEach(d => d.open && d.close());
  });

  describe('sections', () => {
    it('opens on load with the goal, the five sections in order, then the closing line', () => {
      expect(howTo().open).toBeTrue();
      const paragraphs = Array.from(body().children) as HTMLElement[];
      expect(paragraphs.map(p => p.id)).toEqual([
        'howto-goal', 'howto-parameters', 'howto-switch', 'howto-progress',
        'howto-new-game-share', 'howto-where', 'howto-closing',
      ]);
      expect(squash(paragraphs[0].textContent)).toBe(AppStrings.LABEL_HOWTO_GOAL);
      expect(squash(paragraphs[6].textContent)).toBe(AppStrings.LABEL_HOWTO_CLOSING);
    });

    it('opens each section with a bold title; three are the "?" guide\'s', () => {
      expect(sections().map(titleOf)).toEqual(TITLES);
      sections().forEach(p => {
        expect(p.firstElementChild?.tagName).withContext(p.id).toBe('STRONG');
        expect(Number(getComputedStyle(p.querySelector('strong')!).fontWeight)).withContext(p.id).toBeGreaterThanOrEqual(600);
      });
    });

    // The " · " stays in the spoken text: screen readers pause on it without
    // reading it, so the title doesn't run into the sentence.
    it('uses the owner\'s wording (2026-09-30)', () => {
      expect(sections().map(spoken)).toEqual([
        'Parámetros · Abre Parámetros y mueve los sliders para cambiar tu caracol.',
        'Usuario / Objetivo · Cambia la vista entre tu caracol (blanco) y el objetivo (dorado).',
        'Progreso · La barra avanza hacia ✓ mientras más te acercas. Cuando tu caracol sea casi idéntico, ¡ganas!',
        'Nuevo juego y Compartir · Empieza otra partida, o copia el enlace para retar a alguien con el caracol objetivo.',
        '¿Dónde está cada cosa? · Toca ? para verlo en la pantalla.',
      ]);
      expect(AppStrings.LABEL_HOWTO_GOAL).toBe('Te mostramos un caracol objetivo. ¿Puedes reconstruirlo?');
      expect(AppStrings.LABEL_HOWTO_CLOSING).toBe('¡Suerte y diviértete!');
      expect(squash(howTo().querySelector('#label-howto-title')?.textContent)).toBe('¡Bienvenido al juego!');
    });

    it('names both buttons in the Nuevo juego y Compartir title, as the guide does', () => {
      expect(AppStrings.LABEL_HOWTO_NEW_GAME_SHARE_TITLE).toContain(AppStrings.GUIDE_GAME_NEW_GAME_TITLE);
      expect(AppStrings.LABEL_HOWTO_NEW_GAME_SHARE_TITLE).toContain(AppStrings.GUIDE_GAME_SHARE_TITLE);
    });

    it('shows the gear as a text glyph between "Abre" and the rest, read as "Parámetros"', () => {
      const parameters = el.querySelector('#howto-parameters') as HTMLElement;
      const gear = parameters.querySelector('.howto-gear') as HTMLElement;
      expect(gear.getAttribute('role')).toBe('img');
      expect(gear.getAttribute('aria-label')).toBe(AppStrings.GUIDE_GAME_PARAMETERS_TITLE);
      expect(gear.hasAttribute('aria-hidden')).toBeFalse();
      expect(gear.textContent).toBe('\u2699\uFE0E');
      expect(squash(parameters.textContent)).toBe(
        'Parámetros · Abre \u2699\uFE0E y mueve los sliders para cambiar tu caracol.');
    });
  });

  describe('what it covers', () => {
    it('explains the goal, ⚙, the switch and its colours, the bar, winning, Nuevo juego, Compartir and "?"', () => {
      const text = squash(body().textContent);
      for (const words of ['caracol objetivo', '\u2699', 'sliders', 'blanco', 'dorado', 'barra', '✓',
                           '¡ganas!', 'otra partida', 'enlace', 'Toca ?']) {
        expect(text).withContext(words).toContain(words);
      }
    });

    it('never locates a control by screen position, and never calls the target "amarillo"', () => {
      const text = squash(body().textContent).toLowerCase();
      for (const words of ['parte inferior', 'parte superior', 'abajo', 'arriba', 'izquierda', 'derecha',
                           'esquina', 'amarillo']) {
        expect(text).withContext(words).not.toContain(words);
      }
    });

    it('leaves none of the old four paragraphs behind', () => {
      expect(body().querySelector('.label-howto-line')).toBeNull();
      expect(Object.keys(AppStrings).filter(k => k.startsWith('LABEL_HOWTO_WINDOW_LINE'))).toEqual([]);
    });
  });

  describe('¡A jugar!', () => {
    const play = () => howTo().querySelector('#howto-play-button') as HTMLButtonElement;
    const guideBubbles = () => el.querySelectorAll('.callout-guide').length;

    it('sits in the pop-up\'s footer, the only button there', () => {
      expect(play().tagName).toBe('BUTTON');
      expect(play().type).toBe('button');
      expect(squash(play().textContent)).toBe('¡A jugar!');
      const footer = play().closest('footer')!;
      expect(footer).not.toBeNull();
      expect(Array.from(footer.querySelectorAll('button')).map(b => squash(b.textContent))).toEqual(['¡A jugar!']);
    });

    it('closes the pop-up and leaves the game ready to play', () => {
      const target = { ...component.targetParameters };
      play().click();
      render();
      expect(component.howToOpen).toBeFalse();
      expect(howTo().open).toBeFalse();
      expect(component.victoryOpen).toBeFalse();
      expect(component.newGameOpen).toBeFalse();
      expect({ ...component.targetParameters }).withContext('same game').toEqual(target);
    });

    it('keeps the first focus on the ✕, like every other pop-up', () => {
      component.howToOpen = false;
      render();
      component.howToButtonClick(new Event('click'));
      render();
      expect(document.activeElement).toBe(howTo().querySelector('header > button'));
    });

    it('comes back with the same sections from the book button, turning the "?" guide off', () => {
      play().click();
      render();
      (el.querySelector('#help-button') as HTMLButtonElement).click();
      render();
      expect(guideBubbles()).withContext('guide on').toBeGreaterThan(0);
      (el.querySelector('#howto-button') as HTMLButtonElement).click();
      render();
      expect(howTo().open).toBeTrue();
      expect(component.guide.on).toBeFalse();
      expect(guideBubbles()).toBe(0);
      expect(sections().map(titleOf)).toEqual(TITLES);
      expect(play()).not.toBeNull();
    });
  });

  describe('layout', () => {
    const viewport = useViewport();
    const noSideScroll = (e: Element, what: string) =>
      expect(e.scrollWidth).withContext(`${what} scrolls sideways`).toBeLessThanOrEqual(e.clientWidth + 1);
    const onScreen = (e: Element) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight + 1 && r.right <= window.innerWidth + 1;
    };

    for (const [width, height] of [[320, 568], [360, 800], [390, 844], [1280, 800], [844, 390]]) {
      it(`never scrolls the pop-up or the page sideways at ${width}×${height}`, () => {
        viewport.set(width, height);
        render();
        noSideScroll(document.documentElement, 'the page');
        noSideScroll(howTo(), 'the pop-up');
        noSideScroll(howTo().querySelector('article')!, 'the pop-up box');
        noSideScroll(body(), 'the pop-up body');
        expect(howTo().getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth + 1);
        // Every line wraps inside the box: no section wider than the body.
        Array.from(body().children).forEach(p =>
          expect(p.getBoundingClientRect().right).withContext(p.id)
            .toBeLessThanOrEqual(body().getBoundingClientRect().right + 1));
      });
    }

    for (const [width, height] of [[320, 568], [844, 390]]) {
      it(`keeps the ✕ and "¡A jugar!" on screen at ${width}×${height}, the text scrolling between them`, () => {
        viewport.set(width, height);
        render();
        expect(onScreen(howTo().querySelector('header > button')!)).withContext('✕').toBeTrue();
        expect(onScreen(howTo().querySelector('#howto-play-button')!)).withContext('¡A jugar!').toBeTrue();
        expect(getComputedStyle(body()).overflowY).toMatch(/auto|scroll/);
        // The text is taller than the body here, so it really scrolls.
        expect(body().scrollHeight).withContext('text overflows the body').toBeGreaterThan(body().clientHeight);
        // The last line is reachable by scrolling the body.
        body().scrollTop = body().scrollHeight;
        const closing = body().querySelector('.label-howto-closing')!.getBoundingClientRect();
        expect(closing.bottom).withContext('closing line after scrolling')
          .toBeLessThanOrEqual(body().getBoundingClientRect().bottom + 1);
      });
    }
  });
});


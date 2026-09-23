import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { ShellParameters } from '../shell-parameters';
import { GameComponent } from './game.component';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ GameComponent ],
      providers: [ provideRouter([]) ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
  let frames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;

  function pumpFrame(): void {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(callback => callback(performance.now()));
  }

  function renderingViewers(): number {
    pumpFrame();
    return frames.size;
  }

  beforeEach(async () => {
    frames = new Map();
    nextFrameId = 1;
    spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
      frames.set(nextFrameId, callback);
      return nextFrameId++;
    });
    spyOn(window, 'cancelAnimationFrame').and.callFake((id: number) => {
      frames.delete(id);
    });
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ GameComponent ],
      providers: [ provideRouter([]) ]
    }).compileComponents();
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

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
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { SandboxComponent } from './sandbox.component';
import { FramePump, installFramePump } from '../../testing/frame-pump';

describe('SandboxComponent', () => {
  let component: SandboxComponent;
  let fixture: ComponentFixture<SandboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ SandboxComponent ],
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
      declarations: [ SandboxComponent ],
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

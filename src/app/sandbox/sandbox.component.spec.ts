import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { SandboxComponent } from './sandbox.component';

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
    // ShellViewer's render loop reschedules itself forever (#21). Let it draw
    // one frame, then stop, so loops don't pile up in a watch-mode browser.
    spyOn(window, 'requestAnimationFrame').and.returnValue(0);
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
  let frames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;

  function renderingViewers(): number {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(callback => callback(performance.now()));
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

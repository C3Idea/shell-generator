import { ShellParameters } from './shell-parameters';
import { ShellViewer } from './shell-viewer';

describe('ThreeJSHelper', () => {
  it('should create an instance', () => {
    expect(new ShellViewer()).toBeTruthy();
  });
});

// #21: every viewer's render loop must be stoppable, or loops pile up for as
// long as the page is open. requestAnimationFrame is replaced by a manual
// frame pump, so each test decides exactly when frames run.
describe('ShellViewer lifecycle (#21)', () => {
  let frames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;
  let canvas: HTMLCanvasElement;

  function pumpFrames(count: number): void {
    for (let i = 0; i < count; i++) {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback(performance.now()));
    }
  }

  function createViewer(): ShellViewer {
    const viewer = new ShellViewer();
    viewer.init(75, 0.1, 1000, canvas);
    viewer.createGraph(ShellParameters.Shell1());
    return viewer;
  }

  beforeEach(() => {
    frames = new Map();
    nextFrameId = 1;
    spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
      frames.set(nextFrameId, callback);
      return nextFrameId++;
    });
    spyOn(window, 'cancelAnimationFrame').and.callFake((id: number) => {
      frames.delete(id);
    });
    canvas = document.createElement('canvas');
    canvas.style.width = '200px';
    canvas.style.height = '200px';
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    canvas.remove();
  });

  it('renders once per frame while it runs', () => {
    const viewer = createViewer();
    const render = spyOn((viewer as any)['renderer'], 'render').and.callThrough();
    pumpFrames(3);
    expect(render).toHaveBeenCalledTimes(3);
    viewer.dispose();
  });

  it('dispose() cancels its pending frame and renders no more frames', () => {
    const viewer = createViewer();
    const render = spyOn((viewer as any)['renderer'], 'render').and.callThrough();
    const pendingId = [...frames.keys()][0];
    viewer.dispose();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingId);
    pumpFrames(3);
    expect(render).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it('dispose() releases the controls, the renderer and its WebGL context', () => {
    const viewer = createViewer();
    const renderer = (viewer as any)['renderer'];
    const controlsDispose = spyOn((viewer as any)['controls'], 'dispose').and.callThrough();
    const rendererDispose = spyOn(renderer, 'dispose').and.callThrough();
    const forceContextLoss = spyOn(renderer, 'forceContextLoss').and.callThrough();
    viewer.dispose();
    expect(controlsDispose).toHaveBeenCalledTimes(1);
    expect(rendererDispose).toHaveBeenCalledTimes(1);
    expect(forceContextLoss).toHaveBeenCalledTimes(1);
  });

  it('dispose() before init() does nothing and does not throw', () => {
    const viewer = new ShellViewer();
    expect(() => viewer.dispose()).not.toThrow();
    expect(window.cancelAnimationFrame).not.toHaveBeenCalled();
  });

  it('dispose() twice releases everything only once', () => {
    const viewer = createViewer();
    const forceContextLoss = spyOn((viewer as any)['renderer'], 'forceContextLoss').and.callThrough();
    viewer.dispose();
    // three's own renderer.dispose() may also call cancelAnimationFrame, so
    // compare call counts around the second dispose() instead of a total.
    const cancelsAfterFirst = (window.cancelAnimationFrame as jasmine.Spy).calls.count();
    expect(() => viewer.dispose()).not.toThrow();
    expect(forceContextLoss).toHaveBeenCalledTimes(1);
    expect((window.cancelAnimationFrame as jasmine.Spy).calls.count()).toBe(cancelsAfterFirst);
  });

  it('resetCamera() returns the camera to the default view', () => {
    const viewer = createViewer();
    const camera = (viewer as any)['camera'];
    const controls = (viewer as any)['controls'];
    const defaultPosition = camera.position.clone();
    const defaultTarget = controls.target.clone();
    const defaultZoom = camera.zoom;
    camera.position.set(-30, 5, 70);
    controls.target.set(4, -2, 1);
    camera.zoom = 2.5;
    controls.update();
    viewer.resetCamera();
    expect(camera.position.distanceTo(defaultPosition)).toBeLessThan(1e-6);
    expect(controls.target.distanceTo(defaultTarget)).toBeLessThan(1e-6);
    expect(camera.zoom).toBe(defaultZoom);
    viewer.dispose();
  });
});

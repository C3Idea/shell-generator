import { ShellParameters } from './shell-parameters';
import { ShellViewer } from './shell-viewer';
import { FramePump, installFramePump } from '../testing/frame-pump';

describe('ThreeJSHelper', () => {
  it('should create an instance', () => {
    expect(new ShellViewer()).toBeTruthy();
  });
});

// #21: every viewer's render loop must be stoppable, or loops pile up for as
// long as the page is open. requestAnimationFrame is replaced by a manual
// frame pump, so each test decides exactly when frames run.
describe('ShellViewer lifecycle (#21)', () => {
  let frames: FramePump;
  let canvas: HTMLCanvasElement;

  function createViewer(): ShellViewer {
    const viewer = new ShellViewer();
    viewer.init(75, 0.1, 1000, canvas);
    viewer.createGraph(ShellParameters.Shell1());
    return viewer;
  }

  beforeEach(() => {
    frames = installFramePump();
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
    frames.pump(3);
    expect(render).toHaveBeenCalledTimes(3);
    viewer.dispose();
  });

  it('dispose() cancels its pending frame and renders no more frames', () => {
    const viewer = createViewer();
    const render = spyOn((viewer as any)['renderer'], 'render').and.callThrough();
    const pendingId = frames.pendingIds()[0];
    viewer.dispose();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingId);
    frames.pump(3);
    expect(render).not.toHaveBeenCalled();
    expect(frames.pending()).toBe(0);
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

// #5: the guide's 3D-view bubble points at where the shell is drawn.
describe('ShellViewer shellScreenBox (#5)', () => {
  let canvas: HTMLCanvasElement;
  let viewer: ShellViewer;

  beforeEach(() => {
    installFramePump();
    canvas = document.createElement('canvas');
    canvas.style.width = '400px';
    canvas.style.height = '300px';
    document.body.appendChild(canvas);
    viewer = new ShellViewer();
    viewer.init(1, 1, 10000, canvas);
    viewer.resize(400, 300);
  });

  afterEach(() => {
    viewer.dispose();
    canvas.remove();
  });

  it('is null while there is no shell', () => {
    expect(viewer.shellScreenBox()).toBeNull();
  });

  it('is the box around the drawn shell, in px from the canvas corner, inside the canvas', () => {
    viewer.createGraph(ShellParameters.Shell1());
    const box = viewer.shellScreenBox()!;
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(20);
    expect(box.height).toBeGreaterThan(20);
    expect(box.left).toBeGreaterThanOrEqual(-1);
    expect(box.top).toBeGreaterThanOrEqual(-1);
    expect(box.left + box.width).toBeLessThanOrEqual(401);
    expect(box.top + box.height).toBeLessThanOrEqual(301);
    // The camera looks at the shell, so its box holds the canvas centre.
    expect(box.left).toBeLessThan(200);
    expect(box.left + box.width).toBeGreaterThan(200);
    expect(box.top).toBeLessThan(150);
    expect(box.top + box.height).toBeGreaterThan(150);
  });

  it('follows the canvas size', () => {
    viewer.createGraph(ShellParameters.Shell1());
    const small = viewer.shellScreenBox()!;
    canvas.style.width = '800px';
    canvas.style.height = '600px';
    viewer.resize(800, 600);
    const big = viewer.shellScreenBox()!;
    expect(big.width).toBeCloseTo(small.width * 2, -1);
  });
});

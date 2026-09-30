import { viewportController } from './viewport';

// The test-only viewport helper (#5 review, M1): however many times a spec
// resizes, it puts back the size the iframe had before the spec.
describe('viewportController', () => {
  const frame = () => ({ style: { width: '640px', height: '480px' } });

  it('puts back the original size after two resizes in one spec', () => {
    const f = frame();
    const viewport = viewportController(f);
    viewport.set(390, 844);
    viewport.set(1280, 800);
    expect(f.style).toEqual({ width: '1280px', height: '800px' });
    viewport.restore();
    expect(f.style).toEqual({ width: '640px', height: '480px' });
  });

  it('does nothing when nothing was resized, and can be used again after restoring', () => {
    const f = frame();
    const viewport = viewportController(f);
    viewport.restore();
    expect(f.style).toEqual({ width: '640px', height: '480px' });
    viewport.set(360, 800);
    viewport.restore();
    viewport.set(844, 390);
    viewport.restore();
    expect(f.style).toEqual({ width: '640px', height: '480px' });
  });
});

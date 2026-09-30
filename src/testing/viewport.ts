// Test-only viewport sizes (#6, #5). Specs resize Karma's context iframe so
// media queries and layout see a phone or a desktop. However many times a
// spec resizes, the size the iframe had before the spec is what comes back
// (#5 review, M1: re-capturing on every call restored the first size set).

interface Resizable { style: { width: string; height: string } }

export function viewportController(frame: Resizable) {
  let original: { width: string; height: string } | null = null;
  return {
    set(width: number, height: number): void {
      original ??= { width: frame.style.width, height: frame.style.height };
      frame.style.width = `${width}px`;
      frame.style.height = `${height}px`;
    },
    restore(): void {
      if (original) {
        frame.style.width = original.width;
        frame.style.height = original.height;
        original = null;
      }
    },
  };
}

// For a describe block: set(width, height) resizes the iframe and fires a
// window resize (so components re-lay out); an afterEach puts the original
// size back. Pending outside Karma's iframe.
export function useViewport(): { set(width: number, height: number): void } {
  const frame = window.frameElement as HTMLIFrameElement | null;
  const controller = frame ? viewportController(frame) : null;
  afterEach(() => controller?.restore());
  return {
    set(width: number, height: number): void {
      if (!controller) {
        pending('needs the Karma iframe to set the viewport size');
        return;
      }
      controller.set(width, height);
      window.dispatchEvent(new Event('resize'));
    },
  };
}

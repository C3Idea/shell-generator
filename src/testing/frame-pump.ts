// Test-only manual frame pump (#21). Replaces requestAnimationFrame so specs
// decide exactly when frames run: every live render loop schedules one frame
// per pumped frame, so pending() after a pump = loops still rendering.
// Install it in a beforeEach; Jasmine removes the spies after each spec.

export interface FramePump {
  /** Runs `count` frames: each runs the callbacks pending at its start. */
  pump(count?: number): void;
  /** Number of frames scheduled and not yet run or cancelled. */
  pending(): number;
  /** Ids of the pending frames, in the order they were requested. */
  pendingIds(): number[];
}

export function installFramePump(): FramePump {
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrameId = 1;
  spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
    frames.set(nextFrameId, callback);
    return nextFrameId++;
  });
  spyOn(window, 'cancelAnimationFrame').and.callFake((id: number) => {
    frames.delete(id);
  });
  return {
    pump(count = 1) {
      for (let i = 0; i < count; i++) {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach(callback => callback(performance.now()));
      }
    },
    pending: () => frames.size,
    pendingIds: () => [...frames.keys()],
  };
}

import { PlayedParameterKey, ShellParameters } from './shell-parameters';

describe('ShellParameters', () => {
  it('should create an instance', () => {
    expect(new ShellParameters()).toBeTruthy();
  });

  it('should generate the same shell for the same seed', () => {
    const a = ShellParameters.randomParameters('abc123');
    const b = ShellParameters.randomParameters('abc123');

    expect(a).toEqual(b);
  });

  it('should generate different shells for different seeds', () => {
    const a = ShellParameters.randomParameters('seed-a');
    const b = ShellParameters.randomParameters('seed-b');

    expect(a).not.toEqual(b);
  });

  // #28: the heat bar reads distance() on a 0 (✓) to 100 (✗) scale.
  describe('distance()', () => {
    // A shell at every slider minimum, with the given values changed.
    const shell = (values: Partial<Record<keyof ShellParameters, number>> = {}) =>
      Object.assign(new ShellParameters(), values);
    const maximums: Record<PlayedParameterKey, number> = {
      A: ShellParameters.AMax,
      alpha: ShellParameters.alphaMax,
      beta: ShellParameters.betaMax,
      a: ShellParameters.aMax,
    };

    it('reads the ✗ end when every played parameter is at the opposite end', () => {
      const d = shell().distance(shell(maximums));
      expect(d).toBeGreaterThanOrEqual(95);
      expect(d).toBeLessThanOrEqual(ShellParameters.distMax);
    });

    it('reads 0 when the attempt matches the target', () => {
      expect(ShellParameters.Shell1().distance(ShellParameters.Shell1())).toBe(0);
    });

    it('moves the same amount for each played parameter across its full range', () => {
      const readings = ShellParameters.playedParameterKeys.map(key =>
        shell().distance(shell({ [key]: maximums[key] })));
      for (const [i, reading] of readings.entries()) {
        expect(reading).withContext(ShellParameters.playedParameterKeys[i]).toBeCloseTo(50, 0);
      }
      expect(Math.max(...readings) - Math.min(...readings)).toBeLessThanOrEqual(1);
    });

    it('ignores the parameters the game copies from the target', () => {
      const copied = shell({
        b: ShellParameters.bMax, mu: ShellParameters.muMax, omega: ShellParameters.omegaMax,
        phi: ShellParameters.phiMax, theta: ShellParameters.thetaMax,
      });
      expect(shell().distance(copied)).toBe(0);
    });
  });
});

import { ShellParameters } from './shell-parameters';

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
});

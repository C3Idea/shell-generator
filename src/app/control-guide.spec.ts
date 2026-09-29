import { AppStrings } from './app-strings';
import { ControlGuide } from './control-guide';

// The initial screen's guide (#5): which controls it points at, in reading
// order, and its on/off state.
describe('ControlGuide (#5)', () => {
  let guide: ControlGuide;

  beforeEach(() => {
    guide = new ControlGuide();
  });

  it('starts off, with no callouts', () => {
    expect(guide.on).toBeFalse();
    expect(guide.callouts).toBeNull();
  });

  it('turns on with one callout per control, in reading order', () => {
    guide.toggle();
    expect(guide.on).toBeTrue();
    expect(guide.callouts!.map(c => c.anchor)).toEqual([
      '#parameters-button', '#save-image-button', '#game-button', '#intro-button', '#help-button',
      '#shell-region', '#visualization-button',
    ]);
  });

  it('gives each callout its own title, text and id', () => {
    guide.toggle();
    const callouts = guide.callouts!;
    expect(callouts.map(c => c.title)).toEqual([
      AppStrings.GUIDE_PARAMETERS_TITLE, AppStrings.GUIDE_SAVE_IMAGE_TITLE, AppStrings.GUIDE_GAME_TITLE,
      AppStrings.GUIDE_INTRO_TITLE, AppStrings.GUIDE_HELP_TITLE, AppStrings.GUIDE_VIEW_TITLE,
      AppStrings.GUIDE_VISUALIZATION_TITLE,
    ]);
    expect(callouts.map(c => c.text)).toEqual([
      AppStrings.GUIDE_PARAMETERS_TEXT, AppStrings.GUIDE_SAVE_IMAGE_TEXT, AppStrings.GUIDE_GAME_TEXT,
      AppStrings.GUIDE_INTRO_TEXT, AppStrings.GUIDE_HELP_TEXT, AppStrings.GUIDE_VIEW_TEXT,
      AppStrings.GUIDE_VISUALIZATION_TEXT,
    ]);
    expect(new Set(callouts.map(c => c.id)).size).toBe(callouts.length);
    callouts.forEach(c => expect(c.id).toMatch(/^guide-/));
  });

  it('keeps each callout short: a title and one short line', () => {
    guide.toggle();
    guide.callouts!.forEach(c => {
      expect(c.title.length).withContext(c.title).toBeGreaterThan(0);
      expect(c.title.length).withContext(c.title).toBeLessThanOrEqual(20);
      expect(c.text.length).withContext(c.text).toBeGreaterThan(0);
      expect(c.text.length).withContext(c.text).toBeLessThanOrEqual(52);
    });
  });

  it('marks only the 3D view as a region', () => {
    guide.toggle();
    expect(guide.callouts!.filter(c => c.region).map(c => c.anchor)).toEqual(['#shell-region']);
  });

  it("the \"?\" callout says how to close the guide", () => {
    guide.toggle();
    const help = guide.callouts!.find(c => c.anchor === '#help-button')!;
    expect(help.text).toMatch(/cerrar/i);
  });

  it('lists every bubble id for the "?" button\'s aria-controls', () => {
    guide.toggle();
    expect(guide.controls).toBe(guide.callouts!.map(c => c.id).join(' '));
  });

  it('refresh() hands out a new list while on, so the bubbles are placed again', () => {
    guide.toggle();
    const first = guide.callouts;
    guide.refresh();
    expect(guide.callouts).not.toBe(first);
    expect(guide.callouts).toEqual(first);
    guide.close();
    guide.refresh();
    expect(guide.callouts).toBeNull();
  });

  it('turns off when toggled again, and when closed', () => {
    guide.toggle();
    expect(guide.callouts).withContext('on first').not.toBeNull();
    guide.toggle();
    expect(guide.on).toBeFalse();
    expect(guide.callouts).toBeNull();
    guide.toggle();
    guide.close();
    expect(guide.on).toBeFalse();
    expect(guide.callouts).toBeNull();
  });
});

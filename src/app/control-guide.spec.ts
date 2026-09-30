import { AppStrings } from './app-strings';
import { ControlGuide, GAME_GUIDE, SANDBOX_GUIDE } from './control-guide';

// The initial screen's guide (#5): which controls it points at, in reading
// order, and its on/off state.
describe('ControlGuide (#5)', () => {
  let guide: ControlGuide;

  beforeEach(() => {
    guide = new ControlGuide(SANDBOX_GUIDE);
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

  it("uses the owner's wording (approved on #5, 2026-09-29)", () => {
    guide.toggle();
    expect(guide.callouts!.map(c => [c.title, c.text])).toEqual([
      ['Parámetros', 'Controla la forma del caracol.'],
      ['Guardar imagen', 'Descarga el caracol como PNG.'],
      ['Juego', 'Juega a reconstruir un caracol objetivo.'],
      ['Bienvenida', 'Las matemáticas que dan forma a los caracoles.'],
      ['Ayuda', 'Toca de nuevo para cerrar.'],
      ['Vista 3D', 'Arrastra para girar; rueda o pellizca para acercar.'],
      ['Apariencia', 'Resolución, esqueleto y colores.'],
    ]);
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

// The game's guide (#35): the same class with the game's own ten callouts.
describe('ControlGuide on the game (#35)', () => {
  let guide: ControlGuide;

  beforeEach(() => {
    guide = new ControlGuide(GAME_GUIDE);
    guide.toggle();
  });

  it('shows the list it was given', () => {
    expect(guide.callouts!.length).toBe(10);
    expect(guide.callouts).toEqual(GAME_GUIDE);
    expect(new ControlGuide(SANDBOX_GUIDE).controls).not.toBe(guide.controls);
  });

  it('points at the ten game controls, in reading order', () => {
    expect(guide.callouts!.map(c => c.anchor)).toEqual([
      '#parameters-button', '#save-image-button', '#home-button', '#howto-button', '#help-button',
      '#shell-region', '#toggle-switch', '#result-container', '#new-game-button', '#share-button',
    ]);
  });

  it('gives each callout its own id, and none clashes with the initial screen\'s', () => {
    const ids = guide.callouts!.map(c => c.id);
    expect(ids.length).toBe(10);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach(id => expect(id).toMatch(/^guide-game-/));
    const sandboxIds = SANDBOX_GUIDE.map(c => c.id);
    ids.forEach(id => expect(sandboxIds).not.toContain(id));
  });

  it('uses the wording drafted on #35', () => {
    expect(guide.callouts!.map(c => [c.title, c.text])).toEqual([
      ['Parámetros', 'Ajusta tu caracol para acercarlo al objetivo.'],
      ['Guardar imagen', 'Descarga el caracol como PNG.'],
      ['Inicio', 'Vuelve a la pantalla inicial.'],
      ['Cómo jugar', 'Abre las instrucciones del juego.'],
      ['Ayuda', 'Toca de nuevo para cerrar.'],
      ['Vista 3D', 'Arrastra para girar; rueda o pellizca para acercar.'],
      ['Usuario / Objetivo', 'Tu caracol (blanco) o el objetivo (dorado).'],
      ['Cercanía', 'Qué tan cerca estás del objetivo.'],
      ['Nuevo juego', 'Empieza otra partida, al azar o con una clave.'],
      ['Compartir', 'Copia un enlace para retar a alguien con tu caracol.'],
    ]);
  });

  it('reuses the initial screen\'s strings for the "?", the camera and the 3D view', () => {
    const byAnchor = (a: string) => guide.callouts!.find(c => c.anchor === a)!;
    expect(byAnchor('#help-button').text).toBe(AppStrings.GUIDE_HELP_TEXT);
    expect(byAnchor('#save-image-button').text).toBe(AppStrings.GUIDE_SAVE_IMAGE_TEXT);
    expect(byAnchor('#shell-region').text).toBe(AppStrings.GUIDE_VIEW_TEXT);
  });

  it('keeps each callout short: a title and one short line', () => {
    expect(guide.callouts!.length).toBe(10);
    guide.callouts!.forEach(c => {
      expect(c.title.length).withContext(c.title).toBeGreaterThan(0);
      expect(c.title.length).withContext(c.title).toBeLessThanOrEqual(20);
      expect(c.text.length).withContext(c.text).toBeGreaterThan(0);
      expect(c.text.length).withContext(c.text).toBeLessThanOrEqual(52);
    });
  });

  it('marks only the 3D view as a region', () => {
    expect(guide.callouts!.filter(c => c.region).map(c => c.anchor)).toEqual(['#shell-region']);
  });
});

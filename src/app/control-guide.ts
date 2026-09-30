import { AppStrings } from './app-strings';
import { Callout } from './callout/callout.component';

// The initial screen's guide (#5): a callout beside every control, in
// reading order (the toolbar left to right, the "?" in the top-right corner,
// the 3D view, the pencil); a screen reader hears them in this order. The
// anchors are the controls' ids; the 3D view's is #shell-region, an
// invisible box the screen keeps over the drawn shell, so its bubble points
// at the shell.
export const SANDBOX_GUIDE: Callout[] = [
  { id: 'guide-parameters', anchor: '#parameters-button', title: AppStrings.GUIDE_PARAMETERS_TITLE, text: AppStrings.GUIDE_PARAMETERS_TEXT },
  { id: 'guide-save-image', anchor: '#save-image-button', title: AppStrings.GUIDE_SAVE_IMAGE_TITLE, text: AppStrings.GUIDE_SAVE_IMAGE_TEXT },
  { id: 'guide-game', anchor: '#game-button', title: AppStrings.GUIDE_GAME_TITLE, text: AppStrings.GUIDE_GAME_TEXT },
  { id: 'guide-intro', anchor: '#intro-button', title: AppStrings.GUIDE_INTRO_TITLE, text: AppStrings.GUIDE_INTRO_TEXT },
  { id: 'guide-help', anchor: '#help-button', title: AppStrings.GUIDE_HELP_TITLE, text: AppStrings.GUIDE_HELP_TEXT },
  { id: 'guide-view', anchor: '#shell-region', title: AppStrings.GUIDE_VIEW_TITLE, text: AppStrings.GUIDE_VIEW_TEXT, region: true },
  { id: 'guide-visualization', anchor: '#visualization-button', title: AppStrings.GUIDE_VISUALIZATION_TITLE, text: AppStrings.GUIDE_VISUALIZATION_TEXT },
];

// The game's guide (#35), in reading order: the toolbar left to right, the
// "?" in the top-right corner, then the bottom row (the Usuario/Objetivo
// switch, the heat bar, Nuevo juego and Compartir). No bubble for the 3D
// view: with the bottom row's, too crowded (owner, 2026-09-30).
export const GAME_GUIDE: Callout[] = [
  { id: 'guide-game-parameters', anchor: '#parameters-button', title: AppStrings.GUIDE_GAME_PARAMETERS_TITLE, text: AppStrings.GUIDE_GAME_PARAMETERS_TEXT },
  { id: 'guide-game-save-image', anchor: '#save-image-button', title: AppStrings.GUIDE_SAVE_IMAGE_TITLE, text: AppStrings.GUIDE_SAVE_IMAGE_TEXT },
  { id: 'guide-game-home', anchor: '#home-button', title: AppStrings.GUIDE_GAME_HOME_TITLE, text: AppStrings.GUIDE_GAME_HOME_TEXT },
  { id: 'guide-game-howto', anchor: '#howto-button', title: AppStrings.GUIDE_GAME_HOWTO_TITLE, text: AppStrings.GUIDE_GAME_HOWTO_TEXT },
  { id: 'guide-game-help', anchor: '#help-button', title: AppStrings.GUIDE_HELP_TITLE, text: AppStrings.GUIDE_HELP_TEXT },
  { id: 'guide-game-switch', anchor: '#toggle-switch', title: AppStrings.GUIDE_GAME_SWITCH_TITLE, text: AppStrings.GUIDE_GAME_SWITCH_TEXT },
  { id: 'guide-game-heat', anchor: '#result-container', title: AppStrings.GUIDE_GAME_HEAT_TITLE, text: AppStrings.GUIDE_GAME_HEAT_TEXT },
  { id: 'guide-game-new-game', anchor: '#new-game-button', title: AppStrings.GUIDE_GAME_NEW_GAME_TITLE, text: AppStrings.GUIDE_GAME_NEW_GAME_TEXT },
  { id: 'guide-game-share', anchor: '#share-button', title: AppStrings.GUIDE_GAME_SHARE_TITLE, text: AppStrings.GUIDE_GAME_SHARE_TEXT },
];

// Whether the guide is on, and its callouts while it is: the list the
// screen passes in (SANDBOX_GUIDE or GAME_GUIDE). The "?" button toggles it;
// the screen decides when to close it, as with ParameterHelp.
export class ControlGuide {
  on = false;
  callouts: Callout[] | null = null;

  // The bubbles' ids, for the "?" button's aria-controls.
  readonly controls: string;

  constructor(private readonly list: Callout[]) {
    this.controls = list.map(c => c.id).join(' ');
  }

  toggle(): void {
    if (this.on) {
      this.close();
      return;
    }
    this.on = true;
    this.callouts = this.list;
  }

  // A new list while on, so the callout places its bubbles again (after the
  // shell moves or the window resizes).
  refresh(): void {
    if (this.on) {
      this.callouts = [...this.list];
    }
  }

  close(): void {
    this.on = false;
    this.callouts = null;
  }
}

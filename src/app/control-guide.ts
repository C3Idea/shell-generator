import { AppStrings } from './app-strings';
import { Callout } from './callout/callout.component';

// The initial screen's guide (#5): a callout beside every control, in
// reading order (the toolbar left to right, the 3D view, the pencil). The
// anchors are the controls' ids; the 3D view is a region, so its bubble
// points at the shell in the middle of it.
const GUIDE: Callout[] = [
  { id: 'guide-parameters', anchor: '#parameters-button', title: AppStrings.GUIDE_PARAMETERS_TITLE, text: AppStrings.GUIDE_PARAMETERS_TEXT },
  { id: 'guide-save-image', anchor: '#save-image-button', title: AppStrings.GUIDE_SAVE_IMAGE_TITLE, text: AppStrings.GUIDE_SAVE_IMAGE_TEXT },
  { id: 'guide-game', anchor: '#game-button', title: AppStrings.GUIDE_GAME_TITLE, text: AppStrings.GUIDE_GAME_TEXT },
  { id: 'guide-intro', anchor: '#intro-button', title: AppStrings.GUIDE_INTRO_TITLE, text: AppStrings.GUIDE_INTRO_TEXT },
  { id: 'guide-help', anchor: '#help-button', title: AppStrings.GUIDE_HELP_TITLE, text: AppStrings.GUIDE_HELP_TEXT },
  { id: 'guide-view', anchor: '#canvas', title: AppStrings.GUIDE_VIEW_TITLE, text: AppStrings.GUIDE_VIEW_TEXT, region: true },
  { id: 'guide-visualization', anchor: '#visualization-button', title: AppStrings.GUIDE_VISUALIZATION_TITLE, text: AppStrings.GUIDE_VISUALIZATION_TEXT },
];

// Whether the guide is on, and its callouts while it is. The "?" button
// toggles it; the screen decides when to close it, as with ParameterHelp.
export class ControlGuide {
  on = false;
  callouts: Callout[] | null = null;

  // The bubbles' ids, for the "?" button's aria-controls.
  readonly controls = GUIDE.map(c => c.id).join(' ');

  toggle(): void {
    if (this.on) {
      this.close();
      return;
    }
    this.on = true;
    this.callouts = GUIDE;
  }

  close(): void {
    this.on = false;
    this.callouts = null;
  }
}

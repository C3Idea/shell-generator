import { AppStrings } from './app-strings';
import { Callout } from './callout/callout.component';

// Help for each parameter's ⓘ (#6), shown in a callout beside it. The key is
// the ⓘ's id without its "-help-button" suffix.
export type HelpKey = 'A' | 'alpha' | 'beta' | 'a' | 'b' | 'theta' | 'qual';

const HELP: Record<HelpKey, [title: string, text: string]> = {
  A:     [AppStrings.LABEL_PARAM_A_HELP_TITLE,     AppStrings.LABEL_PARAM_A_HELP_CONTENT],
  alpha: [AppStrings.LABEL_PARAM_ALPHA_HELP_TITLE, AppStrings.LABEL_PARAM_ALPHA_HELP_CONTENT],
  beta:  [AppStrings.LABEL_PARAM_BETA_HELP_TITLE,  AppStrings.LABEL_PARAM_BETA_HELP_CONTENT],
  a:     [AppStrings.LABEL_PARAM_A1_HELP_TITLE,    AppStrings.LABEL_PARAM_A1_HELP_CONTENT],
  b:     [AppStrings.LABEL_PARAM_B_HELP_TITLE,     AppStrings.LABEL_PARAM_B_HELP_CONTENT],
  theta: [AppStrings.LABEL_PARAM_THETA_HELP_TITLE, AppStrings.LABEL_PARAM_THETA_HELP_CONTENT],
  qual:  [AppStrings.LABEL_PARAM_QUAL_TITLE,       AppStrings.LABEL_PARAM_QUAL_CONTENT],
};

export function parameterHelp(key: HelpKey): Callout {
  const [title, text] = HELP[key];
  return { id: calloutId(key), title, text, anchor: `#${key}-help-button` };
}

// The bubble's id, which the ⓘ points at with aria-controls.
export function calloutId(key: HelpKey): string {
  return `callout-${key}`;
}

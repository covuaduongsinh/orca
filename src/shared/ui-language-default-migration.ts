import type { GlobalSettings } from './global-settings-types'
import { UI_LANGUAGE_VIETNAMESE, normalizeUiLanguage } from './ui-language'

type UiLanguageDefaultSettings = Pick<
  GlobalSettings,
  'uiLanguage' | 'uiLanguageDefaultedToVietnamese'
>

export function normalizeUiLanguageDefaultToVietnamese(
  settings: Partial<UiLanguageDefaultSettings> | undefined
): UiLanguageDefaultSettings {
  const migrated = settings?.uiLanguageDefaultedToVietnamese === true

  return {
    // Why: profiles created before Vietnamese became the default carry no uiLanguage (or an
    // inherited 'system'), so flip them once and preserve every later explicit choice.
    uiLanguage: migrated ? normalizeUiLanguage(settings?.uiLanguage) : UI_LANGUAGE_VIETNAMESE,
    uiLanguageDefaultedToVietnamese: true
  }
}

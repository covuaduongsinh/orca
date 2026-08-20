import { describe, expect, it } from 'vitest'

import { normalizeUiLanguageDefaultToVietnamese } from './ui-language-default-migration'

describe('normalizeUiLanguageDefaultToVietnamese', () => {
  it('flips a profile that predates the Vietnamese default', () => {
    expect(normalizeUiLanguageDefaultToVietnamese({ uiLanguage: 'system' })).toEqual({
      uiLanguage: 'vi',
      uiLanguageDefaultedToVietnamese: true
    })
  })

  it('flips a profile with no stored language at all', () => {
    expect(normalizeUiLanguageDefaultToVietnamese(undefined)).toEqual({
      uiLanguage: 'vi',
      uiLanguageDefaultedToVietnamese: true
    })
  })

  it('preserves an explicit choice made after the migration ran', () => {
    expect(
      normalizeUiLanguageDefaultToVietnamese({
        uiLanguage: 'en',
        uiLanguageDefaultedToVietnamese: true
      })
    ).toEqual({ uiLanguage: 'en', uiLanguageDefaultedToVietnamese: true })
  })

  it('does not re-flip a migrated profile that later chose system', () => {
    expect(
      normalizeUiLanguageDefaultToVietnamese({
        uiLanguage: 'system',
        uiLanguageDefaultedToVietnamese: true
      })
    ).toEqual({ uiLanguage: 'system', uiLanguageDefaultedToVietnamese: true })
  })

  it('sanitizes a migrated profile carrying an unsupported language', () => {
    expect(
      normalizeUiLanguageDefaultToVietnamese({
        uiLanguage: 'fr' as never,
        uiLanguageDefaultedToVietnamese: true
      })
    ).toEqual({ uiLanguage: 'system', uiLanguageDefaultedToVietnamese: true })
  })
})

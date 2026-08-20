/**
 * Profile for specs that keep the onboarding overlay visible (`dismissOnboarding: false`) but
 * must not inherit the product's default UI language, which is Vietnamese.
 *
 * Omitting the `onboarding` key leaves `closedAt` null, so the overlay still renders. The
 * telemetry and tab-switch cohorts are the only two settings persistence derives from "did a
 * profile file exist on load" (`migrateTelemetry` / `migrateTabSwitchKeybindings` in
 * `src/main/persistence.ts`), so pin them to their fresh-install answers — writing any file at
 * all would otherwise classify the profile as an existing-user upgrade and mount the telemetry
 * notice overlay over the UI under test.
 */
export function getE2EPendingOnboardingProfile() {
  return {
    settings: {
      // Why: E2E assertions are written in English. The flag stops the Vietnamese-default
      // migration in `normalizeUiLanguageDefaultToVietnamese` from re-flipping this.
      uiLanguage: 'en',
      uiLanguageDefaultedToVietnamese: true,
      tabSwitchKeybindingSeed: 'done',
      telemetry: {
        optedIn: true,
        installId: '00000000-0000-4000-8000-000000000000',
        existedBeforeTelemetryRelease: false
      }
    }
  }
}

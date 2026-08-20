import { expect, test } from './helpers/orca-app'

test.use({ dismissOnboarding: false, seedTestRepo: false, seedPendingOnboardingProfile: false })
test.skip(process.platform !== 'win32', 'Fresh-profile fsync regression is Windows-only')

test('fresh Windows profile reaches onboarding @windows-fresh-startup-golden', async ({
  orcaPage
}) => {
  // Why no locale seed: this golden exists to exercise the empty-userData profile-index
  // path, so it boots in the product default language. Assert the onboarding modal's
  // structure instead of its copy.
  await expect(orcaPage.locator('[data-onboarding-modal] h1')).toBeVisible({
    timeout: 30_000
  })
})

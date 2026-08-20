import { expect, test } from './helpers/orca-app'

test.skip(process.platform === 'win32', 'POSIX fresh-startup golden; Windows has its own suite')

test.describe('POSIX fresh startup golden', () => {
  test.use({ dismissOnboarding: false, seedTestRepo: false, seedPendingOnboardingProfile: false })

  test('fresh profile reaches onboarding normally @posix-profile-index-golden', async ({
    orcaPage
  }) => {
    // Why no locale seed: this golden exists to exercise the empty-userData profile-index
    // path, so it boots in the product default language. Assert the onboarding modal's
    // structure instead of its copy.
    await expect(orcaPage.locator('[data-onboarding-modal] h1')).toBeVisible({
      timeout: 30_000
    })
  })
})

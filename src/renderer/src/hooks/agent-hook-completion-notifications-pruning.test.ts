import { describe, expect, it } from 'vitest'
import {
  hookStatus,
  mockStoreState,
  PANE_KEY,
  useAgentHookCompletionNotificationsTestLifecycle
} from './agent-hook-completion-notifications-test-harness'

describe('agent hook completion notifications coordinator pruning', () => {
  const paneKey = PANE_KEY
  useAgentHookCompletionNotificationsTestLifecycle()

  const MANY_PANES = [
    { tabId: 'tab-1', leafId: '11111111-1111-4111-8111-111111111111', ptyId: 'pty-1' },
    { tabId: 'tab-2', leafId: '22222222-2222-4222-8222-222222222222', ptyId: 'pty-2' },
    { tabId: 'tab-3', leafId: '33333333-3333-4333-8333-333333333333', ptyId: 'pty-3' },
    { tabId: 'tab-4', leafId: '44444444-4444-4444-8444-444444444444', ptyId: 'pty-4' },
    { tabId: 'tab-5', leafId: '55555555-5555-4555-8555-555555555555', ptyId: 'pty-5' }
  ]

  function seedManyLivePanes(): void {
    mockStoreState.ptyIdsByTabId = Object.fromEntries(MANY_PANES.map((p) => [p.tabId, [p.ptyId]]))
    mockStoreState.tabsByWorktree = {
      'wt-1': MANY_PANES.map((p) => ({ id: p.tabId, ptyId: p.ptyId }))
    }
  }

  it('prunes only the coordinators whose panes lost liveness, keeping the rest', async () => {
    seedManyLivePanes()
    const {
      _getAgentHookCompletionNotificationCoordinatorCountForTest,
      observeAgentHookCompletionForNotification,
      syncAgentHookCompletionNotificationSettings
    } = await import('./agent-hook-completion-notifications')

    for (const pane of MANY_PANES) {
      observeAgentHookCompletionForNotification({
        paneKey: `${pane.tabId}:${pane.leafId}`,
        worktreeId: 'wt-1',
        payload: hookStatus('working')
      })
    }
    expect(_getAgentHookCompletionNotificationCoordinatorCountForTest()).toBe(MANY_PANES.length)

    // Remove liveness for two panes (both the tab hint and the pty list).
    mockStoreState.tabsByWorktree = {
      'wt-1': MANY_PANES.slice(0, 3).map((p) => ({ id: p.tabId, ptyId: p.ptyId }))
    }
    mockStoreState.ptyIdsByTabId = Object.fromEntries(
      MANY_PANES.slice(0, 3).map((p) => [p.tabId, [p.ptyId]])
    )
    syncAgentHookCompletionNotificationSettings()

    expect(_getAgentHookCompletionNotificationCoordinatorCountForTest()).toBe(3)
  })

  it('gates cosmetic store updates but still prunes after a pane closes', async () => {
    const {
      _getAgentHookCompletionNotificationCoordinatorCountForTest,
      observeAgentHookCompletionForNotification,
      syncAgentHookCompletionNotificationsForStoreUpdate
    } = await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })

    const beforeCosmeticUpdate = { ...mockStoreState }
    mockStoreState.tabsByWorktree = {
      'wt-1': [{ id: 'tab-1', ptyId: 'pty-1' }]
    }
    expect(
      syncAgentHookCompletionNotificationsForStoreUpdate(mockStoreState, beforeCosmeticUpdate)
    ).toBe(false)
    expect(_getAgentHookCompletionNotificationCoordinatorCountForTest()).toBe(1)

    const beforeClose = { ...mockStoreState }
    mockStoreState.tabsByWorktree = { 'wt-1': [] }
    mockStoreState.ptyIdsByTabId = {}
    expect(syncAgentHookCompletionNotificationsForStoreUpdate(mockStoreState, beforeClose)).toBe(
      true
    )
    expect(_getAgentHookCompletionNotificationCoordinatorCountForTest()).toBe(0)
  })

  it('skips tab scans until a pane-liveness slice changes', async () => {
    seedManyLivePanes()
    const {
      observeAgentHookCompletionForNotification,
      syncAgentHookCompletionNotificationSettings
    } = await import('./agent-hook-completion-notifications')

    for (const pane of MANY_PANES) {
      observeAgentHookCompletionForNotification({
        paneKey: `${pane.tabId}:${pane.leafId}`,
        worktreeId: 'wt-1',
        payload: hookStatus('working')
      })
    }

    // Count full tab-map enumerations rather than cheap reference reads.
    const realTabs = mockStoreState.tabsByWorktree
    let tabEnumerationCount = 0
    mockStoreState.tabsByWorktree = new Proxy(realTabs, {
      ownKeys(target) {
        tabEnumerationCount += 1
        return Reflect.ownKeys(target)
      }
    })

    syncAgentHookCompletionNotificationSettings()

    expect(tabEnumerationCount).toBe(1)

    syncAgentHookCompletionNotificationSettings()

    expect(tabEnumerationCount).toBe(1)

    mockStoreState.ptyIdsByTabId = { ...mockStoreState.ptyIdsByTabId }
    syncAgentHookCompletionNotificationSettings()

    expect(tabEnumerationCount).toBe(2)
  })
})

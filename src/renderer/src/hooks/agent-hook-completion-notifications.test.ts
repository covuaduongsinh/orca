import { describe, expect, it, vi } from 'vitest'
import { YOLO_TUI_AGENT_ARGS } from '../../../shared/tui-agent-permissions'
import { createHookListenerState } from '../../../shared/agent-hook-listener/listener-state'
import { normalizeHookPayload } from '../../../shared/agent-hook-listener'
import {
  dispatchAgentHookTerminalLifecycle,
  dispatchTerminalNotification,
  HOOK_DONE_QUIET_MS,
  hookStatus,
  mockStoreState,
  PANE_KEY,
  seedCodexPaneLaunchConfig,
  useAgentHookCompletionNotificationsTestLifecycle
} from './agent-hook-completion-notifications-test-harness'

describe('agent hook completion notifications', () => {
  const paneKey = PANE_KEY
  useAgentHookCompletionNotificationsTestLifecycle()

  // Why: the Codex permission-pause tests share a working→pause sequence.
  async function observeCodexPermissionPause(state: 'waiting' | 'blocked'): Promise<void> {
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: {
        state,
        prompt: 'implement notifications',
        agentType: 'codex',
        toolName: 'exec_command',
        toolInput: 'git status'
      }
    })
  }

  it('keeps completion tracking active across desktop notification changes', async () => {
    mockStoreState.settings.notifications.agentTaskComplete = false
    mockStoreState.settings.notifications.permissionNeeded = false
    const {
      observeAgentHookCompletionForNotification,
      syncAgentHookCompletionNotificationSettings
    } = await import('./agent-hook-completion-notifications')

    syncAgentHookCompletionNotificationSettings()
    mockStoreState.settings.notifications.agentTaskComplete = true
    syncAgentHookCompletionNotificationSettings()

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('done')
    })

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('done')
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(2)
    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-task-complete',
        paneKey,
        agentStatusSnapshot: expect.objectContaining({
          state: 'done',
          agentType: 'codex',
          prompt: 'implement notifications',
          lastAssistantMessage: 'Done.'
        })
      })
    )
  }, 15_000)

  it('offers hook completion to mobile while desktop notifications and attention are disabled', async () => {
    mockStoreState.settings.notifications.agentTaskComplete = false
    mockStoreState.settings.notifications.permissionNeeded = false
    mockStoreState.settings.experimentalTerminalAttention = false
    const {
      observeAgentHookCompletionForNotification,
      syncAgentHookCompletionNotificationSettings
    } = await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('done')
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchAgentHookTerminalLifecycle).toHaveBeenCalledWith(
      paneKey,
      expect.objectContaining({ state: 'done', agentType: 'codex' })
    )
    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)

    mockStoreState.settings.notifications.agentTaskComplete = true
    syncAgentHookCompletionNotificationSettings()
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
  })

  it('uses tab-level PTY liveness when an inactive pane leaf binding is temporarily missing', async () => {
    mockStoreState.terminalLayoutsByTabId = {
      'tab-1': {
        root: { type: 'leaf', leafId: '11111111-1111-4111-8111-111111111111' },
        activeLeafId: '11111111-1111-4111-8111-111111111111',
        expandedLeafId: null,
        ptyIdsByLeafId: {}
      }
    }
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('done')
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-task-complete',
        paneKey,
        agentStatusSnapshot: expect.objectContaining({
          state: 'done',
          agentType: 'codex',
          prompt: 'implement notifications',
          lastAssistantMessage: 'Done.'
        })
      })
    )
  })

  it('uses tab-level PTY liveness when an inactive layout is empty', async () => {
    mockStoreState.terminalLayoutsByTabId = {
      'tab-1': {
        root: null,
        activeLeafId: null,
        expandedLeafId: null,
        ptyIdsByLeafId: {}
      }
    }
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('done')
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-task-complete',
        paneKey,
        agentStatusSnapshot: expect.objectContaining({
          state: 'done',
          agentType: 'codex',
          prompt: 'implement notifications',
          lastAssistantMessage: 'Done.'
        })
      })
    )
  })

  it('uses accepted hook status for an inactive tab before PTY liveness catches up', async () => {
    mockStoreState.ptyIdsByTabId = {
      'tab-1': []
    }
    mockStoreState.terminalLayoutsByTabId = {
      'tab-1': {
        root: { type: 'leaf', leafId: '11111111-1111-4111-8111-111111111111' },
        activeLeafId: '11111111-1111-4111-8111-111111111111',
        expandedLeafId: null,
        ptyIdsByLeafId: {}
      }
    }
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('done')
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-task-complete',
        paneKey,
        agentStatusSnapshot: expect.objectContaining({
          state: 'done',
          agentType: 'codex',
          prompt: 'implement notifications',
          lastAssistantMessage: 'Done.'
        })
      })
    )
  })

  it('does not fire a completion notification for a session-boundary done row', async () => {
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    // Why: Claude SessionStart lands as a sessionBoundary 'done' so a resumed session gets
    // its sidebar row while idle (STA-3386) — connecting to a session is not completing a turn.
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: {
        state: 'done',
        prompt: '',
        agentType: 'claude',
        sessionBoundary: true,
        stateStartedAt: 1_700_000_000_000
      }
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).not.toHaveBeenCalled()

    // Why: the resumed session's next real turn must still notify normally.
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: { ...hookStatus('working'), agentType: 'claude' }
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: { ...hookStatus('done'), agentType: 'claude', stateStartedAt: 1_700_000_020_000 }
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
  })

  it('prunes retained coordinators when pane liveness is removed from the store', async () => {
    const {
      _getAgentHookCompletionNotificationCoordinatorCountForTest,
      observeAgentHookCompletionForNotification,
      syncAgentHookCompletionNotificationSettings
    } = await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })

    expect(_getAgentHookCompletionNotificationCoordinatorCountForTest()).toBe(1)

    mockStoreState.ptyIdsByTabId = {
      'tab-1': []
    }
    mockStoreState.tabsByWorktree = {}
    syncAgentHookCompletionNotificationSettings()

    expect(_getAgentHookCompletionNotificationCoordinatorCountForTest()).toBe(0)
  })

  it('does not start a coordinator for an intentionally suppressed pty', async () => {
    mockStoreState.ptyIdsByTabId = {
      'tab-1': []
    }
    mockStoreState.suppressedPtyExitIds = {
      'pty-1': true
    }
    const {
      _getAgentHookCompletionNotificationCoordinatorCountForTest,
      observeAgentHookCompletionForNotification
    } = await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('done')
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(_getAgentHookCompletionNotificationCoordinatorCountForTest()).toBe(0)
    expect(dispatchTerminalNotification).not.toHaveBeenCalled()
  })

  it('notifies when a Claude permission request needs input without completing the task', async () => {
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: {
        state: 'working',
        prompt: 'edit package.json',
        agentType: 'claude',
        stateStartedAt: 1_700_000_000_000
      }
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: {
        state: 'waiting',
        prompt: 'edit package.json',
        agentType: 'claude',
        toolName: 'Edit',
        toolInput: 'package.json',
        stateStartedAt: 1_700_000_010_000
      }
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-permission-needed',
        paneKey,
        agentStatusSnapshot: expect.objectContaining({
          state: 'waiting',
          agentType: 'claude',
          prompt: 'edit package.json',
          toolName: 'Edit',
          toolInput: 'package.json'
        })
      })
    )
  })

  it('suppresses the permission-needed OS notification when disabled in settings, but keeps in-app tracking', async () => {
    mockStoreState.settings.notifications.permissionNeeded = false
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: {
        state: 'working',
        prompt: 'edit package.json',
        agentType: 'claude',
        stateStartedAt: 1_700_000_000_000
      }
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: {
        state: 'waiting',
        prompt: 'edit package.json',
        agentType: 'claude',
        toolName: 'Edit',
        toolInput: 'package.json',
        stateStartedAt: 1_700_000_010_000
      }
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-permission-needed',
        paneKey
      })
    )
  })

  it('fails open for Codex auto-approved permission requests without launch proof', async () => {
    seedCodexPaneLaunchConfig(paneKey, YOLO_TUI_AGENT_ARGS.codex ?? '')
    await observeCodexPermissionPause('waiting')

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
  })

  it('still notifies for manual Codex permission requests', async () => {
    seedCodexPaneLaunchConfig(paneKey, '')
    await observeCodexPermissionPause('waiting')

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-permission-needed',
        paneKey,
        terminalTitle: 'codex'
      })
    )
  })

<<<<<<< HEAD
  it('notifies for a blocked Codex permission request', async () => {
    seedCodexPaneLaunchConfig(paneKey, '')
    await observeCodexPermissionPause('blocked')

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
  })

=======
>>>>>>> upstream/main
  it('does not notify on Grok routine permission prompt notifications during tool use', async () => {
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')
    const listenerState = createHookListenerState()
    const observeGrokHook = (payload: Record<string, unknown>): void => {
      const event = normalizeHookPayload(
        listenerState,
        'grok',
        {
          paneKey,
          tabId: 'tab-1',
          worktreeId: 'wt-1',
          payload
        },
        'production'
      )
      if (!event) {
        return
      }
      observeAgentHookCompletionForNotification({
        paneKey: event.paneKey,
        worktreeId: event.worktreeId ?? 'wt-1',
        payload: event.payload
      })
    }

    observeGrokHook({
      hookEventName: 'user_prompt_submit',
      prompt: 'run shell and glob'
    })
    observeGrokHook({
      hookEventName: 'pre_tool_use',
      toolName: 'Shell',
      toolInput: { command: 'echo hi' }
    })
    observeGrokHook({
      hookEventName: 'notification',
      notificationType: 'permission_prompt',
      message: 'Tool permission requested',
      level: 'info'
    })
    observeGrokHook({
      hookEventName: 'pre_tool_use',
      toolName: 'Glob',
      toolInput: { pattern: '**/package.json' }
    })
    observeGrokHook({
      hookEventName: 'notification',
      notificationType: 'permission_prompt',
      message: 'Tool permission requested',
      level: 'info'
    })

    expect(dispatchTerminalNotification).not.toHaveBeenCalled()

    observeGrokHook({
      hookEventName: 'stop',
      lastAssistantMessage: 'Done.'
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-task-complete',
        paneKey,
        agentStatusSnapshot: expect.objectContaining({
          state: 'done',
          agentType: 'grok',
          prompt: 'run shell and glob',
          lastAssistantMessage: 'Done.'
        })
      })
    )
  })

<<<<<<< HEAD
  it('suppresses an internal milestone completion when hook work resumes before quiet', async () => {
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('done')
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS - 1)
    expect(dispatchTerminalNotification).not.toHaveBeenCalled()
    expect(
      dispatchAgentHookTerminalLifecycle.mock.calls.filter(
        ([, payload]) => payload.state === 'done'
      )
    ).toHaveLength(0)

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('working')
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)
    expect(dispatchTerminalNotification).not.toHaveBeenCalled()
    expect(
      dispatchAgentHookTerminalLifecycle.mock.calls.filter(
        ([, payload]) => payload.state === 'done'
      )
    ).toHaveLength(0)

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: hookStatus('done')
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
    expect(dispatchAgentHookTerminalLifecycle).toHaveBeenCalledWith(
      paneKey,
      expect.objectContaining({ state: 'done', agentType: 'codex' })
    )
    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-task-complete',
        paneKey,
        agentStatusSnapshot: expect.objectContaining({
          state: 'done',
          agentType: 'codex',
          prompt: 'implement notifications',
          lastAssistantMessage: 'Done.'
        })
      })
    )
  })

  // Why: coordinator-pruning across many panes (partial prune, cosmetic-update
  // gating, tab-scan skip) is covered in agent-hook-completion-notifications-pruning.test.ts.
=======
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
>>>>>>> upstream/main
})

import { describe, expect, it, vi } from 'vitest'
import { YOLO_TUI_AGENT_ARGS } from '../../../shared/tui-agent-permissions'
import { createHookListenerState } from '../../../shared/agent-hook-listener/listener-state'
import { normalizeHookPayload } from '../../../shared/agent-hook-listener'
import {
  CODEX_ATTENTION_QUIET_MS,
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

  // Why: the Codex permission-pause tests share a working→pause→quiet-window
  // sequence; centralizing it keeps the debounce advance (issue #8387) in one spot.
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
    vi.advanceTimersByTime(CODEX_ATTENTION_QUIET_MS)
  }

  it('requires fresh working after notifications start disabled and later re-enable', async () => {
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

    expect(dispatchTerminalNotification).not.toHaveBeenCalled()

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
  }, 15_000)

  it('accepts hook lifecycle while every completion alert consumer is disabled', async () => {
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
    expect(dispatchTerminalNotification).not.toHaveBeenCalled()

    mockStoreState.settings.notifications.agentTaskComplete = true
    syncAgentHookCompletionNotificationSettings()
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).not.toHaveBeenCalled()
  })

  it('tracks hook completion for terminal attention when OS completion notifications are disabled', async () => {
    mockStoreState.settings.experimentalTerminalAttention = true
    mockStoreState.settings.notifications.agentTaskComplete = false
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

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
        suppressOsNotification: true
      })
    )
  }, 15_000)

  // Why: tab-level PTY liveness edge cases (empty layout, missing leaf binding,
  // pre-liveness hook acceptance) are unit-tested directly against
  // agent-hook-completion-pane-liveness.ts; see agent-hook-completion-pane-liveness.test.ts.

  it('carries hook stateStartedAt into delayed completion notifications', async () => {
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: { ...hookStatus('working'), stateStartedAt: 1_700_000_000_000 }
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: { ...hookStatus('done'), stateStartedAt: 1_700_000_010_000 }
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledWith(
      'wt-1',
      expect.objectContaining({
        source: 'agent-task-complete',
        paneKey,
        agentStatusSnapshot: expect.objectContaining({
          state: 'done',
          stateStartedAt: 1_700_000_010_000
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

  it('does not notify twice when the same done hook snapshot replays after activation', async () => {
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: { ...hookStatus('working'), stateStartedAt: 1_700_000_000_000 }
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: { ...hookStatus('done'), stateStartedAt: 1_700_000_010_000 }
    })
    vi.advanceTimersByTime(HOOK_DONE_QUIET_MS)

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: { ...hookStatus('done'), stateStartedAt: 1_700_000_010_000 }
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

  it('does not notify on each Cursor shell tool hook during a working turn', async () => {
    const { observeAgentHookCompletionForNotification } =
      await import('./agent-hook-completion-notifications')

    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: {
        state: 'working',
        prompt: 'fix the bug',
        agentType: 'cursor'
      }
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: {
        state: 'working',
        prompt: 'fix the bug',
        agentType: 'cursor',
        toolName: 'Shell',
        toolInput: 'pnpm test'
      }
    })
    observeAgentHookCompletionForNotification({
      paneKey,
      worktreeId: 'wt-1',
      payload: {
        state: 'working',
        prompt: 'fix the bug',
        agentType: 'cursor',
        toolName: 'Read',
        toolInput: '/repo/src/app.ts'
      }
    })

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
        paneKey,
        suppressOsNotification: true
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

  it('fails open for Codex auto-approved blocked permission requests without launch proof', async () => {
    seedCodexPaneLaunchConfig(paneKey, YOLO_TUI_AGENT_ARGS.codex ?? '')
    await observeCodexPermissionPause('blocked')

    expect(dispatchTerminalNotification).toHaveBeenCalledTimes(1)
  })

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
})

/**
 * Shared mock harness for agent-hook-completion-notifications.test.ts and its
 * sibling split-out test files (e.g. the coordinator-pruning suite).
 *
 * The `vi.mock` calls live here rather than in each test file: they must run
 * before `./agent-hook-completion-notifications` is imported, which importing
 * this module first guarantees.
 */
import { afterEach, beforeEach, vi } from 'vitest'
import type { ParsedAgentStatusPayload } from '../../../shared/agent-status-types'

export const dispatchTerminalNotification = vi.fn()
export const dispatchAgentHookTerminalLifecycle = vi.fn()

export type MockStoreState = {
  settings: {
    experimentalTerminalAttention?: boolean
    notifications: {
      enabled: boolean
      agentTaskComplete: boolean
      permissionNeeded?: boolean
    }
  }
  ptyIdsByTabId: Record<string, string[]>
  suppressedPtyExitIds: Record<string, boolean>
  tabsByWorktree: Record<string, { id: string; ptyId?: string | null }[]>
  terminalLayoutsByTabId: Record<
    string,
    {
      root: { type: 'leaf'; leafId: string } | null
      activeLeafId: string | null
      expandedLeafId: string | null
      ptyIdsByLeafId?: Record<string, string>
    }
  >
  agentLaunchConfigByPaneKey: Record<
    string,
    {
      launchConfig: { agentArgs: string; agentEnv: Record<string, string> }
      launchToken?: string
    }
  >
  agentStatusByPaneKey: Record<
    string,
    {
      state: ParsedAgentStatusPayload['state']
      prompt: string
      paneKey: string
      updatedAt: number
      stateStartedAt: number
      agentType?: ParsedAgentStatusPayload['agentType']
      stateHistory: []
    }
  >
  getAgentLaunchConfigForStatusEntry: (entry: {
    paneKey: string
  }) => { agentArgs: string; agentEnv: Record<string, string> } | undefined
  getAgentLaunchConfigForStatusMetadata: (metadata: {
    paneKey: string
    launchToken?: string
  }) => { agentArgs: string; agentEnv: Record<string, string> } | undefined
}

export let mockStoreState: MockStoreState

vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => mockStoreState
  }
}))

vi.mock('@/components/terminal-pane/use-notification-dispatch', () => ({
  dispatchTerminalNotification
}))

vi.mock('@/components/terminal-pane/agent-hook-terminal-lifecycle', () => ({
  dispatchAgentHookTerminalLifecycle
}))

export const PANE_KEY = 'tab-1:11111111-1111-4111-8111-111111111111'
export const HOOK_DONE_QUIET_MS = 1_500
// Why: Codex attention notifications are debounced (issue #8387), so a genuine
// permission pause only notifies once this quiet window elapses without resuming.
export const CODEX_ATTENTION_QUIET_MS = 1_500

export function hookStatus(state: ParsedAgentStatusPayload['state']): ParsedAgentStatusPayload {
  return {
    state,
    prompt: 'implement notifications',
    agentType: 'codex',
    lastAssistantMessage: state === 'done' ? 'Done.' : undefined
  }
}

export function seedCodexPaneLaunchConfig(
  paneKey: string,
  agentArgs: string,
  launchToken = 'launch-token-1'
): void {
  mockStoreState.agentLaunchConfigByPaneKey[paneKey] = {
    launchConfig: {
      agentArgs,
      agentEnv: {}
    },
    launchToken
  }
  mockStoreState.agentStatusByPaneKey[paneKey] = {
    state: 'working',
    prompt: 'implement notifications',
    paneKey,
    updatedAt: Date.now(),
    stateStartedAt: Date.now(),
    agentType: 'codex',
    stateHistory: []
  }
}

function resetMockStoreState(): void {
  mockStoreState = {
    settings: {
      experimentalTerminalAttention: false,
      notifications: {
        enabled: true,
        agentTaskComplete: true,
        permissionNeeded: true
      }
    },
    ptyIdsByTabId: {
      'tab-1': ['pty-1']
    },
    suppressedPtyExitIds: {},
    tabsByWorktree: {
      'wt-1': [{ id: 'tab-1', ptyId: 'pty-1' }]
    },
    terminalLayoutsByTabId: {},
    agentLaunchConfigByPaneKey: {},
    agentStatusByPaneKey: {},
    getAgentLaunchConfigForStatusEntry: (entry) =>
      mockStoreState.agentLaunchConfigByPaneKey[entry.paneKey]?.launchConfig,
    getAgentLaunchConfigForStatusMetadata: (metadata) =>
      metadata.launchToken &&
      metadata.launchToken ===
        mockStoreState.agentLaunchConfigByPaneKey[metadata.paneKey]?.launchToken
        ? mockStoreState.agentLaunchConfigByPaneKey[metadata.paneKey]?.launchConfig
        : undefined
  }
}

/** Registers the shared beforeEach/afterEach for this test suite's fake timers and mock state. */
export function useAgentHookCompletionNotificationsTestLifecycle(): void {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    dispatchTerminalNotification.mockClear()
    dispatchAgentHookTerminalLifecycle.mockClear()
    resetMockStoreState()
  })

  afterEach(() => vi.useRealTimers())
}

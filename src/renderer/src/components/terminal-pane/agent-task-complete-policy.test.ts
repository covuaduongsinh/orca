import { describe, expect, it } from 'vitest'
import {
  isAgentTaskCompleteOsNotificationEnabledFromState,
  isAgentTaskCompleteTrackingEnabledFromState,
  isPermissionNeededOsNotificationEnabledFromState,
  isTerminalAttentionEnabledFromState
} from './agent-task-complete-policy'

function stateWith(
  notifications: Partial<{
    enabled: boolean
    agentTaskComplete: boolean
    permissionNeeded: boolean
  }>,
  experimentalTerminalAttention = false
): Parameters<typeof isAgentTaskCompleteTrackingEnabledFromState>[0] {
  return {
    settings: {
      notifications: {
        enabled: true,
        agentTaskComplete: true,
        terminalBell: true,
        permissionNeeded: true,
        suppressWhenFocused: false,
        customSoundId: 'system',
        customSoundPath: null,
        customSoundVolume: 1,
        ...notifications
      },
      experimentalTerminalAttention
    }
  }
}

describe('isAgentTaskCompleteTrackingEnabledFromState', () => {
  it('stays enabled when only permissionNeeded is on and agentTaskComplete is off', () => {
    // Regression: a pane waiting on permission must still be tracked (and thus
    // notify) when the user disabled "Agent Task Complete" but left
    // "Permission Needed" on — permissionNeeded must not be a dead setting.
    const state = stateWith({ agentTaskComplete: false, permissionNeeded: true })

    expect(isAgentTaskCompleteOsNotificationEnabledFromState(state)).toBe(false)
    expect(isPermissionNeededOsNotificationEnabledFromState(state)).toBe(true)
    expect(isAgentTaskCompleteTrackingEnabledFromState(state)).toBe(true)
  })

  it('stays enabled when only agentTaskComplete is on and permissionNeeded is off', () => {
    const state = stateWith({ agentTaskComplete: true, permissionNeeded: false })

    expect(isAgentTaskCompleteTrackingEnabledFromState(state)).toBe(true)
  })

  it('falls back to the experimental terminal-attention marker', () => {
    const state = stateWith(
      { agentTaskComplete: false, permissionNeeded: false },
      /* experimentalTerminalAttention */ true
    )

    expect(isTerminalAttentionEnabledFromState(state)).toBe(true)
    expect(isAgentTaskCompleteTrackingEnabledFromState(state)).toBe(true)
  })

  it('disables tracking only when every consumer is off', () => {
    const state = stateWith({ agentTaskComplete: false, permissionNeeded: false })

    expect(isAgentTaskCompleteTrackingEnabledFromState(state)).toBe(false)
  })

  it('disables tracking when notifications are globally off, regardless of per-source toggles', () => {
    const state = stateWith({ enabled: false, agentTaskComplete: true, permissionNeeded: true })

    expect(isAgentTaskCompleteTrackingEnabledFromState(state)).toBe(false)
  })
})

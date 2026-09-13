import { describe, expect, it } from 'vitest'
import type { GlobalSettings } from '../../../../shared/global-settings-types'
import {
  isAgentTaskCompleteOsNotificationEnabledFromState,
  isAgentTaskCompleteTrackingEnabledFromState,
  isPermissionNeededOsNotificationEnabledFromState,
  isTerminalAttentionEnabledFromState
} from './agent-task-complete-policy'

type PolicySettingsState = {
  settings: Pick<GlobalSettings, 'notifications' | 'experimentalTerminalAttention'> | null
}

function stateWith(
  notifications: Partial<{
    enabled: boolean
    agentTaskComplete: boolean
    permissionNeeded: boolean
  }> = {},
  experimentalTerminalAttention = false
): PolicySettingsState {
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

describe('agent-task-complete-policy', () => {
  describe('isAgentTaskCompleteTrackingEnabledFromState', () => {
    it('is enabled when settings are hydrated', () => {
      const state = stateWith({ agentTaskComplete: false, permissionNeeded: false })
      expect(isAgentTaskCompleteTrackingEnabledFromState(state)).toBe(true)
    })

    it('is disabled before settings hydrate (null settings)', () => {
      expect(isAgentTaskCompleteTrackingEnabledFromState({ settings: null })).toBe(false)
    })
  })

  describe('isAgentTaskCompleteOsNotificationEnabledFromState', () => {
    it('returns true when globally enabled and agentTaskComplete is true', () => {
      const state = stateWith({ enabled: true, agentTaskComplete: true })
      expect(isAgentTaskCompleteOsNotificationEnabledFromState(state)).toBe(true)
    })

    it('returns false when agentTaskComplete is false', () => {
      const state = stateWith({ enabled: true, agentTaskComplete: false })
      expect(isAgentTaskCompleteOsNotificationEnabledFromState(state)).toBe(false)
    })

    it('returns false when notifications are globally disabled', () => {
      const state = stateWith({ enabled: false, agentTaskComplete: true })
      expect(isAgentTaskCompleteOsNotificationEnabledFromState(state)).toBe(false)
    })
  })

  describe('isPermissionNeededOsNotificationEnabledFromState', () => {
    it('returns true when globally enabled and permissionNeeded is true', () => {
      const state = stateWith({ enabled: true, permissionNeeded: true })
      expect(isPermissionNeededOsNotificationEnabledFromState(state)).toBe(true)
    })

    it('returns false when permissionNeeded is false', () => {
      const state = stateWith({ enabled: true, permissionNeeded: false })
      expect(isPermissionNeededOsNotificationEnabledFromState(state)).toBe(false)
    })

    it('returns false when notifications are globally disabled', () => {
      const state = stateWith({ enabled: false, permissionNeeded: true })
      expect(isPermissionNeededOsNotificationEnabledFromState(state)).toBe(false)
    })
  })

  describe('isTerminalAttentionEnabledFromState', () => {
    it('returns true when experimentalTerminalAttention is true', () => {
      const state = stateWith({}, true)
      expect(isTerminalAttentionEnabledFromState(state)).toBe(true)
    })

    it('returns false when experimentalTerminalAttention is false', () => {
      const state = stateWith({}, false)
      expect(isTerminalAttentionEnabledFromState(state)).toBe(false)
    })
  })
})

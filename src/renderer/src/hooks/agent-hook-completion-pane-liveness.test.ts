import { beforeEach, describe, expect, it, vi } from 'vitest'

type MockStoreState = {
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
}

let mockStoreState: MockStoreState

vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => mockStoreState
  }
}))

import {
  getPtyIdForPaneKey,
  paneCanReceiveHookCompletion
} from './agent-hook-completion-pane-liveness'

const paneKey = 'tab-1:11111111-1111-4111-8111-111111111111'

describe('agent hook completion pane liveness', () => {
  beforeEach(() => {
    mockStoreState = {
      ptyIdsByTabId: { 'tab-1': ['pty-1'] },
      suppressedPtyExitIds: {},
      tabsByWorktree: { 'wt-1': [{ id: 'tab-1', ptyId: 'pty-1' }] },
      terminalLayoutsByTabId: {}
    }
  })

  it('resolves tab-level PTY liveness when an inactive pane leaf binding is temporarily missing', () => {
    mockStoreState.terminalLayoutsByTabId = {
      'tab-1': {
        root: { type: 'leaf', leafId: '11111111-1111-4111-8111-111111111111' },
        activeLeafId: '11111111-1111-4111-8111-111111111111',
        expandedLeafId: null,
        ptyIdsByLeafId: {}
      }
    }

    expect(getPtyIdForPaneKey(paneKey)).toBe('pty-1')
    expect(paneCanReceiveHookCompletion(paneKey)).toBe(true)
  })

  it('resolves tab-level PTY liveness when an inactive layout is empty', () => {
    mockStoreState.terminalLayoutsByTabId = {
      'tab-1': { root: null, activeLeafId: null, expandedLeafId: null, ptyIdsByLeafId: {} }
    }

    expect(getPtyIdForPaneKey(paneKey)).toBe('pty-1')
    expect(paneCanReceiveHookCompletion(paneKey)).toBe(true)
  })

  it('falls back to the accepted-hook PTY hint for an inactive tab before PTY liveness catches up', () => {
    mockStoreState.ptyIdsByTabId = { 'tab-1': [] }
    mockStoreState.terminalLayoutsByTabId = {
      'tab-1': {
        root: { type: 'leaf', leafId: '11111111-1111-4111-8111-111111111111' },
        activeLeafId: '11111111-1111-4111-8111-111111111111',
        expandedLeafId: null,
        ptyIdsByLeafId: {}
      }
    }

    // Why: no live pty yet, but the tab record's own ptyId hint keeps the pane
    // eligible so an accepted hook status is not dropped before liveness catches up.
    expect(getPtyIdForPaneKey(paneKey)).toBeNull()
    expect(paneCanReceiveHookCompletion(paneKey)).toBe(true)
  })

  it('reports no liveness once the only PTY hint is intentionally suppressed', () => {
    mockStoreState.ptyIdsByTabId = { 'tab-1': [] }
    mockStoreState.suppressedPtyExitIds = { 'pty-1': true }

    expect(getPtyIdForPaneKey(paneKey)).toBeNull()
    expect(paneCanReceiveHookCompletion(paneKey)).toBe(false)
  })
})

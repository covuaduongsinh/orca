import { parsePaneKey } from '../../../../shared/stable-pane-id'
import type { TerminalLayoutSnapshot } from '../../../../shared/terminal-tab-types'

type NotificationPaneVisibilityState = {
  activeWorktreeId: string | null
  activeTabId: string | null
  terminalLayoutsByTabId?: Record<string, TerminalLayoutSnapshot>
}

export function isOrcaWindowForegroundFocused(): boolean {
  if (typeof document === 'undefined') {
    return true
  }
  return document.visibilityState === 'visible' && document.hasFocus()
}

/** Whether `paneKey` is the selected tab/leaf in-app, independent of OS window focus. */
export function isActiveSelectedPaneKey(
  state: NotificationPaneVisibilityState,
  worktreeId: string,
  paneKey: string
): boolean {
  if (state.activeWorktreeId !== worktreeId) {
    return false
  }

  const parsed = parsePaneKey(paneKey)
  if (!parsed || state.activeTabId !== parsed.tabId) {
    return false
  }

  return state.terminalLayoutsByTabId?.[parsed.tabId]?.activeLeafId === parsed.leafId
}

export function isVisibleForegroundPaneKey(
  state: NotificationPaneVisibilityState,
  worktreeId: string,
  paneKey: string
): boolean {
  return isOrcaWindowForegroundFocused() && isActiveSelectedPaneKey(state, worktreeId, paneKey)
}

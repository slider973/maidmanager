import { createSignal, createResource, Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import type { UserSession } from '../../lib/types/database'
import * as sessionService from '../../services/session.service'
import { LoadingButton } from '../ui/LoadingButton'
import { showSuccess, showError } from '../ui/Toast'
import { useAuth } from '../../lib/auth'

export const SessionList: Component = () => {
  const { signOut } = useAuth()
  const [deletingId, setDeletingId] = createSignal<string | null>(null)
  const [deletingAll, setDeletingAll] = createSignal(false)

  const [sessions, { refetch }] = createResource(async () => {
    const result = await sessionService.getSessions()
    if (result.error) {
      throw new Error(result.error)
    }
    return result.data
  })

  const currentSession = () => sessions()?.find(s => s.is_current)
  const otherSessions = () => sessions()?.filter(s => !s.is_current) || []

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingId(sessionId)
    const { error } = await sessionService.deleteSession(sessionId)

    if (error) {
      showError(error)
    } else {
      showSuccess('Session déconnectée')
      refetch()
    }
    setDeletingId(null)
  }

  const handleDeleteAllOtherSessions = async () => {
    const current = currentSession()
    if (!current) return

    setDeletingAll(true)

    // Delete from our tracking table
    const { error } = await sessionService.deleteOtherSessions(current.id)

    if (error) {
      showError(error)
    } else {
      // Also sign out other Supabase sessions
      await signOut('others')
      showSuccess('Tous les autres appareils ont été déconnectés')
      refetch()
    }
    setDeletingAll(false)
  }

  const getDeviceIcon = (session: UserSession) => {
    const os = session.os?.toLowerCase() || ''
    if (os.includes('ios') || os.includes('iphone') || os.includes('ipad')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      )
    }
    if (os.includes('android')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      )
    }
    // Default: desktop/laptop
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  }

  return (
    <div class="session-list">
      <Show when={sessions.loading}>
        <div class="session-loading">
          <div class="loading-spinner" />
          <span>Chargement des sessions...</span>
        </div>
      </Show>

      <Show when={sessions.error}>
        <div class="session-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Erreur lors du chargement des sessions</span>
        </div>
      </Show>

      <Show when={!sessions.loading && !sessions.error && sessions()?.length === 0}>
        <div class="session-empty">
          <span>Aucune session active</span>
        </div>
      </Show>

      <Show when={!sessions.loading && !sessions.error && (sessions()?.length ?? 0) > 0}>
        {/* Current Session */}
        <Show when={currentSession()}>
          {(session) => (
            <div class="session-item session-current">
              <div class="session-icon">
                {getDeviceIcon(session())}
              </div>
              <div class="session-info">
                <div class="session-device">
                  <span class="session-browser">{session().browser || 'Navigateur inconnu'}</span>
                  <span class="session-badge">Session actuelle</span>
                </div>
                <div class="session-details">
                  <span class="session-os">{session().os || 'Système inconnu'}</span>
                  <span class="session-separator">•</span>
                  <span class="session-time">{sessionService.formatRelativeTime(session().last_active_at)}</span>
                </div>
              </div>
            </div>
          )}
        </Show>

        {/* Other Sessions */}
        <Show when={otherSessions().length > 0}>
          <div class="session-divider">
            <span>Autres appareils ({otherSessions().length})</span>
          </div>

          <For each={otherSessions()}>
            {(session) => (
              <div class="session-item">
                <div class="session-icon">
                  {getDeviceIcon(session)}
                </div>
                <div class="session-info">
                  <div class="session-device">
                    <span class="session-browser">{session.browser || 'Navigateur inconnu'}</span>
                  </div>
                  <div class="session-details">
                    <span class="session-os">{session.os || 'Système inconnu'}</span>
                    <span class="session-separator">•</span>
                    <span class="session-time">{sessionService.formatRelativeTime(session.last_active_at)}</span>
                  </div>
                </div>
                <LoadingButton
                  class="btn-ghost btn-sm"
                  loading={deletingId() === session.id}
                  onClick={() => handleDeleteSession(session.id)}
                >
                  Déconnecter
                </LoadingButton>
              </div>
            )}
          </For>

          {/* Disconnect All Button */}
          <div class="session-actions">
            <LoadingButton
              class="btn-outline btn-danger"
              loading={deletingAll()}
              onClick={handleDeleteAllOtherSessions}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Déconnecter tous les autres appareils
            </LoadingButton>
          </div>
        </Show>
      </Show>
    </div>
  )
}

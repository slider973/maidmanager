/**
 * WorkSessionList Component
 * Displays a list of work sessions (prestations)
 */

import { Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import { WorkSessionCard } from './WorkSessionCard'
import type { WorkSessionWithStaff } from '../../lib/types/payments.types'

interface WorkSessionListProps {
  sessions: WorkSessionWithStaff[]
  loading: boolean
  error: string | null
  onEdit?: (session: WorkSessionWithStaff) => void
  onDelete?: (session: WorkSessionWithStaff) => void
  /** Hide staff info on cards (useful when shown in staff detail page) */
  hideStaff?: boolean
  /** Empty state message */
  emptyMessage?: string
}

export const WorkSessionList: Component<WorkSessionListProps> = (props) => {
  return (
    <div class="work-session-list">
      {/* Loading state */}
      <Show when={props.loading}>
        <div class="loading-container">
          <div class="loading-spinner" />
          <p>Chargement des prestations...</p>
        </div>
      </Show>

      {/* Error state */}
      <Show when={props.error && !props.loading}>
        <div class="error-state">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{props.error}</p>
        </div>
      </Show>

      {/* Empty state */}
      <Show when={!props.loading && !props.error && props.sessions.length === 0}>
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 14l2 2 4-4" />
          </svg>
          <h3>Aucune prestation</h3>
          <p>{props.emptyMessage || 'Aucune prestation enregistrée pour le moment.'}</p>
        </div>
      </Show>

      {/* Session list */}
      <Show when={!props.loading && !props.error && props.sessions.length > 0}>
        <div class="work-session-grid">
          <For each={props.sessions}>
            {(session) => (
              <WorkSessionCard
                session={session}
                onEdit={props.onEdit}
                onDelete={props.onDelete}
                hideStaff={props.hideStaff}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

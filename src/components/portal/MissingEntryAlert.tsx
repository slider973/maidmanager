/**
 * MissingEntryAlert Component
 * Feature: 009-staff-portal (US2)
 * Alert for unclosed time entries from previous days
 */

import { Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import { timeEntryStore } from '../../stores/timeEntryStore'
import type { TimeEntryWithRelations } from '../../lib/types/portal.types'

export const MissingEntryAlert: Component = () => {
  const hasMissingEntries = () => timeEntryStore.state.missingEntries.length > 0

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Show when={hasMissingEntries()}>
      <div class="missing-entries-alert" role="alert">
        <div class="missing-entries-header">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="missing-entries-icon"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div class="missing-entries-text">
            <h3 class="missing-entries-title">
              Pointages incomplets ({timeEntryStore.state.missingEntries.length})
            </h3>
            <p class="missing-entries-description">
              Vous avez des pointages non clotures. Veuillez contacter votre responsable
              pour regulariser ces heures.
            </p>
          </div>
        </div>

        <div class="missing-entries-list">
          <For each={timeEntryStore.state.missingEntries}>
            {(entry: TimeEntryWithRelations) => (
              <div class="missing-entry-item">
                <div class="missing-entry-date">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formatDate(entry.clock_in_at)}</span>
                </div>
                <div class="missing-entry-details">
                  <span class="missing-entry-client">
                    {entry.client?.name || 'Client inconnu'}
                  </span>
                  <span class="missing-entry-time">
                    Arrive a {formatTime(entry.clock_in_at)}
                  </span>
                </div>
                <div class="missing-entry-badge">
                  <span class="status-badge status-warning">Non cloture</span>
                </div>
              </div>
            )}
          </For>
        </div>

        <div class="missing-entries-help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>
            Ces pointages ne peuvent etre clotures que par votre responsable.
            Les heures seront ajoutees a votre historique une fois regularisees.
          </p>
        </div>
      </div>
    </Show>
  )
}

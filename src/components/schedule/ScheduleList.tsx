/**
 * ScheduleList Component
 * Displays a list of schedule entries
 */

import { Show, For, onMount } from 'solid-js'
import type { Component } from 'solid-js'
import { scheduleStore } from '../../stores/schedule.store'
import { ScheduleCard } from './ScheduleCard'
import type { ScheduleEntryWithStaff } from '../../lib/types/database'

interface ScheduleListProps {
  onEdit?: (entry: ScheduleEntryWithStaff) => void
  onDelete?: (entry: ScheduleEntryWithStaff) => void
  onMarkCompleted?: (entry: ScheduleEntryWithStaff) => void
  onMarkCancelled?: (entry: ScheduleEntryWithStaff) => void
}

export const ScheduleList: Component<ScheduleListProps> = (props) => {
  const { state, actions } = scheduleStore

  // Fetch on mount if not already initialized
  onMount(() => {
    if (!state.initialized && !state.loading) {
      actions.fetch()
    }
  })

  return (
    <div class="schedule-list">
      <Show when={state.loading}>
        <div class="schedule-loading">
          <span class="loading-spinner" />
          <span>Chargement...</span>
        </div>
      </Show>

      <Show when={!state.loading && state.error}>
        <div class="schedule-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{state.error}</span>
        </div>
      </Show>

      <Show when={!state.loading && !state.error && state.initialized}>
        <Show
          when={state.entries.length > 0}
          fallback={
            <div class="schedule-empty">
              <div class="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 class="empty-state-title">Aucune intervention</h3>
              <p class="empty-state-text">
                Planifiez votre première intervention en utilisant le formulaire ci-dessus.
              </p>
            </div>
          }
        >
          <div class="schedule-grid">
            <For each={state.entries}>
              {(entry) => (
                <ScheduleCard
                  entry={entry}
                  onEdit={props.onEdit}
                  onDelete={props.onDelete}
                  onMarkCompleted={props.onMarkCompleted}
                  onMarkCancelled={props.onMarkCancelled}
                />
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  )
}

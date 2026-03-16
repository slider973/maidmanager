/**
 * RoomActionList Component
 * Feature: 009-staff-portal (US3)
 * Display list of room actions for today or current entry
 */

import { Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import { roomActionStore } from '../../stores/roomActionStore'
import { RoomActionCard } from './RoomActionCard'
import { showSuccess, showError } from '../ui/Toast'

interface RoomActionListProps {
  showCurrentEntryOnly?: boolean
  showDeleteButtons?: boolean
}

export const RoomActionList: Component<RoomActionListProps> = (props) => {
  const actions = () => {
    if (props.showCurrentEntryOnly) {
      return roomActionStore.state.currentEntryActions
    }
    return roomActionStore.state.todayActions
  }

  const handleDelete = async (actionId: string) => {
    const confirmed = window.confirm('Supprimer cette action?')
    if (!confirmed) return

    const result = await roomActionStore.actions.deleteAction(actionId)

    if (result.success) {
      showSuccess('Action supprimee')
    } else {
      showError(result.error || 'Erreur lors de la suppression')
    }
  }

  const getActionSummary = () => {
    const actionList = actions()
    if (actionList.length === 0) return null

    // Group by action type
    const summary: Record<string, number> = {}
    for (const action of actionList) {
      const typeName = action.action_type?.name_fr || 'Autre'
      summary[typeName] = (summary[typeName] || 0) + 1
    }

    return Object.entries(summary)
      .map(([name, count]) => `${count} ${name.toLowerCase()}`)
      .join(', ')
  }

  return (
    <div class="room-action-list">
      <Show
        when={!roomActionStore.state.loading}
        fallback={
          <div class="loading-state">
            <span class="loading-spinner" />
            <span>Chargement des actions...</span>
          </div>
        }
      >
        <Show
          when={actions().length > 0}
          fallback={
            <div class="empty-state-small">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              <p>
                {props.showCurrentEntryOnly
                  ? "Pas encore d'actions pour ce pointage"
                  : "Pas d'actions enregistrees aujourd'hui"}
              </p>
            </div>
          }
        >
          {/* Summary */}
          <Show when={getActionSummary()}>
            <div class="room-action-summary">
              <span class="room-action-summary-count">{actions().length}</span>
              <span class="room-action-summary-label">
                action{actions().length > 1 ? 's' : ''} aujourd'hui
              </span>
              <span class="room-action-summary-detail">({getActionSummary()})</span>
            </div>
          </Show>

          {/* Action List */}
          <div class="room-action-list-items">
            <For each={actions()}>
              {(action) => (
                <RoomActionCard
                  action={action}
                  showDeleteButton={props.showDeleteButtons}
                  onDelete={handleDelete}
                />
              )}
            </For>
          </div>
        </Show>
      </Show>

      {/* Error Display */}
      <Show when={roomActionStore.state.error}>
        <div class="alert alert-error">
          <span>{roomActionStore.state.error}</span>
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            onClick={() => roomActionStore.actions.clearError()}
          >
            Fermer
          </button>
        </div>
      </Show>
    </div>
  )
}

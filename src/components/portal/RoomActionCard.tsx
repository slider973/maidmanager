/**
 * RoomActionCard Component
 * Feature: 009-staff-portal (US3)
 * Display a single room action with delete option
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import type { RoomActionWithRelations } from '../../lib/types/portal.types'

interface RoomActionCardProps {
  action: RoomActionWithRelations
  onDelete?: (actionId: string) => void
  showDeleteButton?: boolean
}

export const RoomActionCard: Component<RoomActionCardProps> = (props) => {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div class="room-action-card">
      <div class="room-action-card-icon">
        <Show when={props.action.room_type?.icon} fallback={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        }>
          <span class="room-action-card-emoji">{props.action.room_type?.icon}</span>
        </Show>
      </div>

      <div class="room-action-card-content">
        <div class="room-action-card-header">
          <span class="room-action-card-room">
            {props.action.client_room?.custom_name || props.action.room_type?.name_fr || 'Piece inconnue'}
          </span>
          <span class="room-action-card-time">{formatTime(props.action.performed_at)}</span>
        </div>

        <span class="room-action-card-action">
          {props.action.action_type?.name_fr || 'Action inconnue'}
        </span>

        <Show when={props.action.notes}>
          <p class="room-action-card-notes">{props.action.notes}</p>
        </Show>
      </div>

      <Show when={props.showDeleteButton && props.onDelete}>
        <button
          type="button"
          class="btn btn-ghost btn-icon btn-sm room-action-card-delete"
          onClick={() => props.onDelete?.(props.action.id)}
          aria-label="Supprimer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </Show>
    </div>
  )
}

/**
 * ScheduleCard Component
 * Displays a single schedule entry with staff info and status
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import {
  POSITION_LABELS,
  STATUS_LABELS,
  type ScheduleEntryWithStaff,
  type StaffPosition,
} from '../../lib/types/database'
import { formatMoney } from '../../lib/types/billing.types'

interface ScheduleCardProps {
  entry: ScheduleEntryWithStaff
  onEdit?: (entry: ScheduleEntryWithStaff) => void
  onDelete?: (entry: ScheduleEntryWithStaff) => void
  onMarkCompleted?: (entry: ScheduleEntryWithStaff) => void
  onMarkCancelled?: (entry: ScheduleEntryWithStaff) => void
}

export const ScheduleCard: Component<ScheduleCardProps> = (props) => {
  const formatDate = (dateString: string): { day: string; month: string; year: string } => {
    const date = new Date(dateString)
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('fr-FR', { month: 'long' }),
      year: date.getFullYear().toString(),
    }
  }

  const formatTime = (timeString: string): string => {
    // Time comes as HH:MM:SS or HH:MM, return HH:MM
    return timeString.slice(0, 5)
  }

  const getPositionLabel = (position: string): string => {
    return POSITION_LABELS[position as StaffPosition] || position
  }

  const getStatusClass = (): string => {
    const status = props.entry.status
    if (status === 'completed') return 'schedule-card schedule-card-completed'
    if (status === 'cancelled') return 'schedule-card schedule-card-cancelled'
    return 'schedule-card'
  }

  const getStatusBadgeClass = (): string => {
    const status = props.entry.status
    return `schedule-status schedule-status-${status}`
  }

  const dateInfo = () => formatDate(props.entry.scheduled_date)

  return (
    <div class={getStatusClass()}>
      <div class="schedule-card-header">
        <div class="schedule-card-info">
          {/* Date display */}
          <div class="schedule-card-date">
            {dateInfo().day} {dateInfo().month} {dateInfo().year}
          </div>

          {/* Time display */}
          <div class="schedule-card-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <span>
              {formatTime(props.entry.start_time)}
              <Show when={props.entry.end_time}>
                {' - '}
                {formatTime(props.entry.end_time!)}
              </Show>
            </span>
          </div>

          {/* Description */}
          <p class="schedule-card-description">{props.entry.description}</p>
        </div>

        {/* Status badge */}
        <span class={getStatusBadgeClass()}>
          {STATUS_LABELS[props.entry.status]}
        </span>
      </div>

      {/* Staff member info */}
      <div class="schedule-card-staff">
        <Show
          when={props.entry.staff_member}
          fallback={<span class="schedule-no-staff">Membre supprimé</span>}
        >
          <div class="schedule-staff-avatar">
            {props.entry.staff_member!.first_name.charAt(0)}
            {props.entry.staff_member!.last_name.charAt(0)}
          </div>
          <div class="schedule-staff-info">
            <span class="schedule-staff-name">
              {props.entry.staff_member!.first_name} {props.entry.staff_member!.last_name}
            </span>
            <span class="schedule-staff-position">
              {getPositionLabel(props.entry.staff_member!.position)}
            </span>
          </div>
        </Show>
      </div>

      {/* Client and amount info */}
      <Show when={props.entry.client || props.entry.amount != null}>
        <div class="schedule-card-billing">
          <Show when={props.entry.client}>
            <div class="schedule-billing-client">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>{props.entry.client!.name}</span>
            </div>
          </Show>
          <Show when={props.entry.amount != null && props.entry.amount > 0}>
            <div class="schedule-billing-amount">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>{formatMoney(props.entry.amount!)}</span>
            </div>
          </Show>
        </div>
      </Show>

      {/* Notes */}
      <Show when={props.entry.notes}>
        <div class="schedule-card-notes">
          <p>{props.entry.notes}</p>
        </div>
      </Show>

      {/* Action buttons */}
      <Show when={props.entry.status === 'scheduled'}>
        <div class="schedule-card-actions">
          <Show when={props.onEdit}>
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              onClick={() => props.onEdit?.(props.entry)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Modifier
            </button>
          </Show>

          <Show when={props.onMarkCompleted}>
            <button
              type="button"
              class="btn btn-sm btn-success"
              onClick={() => props.onMarkCompleted?.(props.entry)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12" />
              </svg>
              Terminé
            </button>
          </Show>

          <Show when={props.onMarkCancelled}>
            <button
              type="button"
              class="btn btn-sm btn-warning"
              onClick={() => props.onMarkCancelled?.(props.entry)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Annuler
            </button>
          </Show>

          <Show when={props.onDelete}>
            <button
              type="button"
              class="btn btn-sm btn-danger"
              onClick={() => props.onDelete?.(props.entry)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Supprimer
            </button>
          </Show>
        </div>
      </Show>
    </div>
  )
}

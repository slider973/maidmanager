/**
 * WorkSessionCard Component
 * Displays a single work session (prestation) with staff info and amount
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import { POSITION_LABELS, type StaffPosition } from '../../lib/types/database'
import type { WorkSessionWithStaff } from '../../lib/types/payments.types'
import { formatMoney, formatDuration } from '../../lib/types/payments.types'

interface WorkSessionCardProps {
  session: WorkSessionWithStaff
  onEdit?: (session: WorkSessionWithStaff) => void
  onDelete?: (session: WorkSessionWithStaff) => void
  /** Hide staff info (useful when shown in staff detail page) */
  hideStaff?: boolean
}

export const WorkSessionCard: Component<WorkSessionCardProps> = (props) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getPositionLabel = (position: string): string => {
    return POSITION_LABELS[position as StaffPosition] || position
  }

  return (
    <div class="work-session-card">
      <div class="work-session-card-header">
        <div class="work-session-card-info">
          {/* Description */}
          <h3 class="work-session-card-title">{props.session.description}</h3>

          {/* Date */}
          <div class="work-session-card-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(props.session.session_date)}</span>
          </div>

          {/* Duration and rate */}
          <div class="work-session-card-details">
            <span class="work-session-duration">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {formatDuration(props.session.duration_minutes)}
            </span>
            <span class="work-session-rate">
              à {formatMoney(props.session.hourly_rate_cents)}/h
            </span>
          </div>
        </div>

        {/* Amount */}
        <div class="work-session-card-amount">
          <span class="work-session-amount-value">
            {formatMoney(props.session.amount_cents)}
          </span>
        </div>
      </div>

      {/* Staff member info (if not hidden) */}
      <Show when={!props.hideStaff}>
        <div class="work-session-card-staff">
          <Show
            when={props.session.staff_member}
            fallback={<span class="work-session-no-staff">Membre supprimé</span>}
          >
            <div class="work-session-staff-avatar">
              {props.session.staff_member!.first_name.charAt(0)}
              {props.session.staff_member!.last_name.charAt(0)}
            </div>
            <div class="work-session-staff-info">
              <span class="work-session-staff-name">
                {props.session.staff_member!.first_name} {props.session.staff_member!.last_name}
              </span>
              <span class="work-session-staff-position">
                {getPositionLabel(props.session.staff_member!.position)}
              </span>
            </div>
          </Show>
        </div>
      </Show>

      {/* Notes */}
      <Show when={props.session.notes}>
        <div class="work-session-card-notes">
          <p>{props.session.notes}</p>
        </div>
      </Show>

      {/* Action buttons */}
      <div class="work-session-card-actions">
        <Show when={props.onEdit}>
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            onClick={() => props.onEdit?.(props.session)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
        </Show>

        <Show when={props.onDelete}>
          <button
            type="button"
            class="btn btn-sm btn-danger"
            onClick={() => props.onDelete?.(props.session)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Supprimer
          </button>
        </Show>
      </div>
    </div>
  )
}

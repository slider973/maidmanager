/**
 * EventDetailModal Component
 * Feature: 010-client-schedule-calendar
 *
 * Modal displaying details of a calendar event
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import { A } from '@solidjs/router'
import type { CalendarEvent } from '../../lib/types/calendar.types'
import { formatTime } from '../../services/schedule-calendar.service'

interface EventDetailModalProps {
  event: CalendarEvent | null
  canEdit?: boolean
  onClose: () => void
}

export const EventDetailModal: Component<EventDetailModalProps> = (props) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const statusLabel = () => {
    switch (props.event?.status) {
      case 'scheduled':
        return 'Planifie'
      case 'completed':
        return 'Termine'
      case 'cancelled':
        return 'Annule'
      default:
        return ''
    }
  }

  const statusClass = () => {
    switch (props.event?.status) {
      case 'completed':
        return 'status-badge--success'
      case 'cancelled':
        return 'status-badge--danger'
      default:
        return 'status-badge--info'
    }
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose()
    }
  }

  return (
    <Show when={props.event}>
      <div
        class="modal-backdrop"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
      >
        <div class="modal event-detail-modal">
          <div class="modal-header">
            <h3 id="event-detail-title" class="modal-title">
              Details de l'intervention
            </h3>
            <button
              type="button"
              class="btn btn-ghost btn-icon"
              onClick={props.onClose}
              aria-label="Fermer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            {/* Date */}
            <div class="event-detail-row">
              <div class="event-detail-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div class="event-detail-content">
                <span class="event-detail-label">Date</span>
                <span class="event-detail-value">{formatDate(props.event!.scheduledDate)}</span>
              </div>
            </div>

            {/* Time */}
            <Show when={props.event!.startTime}>
              <div class="event-detail-row">
                <div class="event-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div class="event-detail-content">
                  <span class="event-detail-label">Heure</span>
                  <span class="event-detail-value">
                    {formatTime(props.event!.startTime)}
                    <Show when={props.event!.endTime}>
                      {' '}
                      - {formatTime(props.event!.endTime)}
                    </Show>
                  </span>
                </div>
              </div>
            </Show>

            {/* Staff */}
            <Show when={props.event!.staffMember}>
              <div class="event-detail-row">
                <div class="event-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div class="event-detail-content">
                  <span class="event-detail-label">Employe</span>
                  <span class="event-detail-value">
                    {props.event!.staffMember!.firstName} {props.event!.staffMember!.lastName}
                  </span>
                </div>
              </div>
            </Show>

            {/* Description */}
            <div class="event-detail-row">
              <div class="event-detail-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div class="event-detail-content">
                <span class="event-detail-label">Description</span>
                <span class="event-detail-value">{props.event!.description}</span>
              </div>
            </div>

            {/* Notes */}
            <Show when={props.event!.notes}>
              <div class="event-detail-row">
                <div class="event-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div class="event-detail-content">
                  <span class="event-detail-label">Notes</span>
                  <span class="event-detail-value event-detail-notes">{props.event!.notes}</span>
                </div>
              </div>
            </Show>

            {/* Status */}
            <div class="event-detail-row">
              <div class="event-detail-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div class="event-detail-content">
                <span class="event-detail-label">Statut</span>
                <span class={`status-badge ${statusClass()}`}>{statusLabel()}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" onClick={props.onClose}>
              Fermer
            </button>
            <Show when={props.canEdit}>
              <A
                href={`/schedule?edit=${props.event!.id}`}
                class="btn btn-primary"
                onClick={props.onClose}
              >
                Modifier
              </A>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}

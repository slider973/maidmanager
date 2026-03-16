/**
 * ClientCalendar Component
 * Feature: 010-client-schedule-calendar
 *
 * Calendar wrapper for staff portal - shows staff's own interventions at a client
 */

import { createSignal, Show } from 'solid-js'
import type { Component } from 'solid-js'
import type { CalendarEvent } from '../../lib/types/calendar.types'
import { CalendarView, EventDetailModal } from '../calendar'

interface ClientCalendarProps {
  clientId: string
  clientName: string
  onClose?: () => void
}

export const ClientCalendar: Component<ClientCalendarProps> = (props) => {
  const [selectedEvent, setSelectedEvent] = createSignal<CalendarEvent | null>(null)

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const closeModal = () => {
    setSelectedEvent(null)
  }

  return (
    <div class="portal-client-calendar">
      <div class="portal-client-calendar-header">
        <h2 class="portal-client-calendar-title">
          Calendrier - {props.clientName}
        </h2>
        <Show when={props.onClose}>
          <button
            type="button"
            class="btn btn-ghost btn-icon"
            onClick={props.onClose}
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </Show>
      </div>

      <CalendarView
        clientId={props.clientId}
        showStaffName={false}
        onEventClick={handleEventClick}
      />

      <EventDetailModal
        event={selectedEvent()}
        canEdit={false}
        onClose={closeModal}
      />

      <style>{`
        .portal-client-calendar {
          background: var(--color-ivory);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .portal-client-calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          background: white;
          border-bottom: 1px solid var(--color-cream-dark);
        }

        .portal-client-calendar-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--color-navy);
          margin: 0;
        }

        .portal-client-calendar .calendar-view {
          border: none;
          border-radius: 0;
        }
      `}</style>
    </div>
  )
}

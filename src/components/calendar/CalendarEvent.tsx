/**
 * CalendarEvent Component
 * Feature: 010-client-schedule-calendar
 *
 * Displays a single event in the calendar day cell
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import type { CalendarEvent as CalendarEventType } from '../../lib/types/calendar.types'
import { formatTime } from '../../services/schedule-calendar.service'

interface CalendarEventProps {
  event: CalendarEventType
  showStaffName?: boolean
  onClick?: () => void
}

export const CalendarEvent: Component<CalendarEventProps> = (props) => {
  const statusClass = () => {
    switch (props.event.status) {
      case 'completed':
        return 'calendar-event--completed'
      case 'cancelled':
        return 'calendar-event--cancelled'
      default:
        return 'calendar-event--scheduled'
    }
  }

  const staffName = () => {
    if (!props.event.staffMember) return null
    return `${props.event.staffMember.firstName} ${props.event.staffMember.lastName.charAt(0)}.`
  }

  return (
    <button
      type="button"
      class={`calendar-event ${statusClass()}`}
      onClick={(e) => {
        e.stopPropagation()
        props.onClick?.()
      }}
      title={props.event.description}
    >
      <Show when={props.event.startTime}>
        <span class="calendar-event-time">{formatTime(props.event.startTime)}</span>
      </Show>
      <span class="calendar-event-title">{props.event.description}</span>
      <Show when={props.showStaffName && staffName()}>
        <span class="calendar-event-staff">{staffName()}</span>
      </Show>
    </button>
  )
}

/**
 * CalendarDay Component
 * Feature: 010-client-schedule-calendar
 *
 * Displays a single day cell in the calendar grid with its events
 */

import { For, Show } from 'solid-js'
import type { Component } from 'solid-js'
import type { CalendarDay as CalendarDayType, CalendarEvent as CalendarEventType } from '../../lib/types/calendar.types'
import { CalendarEvent } from './CalendarEvent'

interface CalendarDayProps {
  day: CalendarDayType
  showStaffName?: boolean
  onEventClick?: (event: CalendarEventType) => void
}

export const CalendarDay: Component<CalendarDayProps> = (props) => {
  const dayClass = () => {
    const classes = ['calendar-day']
    if (!props.day.isCurrentMonth) classes.push('calendar-day--other-month')
    if (props.day.isToday) classes.push('calendar-day--today')
    if (props.day.events.length > 0) classes.push('calendar-day--has-events')
    return classes.join(' ')
  }

  return (
    <div class={dayClass()} role="gridcell" aria-label={`${props.day.dayOfMonth}`}>
      <div class="calendar-day-header">
        <span class="calendar-day-number">{props.day.dayOfMonth}</span>
      </div>
      <div class="calendar-day-events">
        <For each={props.day.events}>
          {(event) => (
            <CalendarEvent
              event={event}
              showStaffName={props.showStaffName}
              onClick={() => props.onEventClick?.(event)}
            />
          )}
        </For>
        <Show when={props.day.events.length === 0 && props.day.isCurrentMonth}>
          <div class="calendar-day-empty" />
        </Show>
      </div>
    </div>
  )
}

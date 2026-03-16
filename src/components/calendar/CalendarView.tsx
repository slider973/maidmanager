/**
 * CalendarView Component
 * Feature: 010-client-schedule-calendar
 *
 * Main calendar component with monthly grid and navigation
 */

import { createSignal, createEffect, For, Show } from 'solid-js'
import type { Component } from 'solid-js'
import type { CalendarEvent as CalendarEventType, CalendarMonth } from '../../lib/types/calendar.types'
import {
  getClientScheduleForMonth,
  buildCalendarMonth,
  getMonthName,
  getDayNames,
} from '../../services/schedule-calendar.service'
import { CalendarDay } from './CalendarDay'

interface CalendarViewProps {
  clientId: string
  clientName?: string
  showStaffName?: boolean
  onEventClick?: (event: CalendarEventType) => void
  class?: string
}

export const CalendarView: Component<CalendarViewProps> = (props) => {
  const today = new Date()
  const [year, setYear] = createSignal(today.getFullYear())
  const [month, setMonth] = createSignal(today.getMonth())
  const [calendar, setCalendar] = createSignal<CalendarMonth | null>(null)
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  const loadCalendar = async () => {
    setLoading(true)
    setError(null)

    const result = await getClientScheduleForMonth(props.clientId, year(), month())

    if (result.error) {
      setError(result.error)
      setCalendar(null)
    } else {
      const calendarData = buildCalendarMonth(year(), month(), result.data)
      setCalendar(calendarData)
    }

    setLoading(false)
  }

  // Load calendar when clientId, year, or month changes
  createEffect(() => {
    // Track reactive dependencies
    void props.clientId
    void year()
    void month()
    if (props.clientId) {
      loadCalendar()
    }
  })

  const goToPrevMonth = () => {
    if (month() === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (month() === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToPrevMonth()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goToNextMonth()
    }
  }

  const hasEvents = () => {
    const cal = calendar()
    if (!cal) return false
    return cal.days.some((day) => day.isCurrentMonth && day.events.length > 0)
  }

  return (
    <div
      class={`calendar-view ${props.class || ''}`}
      role="application"
      aria-label="Calendrier des interventions"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header with navigation */}
      <div class="calendar-header">
        <button
          type="button"
          class="btn btn-ghost btn-icon"
          onClick={goToPrevMonth}
          aria-label="Mois precedent"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div class="calendar-title">
          <h2 class="calendar-month-year">
            {getMonthName(month())} {year()}
          </h2>
          <Show when={props.clientName}>
            <span class="calendar-client-name">{props.clientName}</span>
          </Show>
        </div>

        <button
          type="button"
          class="btn btn-ghost btn-icon"
          onClick={goToNextMonth}
          aria-label="Mois suivant"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Today button */}
      <div class="calendar-actions">
        <button type="button" class="btn btn-ghost btn-sm" onClick={goToToday}>
          Aujourd'hui
        </button>
      </div>

      {/* Loading state */}
      <Show when={loading()}>
        <div class="calendar-loading">
          <div class="spinner" />
          <span>Chargement...</span>
        </div>
      </Show>

      {/* Error state */}
      <Show when={error()}>
        <div class="calendar-error">
          <p>{error()}</p>
          <button type="button" class="btn btn-primary btn-sm" onClick={loadCalendar}>
            Reessayer
          </button>
        </div>
      </Show>

      {/* Calendar grid */}
      <Show when={!loading() && !error() && calendar()}>
        <div class="calendar-grid" role="grid" aria-label="Grille du calendrier">
          {/* Day headers */}
          <div class="calendar-weekdays" role="row">
            <For each={getDayNames()}>
              {(dayName) => (
                <div class="calendar-weekday" role="columnheader">
                  {dayName}
                </div>
              )}
            </For>
          </div>

          {/* Day cells */}
          <div class="calendar-days" role="rowgroup">
            <For each={calendar()!.days}>
              {(day) => (
                <CalendarDay
                  day={day}
                  showStaffName={props.showStaffName}
                  onEventClick={props.onEventClick}
                />
              )}
            </For>
          </div>
        </div>

        {/* Empty state */}
        <Show when={!hasEvents()}>
          <div class="calendar-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p>Aucune intervention ce mois-ci</p>
          </div>
        </Show>
      </Show>
    </div>
  )
}

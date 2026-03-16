/**
 * WeekNavigator Component
 * Feature: 009-staff-portal (US4)
 * Navigation between weeks (previous/next)
 */

import type { Component } from 'solid-js'

interface WeekNavigatorProps {
  weekStart: string // YYYY-MM-DD format (Monday)
  onWeekChange: (newWeekStart: string) => void
  disabled?: boolean
}

export const WeekNavigator: Component<WeekNavigatorProps> = (props) => {
  const formatWeekRange = () => {
    const start = new Date(props.weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const startStr = start.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
    const endStr = end.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    return `${startStr} - ${endStr}`
  }

  const goToPreviousWeek = () => {
    const current = new Date(props.weekStart)
    current.setDate(current.getDate() - 7)
    props.onWeekChange(current.toISOString().split('T')[0])
  }

  const goToNextWeek = () => {
    const current = new Date(props.weekStart)
    current.setDate(current.getDate() + 7)
    props.onWeekChange(current.toISOString().split('T')[0])
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust to Monday
    today.setDate(today.getDate() + diff)
    props.onWeekChange(today.toISOString().split('T')[0])
  }

  const isCurrentWeek = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const currentMonday = new Date(today)
    currentMonday.setDate(currentMonday.getDate() + diff)
    return props.weekStart === currentMonday.toISOString().split('T')[0]
  }

  const isFutureWeek = () => {
    const today = new Date()
    const weekStart = new Date(props.weekStart)
    return weekStart > today
  }

  return (
    <div class="week-navigator">
      <button
        type="button"
        class="btn btn-ghost btn-icon"
        onClick={goToPreviousWeek}
        disabled={props.disabled}
        aria-label="Semaine precedente"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6" />
        </svg>
      </button>

      <div class="week-navigator-info">
        <span class="week-navigator-range">{formatWeekRange()}</span>
        {!isCurrentWeek() && (
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            onClick={goToCurrentWeek}
            disabled={props.disabled}
          >
            Aujourd'hui
          </button>
        )}
      </div>

      <button
        type="button"
        class="btn btn-ghost btn-icon"
        onClick={goToNextWeek}
        disabled={props.disabled || isFutureWeek()}
        aria-label="Semaine suivante"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </button>
    </div>
  )
}

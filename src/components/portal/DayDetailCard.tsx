/**
 * DayDetailCard Component
 * Feature: 009-staff-portal (US4)
 * Display detail of a single day's time entries
 */

import { Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import type { TimeEntryWithRelations } from '../../lib/types/portal.types'

interface DayDetailCardProps {
  date: string // YYYY-MM-DD
  entries: TimeEntryWithRelations[]
  totalMinutes: number
  isToday?: boolean
}

export const DayDetailCard: Component<DayDetailCardProps> = (props) => {
  const formatDayName = () => {
    const date = new Date(props.date)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}h${mins.toString().padStart(2, '0')}`
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (entry: TimeEntryWithRelations) => {
    if (entry.status === 'open') {
      return <span class="status-badge status-active">En cours</span>
    }
    if (entry.status === 'cancelled') {
      return <span class="status-badge status-inactive">Annule</span>
    }
    return null
  }

  return (
    <div class={`day-detail-card ${props.isToday ? 'day-detail-card-today' : ''}`}>
      <div class="day-detail-header">
        <div class="day-detail-date">
          <span class="day-detail-day-name">{formatDayName()}</span>
          <Show when={props.isToday}>
            <span class="day-detail-today-badge">Aujourd'hui</span>
          </Show>
        </div>
        <div class="day-detail-total">
          <Show
            when={props.totalMinutes > 0}
            fallback={<span class="day-detail-total-empty">-</span>}
          >
            <span class="day-detail-total-value">{formatDuration(props.totalMinutes)}</span>
          </Show>
        </div>
      </div>

      <Show
        when={props.entries.length > 0}
        fallback={
          <div class="day-detail-empty">
            <span class="text-muted">Pas de pointage</span>
          </div>
        }
      >
        <div class="day-detail-entries">
          <For each={props.entries}>
            {(entry) => (
              <div class="day-detail-entry">
                <div class="day-detail-entry-time">
                  <span class="day-detail-entry-clock-in">{formatTime(entry.clock_in_at)}</span>
                  <span class="day-detail-entry-separator">-</span>
                  <span class="day-detail-entry-clock-out">
                    {entry.clock_out_at ? formatTime(entry.clock_out_at) : '--:--'}
                  </span>
                </div>

                <div class="day-detail-entry-info">
                  <span class="day-detail-entry-client">
                    {entry.client?.name || 'Client inconnu'}
                  </span>
                  <Show when={entry.duration_minutes}>
                    <span class="day-detail-entry-duration">
                      {formatDuration(entry.duration_minutes || 0)}
                    </span>
                  </Show>
                </div>

                {getStatusBadge(entry)}

                <Show when={entry.notes}>
                  <p class="day-detail-entry-notes">{entry.notes}</p>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

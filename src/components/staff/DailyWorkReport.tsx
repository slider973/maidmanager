/**
 * DailyWorkReport Component
 * Feature: 009-staff-portal (US5)
 * Overview of all staff work for a single day
 */

import { createSignal, createResource, Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import { StaffWorkCard } from './StaffWorkCard'
import { getDailyReport } from '../../services/time-entry.service'

interface DailyWorkReportProps {
  onEditEntry?: (entryId: string) => void
  refreshTrigger?: number
}

export const DailyWorkReport: Component<DailyWorkReportProps> = (props) => {
  const [selectedDate, setSelectedDate] = createSignal(
    new Date().toISOString().split('T')[0]
  )

  // Fetch daily report when date or refreshTrigger changes
  const [report] = createResource(
    () => ({ date: selectedDate(), trigger: props.refreshTrigger }),
    async ({ date }) => {
      const result = await getDailyReport(date)
      return result.data
    }
  )

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} minutes`
    if (mins === 0) return `${hours} heures`
    return `${hours}h${mins.toString().padStart(2, '0')}`
  }

  const goToPreviousDay = () => {
    const current = new Date(selectedDate())
    current.setDate(current.getDate() - 1)
    setSelectedDate(current.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const current = new Date(selectedDate())
    current.setDate(current.getDate() + 1)
    setSelectedDate(current.toISOString().split('T')[0])
  }

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const isToday = () => {
    return selectedDate() === new Date().toISOString().split('T')[0]
  }

  const isFuture = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selected = new Date(selectedDate())
    return selected > today
  }

  return (
    <div class="daily-work-report">
      {/* Date Navigator */}
      <div class="date-navigator">
        <button
          type="button"
          class="btn btn-ghost btn-icon"
          onClick={goToPreviousDay}
          disabled={report.loading}
          aria-label="Jour precedent"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>

        <div class="date-navigator-info">
          <input
            type="date"
            class="form-input date-input"
            value={selectedDate()}
            onInput={(e) => setSelectedDate(e.currentTarget.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <span class="date-navigator-formatted">{formatDate(selectedDate())}</span>
          {!isToday() && (
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              onClick={goToToday}
              disabled={report.loading}
            >
              Aujourd'hui
            </button>
          )}
        </div>

        <button
          type="button"
          class="btn btn-ghost btn-icon"
          onClick={goToNextDay}
          disabled={report.loading || isFuture()}
          aria-label="Jour suivant"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </div>

      {/* Summary Stats */}
      <Show when={!report.loading && report()}>
        <div class="daily-work-summary">
          <div class="daily-work-stat">
            <span class="daily-work-stat-value">{report()?.total_staff_count || 0}</span>
            <span class="daily-work-stat-label">
              employe{(report()?.total_staff_count || 0) !== 1 ? 's' : ''}
            </span>
          </div>
          <div class="daily-work-stat">
            <span class="daily-work-stat-value">
              {formatDuration(report()?.total_minutes || 0)}
            </span>
            <span class="daily-work-stat-label">total</span>
          </div>
          <div class="daily-work-stat">
            <span class="daily-work-stat-value">{report()?.total_actions || 0}</span>
            <span class="daily-work-stat-label">actions</span>
          </div>
        </div>
      </Show>

      {/* Loading State */}
      <Show when={report.loading}>
        <div class="loading-state">
          <span class="loading-spinner" />
          <span>Chargement du rapport...</span>
        </div>
      </Show>

      {/* Error State */}
      <Show when={report.error}>
        <div class="alert alert-error">
          <span>Erreur lors du chargement du rapport</span>
        </div>
      </Show>

      {/* Staff Cards */}
      <Show when={!report.loading && !report.error}>
        <div class="staff-work-cards">
          <Show
            when={report()?.staff_summaries && report()!.staff_summaries.length > 0}
            fallback={
              <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                <h3 class="empty-state-title">Aucun travail enregistre</h3>
                <p class="empty-state-text">
                  Aucun employe n'a pointe ce jour.
                </p>
              </div>
            }
          >
            <For each={report()?.staff_summaries}>
              {(staff) => (
                <StaffWorkCard
                  staffMemberId={staff.staff_member_id}
                  staffName={staff.staff_name}
                  totalMinutes={staff.total_minutes}
                  actionCount={staff.action_count}
                  clientsVisited={staff.clients_visited}
                  entries={staff.entries}
                  onEditEntry={props.onEditEntry}
                />
              )}
            </For>
          </Show>
        </div>
      </Show>
    </div>
  )
}

/**
 * StaffHistoryView Component
 * Feature: 009-staff-portal (US4)
 * Weekly history view with totals and day breakdown
 */

import { createSignal, createResource, Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import { WeekNavigator } from './WeekNavigator'
import { DayDetailCard } from './DayDetailCard'
import { getWeekSummary } from '../../services/time-entry.service'
import type { TimeEntryWithRelations } from '../../lib/types/portal.types'

interface StaffHistoryViewProps {
  staffMemberId: string
}

interface DaySummary {
  date: string
  entries: TimeEntryWithRelations[]
  totalMinutes: number
}

// Get Monday of current week
const getCurrentWeekStart = (): string => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust to Monday
  today.setDate(today.getDate() + diff)
  return today.toISOString().split('T')[0]
}

export const StaffHistoryView: Component<StaffHistoryViewProps> = (props) => {
  const [weekStart, setWeekStart] = createSignal(getCurrentWeekStart())

  // Fetch week summary when week changes
  const [weekData] = createResource(
    () => ({ staffId: props.staffMemberId, weekStart: weekStart() }),
    async ({ staffId, weekStart }) => {
      const result = await getWeekSummary(staffId, weekStart)
      return result.data
    }
  )

  // Group entries by day
  const getDaysSummary = (): DaySummary[] => {
    const data = weekData()
    if (!data) return []

    const days: DaySummary[] = []
    const start = new Date(data.week_start)

    // Create 7 days (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      // Filter entries for this day
      const dayEntries = data.entries.filter((entry) => {
        const entryDate = entry.clock_in_at.split('T')[0]
        return entryDate === dateStr
      })

      const totalMinutes = dayEntries.reduce(
        (sum, entry) => sum + (entry.duration_minutes || 0),
        0
      )

      days.push({
        date: dateStr,
        entries: dayEntries,
        totalMinutes,
      })
    }

    return days
  }

  const formatTotalHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} minutes`
    if (mins === 0) return `${hours} heures`
    return `${hours}h${mins.toString().padStart(2, '0')}`
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  return (
    <div class="staff-history-view">
      {/* Week Navigator */}
      <WeekNavigator
        weekStart={weekStart()}
        onWeekChange={setWeekStart}
        disabled={weekData.loading}
      />

      {/* Week Summary */}
      <Show when={!weekData.loading && weekData()}>
        <div class="week-summary-card">
          <div class="week-summary-total">
            <span class="week-summary-total-value">
              {formatTotalHours(weekData()?.total_minutes || 0)}
            </span>
            <span class="week-summary-total-label">cette semaine</span>
          </div>
          <div class="week-summary-stats">
            <div class="week-summary-stat">
              <span class="week-summary-stat-value">
                {weekData()?.entries.length || 0}
              </span>
              <span class="week-summary-stat-label">pointages</span>
            </div>
            <div class="week-summary-stat">
              <span class="week-summary-stat-value">
                {getDaysSummary().filter((d) => d.entries.length > 0).length}
              </span>
              <span class="week-summary-stat-label">jours travailles</span>
            </div>
          </div>
        </div>
      </Show>

      {/* Loading State */}
      <Show when={weekData.loading}>
        <div class="loading-state">
          <span class="loading-spinner" />
          <span>Chargement de l'historique...</span>
        </div>
      </Show>

      {/* Error State */}
      <Show when={weekData.error}>
        <div class="alert alert-error">
          <span>Erreur lors du chargement de l'historique</span>
        </div>
      </Show>

      {/* Days List */}
      <Show when={!weekData.loading && !weekData.error}>
        <div class="days-list">
          <For each={getDaysSummary()}>
            {(day) => (
              <DayDetailCard
                date={day.date}
                entries={day.entries}
                totalMinutes={day.totalMinutes}
                isToday={isToday(day.date)}
              />
            )}
          </For>
        </div>
      </Show>

      {/* Empty State */}
      <Show when={!weekData.loading && weekData() && weekData()!.entries.length === 0}>
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 class="empty-state-title">Aucun pointage cette semaine</h3>
          <p class="empty-state-text">
            Vous n'avez pas de pointages enregistres pour cette semaine.
          </p>
        </div>
      </Show>
    </div>
  )
}

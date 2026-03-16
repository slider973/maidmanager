/**
 * StaffHistoryList Component
 * Displays a unified timeline of work sessions and payments
 */

import { createSignal, createEffect, Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import { getStaffHistory } from '../../services/staff-history.service'
import { formatMoney } from '../../lib/types/payments.types'
import type { HistoryEntry } from '../../lib/types/payments.types'

interface StaffHistoryListProps {
  staffMemberId: string
  refreshTrigger?: number // Increment to trigger refresh
}

export const StaffHistoryList: Component<StaffHistoryListProps> = (props) => {
  const [history, setHistory] = createSignal<HistoryEntry[]>([])
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)

  // Fetch history when staffMemberId changes or refresh is triggered
  createEffect(async () => {
    const staffId = props.staffMemberId
    // Access refreshTrigger to track it for reactivity (used in dependency tracking)
    void props.refreshTrigger

    if (staffId) {
      setLoading(true)
      const result = await getStaffHistory(staffId)
      if (result.error) {
        setError(result.error)
        setHistory([])
      } else {
        setHistory(result.data || [])
        setError(null)
      }
      setLoading(false)
    }
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Group entries by month
  const groupedByMonth = () => {
    const groups: { [key: string]: HistoryEntry[] } = {}

    for (const entry of history()) {
      const date = new Date(entry.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      // Store label in first entry for display
      if (groups[monthKey].length === 0) {
        (entry as any)._monthLabel = monthLabel
      }
      groups[monthKey].push(entry)
    }

    // Convert to array sorted by month (most recent first)
    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([_key, entries]) => entries)
  }

  return (
    <div class="staff-history-list">
      <Show when={loading()}>
        <div class="history-loading">
          <span class="loading-spinner" />
          <span>Chargement de l'historique...</span>
        </div>
      </Show>

      <Show when={!loading() && error()}>
        <div class="history-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error()}</span>
        </div>
      </Show>

      <Show when={!loading() && !error()}>
        <Show
          when={history().length > 0}
          fallback={
            <div class="history-empty">
              <div class="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
              <h3 class="empty-state-title">Aucun historique</h3>
              <p class="empty-state-text">
                Les prestations et paiements apparaîtront ici.
              </p>
            </div>
          }
        >
          <div class="history-timeline">
            <For each={groupedByMonth()}>
              {(monthEntries) => {
                const firstEntry = monthEntries[0] as any
                const monthLabel = firstEntry._monthLabel || ''

                return (
                  <div class="history-month">
                    <div class="history-month-header">
                      <span class="history-month-label">{monthLabel}</span>
                    </div>

                    <div class="history-entries">
                      <For each={monthEntries}>
                        {(entry) => (
                          <div class={`history-entry history-entry-${entry.type}`}>
                            <div class="history-entry-marker">
                              <Show when={entry.type === 'work_session'}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12,6 12,12 16,14" />
                                </svg>
                              </Show>
                              <Show when={entry.type === 'payment'}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                  <line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                              </Show>
                            </div>

                            <div class="history-entry-content">
                              <div class="history-entry-header">
                                <span class="history-entry-date">{formatDate(entry.date)}</span>
                                <span class={`history-entry-amount ${entry.type === 'payment' ? 'amount-negative' : 'amount-positive'}`}>
                                  {entry.type === 'payment' ? '-' : '+'}{formatMoney(Math.abs(entry.amount_cents))}
                                </span>
                              </div>
                              <div class="history-entry-description">{entry.description}</div>
                              <Show when={entry.details}>
                                <div class="history-entry-details">{entry.details}</div>
                              </Show>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                )
              }}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  )
}

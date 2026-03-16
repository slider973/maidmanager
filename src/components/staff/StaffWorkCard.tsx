/**
 * StaffWorkCard Component
 * Feature: 009-staff-portal (US5)
 * Summary of work done by a single staff member for a day
 */

import { Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import type { TimeEntryWithRelations } from '../../lib/types/portal.types'

interface StaffWorkCardProps {
  staffMemberId: string
  staffName: string
  totalMinutes: number
  actionCount: number
  clientsVisited: string[]
  entries: TimeEntryWithRelations[]
  onEditEntry?: (entryId: string) => void
}

export const StaffWorkCard: Component<StaffWorkCardProps> = (props) => {
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

  const getInitials = () => {
    const parts = props.staffName.split(' ')
    return parts.map((p) => p.charAt(0).toUpperCase()).join('')
  }

  return (
    <div class="staff-work-card">
      <div class="staff-work-card-header">
        <div class="staff-work-card-avatar">{getInitials()}</div>
        <div class="staff-work-card-info">
          <h3 class="staff-work-card-name">{props.staffName}</h3>
          <div class="staff-work-card-stats">
            <span class="staff-work-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {formatDuration(props.totalMinutes)}
            </span>
            <span class="staff-work-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              {props.actionCount} action{props.actionCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Clients visited */}
      <Show when={props.clientsVisited.length > 0}>
        <div class="staff-work-card-clients">
          <span class="staff-work-card-clients-label">Clients:</span>
          <div class="staff-work-card-clients-list">
            <For each={props.clientsVisited}>
              {(client) => <span class="staff-work-card-client-badge">{client}</span>}
            </For>
          </div>
        </div>
      </Show>

      {/* Time entries */}
      <div class="staff-work-card-entries">
        <For each={props.entries}>
          {(entry) => (
            <div class="staff-work-entry">
              <div class="staff-work-entry-time">
                <span>{formatTime(entry.clock_in_at)}</span>
                <span class="staff-work-entry-separator">-</span>
                <span>{entry.clock_out_at ? formatTime(entry.clock_out_at) : '--:--'}</span>
              </div>
              <div class="staff-work-entry-info">
                <span class="staff-work-entry-client">{entry.client?.name}</span>
                <Show when={entry.duration_minutes}>
                  <span class="staff-work-entry-duration">
                    {formatDuration(entry.duration_minutes || 0)}
                  </span>
                </Show>
              </div>
              <Show when={entry.status === 'open'}>
                <span class="status-badge status-active">En cours</span>
              </Show>
              <Show when={props.onEditEntry}>
                <button
                  type="button"
                  class="btn btn-ghost btn-icon btn-sm"
                  onClick={() => props.onEditEntry?.(entry.id)}
                  aria-label="Modifier"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </Show>
            </div>
          )}
        </For>
      </div>

      {/* Empty state */}
      <Show when={props.entries.length === 0}>
        <div class="staff-work-card-empty">
          <span class="text-muted">Aucun pointage</span>
        </div>
      </Show>
    </div>
  )
}

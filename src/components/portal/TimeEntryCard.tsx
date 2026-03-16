/**
 * TimeEntryCard Component
 * Feature: 009-staff-portal (US2)
 * Displays current active time entry with live duration
 */

import { createSignal, createEffect, onCleanup, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { timeEntryStore } from '../../stores/timeEntryStore'
import { ClockInButton } from './ClockInButton'
import { ClockOutButton } from './ClockOutButton'

export const TimeEntryCard: Component = () => {
  const [elapsedTime, setElapsedTime] = createSignal({ hours: 0, minutes: 0, seconds: 0 })

  // Update elapsed time every second when clocked in
  createEffect(() => {
    const entry = timeEntryStore.state.currentEntry
    if (!entry?.clock_in_at) {
      setElapsedTime({ hours: 0, minutes: 0, seconds: 0 })
      return
    }

    const updateElapsed = () => {
      const clockIn = new Date(entry.clock_in_at)
      const now = new Date()
      const diffMs = now.getTime() - clockIn.getTime()

      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

      setElapsedTime({ hours, minutes, seconds })
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)

    onCleanup(() => clearInterval(interval))
  })

  const formatTime = (value: number) => value.toString().padStart(2, '0')

  const formatClockInTime = () => {
    const entry = timeEntryStore.state.currentEntry
    if (!entry?.clock_in_at) return ''

    return new Date(entry.clock_in_at).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isLoading = () => timeEntryStore.state.loading && !timeEntryStore.state.initialized
  const isClockedIn = () => !!timeEntryStore.state.currentEntry

  return (
    <div class={`portal-card portal-card-primary ${isClockedIn() ? 'portal-card-active' : ''}`}>
      <div class="portal-card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      </div>

      <h2 class="portal-card-title">Pointage</h2>

      <Show
        when={!isLoading()}
        fallback={
          <div class="loading-state">
            <span class="loading-spinner" />
            <span>Chargement...</span>
          </div>
        }
      >
        <Show
          when={isClockedIn()}
          fallback={
            <>
              <p class="portal-card-description">
                Pointer votre arrivee chez un client
              </p>
              <div class="portal-card-status">
                <span class="status-badge status-inactive">Non pointe</span>
              </div>
              <ClockInButton />
            </>
          }
        >
          <div class="time-entry-active">
            {/* Live Timer */}
            <div class="time-entry-timer">
              <span class="time-entry-timer-value">
                {formatTime(elapsedTime().hours)}:{formatTime(elapsedTime().minutes)}:
                {formatTime(elapsedTime().seconds)}
              </span>
              <span class="time-entry-timer-label">Temps ecoule</span>
            </div>

            {/* Entry Details */}
            <div class="time-entry-details">
              <div class="time-entry-detail">
                <span class="time-entry-detail-label">Client</span>
                <span class="time-entry-detail-value">
                  {timeEntryStore.state.currentEntry?.client?.name || 'Client'}
                </span>
              </div>
              <div class="time-entry-detail">
                <span class="time-entry-detail-label">Arrive a</span>
                <span class="time-entry-detail-value">{formatClockInTime()}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div class="portal-card-status">
              <span class="status-badge status-active">En cours</span>
            </div>

            {/* Notes */}
            <Show when={timeEntryStore.state.currentEntry?.notes}>
              <div class="time-entry-notes">
                <span class="time-entry-notes-label">Notes:</span>
                <span class="time-entry-notes-text">
                  {timeEntryStore.state.currentEntry?.notes}
                </span>
              </div>
            </Show>

            {/* Clock Out Button */}
            <ClockOutButton />
          </div>
        </Show>
      </Show>

      {/* Error Display */}
      <Show when={timeEntryStore.state.error}>
        <div class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{timeEntryStore.state.error}</span>
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            onClick={() => timeEntryStore.actions.clearError()}
          >
            Fermer
          </button>
        </div>
      </Show>
    </div>
  )
}

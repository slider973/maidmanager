/**
 * TimeEntryEditForm Component
 * Feature: 009-staff-portal (US5)
 * Form to edit/correct a time entry (manager only)
 */

import { createSignal, createResource, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import { showSuccess, showError } from '../ui/Toast'
import { api } from '../../lib/api'
import { updateTimeEntry, calculateDuration } from '../../services/time-entry.service'
import type { TimeEntry } from '../../lib/types/portal.types'

interface TimeEntryEditFormProps {
  entryId: string
  onClose: () => void
  onSaved?: () => void
}

export const TimeEntryEditForm: Component<TimeEntryEditFormProps> = (props) => {
  const [saving, setSaving] = createSignal(false)
  const [clockInAt, setClockInAt] = createSignal('')
  const [clockOutAt, setClockOutAt] = createSignal('')
  const [notes, setNotes] = createSignal('')

  // Fetch the entry data
  const [entry] = createResource(
    () => props.entryId,
    async (entryId) => {
      const entryData = await api.get<TimeEntry & {
        client: { id: string; name: string }
        staff_member: { id: string; first_name: string; last_name: string }
      }>(`/time-entries/${entryId}`)

      // Format dates for datetime-local input
      setClockInAt(entryData.clock_in_at.slice(0, 16))
      setClockOutAt(entryData.clock_out_at?.slice(0, 16) || '')
      setNotes(entryData.notes || '')

      return entryData
    }
  )

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    if (!clockInAt()) {
      showError("L'heure d'arrivee est requise")
      return
    }

    setSaving(true)

    try {
      const updates: {
        clock_in_at?: string
        clock_out_at?: string
        notes?: string
      } = {
        clock_in_at: new Date(clockInAt()).toISOString(),
        notes: notes() || undefined,
      }

      if (clockOutAt()) {
        updates.clock_out_at = new Date(clockOutAt()).toISOString()
      }

      const result = await updateTimeEntry(props.entryId, updates)

      if (result.error) {
        showError(result.error)
        setSaving(false)
        return
      }

      // If the entry has a work_session, update it too
      if (result.data?.work_session_id && clockOutAt()) {
        const durationMinutes = calculateDuration(
          updates.clock_in_at!,
          updates.clock_out_at!
        )

        // Get staff hourly rate
        const staff = await api.get<{ hourly_rate_cents: number }>(
          `/staff-members/${result.data.staff_member_id}`
        )

        const hourlyRateCents = staff?.hourly_rate_cents || 0
        const amountCents = Math.round((durationMinutes / 60) * hourlyRateCents)

        // Update work_session
        await api.put(`/work-sessions/${result.data.work_session_id}`, {
          duration_minutes: durationMinutes,
          amount_cents: amountCents,
          session_date: updates.clock_in_at!.split('T')[0],
        })
      }

      showSuccess('Pointage mis a jour')
      props.onSaved?.()
      props.onClose()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const getCalculatedDuration = () => {
    if (!clockInAt() || !clockOutAt()) return null
    const duration = calculateDuration(
      new Date(clockInAt()).toISOString(),
      new Date(clockOutAt()).toISOString()
    )
    const hours = Math.floor(duration / 60)
    const mins = duration % 60
    return `${hours}h${mins.toString().padStart(2, '0')}`
  }

  return (
    <div class="modal-overlay" onClick={props.onClose}>
      <div class="modal modal-md" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2 class="modal-title">Modifier le pointage</h2>
          <button
            type="button"
            class="btn btn-ghost btn-icon"
            onClick={props.onClose}
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <Show
          when={!entry.loading && entry()}
          fallback={
            <div class="modal-body">
              <div class="loading-state">
                <span class="loading-spinner" />
                <span>Chargement...</span>
              </div>
            </div>
          }
        >
          <form onSubmit={handleSubmit}>
            <div class="modal-body">
              {/* Entry Info */}
              <div class="entry-edit-info">
                <div class="entry-edit-info-item">
                  <span class="entry-edit-info-label">Employe</span>
                  <span class="entry-edit-info-value">
                    {entry()?.staff_member?.first_name} {entry()?.staff_member?.last_name}
                  </span>
                </div>
                <div class="entry-edit-info-item">
                  <span class="entry-edit-info-label">Client</span>
                  <span class="entry-edit-info-value">{entry()?.client?.name}</span>
                </div>
              </div>

              {/* Clock In */}
              <div class="form-group">
                <label class="form-label" for="clock-in">
                  Heure d'arrivee <span class="text-error">*</span>
                </label>
                <input
                  id="clock-in"
                  type="datetime-local"
                  class="form-input"
                  value={clockInAt()}
                  onInput={(e) => setClockInAt(e.currentTarget.value)}
                  required
                />
              </div>

              {/* Clock Out */}
              <div class="form-group">
                <label class="form-label" for="clock-out">
                  Heure de sortie
                </label>
                <input
                  id="clock-out"
                  type="datetime-local"
                  class="form-input"
                  value={clockOutAt()}
                  onInput={(e) => setClockOutAt(e.currentTarget.value)}
                  min={clockInAt()}
                />
              </div>

              {/* Calculated Duration */}
              <Show when={getCalculatedDuration()}>
                <div class="entry-edit-duration">
                  <span class="entry-edit-duration-label">Duree calculee:</span>
                  <span class="entry-edit-duration-value">{getCalculatedDuration()}</span>
                </div>
              </Show>

              {/* Notes */}
              <div class="form-group">
                <label class="form-label" for="entry-notes">
                  Notes
                </label>
                <textarea
                  id="entry-notes"
                  class="form-input"
                  rows="3"
                  value={notes()}
                  onInput={(e) => setNotes(e.currentTarget.value)}
                  placeholder="Notes optionnelles..."
                />
              </div>

              {/* Warning */}
              <div class="alert alert-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>
                  La modification du pointage mettra egalement a jour la session de travail associee.
                </span>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" onClick={props.onClose}>
                Annuler
              </button>
              <LoadingButton
                type="submit"
                class="btn btn-primary"
                loading={saving()}
                loadingText="Enregistrement..."
              >
                Enregistrer
              </LoadingButton>
            </div>
          </form>
        </Show>

        {/* Error State */}
        <Show when={entry.error}>
          <div class="modal-body">
            <div class="alert alert-error">
              <span>Erreur lors du chargement du pointage</span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" onClick={props.onClose}>
              Fermer
            </button>
          </div>
        </Show>
      </div>
    </div>
  )
}

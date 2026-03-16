/**
 * WorkSessionForm Component
 * Form for adding or editing a work session (prestation)
 */

import { createSignal, Show, For, onMount, createEffect } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import {
  createWorkSession,
  updateWorkSession,
  validateWorkSession,
} from '../../services/work-session.service'
import { getStaffMembers, getStaffMember } from '../../services/staff.service'
import { showSuccess } from '../ui/Toast'
import type { StaffMember } from '../../lib/types/database'
import type { WorkSessionWithStaff, WorkSessionInsert } from '../../lib/types/payments.types'
import {
  formatMoney,
  hoursToMinutes,
  minutesToHours,
  calculateAmount,
} from '../../lib/types/payments.types'

interface WorkSessionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: WorkSessionWithStaff
  mode?: 'create' | 'edit'
  /** Pre-selected staff member ID (for creating from staff detail page) */
  staffMemberId?: string
  /** Pre-fill from schedule entry */
  scheduleEntryId?: string
  scheduleDescription?: string
}

export const WorkSessionForm: Component<WorkSessionFormProps> = (props) => {
  const [staffMembers, setStaffMembers] = createSignal<StaffMember[]>([])
  const [staffMemberId, setStaffMemberId] = createSignal(props.staffMemberId || '')
  const [sessionDate, setSessionDate] = createSignal('')
  const [durationHours, setDurationHours] = createSignal('')
  const [hourlyRateEuros, setHourlyRateEuros] = createSignal('')
  const [description, setDescription] = createSignal(props.scheduleDescription || '')
  const [notes, setNotes] = createSignal('')
  const [scheduleEntryId] = createSignal(props.scheduleEntryId || null)
  const [error, setError] = createSignal('')
  const [warning, setWarning] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [loadingStaff, setLoadingStaff] = createSignal(true)

  const isEditMode = () => props.mode === 'edit'

  // Calculate amount in cents for display
  const calculatedAmountCents = () => {
    const hours = parseFloat(durationHours()) || 0
    const rate = parseFloat(hourlyRateEuros().replace(',', '.')) || 0
    return calculateAmount(hoursToMinutes(hours), Math.round(rate * 100))
  }

  // Fetch staff members on mount
  onMount(async () => {
    const result = await getStaffMembers({ isActive: true })
    if (!result.error && result.data) {
      setStaffMembers(result.data)
    }
    setLoadingStaff(false)

    // Set today's date as default for new sessions
    if (!isEditMode()) {
      setSessionDate(new Date().toISOString().split('T')[0])
    }
  })

  // Load default hourly rate when staff member changes
  createEffect(async () => {
    const selectedId = staffMemberId()
    if (selectedId && !isEditMode()) {
      const result = await getStaffMember(selectedId)
      if (!result.error && result.data && result.data.hourly_rate_cents > 0) {
        setHourlyRateEuros((result.data.hourly_rate_cents / 100).toString().replace('.', ','))
      }
    }
  })

  // Populate form with initial data when in edit mode
  createEffect(() => {
    if (props.initialData && isEditMode()) {
      setStaffMemberId(props.initialData.staff_member_id)
      setSessionDate(props.initialData.session_date)
      setDurationHours(minutesToHours(props.initialData.duration_minutes).toString())
      setHourlyRateEuros((props.initialData.hourly_rate_cents / 100).toString().replace('.', ','))
      setDescription(props.initialData.description)
      setNotes(props.initialData.notes || '')
    }
  })

  // Set pre-selected staff member if provided
  createEffect(() => {
    if (props.staffMemberId && !isEditMode()) {
      setStaffMemberId(props.staffMemberId)
    }
  })

  const resetForm = () => {
    if (!props.staffMemberId) {
      setStaffMemberId('')
    }
    setSessionDate(new Date().toISOString().split('T')[0])
    setDurationHours('')
    setHourlyRateEuros('')
    setDescription('')
    setNotes('')
    setError('')
    setWarning('')
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')
    setWarning('')

    // Parse values
    const hours = parseFloat(durationHours()) || 0
    const rate = parseFloat(hourlyRateEuros().replace(',', '.')) || 0
    const durationMinutes = hoursToMinutes(hours)
    const hourlyRateCents = Math.round(rate * 100)

    const data: WorkSessionInsert = {
      staff_member_id: staffMemberId(),
      session_date: sessionDate(),
      duration_minutes: durationMinutes,
      hourly_rate_cents: hourlyRateCents,
      description: description(),
      notes: notes() || null,
      schedule_entry_id: scheduleEntryId(),
    }

    // Client-side validation
    const validation = validateWorkSession(data)
    if (validation.error) {
      setError(validation.error)
      return
    }
    if (validation.warning) {
      setWarning(validation.warning)
      // Show warning but allow submission
    }

    setLoading(true)

    let result
    if (isEditMode() && props.initialData) {
      result = await updateWorkSession(props.initialData.id, {
        session_date: sessionDate(),
        duration_minutes: durationMinutes,
        hourly_rate_cents: hourlyRateCents,
        description: description(),
        notes: notes() || null,
      })
    } else {
      result = await createWorkSession(data)
    }

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    resetForm()
    setLoading(false)
    showSuccess(isEditMode() ? 'Prestation modifiée avec succès' : 'Prestation enregistrée avec succès')
    props.onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} class="work-session-form">
      <Show when={error()}>
        <div class="error-message">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span class="error-text">{error()}</span>
        </div>
      </Show>

      <Show when={warning()}>
        <div class="warning-message">
          <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span class="warning-text">{warning()}</span>
        </div>
      </Show>

      <div class="form-group">
        <label class="form-label" for="session-staff-member">
          Membre du personnel
        </label>
        <Show
          when={!loadingStaff()}
          fallback={
            <select class="form-input form-select" disabled>
              <option>Chargement...</option>
            </select>
          }
        >
          <select
            class="form-input form-select"
            id="session-staff-member"
            value={staffMemberId()}
            onChange={(e) => setStaffMemberId(e.currentTarget.value)}
            required
            disabled={!!props.staffMemberId}
          >
            <option value="">Sélectionner un membre</option>
            <For each={staffMembers()}>
              {(staff) => (
                <option value={staff.id}>
                  {staff.first_name} {staff.last_name}
                </option>
              )}
            </For>
          </select>
        </Show>
      </div>

      <div class="form-group">
        <label class="form-label" for="session-date">
          Date de la prestation
        </label>
        <input
          class="form-input"
          id="session-date"
          type="date"
          value={sessionDate()}
          onInput={(e) => setSessionDate(e.currentTarget.value)}
          max={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="session-duration">
            Durée (heures)
          </label>
          <input
            class="form-input"
            id="session-duration"
            type="number"
            step="0.25"
            min="0.25"
            placeholder="Ex: 3"
            value={durationHours()}
            onInput={(e) => setDurationHours(e.currentTarget.value)}
            required
          />
          <small class="form-hint">Format décimal: 1.5 = 1h30</small>
        </div>

        <div class="form-group">
          <label class="form-label" for="session-rate">
            Tarif horaire (CHF)
          </label>
          <input
            class="form-input"
            id="session-rate"
            type="text"
            inputMode="decimal"
            placeholder="Ex: 15"
            value={hourlyRateEuros()}
            onInput={(e) => setHourlyRateEuros(e.currentTarget.value)}
            required
          />
        </div>
      </div>

      {/* Calculated amount display */}
      <Show when={durationHours() && hourlyRateEuros()}>
        <div class="calculated-amount">
          <span class="calculated-label">Montant calculé :</span>
          <span class="calculated-value">{formatMoney(calculatedAmountCents())}</span>
        </div>
      </Show>

      <div class="form-group">
        <label class="form-label" for="session-description">
          Description
        </label>
        <input
          class="form-input"
          id="session-description"
          type="text"
          placeholder="Ex: Ménage complet"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          maxLength={200}
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="session-notes">
          Notes (optionnel)
        </label>
        <textarea
          class="form-input form-textarea"
          id="session-notes"
          placeholder="Notes additionnelles..."
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
          rows={2}
        />
      </div>

      <div class="form-actions">
        <LoadingButton
          type="submit"
          class="btn-primary"
          loading={loading()}
          loadingText={isEditMode() ? 'Modification en cours...' : 'Enregistrement en cours...'}
        >
          {isEditMode() ? 'Modifier la prestation' : 'Enregistrer la prestation'}
        </LoadingButton>

        <Show when={props.onCancel}>
          <button type="button" class="btn btn-secondary" onClick={props.onCancel}>
            Annuler
          </button>
        </Show>
      </div>
    </form>
  )
}

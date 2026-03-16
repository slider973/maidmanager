/**
 * ScheduleForm Component
 * Form for adding or editing a schedule entry
 */

import { createSignal, Show, For, onMount, createEffect } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import {
  createScheduleEntry,
  updateScheduleEntry,
  validateScheduleEntry,
} from '../../services/schedule.service'
import { getStaffMembers } from '../../services/staff.service'
import { showSuccess } from '../ui/Toast'
import { ClientSelect } from '../billing/ClientSelect'
import { AmountInput } from '../billing/AmountInput'
import type { StaffMember, ScheduleEntryWithStaff } from '../../lib/types/database'

interface ScheduleFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: ScheduleEntryWithStaff
  mode?: 'create' | 'edit'
}

export const ScheduleForm: Component<ScheduleFormProps> = (props) => {
  const [staffMembers, setStaffMembers] = createSignal<StaffMember[]>([])
  const [staffMemberId, setStaffMemberId] = createSignal('')
  const [clientId, setClientId] = createSignal('')
  const [scheduledDate, setScheduledDate] = createSignal('')
  const [startTime, setStartTime] = createSignal('')
  const [endTime, setEndTime] = createSignal('')
  const [description, setDescription] = createSignal('')
  const [notes, setNotes] = createSignal('')
  const [amount, setAmount] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [loadingStaff, setLoadingStaff] = createSignal(true)

  const isEditMode = () => props.mode === 'edit'

  // Fetch staff members on mount
  onMount(async () => {
    const result = await getStaffMembers({ isActive: true })
    if (!result.error && result.data) {
      setStaffMembers(result.data)
    }
    setLoadingStaff(false)
  })

  // Populate form with initial data when in edit mode
  createEffect(() => {
    if (props.initialData && isEditMode()) {
      setStaffMemberId(props.initialData.staff_member_id || '')
      setClientId(props.initialData.client_id || '')
      setScheduledDate(props.initialData.scheduled_date)
      // Time comes as HH:MM:SS, we need HH:MM
      setStartTime(props.initialData.start_time.slice(0, 5))
      setEndTime(props.initialData.end_time ? props.initialData.end_time.slice(0, 5) : '')
      setDescription(props.initialData.description)
      setNotes(props.initialData.notes || '')
      setAmount(props.initialData.amount != null ? props.initialData.amount.toString() : '')
    }
  })

  const resetForm = () => {
    setStaffMemberId('')
    setClientId('')
    setScheduledDate('')
    setStartTime('')
    setEndTime('')
    setDescription('')
    setNotes('')
    setAmount('')
    setError('')
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    const amountValue = amount() ? parseFloat(amount()) : null
    const descriptionValue = description().trim() || 'Menage'

    const data = {
      staff_member_id: staffMemberId(),
      client_id: clientId() || null,
      scheduled_date: scheduledDate(),
      start_time: startTime(),
      end_time: endTime() || null,
      description: descriptionValue,
      notes: notes() || null,
      amount: amountValue,
    }

    // Client-side validation
    const validationError = validateScheduleEntry(data)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    let result
    if (isEditMode() && props.initialData) {
      result = await updateScheduleEntry(props.initialData.id, data)
    } else {
      result = await createScheduleEntry(data)
    }

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    resetForm()
    setLoading(false)
    showSuccess(isEditMode() ? 'Intervention modifiée avec succès' : 'Intervention ajoutée avec succès')
    props.onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} class="schedule-form">
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

      <div class="form-group">
        <label class="form-label" for="schedule-staff-member">
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
            id="schedule-staff-member"
            value={staffMemberId()}
            onChange={(e) => setStaffMemberId(e.currentTarget.value)}
            required
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

      <ClientSelect
        value={clientId()}
        onChange={setClientId}
        label="Client (optionnel)"
        placeholder="Sélectionner un client"
        id="schedule-client"
      />

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="schedule-date">
            Date
          </label>
          <input
            class="form-input"
            id="schedule-date"
            type="date"
            value={scheduledDate()}
            onInput={(e) => setScheduledDate(e.currentTarget.value)}
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="schedule-start-time">
            Heure de début
          </label>
          <input
            class="form-input"
            id="schedule-start-time"
            type="time"
            value={startTime()}
            onInput={(e) => setStartTime(e.currentTarget.value)}
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="schedule-end-time">
          Heure de fin (optionnel)
        </label>
        <input
          class="form-input"
          id="schedule-end-time"
          type="time"
          value={endTime()}
          onInput={(e) => setEndTime(e.currentTarget.value)}
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="schedule-description">
          Description (optionnel)
        </label>
        <textarea
          class="form-input form-textarea"
          id="schedule-description"
          placeholder="Menage standard si non specifie..."
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          rows={3}
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="schedule-notes">
          Notes (optionnel)
        </label>
        <textarea
          class="form-input form-textarea"
          id="schedule-notes"
          placeholder="Notes additionnelles..."
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
          rows={2}
        />
      </div>

      <AmountInput
        value={amount()}
        onChange={setAmount}
        label="Tarif (optionnel)"
        placeholder="0.00"
        id="schedule-amount"
        hint="Montant HT pour la facturation"
      />

      <div class="form-actions">
        <LoadingButton
          type="submit"
          class="btn-primary"
          loading={loading()}
          loadingText={isEditMode() ? 'Modification en cours...' : 'Ajout en cours...'}
        >
          {isEditMode() ? "Modifier l'intervention" : "Ajouter l'intervention"}
        </LoadingButton>

        <Show when={isEditMode() && props.onCancel}>
          <button type="button" class="btn btn-secondary" onClick={props.onCancel}>
            Annuler
          </button>
        </Show>
      </div>
    </form>
  )
}

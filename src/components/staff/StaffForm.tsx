/**
 * StaffForm Component
 * Form for adding a new staff member
 */

import { createSignal, Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import { useAuth } from '../../lib/auth'
import { createStaffMember, validateStaffMember } from '../../services/staff.service'
import { STAFF_POSITIONS, POSITION_LABELS, type StaffPosition, parseMoney } from '../../lib/types/database'
import { formatMoney } from '../../lib/types/payments.types'

interface StaffFormProps {
  onSuccess?: () => void
}

export const StaffForm: Component<StaffFormProps> = (props) => {
  const { user } = useAuth()

  const [firstName, setFirstName] = createSignal('')
  const [lastName, setLastName] = createSignal('')
  const [position, setPosition] = createSignal<StaffPosition | ''>('')
  const [positionCustom, setPositionCustom] = createSignal('')
  const [phone, setPhone] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [startDate, setStartDate] = createSignal('')
  const [hourlyRate, setHourlyRate] = createSignal('')
  const [notes, setNotes] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const hourlyRateCents = () => parseMoney(hourlyRate())

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setPosition('')
    setPositionCustom('')
    setPhone('')
    setEmail('')
    setStartDate('')
    setHourlyRate('')
    setNotes('')
    setError('')
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    const userId = user()?.id
    if (!userId) {
      setError('Utilisateur non connecté')
      return
    }

    const data = {
      user_id: userId,
      first_name: firstName(),
      last_name: lastName(),
      position: position() as StaffPosition,
      position_custom: position() === 'other' ? positionCustom() : null,
      phone: phone() || null,
      email: email() || null,
      start_date: startDate() || null,
      hourly_rate_cents: hourlyRateCents(),
      notes: notes() || null,
    }

    // Client-side validation
    const validationError = validateStaffMember(data)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    const result = await createStaffMember(data)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    resetForm()
    setLoading(false)
    props.onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} class="staff-form">
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

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="staff-first-name">
            Prénom
          </label>
          <input
            class="form-input"
            id="staff-first-name"
            type="text"
            placeholder="Prénom"
            value={firstName()}
            onInput={(e) => setFirstName(e.currentTarget.value)}
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="staff-last-name">
            Nom
          </label>
          <input
            class="form-input"
            id="staff-last-name"
            type="text"
            placeholder="Nom de famille"
            value={lastName()}
            onInput={(e) => setLastName(e.currentTarget.value)}
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="staff-position">
          Poste
        </label>
        <select
          class="form-input form-select"
          id="staff-position"
          value={position()}
          onChange={(e) => setPosition(e.currentTarget.value as StaffPosition | '')}
          required
        >
          <option value="">Sélectionner un poste</option>
          <For each={STAFF_POSITIONS}>
            {(pos) => <option value={pos}>{POSITION_LABELS[pos]}</option>}
          </For>
        </select>
      </div>

      <Show when={position() === 'other'}>
        <div class="form-group">
          <label class="form-label" for="staff-position-custom">
            Préciser le poste
          </label>
          <input
            class="form-input"
            id="staff-position-custom"
            type="text"
            placeholder="Nom du poste"
            value={positionCustom()}
            onInput={(e) => setPositionCustom(e.currentTarget.value)}
            required
          />
        </div>
      </Show>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="staff-phone">
            Téléphone
          </label>
          <input
            class="form-input"
            id="staff-phone"
            type="tel"
            placeholder="06 12 34 56 78"
            value={phone()}
            onInput={(e) => setPhone(e.currentTarget.value)}
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="staff-email">
            Email
          </label>
          <input
            class="form-input"
            id="staff-email"
            type="email"
            placeholder="email@example.com"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="staff-start-date">
            Date de début
          </label>
          <input
            class="form-input"
            id="staff-start-date"
            type="date"
            value={startDate()}
            onInput={(e) => setStartDate(e.currentTarget.value)}
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="staff-hourly-rate">
            Tarif horaire (CHF)
          </label>
          <input
            class="form-input"
            id="staff-hourly-rate"
            type="text"
            placeholder="15,00"
            value={hourlyRate()}
            onInput={(e) => setHourlyRate(e.currentTarget.value)}
          />
          <Show when={hourlyRateCents() > 0}>
            <span class="form-hint">{formatMoney(hourlyRateCents())}/h</span>
          </Show>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="staff-notes">
          Notes
        </label>
        <textarea
          class="form-input form-textarea"
          id="staff-notes"
          placeholder="Notes optionnelles..."
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
          rows={3}
        />
      </div>

      <LoadingButton
        type="submit"
        class="btn-primary"
        loading={loading()}
        loadingText="Ajout en cours..."
      >
        Ajouter le membre
      </LoadingButton>
    </form>
  )
}

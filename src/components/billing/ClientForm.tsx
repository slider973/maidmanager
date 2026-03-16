/**
 * ClientForm Component
 * Form for adding/editing a client
 */

import { createSignal, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import { validateClient } from '../../services/client.service'
import type { Client, ClientInsert, ClientUpdate } from '../../lib/types/billing.types'

interface ClientFormProps {
  client?: Client
  onSubmit: (data: ClientInsert | ClientUpdate) => Promise<{ error: string | null }>
  onCancel?: () => void
  loading?: boolean
}

export const ClientForm: Component<ClientFormProps> = (props) => {
  const isEditing = () => !!props.client

  const [name, setName] = createSignal(props.client?.name ?? '')
  const [address, setAddress] = createSignal(props.client?.address ?? '')
  const [email, setEmail] = createSignal(props.client?.email ?? '')
  const [phone, setPhone] = createSignal(props.client?.phone ?? '')
  const [notes, setNotes] = createSignal(props.client?.notes ?? '')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const resetForm = () => {
    if (!isEditing()) {
      setName('')
      setAddress('')
      setEmail('')
      setPhone('')
      setNotes('')
    }
    setError('')
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    const data: ClientInsert | ClientUpdate = {
      name: name(),
      address: address() || null,
      email: email() || null,
      phone: phone() || null,
      notes: notes() || null,
    }

    // Client-side validation
    const validationError = validateClient(data as ClientInsert)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    const result = await props.onSubmit(data)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    resetForm()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} class="client-form">
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
        <label class="form-label" for="client-name">
          Nom du client *
        </label>
        <input
          class="form-input"
          id="client-name"
          type="text"
          placeholder="Nom du client ou de l'entreprise"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="client-address">
          Adresse
        </label>
        <textarea
          class="form-input form-textarea"
          id="client-address"
          placeholder="Adresse complète"
          value={address()}
          onInput={(e) => setAddress(e.currentTarget.value)}
          rows={2}
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="client-email">
            Email
          </label>
          <input
            class="form-input"
            id="client-email"
            type="email"
            placeholder="email@example.com"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="client-phone">
            Téléphone
          </label>
          <input
            class="form-input"
            id="client-phone"
            type="tel"
            placeholder="01 23 45 67 89"
            value={phone()}
            onInput={(e) => setPhone(e.currentTarget.value)}
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="client-notes">
          Notes
        </label>
        <textarea
          class="form-input form-textarea"
          id="client-notes"
          placeholder="Notes internes sur ce client..."
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
          rows={3}
        />
      </div>

      <div class="form-actions">
        <Show when={props.onCancel}>
          <button type="button" class="btn-secondary" onClick={props.onCancel}>
            Annuler
          </button>
        </Show>
        <LoadingButton
          type="submit"
          class="btn-primary"
          loading={loading() || props.loading}
          loadingText={isEditing() ? 'Mise à jour...' : 'Création...'}
        >
          {isEditing() ? 'Mettre à jour' : 'Ajouter le client'}
        </LoadingButton>
      </div>
    </form>
  )
}

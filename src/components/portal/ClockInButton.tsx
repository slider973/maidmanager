/**
 * ClockInButton Component
 * Feature: 009-staff-portal (US2)
 * Button to clock in with client selection modal
 */

import { createSignal, createResource, For, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import { showSuccess, showError } from '../ui/Toast'
import { timeEntryStore } from '../../stores/timeEntryStore'
import { getClients } from '../../services/client.service'
import type { Client } from '../../lib/types/billing.types'

interface ClockInButtonProps {
  disabled?: boolean
}

export const ClockInButton: Component<ClockInButtonProps> = (props) => {
  const [showModal, setShowModal] = createSignal(false)
  const [selectedClientId, setSelectedClientId] = createSignal<string | null>(null)
  const [notes, setNotes] = createSignal('')
  const [searchQuery, setSearchQuery] = createSignal('')

  // Fetch clients when modal opens
  const [clients] = createResource(
    () => showModal(),
    async (isOpen) => {
      if (!isOpen) return []
      const result = await getClients({ orderBy: 'name', orderDirection: 'asc' })
      return result.data || []
    }
  )

  const filteredClients = () => {
    const query = searchQuery().toLowerCase()
    if (!query) return clients() || []
    return (clients() || []).filter((client: Client) =>
      client.name.toLowerCase().includes(query)
    )
  }

  const handleClockIn = async () => {
    const clientId = selectedClientId()
    if (!clientId) {
      showError('Veuillez selectionner un client')
      return
    }

    const result = await timeEntryStore.actions.clockIn({
      client_id: clientId,
      notes: notes() || undefined,
    })

    if (result.success) {
      showSuccess('Pointage enregistre')
      closeModal()
    } else {
      showError(result.error || 'Erreur lors du pointage')
    }
  }

  const openModal = () => {
    setSelectedClientId(null)
    setNotes('')
    setSearchQuery('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedClientId(null)
    setNotes('')
    setSearchQuery('')
  }

  return (
    <>
      <LoadingButton
        type="button"
        class="btn btn-primary btn-lg"
        onClick={openModal}
        disabled={props.disabled || timeEntryStore.state.clockingIn}
        loading={timeEntryStore.state.clockingIn}
        loadingText="Pointage..."
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9,11 12,14 22,4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        Pointer mon arrivee
      </LoadingButton>

      {/* Client Selection Modal */}
      <Show when={showModal()}>
        <div class="modal-overlay" onClick={closeModal}>
          <div class="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2 class="modal-title">Pointer mon arrivee</h2>
              <button
                type="button"
                class="btn btn-ghost btn-icon"
                onClick={closeModal}
                aria-label="Fermer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div class="modal-body">
              {/* Client Selection */}
              <div class="form-group">
                <label class="form-label" for="client-search">
                  Chez quel client travaillez-vous? <span class="text-error">*</span>
                </label>
                <input
                  id="client-search"
                  type="text"
                  class="form-input"
                  placeholder="Rechercher un client..."
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                />
              </div>

              <div class="client-list">
                <Show
                  when={!clients.loading}
                  fallback={
                    <div class="loading-state">
                      <span class="loading-spinner" />
                      Chargement des clients...
                    </div>
                  }
                >
                  <Show
                    when={filteredClients().length > 0}
                    fallback={
                      <div class="empty-state-small">
                        <p>Aucun client trouve</p>
                      </div>
                    }
                  >
                    <For each={filteredClients()}>
                      {(client: Client) => (
                        <button
                          type="button"
                          class={`client-option ${selectedClientId() === client.id ? 'selected' : ''}`}
                          onClick={() => setSelectedClientId(client.id)}
                        >
                          <div class="client-option-radio">
                            <Show when={selectedClientId() === client.id}>
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="6" />
                              </svg>
                            </Show>
                          </div>
                          <div class="client-option-info">
                            <span class="client-option-name">{client.name}</span>
                            <Show when={client.address}>
                              <span class="client-option-address">{client.address}</span>
                            </Show>
                          </div>
                        </button>
                      )}
                    </For>
                  </Show>
                </Show>
              </div>

              {/* Notes (Optional) */}
              <div class="form-group">
                <label class="form-label" for="clock-in-notes">
                  Notes (optionnel)
                </label>
                <textarea
                  id="clock-in-notes"
                  class="form-input"
                  rows="2"
                  placeholder="Ajouter une note..."
                  value={notes()}
                  onInput={(e) => setNotes(e.currentTarget.value)}
                />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" onClick={closeModal}>
                Annuler
              </button>
              <LoadingButton
                type="button"
                class="btn btn-primary"
                onClick={handleClockIn}
                disabled={!selectedClientId() || timeEntryStore.state.clockingIn}
                loading={timeEntryStore.state.clockingIn}
                loadingText="Pointage..."
              >
                Confirmer le pointage
              </LoadingButton>
            </div>
          </div>
        </div>
      </Show>
    </>
  )
}

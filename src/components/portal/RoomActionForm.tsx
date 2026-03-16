/**
 * RoomActionForm Component
 * Feature: 009-staff-portal (US3)
 * Form to add a room action (select room + action type)
 * Shows manager's instructions for each room when available
 * Uses client-specific rooms (client_rooms) for this client
 */

import { createSignal, createEffect, Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import { showSuccess, showError } from '../ui/Toast'
import { roomActionStore } from '../../stores/roomActionStore'
import { timeEntryStore } from '../../stores/timeEntryStore'
import * as clientRoomService from '../../services/client-room.service'
import type { ClientRoomWithType } from '../../services/client-room.service'

interface RoomActionFormProps {
  onActionAdded?: () => void
}

export const RoomActionForm: Component<RoomActionFormProps> = (props) => {
  const [selectedRoomId, setSelectedRoomId] = createSignal<string | null>(null)
  const [selectedActionId, setSelectedActionId] = createSignal<string | null>(null)
  const [notes, setNotes] = createSignal('')
  const [showForm, setShowForm] = createSignal(false)
  const [clientRooms, setClientRooms] = createSignal<ClientRoomWithType[]>([])
  const [loadingRooms, setLoadingRooms] = createSignal(false)

  // Load client rooms when form opens
  createEffect(() => {
    if (showForm()) {
      loadClientRooms()
    }
  })

  const loadClientRooms = async () => {
    const clientId = timeEntryStore.state.currentEntry?.client_id
    if (!clientId) return

    setLoadingRooms(true)
    try {
      const result = await clientRoomService.getActiveRoomsForClient(clientId)
      if (!result.error) {
        setClientRooms(result.data || [])
      }
    } catch (err) {
      console.error('Failed to load client rooms:', err)
    } finally {
      setLoadingRooms(false)
    }
  }

  const selectedRoom = () => {
    const roomId = selectedRoomId()
    if (!roomId) return null
    return clientRooms().find((r) => r.id === roomId) || null
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    const room = selectedRoom()
    const actionId = selectedActionId()

    if (!room) {
      showError('Veuillez selectionner une piece')
      return
    }

    if (!actionId) {
      showError('Veuillez selectionner une action')
      return
    }

    // Use room_type_id from client room (for backwards compatibility and statistics)
    // Also pass client_room_id for precise tracking
    const roomTypeId = room.room_type_id || room.id // Fallback if no room_type linked
    const result = await roomActionStore.actions.addAction(
      roomTypeId,
      actionId,
      notes() || undefined,
      room.id // client_room_id
    )

    if (result.success) {
      showSuccess('Action enregistree')
      resetForm()
      props.onActionAdded?.()
    } else {
      showError(result.error || "Erreur lors de l'enregistrement")
    }
  }

  const resetForm = () => {
    setSelectedRoomId(null)
    setSelectedActionId(null)
    setNotes('')
    setShowForm(false)
  }

  const getSelectedRoomName = () => {
    const room = selectedRoom()
    return room?.custom_name || 'Selectionner une piece'
  }

  const getSelectedActionName = () => {
    const action = roomActionStore.state.actionTypes.find((a) => a.id === selectedActionId())
    return action?.name_fr || 'Selectionner une action'
  }

  return (
    <div class="room-action-form-container">
      <Show
        when={showForm()}
        fallback={
          <button
            type="button"
            class="btn btn-primary btn-block"
            onClick={() => setShowForm(true)}
            disabled={roomActionStore.state.loading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter une action
          </button>
        }
      >
        <form class="room-action-form" onSubmit={handleSubmit}>
          <div class="form-header">
            <h3 class="form-title">Nouvelle action</h3>
            <button
              type="button"
              class="btn btn-ghost btn-icon"
              onClick={resetForm}
              aria-label="Fermer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Room Selection */}
          <div class="form-group">
            <label class="form-label">
              Piece <span class="text-error">*</span>
            </label>
            <Show when={loadingRooms()}>
              <p class="text-muted text-sm">Chargement des pieces...</p>
            </Show>
            <Show when={!loadingRooms()}>
              <div class="selection-grid">
                <For each={clientRooms()}>
                  {(room) => (
                    <button
                      type="button"
                      class={`selection-item ${selectedRoomId() === room.id ? 'selected' : ''}`}
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <Show when={room.room_type?.icon}>
                        <span class="selection-item-icon">{room.room_type!.icon}</span>
                      </Show>
                      <span class="selection-item-label">{room.custom_name}</span>
                    </button>
                  )}
                </For>
              </div>
              <Show when={clientRooms().length === 0}>
                <p class="text-muted text-sm">Aucune piece configuree pour ce client</p>
              </Show>
            </Show>
          </div>

          {/* Room Instructions */}
          <Show when={selectedRoom()?.instructions}>
            <div class="room-instruction-box">
              <div class="room-instruction-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Instructions du manager</span>
              </div>
              <p class="room-instruction-text">{selectedRoom()!.instructions}</p>
            </div>
          </Show>

          {/* Action Type Selection */}
          <div class="form-group">
            <label class="form-label">
              Action <span class="text-error">*</span>
            </label>
            <div class="selection-grid">
              <For each={roomActionStore.state.actionTypes}>
                {(action) => (
                  <button
                    type="button"
                    class={`selection-item ${selectedActionId() === action.id ? 'selected' : ''}`}
                    onClick={() => setSelectedActionId(action.id)}
                  >
                    <span class="selection-item-label">{action.name_fr}</span>
                  </button>
                )}
              </For>
            </div>
            <Show when={roomActionStore.state.actionTypes.length === 0 && !roomActionStore.state.loading}>
              <p class="text-muted text-sm">Aucune action disponible</p>
            </Show>
          </div>

          {/* Notes */}
          <div class="form-group">
            <label class="form-label" for="action-notes">
              Notes (optionnel)
            </label>
            <textarea
              id="action-notes"
              class="form-input"
              rows="2"
              placeholder="Ajouter une note..."
              value={notes()}
              onInput={(e) => setNotes(e.currentTarget.value)}
            />
          </div>

          {/* Summary */}
          <Show when={selectedRoomId() && selectedActionId()}>
            <div class="action-summary">
              <span class="action-summary-label">Resume:</span>
              <span class="action-summary-value">
                {getSelectedActionName()} - {getSelectedRoomName()}
              </span>
            </div>
          </Show>

          {/* Actions */}
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" onClick={resetForm}>
              Annuler
            </button>
            <LoadingButton
              type="submit"
              class="btn btn-primary"
              loading={roomActionStore.state.submitting}
              disabled={!selectedRoomId() || !selectedActionId() || roomActionStore.state.submitting}
              loadingText="Enregistrement..."
            >
              Enregistrer
            </LoadingButton>
          </div>
        </form>
      </Show>
    </div>
  )
}

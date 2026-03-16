/**
 * Client Rooms Page
 * Manage rooms specific to each client (e.g., "Salle de bain 1", "Salle de bain 2")
 * with their instructions
 */

import { createEffect, createSignal, For, Show, on } from 'solid-js'
import { A, useParams } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { showSuccess, showError } from '../components/ui/Toast'
import * as clientRoomService from '../services/client-room.service'
import * as clientService from '../services/client.service'
import * as roomTypeService from '../services/room-type.service'
import type { ClientRoomWithType } from '../services/client-room.service'
import type { Client } from '../lib/types/billing.types'
import type { RoomType } from '../services/room-type.service'

import '../App.css'

export default function ClientRooms() {
  const params = useParams()
  const { user, session, loading: authLoading, signOut } = useAuth()

  const [client, setClient] = createSignal<Client | null>(null)
  const [rooms, setRooms] = createSignal<ClientRoomWithType[]>([])
  const [roomTypes, setRoomTypes] = createSignal<RoomType[]>([])
  const [loading, setLoading] = createSignal(true)
  const [saving, setSaving] = createSignal(false)

  // Add room form
  const [showAddForm, setShowAddForm] = createSignal(false)
  const [newRoomName, setNewRoomName] = createSignal('')
  const [newRoomTypeId, setNewRoomTypeId] = createSignal<string>('')
  const [newInstructions, setNewInstructions] = createSignal('')

  // Edit mode
  const [editingId, setEditingId] = createSignal<string | null>(null)
  const [editName, setEditName] = createSignal('')
  const [editInstructions, setEditInstructions] = createSignal('')

  createEffect(
    on(
      () => ({ loading: authLoading(), session: session() }),
      async ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess && params.clientId) {
          await loadData()
        }
      }
    )
  )

  const loadData = async () => {
    const clientId = params.clientId
    if (!clientId) return

    setLoading(true)
    try {
      // Load client info
      const clientResult = await clientService.getClient(clientId)
      if (clientResult.error || !clientResult.data) {
        showError('Client non trouve')
        return
      }
      setClient(clientResult.data)

      // Load room types for selection
      const roomTypesResult = await roomTypeService.getActiveRoomTypes()
      if (!roomTypesResult.error) {
        setRoomTypes(roomTypesResult.data || [])
      }

      // Load client's rooms
      const roomsResult = await clientRoomService.getRoomsForClient(clientId)
      if (!roomsResult.error) {
        setRooms(roomsResult.data || [])
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      showError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRoom = async (e: Event) => {
    e.preventDefault()
    const clientId = params.clientId
    if (!clientId) return

    if (!newRoomName().trim()) {
      showError('Le nom de la piece est requis')
      return
    }

    setSaving(true)
    try {
      const result = await clientRoomService.createRoom({
        client_id: clientId,
        custom_name: newRoomName(),
        room_type_id: newRoomTypeId() || null,
        instructions: newInstructions() || null,
      })

      if (result.error) {
        showError(result.error)
        return
      }

      showSuccess('Piece ajoutee')
      setNewRoomName('')
      setNewRoomTypeId('')
      setNewInstructions('')
      setShowAddForm(false)
      await loadData()
    } catch (err) {
      console.error('Failed to add room:', err)
      showError('Erreur lors de l\'ajout')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (room: ClientRoomWithType) => {
    setEditingId(room.id)
    setEditName(room.custom_name)
    setEditInstructions(room.instructions || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditInstructions('')
  }

  const saveEdit = async () => {
    const id = editingId()
    if (!id) return

    if (!editName().trim()) {
      showError('Le nom est requis')
      return
    }

    setSaving(true)
    try {
      const result = await clientRoomService.updateRoom(id, {
        custom_name: editName(),
        instructions: editInstructions() || null,
      })

      if (result.error) {
        showError(result.error)
        return
      }

      showSuccess('Piece modifiee')
      cancelEdit()
      await loadData()
    } catch (err) {
      console.error('Failed to update:', err)
      showError('Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (room: ClientRoomWithType) => {
    try {
      const result = await clientRoomService.updateRoom(room.id, {
        is_active: !room.is_active,
      })
      if (result.error) {
        showError(result.error)
        return
      }
      showSuccess(room.is_active ? 'Piece desactivee' : 'Piece activee')
      await loadData()
    } catch (err) {
      console.error('Failed to toggle:', err)
      showError('Erreur')
    }
  }

  const handleDelete = async (room: ClientRoomWithType) => {
    if (!confirm(`Supprimer "${room.custom_name}" ?`)) return

    try {
      const result = await clientRoomService.deleteRoom(room.id)
      if (result.error) {
        showError(result.error)
        return
      }
      showSuccess('Piece supprimee')
      await loadData()
    } catch (err) {
      console.error('Failed to delete:', err)
      showError('Erreur lors de la suppression')
    }
  }

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  const getRoomIcon = (room: ClientRoomWithType) => {
    const iconMap: Record<string, string> = {
      bath: '🚿',
      utensils: '🍳',
      bed: '🛏️',
      sofa: '🛋️',
      chair: '🍽️',
      briefcase: '💼',
      'washing-machine': '🧺',
      car: '🚗',
      tree: '🌳',
      sun: '☀️',
      home: '🏠',
    }
    const icon = room.room_type?.icon || 'home'
    return iconMap[icon] || '🏠'
  }

  return (
    <div class="dashboard">
      {/* Header */}
      <header class="dashboard-header">
        <div class="header-brand">
          <A href="/" class="header-brand-link">
            <div class="header-logo">M</div>
            <span class="header-title">MaidManager</span>
          </A>
        </div>

        <div class="header-actions">
          <div class="user-menu">
            <div class="user-avatar">{getInitials()}</div>
            <div class="user-info">
              <span class="user-name">Mon compte</span>
              <span class="user-email">{user()?.email}</span>
            </div>
          </div>
          <button class="btn btn-ghost" onClick={() => signOut()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Deconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main class="dashboard-main">
        {/* Page Header */}
        <div class="page-header">
          <A href="/clients" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Retour aux clients
          </A>
          <Show when={client()}>
            <h1 class="page-title">Pieces - {client()!.name}</h1>
            <p class="page-subtitle">Definissez les pieces de ce client et leurs instructions</p>
          </Show>
        </div>

        <Show when={!loading()} fallback={<div class="loading-state">Chargement...</div>}>
          <div class="client-rooms-container">
            {/* Add Room Section */}
            <div class="add-room-section">
              <Show
                when={showAddForm()}
                fallback={
                  <button class="btn btn-primary btn-block" onClick={() => setShowAddForm(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Ajouter une piece
                  </button>
                }
              >
                <form class="add-room-form" onSubmit={handleAddRoom}>
                  <div class="form-header">
                    <h3>Nouvelle piece</h3>
                    <button type="button" class="btn btn-ghost btn-icon" onClick={() => setShowAddForm(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Nom de la piece *</label>
                    <input
                      type="text"
                      class="form-input"
                      value={newRoomName()}
                      onInput={(e) => setNewRoomName(e.currentTarget.value)}
                      placeholder="Ex: Salle de bain - Haut, Chambre des enfants..."
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Type (pour l'icone)</label>
                    <select
                      class="form-input"
                      value={newRoomTypeId()}
                      onChange={(e) => setNewRoomTypeId(e.currentTarget.value)}
                    >
                      <option value="">-- Selectionner --</option>
                      <For each={roomTypes()}>
                        {(rt) => <option value={rt.id}>{rt.name_fr}</option>}
                      </For>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Instructions</label>
                    <textarea
                      class="form-input"
                      rows={3}
                      value={newInstructions()}
                      onInput={(e) => setNewInstructions(e.currentTarget.value)}
                      placeholder="Instructions pour cette piece..."
                    />
                  </div>

                  <div class="form-actions">
                    <button type="button" class="btn btn-ghost" onClick={() => setShowAddForm(false)}>
                      Annuler
                    </button>
                    <button type="submit" class="btn btn-primary" disabled={saving()}>
                      {saving() ? 'Enregistrement...' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </Show>
            </div>

            {/* Rooms List */}
            <Show
              when={rooms().length > 0}
              fallback={
                <div class="empty-rooms">
                  <div class="empty-icon">🏠</div>
                  <h3>Aucune piece definie</h3>
                  <p>Ajoutez les pieces de ce client pour pouvoir y associer des instructions.</p>
                </div>
              }
            >
              <div class="rooms-list">
                <For each={rooms()}>
                  {(room) => (
                    <div
                      class="room-card"
                      classList={{
                        inactive: !room.is_active,
                        editing: editingId() === room.id,
                      }}
                    >
                      <Show
                        when={editingId() === room.id}
                        fallback={
                          <>
                            <div class="room-header">
                              <span class="room-icon">{getRoomIcon(room)}</span>
                              <h3 class="room-name">{room.custom_name}</h3>
                              <Show when={!room.is_active}>
                                <span class="badge badge-inactive">Desactivee</span>
                              </Show>
                              <div class="room-actions">
                                <button
                                  class="btn btn-icon btn-ghost"
                                  onClick={() => toggleActive(room)}
                                  title={room.is_active ? 'Desactiver' : 'Activer'}
                                >
                                  <Show
                                    when={room.is_active}
                                    fallback={
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                      </svg>
                                    }
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                      <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                  </Show>
                                </button>
                                <button
                                  class="btn btn-icon btn-ghost"
                                  onClick={() => startEdit(room)}
                                  title="Modifier"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  class="btn btn-icon btn-ghost btn-danger"
                                  onClick={() => handleDelete(room)}
                                  title="Supprimer"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div class="room-content">
                              <Show
                                when={room.instructions}
                                fallback={<p class="no-instructions">Aucune instruction</p>}
                              >
                                <p class="room-instructions">{room.instructions}</p>
                              </Show>
                            </div>
                          </>
                        }
                      >
                        {/* Edit Mode */}
                        <div class="edit-form">
                          <div class="form-group">
                            <label class="form-label">Nom</label>
                            <input
                              type="text"
                              class="form-input"
                              value={editName()}
                              onInput={(e) => setEditName(e.currentTarget.value)}
                            />
                          </div>
                          <div class="form-group">
                            <label class="form-label">Instructions</label>
                            <textarea
                              class="form-input"
                              rows={3}
                              value={editInstructions()}
                              onInput={(e) => setEditInstructions(e.currentTarget.value)}
                              placeholder="Instructions pour cette piece..."
                            />
                          </div>
                          <div class="form-actions">
                            <button class="btn btn-ghost" onClick={cancelEdit} disabled={saving()}>
                              Annuler
                            </button>
                            <button class="btn btn-primary" onClick={saveEdit} disabled={saving()}>
                              {saving() ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        </div>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </main>

      <style>{`
        .client-rooms-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .add-room-section {
          margin-bottom: 1.5rem;
        }

        .add-room-form {
          background: var(--card-bg, #fff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .add-room-form .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .add-room-form h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .empty-rooms {
          text-align: center;
          padding: 3rem;
          background: var(--card-bg, #fff);
          border: 1px dashed var(--border-color, #e5e7eb);
          border-radius: 12px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-rooms h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .empty-rooms p {
          margin: 0;
          color: var(--text-muted);
        }

        .rooms-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .room-card {
          background: var(--card-bg, #fff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .room-card.inactive {
          opacity: 0.6;
        }

        .room-card.editing {
          border-color: var(--primary-color, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .room-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .room-icon {
          font-size: 1.5rem;
        }

        .room-name {
          flex: 1;
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .room-actions {
          display: flex;
          gap: 0.25rem;
        }

        .room-content {
          padding-left: 2.5rem;
        }

        .no-instructions {
          color: var(--text-muted);
          font-style: italic;
          margin: 0;
        }

        .room-instructions {
          margin: 0;
          color: var(--text-primary);
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .badge-inactive {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          background: var(--text-muted, #6b7280);
          color: white;
        }

        .btn-danger {
          color: var(--error-color, #ef4444);
        }

        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  )
}

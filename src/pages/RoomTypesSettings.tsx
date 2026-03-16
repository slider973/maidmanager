/**
 * Room Types Settings Page
 * Manage room types (pieces) - add, edit, toggle, delete
 */

import { createEffect, createSignal, For, Show, on } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { showSuccess, showError } from '../components/ui/Toast'
import * as roomTypeService from '../services/room-type.service'
import type { RoomType } from '../services/room-type.service'

import '../App.css'

export default function RoomTypesSettings() {
  const { user, session, loading: authLoading, signOut } = useAuth()

  const [roomTypes, setRoomTypes] = createSignal<RoomType[]>([])
  const [loading, setLoading] = createSignal(true)
  const [saving, setSaving] = createSignal(false)

  // New room type form
  const [showForm, setShowForm] = createSignal(false)
  const [newName, setNewName] = createSignal('')
  const [newIcon, setNewIcon] = createSignal('home')

  // Edit mode
  const [editingId, setEditingId] = createSignal<string | null>(null)
  const [editName, setEditName] = createSignal('')

  const icons = [
    { value: 'home', label: 'Maison' },
    { value: 'bath', label: 'Salle de bain' },
    { value: 'utensils', label: 'Cuisine' },
    { value: 'bed', label: 'Chambre' },
    { value: 'sofa', label: 'Salon' },
    { value: 'chair', label: 'Chaise' },
    { value: 'briefcase', label: 'Bureau' },
    { value: 'washing-machine', label: 'Machine' },
    { value: 'car', label: 'Voiture' },
    { value: 'tree', label: 'Arbre' },
    { value: 'sun', label: 'Soleil' },
    { value: 'star', label: 'Etoile' },
  ]

  createEffect(
    on(
      () => ({ loading: authLoading(), session: session() }),
      async ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess) {
          await loadData()
        }
      }
    )
  )

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await roomTypeService.getAllRoomTypes()
      if (!result.error) {
        setRoomTypes(result.data || [])
      }
    } catch (err) {
      console.error('Failed to load room types:', err)
      showError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: Event) => {
    e.preventDefault()
    if (!newName().trim()) {
      showError('Le nom est requis')
      return
    }

    setSaving(true)
    try {
      const result = await roomTypeService.createRoomType({
        name_fr: newName(),
        icon: newIcon(),
      })

      if (result.error) {
        showError(result.error)
        return
      }

      showSuccess('Type de piece cree')
      setNewName('')
      setNewIcon('home')
      setShowForm(false)
      await loadData()
    } catch (err) {
      console.error('Failed to create:', err)
      showError('Erreur lors de la creation')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (roomType: RoomType) => {
    setEditingId(roomType.id)
    setEditName(roomType.name_fr)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const saveEdit = async (id: string) => {
    if (!editName().trim()) {
      showError('Le nom est requis')
      return
    }

    setSaving(true)
    try {
      const result = await roomTypeService.updateRoomType(id, {
        name_fr: editName(),
      })

      if (result.error) {
        showError(result.error)
        return
      }

      showSuccess('Type de piece modifie')
      cancelEdit()
      await loadData()
    } catch (err) {
      console.error('Failed to update:', err)
      showError('Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (roomType: RoomType) => {
    try {
      const result = await roomTypeService.toggleRoomTypeActive(roomType.id, !roomType.is_active)
      if (result.error) {
        showError(result.error)
        return
      }
      showSuccess(roomType.is_active ? 'Type desactive' : 'Type active')
      await loadData()
    } catch (err) {
      console.error('Failed to toggle:', err)
      showError('Erreur')
    }
  }

  const handleDelete = async (roomType: RoomType) => {
    if (roomType.user_id === null) {
      showError('Impossible de supprimer un type par defaut')
      return
    }

    if (!confirm(`Supprimer "${roomType.name_fr}" ?`)) return

    try {
      const result = await roomTypeService.deleteRoomType(roomType.id)
      if (result.error) {
        showError(result.error)
        return
      }
      showSuccess('Type supprime')
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
          <A href="/" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Retour
          </A>
          <h1 class="page-title">Types de pieces</h1>
          <p class="page-subtitle">Gerez les types de pieces disponibles pour les instructions et actions</p>
        </div>

        <Show when={!loading()} fallback={<div class="loading-state">Chargement...</div>}>
          <div class="settings-container">
            {/* Add new room type */}
            <div class="settings-section">
              <Show
                when={showForm()}
                fallback={
                  <button class="btn btn-primary" onClick={() => setShowForm(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Ajouter un type de piece
                  </button>
                }
              >
                <form class="add-form" onSubmit={handleCreate}>
                  <h3>Nouveau type de piece</h3>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Nom *</label>
                      <input
                        type="text"
                        class="form-input"
                        value={newName()}
                        onInput={(e) => setNewName(e.currentTarget.value)}
                        placeholder="Ex: Veranda, Cave..."
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Icone</label>
                      <select
                        class="form-input"
                        value={newIcon()}
                        onChange={(e) => setNewIcon(e.currentTarget.value)}
                      >
                        <For each={icons}>
                          {(icon) => <option value={icon.value}>{icon.label}</option>}
                        </For>
                      </select>
                    </div>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn btn-ghost" onClick={() => setShowForm(false)}>
                      Annuler
                    </button>
                    <button type="submit" class="btn btn-primary" disabled={saving()}>
                      {saving() ? 'Enregistrement...' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </Show>
            </div>

            {/* Room types list */}
            <div class="settings-section">
              <h3>Types de pieces ({roomTypes().length})</h3>
              <p class="section-hint">
                Les types par defaut ne peuvent pas etre supprimes, mais vous pouvez les desactiver.
              </p>

              <div class="room-types-list">
                <For each={roomTypes()}>
                  {(roomType) => (
                    <div
                      class="room-type-item"
                      classList={{
                        inactive: !roomType.is_active,
                        'system-default': roomType.user_id === null,
                      }}
                    >
                      <Show
                        when={editingId() === roomType.id}
                        fallback={
                          <>
                            <div class="room-type-info">
                              <span class="room-type-icon">{roomType.icon || 'home'}</span>
                              <span class="room-type-name">{roomType.name_fr}</span>
                              <Show when={roomType.user_id === null}>
                                <span class="badge badge-default">Par defaut</span>
                              </Show>
                              <Show when={!roomType.is_active}>
                                <span class="badge badge-inactive">Desactive</span>
                              </Show>
                            </div>
                            <div class="room-type-actions">
                              <button
                                class="btn btn-icon btn-ghost"
                                onClick={() => toggleActive(roomType)}
                                title={roomType.is_active ? 'Desactiver' : 'Activer'}
                              >
                                <Show
                                  when={roomType.is_active}
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
                              <Show when={roomType.user_id !== null}>
                                <button
                                  class="btn btn-icon btn-ghost"
                                  onClick={() => startEdit(roomType)}
                                  title="Modifier"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  class="btn btn-icon btn-ghost btn-danger"
                                  onClick={() => handleDelete(roomType)}
                                  title="Supprimer"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                  </svg>
                                </button>
                              </Show>
                            </div>
                          </>
                        }
                      >
                        <div class="room-type-edit">
                          <input
                            type="text"
                            class="form-input"
                            value={editName()}
                            onInput={(e) => setEditName(e.currentTarget.value)}
                          />
                          <button
                            class="btn btn-sm btn-ghost"
                            onClick={cancelEdit}
                            disabled={saving()}
                          >
                            Annuler
                          </button>
                          <button
                            class="btn btn-sm btn-primary"
                            onClick={() => saveEdit(roomType.id)}
                            disabled={saving()}
                          >
                            {saving() ? '...' : 'OK'}
                          </button>
                        </div>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Show>
      </main>

      <style>{`
        .settings-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .settings-section {
          background: var(--card-bg, #fff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .settings-section h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .section-hint {
          color: var(--text-muted, #6b7280);
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
        }

        .add-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        .room-types-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .room-type-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .room-type-item.inactive {
          opacity: 0.5;
        }

        .room-type-item.system-default {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent);
        }

        .room-type-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .room-type-icon {
          font-size: 1rem;
          color: var(--text-muted);
        }

        .room-type-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .badge {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
        }

        .badge-default {
          background: var(--primary-color, #3b82f6);
          color: white;
        }

        .badge-inactive {
          background: var(--text-muted, #6b7280);
          color: white;
        }

        .room-type-actions {
          display: flex;
          gap: 0.25rem;
        }

        .room-type-edit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
        }

        .room-type-edit .form-input {
          flex: 1;
        }

        .btn-danger {
          color: var(--error-color, #ef4444);
        }

        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

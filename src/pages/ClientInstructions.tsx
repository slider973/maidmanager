/**
 * Client Room Instructions Page
 * Feature: 009-staff-portal
 * Manage cleaning instructions per room for a specific client
 */

import { createEffect, createSignal, For, Show, on } from 'solid-js'
import { A, useParams } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { showSuccess, showError } from '../components/ui/Toast'
import * as instructionService from '../services/client-room-instruction.service'
import * as clientService from '../services/client.service'
import type { Client, ClientRoomInstructionWithRoom } from '../lib/types/billing.types'

import '../App.css'

export default function ClientInstructions() {
  const params = useParams()
  const { user, session, loading: authLoading, signOut } = useAuth()

  const [client, setClient] = createSignal<Client | null>(null)
  const [instructions, setInstructions] = createSignal<ClientRoomInstructionWithRoom[]>([])
  const [roomTypes, setRoomTypes] = createSignal<{ id: string; name_fr: string; icon: string | null }[]>([])
  const [loading, setLoading] = createSignal(true)
  const [saving, setSaving] = createSignal<string | null>(null)

  // Editing state per room
  const [editingRoom, setEditingRoom] = createSignal<string | null>(null)
  const [editText, setEditText] = createSignal('')

  // Load data when auth is ready
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

      // Load room types
      const roomTypesResult = await instructionService.getRoomTypes()
      if (!roomTypesResult.error) {
        setRoomTypes(roomTypesResult.data || [])
      }

      // Load existing instructions
      const instructionsResult = await instructionService.getInstructionsForClient(clientId)
      if (!instructionsResult.error) {
        setInstructions(instructionsResult.data || [])
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      showError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const getInstructionForRoom = (roomTypeId: string) => {
    return instructions().find((i) => i.room_type_id === roomTypeId)
  }

  const startEditing = (roomTypeId: string) => {
    const existing = getInstructionForRoom(roomTypeId)
    setEditText(existing?.instructions || '')
    setEditingRoom(roomTypeId)
  }

  const cancelEditing = () => {
    setEditingRoom(null)
    setEditText('')
  }

  const saveInstruction = async (roomTypeId: string) => {
    const clientId = params.clientId
    if (!clientId) return

    const text = editText().trim()
    if (!text) {
      showError('Les instructions sont requises')
      return
    }

    setSaving(roomTypeId)
    try {
      const result = await instructionService.upsertInstruction({
        client_id: clientId,
        room_type_id: roomTypeId,
        instructions: text,
      })

      if (result.error) {
        showError(result.error)
        return
      }

      // Reload instructions
      const instructionsResult = await instructionService.getInstructionsForClient(clientId)
      if (!instructionsResult.error) {
        setInstructions(instructionsResult.data || [])
      }

      showSuccess('Instructions enregistrees')
      setEditingRoom(null)
      setEditText('')
    } catch (err) {
      console.error('Failed to save:', err)
      showError('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(null)
    }
  }

  const deleteInstruction = async (instructionId: string) => {
    const clientId = params.clientId
    if (!clientId) return

    if (!confirm('Supprimer ces instructions ?')) return

    try {
      const result = await instructionService.deleteInstruction(instructionId)
      if (result.error) {
        showError(result.error)
        return
      }

      // Reload instructions
      const instructionsResult = await instructionService.getInstructionsForClient(clientId)
      if (!instructionsResult.error) {
        setInstructions(instructionsResult.data || [])
      }

      showSuccess('Instructions supprimees')
    } catch (err) {
      console.error('Failed to delete:', err)
      showError('Erreur lors de la suppression')
    }
  }

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  const getRoomIcon = (icon: string | null) => {
    // Map icon names to emoji or SVG
    const iconMap: Record<string, string> = {
      bathroom: '🚿',
      kitchen: '🍳',
      bedroom: '🛏️',
      living: '🛋️',
      dining: '🍽️',
      office: '💼',
      laundry: '🧺',
      garage: '🚗',
      garden: '🌳',
      terrace: '☀️',
    }
    return icon ? iconMap[icon] || '🏠' : '🏠'
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
            <h1 class="page-title">Instructions - {client()!.name}</h1>
            <p class="page-subtitle">Definissez les instructions de nettoyage par piece</p>
          </Show>
        </div>

        <Show when={!loading()} fallback={<div class="loading-state">Chargement...</div>}>
          <div class="instructions-grid">
            <For each={roomTypes()}>
              {(room) => {
                const instruction = () => getInstructionForRoom(room.id)
                const isEditing = () => editingRoom() === room.id
                const isSaving = () => saving() === room.id

                return (
                  <div class={`instruction-card ${instruction() ? 'has-instruction' : ''}`}>
                    <div class="instruction-card-header">
                      <span class="room-icon">{getRoomIcon(room.icon)}</span>
                      <h3 class="room-name">{room.name_fr}</h3>
                      <Show when={instruction() && !isEditing()}>
                        <button
                          class="btn btn-icon btn-ghost"
                          onClick={() => deleteInstruction(instruction()!.id)}
                          title="Supprimer"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </Show>
                    </div>

                    <Show
                      when={isEditing()}
                      fallback={
                        <div class="instruction-content">
                          <Show
                            when={instruction()}
                            fallback={
                              <p class="no-instruction">Aucune instruction</p>
                            }
                          >
                            <p class="instruction-text">{instruction()!.instructions}</p>
                          </Show>
                          <button
                            class="btn btn-sm btn-outline"
                            onClick={() => startEditing(room.id)}
                          >
                            {instruction() ? 'Modifier' : 'Ajouter'}
                          </button>
                        </div>
                      }
                    >
                      <div class="instruction-edit">
                        <textarea
                          class="instruction-textarea"
                          value={editText()}
                          onInput={(e) => setEditText(e.currentTarget.value)}
                          placeholder="Entrez les instructions pour cette piece..."
                          rows={4}
                        />
                        <div class="instruction-actions">
                          <button
                            class="btn btn-sm btn-ghost"
                            onClick={cancelEditing}
                            disabled={isSaving()}
                          >
                            Annuler
                          </button>
                          <button
                            class="btn btn-sm btn-primary"
                            onClick={() => saveInstruction(room.id)}
                            disabled={isSaving() || !editText().trim()}
                          >
                            {isSaving() ? 'Enregistrement...' : 'Enregistrer'}
                          </button>
                        </div>
                      </div>
                    </Show>
                  </div>
                )
              }}
            </For>
          </div>
        </Show>
      </main>

      <style>{`
        .instructions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          padding: 1.5rem;
        }

        .instruction-card {
          background: var(--card-bg, #fff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .instruction-card.has-instruction {
          border-color: var(--success-color, #10b981);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent);
        }

        .instruction-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .room-icon {
          font-size: 1.5rem;
        }

        .room-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
          margin: 0;
        }

        .instruction-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .no-instruction {
          color: var(--text-muted, #9ca3af);
          font-style: italic;
          margin: 0;
        }

        .instruction-text {
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0;
          white-space: pre-wrap;
        }

        .instruction-edit {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .instruction-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
          min-height: 100px;
        }

        .instruction-textarea:focus {
          outline: none;
          border-color: var(--primary-color, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .instruction-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .btn-icon {
          padding: 0.25rem;
          border-radius: 4px;
        }

        .loading-state {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  )
}

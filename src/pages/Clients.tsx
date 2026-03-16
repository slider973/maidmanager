/**
 * Clients Page
 * Main page for client management (billing feature)
 */

import { createEffect, createSignal, on, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { ClientForm } from '../components/billing/ClientForm'
import { ClientList } from '../components/billing/ClientList'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { clientStore } from '../stores/clientStore'
import { showSuccess, showError } from '../components/ui/Toast'
import type { Client, ClientInsert, ClientUpdate } from '../lib/types/billing.types'

export default function Clients() {
  const { user, session, loading, signOut } = useAuth()
  const { state, actions } = clientStore

  const [editingClient, setEditingClient] = createSignal<Client | null>(null)
  const [deletingClient, setDeletingClient] = createSignal<Client | null>(null)

  // Fetch clients when auth is ready
  createEffect(
    on(
      () => ({ loading: loading(), session: session() }),
      ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess) {
          actions.fetch()
        }
      }
    )
  )

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  const handleAddClient = async (data: ClientInsert | ClientUpdate) => {
    const result = await actions.add(data as ClientInsert)
    if (!result.error) {
      showSuccess('Client ajouté avec succès')
    }
    return result
  }

  const handleEditClient = async (data: ClientInsert | ClientUpdate) => {
    const client = editingClient()
    if (!client) return { error: 'Aucun client sélectionné' }

    const result = await actions.update(client.id, data as ClientUpdate)
    if (!result.error) {
      showSuccess('Client mis à jour avec succès')
      setEditingClient(null)
    }
    return result
  }

  const handleDeleteConfirm = async () => {
    const client = deletingClient()
    if (!client) return

    const result = await actions.delete(client.id)
    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Client supprimé avec succès')
    }
    setDeletingClient(null)
  }

  const startEdit = (client: Client) => {
    setEditingClient(client)
  }

  const cancelEdit = () => {
    setEditingClient(null)
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
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main class="dashboard-main">
        {/* Page Header */}
        <div class="page-header">
          <div class="page-header-content">
            <A href="/" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Retour
            </A>
            <h1 class="page-title">Clients</h1>
            <p class="page-subtitle">Gérez vos clients pour la facturation</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div class="staff-layout">
          {/* Add/Edit Client Form */}
          <section class="staff-form-section">
            <div class="section-card">
              <div class="section-card-header">
                <h2 class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <Show when={!editingClient()} fallback={
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    }>
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </Show>
                  </svg>
                  {editingClient() ? 'Modifier le client' : 'Ajouter un client'}
                </h2>
              </div>
              <div class="section-card-body">
                <Show
                  when={editingClient()}
                  fallback={
                    <ClientForm onSubmit={handleAddClient} />
                  }
                >
                  <ClientForm
                    client={editingClient()!}
                    onSubmit={handleEditClient}
                    onCancel={cancelEdit}
                  />
                </Show>
              </div>
            </div>
          </section>

          {/* Client List */}
          <section class="staff-list-section">
            <div class="section-card">
              <div class="section-card-header">
                <h2 class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  Liste des clients
                </h2>
                <span class="section-card-count">{state.clients.length} client{state.clients.length !== 1 ? 's' : ''}</span>
              </div>
              <div class="section-card-body">
                <ClientList
                  clients={state.clients}
                  loading={state.loading}
                  onEdit={startEdit}
                  onDelete={(client) => setDeletingClient(client)}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingClient() !== null}
        title="Supprimer le client"
        message={`Êtes-vous sûr de vouloir supprimer "${deletingClient()?.name}" ? Cette action est irréversible. Les factures associées seront conservées.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingClient(null)}
        confirmVariant="danger"
      />
    </div>
  )
}

/**
 * Schedule Page
 * Main page for schedule/planning management
 */

import { createEffect, createSignal, on, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { ScheduleForm } from '../components/schedule/ScheduleForm'
import { ScheduleList } from '../components/schedule/ScheduleList'
import { ScheduleFilters } from '../components/schedule/ScheduleFilters'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { showSuccess, showError } from '../components/ui/Toast'
import { scheduleStore } from '../stores/schedule.store'
import type { ScheduleEntryWithStaff, ScheduleFilters as ScheduleFiltersType } from '../lib/types/database'

export default function Schedule() {
  const { user, session, loading, signOut } = useAuth()
  const { state, actions } = scheduleStore

  // Edit state
  const [editingEntry, setEditingEntry] = createSignal<ScheduleEntryWithStaff | null>(null)

  // Delete confirmation state
  const [deleteEntry, setDeleteEntry] = createSignal<ScheduleEntryWithStaff | null>(null)
  const [deleteLoading, setDeleteLoading] = createSignal(false)

  // Fetch schedule when auth is ready (session exists and not loading)
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

  const handleSuccess = () => {
    setEditingEntry(null)
    actions.fetch()
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
  }

  const handleEdit = (entry: ScheduleEntryWithStaff) => {
    setEditingEntry(entry)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (entry: ScheduleEntryWithStaff) => {
    setDeleteEntry(entry)
  }

  const confirmDelete = async () => {
    const entry = deleteEntry()
    if (!entry) return

    setDeleteLoading(true)
    const result = await actions.delete(entry.id)
    setDeleteLoading(false)

    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Intervention supprimée avec succès')
    }
    setDeleteEntry(null)
  }

  const handleMarkCompleted = async (entry: ScheduleEntryWithStaff) => {
    const result = await actions.markAsCompleted(entry.id)
    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Intervention marquée comme terminée')
    }
  }

  const handleMarkCancelled = async (entry: ScheduleEntryWithStaff) => {
    const result = await actions.markAsCancelled(entry.id)
    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Intervention annulée')
    }
  }

  const handleFiltersChange = (filters: Partial<ScheduleFiltersType>) => {
    actions.setFilters(filters)
  }

  const handleClearFilters = () => {
    actions.clearFilters()
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
            <h1 class="page-title">Planning</h1>
            <p class="page-subtitle">Gérez les interventions de votre personnel</p>
          </div>
        </div>

        {/* Schedule Content */}
        <div class="schedule-layout">
          {/* Add/Edit Schedule Form */}
          <section class="schedule-form-section">
            <div class="section-card">
              <div class="section-card-header">
                <h2 class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <Show when={!editingEntry()}>
                      <line x1="10" y1="14" x2="14" y2="14" />
                      <line x1="12" y1="12" x2="12" y2="16" />
                    </Show>
                  </svg>
                  {editingEntry() ? "Modifier l'intervention" : 'Nouvelle intervention'}
                </h2>
              </div>
              <div class="section-card-body">
                <Show
                  when={editingEntry()}
                  fallback={<ScheduleForm onSuccess={handleSuccess} />}
                >
                  <ScheduleForm
                    mode="edit"
                    initialData={editingEntry()!}
                    onSuccess={handleSuccess}
                    onCancel={handleCancelEdit}
                  />
                </Show>
              </div>
            </div>
          </section>

          {/* Schedule List */}
          <section class="schedule-list-section">
            <div class="section-card">
              <div class="section-card-header">
                <h2 class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Interventions planifiées
                </h2>
              </div>
              <div class="section-card-body">
                <ScheduleFilters
                  filters={state.filters}
                  onFiltersChange={handleFiltersChange}
                  onClear={handleClearFilters}
                />
                <ScheduleList
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMarkCompleted={handleMarkCompleted}
                  onMarkCancelled={handleMarkCancelled}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteEntry()}
        title="Supprimer l'intervention"
        message={`Êtes-vous sûr de vouloir supprimer l'intervention "${deleteEntry()?.description}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleteLoading()}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteEntry(null)}
        confirmVariant="danger"
      />
    </div>
  )
}

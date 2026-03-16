/**
 * WorkSessions Page
 * Global view of all work sessions with filters
 */

import { createEffect, on, Show, onMount } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { WorkSessionFilters } from '../components/payments/WorkSessionFilters'
import { WorkSessionList } from '../components/payments/WorkSessionList'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { showSuccess, showError } from '../components/ui/Toast'
import { workSessionStore } from '../stores/workSessionStore'
import { getStaffMembers } from '../services/staff.service'
import type { StaffMember } from '../lib/types/database'
import type { WorkSessionWithStaff, WorkSessionFilters as Filters } from '../lib/types/payments.types'
import { createSignal } from 'solid-js'

export default function WorkSessions() {
  const { user, session, loading, signOut } = useAuth()
  const { state, actions } = workSessionStore

  // Staff members for filter dropdown
  const [staffMembers, setStaffMembers] = createSignal<StaffMember[]>([])
  const [staffLoading, setStaffLoading] = createSignal(true)

  // Delete confirmation state
  const [deleteSession, setDeleteSession] = createSignal<WorkSessionWithStaff | null>(null)
  const [deleteLoading, setDeleteLoading] = createSignal(false)

  // Load staff members for filter
  onMount(async () => {
    const result = await getStaffMembers()
    if (!result.error && result.data) {
      setStaffMembers(result.data)
    }
    setStaffLoading(false)
  })

  // Fetch work sessions when auth is ready
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

  const handleFilterChange = (filters: Filters) => {
    actions.setFilters(filters)
  }

  const handleEditSession = (session: WorkSessionWithStaff) => {
    // Navigate to staff payment page for editing
    window.location.href = `/staff/${session.staff_member_id}/payments`
  }

  const handleDeleteSession = (session: WorkSessionWithStaff) => {
    setDeleteSession(session)
  }

  const confirmDeleteSession = async () => {
    const session = deleteSession()
    if (!session) return

    setDeleteLoading(true)
    const result = await actions.delete(session.id)
    setDeleteLoading(false)

    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Prestation supprimée avec succès')
    }
    setDeleteSession(null)
  }

  // Calculate total for displayed sessions
  const totalAmount = () => {
    return state.sessions.reduce((sum, s) => sum + s.amount_cents, 0)
  }

  const formatMoney = (cents: number) => {
    return (cents / 100).toLocaleString('fr-CH', {
      style: 'currency',
      currency: 'CHF',
    })
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
              Retour au tableau de bord
            </A>

            <div class="work-sessions-header">
              <div>
                <h1 class="page-title">Prestations</h1>
                <p class="page-subtitle">
                  {state.sessions.length} prestation{state.sessions.length !== 1 ? 's' : ''}
                  {' · '}
                  Total: {formatMoney(totalAmount())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div class="work-sessions-content">
          {/* Filters Section */}
          <section class="card filters-section">
            <div class="card-header">
              <h2>Filtres</h2>
            </div>
            <Show when={!staffLoading()}>
              <WorkSessionFilters
                staffMembers={staffMembers()}
                showStaffFilter={true}
                onFilterChange={handleFilterChange}
              />
            </Show>
          </section>

          {/* Work Sessions List */}
          <section class="card list-section">
            <div class="card-header">
              <h2>Liste des prestations</h2>
            </div>

            <WorkSessionList
              sessions={state.sessions}
              loading={state.loading}
              error={state.error}
              onEdit={handleEditSession}
              onDelete={handleDeleteSession}
              hideStaff={false}
              emptyMessage="Aucune prestation ne correspond aux filtres sélectionnés."
            />
          </section>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteSession()}
        title="Supprimer la prestation"
        message="Êtes-vous sûr de vouloir supprimer cette prestation ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="danger"
        isLoading={deleteLoading()}
        onConfirm={confirmDeleteSession}
        onCancel={() => setDeleteSession(null)}
      />
    </div>
  )
}

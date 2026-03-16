/**
 * StaffPayments Page
 * Staff member detail page with work sessions, payments, and balance
 */

import { createEffect, createSignal, on, Show, onMount } from 'solid-js'
import { A, useParams } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { WorkSessionForm } from '../components/payments/WorkSessionForm'
import { WorkSessionList } from '../components/payments/WorkSessionList'
import { PaymentForm } from '../components/payments/PaymentForm'
import { PaymentList } from '../components/payments/PaymentList'
import { StaffBalanceCard } from '../components/payments/StaffBalanceCard'
import { StaffHistoryList } from '../components/payments/StaffHistoryList'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { showSuccess, showError } from '../components/ui/Toast'
import { workSessionStore } from '../stores/workSessionStore'
import { staffPaymentStore } from '../stores/staffPaymentStore'
import { getStaffMember } from '../services/staff.service'
import { getStaffBalance } from '../services/staff-balance.service'
import type { StaffMember } from '../lib/types/database'
import type { WorkSessionWithStaff, StaffPaymentInsert } from '../lib/types/payments.types'
import { POSITION_LABELS, type StaffPosition } from '../lib/types/database'

export default function StaffPayments() {
  const params = useParams<{ id: string }>()
  const { user, session, loading, signOut } = useAuth()
  const { state: workState, actions: workActions } = workSessionStore
  const { state: paymentState, actions: paymentActions } = staffPaymentStore

  // Staff member state
  const [staffMember, setStaffMember] = createSignal<StaffMember | null>(null)
  const [staffLoading, setStaffLoading] = createSignal(true)
  const [staffError, setStaffError] = createSignal<string | null>(null)

  // Balance state
  const [balanceLoading, setBalanceLoading] = createSignal(true)
  const [totalWorkCents, setTotalWorkCents] = createSignal(0)
  const [totalPaidCents, setTotalPaidCents] = createSignal(0)
  const [balanceCents, setBalanceCents] = createSignal(0)

  // Work session form state
  const [showWorkForm, setShowWorkForm] = createSignal(false)
  const [editingSession, setEditingSession] = createSignal<WorkSessionWithStaff | null>(null)

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = createSignal(false)

  // Delete confirmation state
  const [deleteSession, setDeleteSession] = createSignal<WorkSessionWithStaff | null>(null)
  const [deleteLoading, setDeleteLoading] = createSignal(false)

  // History refresh trigger
  const [historyRefresh, setHistoryRefresh] = createSignal(0)

  // Load staff member data
  onMount(async () => {
    if (params.id) {
      const result = await getStaffMember(params.id)
      if (result.error) {
        setStaffError(result.error)
      } else if (result.data) {
        setStaffMember(result.data)
      }
      setStaffLoading(false)
    }
  })

  // Fetch work sessions and payments when auth is ready
  createEffect(
    on(
      () => ({ loading: loading(), session: session(), staffId: params.id }),
      ({ loading: isLoading, session: sess, staffId }) => {
        if (!isLoading && sess && staffId) {
          workActions.fetchByStaffMember(staffId)
          paymentActions.fetchByStaffMember(staffId)
          fetchBalance(staffId)
        }
      }
    )
  )

  // Fetch balance for this staff member
  const fetchBalance = async (staffId: string) => {
    setBalanceLoading(true)
    const result = await getStaffBalance(staffId)
    if (!result.error && result.data) {
      setTotalWorkCents(result.data.total_work_cents)
      setTotalPaidCents(result.data.total_paid_cents)
      setBalanceCents(result.data.balance_cents)
    }
    setBalanceLoading(false)
  }

  // Refresh balance and history after data changes
  const refreshBalance = () => {
    if (params.id) {
      fetchBalance(params.id)
      setHistoryRefresh((n) => n + 1)
    }
  }

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  const getStaffInitials = () => {
    const staff = staffMember()
    if (!staff) return '?'
    return `${staff.first_name.charAt(0)}${staff.last_name.charAt(0)}`
  }

  const getPositionLabel = (position: string): string => {
    return POSITION_LABELS[position as StaffPosition] || position
  }

  // Work session handlers
  const handleWorkFormSuccess = () => {
    setShowWorkForm(false)
    setEditingSession(null)
    workActions.fetchByStaffMember(params.id)
    refreshBalance()
  }

  const handleWorkCancelForm = () => {
    setShowWorkForm(false)
    setEditingSession(null)
  }

  const handleEditSession = (session: WorkSessionWithStaff) => {
    setEditingSession(session)
    setShowWorkForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteSession = (session: WorkSessionWithStaff) => {
    setDeleteSession(session)
  }

  const confirmDeleteSession = async () => {
    const session = deleteSession()
    if (!session) return

    setDeleteLoading(true)
    const result = await workActions.delete(session.id)
    setDeleteLoading(false)

    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Prestation supprimée avec succès')
      refreshBalance()
    }
    setDeleteSession(null)
  }

  // Payment handlers
  const handlePaymentSubmit = async (data: StaffPaymentInsert) => {
    const result = await paymentActions.add(data)
    if (!result.error) {
      showSuccess('Paiement enregistré avec succès')
      setShowPaymentForm(false)
      refreshBalance()
    }
    return result
  }

  const handlePaymentDelete = async (id: string) => {
    const result = await paymentActions.delete(id)
    if (!result.error) {
      refreshBalance()
    }
    return result
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
            <A href="/staff" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Retour au personnel
            </A>

            {/* Loading state */}
            <Show when={staffLoading()}>
              <div class="loading-container">
                <div class="loading-spinner" />
              </div>
            </Show>

            {/* Error state */}
            <Show when={staffError()}>
              <div class="error-state">
                <p>{staffError()}</p>
              </div>
            </Show>

            {/* Staff member info */}
            <Show when={staffMember()}>
              <div class="staff-payments-header">
                <div class="staff-payments-info">
                  <div class="staff-avatar-lg">{getStaffInitials()}</div>
                  <div>
                    <h1 class="page-title">
                      {staffMember()!.first_name} {staffMember()!.last_name}
                    </h1>
                    <p class="page-subtitle">{getPositionLabel(staffMember()!.position)}</p>
                  </div>
                </div>

                {/* Balance display */}
                <StaffBalanceCard
                  totalWorkCents={totalWorkCents()}
                  totalPaidCents={totalPaidCents()}
                  balanceCents={balanceCents()}
                  loading={balanceLoading()}
                />
              </div>
            </Show>
          </div>
        </div>

        <Show when={staffMember()}>
          {/* Staff Payments Content */}
          <div class="staff-payments-layout">
            {/* Two-column layout for forms */}
            <div class="staff-payments-forms">
              {/* Add/Edit Work Session Form */}
              <section class="card form-section">
                <div class="card-header">
                  <h2>
                    {editingSession() ? 'Modifier la prestation' : 'Nouvelle prestation'}
                  </h2>
                  <Show when={!showWorkForm() && !editingSession()}>
                    <button
                      class="btn btn-primary"
                      onClick={() => setShowWorkForm(true)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Nouvelle prestation
                    </button>
                  </Show>
                </div>

                <Show when={showWorkForm() || editingSession()}>
                  <WorkSessionForm
                    mode={editingSession() ? 'edit' : 'create'}
                    initialData={editingSession() || undefined}
                    staffMemberId={params.id}
                    onSuccess={handleWorkFormSuccess}
                    onCancel={handleWorkCancelForm}
                  />
                </Show>
              </section>

              {/* Add Payment Form */}
              <section class="card form-section">
                <div class="card-header">
                  <h2>Enregistrer un paiement</h2>
                  <Show when={!showPaymentForm()}>
                    <button
                      class="btn btn-primary"
                      onClick={() => setShowPaymentForm(true)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Nouveau paiement
                    </button>
                  </Show>
                </div>

                <Show when={showPaymentForm()}>
                  <PaymentForm
                    staffMemberId={params.id}
                    staffMemberName={`${staffMember()!.first_name} ${staffMember()!.last_name}`}
                    suggestedAmount={balanceCents() > 0 ? balanceCents() : undefined}
                    onSubmit={handlePaymentSubmit}
                    onCancel={() => setShowPaymentForm(false)}
                  />
                </Show>
              </section>
            </div>

            {/* Work Sessions List */}
            <section class="card list-section">
              <div class="card-header">
                <h2>Prestations ({workState.sessions.length})</h2>
              </div>

              <WorkSessionList
                sessions={workState.sessions}
                loading={workState.loading}
                error={workState.error}
                onEdit={handleEditSession}
                onDelete={handleDeleteSession}
                hideStaff={true}
                emptyMessage="Aucune prestation enregistrée pour cet employé."
              />
            </section>

            {/* Payments List */}
            <section class="card list-section">
              <div class="card-header">
                <h2>Paiements ({paymentState.payments.length})</h2>
              </div>

              <PaymentList
                payments={paymentState.payments}
                loading={paymentState.loading}
                error={paymentState.error}
                onDelete={handlePaymentDelete}
              />
            </section>

            {/* Unified History Timeline */}
            <section class="card list-section">
              <div class="card-header">
                <h2>Historique complet</h2>
              </div>

              <StaffHistoryList
                staffMemberId={params.id}
                refreshTrigger={historyRefresh()}
              />
            </section>
          </div>
        </Show>
      </main>

      {/* Delete Confirmation Dialog for Work Sessions */}
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

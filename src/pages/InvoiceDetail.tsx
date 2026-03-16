/**
 * Invoice Detail Page
 * Displays a single invoice with full details and actions
 */

import { createEffect, createSignal, on, Show } from 'solid-js'
import { A, useParams, useNavigate } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { InvoiceDetail } from '../components/billing/InvoiceDetail'
import { invoiceStore } from '../stores/invoiceStore'
import { showSuccess, showError } from '../components/ui/Toast'

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, session, loading, signOut } = useAuth()
  const { state, actions } = invoiceStore

  const [pageLoading, setPageLoading] = createSignal(true)

  // Fetch invoice when auth is ready
  createEffect(
    on(
      () => ({ loading: loading(), session: session(), id: params.id }),
      async ({ loading: isLoading, session: sess, id }) => {
        if (!isLoading && sess && id) {
          setPageLoading(true)
          await actions.fetchById(id)
          setPageLoading(false)
        }
      }
    )
  )

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  const handleMarkSent = async () => {
    const result = await actions.markAsSent(params.id)
    if (!result.error) {
      showSuccess('Facture marquée comme envoyée')
    } else {
      showError(result.error)
    }
    return result
  }

  const handleMarkPaid = async (paymentDate: string) => {
    const result = await actions.markAsPaid(params.id, paymentDate)
    if (!result.error) {
      showSuccess('Facture marquée comme payée')
    } else {
      showError(result.error)
    }
    return result
  }

  const handleCancel = async () => {
    const result = await actions.cancel(params.id)
    if (!result.error) {
      showSuccess('Facture annulée')
    } else {
      showError(result.error)
    }
    return result
  }

  const handlePrint = () => {
    navigate(`/invoices/${params.id}/print`)
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
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
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
            <A href="/invoices" class="back-link">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Retour aux factures
            </A>
            <h1 class="page-title">Détail de la facture</h1>
          </div>
        </div>

        {/* Loading State */}
        <Show when={pageLoading()}>
          <div class="loading-container">
            <div class="spinner" />
            <p>Chargement de la facture...</p>
          </div>
        </Show>

        {/* Error State */}
        <Show when={!pageLoading() && state.error}>
          <div class="error-state">
            <svg
              class="error-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>Erreur</h3>
            <p>{state.error}</p>
            <A href="/invoices" class="btn btn-primary">
              Retour aux factures
            </A>
          </div>
        </Show>

        {/* Invoice Detail */}
        <Show when={!pageLoading() && !state.error && state.currentInvoice}>
          <section class="invoice-detail-section">
            <div class="section-card">
              <InvoiceDetail
                invoice={state.currentInvoice!}
                onMarkSent={handleMarkSent}
                onMarkPaid={handleMarkPaid}
                onCancel={handleCancel}
                onPrint={handlePrint}
              />
            </div>
          </section>
        </Show>
      </main>
    </div>
  )
}

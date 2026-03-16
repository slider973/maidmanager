/**
 * Invoices Page
 * Main page for invoice management
 */

import { createEffect, createSignal, on, Show, For } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { InvoiceForm } from '../components/billing/InvoiceForm'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { invoiceStore } from '../stores/invoiceStore'
import { clientStore } from '../stores/clientStore'
import { showSuccess, showError } from '../components/ui/Toast'
import {
  formatMoney,
  INVOICE_STATUS_LABELS,
  type Invoice,
  type InvoiceInsert,
  type InvoiceLineInsert,
  type InvoiceStatus,
} from '../lib/types/billing.types'

export default function Invoices() {
  const { user, session, loading, signOut } = useAuth()
  const { state, actions } = invoiceStore
  const { actions: clientActions } = clientStore

  const [showForm, setShowForm] = createSignal(false)
  const [deletingInvoice, setDeletingInvoice] = createSignal<Invoice | null>(null)
  const [filterStatus, setFilterStatus] = createSignal<InvoiceStatus | ''>('')

  // Fetch invoices and clients when auth is ready
  createEffect(
    on(
      () => ({ loading: loading(), session: session() }),
      ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess) {
          actions.fetch()
          clientActions.fetch()
        }
      }
    )
  )

  // Filter invoices by status
  createEffect(() => {
    const status = filterStatus()
    if (status) {
      actions.setFilters({ status })
    } else {
      actions.setFilters({})
    }
  })

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  const handleCreateInvoice = async (
    data: InvoiceInsert,
    lines: Omit<InvoiceLineInsert, 'invoice_id'>[]
  ) => {
    const result = await actions.create(data, lines)
    if (!result.error) {
      showSuccess('Facture créée avec succès')
      setShowForm(false)
    }
    return result
  }

  const handleDeleteConfirm = async () => {
    const invoice = deletingInvoice()
    if (!invoice) return

    const result = await actions.delete(invoice.id)
    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Facture supprimée avec succès')
    }
    setDeletingInvoice(null)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusClass = (status: InvoiceStatus): string => {
    switch (status) {
      case 'draft':
        return 'invoice-status-draft'
      case 'sent':
        return 'invoice-status-sent'
      case 'paid':
        return 'invoice-status-paid'
      case 'cancelled':
        return 'invoice-status-cancelled'
      default:
        return ''
    }
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
            <A href="/" class="back-link">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Retour
            </A>
            <h1 class="page-title">Factures</h1>
            <p class="page-subtitle">Créez et gérez vos factures clients</p>
          </div>
          <button
            class="btn btn-primary"
            onClick={() => setShowForm(!showForm())}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {showForm() ? 'Masquer le formulaire' : 'Nouvelle facture'}
          </button>
        </div>

        {/* Invoice Form (collapsible) */}
        <Show when={showForm()}>
          <section class="invoice-form-section">
            <div class="section-card">
              <div class="section-card-header">
                <h2 class="section-card-title">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  Créer une facture
                </h2>
              </div>
              <div class="section-card-body">
                <InvoiceForm
                  onSubmit={handleCreateInvoice}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          </section>
        </Show>

        {/* Filters */}
        <div class="invoice-filters">
          <div class="filter-group">
            <label class="filter-label">Statut:</label>
            <select
              class="form-input form-select filter-select"
              value={filterStatus()}
              onChange={(e) =>
                setFilterStatus(e.currentTarget.value as InvoiceStatus | '')
              }
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="sent">Envoyées</option>
              <option value="paid">Payées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
          <span class="invoice-count">
            {state.invoices.length} facture{state.invoices.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Invoice List */}
        <section class="invoice-list-section">
          <Show when={state.loading}>
            <div class="loading-container">
              <div class="spinner" />
              <p>Chargement des factures...</p>
            </div>
          </Show>

          <Show when={!state.loading && state.invoices.length === 0}>
            <div class="empty-state">
              <svg
                class="empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <h3 class="empty-state-title">Aucune facture</h3>
              <p class="empty-state-text">
                {filterStatus()
                  ? 'Aucune facture ne correspond à ce filtre'
                  : 'Créez votre première facture pour commencer'}
              </p>
              <Show when={!filterStatus()}>
                <button class="btn btn-primary" onClick={() => setShowForm(true)}>
                  Créer une facture
                </button>
              </Show>
            </div>
          </Show>

          <Show when={!state.loading && state.invoices.length > 0}>
            <div class="invoice-list">
              <For each={state.invoices}>
                {(invoice) => (
                  <div class="invoice-card">
                    <div class="invoice-card-header">
                      <div class="invoice-card-info">
                        <span class="invoice-number">{invoice.invoice_number}</span>
                        <span class="invoice-client">{invoice.client_name}</span>
                      </div>
                      <span class={`invoice-status ${getStatusClass(invoice.status)}`}>
                        {INVOICE_STATUS_LABELS[invoice.status]}
                      </span>
                    </div>
                    <div class="invoice-card-body">
                      <div class="invoice-meta">
                        <span class="invoice-date">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {formatDate(invoice.invoice_date)}
                        </span>
                        <Show when={invoice.payment_date}>
                          <span class="invoice-paid-date">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="1.5"
                            >
                              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                              <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                            Payée le {formatDate(invoice.payment_date!)}
                          </span>
                        </Show>
                      </div>
                      <span class="invoice-amount">
                        {formatMoney(invoice.total_amount)}
                      </span>
                    </div>
                    <Show when={invoice.status === 'draft'}>
                      <div class="invoice-card-actions">
                        <A
                          href={`/invoices/${invoice.id}`}
                          class="btn btn-sm btn-secondary"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Voir
                        </A>
                        <button
                          type="button"
                          class="btn btn-sm btn-danger"
                          onClick={() => setDeletingInvoice(invoice)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                          >
                            <polyline points="3,6 5,6 21,6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </Show>
                    <Show when={invoice.status !== 'draft'}>
                      <div class="invoice-card-actions">
                        <A
                          href={`/invoices/${invoice.id}`}
                          class="btn btn-sm btn-secondary"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Voir
                        </A>
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </section>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingInvoice() !== null}
        title="Supprimer la facture"
        message={`Êtes-vous sûr de vouloir supprimer la facture "${deletingInvoice()?.invoice_number}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingInvoice(null)}
        confirmVariant="danger"
      />
    </div>
  )
}

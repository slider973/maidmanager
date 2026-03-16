/**
 * Invoice Print Page
 * Print-optimized view for generating PDF via browser print
 */

import { createEffect, createSignal, on, Show, For, onMount } from 'solid-js'
import { useParams, useNavigate } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { invoiceStore } from '../stores/invoiceStore'
import { formatMoney, INVOICE_STATUS_LABELS } from '../lib/types/billing.types'

export default function InvoicePrint() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session, loading } = useAuth()
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

  // Auto-print when invoice is loaded
  onMount(() => {
    const checkAndPrint = setInterval(() => {
      if (!pageLoading() && state.currentInvoice) {
        clearInterval(checkAndPrint)
        // Small delay to ensure styles are applied
        setTimeout(() => {
          window.print()
        }, 500)
      }
    }, 100)

    // Cleanup
    return () => clearInterval(checkAndPrint)
  })

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleBack = () => {
    navigate(`/invoices/${params.id}`)
  }

  return (
    <div class="print-page">
      {/* Print Controls (hidden when printing) */}
      <div class="print-controls no-print">
        <button class="btn btn-secondary" onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Retour
        </button>
        <button class="btn btn-primary" onClick={() => window.print()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="6,9 6,2 18,2 18,9" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Imprimer
        </button>
      </div>

      {/* Loading State */}
      <Show when={pageLoading()}>
        <div class="print-loading no-print">
          <div class="spinner" />
          <p>Chargement de la facture...</p>
        </div>
      </Show>

      {/* Invoice Content */}
      <Show when={!pageLoading() && state.currentInvoice}>
        <div class="invoice-print">
          {/* Header */}
          <header class="invoice-print-header">
            <div class="invoice-print-company">
              <div class="invoice-print-logo">M</div>
              <div class="invoice-print-company-name">MaidManager</div>
            </div>
            <div class="invoice-print-title">
              <h1>FACTURE</h1>
              <p class="invoice-print-number">{state.currentInvoice!.invoice_number}</p>
            </div>
          </header>

          {/* Date and Status */}
          <div class="invoice-print-meta">
            <div class="invoice-print-date">
              <strong>Date de facture:</strong> {formatDate(state.currentInvoice!.invoice_date)}
            </div>
            <Show when={state.currentInvoice!.payment_date}>
              <div class="invoice-print-payment">
                <strong>Date de paiement:</strong> {formatDate(state.currentInvoice!.payment_date!)}
              </div>
            </Show>
            <div class="invoice-print-status">
              <strong>Statut:</strong> {INVOICE_STATUS_LABELS[state.currentInvoice!.status]}
            </div>
          </div>

          {/* Client Info */}
          <div class="invoice-print-client">
            <h2>Facturé à:</h2>
            <p class="invoice-print-client-name">{state.currentInvoice!.client_name}</p>
            <Show when={state.currentInvoice!.client_address}>
              <p class="invoice-print-client-address">{state.currentInvoice!.client_address}</p>
            </Show>
            <Show when={state.currentInvoice!.client_email}>
              <p class="invoice-print-client-email">{state.currentInvoice!.client_email}</p>
            </Show>
          </div>

          {/* Lines Table */}
          <table class="invoice-print-table">
            <thead>
              <tr>
                <th class="col-description">Description</th>
                <th class="col-amount">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              <For each={state.currentInvoice!.lines}>
                {(line) => (
                  <tr>
                    <td class="col-description">{line.description}</td>
                    <td class="col-amount">{formatMoney(line.amount)}</td>
                  </tr>
                )}
              </For>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td class="col-description"><strong>Total HT</strong></td>
                <td class="col-amount"><strong>{formatMoney(state.currentInvoice!.total_amount)}</strong></td>
              </tr>
            </tfoot>
          </table>

          {/* Notes */}
          <Show when={state.currentInvoice!.notes}>
            <div class="invoice-print-notes">
              <h3>Notes:</h3>
              <p>{state.currentInvoice!.notes}</p>
            </div>
          </Show>

          {/* Footer */}
          <footer class="invoice-print-footer">
            <p>Document généré par MaidManager</p>
          </footer>
        </div>
      </Show>
    </div>
  )
}

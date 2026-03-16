/**
 * InvoiceDetail Component
 * Displays full invoice details with lines and actions
 */

import { Show, For, createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import {
  formatMoney,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_TRANSITIONS,
  type InvoiceWithLines,
  type InvoiceStatus,
} from '../../lib/types/billing.types'

interface InvoiceDetailProps {
  invoice: InvoiceWithLines
  onMarkSent?: () => Promise<{ error: string | null }>
  onMarkPaid?: (paymentDate: string) => Promise<{ error: string | null }>
  onCancel?: () => Promise<{ error: string | null }>
  onPrint?: () => void
}

export const InvoiceDetail: Component<InvoiceDetailProps> = (props) => {
  const [paymentDate, setPaymentDate] = createSignal(
    new Date().toISOString().split('T')[0]
  )
  const [showPaymentDialog, setShowPaymentDialog] = createSignal(false)
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal('')

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatusClass = (): string => {
    switch (props.invoice.status) {
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

  const canTransitionTo = (status: InvoiceStatus): boolean => {
    return INVOICE_STATUS_TRANSITIONS[props.invoice.status].includes(status)
  }

  const handleMarkSent = async () => {
    if (!props.onMarkSent) return
    setLoading(true)
    setError('')
    const result = await props.onMarkSent()
    setLoading(false)
    if (result.error) {
      setError(result.error)
    }
  }

  const handleMarkPaid = async () => {
    if (!props.onMarkPaid) return
    setLoading(true)
    setError('')
    const result = await props.onMarkPaid(paymentDate())
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setShowPaymentDialog(false)
    }
  }

  const handleCancel = async () => {
    if (!props.onCancel) return
    if (!confirm('Êtes-vous sûr de vouloir annuler cette facture ?')) return
    setLoading(true)
    setError('')
    const result = await props.onCancel()
    setLoading(false)
    if (result.error) {
      setError(result.error)
    }
  }

  return (
    <div class="invoice-detail">
      {/* Header */}
      <div class="invoice-detail-header">
        <div class="invoice-detail-title">
          <h2 class="invoice-detail-number">{props.invoice.invoice_number}</h2>
          <span class={`invoice-status invoice-status-lg ${getStatusClass()}`}>
            {INVOICE_STATUS_LABELS[props.invoice.status]}
          </span>
        </div>
        <div class="invoice-detail-date">
          Date: {formatDate(props.invoice.invoice_date)}
        </div>
      </div>

      <Show when={error()}>
        <div class="error-message">
          <span class="error-text">{error()}</span>
        </div>
      </Show>

      {/* Client Info */}
      <div class="invoice-detail-section">
        <h3 class="invoice-detail-section-title">Client</h3>
        <div class="invoice-client-info">
          <p class="invoice-client-name">{props.invoice.client_name}</p>
          <Show when={props.invoice.client_address}>
            <p class="invoice-client-address">{props.invoice.client_address}</p>
          </Show>
          <Show when={props.invoice.client_email}>
            <p class="invoice-client-email">{props.invoice.client_email}</p>
          </Show>
        </div>
      </div>

      {/* Lines */}
      <div class="invoice-detail-section">
        <h3 class="invoice-detail-section-title">Lignes de facture</h3>
        <div class="invoice-lines">
          <div class="invoice-lines-header">
            <span class="invoice-line-description">Description</span>
            <span class="invoice-line-amount">Montant HT</span>
          </div>
          <For each={props.invoice.lines}>
            {(line) => (
              <div class="invoice-line">
                <span class="invoice-line-description">{line.description}</span>
                <span class="invoice-line-amount">{formatMoney(line.amount)}</span>
              </div>
            )}
          </For>
          <div class="invoice-lines-total">
            <span class="invoice-total-label">Total HT</span>
            <span class="invoice-total-value">
              {formatMoney(props.invoice.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <Show when={props.invoice.notes}>
        <div class="invoice-detail-section">
          <h3 class="invoice-detail-section-title">Notes</h3>
          <p class="invoice-notes">{props.invoice.notes}</p>
        </div>
      </Show>

      {/* Payment Info */}
      <Show when={props.invoice.payment_date}>
        <div class="invoice-detail-section">
          <h3 class="invoice-detail-section-title">Paiement</h3>
          <p class="invoice-payment-date">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
            Payée le {formatDate(props.invoice.payment_date!)}
          </p>
        </div>
      </Show>

      {/* Actions */}
      <div class="invoice-detail-actions">
        <Show when={props.onPrint}>
          <button
            type="button"
            class="btn btn-secondary"
            onClick={props.onPrint}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <polyline points="6,9 6,2 18,2 18,9" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimer / PDF
          </button>
        </Show>

        <Show when={canTransitionTo('sent') && props.onMarkSent}>
          <button
            type="button"
            class="btn btn-primary"
            onClick={handleMarkSent}
            disabled={loading()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22,2 15,22 11,13 2,9 22,2" />
            </svg>
            Marquer comme envoyée
          </button>
        </Show>

        <Show when={canTransitionTo('paid') && props.onMarkPaid}>
          <button
            type="button"
            class="btn btn-success"
            onClick={() => setShowPaymentDialog(true)}
            disabled={loading()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
            Marquer comme payée
          </button>
        </Show>

        <Show when={canTransitionTo('cancelled') && props.onCancel}>
          <button
            type="button"
            class="btn btn-danger"
            onClick={handleCancel}
            disabled={loading()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            Annuler
          </button>
        </Show>
      </div>

      {/* Payment Date Dialog */}
      <Show when={showPaymentDialog()}>
        <div class="dialog-overlay" onClick={() => setShowPaymentDialog(false)}>
          <div class="dialog" onClick={(e) => e.stopPropagation()}>
            <h3 class="dialog-title">Date de paiement</h3>
            <div class="form-group">
              <label class="form-label" for="payment-date">
                Date du paiement
              </label>
              <input
                class="form-input"
                id="payment-date"
                type="date"
                value={paymentDate()}
                onInput={(e) => setPaymentDate(e.currentTarget.value)}
                required
              />
            </div>
            <div class="dialog-actions">
              <button
                type="button"
                class="btn btn-secondary"
                onClick={() => setShowPaymentDialog(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                class="btn btn-success"
                onClick={handleMarkPaid}
                disabled={loading()}
              >
                Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

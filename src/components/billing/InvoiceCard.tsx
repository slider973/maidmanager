/**
 * InvoiceCard Component
 * Displays a single invoice in the list
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import { A } from '@solidjs/router'
import { formatMoney, INVOICE_STATUS_LABELS, type Invoice } from '../../lib/types/billing.types'

interface InvoiceCardProps {
  invoice: Invoice
  onDelete?: (invoice: Invoice) => void
}

export const InvoiceCard: Component<InvoiceCardProps> = (props) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
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

  return (
    <div class="invoice-card">
      <div class="invoice-card-header">
        <div class="invoice-card-info">
          <span class="invoice-number">{props.invoice.invoice_number}</span>
          <span class="invoice-client">{props.invoice.client_name}</span>
        </div>
        <span class={`invoice-status ${getStatusClass()}`}>
          {INVOICE_STATUS_LABELS[props.invoice.status]}
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
            {formatDate(props.invoice.invoice_date)}
          </span>
          <Show when={props.invoice.payment_date}>
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
              Payée le {formatDate(props.invoice.payment_date!)}
            </span>
          </Show>
        </div>
        <span class="invoice-amount">{formatMoney(props.invoice.total_amount)}</span>
      </div>
      <div class="invoice-card-actions">
        <A href={`/invoices/${props.invoice.id}`} class="btn btn-sm btn-secondary">
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
        <Show when={props.invoice.status === 'draft' && props.onDelete}>
          <button
            type="button"
            class="btn btn-sm btn-danger"
            onClick={() => props.onDelete?.(props.invoice)}
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
        </Show>
      </div>
    </div>
  )
}

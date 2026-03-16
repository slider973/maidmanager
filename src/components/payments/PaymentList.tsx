/**
 * PaymentList Component
 * Displays a list of staff payments with loading and empty states
 */

import { Show, For, createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import { PaymentCard } from './PaymentCard'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { showSuccess, showError } from '../ui/Toast'
import type { StaffPayment, StaffPaymentWithStaff } from '../../lib/types/payments.types'

interface PaymentListProps {
  payments: (StaffPayment | StaffPaymentWithStaff)[]
  loading: boolean
  error: string | null
  showStaff?: boolean
  onDelete?: (id: string) => Promise<{ error: string | null }>
}

export const PaymentList: Component<PaymentListProps> = (props) => {
  const [paymentToDelete, setPaymentToDelete] = createSignal<string | null>(null)
  const [isDeleting, setIsDeleting] = createSignal(false)

  const handleDeleteClick = (paymentId: string) => {
    setPaymentToDelete(paymentId)
  }

  const handleConfirmDelete = async () => {
    const id = paymentToDelete()
    if (!id || !props.onDelete) return

    setIsDeleting(true)
    const result = await props.onDelete(id)
    setIsDeleting(false)

    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Paiement supprimé')
      setPaymentToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setPaymentToDelete(null)
  }

  return (
    <div class="payment-list">
      <Show when={props.loading}>
        <div class="payment-loading">
          <span class="loading-spinner" />
          <span>Chargement des paiements...</span>
        </div>
      </Show>

      <Show when={!props.loading && props.error}>
        <div class="payment-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{props.error}</span>
        </div>
      </Show>

      <Show when={!props.loading && !props.error}>
        <Show
          when={props.payments.length > 0}
          fallback={
            <div class="payment-empty">
              <div class="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <h3 class="empty-state-title">Aucun paiement</h3>
              <p class="empty-state-text">
                Les paiements enregistrés apparaîtront ici.
              </p>
            </div>
          }
        >
          <div class="payment-grid">
            <For each={props.payments}>
              {(payment) => (
                <PaymentCard
                  payment={payment}
                  showStaff={props.showStaff}
                  actions={
                    props.onDelete && (
                      <button
                        type="button"
                        class="btn btn-sm btn-ghost btn-danger"
                        onClick={() => handleDeleteClick(payment.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        Supprimer
                      </button>
                    )
                  }
                />
              )}
            </For>
          </div>
        </Show>
      </Show>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={paymentToDelete() !== null}
        title="Supprimer ce paiement ?"
        message="Voulez-vous vraiment supprimer ce paiement ? Cette action est irréversible."
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={isDeleting()}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

/**
 * PaymentForm Component
 * Form for creating and editing staff payments
 */

import { createSignal, createEffect, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { PAYMENT_METHODS, parseMoney, formatMoney } from '../../lib/types/payments.types'
import type { StaffPaymentInsert } from '../../lib/types/payments.types'

interface PaymentFormProps {
  staffMemberId: string
  staffMemberName?: string
  suggestedAmount?: number // Balance due in cents
  onSubmit: (data: StaffPaymentInsert) => Promise<{ error: string | null }>
  onCancel?: () => void
}

export const PaymentForm: Component<PaymentFormProps> = (props) => {
  const [amount, setAmount] = createSignal('')
  const [paymentDate, setPaymentDate] = createSignal(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = createSignal<string>('')
  const [notes, setNotes] = createSignal('')
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  // Pre-fill suggested amount if provided
  createEffect(() => {
    if (props.suggestedAmount && props.suggestedAmount > 0 && !amount()) {
      setAmount((props.suggestedAmount / 100).toFixed(2).replace('.', ','))
    }
  })

  const amountCents = () => parseMoney(amount())

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError(null)

    if (amountCents() <= 0) {
      setError('Le montant doit être supérieur à 0')
      return
    }

    setIsSubmitting(true)

    const data: StaffPaymentInsert = {
      staff_member_id: props.staffMemberId,
      amount_cents: amountCents(),
      payment_date: paymentDate(),
      payment_method: paymentMethod() || null,
      notes: notes() || null,
    }

    const result = await props.onSubmit(data)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      // Reset form
      setAmount('')
      setPaymentDate(new Date().toISOString().split('T')[0])
      setPaymentMethod('')
      setNotes('')
      setIsSubmitting(false)
    }
  }

  const handlePayFullBalance = () => {
    if (props.suggestedAmount && props.suggestedAmount > 0) {
      setAmount((props.suggestedAmount / 100).toFixed(2).replace('.', ','))
    }
  }

  return (
    <form class="payment-form" onSubmit={handleSubmit}>
      <Show when={error()}>
        <div class="form-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error()}
        </div>
      </Show>

      <Show when={props.staffMemberName}>
        <div class="form-info">
          <span class="form-info-label">Paiement pour</span>
          <span class="form-info-value">{props.staffMemberName}</span>
        </div>
      </Show>

      <div class="form-row">
        <div class="form-group">
          <label for="amount" class="form-label">
            Montant (CHF) <span class="required">*</span>
          </label>
          <div class="input-with-action">
            <input
              type="text"
              id="amount"
              class="form-input"
              value={amount()}
              onInput={(e) => setAmount(e.currentTarget.value)}
              placeholder="0,00"
              required
              disabled={isSubmitting()}
            />
            <Show when={props.suggestedAmount && props.suggestedAmount > 0}>
              <button
                type="button"
                class="btn btn-sm btn-ghost"
                onClick={handlePayFullBalance}
                disabled={isSubmitting()}
              >
                Solder ({formatMoney(props.suggestedAmount!)})
              </button>
            </Show>
          </div>
        </div>

        <div class="form-group">
          <label for="paymentDate" class="form-label">
            Date du paiement <span class="required">*</span>
          </label>
          <input
            type="date"
            id="paymentDate"
            class="form-input"
            value={paymentDate()}
            onInput={(e) => setPaymentDate(e.currentTarget.value)}
            max={new Date().toISOString().split('T')[0]}
            required
            disabled={isSubmitting()}
          />
        </div>
      </div>

      <div class="form-group">
        <label for="paymentMethod" class="form-label">
          Mode de paiement
        </label>
        <select
          id="paymentMethod"
          class="form-select"
          value={paymentMethod()}
          onChange={(e) => setPaymentMethod(e.currentTarget.value)}
          disabled={isSubmitting()}
        >
          <option value="">-- Sélectionner --</option>
          {PAYMENT_METHODS.map((method) => (
            <option value={method}>{method}</option>
          ))}
        </select>
      </div>

      <div class="form-group">
        <label for="notes" class="form-label">
          Notes
        </label>
        <textarea
          id="notes"
          class="form-textarea"
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
          placeholder="Notes optionnelles..."
          rows={2}
          disabled={isSubmitting()}
        />
      </div>

      {/* Show calculated amount */}
      <Show when={amountCents() > 0}>
        <div class="calculated-amount">
          <span class="calculated-label">Montant à enregistrer</span>
          <span class="calculated-value">{formatMoney(amountCents())}</span>
        </div>
      </Show>

      <div class="form-actions">
        <Show when={props.onCancel}>
          <button
            type="button"
            class="btn btn-secondary"
            onClick={props.onCancel}
            disabled={isSubmitting()}
          >
            Annuler
          </button>
        </Show>
        <button type="submit" class="btn btn-primary" disabled={isSubmitting()}>
          {isSubmitting() ? (
            <>
              <span class="loading-spinner loading-spinner-sm" />
              Enregistrement...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12" />
              </svg>
              Enregistrer le paiement
            </>
          )}
        </button>
      </div>
    </form>
  )
}

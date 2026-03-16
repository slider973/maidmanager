/**
 * StaffBalanceCard Component
 * Displays balance information for a single staff member
 */

import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { formatMoney } from '../../lib/types/payments.types'

interface StaffBalanceCardProps {
  totalWorkCents: number
  totalPaidCents: number
  balanceCents: number
  loading?: boolean
  compact?: boolean // For inline display in staff cards
}

export const StaffBalanceCard: Component<StaffBalanceCardProps> = (props) => {
  const isPositive = () => props.balanceCents > 0
  const isNegative = () => props.balanceCents < 0
  const isZero = () => props.balanceCents === 0

  // Compact version for inline display
  if (props.compact) {
    return (
      <div class="staff-balance-compact">
        <Show when={props.loading}>
          <span class="balance-loading">...</span>
        </Show>
        <Show when={!props.loading}>
          <span
            class={`balance-amount ${isPositive() ? 'balance-positive' : ''} ${isNegative() ? 'balance-negative' : ''} ${isZero() ? 'balance-zero' : ''}`}
          >
            {isPositive() ? '+' : ''}{formatMoney(props.balanceCents)}
          </span>
          <span class="balance-label">
            {isPositive() ? 'dû' : isNegative() ? 'avance' : ''}
          </span>
        </Show>
      </div>
    )
  }

  // Full card version
  return (
    <div class="staff-balance-card">
      <Show when={props.loading}>
        <div class="balance-loading-state">
          <span class="loading-spinner" />
          <span>Calcul du solde...</span>
        </div>
      </Show>

      <Show when={!props.loading}>
        <div class="balance-summary">
          <div class="balance-main">
            <span class="balance-title">Solde</span>
            <span
              class={`balance-value ${isPositive() ? 'balance-positive' : ''} ${isNegative() ? 'balance-negative' : ''} ${isZero() ? 'balance-zero' : ''}`}
            >
              {isPositive() ? '+' : ''}{formatMoney(props.balanceCents)}
            </span>
            <span class="balance-status">
              {isPositive()
                ? 'À payer'
                : isNegative()
                  ? 'Avance versée'
                  : 'Soldé'}
            </span>
          </div>

          <div class="balance-details">
            <div class="balance-row">
              <span class="balance-row-label">Total prestations</span>
              <span class="balance-row-value">{formatMoney(props.totalWorkCents)}</span>
            </div>
            <div class="balance-row">
              <span class="balance-row-label">Total paiements</span>
              <span class="balance-row-value">- {formatMoney(props.totalPaidCents)}</span>
            </div>
            <div class="balance-row balance-row-total">
              <span class="balance-row-label">Reste dû</span>
              <span
                class={`balance-row-value ${isPositive() ? 'balance-positive' : ''} ${isNegative() ? 'balance-negative' : ''}`}
              >
                {formatMoney(props.balanceCents)}
              </span>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

/**
 * GlobalBalanceWidget Component
 * Displays total balance owed to all staff members on the dashboard
 */

import { createSignal, createEffect, on, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { useAuth } from '../../lib/auth'
import { getGlobalBalance } from '../../services/staff-balance.service'
import { formatMoney } from '../../lib/types/payments.types'
import type { GlobalBalance } from '../../lib/types/payments.types'

export const GlobalBalanceWidget: Component = () => {
  const { session, loading: authLoading } = useAuth()
  const [balance, setBalance] = createSignal<GlobalBalance | null>(null)
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)

  // Fetch balance when auth is ready
  createEffect(
    on(
      () => ({ loading: authLoading(), session: session() }),
      async ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess) {
          setLoading(true)
          const result = await getGlobalBalance()
          if (result.error) {
            setError(result.error)
          } else if (result.data) {
            setBalance(result.data)
          }
          setLoading(false)
        }
      }
    )
  )

  return (
    <div class="global-balance-widget">
      <div class="global-balance-header">
        <span class="global-balance-title">Total dû au personnel</span>
        <svg class="global-balance-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      </div>

      <Show when={loading()}>
        <div class="global-balance-amount">...</div>
        <div class="global-balance-subtitle">Chargement...</div>
      </Show>

      <Show when={!loading() && error()}>
        <div class="global-balance-amount">—</div>
        <div class="global-balance-subtitle">{error()}</div>
      </Show>

      <Show when={!loading() && !error() && balance()}>
        <div class="global-balance-amount">
          {formatMoney(balance()!.total_balance_cents)}
        </div>
        <div class="global-balance-subtitle">
          {balance()!.total_balance_cents > 0
            ? 'à payer au personnel'
            : balance()!.total_balance_cents < 0
              ? 'avance versée'
              : 'tous les comptes sont soldés'}
        </div>

        <div class="global-balance-details">
          <div class="global-balance-stat">
            <span class="global-balance-stat-label">Prestations</span>
            <span class="global-balance-stat-value">{formatMoney(balance()!.total_work_cents)}</span>
          </div>
          <div class="global-balance-stat">
            <span class="global-balance-stat-label">Paiements</span>
            <span class="global-balance-stat-value">{formatMoney(balance()!.total_paid_cents)}</span>
          </div>
          <div class="global-balance-stat">
            <span class="global-balance-stat-label">Personnel</span>
            <span class="global-balance-stat-value">{balance()!.staff_count} membre{balance()!.staff_count > 1 ? 's' : ''}</span>
          </div>
        </div>
      </Show>
    </div>
  )
}

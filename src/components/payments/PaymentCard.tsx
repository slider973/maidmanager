/**
 * PaymentCard Component
 * Displays a single staff payment
 */

import { Show } from 'solid-js'
import type { Component, JSX } from 'solid-js'
import { formatMoney, PAYMENT_METHOD_LABELS } from '../../lib/types/payments.types'
import type { StaffPayment, StaffPaymentWithStaff } from '../../lib/types/payments.types'
import { POSITION_LABELS, type StaffPosition } from '../../lib/types/database'

interface PaymentCardProps {
  payment: StaffPayment | StaffPaymentWithStaff
  showStaff?: boolean
  actions?: JSX.Element
}

export const PaymentCard: Component<PaymentCardProps> = (props) => {
  const hasStaffMember = () => {
    return 'staff_member' in props.payment && props.payment.staff_member !== null
  }

  const staffMember = () => {
    if ('staff_member' in props.payment) {
      return props.payment.staff_member
    }
    return null
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div class="payment-card">
      <div class="payment-card-header">
        <div class="payment-card-info">
          <div class="payment-card-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(props.payment.payment_date)}</span>
          </div>
          <Show when={props.payment.payment_method}>
            <div class="payment-method">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <span>
                {PAYMENT_METHOD_LABELS[props.payment.payment_method!] || props.payment.payment_method}
              </span>
            </div>
          </Show>
        </div>
        <div class="payment-card-amount">
          <span class="payment-amount-value">
            {formatMoney(props.payment.amount_cents)}
          </span>
        </div>
      </div>

      <Show when={props.showStaff && hasStaffMember()}>
        <div class="payment-card-staff">
          <div class="payment-staff-avatar">
            {staffMember()!.first_name.charAt(0)}{staffMember()!.last_name.charAt(0)}
          </div>
          <div class="payment-staff-info">
            <span class="payment-staff-name">
              {staffMember()!.first_name} {staffMember()!.last_name}
            </span>
            <span class="payment-staff-position">
              {POSITION_LABELS[staffMember()!.position as StaffPosition] || staffMember()!.position}
            </span>
          </div>
        </div>
      </Show>

      <Show when={props.showStaff && !hasStaffMember()}>
        <div class="payment-card-staff">
          <span class="payment-no-staff">Employé non trouvé</span>
        </div>
      </Show>

      <Show when={props.payment.notes}>
        <div class="payment-card-notes">
          <p>{props.payment.notes}</p>
        </div>
      </Show>

      <Show when={props.actions}>
        <div class="payment-card-actions">
          {props.actions}
        </div>
      </Show>
    </div>
  )
}

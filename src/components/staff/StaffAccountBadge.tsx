/**
 * StaffAccountBadge Component
 * Feature: 009-staff-portal
 * Shows the account status of a staff member
 */

import { createResource, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { isStaffLinked } from '../../services/staff-account.service'

interface StaffAccountBadgeProps {
  staffMemberId: string
}

export const StaffAccountBadge: Component<StaffAccountBadgeProps> = (props) => {
  const [hasAccount] = createResource(() => props.staffMemberId, isStaffLinked)

  return (
    <Show when={!hasAccount.loading}>
      <Show
        when={hasAccount()}
        fallback={
          <span class="badge badge-secondary" title="Pas de compte utilisateur">
            Sans compte
          </span>
        }
      >
        <span class="badge badge-success" title="Compte utilisateur actif">
          Compte actif
        </span>
      </Show>
    </Show>
  )
}

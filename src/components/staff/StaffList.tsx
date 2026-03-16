/**
 * StaffList Component
 * Displays a list of staff members with delete functionality and balance display
 */

import { createSignal, createEffect, Show, For, onMount } from 'solid-js'
import type { Component } from 'solid-js'
import { A } from '@solidjs/router'
import { staffStore } from '../../stores/staff.store'
import { POSITION_LABELS, type StaffMember } from '../../lib/types/database'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { showSuccess, showError } from '../ui/Toast'
import { getStaffBalances } from '../../services/staff-balance.service'
import { StaffBalanceCard } from '../payments/StaffBalanceCard'
import { InviteStaffButton } from './InviteStaffButton'
import { StaffAccountBadge } from './StaffAccountBadge'
import type { StaffBalance } from '../../lib/types/payments.types'

interface StaffListProps {
  onDelete?: () => void
}

export const StaffList: Component<StaffListProps> = (props) => {
  const { state, actions } = staffStore

  const [memberToDelete, setMemberToDelete] = createSignal<StaffMember | null>(null)
  const [isDeleting, setIsDeleting] = createSignal(false)
  const [balances, setBalances] = createSignal<Map<string, StaffBalance>>(new Map())
  const [balancesLoading, setBalancesLoading] = createSignal(false)

  // Fetch on mount if not already initialized
  onMount(() => {
    if (!state.initialized && !state.loading) {
      actions.fetch()
    }
  })

  // Fetch balances when staff members are loaded
  createEffect(() => {
    if (state.initialized && state.members.length > 0 && balances().size === 0 && !balancesLoading()) {
      fetchBalances()
    }
  })

  const fetchBalances = async () => {
    setBalancesLoading(true)
    const result = await getStaffBalances()
    if (!result.error && result.data) {
      const balanceMap = new Map<string, StaffBalance>()
      for (const balance of result.data) {
        balanceMap.set(balance.staff_member_id, balance)
      }
      setBalances(balanceMap)
    }
    setBalancesLoading(false)
  }

  const getBalance = (memberId: string): StaffBalance | undefined => {
    return balances().get(memberId)
  }

  const getPositionLabel = (member: StaffMember): string => {
    if (member.position === 'other' && member.position_custom) {
      return member.position_custom
    }
    return POSITION_LABELS[member.position]
  }

  const handleDeleteClick = (member: StaffMember) => {
    setMemberToDelete(member)
  }

  const handleConfirmDelete = async () => {
    const member = memberToDelete()
    if (!member) return

    setIsDeleting(true)
    const result = await actions.delete(member.id)
    setIsDeleting(false)

    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Membre supprimé avec succès')
      setMemberToDelete(null)
      props.onDelete?.()
    }
  }

  const handleCancelDelete = () => {
    setMemberToDelete(null)
  }

  return (
    <div class="staff-list">
      <Show when={state.loading}>
        <div class="staff-loading">
          <span class="loading-spinner" />
          <span>Chargement...</span>
        </div>
      </Show>

      <Show when={!state.loading && state.error}>
        <div class="staff-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{state.error}</span>
        </div>
      </Show>

      <Show when={!state.loading && !state.error && state.initialized}>
        <Show
          when={state.members.length > 0}
          fallback={
            <div class="staff-empty">
              <div class="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 class="empty-state-title">Aucun membre du personnel</h3>
              <p class="empty-state-text">
                Ajoutez votre premier membre du personnel en utilisant le formulaire ci-dessus.
              </p>
            </div>
          }
        >
          <div class="staff-grid">
            <For each={state.members}>
              {(member) => (
                <div class={`staff-card ${!member.is_active ? 'staff-card-inactive' : ''}`}>
                  <div class="staff-card-header">
                    <div class="staff-avatar">
                      {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                    </div>
                    <div class="staff-info">
                      <h4 class="staff-name">{member.first_name} {member.last_name}</h4>
                      <span class="staff-position">{getPositionLabel(member)}</span>
                    </div>
                    <Show when={!member.is_active}>
                      <span class="staff-badge staff-badge-inactive">Inactif</span>
                    </Show>
                    <button
                      type="button"
                      class="staff-card-delete"
                      onClick={() => handleDeleteClick(member)}
                      aria-label={`Supprimer ${member.first_name} ${member.last_name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>

                  <Show when={member.phone || member.email}>
                    <div class="staff-card-contact">
                      <Show when={member.phone}>
                        <div class="staff-contact-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          <span>{member.phone}</span>
                        </div>
                      </Show>
                      <Show when={member.email}>
                        <div class="staff-contact-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{member.email}</span>
                        </div>
                      </Show>
                    </div>
                  </Show>

                  <Show when={member.start_date}>
                    <div class="staff-card-meta">
                      <span class="staff-meta-label">Depuis</span>
                      <span class="staff-meta-value">
                        {new Date(member.start_date!).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </Show>

                  <Show when={member.notes}>
                    <div class="staff-card-notes">
                      <p>{member.notes}</p>
                    </div>
                  </Show>

                  {/* Balance display */}
                  <div class="staff-card-balance">
                    {(() => {
                      const balance = getBalance(member.id)
                      return (
                        <StaffBalanceCard
                          totalWorkCents={balance?.total_work_cents ?? 0}
                          totalPaidCents={balance?.total_paid_cents ?? 0}
                          balanceCents={balance?.balance_cents ?? 0}
                          loading={balancesLoading()}
                          compact={true}
                        />
                      )
                    })()}
                  </div>

                  {/* Account badge */}
                  <div class="staff-card-account">
                    <StaffAccountBadge staffMemberId={member.id} />
                  </div>

                  {/* Payments link */}
                  <div class="staff-card-actions">
                    <A href={`/staff/${member.id}/payments`} class="btn btn-sm btn-secondary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Prestations & Paiements
                    </A>
                    <InviteStaffButton
                      staffMemberId={member.id}
                      staffEmail={member.email}
                      onInviteSent={() => actions.fetch()}
                    />
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={memberToDelete() !== null}
        title="Supprimer ce membre ?"
        message={
          <span class="confirm-dialog-message">
            Voulez-vous vraiment supprimer <strong>{memberToDelete()?.first_name} {memberToDelete()?.last_name}</strong> ?
            Cette action est irréversible.
          </span>
        }
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={isDeleting()}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

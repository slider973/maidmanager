/**
 * InviteStaffButton Component
 * Feature: 009-staff-portal
 * Button to generate invitation link for staff member
 */

import { createSignal, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { createInvitationLink, isStaffLinked } from '../../services/staff-account.service'
import { showToast } from '../ui/Toast'

interface InviteStaffButtonProps {
  staffMemberId: string
  staffEmail: string | null
  onInviteSent?: () => void
}

export const InviteStaffButton: Component<InviteStaffButtonProps> = (props) => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [showModal, setShowModal] = createSignal(false)
  const [invitationLink, setInvitationLink] = createSignal<string | null>(null)
  const [hasAccount, setHasAccount] = createSignal<boolean | null>(null)
  const [copied, setCopied] = createSignal(false)

  // Check if staff already has account
  const checkAccountStatus = async () => {
    const linked = await isStaffLinked(props.staffMemberId)
    setHasAccount(linked)
  }

  // Open modal and check status
  const handleOpenModal = async () => {
    setShowModal(true)
    setInvitationLink(null)
    setCopied(false)
    await checkAccountStatus()
  }

  // Generate invitation link
  const handleGenerateLink = async () => {
    setIsLoading(true)

    const result = await createInvitationLink(props.staffMemberId)

    setIsLoading(false)

    if (result.success && result.invitationLink) {
      setInvitationLink(result.invitationLink)
      showToast('Lien d\'invitation genere!', 'success')
    } else {
      showToast(result.message, 'error')
    }
  }

  // Copy link to clipboard
  const handleCopyLink = async () => {
    const link = invitationLink()
    if (!link) return

    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      showToast('Lien copie dans le presse-papiers!', 'success')

      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      showToast('Lien copie!', 'success')
    }
  }

  // Share link (mobile)
  const handleShareLink = async () => {
    const link = invitationLink()
    if (!link) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitation MaidManager',
          text: 'Cliquez sur ce lien pour creer votre compte personnel:',
          url: link,
        })
      } catch {
        // User cancelled or error, fall back to copy
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <>
      <button
        type="button"
        class="btn btn-sm btn-secondary"
        onClick={handleOpenModal}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
        Inviter
      </button>

      <Show when={showModal()}>
        <div class="modal-overlay" onClick={() => setShowModal(false)}>
          <div class="modal modal-invitation" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>Inviter a creer un compte</h3>
              <button
                type="button"
                class="modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <Show
              when={hasAccount() !== true}
              fallback={
                <div class="modal-body">
                  <div class="invitation-status invitation-status-linked">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <h4>Compte deja lie</h4>
                    <p>Cet employe a deja un compte personnel.</p>
                  </div>
                </div>
              }
            >
              <div class="modal-body">
                <Show
                  when={invitationLink()}
                  fallback={
                    <div class="invitation-intro">
                      <div class="invitation-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </div>
                      <h4>Generez un lien d'invitation</h4>
                      <p>
                        Creez un lien unique que vous pouvez envoyer a votre employe
                        par SMS, WhatsApp ou email. En cliquant sur ce lien, il pourra
                        creer son compte et acceder a son espace personnel.
                      </p>
                      <p class="invitation-validity">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Le lien sera valide pendant 7 jours
                      </p>
                    </div>
                  }
                >
                  <div class="invitation-success">
                    <div class="invitation-icon invitation-icon-success">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h4>Lien d'invitation pret!</h4>
                    <p>Partagez ce lien avec votre employe:</p>

                    <div class="invitation-link-box">
                      <input
                        type="text"
                        readonly
                        value={invitationLink()!}
                        class="invitation-link-input"
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>

                    <div class="invitation-actions">
                      <button
                        type="button"
                        class="btn btn-primary"
                        onClick={handleCopyLink}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                          <Show when={copied()} fallback={
                            <>
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </>
                          }>
                            <polyline points="20 6 9 17 4 12" />
                          </Show>
                        </svg>
                        {copied() ? 'Copie!' : 'Copier le lien'}
                      </button>

                      <Show when={'share' in navigator}>
                        <button
                          type="button"
                          class="btn btn-secondary"
                          onClick={handleShareLink}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                          </svg>
                          Partager
                        </button>
                      </Show>
                    </div>
                  </div>
                </Show>
              </div>

              <Show when={!invitationLink()}>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-ghost"
                    onClick={() => setShowModal(false)}
                    disabled={isLoading()}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    onClick={handleGenerateLink}
                    disabled={isLoading()}
                  >
                    <Show when={isLoading()} fallback={
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Generer le lien
                      </>
                    }>
                      <span class="loading-spinner loading-spinner-sm" />
                      Generation...
                    </Show>
                  </button>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </Show>
    </>
  )
}

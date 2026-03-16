/**
 * ShareInviteLink Component
 * Simple button to share manager's invite link
 */

import { createSignal, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { useAuth } from '../../lib/auth'
import { showToast } from '../ui/Toast'

export const ShareInviteLink: Component = () => {
  const { user } = useAuth()
  const [showModal, setShowModal] = createSignal(false)
  const [copied, setCopied] = createSignal(false)

  const getInviteLink = () => {
    const userId = user()?.id
    if (!userId) return null
    return `${window.location.origin}/join/${userId}`
  }

  const handleCopyLink = async () => {
    const link = getInviteLink()
    if (!link) return

    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      showToast('Lien copie dans le presse-papiers!', 'success')
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

  const handleShareLink = async () => {
    const link = getInviteLink()
    if (!link) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez MaidManager',
          text: 'Cliquez sur ce lien pour creer votre compte employe:',
          url: link,
        })
      } catch {
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
        class="btn btn-secondary"
        onClick={() => setShowModal(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        Lien d'invitation
      </button>

      <Show when={showModal()}>
        <div class="modal-overlay" onClick={() => setShowModal(false)}>
          <div class="modal modal-invitation" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>Inviter du personnel</h3>
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

            <div class="modal-body">
              <div class="invitation-intro">
                <div class="invitation-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <h4>Partagez ce lien</h4>
                <p>
                  Envoyez ce lien a votre employe par SMS, WhatsApp ou email.
                  En cliquant dessus, il pourra creer son compte et vous pourrez
                  ensuite lui assigner des taches.
                </p>
              </div>

              <div class="invitation-link-box">
                <input
                  type="text"
                  readonly
                  value={getInviteLink() || ''}
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
          </div>
        </div>
      </Show>
    </>
  )
}

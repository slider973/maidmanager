/**
 * ClockOutButton Component
 * Feature: 009-staff-portal (US2)
 * Button to clock out with confirmation
 */

import { createSignal, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import { showSuccess, showError } from '../ui/Toast'
import { timeEntryStore } from '../../stores/timeEntryStore'

interface ClockOutButtonProps {
  disabled?: boolean
}

export const ClockOutButton: Component<ClockOutButtonProps> = (props) => {
  const [showConfirm, setShowConfirm] = createSignal(false)
  const [notes, setNotes] = createSignal('')

  const handleClockOut = async () => {
    const result = await timeEntryStore.actions.clockOut({
      notes: notes() || undefined,
    })

    if (result.success) {
      const duration = result.data?.duration_minutes || 0
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      showSuccess(`Sortie pointee - ${hours}h${minutes.toString().padStart(2, '0')} travaillees`)
      closeConfirm()
    } else {
      showError(result.error || 'Erreur lors du pointage de sortie')
    }
  }

  const openConfirm = () => {
    setNotes('')
    setShowConfirm(true)
  }

  const closeConfirm = () => {
    setShowConfirm(false)
    setNotes('')
  }

  // Calculate elapsed time
  const getElapsedTime = () => {
    const entry = timeEntryStore.state.currentEntry
    if (!entry?.clock_in_at) return null

    const clockIn = new Date(entry.clock_in_at)
    const now = new Date()
    const diffMs = now.getTime() - clockIn.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return { hours, minutes }
  }

  return (
    <>
      <LoadingButton
        type="button"
        class="btn btn-danger btn-lg"
        onClick={openConfirm}
        disabled={props.disabled || timeEntryStore.state.clockingOut}
        loading={timeEntryStore.state.clockingOut}
        loadingText="Pointage..."
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Pointer ma sortie
      </LoadingButton>

      {/* Confirmation Modal */}
      <Show when={showConfirm()}>
        <div class="modal-overlay" onClick={closeConfirm}>
          <div class="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2 class="modal-title">Confirmer la sortie</h2>
              <button
                type="button"
                class="btn btn-ghost btn-icon"
                onClick={closeConfirm}
                aria-label="Fermer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <Show when={getElapsedTime()}>
                {(elapsed) => (
                  <div class="clock-out-summary">
                    <div class="clock-out-duration">
                      <span class="clock-out-duration-value">
                        {elapsed().hours}h{elapsed().minutes.toString().padStart(2, '0')}
                      </span>
                      <span class="clock-out-duration-label">Temps travaille</span>
                    </div>
                    <div class="clock-out-client">
                      <span class="clock-out-client-label">Chez</span>
                      <span class="clock-out-client-name">
                        {timeEntryStore.state.currentEntry?.client?.name || 'Client'}
                      </span>
                    </div>
                  </div>
                )}
              </Show>

              {/* Notes (Optional) */}
              <div class="form-group">
                <label class="form-label" for="clock-out-notes">
                  Notes de fin de service (optionnel)
                </label>
                <textarea
                  id="clock-out-notes"
                  class="form-input"
                  rows="2"
                  placeholder="Ajouter une note..."
                  value={notes()}
                  onInput={(e) => setNotes(e.currentTarget.value)}
                />
              </div>

              <p class="text-muted text-sm">
                Etes-vous sur de vouloir pointer votre sortie?
              </p>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" onClick={closeConfirm}>
                Annuler
              </button>
              <LoadingButton
                type="button"
                class="btn btn-danger"
                onClick={handleClockOut}
                disabled={timeEntryStore.state.clockingOut}
                loading={timeEntryStore.state.clockingOut}
                loadingText="Pointage..."
              >
                Confirmer la sortie
              </LoadingButton>
            </div>
          </div>
        </div>
      </Show>
    </>
  )
}

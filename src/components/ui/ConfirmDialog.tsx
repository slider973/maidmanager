/**
 * ConfirmDialog Component
 * Reusable confirmation dialog for destructive actions
 */

import { Show, createEffect, onCleanup } from 'solid-js'
import type { Component, JSX } from 'solid-js'

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Dialog title */
  title: string
  /** Dialog message/description */
  message: string | JSX.Element
  /** Text for the confirm button */
  confirmText?: string
  /** Text for the cancel button */
  cancelText?: string
  /** Visual style for confirm button */
  confirmVariant?: 'danger' | 'primary'
  /** Whether the confirm action is in progress */
  isLoading?: boolean
  /** Called when user confirms the action */
  onConfirm: () => void
  /** Called when user cancels or closes the dialog */
  onCancel: () => void
}

export const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
  const titleId = 'confirm-dialog-title'
  const descId = 'confirm-dialog-desc'

  // Handle Escape key
  createEffect(() => {
    if (!props.isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !props.isLoading) {
        props.onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
  })

  // Handle overlay click
  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && !props.isLoading) {
      props.onCancel()
    }
  }

  // Prevent dialog content clicks from bubbling
  const handleDialogClick = (e: MouseEvent) => {
    e.stopPropagation()
  }

  const confirmButtonClass = () => {
    const variant = props.confirmVariant ?? 'danger'
    return `btn btn-${variant}`
  }

  return (
    <Show when={props.isOpen}>
      <div
        class="confirm-dialog-overlay"
        data-testid="confirm-dialog-overlay"
        onClick={handleOverlayClick}
      >
        <div
          class="confirm-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          onClick={handleDialogClick}
        >
          {/* Icon */}
          <div class="confirm-dialog-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>

          <h2 id={titleId} class="confirm-dialog-title">
            {props.title}
          </h2>

          <p id={descId} class="confirm-dialog-message">
            {props.message}
          </p>

          <Show when={props.isLoading}>
            <div class="confirm-dialog-loading" data-testid="confirm-dialog-loading">
              <span class="loading-spinner" />
            </div>
          </Show>

          <div class="confirm-dialog-actions">
            <button
              type="button"
              class="btn btn-ghost"
              onClick={props.onCancel}
              disabled={props.isLoading}
            >
              {props.cancelText ?? 'Annuler'}
            </button>
            <button
              type="button"
              class={confirmButtonClass()}
              onClick={props.onConfirm}
              disabled={props.isLoading}
            >
              {props.confirmText ?? 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    </Show>
  )
}

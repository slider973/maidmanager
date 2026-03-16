/**
 * ConfirmDialog Component Contract
 * Feature: 003-delete-staff
 *
 * Reusable confirmation dialog component for destructive actions.
 */

import type { Component, JSX } from 'solid-js'

/**
 * Props for the ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean

  /**
   * Dialog title (e.g., "Confirmer la suppression")
   */
  title: string

  /**
   * Dialog message/description
   * Can include the name of the item being deleted
   */
  message: string | JSX.Element

  /**
   * Text for the confirm button
   * @default "Confirmer"
   */
  confirmText?: string

  /**
   * Text for the cancel button
   * @default "Annuler"
   */
  cancelText?: string

  /**
   * Visual style for confirm button
   * @default "danger"
   */
  confirmVariant?: 'danger' | 'primary'

  /**
   * Whether the confirm action is in progress
   * Disables buttons and shows loading state
   */
  isLoading?: boolean

  /**
   * Called when user confirms the action
   */
  onConfirm: () => void

  /**
   * Called when user cancels or closes the dialog
   */
  onCancel: () => void
}

/**
 * ConfirmDialog Component
 *
 * @accessibility
 * - Focus trapped within dialog when open
 * - First focusable element receives focus on open
 * - Escape key closes dialog
 * - Click outside closes dialog
 * - aria-modal="true" and role="dialog"
 * - aria-labelledby for title
 * - aria-describedby for message
 *
 * @example
 * <ConfirmDialog
 *   isOpen={showConfirm()}
 *   title="Supprimer ce membre ?"
 *   message={`Voulez-vous vraiment supprimer ${member.first_name} ${member.last_name} ?`}
 *   confirmText="Supprimer"
 *   confirmVariant="danger"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
export const ConfirmDialog: Component<ConfirmDialogProps>

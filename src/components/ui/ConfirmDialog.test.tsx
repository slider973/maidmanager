/**
 * ConfirmDialog Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirmer la suppression',
    message: 'Voulez-vous vraiment supprimer ce membre ?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(() => <ConfirmDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument()
      expect(screen.getByText('Voulez-vous vraiment supprimer ce membre ?')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(() => <ConfirmDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders confirm and cancel buttons', () => {
      render(() => <ConfirmDialog {...defaultProps} />)

      expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    })

    it('uses custom button text when provided', () => {
      render(() => (
        <ConfirmDialog
          {...defaultProps}
          confirmText="Supprimer"
          cancelText="Non merci"
        />
      ))

      expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Non merci' })).toBeInTheDocument()
    })
  })

  describe('Callbacks', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const onConfirm = vi.fn()
      render(() => <ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

      const confirmButton = screen.getByRole('button', { name: /confirmer/i })
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const onCancel = vi.fn()
      render(() => <ConfirmDialog {...defaultProps} onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /annuler/i })
      fireEvent.click(cancelButton)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when Escape key is pressed', async () => {
      const onCancel = vi.fn()
      render(() => <ConfirmDialog {...defaultProps} onCancel={onCancel} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when clicking outside dialog (on overlay)', async () => {
      const onCancel = vi.fn()
      render(() => <ConfirmDialog {...defaultProps} onCancel={onCancel} />)

      const overlay = screen.getByTestId('confirm-dialog-overlay')
      fireEvent.click(overlay)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('does not call onCancel when clicking inside dialog', async () => {
      const onCancel = vi.fn()
      render(() => <ConfirmDialog {...defaultProps} onCancel={onCancel} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog)

      expect(onCancel).not.toHaveBeenCalled()
    })
  })

  describe('Loading state', () => {
    it('disables buttons when isLoading is true', () => {
      render(() => <ConfirmDialog {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('button', { name: /confirmer/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /annuler/i })).toBeDisabled()
    })

    it('shows loading indicator when isLoading is true', () => {
      render(() => <ConfirmDialog {...defaultProps} isLoading={true} />)

      expect(screen.getByTestId('confirm-dialog-loading')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(() => <ConfirmDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')
    })
  })

  describe('Variants', () => {
    it('applies danger variant to confirm button by default', () => {
      render(() => <ConfirmDialog {...defaultProps} />)

      const confirmButton = screen.getByRole('button', { name: /confirmer/i })
      expect(confirmButton).toHaveClass('btn-danger')
    })

    it('applies primary variant when specified', () => {
      render(() => <ConfirmDialog {...defaultProps} confirmVariant="primary" />)

      const confirmButton = screen.getByRole('button', { name: /confirmer/i })
      expect(confirmButton).toHaveClass('btn-primary')
    })
  })
})

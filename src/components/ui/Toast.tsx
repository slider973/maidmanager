import { createSignal, createEffect, Show, onCleanup } from 'solid-js'
import type { Component } from 'solid-js'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose: () => void
}

export const Toast: Component<ToastProps> = (props) => {
  const [visible, setVisible] = createSignal(true)

  createEffect(() => {
    const duration = props.duration ?? 5000
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => props.onClose(), 300) // Allow fade out animation
    }, duration)

    onCleanup(() => clearTimeout(timer))
  })

  const iconMap = {
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  }

  return (
    <Show when={visible()}>
      <div
        class={`toast toast-${props.type}`}
        role="alert"
        aria-live="polite"
      >
        {iconMap[props.type]}
        <span class="toast-message">{props.message}</span>
        <button
          type="button"
          class="toast-close"
          onClick={() => {
            setVisible(false)
            props.onClose()
          }}
          aria-label="Fermer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </Show>
  )
}

// Toast container for managing multiple toasts
interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration?: number
}

const [toasts, setToasts] = createSignal<ToastItem[]>([])
let toastId = 0

export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  const id = ++toastId
  setToasts((prev) => [...prev, { id, message, type, duration }])
}

export function showSuccess(message: string, duration?: number) {
  showToast(message, 'success', duration)
}

export function showError(message: string, duration?: number) {
  showToast(message, 'error', duration)
}

export const ToastContainer: Component = () => {
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div class="toast-container" aria-live="polite">
      {toasts().map((toast) => (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

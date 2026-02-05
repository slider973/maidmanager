import type { Component, JSX } from 'solid-js'
import { Show, splitProps } from 'solid-js'

interface LoadingButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: JSX.Element
}

export const LoadingButton: Component<LoadingButtonProps> = (props) => {
  const [local, buttonProps] = splitProps(props, ['loading', 'loadingText', 'children', 'class', 'disabled'])

  return (
    <button
      {...buttonProps}
      class={`btn ${local.class ?? ''} ${local.loading ? 'btn-loading' : ''}`}
      disabled={local.disabled || local.loading}
      aria-busy={local.loading}
    >
      <Show when={local.loading}>
        <span class="loading-spinner" aria-hidden="true" />
      </Show>
      <span class={local.loading ? 'btn-text-hidden' : ''}>
        {local.loading && local.loadingText ? local.loadingText : local.children}
      </span>
    </button>
  )
}

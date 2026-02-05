import { Show } from 'solid-js'
import type { ParentComponent } from 'solid-js'
import { Navigate } from '@solidjs/router'
import { useAuth } from '../lib/auth'

export const ProtectedRoute: ParentComponent = (props) => {
  const { user, loading } = useAuth()

  return (
    <Show
      when={!loading()}
      fallback={
        <div class="loading">
          <div class="loading-spinner" />
          <span class="loading-text">Chargement</span>
        </div>
      }
    >
      <Show when={user()} fallback={<Navigate href="/login" />}>
        {props.children}
      </Show>
    </Show>
  )
}

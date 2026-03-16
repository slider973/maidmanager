import { Show } from 'solid-js'
import type { ParentComponent } from 'solid-js'
import { Navigate } from '@solidjs/router'
import { useAuth } from '../lib/auth'

/**
 * Protected route for manager/admin pages.
 * - Unauthenticated users → /login
 * - Staff members → /portal (they can't access manager dashboard)
 * - Managers → allowed
 */
export const ProtectedRoute: ParentComponent = (props) => {
  const { user, loading, isStaff } = useAuth()

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
        <Show
          when={!isStaff()}
          fallback={<Navigate href="/portal" />}
        >
          {props.children}
        </Show>
      </Show>
    </Show>
  )
}

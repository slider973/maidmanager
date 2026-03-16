import { Show } from 'solid-js'
import type { ParentComponent } from 'solid-js'
import { Navigate } from '@solidjs/router'
import { useAuth } from '../../lib/auth'

/**
 * Protected route component for staff portal pages.
 * Only allows access to authenticated users with a linked staff account.
 * Redirects managers to / and unauthenticated users to /login.
 */
export const ProtectedStaffRoute: ParentComponent = (props) => {
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
          when={isStaff()}
          fallback={
            // User is logged in but not a staff member - redirect to manager dashboard
            <Navigate href="/" />
          }
        >
          {props.children}
        </Show>
      </Show>
    </Show>
  )
}

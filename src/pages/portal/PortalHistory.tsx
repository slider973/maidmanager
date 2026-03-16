/**
 * PortalHistory Page
 * Feature: 009-staff-portal (US4)
 * Staff history view with weekly breakdown
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../../lib/auth'
import { StaffHistoryView } from '../../components/portal/StaffHistoryView'

const PortalHistory: Component = () => {
  const { staffMemberId, signOut } = useAuth()

  return (
    <div class="portal-layout">
      {/* Header */}
      <header class="portal-header">
        <div class="header-brand">
          <A href="/portal" class="header-back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </A>
          <span class="header-title">Mon Historique</span>
        </div>

        <div class="header-actions">
          <button class="btn btn-ghost" onClick={() => signOut()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Deconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main class="portal-main">
        <Show
          when={staffMemberId()}
          fallback={
            <div class="loading-state">
              <span class="loading-spinner" />
              <span>Chargement...</span>
            </div>
          }
        >
          <StaffHistoryView staffMemberId={staffMemberId()!} />
        </Show>
      </main>
    </div>
  )
}

export default PortalHistory

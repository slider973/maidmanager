/**
 * PortalCalendar Page
 * Feature: 010-client-schedule-calendar
 *
 * Staff can view their scheduled interventions at each client
 */

import { createEffect, createSignal, For, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../../lib/auth'
import { getStaffClients } from '../../services/schedule-calendar.service'
import { ClientCalendar } from '../../components/portal/ClientCalendar'

interface ClientItem {
  id: string
  name: string
}

const PortalCalendar: Component = () => {
  const { user, staffMemberId, signOut } = useAuth()

  const [clients, setClients] = createSignal<ClientItem[]>([])
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)
  const [selectedClient, setSelectedClient] = createSignal<ClientItem | null>(null)

  const loadClients = async (staffId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getStaffClients(staffId)
      if (result.error) {
        setError(result.error)
      } else {
        setClients(result.data)
      }
    } catch (err) {
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  createEffect(() => {
    const staffId = staffMemberId()
    if (staffId) {
      loadClients(staffId)
    }
  })

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  return (
    <div class="portal-layout">
      {/* Header */}
      <header class="portal-header">
        <div class="header-brand">
          <A href="/portal" class="header-brand-link">
            <div class="header-logo">M</div>
            <span class="header-title">Mon Espace</span>
          </A>
        </div>

        <div class="header-actions">
          <div class="user-menu">
            <div class="user-avatar">{getInitials()}</div>
            <div class="user-info">
              <span class="user-name">Mon compte</span>
              <span class="user-email">{user()?.email}</span>
            </div>
          </div>
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
        {/* Page Header */}
        <div class="page-header">
          <A href="/portal" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Retour
          </A>
          <h1 class="page-title">Mes Calendriers</h1>
          <p class="page-subtitle">Consultez vos interventions planifiees</p>
        </div>

        <Show when={loading()}>
          <div class="loading-state">Chargement...</div>
        </Show>

        <Show when={error()}>
          <div class="error-state">{error()}</div>
        </Show>

        <Show when={!loading() && !error()}>
          <Show
            when={selectedClient()}
            fallback={
              <div class="portal-clients-list">
                <Show
                  when={clients().length > 0}
                  fallback={
                    <div class="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon" width="48" height="48">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <h3 class="empty-state-title">Aucune intervention planifiee</h3>
                      <p class="empty-state-text">
                        Vous n'avez pas encore d'interventions planifiees.
                      </p>
                    </div>
                  }
                >
                  <For each={clients()}>
                    {(client) => (
                      <button
                        type="button"
                        class="portal-client-card"
                        onClick={() => setSelectedClient(client)}
                      >
                        <div class="portal-client-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div class="portal-client-info">
                          <span class="portal-client-name">{client.name}</span>
                          <span class="portal-client-action">Voir le calendrier</span>
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="portal-client-arrow">
                          <polyline points="9,18 15,12 9,6" />
                        </svg>
                      </button>
                    )}
                  </For>
                </Show>
              </div>
            }
          >
            <ClientCalendar
              clientId={selectedClient()!.id}
              clientName={selectedClient()!.name}
              onClose={() => setSelectedClient(null)}
            />
          </Show>
        </Show>
      </main>

      <style>{`
        .portal-clients-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          max-width: 600px;
          margin: 0 auto;
          padding: var(--space-lg);
        }

        .portal-client-card {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: white;
          border: 1px solid var(--color-cream-dark);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .portal-client-card:hover {
          border-color: var(--color-gold);
          box-shadow: var(--shadow-sm);
        }

        .portal-client-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-cream);
          border-radius: var(--radius-sm);
          color: var(--color-navy-muted);
        }

        .portal-client-icon svg {
          width: 24px;
          height: 24px;
        }

        .portal-client-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .portal-client-name {
          font-weight: 500;
          color: var(--color-navy);
        }

        .portal-client-action {
          font-size: 0.85rem;
          color: var(--color-navy-muted);
        }

        .portal-client-arrow {
          width: 20px;
          height: 20px;
          color: var(--color-gray-medium);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-3xl);
        }

        .empty-state-icon {
          color: var(--color-gray-medium);
          margin-bottom: var(--space-md);
        }

        .empty-state-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--color-navy);
          margin: 0 0 var(--space-sm);
        }

        .empty-state-text {
          color: var(--color-navy-muted);
          margin: 0;
        }
      `}</style>
    </div>
  )
}

export default PortalCalendar

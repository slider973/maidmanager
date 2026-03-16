/**
 * Client Schedule Page
 * Feature: 010-client-schedule-calendar
 *
 * Displays a monthly calendar view of scheduled interventions for a specific client
 */

import { createEffect, createSignal, on, Show } from 'solid-js'
import { A, useParams } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { showError } from '../components/ui/Toast'
import * as clientService from '../services/client.service'
import type { Client } from '../lib/types/billing.types'
import type { CalendarEvent } from '../lib/types/calendar.types'
import { CalendarView, EventDetailModal } from '../components/calendar'

import '../App.css'

export default function ClientSchedule() {
  const params = useParams()
  const { user, session, loading: authLoading, signOut } = useAuth()

  const [client, setClient] = createSignal<Client | null>(null)
  const [loading, setLoading] = createSignal(true)
  const [selectedEvent, setSelectedEvent] = createSignal<CalendarEvent | null>(null)

  createEffect(
    on(
      () => ({ loading: authLoading(), session: session() }),
      async ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess && params.clientId) {
          await loadClient()
        }
      }
    )
  )

  const loadClient = async () => {
    const clientId = params.clientId
    if (!clientId) return

    setLoading(true)
    try {
      const result = await clientService.getClient(clientId)
      if (result.error || !result.data) {
        showError('Client non trouve')
        return
      }
      setClient(result.data)
    } catch (err) {
      console.error('Failed to load client:', err)
      showError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const closeModal = () => {
    setSelectedEvent(null)
  }

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  return (
    <div class="dashboard">
      {/* Header */}
      <header class="dashboard-header">
        <div class="header-brand">
          <A href="/" class="header-brand-link">
            <div class="header-logo">M</div>
            <span class="header-title">MaidManager</span>
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
      <main class="dashboard-main">
        {/* Page Header */}
        <div class="page-header">
          <A href="/clients" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Retour aux clients
          </A>
          <Show when={client()}>
            <h1 class="page-title">Calendrier - {client()!.name}</h1>
            <p class="page-subtitle">Interventions planifiees pour ce client</p>
          </Show>
        </div>

        <Show when={!loading()} fallback={<div class="loading-state">Chargement...</div>}>
          <Show when={client() && params.clientId}>
            <div class="client-schedule-container">
              <CalendarView
                clientId={params.clientId!}
                clientName={client()!.name}
                showStaffName={true}
                onEventClick={handleEventClick}
              />
            </div>
          </Show>
        </Show>

        {/* Event Detail Modal */}
        <EventDetailModal
          event={selectedEvent()}
          canEdit={true}
          onClose={closeModal}
        />
      </main>

      <style>{`
        .client-schedule-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 1.5rem;
        }
      `}</style>
    </div>
  )
}

/**
 * PortalHome Page
 * Feature: 009-staff-portal
 * Staff personal portal dashboard
 */

import { createResource, createEffect, onCleanup, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import { timeEntryStore } from '../../stores/timeEntryStore'
import { roomActionStore } from '../../stores/roomActionStore'
import { TimeEntryCard } from '../../components/portal/TimeEntryCard'
import { MissingEntryAlert } from '../../components/portal/MissingEntryAlert'
import { RoomActionForm } from '../../components/portal/RoomActionForm'
import { RoomActionList } from '../../components/portal/RoomActionList'

interface StaffMemberInfo {
  id: string
  first_name: string
  last_name: string
  position: string
}

const fetchStaffMember = async (staffMemberId: string | null): Promise<StaffMemberInfo | null> => {
  if (!staffMemberId) return null

  try {
    const data = await api.get<StaffMemberInfo>(`/staff-members/${staffMemberId}`)
    return data
  } catch (error) {
    console.error('Failed to fetch staff member:', error)
    return null
  }
}

const PortalHome: Component = () => {
  const { user, staffMemberId, signOut } = useAuth()

  // Fetch staff member info
  const [staffMember] = createResource(() => staffMemberId(), fetchStaffMember)

  // Initialize time entry store when staff member ID is available
  createEffect(() => {
    const staffId = staffMemberId()
    if (staffId) {
      timeEntryStore.actions.init(staffId)
    }
  })

  // Initialize room action store when staff member info is available
  createEffect(() => {
    const staffId = staffMemberId()
    const member = staffMember()
    if (staffId && member?.position) {
      roomActionStore.actions.init(staffId, member.position)
    }
  })

  // Update room action store when time entry changes
  createEffect(() => {
    const currentEntry = timeEntryStore.state.currentEntry
    roomActionStore.actions.setCurrentEntry(currentEntry?.id || null)
  })

  // Clean up stores on unmount
  onCleanup(() => {
    timeEntryStore.actions.reset()
    roomActionStore.actions.reset()
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon apres-midi'
    return 'Bonsoir'
  }

  const getDisplayName = () => {
    const member = staffMember()
    if (member) {
      return `${member.first_name} ${member.last_name}`
    }
    return user()?.email?.split('@')[0] || 'Personnel'
  }

  return (
    <div class="portal-layout">
      {/* Header */}
      <header class="portal-header">
        <div class="header-brand">
          <div class="header-logo">M</div>
          <span class="header-title">Mon Espace</span>
        </div>

        <div class="header-actions">
          <div class="user-menu">
            <div class="user-avatar">
              {staffMember()?.first_name?.charAt(0) || '?'}
            </div>
            <div class="user-info">
              <span class="user-name">{getDisplayName()}</span>
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
        {/* Welcome Section */}
        <section class="portal-welcome">
          <h1 class="portal-greeting">
            {getGreeting()}, {staffMember()?.first_name || 'Personnel'}
          </h1>
          <p class="portal-date">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </section>

        {/* Missing Entries Alert */}
        <MissingEntryAlert />

        {/* Quick Actions */}
        <section class="portal-actions-grid">
          {/* Clock In/Out Card */}
          <TimeEntryCard />

          {/* History Card */}
          <div class="portal-card">
            <div class="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <h2 class="portal-card-title">Mon Historique</h2>
            <p class="portal-card-description">
              Consultez vos heures et prestations
            </p>
            <A href="/portal/history" class="btn btn-secondary">
              Voir l'historique
            </A>
          </div>

          {/* Calendar Card */}
          <div class="portal-card">
            <div class="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h2 class="portal-card-title">Mes Calendriers</h2>
            <p class="portal-card-description">
              Consultez vos interventions planifiees
            </p>
            <A href="/portal/calendar" class="btn btn-secondary">
              Voir les calendriers
            </A>
          </div>

          {/* Room Actions Card */}
          <div class="portal-card">
            <div class="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <h2 class="portal-card-title">Actions du jour</h2>
            <p class="portal-card-description">
              Enregistrez vos actions par piece
            </p>
            <Show
              when={timeEntryStore.state.currentEntry}
              fallback={
                <p class="text-muted text-sm">
                  Pointez votre arrivee pour enregistrer des actions
                </p>
              }
            >
              <RoomActionForm />
            </Show>
          </div>
        </section>

        {/* Today Summary */}
        <section class="portal-section">
          <h2 class="section-title">Aujourd'hui</h2>
          <Show
            when={timeEntryStore.state.currentEntry}
            fallback={
              <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h3 class="empty-state-title">Pas de pointage aujourd'hui</h3>
                <p class="empty-state-text">
                  Vous n'avez pas encore pointe aujourd'hui.
                </p>
              </div>
            }
          >
            <div class="today-summary">
              <div class="today-summary-item">
                <span class="today-summary-label">Client</span>
                <span class="today-summary-value">
                  {timeEntryStore.state.currentEntry?.client?.name || 'Client'}
                </span>
              </div>
              <div class="today-summary-item">
                <span class="today-summary-label">Arrive a</span>
                <span class="today-summary-value">
                  {timeEntryStore.state.currentEntry?.clock_in_at
                    ? new Date(timeEntryStore.state.currentEntry.clock_in_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </span>
              </div>
            </div>
          </Show>
        </section>

        {/* Room Actions Section - Only visible when clocked in */}
        <Show when={timeEntryStore.state.currentEntry}>
          <section class="portal-section">
            <h2 class="section-title">Actions enregistrees</h2>
            <RoomActionList showCurrentEntryOnly={true} showDeleteButtons={true} />
          </section>
        </Show>
      </main>
    </div>
  )
}

export default PortalHome

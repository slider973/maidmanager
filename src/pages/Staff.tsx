/**
 * Staff Page
 * Main page for staff management
 */

import { createEffect, on } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { StaffForm } from '../components/staff/StaffForm'
import { StaffList } from '../components/staff/StaffList'
import { ShareInviteLink } from '../components/staff/ShareInviteLink'
import { staffStore } from '../stores/staff.store'
import { showSuccess } from '../components/ui/Toast'

export default function Staff() {
  const { user, session, loading, signOut } = useAuth()
  const { actions } = staffStore

  // Fetch staff when auth is ready (session exists and not loading)
  createEffect(
    on(
      () => ({ loading: loading(), session: session() }),
      ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess) {
          actions.fetch()
        }
      }
    )
  )

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  const handleSuccess = () => {
    showSuccess('Membre ajouté avec succès')
    // Refetch to get updated list
    actions.fetch()
  }

  const handleDelete = () => {
    // Data already updated optimistically in store
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
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main class="dashboard-main">
        {/* Page Header */}
        <div class="page-header">
          <div class="page-header-content">
            <A href="/" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Retour
            </A>
            <div class="page-header-text">
              <h1 class="page-title">Personnel</h1>
              <p class="page-subtitle">Gérez les membres de votre personnel de maison</p>
            </div>
            <div class="page-header-actions">
              <ShareInviteLink />
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div class="staff-layout">
          {/* Add Staff Form */}
          <section class="staff-form-section">
            <div class="section-card">
              <div class="section-card-header">
                <h2 class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Ajouter un membre
                </h2>
              </div>
              <div class="section-card-body">
                <StaffForm onSuccess={handleSuccess} />
              </div>
            </div>
          </section>

          {/* Staff List */}
          <section class="staff-list-section">
            <div class="section-card">
              <div class="section-card-header">
                <h2 class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  Membres du personnel
                </h2>
              </div>
              <div class="section-card-body">
                <StaffList onDelete={handleDelete} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

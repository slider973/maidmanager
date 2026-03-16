import { createEffect, on } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { staffStore } from '../stores/staff.store'
import { scheduleStore } from '../stores/schedule.store'
import { GlobalBalanceWidget } from '../components/payments/GlobalBalanceWidget'

export default function Home() {
  const { user, session, loading, signOut } = useAuth()

  // Fetch data when auth is ready
  createEffect(
    on(
      () => ({ loading: loading(), session: session() }),
      ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess) {
          staffStore.actions.fetch()
          scheduleStore.actions.fetch()
        }
      }
    )
  )

  // Stats calculations
  const activeStaffCount = () => {
    return staffStore.state.members.filter((m) => m.is_active).length
  }

  const scheduledCount = () => {
    return scheduleStore.state.entries.filter((e) => e.status === 'scheduled').length
  }

  const inProgressCount = () => {
    // For now, this is the same as scheduled since we don't have an "in_progress" status
    return scheduledCount()
  }

  const completedThisMonthCount = () => {
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return scheduleStore.state.entries.filter((e) => {
      if (e.status !== 'completed') return false
      const entryDate = new Date(e.scheduled_date)
      return entryDate >= firstOfMonth
    }).length
  }

  // Get user initials for avatar
  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  // Format current date in French
  const formatDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div class="dashboard">
      {/* Header */}
      <header class="dashboard-header">
        <div class="header-brand">
          <div class="header-logo">M</div>
          <span class="header-title">MaidManager</span>
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
        {/* Welcome Section */}
        <section class="welcome-section">
          <h1 class="welcome-greeting">{getGreeting()}</h1>
          <p class="welcome-date">{formatDate()}</p>
        </section>

        {/* Global Balance Widget */}
        <section class="dashboard-balance-section">
          <GlobalBalanceWidget />
        </section>

        {/* Stats Overview */}
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon stat-icon-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div class="stat-value">{activeStaffCount()}</div>
            <div class="stat-label">Personnel actif</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div class="stat-value">{scheduledCount()}</div>
            <div class="stat-label">Interventions planifiées</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-rose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="15" y2="16" />
              </svg>
            </div>
            <div class="stat-value">{inProgressCount()}</div>
            <div class="stat-label">En cours</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon-sage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
            </div>
            <div class="stat-value">{completedThisMonthCount()}</div>
            <div class="stat-label">Terminées ce mois</div>
          </div>
        </div>

        {/* Quick Actions */}
        <section class="quick-actions">
          <div class="section-header">
            <h2 class="section-title">Actions rapides</h2>
          </div>

          <div class="action-grid">
            <A href="/staff" class="action-card">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <span class="action-title">Ajouter du personnel</span>
              <span class="action-desc">Enregistrez un nouveau membre</span>
            </A>

            <A href="/schedule" class="action-card">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                </svg>
              </div>
              <span class="action-title">Créer un planning</span>
              <span class="action-desc">Planifiez les interventions</span>
            </A>

            <A href="/tasks" class="action-card">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <span class="action-title">Nouvelle tâche</span>
              <span class="action-desc">Assignez une mission</span>
            </A>

            <A href="/statistics" class="action-card">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <span class="action-title">Voir les rapports</span>
              <span class="action-desc">Consultez les statistiques</span>
            </A>

            <A href="/clients" class="action-card">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <span class="action-title">Gérer les clients</span>
              <span class="action-desc">Clients pour la facturation</span>
            </A>

            <A href="/invoices" class="action-card">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <span class="action-title">Factures</span>
              <span class="action-desc">Créer et gérer les factures</span>
            </A>

            <A href="/staff-work" class="action-card">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
              <span class="action-title">Travail effectué</span>
              <span class="action-desc">Pointages et actions du personnel</span>
            </A>

            <A href="/settings/room-types" class="action-card">
              <div class="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <span class="action-title">Types de pieces</span>
              <span class="action-desc">Gerer les pieces disponibles</span>
            </A>
          </div>
        </section>

        {/* Empty State for Activity */}
        <section class="quick-actions" style={{ "margin-top": "var(--space-2xl)" }}>
          <div class="section-header">
            <h2 class="section-title">Activité récente</h2>
          </div>

          <div class="empty-state">
            <div class="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <h3 class="empty-state-title">Aucune activité récente</h3>
            <p class="empty-state-text">
              Commencez par ajouter du personnel ou créer votre premier planning pour voir l'activité ici.
            </p>
            <button class="btn btn-primary">
              <span>Commencer</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

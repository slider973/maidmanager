import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { SessionList } from '../components/auth/SessionList'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div class="dashboard">
      {/* Header */}
      <header class="dashboard-header">
        <div class="header-brand">
          <A href="/" class="header-logo">M</A>
          <span class="header-title">MaidManager</span>
        </div>

        <div class="header-actions">
          <A href="/" class="btn btn-ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour
          </A>
        </div>
      </header>

      {/* Main Content */}
      <main class="dashboard-main">
        <section class="welcome-section">
          <h1 class="welcome-greeting">Paramètres</h1>
          <p class="welcome-date">Gérez votre compte et vos préférences</p>
        </section>

        {/* Account Info */}
        <section class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Informations du compte</h2>
          </div>

          <div class="settings-card">
            <div class="settings-item">
              <span class="settings-label">Email</span>
              <span class="settings-value">{user()?.email}</span>
            </div>
            <div class="settings-item">
              <span class="settings-label">Compte créé le</span>
              <span class="settings-value">
                {user()?.created_at
                  ? new Date(user()!.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
            <div class="settings-item">
              <span class="settings-label">Email vérifié</span>
              <span class="settings-value">
                {user()?.email_verified_at ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>
        </section>

        {/* Active Sessions */}
        <section class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Sessions actives</h2>
          </div>

          <div class="settings-card">
            <SessionList />
          </div>
        </section>
      </main>
    </div>
  )
}

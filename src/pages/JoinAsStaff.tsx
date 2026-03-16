/**
 * JoinAsStaff Page
 * Simple signup page for staff members
 * URL: /join/:managerId
 */

import { createSignal, createEffect, Show, onMount } from 'solid-js'
import { useParams, useNavigate, A } from '@solidjs/router'
import { LoadingButton } from '../components/ui/LoadingButton'
import { api } from '../lib/api'
import { signUp as authSignUp } from '../services/auth.service'
import { useAuth } from '../lib/auth'
import { PASSWORD_MIN_LENGTH } from '../lib/utils/errorMessages'

export default function JoinAsStaff() {
  const params = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  // Form state
  const [firstName, setFirstName] = createSignal('')
  const [lastName, setLastName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [step, setStep] = createSignal<'form' | 'verify' | 'success'>('form')

  // Manager validation
  const [managerValid, setManagerValid] = createSignal<boolean | null>(null)

  // Validate manager ID on mount
  onMount(() => {
    const managerId = params.managerId
    if (!managerId) {
      setManagerValid(false)
      return
    }

    // Basic UUID format validation
    // Real validation happens on signup (foreign key constraint)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(managerId)) {
      setManagerValid(true)
    } else {
      setManagerValid(false)
    }
  })

  // Redirect if already logged in
  createEffect(() => {
    if (!authLoading() && user()) {
      navigate('/portal', { replace: true })
    }
  })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    const managerId = params.managerId
    if (!managerId) {
      setError('Lien invalide')
      return
    }

    // Validation
    if (!firstName().trim()) {
      setError('Veuillez entrer votre prenom')
      return
    }
    if (!lastName().trim()) {
      setError('Veuillez entrer votre nom')
      return
    }
    if (!email().trim()) {
      setError('Veuillez entrer votre email')
      return
    }
    if (password().length < PASSWORD_MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caracteres`)
      return
    }

    setLoading(true)

    try {
      // 1. Create the user account via API
      const fullName = `${firstName().trim()} ${lastName().trim()}`
      const authResult = await authSignUp(email().trim(), password(), fullName)

      if (authResult.error) {
        if (authResult.error.includes('deja utilise') || authResult.error.includes('already')) {
          setError('Cet email est deja utilise. Connectez-vous plutot.')
        } else {
          setError(authResult.error)
        }
        setLoading(false)
        return
      }

      // 2. Create the staff member entry (linked to manager)
      try {
        await api.post('/staff-members', {
          user_id: managerId, // The manager who "owns" this staff
          first_name: firstName().trim(),
          last_name: lastName().trim(),
          email: email().trim(),
          position: 'housekeeper', // Default position
          is_active: true,
        })
      } catch (staffErr) {
        console.error('Failed to create staff member:', staffErr)
        // Don't fail the signup, the manager can add details later
      }

      // 3. If user was returned (no email verification required), link the profile
      if (authResult.data?.user && !authResult.data.needsVerification) {
        try {
          // Get the staff member we just created
          const staffList = await api.get<{ id: string }[]>(
            `/staff-members?user_id=${managerId}&email=${encodeURIComponent(email().trim())}`
          )
          const staffData = staffList?.[0]

          if (staffData) {
            // Update the profile to link to staff member
            await api.put(`/profiles/${authResult.data.user.id}`, { staff_account_id: staffData.id })
          }
        } catch (linkErr) {
          console.warn('Failed to link staff profile:', linkErr)
        }

        setStep('success')
      } else {
        // Email verification required
        setStep('verify')
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez reessayer.')
    }

    setLoading(false)
  }

  return (
    <div class="auth-layout">
      {/* Left Panel - Brand */}
      <div class="auth-brand-panel">
        <div class="brand-content">
          <div class="brand-logo" />
          <h1 class="brand-title">MaidManager</h1>
          <p class="brand-tagline">
            Votre espace personnel pour suivre votre travail
          </p>

          <div class="brand-divider" />

          <div class="brand-features">
            <div class="brand-feature">
              <div class="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span>Pointez vos heures facilement</span>
            </div>
            <div class="brand-feature">
              <div class="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <span>Consultez vos paiements</span>
            </div>
            <div class="brand-feature">
              <div class="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span>Voyez vos taches du jour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div class="auth-form-panel">
        <div class="auth-form-wrapper">
          {/* Mobile Brand Header */}
          <div class="auth-mobile-brand">
            <div class="brand-logo" />
            <h1 class="brand-title">MaidManager</h1>
          </div>

          {/* Invalid Manager */}
          <Show when={managerValid() === false}>
            <div class="invitation-error">
              <div class="invitation-error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3>Lien invalide</h3>
              <p>Ce lien d'inscription n'est pas valide ou a expire.</p>
              <A href="/login" class="btn btn-primary">
                Aller a la connexion
              </A>
            </div>
          </Show>

          {/* Loading Manager Validation */}
          <Show when={managerValid() === null}>
            <div class="invitation-loading">
              <span class="loading-spinner" />
              <p>Verification du lien...</p>
            </div>
          </Show>

          {/* Valid - Show Form */}
          <Show when={managerValid() === true && step() === 'form'}>
            <div class="form-header">
              <h2 class="form-title">Creer votre compte</h2>
              <p class="form-subtitle">
                Rejoignez MaidManager pour acceder a votre espace personnel
              </p>
            </div>

            {/* Error Message */}
            <Show when={error()}>
              <div class="error-message">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span class="error-text">{error()}</span>
              </div>
            </Show>

            <form onSubmit={handleSubmit}>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="join-first-name">Prenom</label>
                  <input
                    class="form-input"
                    id="join-first-name"
                    type="text"
                    placeholder="Marie"
                    value={firstName()}
                    onInput={(e) => setFirstName(e.currentTarget.value)}
                    required
                    autocomplete="given-name"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="join-last-name">Nom</label>
                  <input
                    class="form-input"
                    id="join-last-name"
                    type="text"
                    placeholder="Dupont"
                    value={lastName()}
                    onInput={(e) => setLastName(e.currentTarget.value)}
                    required
                    autocomplete="family-name"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="join-email">Email</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    class="form-input"
                    id="join-email"
                    type="email"
                    placeholder="marie@example.com"
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    required
                    autocomplete="email"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="join-password">Mot de passe</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    class="form-input"
                    id="join-password"
                    type="password"
                    placeholder={`Minimum ${PASSWORD_MIN_LENGTH} caracteres`}
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    autocomplete="new-password"
                  />
                </div>
              </div>

              <LoadingButton
                type="submit"
                class="btn-primary"
                loading={loading()}
                loadingText="Creation du compte..."
              >
                Creer mon compte
              </LoadingButton>
            </form>

            <div class="form-footer">
              <span class="form-footer-text">Deja un compte?</span>
              <A href="/login" class="form-footer-link">Se connecter</A>
            </div>
          </Show>

          {/* Verification Required */}
          <Show when={step() === 'verify'}>
            <div class="verification-status">
              <div class="success-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="form-title">Verifiez votre email</h3>
              <p class="form-subtitle">
                Nous avons envoye un lien de confirmation a <strong>{email()}</strong>.
                Cliquez sur le lien pour activer votre compte.
              </p>
              <p class="form-subtitle" style={{ "margin-top": "var(--space-sm)", "font-size": "0.85rem" }}>
                N'oubliez pas de verifier vos spams.
              </p>
            </div>
          </Show>

          {/* Success */}
          <Show when={step() === 'success'}>
            <div class="verification-status">
              <div class="success-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
              </div>
              <h3 class="form-title">Compte cree!</h3>
              <p class="form-subtitle">
                Votre compte a ete cree avec succes. Vous allez etre redirige vers votre espace personnel.
              </p>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

import { createSignal, createEffect, Show, onMount } from 'solid-js'
import { useNavigate, useSearchParams, A } from '@solidjs/router'
import { SignupForm } from '../components/auth/SignupForm'
import { LoginForm } from '../components/auth/LoginForm'
import { useAuth } from '../lib/auth'
import { validateInvitationToken } from '../services/staff-account.service'

export default function Login() {
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp] = createSignal(false)
  const [loginSuccess, setLoginSuccess] = createSignal(false)
  const navigate = useNavigate()
  const { user, isStaff, loading } = useAuth()

  // Invitation state
  const [invitationToken, setInvitationToken] = createSignal<string | null>(null)
  const [invitationStaffName, setInvitationStaffName] = createSignal<string | null>(null)
  const [invitationError, setInvitationError] = createSignal<string | null>(null)
  const [invitationLoading, setInvitationLoading] = createSignal(false)

  // Check for invitation token on mount
  onMount(async () => {
    const invite = searchParams.invite
    if (invite && typeof invite === 'string') {
      setInvitationLoading(true)
      const result = await validateInvitationToken(invite)
      setInvitationLoading(false)

      if (result.valid) {
        setInvitationToken(invite)
        setInvitationStaffName(result.staffName || null)
        setIsSignUp(true) // Show signup form for invitations
      } else {
        setInvitationError(result.message)
      }
    }
  })

  // Redirect after login based on user type
  createEffect(() => {
    if (loginSuccess() && user() && !loading()) {
      if (isStaff()) {
        // Staff users go to portal
        navigate('/portal', { replace: true })
      } else {
        // Managers go to dashboard
        navigate('/', { replace: true })
      }
    }
  })

  const handleSuccess = () => {
    // Mark login as successful, the effect will handle redirection
    setLoginSuccess(true)
  }

  return (
    <div class="auth-layout">
      {/* Left Panel - Brand & Features */}
      <div class="auth-brand-panel">
        <div class="brand-content">
          <div class="brand-logo" />
          <h1 class="brand-title">MaidManager</h1>
          <p class="brand-tagline">
            Gerez votre personnel de maison avec elegance et simplicite
          </p>

          <div class="brand-divider" />

          <div class="brand-features">
            <div class="brand-feature">
              <div class="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Planification intuitive des horaires</span>
            </div>
            <div class="brand-feature">
              <div class="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span>Gestion complete du personnel</span>
            </div>
            <div class="brand-feature">
              <div class="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span>Suivi des taches en temps reel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div class="auth-form-panel">
        <div class="auth-form-wrapper">
          {/* Mobile Brand Header */}
          <div class="auth-mobile-brand">
            <div class="brand-logo" />
            <h1 class="brand-title">MaidManager</h1>
          </div>

          {/* Invitation Loading */}
          <Show when={invitationLoading()}>
            <div class="invitation-loading">
              <span class="loading-spinner" />
              <p>Verification de l'invitation...</p>
            </div>
          </Show>

          {/* Invitation Error */}
          <Show when={invitationError()}>
            <div class="invitation-error">
              <div class="invitation-error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3>Invitation invalide</h3>
              <p>{invitationError()}</p>
              <button
                type="button"
                class="btn btn-primary"
                onClick={() => {
                  setInvitationError(null)
                  navigate('/login', { replace: true })
                }}
              >
                Retour a la connexion
              </button>
            </div>
          </Show>

          {/* Normal Auth Flow */}
          <Show when={!invitationLoading() && !invitationError()}>
            {/* Form Header */}
            <div class="form-header">
              <h2 class="form-title">
                {isSignUp() ? 'Creer un compte' : 'Bon retour'}
              </h2>
              <p class="form-subtitle">
                {isSignUp()
                  ? invitationToken()
                    ? 'Creez votre compte personnel'
                    : 'Commencez a gerer votre personnel des aujourd\'hui'
                  : 'Connectez-vous pour acceder a votre espace'}
              </p>
            </div>

            <Show when={isSignUp()}>
              <SignupForm
                onSuccess={handleSuccess}
                invitationToken={invitationToken() || undefined}
                staffName={invitationStaffName() || undefined}
              />
            </Show>

            <Show when={!isSignUp()}>
              <LoginForm
                onSuccess={handleSuccess}
                forgotPasswordLink={
                  <A href="/forgot-password" class="form-label-link">
                    Mot de passe oublie?
                  </A>
                }
              />
            </Show>

            {/* Toggle Sign Up / Sign In */}
            <Show when={!invitationToken()}>
              <div class="form-footer">
                <span class="form-footer-text">
                  {isSignUp() ? 'Deja un compte ?' : 'Pas encore de compte ?'}
                </span>
                <button
                  type="button"
                  class="form-footer-link"
                  onClick={() => setIsSignUp(!isSignUp())}
                >
                  {isSignUp() ? 'Se connecter' : 'Creer un compte'}
                </button>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  )
}

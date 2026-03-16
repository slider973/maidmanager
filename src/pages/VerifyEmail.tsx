import { createSignal, onMount, Show } from 'solid-js'
import { useNavigate, useSearchParams, A } from '@solidjs/router'
import { verifyEmail } from '../services/auth.service'
import { useInvitationToken } from '../services/staff-account.service'
import { LoadingButton } from '../components/ui/LoadingButton'
import { showSuccess, showError } from '../components/ui/Toast'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { resendVerification } = useAuth()

  const [status, setStatus] = createSignal<'verifying' | 'linking' | 'success' | 'error' | 'no-token'>('verifying')
  const [error, setError] = createSignal('')
  const [resendEmail, setResendEmail] = createSignal('')
  const [resendLoading, setResendLoading] = createSignal(false)
  const [resendSent, setResendSent] = createSignal(false)
  const [isStaffAccount, setIsStaffAccount] = createSignal(false)

  onMount(async () => {
    const tokenHash = searchParams.token_hash
    const type = (searchParams.type as 'email' | 'signup') || 'signup'
    const inviteToken = searchParams.invite
    const isStaffSignup = searchParams.staff === 'true'

    if (!tokenHash || Array.isArray(tokenHash)) {
      setStatus('no-token')
      return
    }

    // Step 1: Verify email
    const result = await verifyEmail(tokenHash, type)

    if (result.error) {
      setError(result.error)
      setStatus('error')
      showError(result.error)
      return
    }

    // Step 2: If there's an invitation token, link the account (old system)
    if (inviteToken && typeof inviteToken === 'string' && result.data?.user) {
      setStatus('linking')

      const linkResult = await useInvitationToken(inviteToken, result.data.user.id)

      if (linkResult.success) {
        setIsStaffAccount(true)
        setStatus('success')
        showSuccess('Compte cree et lie avec succes!')
        // Force full page reload to refresh auth context
        setTimeout(() => { window.location.href = '/portal' }, 2000)
      } else {
        // Email verified but linking failed - still consider it a success
        // The user can still use their account
        console.warn('Account linking failed:', linkResult.message)
        setStatus('success')
        showSuccess('Email verifie! (liaison du compte echouee)')
        setTimeout(() => navigate('/login', { replace: true }), 2000)
      }
    } else if (isStaffSignup && result.data?.user) {
      // Staff signup via /join/:managerId - link profile to staff member
      setStatus('linking')

      const user = result.data.user
      const managerId = user.user_metadata?.manager_id
      const userEmail = user.email

      if (managerId && userEmail) {
        // Find the staff member created during signup
        const { data: staffData } = await supabase
          .from('staff_members')
          .select('id')
          .eq('user_id', managerId)
          .eq('email', userEmail)
          .single()

        if (staffData) {
          // Link the profile to the staff member
          await supabase
            .from('profiles')
            .update({ staff_account_id: staffData.id })
            .eq('id', user.id)
        }
      }

      setIsStaffAccount(true)
      setStatus('success')
      showSuccess('Compte cree avec succes!')
      // Force full page reload to refresh auth context with new staff_account_id
      setTimeout(() => { window.location.href = '/portal' }, 2000)
    } else {
      // Regular email verification - redirect to home
      setStatus('success')
      showSuccess('Votre email a ete verifie avec succes!')
      setTimeout(() => navigate('/', { replace: true }), 2000)
    }
  })

  const handleResend = async (e: Event) => {
    e.preventDefault()
    if (!resendEmail()) return

    setResendLoading(true)
    const { error } = await resendVerification(resendEmail())

    if (error) {
      showError(error)
    } else {
      setResendSent(true)
      showSuccess('Email de verification renvoye')
    }
    setResendLoading(false)
  }

  return (
    <div class="auth-layout">
      {/* Left Panel - Brand */}
      <div class="auth-brand-panel">
        <div class="brand-content">
          <div class="brand-logo" />
          <h1 class="brand-title">MaidManager</h1>
          <p class="brand-tagline">
            Gerez votre personnel de maison avec elegance et simplicite
          </p>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div class="auth-form-panel">
        <div class="auth-form-wrapper">
          {/* Mobile Brand Header */}
          <div class="auth-mobile-brand">
            <div class="brand-logo" />
            <h1 class="brand-title">MaidManager</h1>
          </div>

          {/* Verifying State */}
          <Show when={status() === 'verifying'}>
            <div class="verification-status">
              <div class="loading-spinner" style={{ width: '48px', height: '48px' }} />
              <h2 class="form-title">Verification en cours...</h2>
              <p class="form-subtitle">Veuillez patienter pendant que nous verifions votre email.</p>
            </div>
          </Show>

          {/* Linking State */}
          <Show when={status() === 'linking'}>
            <div class="verification-status">
              <div class="loading-spinner" style={{ width: '48px', height: '48px' }} />
              <h2 class="form-title">Liaison du compte...</h2>
              <p class="form-subtitle">Configuration de votre espace personnel.</p>
            </div>
          </Show>

          {/* Success State */}
          <Show when={status() === 'success'}>
            <div class="verification-status">
              <div class="success-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
              </div>
              <h2 class="form-title">
                {isStaffAccount() ? 'Compte cree!' : 'Email verifie!'}
              </h2>
              <p class="form-subtitle">
                {isStaffAccount()
                  ? 'Votre compte a ete cree et lie. Vous allez etre redirige vers votre espace personnel.'
                  : 'Votre compte a ete active. Vous allez etre redirige vers la page d\'accueil.'}
              </p>
            </div>
          </Show>

          {/* Error State */}
          <Show when={status() === 'error'}>
            <div class="verification-status">
              <div class="error-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 class="form-title">Erreur de verification</h2>
              <p class="form-subtitle">{error()}</p>

              <Show when={!resendSent()}>
                <form onSubmit={handleResend} class="resend-form">
                  <p class="form-subtitle">Renvoyer un email de verification:</p>
                  <div class="form-group">
                    <input
                      class="form-input"
                      type="email"
                      placeholder="votre@email.com"
                      value={resendEmail()}
                      onInput={(e) => setResendEmail(e.currentTarget.value)}
                      required
                      aria-label="Adresse email"
                    />
                  </div>
                  <LoadingButton
                    type="submit"
                    class="btn-primary"
                    loading={resendLoading()}
                    loadingText="Envoi..."
                  >
                    Renvoyer l'email
                  </LoadingButton>
                </form>
              </Show>

              <Show when={resendSent()}>
                <p class="success-message" style={{ "margin-top": "var(--space-lg)" }}>
                  Un nouvel email de verification a ete envoye.
                </p>
              </Show>
            </div>
          </Show>

          {/* No Token State */}
          <Show when={status() === 'no-token'}>
            <div class="verification-status">
              <div class="info-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <h2 class="form-title">Verification d'email</h2>
              <p class="form-subtitle">
                Cliquez sur le lien dans l'email que nous vous avons envoye pour verifier votre compte.
              </p>

              <Show when={!resendSent()}>
                <form onSubmit={handleResend} class="resend-form">
                  <p class="form-subtitle">Vous n'avez pas recu l'email?</p>
                  <div class="form-group">
                    <input
                      class="form-input"
                      type="email"
                      placeholder="votre@email.com"
                      value={resendEmail()}
                      onInput={(e) => setResendEmail(e.currentTarget.value)}
                      required
                      aria-label="Adresse email"
                    />
                  </div>
                  <LoadingButton
                    type="submit"
                    class="btn-primary"
                    loading={resendLoading()}
                    loadingText="Envoi..."
                  >
                    Renvoyer l'email
                  </LoadingButton>
                </form>
              </Show>

              <Show when={resendSent()}>
                <p class="success-message" style={{ "margin-top": "var(--space-lg)" }}>
                  Un nouvel email de verification a ete envoye.
                </p>
              </Show>
            </div>
          </Show>

          {/* Back to Login */}
          <div class="form-footer">
            <A href="/login" class="form-footer-link">
              ← Retour a la connexion
            </A>
          </div>
        </div>
      </div>
    </div>
  )
}

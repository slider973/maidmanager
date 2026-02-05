import { createSignal, onMount, Show } from 'solid-js'
import { useNavigate, useSearchParams, A } from '@solidjs/router'
import { verifyEmail } from '../services/auth.service'
import { LoadingButton } from '../components/ui/LoadingButton'
import { showSuccess, showError } from '../components/ui/Toast'
import { useAuth } from '../lib/auth'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { resendVerification } = useAuth()

  const [status, setStatus] = createSignal<'verifying' | 'success' | 'error' | 'no-token'>('verifying')
  const [error, setError] = createSignal('')
  const [resendEmail, setResendEmail] = createSignal('')
  const [resendLoading, setResendLoading] = createSignal(false)
  const [resendSent, setResendSent] = createSignal(false)

  onMount(async () => {
    const tokenHash = searchParams.token_hash
    const type = (searchParams.type as 'email' | 'signup') || 'signup'

    if (!tokenHash || Array.isArray(tokenHash)) {
      setStatus('no-token')
      return
    }

    const result = await verifyEmail(tokenHash, type)

    if (result.error) {
      setError(result.error)
      setStatus('error')
      showError(result.error)
    } else {
      setStatus('success')
      showSuccess('Votre email a été vérifié avec succès !')
      // Redirect to home after short delay
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
      showSuccess('Email de vérification renvoyé')
    }
    setResendLoading(false)
  }

  return (
    <div class="auth-layout">
      {/* Left Panel — Brand */}
      <div class="auth-brand-panel">
        <div class="brand-content">
          <div class="brand-logo" />
          <h1 class="brand-title">MaidManager</h1>
          <p class="brand-tagline">
            Gérez votre personnel de maison avec élégance et simplicité
          </p>
        </div>
      </div>

      {/* Right Panel — Content */}
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
              <h2 class="form-title">Vérification en cours...</h2>
              <p class="form-subtitle">Veuillez patienter pendant que nous vérifions votre email.</p>
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
              <h2 class="form-title">Email vérifié !</h2>
              <p class="form-subtitle">
                Votre compte a été activé. Vous allez être redirigé vers la page d'accueil.
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
              <h2 class="form-title">Erreur de vérification</h2>
              <p class="form-subtitle">{error()}</p>

              <Show when={!resendSent()}>
                <form onSubmit={handleResend} class="resend-form">
                  <p class="form-subtitle">Renvoyer un email de vérification :</p>
                  <div class="form-group">
                    <input
                      class="form-input"
                      type="email"
                      placeholder="votre@email.com"
                      value={resendEmail()}
                      onInput={(e) => setResendEmail(e.currentTarget.value)}
                      required
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
                  Un nouvel email de vérification a été envoyé.
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
              <h2 class="form-title">Vérification d'email</h2>
              <p class="form-subtitle">
                Cliquez sur le lien dans l'email que nous vous avons envoyé pour vérifier votre compte.
              </p>

              <Show when={!resendSent()}>
                <form onSubmit={handleResend} class="resend-form">
                  <p class="form-subtitle">Vous n'avez pas reçu l'email ?</p>
                  <div class="form-group">
                    <input
                      class="form-input"
                      type="email"
                      placeholder="votre@email.com"
                      value={resendEmail()}
                      onInput={(e) => setResendEmail(e.currentTarget.value)}
                      required
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
                  Un nouvel email de vérification a été envoyé.
                </p>
              </Show>
            </div>
          </Show>

          {/* Back to Login */}
          <div class="form-footer">
            <A href="/login" class="form-footer-link">
              ← Retour à la connexion
            </A>
          </div>
        </div>
      </div>
    </div>
  )
}

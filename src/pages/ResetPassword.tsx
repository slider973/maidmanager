import { createSignal, onMount, Show, createEffect } from 'solid-js'
import { useNavigate, A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { LoadingButton } from '../components/ui/LoadingButton'
import { showSuccess, showError } from '../components/ui/Toast'
import { PASSWORD_MIN_LENGTH } from '../lib/utils/errorMessages'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword, authEvent, resetPassword } = useAuth()

  const [password, setPassword] = createSignal('')
  const [confirmPassword, setConfirmPassword] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal('')
  const [isRecoveryMode, setIsRecoveryMode] = createSignal(false)
  const [success, setSuccess] = createSignal(false)
  const [expiredToken, setExpiredToken] = createSignal(false)
  const [resendEmail, setResendEmail] = createSignal('')
  const [resendLoading, setResendLoading] = createSignal(false)
  const [resendSent, setResendSent] = createSignal(false)

  // Check for PASSWORD_RECOVERY event
  createEffect(() => {
    if (authEvent() === 'PASSWORD_RECOVERY') {
      setIsRecoveryMode(true)
    }
  })

  onMount(() => {
    // Check if we have the recovery session
    // The PASSWORD_RECOVERY event should fire from onAuthStateChange
    const urlParams = new URLSearchParams(window.location.hash.substring(1))
    const errorCode = urlParams.get('error_code')

    if (errorCode === 'otp_expired') {
      setExpiredToken(true)
      showError('Le lien a expiré, veuillez en demander un nouveau')
    }
  })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    // Validate password match
    if (password() !== confirmPassword()) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    // Validate password length
    if (password().length < PASSWORD_MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`)
      return
    }

    setLoading(true)
    const { error: updateError } = await updatePassword(password())

    if (updateError) {
      setError(updateError)
      showError(updateError)
    } else {
      setSuccess(true)
      showSuccess('Mot de passe mis à jour avec succès')
      // Redirect to home after short delay
      setTimeout(() => navigate('/', { replace: true }), 2000)
    }

    setLoading(false)
  }

  const handleResend = async (e: Event) => {
    e.preventDefault()
    if (!resendEmail()) return

    setResendLoading(true)
    const { error } = await resetPassword(resendEmail())

    if (error) {
      showError(error)
    } else {
      setResendSent(true)
      showSuccess('Un nouveau lien de réinitialisation a été envoyé')
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

      {/* Right Panel — Form */}
      <div class="auth-form-panel">
        <div class="auth-form-wrapper">
          {/* Mobile Brand Header */}
          <div class="auth-mobile-brand">
            <div class="brand-logo" />
            <h1 class="brand-title">MaidManager</h1>
          </div>

          {/* Success State */}
          <Show when={success()}>
            <div class="verification-status">
              <div class="success-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
              </div>
              <h2 class="form-title">Mot de passe mis à jour !</h2>
              <p class="form-subtitle">
                Vous allez être redirigé vers la page d'accueil.
              </p>
            </div>
          </Show>

          {/* Expired Token State */}
          <Show when={expiredToken() && !success()}>
            <div class="verification-status">
              <div class="error-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 class="form-title">Lien expiré</h2>
              <p class="form-subtitle">
                Le lien de réinitialisation a expiré. Demandez un nouveau lien.
              </p>

              <Show when={!resendSent()}>
                <form onSubmit={handleResend} class="resend-form">
                  <div class="form-group">
                    <label class="form-label" for="resend-email">Votre adresse email</label>
                    <input
                      class="form-input"
                      id="resend-email"
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
                    Demander un nouveau lien
                  </LoadingButton>
                </form>
              </Show>

              <Show when={resendSent()}>
                <p class="success-message" style={{ "margin-top": "var(--space-lg)" }}>
                  Un nouveau lien a été envoyé à votre adresse email.
                </p>
              </Show>
            </div>
          </Show>

          {/* Password Reset Form */}
          <Show when={(isRecoveryMode() || !expiredToken()) && !success() && !expiredToken()}>
            <div class="form-header">
              <h2 class="form-title">Nouveau mot de passe</h2>
              <p class="form-subtitle">
                Entrez votre nouveau mot de passe
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
              <div class="form-group">
                <label class="form-label" for="password">Nouveau mot de passe</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    class="form-input"
                    id="password"
                    type="password"
                    placeholder="Minimum 8 caractères"
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    autocomplete="new-password"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="confirm-password">Confirmer le mot de passe</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    class="form-input"
                    id="confirm-password"
                    type="password"
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword()}
                    onInput={(e) => setConfirmPassword(e.currentTarget.value)}
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
                loadingText="Mise à jour..."
              >
                Mettre à jour le mot de passe
              </LoadingButton>
            </form>
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

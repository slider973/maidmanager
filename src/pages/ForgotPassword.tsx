import { createSignal, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { LoadingButton } from '../components/ui/LoadingButton'
import { showSuccess, showError } from '../components/ui/Toast'

export default function ForgotPassword() {
  const [email, setEmail] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [submitted, setSubmitted] = createSignal(false)
  const [error, setError] = createSignal('')

  const { resetPassword } = useAuth()

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await resetPassword(email())

    if (resetError) {
      setError(resetError)
      showError(resetError)
    } else {
      setSubmitted(true)
      showSuccess('Si un compte existe avec cet email, vous recevrez un lien de réinitialisation')
    }

    setLoading(false)
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

          {/* Form Header */}
          <div class="form-header">
            <h2 class="form-title">Mot de passe oublié</h2>
            <p class="form-subtitle">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          <Show when={!submitted()}>
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
                <label class="form-label" for="email">Adresse email</label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    class="form-input"
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    required
                    autocomplete="email"
                  />
                </div>
              </div>

              <LoadingButton
                type="submit"
                class="btn-primary"
                loading={loading()}
                loadingText="Envoi en cours..."
              >
                Envoyer le lien
              </LoadingButton>
            </form>
          </Show>

          <Show when={submitted()}>
            <div class="success-message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="success-icon">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              <p>
                Si un compte existe avec l'adresse <strong>{email()}</strong>, vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
              </p>
              <p class="form-subtitle" style={{ "margin-top": "var(--space-md)" }}>
                Vérifiez votre boîte de réception et vos spams.
              </p>
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

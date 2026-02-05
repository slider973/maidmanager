import { createSignal, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import * as authService from '../../services/auth.service'
import { PASSWORD_MIN_LENGTH } from '../../lib/utils/errorMessages'

interface SignupFormProps {
  onSuccess?: () => void
  onNeedsVerification?: (email: string) => void
}

export const SignupForm: Component<SignupFormProps> = (props) => {
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [showVerification, setShowVerification] = createSignal(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await authService.signUp(email(), password())

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.data?.needsVerification) {
      setShowVerification(true)
      props.onNeedsVerification?.(email())
    } else {
      props.onSuccess?.()
    }

    setLoading(false)
  }

  return (
    <Show
      when={!showVerification()}
      fallback={
        <div class="verification-status">
          <div class="success-icon-large">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="form-title">Vérifiez votre email</h3>
          <p class="form-subtitle">
            Nous avons envoyé un lien de confirmation à <strong>{email()}</strong>.
            Cliquez sur le lien pour activer votre compte.
          </p>
          <p class="form-subtitle" style={{ "margin-top": "var(--space-sm)", "font-size": "0.85rem" }}>
            N'oubliez pas de vérifier vos spams.
          </p>
        </div>
      }
    >
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
          <label class="form-label" for="signup-email">Adresse email</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              class="form-input"
              id="signup-email"
              type="email"
              placeholder="votre@email.com"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
              autocomplete="email"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="signup-password">Mot de passe</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input
              class="form-input"
              id="signup-password"
              type="password"
              placeholder={`Minimum ${PASSWORD_MIN_LENGTH} caractères`}
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
          loadingText="Création du compte..."
        >
          Créer le compte
        </LoadingButton>
      </form>
    </Show>
  )
}

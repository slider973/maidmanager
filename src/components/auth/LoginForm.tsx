import { createSignal, Show } from 'solid-js'
import type { Component, JSX } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import * as authService from '../../services/auth.service'

interface LoginFormProps {
  onSuccess?: () => void
  showForgotPassword?: boolean
  forgotPasswordLink?: JSX.Element
}

export const LoginForm: Component<LoginFormProps> = (props) => {
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await authService.signIn(email(), password())

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    props.onSuccess?.()
    setLoading(false)
  }

  return (
    <>
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
          <label class="form-label" for="login-email">Adresse email</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              class="form-input"
              id="login-email"
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
          <Show
            when={props.showForgotPassword !== false && props.forgotPasswordLink}
            fallback={<label class="form-label" for="login-password">Mot de passe</label>}
          >
            <div class="form-label-row">
              <label class="form-label" for="login-password">Mot de passe</label>
              {props.forgotPasswordLink}
            </div>
          </Show>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input
              class="form-input"
              id="login-password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
              autocomplete="current-password"
            />
          </div>
        </div>

        <LoadingButton
          type="submit"
          class="btn-primary"
          loading={loading()}
          loadingText="Connexion..."
        >
          Se connecter
        </LoadingButton>
      </form>
    </>
  )
}

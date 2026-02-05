import { createSignal, Show } from 'solid-js'
import { useNavigate, A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { SignupForm } from '../components/auth/SignupForm'
import { LoadingButton } from '../components/ui/LoadingButton'

export default function Login() {
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [isSignUp, setIsSignUp] = createSignal(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: Event) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email(), password())

    if (error) {
      setError(error)
    } else {
      navigate('/', { replace: true })
    }

    setLoading(false)
  }

  const handleSignupSuccess = () => {
    navigate('/', { replace: true })
  }

  return (
    <div class="auth-layout">
      {/* Left Panel — Brand & Features */}
      <div class="auth-brand-panel">
        <div class="brand-content">
          <div class="brand-logo" />
          <h1 class="brand-title">MaidManager</h1>
          <p class="brand-tagline">
            Gérez votre personnel de maison avec élégance et simplicité
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
              <span>Gestion complète du personnel</span>
            </div>
            <div class="brand-feature">
              <div class="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span>Suivi des tâches en temps réel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div class="auth-form-panel">
        <div class="auth-form-wrapper">
          {/* Mobile Brand Header */}
          <div class="auth-mobile-brand">
            <div class="brand-logo" />
            <h1 class="brand-title">MaidManager</h1>
          </div>

          {/* Form Header */}
          <div class="form-header">
            <h2 class="form-title">
              {isSignUp() ? 'Créer un compte' : 'Bon retour'}
            </h2>
            <p class="form-subtitle">
              {isSignUp()
                ? 'Commencez à gérer votre personnel dès aujourd\'hui'
                : 'Connectez-vous pour accéder à votre espace'}
            </p>
          </div>

          <Show when={isSignUp()}>
            <SignupForm onSuccess={handleSignupSuccess} />
          </Show>

          <Show when={!isSignUp()}>
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

            {/* Login Form */}
            <form onSubmit={handleLogin}>
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

              <div class="form-group">
                <div class="form-label-row">
                  <label class="form-label" for="password">Mot de passe</label>
                  <A href="/forgot-password" class="form-label-link">
                    Mot de passe oublié?
                  </A>
                </div>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    class="form-input"
                    id="password"
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
          </Show>

          {/* Toggle Sign Up / Sign In */}
          <div class="form-footer">
            <span class="form-footer-text">
              {isSignUp() ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
            </span>
            <button
              type="button"
              class="form-footer-link"
              onClick={() => setIsSignUp(!isSignUp())}
            >
              {isSignUp() ? 'Se connecter' : 'Créer un compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

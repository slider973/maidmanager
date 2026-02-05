import { Router, Route } from '@solidjs/router'
import { lazy } from 'solid-js'
import { AuthProvider } from './lib/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastContainer } from './components/ui/Toast'
import Login from './pages/Login'
import Home from './pages/Home'
import './App.css'

// Lazy load auth pages for performance
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/auth/verify" component={VerifyEmail} />
        <Route path="/auth/reset-password" component={ResetPassword} />
        <Route path="/settings" component={() => (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        )} />
        <Route path="/" component={() => (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )} />
      </Router>
      <ToastContainer />
    </AuthProvider>
  )
}

export default App

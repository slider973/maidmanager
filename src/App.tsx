import { Router, Route } from '@solidjs/router'
import { AuthProvider } from './lib/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/login" component={Login} />
        <Route path="/" component={() => (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )} />
      </Router>
    </AuthProvider>
  )
}

export default App

import { Router, Route } from '@solidjs/router'
import { lazy } from 'solid-js'
import { AuthProvider } from './lib/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ProtectedStaffRoute } from './components/portal/ProtectedStaffRoute'
import { ToastContainer } from './components/ui/Toast'
import Login from './pages/Login'
import Home from './pages/Home'
import './App.css'

// Lazy load pages for performance
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const JoinAsStaff = lazy(() => import('./pages/JoinAsStaff'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Settings = lazy(() => import('./pages/Settings'))
const Staff = lazy(() => import('./pages/Staff'))
const Schedule = lazy(() => import('./pages/Schedule'))
const Tasks = lazy(() => import('./pages/Tasks'))
const Statistics = lazy(() => import('./pages/Statistics'))
const Clients = lazy(() => import('./pages/Clients'))
const ClientInstructions = lazy(() => import('./pages/ClientInstructions'))
const ClientRooms = lazy(() => import('./pages/ClientRooms'))
const ClientSchedule = lazy(() => import('./pages/ClientSchedule'))
const Invoices = lazy(() => import('./pages/Invoices'))
const InvoiceDetailPage = lazy(() => import('./pages/InvoiceDetail'))
const InvoicePrint = lazy(() => import('./pages/InvoicePrint'))
const StaffPayments = lazy(() => import('./pages/StaffPayments'))
const WorkSessions = lazy(() => import('./pages/WorkSessions'))
const StaffWorkView = lazy(() => import('./pages/StaffWorkView'))
const RoomTypesSettings = lazy(() => import('./pages/RoomTypesSettings'))

// Portal pages (staff self-service)
const PortalHome = lazy(() => import('./pages/portal/PortalHome'))
const PortalHistory = lazy(() => import('./pages/portal/PortalHistory'))
const PortalCalendar = lazy(() => import('./pages/portal/PortalCalendar'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Login} />
        <Route path="/join/:managerId" component={JoinAsStaff} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/auth/verify" component={VerifyEmail} />
        <Route path="/auth/reset-password" component={ResetPassword} />
        <Route path="/settings" component={() => (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        )} />
        <Route path="/settings/room-types" component={() => (
          <ProtectedRoute>
            <RoomTypesSettings />
          </ProtectedRoute>
        )} />
        <Route path="/staff" component={() => (
          <ProtectedRoute>
            <Staff />
          </ProtectedRoute>
        )} />
        <Route path="/staff/:id/payments" component={() => (
          <ProtectedRoute>
            <StaffPayments />
          </ProtectedRoute>
        )} />
        <Route path="/work-sessions" component={() => (
          <ProtectedRoute>
            <WorkSessions />
          </ProtectedRoute>
        )} />
        <Route path="/staff-work" component={() => (
          <ProtectedRoute>
            <StaffWorkView />
          </ProtectedRoute>
        )} />
        <Route path="/schedule" component={() => (
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        )} />
        <Route path="/tasks" component={() => (
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        )} />
        <Route path="/statistics" component={() => (
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        )} />
        <Route path="/clients" component={() => (
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        )} />
        <Route path="/clients/:clientId/instructions" component={() => (
          <ProtectedRoute>
            <ClientInstructions />
          </ProtectedRoute>
        )} />
        <Route path="/clients/:clientId/rooms" component={() => (
          <ProtectedRoute>
            <ClientRooms />
          </ProtectedRoute>
        )} />
        <Route path="/clients/:clientId/schedule" component={() => (
          <ProtectedRoute>
            <ClientSchedule />
          </ProtectedRoute>
        )} />
        <Route path="/invoices" component={() => (
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        )} />
        <Route path="/invoices/:id" component={() => (
          <ProtectedRoute>
            <InvoiceDetailPage />
          </ProtectedRoute>
        )} />
        <Route path="/invoices/:id/print" component={() => (
          <ProtectedRoute>
            <InvoicePrint />
          </ProtectedRoute>
        )} />
        <Route path="/" component={() => (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )} />
        {/* Portal routes (staff self-service) */}
        <Route path="/portal" component={() => (
          <ProtectedStaffRoute>
            <PortalHome />
          </ProtectedStaffRoute>
        )} />
        <Route path="/portal/history" component={() => (
          <ProtectedStaffRoute>
            <PortalHistory />
          </ProtectedStaffRoute>
        )} />
        <Route path="/portal/calendar" component={() => (
          <ProtectedStaffRoute>
            <PortalCalendar />
          </ProtectedStaffRoute>
        )} />
      </Router>
      <ToastContainer />
    </AuthProvider>
  )
}

export default App

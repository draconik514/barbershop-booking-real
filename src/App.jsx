import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { getServices, getBarbers } from './utils/api'

// Warm up Apps Script cold start
getServices().catch(() => {})
getBarbers().catch(() => {})

const CustomerBooking = lazy(() => import('./pages/CustomerBooking'))
const OwnerLogin = lazy(() => import('./pages/OwnerLogin'))
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
)

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/manage-barbershop/login" replace />
}

const AppRoutes = () => {
  const { user, loading } = useAuth()
  if (loading) return null

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<CustomerBooking />} />
        <Route path="/manage-barbershop/login" element={user ? <Navigate to="/manage-barbershop" replace /> : <OwnerLogin />} />
        <Route path="/manage-barbershop" element={<PrivateRoute><OwnerDashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

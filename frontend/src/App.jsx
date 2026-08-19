import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Customer pages — lazy loaded
const HomePage          = lazy(() => import('./pages/HomePage'))
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage'))
const PaymentPage       = lazy(() => import('./pages/PaymentPage'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))
const ETicketPage       = lazy(() => import('./pages/ETicketPage'))
const TicketLookupPage  = lazy(() => import('./pages/TicketLookupPage'))

// Admin pages — lazy loaded
const AdminLogin      = lazy(() => import('./pages/admin/LoginPage'))
const AdminDashboard  = lazy(() => import('./pages/admin/DashboardPage'))
const AdminCustomers  = lazy(() => import('./pages/admin/CustomersPage'))
const AdminCategories = lazy(() => import('./pages/admin/CategoriesPage'))
const AdminScanner    = lazy(() => import('./pages/admin/ScannerPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Memuat halaman...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Customer Routes */}
        <Route path="/"                          element={<HomePage />} />
        <Route path="/checkout"                  element={<CheckoutPage />} />
        <Route path="/payment/:orderNumber"      element={<PaymentPage />} />
        <Route path="/payment-success/:orderNumber" element={<PaymentSuccessPage />} />
        <Route path="/ticket/:ticketUuid"        element={<ETicketPage />} />
        <Route path="/ticket-lookup"             element={<TicketLookupPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/customers"
          element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>}
        />
        <Route
          path="/admin/categories"
          element={<ProtectedRoute><AdminCategories /></ProtectedRoute>}
        />
        <Route
          path="/admin/scanner"
          element={<ProtectedRoute><AdminScanner /></ProtectedRoute>}
        />

        {/* Fallback */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

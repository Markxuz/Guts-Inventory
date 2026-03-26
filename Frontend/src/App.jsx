import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import LoginPage from "./pages/LoginPage"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import EIM from "./pages/EIM"
import SMAW from "./pages/SMAW"
import CSS from "./pages/CSS"
import History from "./pages/History"
import Archive from "./pages/Archive"
import ProtectedRoute from "./components/ProtectedRoute"

const App = () => {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/eim" element={<EIM />} />
        <Route path="/smaw" element={<SMAW />} />
        <Route path="/css" element={<CSS />} />
        <Route path="/history" element={<History />} />
        <Route path="/archive" element={<Archive />} />
      </Route>

      {/* Fallback - redirect to login or dashboard */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  )
}

export default App

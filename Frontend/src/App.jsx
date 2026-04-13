import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import { InventoryLocationProvider } from "./context/InventoryLocationContext"
import LoginPage from "./pages/LoginPage"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import CourseInventoryPage from "./pages/CourseInventoryPage"
import History from "./pages/History"
import HistoryPage from "./pages/HistoryPage"
import Archive from "./pages/Archive"
import ItemDetailPage from "./pages/ItemDetailPage"
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
    <InventoryLocationProvider>
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
          <Route path="/inventory/:track/:itemId" element={<ItemDetailPage />} />
          <Route path="/history/:track/:itemId" element={<HistoryPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/:courseCode" element={<CourseInventoryPage />} />
        </Route>

        {/* Fallback - redirect to login or dashboard */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </InventoryLocationProvider>
  )
}

export default App

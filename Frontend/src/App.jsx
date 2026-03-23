import { Navigate, Route, Routes } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import IEM from "./pages/IEM"
import SMAW from "./pages/SMAW"
import CSS from "./pages/CSS"
import History from "./pages/History"
import Archive from "./pages/Archive"

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/iem" element={<IEM />} />
        <Route path="/smaw" element={<SMAW />} />
        <Route path="/css" element={<CSS />} />
        <Route path="/history" element={<History />} />
        <Route path="/archive" element={<Archive />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

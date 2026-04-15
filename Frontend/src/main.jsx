import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { SearchProvider } from "./context/SearchContext"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { ToastProvider } from "./context/ToastContext"
import "./styles/global.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <SearchProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SearchProvider>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
)

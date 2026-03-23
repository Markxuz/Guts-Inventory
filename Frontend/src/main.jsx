import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { SearchProvider } from "./context/SearchContext"
import "./styles/global.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SearchProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SearchProvider>
  </StrictMode>
)

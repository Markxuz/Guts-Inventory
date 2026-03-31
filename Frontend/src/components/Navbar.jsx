import { Search } from "lucide-react"
import { useLocation } from "react-router-dom"
import { useSearch } from "../context/SearchContext"
import { useInventoryLocation } from "../context/InventoryLocationContext"
import NotificationBell from "./NotificationBell"

const Navbar = () => {
  const { searchQuery, setSearchQuery } = useSearch()
  const { selectedInventory, handleInventoryChange } = useInventoryLocation()
  const location = useLocation()

  const dateText = new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  const isItemDetailPage = location.pathname.includes('/inventory/')

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            GUTS TESDA Inventory
          </p>
          <h1 className="font-title text-xl font-semibold text-slate-800">
            Inventory Management Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm sm:flex">
            <Search className="h-4 w-4" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Quick Search"
              className="w-44 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
          <NotificationBell />
          <p className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
            {dateText}
          </p>
        </div>
      </header>

      {/* Inventory Location Tabs - shown only on item detail page */}
      {isItemDetailPage && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 print:hidden">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-600 mr-4">Inventory Location:</p>
            <button
              onClick={() => handleInventoryChange("main")}
              className={`px-4 py-2 font-semibold text-sm rounded-lg transition ${
                selectedInventory === "main"
                  ? "bg-[#800000] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Main Inventory Monitoring
            </button>
            <button
              onClick={() => handleInventoryChange("annex")}
              className={`px-4 py-2 font-semibold text-sm rounded-lg transition ${
                selectedInventory === "annex"
                  ? "bg-[#800000] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Training Inventory Monitoring
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar

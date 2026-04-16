import { useInventoryLocation } from "../context/InventoryLocationContext"
import { useAuth } from "../context/AuthContext"
import { RotateCcw, Lock } from "lucide-react"

const InventorySelector = () => {
  const { selectedInventory, handleInventoryChange } = useInventoryLocation()
  const { user } = useAuth()
  
  // Staff can only access training inventory
  const isStaff = user?.role === 'staff'
  const mainDisabled = isStaff

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        {/* Main Inventory Option */}
        <button
          onClick={() => !mainDisabled && handleInventoryChange("main")}
          disabled={mainDisabled}
          className={`rounded-2xl border-2 p-6 text-left transition ${
            mainDisabled
              ? "border-slate-300 bg-slate-50 cursor-not-allowed opacity-60"
              : selectedInventory === "main"
              ? "border-[#800000] bg-[#fff6f7] shadow-md hover:shadow-lg"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
          }`}
          title={mainDisabled ? "Only administrators can access main inventory" : ""}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className={`text-xl font-bold mb-2 flex items-center gap-2 ${
                mainDisabled
                  ? "text-slate-500"
                  : selectedInventory === "main" ? "text-[#800000]" : "text-slate-800"
              }`}>
                Main Inventory Consumables
                {mainDisabled && <Lock className="h-4 w-4" />}
              </h2>
              <p className={`text-sm mb-4 ${mainDisabled ? "text-slate-400" : "text-slate-600"}`}>
                {mainDisabled ? "Only administrators can manage main inventory consumables" : "Click to manage main inventory consumables"}
              </p>
            </div>
          </div>
          {selectedInventory === "main" && !mainDisabled && (
            <div className="inline-block px-3 py-1 bg-[#800000] text-white text-xs font-semibold rounded-full">
              ✓ Selected
            </div>
          )}
        </button>

        {/* Annex Inventory Option */}
        <button
          onClick={() => handleInventoryChange("annex")}
          className={`rounded-2xl border-2 p-6 text-left transition ${
            selectedInventory === "annex"
              ? "border-[#800000] bg-[#fff6f7] shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <h2 className={`text-xl font-bold mb-2 ${
            selectedInventory === "annex" ? "text-[#800000]" : "text-slate-800"
          }`}>
            Training Inventory Consumables
          </h2>
          <p className="text-sm text-slate-600 mb-4">Click to manage training inventory consumables</p>
          {selectedInventory === "annex" && (
            <div className="inline-block px-3 py-1 bg-[#800000] text-white text-xs font-semibold rounded-full">
              ✓ Selected
            </div>
          )}
        </button>
      </div>
    </>
  )
}

export default InventorySelector

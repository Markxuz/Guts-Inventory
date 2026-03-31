import { useInventoryLocation } from "../context/InventoryLocationContext"

const InventorySelector = () => {
  const { selectedInventory, setSelectedInventory } = useInventoryLocation()

  return (
    <div className="grid gap-4 sm:grid-cols-2 mb-6">
      {/* Main Inventory Option */}
      <button
        onClick={() => setSelectedInventory("main")}
        className={`rounded-2xl border-2 p-6 text-left transition ${
          selectedInventory === "main"
            ? "border-[#800000] bg-[#fff6f7] shadow-md"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <h2 className={`text-xl font-bold mb-2 ${
          selectedInventory === "main" ? "text-[#800000]" : "text-slate-800"
        }`}>
          Main Inventory Monitoring
        </h2>
        <p className="text-sm text-slate-600 mb-4">Click to manage main inventory monitoring</p>
        {selectedInventory === "main" && (
          <div className="inline-block px-3 py-1 bg-[#800000] text-white text-xs font-semibold rounded-full">
            ✓ Selected
          </div>
        )}
      </button>

      {/* Annex Inventory Option */}
      <button
        onClick={() => setSelectedInventory("annex")}
        className={`rounded-2xl border-2 p-6 text-left transition ${
          selectedInventory === "annex"
            ? "border-[#800000] bg-[#fff6f7] shadow-md"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <h2 className={`text-xl font-bold mb-2 ${
          selectedInventory === "annex" ? "text-[#800000]" : "text-slate-800"
        }`}>
          Training Inventory Monitoring
        </h2>
        <p className="text-sm text-slate-600 mb-4">Click to manage training inventory monitoring</p>
        {selectedInventory === "annex" && (
          <div className="inline-block px-3 py-1 bg-[#800000] text-white text-xs font-semibold rounded-full">
            ✓ Selected
          </div>
        )}
      </button>
    </div>
  )
}

export default InventorySelector

import { Archive, Pencil } from "lucide-react"

const statusClassMap = {
  "In Stock": "bg-emerald-50 text-emerald-700",
  "Low Stock": "bg-[#fbe9ed] text-[#800000]"
}

const ConsumableTable = ({ items, onEdit, onArchive, onCheckout, showActions = true }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--brand-secondary-soft)] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-[#f8eef0]">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Item Name</th>
              <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Quantity</th>
              <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Unit</th>
              <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Status</th>
              {showActions ? <th className="px-5 py-4 font-semibold text-[var(--brand-primary)] print:hidden">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4 font-medium text-slate-700">{item.itemName}</td>
                <td className="px-5 py-4 text-slate-700">{item.quantity}</td>
                <td className="px-5 py-4 text-slate-600">{item.unit}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusClassMap[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
                {showActions ? (
                  <td className="px-5 py-4 print:hidden">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(item)}
                        className="inline-flex rounded-lg border border-[var(--brand-secondary-soft)] p-2 text-slate-600 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                        aria-label={`Edit ${item.itemName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onArchive?.(item)}
                        className="inline-flex rounded-lg border border-rose-200 p-2 text-rose-700 transition hover:bg-rose-50"
                        aria-label={`Archive ${item.itemName}`}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onCheckout?.(item)}
                        className="inline-flex rounded-lg border border-emerald-200 p-2 text-emerald-700 transition hover:bg-emerald-50"
                        aria-label={`Checkout ${item.itemName}`}
                      >
                        🛒
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ConsumableTable

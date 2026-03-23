import { Archive as BoxArchive, ChevronLeft, LayoutDashboard, PackageOpen, ShieldCheck, Wrench } from "lucide-react"
import { NavLink } from "react-router-dom"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/iem", label: "IEM", icon: PackageOpen },
  { to: "/smaw", label: "SMAW", icon: Wrench },
  { to: "/css", label: "CSS", icon: ShieldCheck }
]

const archiveItem = { to: "/archive", label: "Archive Vault", icon: BoxArchive }

const Sidebar = ({ isCollapsed = false, onToggleCollapse, isMobile = false, onNavigate }) => {
  const ArchiveIcon = archiveItem.icon

  return (
    <div className="flex h-full flex-col">
      <div className={`border-b border-slate-600/80 pb-4 pt-5 transition-all duration-300 ${isCollapsed ? "px-3" : "px-6"}`}>
        {!isMobile ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mb-3 inline-flex items-center justify-center rounded-lg border border-slate-600/80 bg-slate-700/50 p-2 text-slate-200 transition hover:bg-slate-700 ${isCollapsed ? "w-full" : "ml-auto"}`}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : "rotate-0"}`} />
          </button>
        ) : null}

        <div className={`mx-auto flex justify-center rounded-xl bg-slate-800/50 transition-all duration-300 ${isCollapsed ? "w-12 p-2" : "w-full max-w-[170px] p-3"}`}>
          <img
            src="/guts-logo.png"
            alt="GUTS TESDA logo"
            className={`object-contain transition-all duration-300 ${isCollapsed ? "h-10 w-10" : "h-28 w-full"}`}
          />
        </div>
        <p className={`mt-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-300 transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}>
          GUTS Inventory System
        </p>
      </div>

      <nav className={`mt-6 space-y-3 py-3 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center rounded-r-xl border-l-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "border-[var(--brand-primary)] bg-slate-100 text-[var(--brand-primary)]"
                    : "border-transparent text-slate-200 hover:bg-slate-700/70 hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : "gap-3 px-5"}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"}`}
              >
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className={`mt-auto border-t border-slate-600/80 py-4 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
        <NavLink
          to={archiveItem.to}
          title={isCollapsed ? archiveItem.label : undefined}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center rounded-r-xl border-l-4 py-3 text-sm font-semibold transition-all duration-300 ${
              isActive
                ? "border-[var(--brand-primary)] bg-slate-100 text-[var(--brand-primary)]"
                : "border-transparent text-slate-200 hover:bg-slate-700/70 hover:text-white"
            } ${isCollapsed ? "justify-center px-2" : "gap-3 px-5"}`
          }
        >
          <ArchiveIcon className="h-4 w-4 shrink-0" />
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"}`}
          >
            {archiveItem.label}
          </span>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar

import { Archive as BoxArchive, ChevronLeft, ChevronDown, Clock, LayoutDashboard, PackageOpen, ShieldCheck, Wrench, LogOut, User, Users, BookOpen, Settings } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import AddUserModal from "./AddUserModal"
import UserManagementModal from "./UserManagementModal"
import TrainerManagementModal from "./TrainerManagementModal"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
]

const courseItems = [
  { to: "/eim", label: "EIM", icon: PackageOpen },
  { to: "/smaw", label: "SMAW", icon: Wrench },
  { to: "/css", label: "CSS", icon: ShieldCheck }
]

const settingsItems = [
  { to: "/history", label: "Activity Logs", icon: Clock },
  { to: "/archive", label: "Archive Vault", icon: BoxArchive }
]

const Sidebar = ({ isCollapsed = false, onToggleCollapse, isMobile = false, onNavigate }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false)
  const [isTrainerManagementOpen, setIsTrainerManagementOpen] = useState(false)
  const [isCoursesOpen, setIsCoursesOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleAddUserSuccess = (fullName, role) => {
    // Show success toast/message
    alert(`✓ User "${fullName}" created successfully as ${role}!`)
  }

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
          GUTS CONSUMABLE MONITORING SYSTEM
        </p>
      </div>

      <nav className={`mt-6 space-y-3 py-3 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
        {/* Dashboard */}
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

        {/* Courses Dropdown */}
        <div>
          <button
            type="button"
            onClick={() => !isCollapsed && setIsCoursesOpen(!isCoursesOpen)}
            title={isCollapsed ? "Courses" : undefined}
            className={`w-full group flex items-center rounded-r-xl border-l-4 py-3 text-sm font-semibold transition-all duration-300 border-transparent text-slate-200 hover:bg-slate-700/70 hover:text-white ${isCollapsed ? "justify-center px-2" : "gap-3 px-5"}`}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[100px] opacity-100"}`}
            >
              Courses
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-4 opacity-100"} ${isCoursesOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>

          {/* Course Items */}
          {isCoursesOpen && !isCollapsed && (
            <div className="mt-2 space-y-2 pl-2">
              {courseItems.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group flex items-center rounded-r-lg border-l-4 py-2 px-3 text-xs font-semibold transition-all duration-300 ${
                        isActive
                          ? "border-[var(--brand-primary)] bg-slate-100 text-[var(--brand-primary)]"
                          : "border-transparent text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="ml-3 whitespace-nowrap">{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      <div className={`mt-8 border-t border-slate-600/80 py-4 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
        {/* Settings Dropdown */}
        <div>
          <button
            type="button"
            onClick={() => !isCollapsed && setIsSettingsOpen(!isSettingsOpen)}
            title={isCollapsed ? "Settings" : undefined}
            className={`w-full group flex items-center rounded-r-xl border-l-4 py-3 text-sm font-semibold transition-all duration-300 border-transparent text-slate-200 hover:bg-slate-700/70 hover:text-white ${isCollapsed ? "justify-center px-2" : "gap-3 px-5"}`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[100px] opacity-100"}`}
            >
              Settings
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-4 opacity-100"} ${isSettingsOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>

          {/* Settings Items */}
          {isSettingsOpen && !isCollapsed && (
            <div className="mt-2 space-y-2 pl-2">
              {settingsItems.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group flex items-center rounded-r-lg border-l-4 py-2 px-3 text-xs font-semibold transition-all duration-300 ${
                        isActive
                          ? "border-[var(--brand-primary)] bg-slate-100 text-[var(--brand-primary)]"
                          : "border-transparent text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="ml-3 whitespace-nowrap">{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* User Profile Section - Pushed to bottom */}
      <div className={`mt-auto border-t border-slate-600/80 py-4 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
        {/* Admin Management Section */}
        {user?.role === "admin" && !isCollapsed && (
          <div className="mb-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Admin Panel</div>
            <button
              type="button"
              onClick={() => setIsUserManagementOpen(true)}
              className="w-full flex items-center gap-3 rounded-lg py-2 px-3 bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
            >
              <Users className="h-4 w-4 shrink-0" />
              Manage Users
            </button>
            <button
              type="button"
              onClick={() => setIsTrainerManagementOpen(true)}
              className="w-full flex items-center gap-3 rounded-lg py-2 px-3 bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Manage Trainers
            </button>
          </div>
        )}

        {/* Profile Card */}
        <button
          type="button"
          onClick={() => user?.role === "admin" ? setIsUserManagementOpen(true) : null}
          className={`w-full rounded-lg bg-slate-700/50 p-3 mb-3 transition-all duration-300 ${
            user?.role === "admin"
              ? "hover:bg-slate-700 cursor-pointer group"
              : "cursor-default"
          }`}
          title={user?.role === "admin" ? "Click to manage users" : ""}
          disabled={user?.role !== "admin"}
        >
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-[var(--brand-primary)] flex items-center justify-center transition-all ${
              user?.role === "admin" ? "group-hover:ring-2 ring-[var(--brand-primary)]/50" : ""
            }`}>
              <User className="h-4 w-4 text-white" />
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"}`}>
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || "User"}</p>
              <p className={`text-xs truncate ${user?.role === "admin" ? "text-yellow-300" : "text-slate-300"}`}>
                {user?.role === "admin" ? "👤 System Administrator" : user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "staff"}
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-200 hover:bg-red-600/20 hover:text-red-300 transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-3"}`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"}`}
          >
            Logout
          </span>
        </button>
      </div>

      {/* Modals - Only for admins */}
      {user?.role === "admin" && (
        <>
          <AddUserModal
            isOpen={isAddUserOpen}
            onClose={() => setIsAddUserOpen(false)}
            onSuccess={handleAddUserSuccess}
          />
          <UserManagementModal
            isOpen={isUserManagementOpen}
            onClose={() => setIsUserManagementOpen(false)}
          />
          <TrainerManagementModal
            isOpen={isTrainerManagementOpen}
            onClose={() => setIsTrainerManagementOpen(false)}
          />
        </>
      )}
    </div>
  )
}

export default Sidebar

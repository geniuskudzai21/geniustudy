import { NavLink } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard,
  Library,
  Settings,
  LogOut,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { setUser, sidebarOpen, setSidebarOpen } = useAppStore()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <aside className={cn(
      "w-60 flex flex-col bg-surface border-r border-border shrink-0 transition-all duration-200"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="font-display text-lg font-semibold text-text-primary">
            GeniuStudy
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 rounded-md hover:bg-accent-subtle text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            isActive
              ? "bg-accent-subtle text-accent"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            isActive
              ? "bg-accent-subtle text-accent"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          )}
        >
          <Library className="w-4 h-4" />
          Documents
        </NavLink>
        <NavLink
          to="/app/settings"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            isActive
              ? "bg-accent-subtle text-accent"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-error hover:bg-surface-elevated transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

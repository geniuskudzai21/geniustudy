import { useAppStore } from '@/store/useAppStore'
import { Menu, Sun, Moon } from 'lucide-react'

export function TopBar() {
  const {
    sidebarOpen, setSidebarOpen,
    readingTheme, setReadingTheme,
    currentDocument,
  } = useAppStore()

  const toggleTheme = () => {
    const themes = ['dark', 'light', 'sepia', 'forest', 'midnight'] as const
    const idx = themes.indexOf(readingTheme)
    setReadingTheme(themes[(idx + 1) % themes.length])
  }

  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-surface shrink-0">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-accent-subtle text-text-secondary hover:text-text-primary transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <h1 className="text-sm font-medium text-text-primary truncate max-w-md">
          {currentDocument?.title || 'GeniuStudy'}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-accent-subtle text-text-secondary hover:text-text-primary transition-colors"
          title="Toggle theme"
        >
          {readingTheme === 'light' || readingTheme === 'sepia'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>
      </div>
    </header>
  )
}

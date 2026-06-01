import { useAppStore } from '@/store/useAppStore'
import { Type, Sun, Moon, AlignLeft, List, Brain } from 'lucide-react'
import type { ReadingTheme, FontFamily, ReadingWidth } from '@/types'

interface ReaderToolbarProps {
  tts: any
}

export function ReaderToolbar({ tts }: ReaderToolbarProps) {
  const {
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    readingTheme, setReadingTheme,
    readingWidth, setReadingWidth,
    tocOpen, setTocOpen,
    aiPanelOpen, setAiPanelOpen,
  } = useAppStore()

  const themes: ReadingTheme[] = ['dark', 'light', 'sepia', 'forest', 'midnight']
  const currentThemeIndex = themes.indexOf(readingTheme)
  const nextTheme = themes[(currentThemeIndex + 1) % themes.length]

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-surface border-b border-border shrink-0">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
          className="p-2 rounded-md hover:bg-accent-subtle text-text-secondary hover:text-text-primary transition-colors"
          title={`Switch to ${fontFamily === 'serif' ? 'sans' : 'serif'}`}
        >
          <Type className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-muted mx-1">
        <input
          type="range"
          min={14}
          max={24}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-20 accent-accent"
          title="Font size"
        />
        <span>{fontSize}px</span>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => setReadingTheme(nextTheme)}
          className="p-2 rounded-md hover:bg-accent-subtle text-text-secondary hover:text-text-primary transition-colors"
          title={`Theme: ${nextTheme}`}
        >
          {readingTheme === 'light' || readingTheme === 'sepia'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className={`p-2 rounded-md transition-colors ${
            tocOpen ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-accent-subtle'
          }`}
          title="Table of Contents"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => setAiPanelOpen(!aiPanelOpen)}
          className={`p-2 rounded-md transition-colors ${
            aiPanelOpen ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-accent-subtle'
          }`}
          title="AI Tools"
        >
          <Brain className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

import { useAppStore } from '@/store/useAppStore'
import { Type } from 'lucide-react'

export function ReaderToolbar() {
  const {
    fontFamily, setFontFamily,
    fontSize, setFontSize,
  } = useAppStore()

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
    </div>
  )
}

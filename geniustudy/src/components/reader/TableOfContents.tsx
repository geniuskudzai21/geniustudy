import { useMemo } from 'react'

interface TableOfContentsProps {
  html: string
}

export function TableOfContents({ html }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const div = document.createElement('div')
    div.innerHTML = html
    const elements = div.querySelectorAll('h1, h2, h3')
    return Array.from(elements).map((el, i) => ({
      id: `heading-${i}`,
      text: el.textContent || '',
      level: parseInt(el.tagName[1]),
    }))
  }, [html])

  if (headings.length === 0) return null

  return (
    <nav className="p-3">
      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">
        Contents
      </h4>
      <div className="space-y-1">
        {headings.map((h) => (
          <button
            key={h.id}
            onClick={() => {
              const el = document.querySelector(`[data-heading="${h.text}"]`)
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="block w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent-subtle text-text-secondary hover:text-text-primary transition-colors"
            style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
          >
            {h.text}
          </button>
        ))}
      </div>
    </nav>
  )
}

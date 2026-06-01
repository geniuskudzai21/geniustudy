import { useState, useEffect } from 'react'
import { useAI } from '@/hooks/useAI'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import type { AISummary } from '@/types'

interface SummaryPanelProps {
  text: string
}

export function SummaryPanel({ text }: SummaryPanelProps) {
  const { getSummary, isLoading } = useAI()
  const [summary, setSummary] = useState<AISummary | null>(null)
  const [length, setLength] = useState<'brief' | 'standard' | 'detailed'>('standard')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setSummary(null)
  }, [text])

  const handleGenerate = async () => {
    const result = await getSummary(text, length)
    if (result) setSummary(result)
  }

  const handleCopy = () => {
    if (!summary) return
    const content = `## Overview\n${summary.overview}\n\n## Key Points\n${summary.keyPoints.map(k => `- ${k}`).join('\n')}`
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {(['brief', 'standard', 'detailed'] as const).map(l => (
          <button
            key={l}
            onClick={() => { setLength(l); setSummary(null) }}
            className={`px-2.5 py-1 text-xs rounded-lg capitalize transition-colors ${
              length === l ? 'bg-accent text-background' : 'bg-surface text-text-secondary hover:text-text-primary'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {!summary ? (
        <button
          onClick={handleGenerate}
          disabled={isLoading || !text}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-background rounded-xl text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isLoading ? 'Generating...' : 'Generate Summary'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted capitalize">Difficulty: {summary.difficulty}</span>
            <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-accent-subtle text-text-secondary hover:text-accent transition-colors">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{summary.overview}</p>
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Key Points</h4>
            <ul className="space-y-1.5">
              {summary.keyPoints.map((point, i) => (
                <li key={i} className="text-sm text-text-secondary flex gap-2">
                  <span className="text-accent shrink-0 mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

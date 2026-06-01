import { useMemo, useRef, useEffect } from 'react'

interface NoteReaderProps {
  html: string
  currentSentenceIndex: number
  onSentenceClick: (index: number) => void
}

export function NoteReader({ html, currentSentenceIndex, onSentenceClick }: NoteReaderProps) {
  const sentencesRef = useRef<(HTMLSpanElement | null)[]>([])

  const sentences = useMemo(() => {
    const div = document.createElement('div')
    div.innerHTML = html
    const text = div.textContent || ''
    const parts = text.match(/[^.!?\n]+[.!?]*\s*/g) || [text]
    return parts
  }, [html])

  useEffect(() => {
    if (currentSentenceIndex >= 0 && sentencesRef.current[currentSentenceIndex]) {
      sentencesRef.current[currentSentenceIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentSentenceIndex])

  if (!html) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">No content to display</p>
      </div>
    )
  }

  return (
    <article className="prose-custom">
      {sentences.map((sentence, i) => (
        <span
          key={i}
          ref={(el) => { sentencesRef.current[i] = el }}
          onClick={() => onSentenceClick(i)}
          className={`cursor-pointer transition-colors rounded ${
            i === currentSentenceIndex ? 'tts-active' : ''
          }`}
        >
          {sentence}
        </span>
      ))}
    </article>
  )
}

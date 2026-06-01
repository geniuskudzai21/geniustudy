import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { useAI } from '@/hooks/useAI'
import { Sparkles, Loader2, RotateCcw, Check, X, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'

interface FlashcardDeckProps {
  text: string
  documentId: string
}

export function FlashcardDeck({ text, documentId }: FlashcardDeckProps) {
  const user = useAppStore((s) => s.user)
  const { getFlashcards, isLoading } = useAI()
  const [cards, setCards] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [quality, setQuality] = useState<number | null>(null)

  const handleGenerate = async () => {
    const result = await getFlashcards(text)
    if (result) {
      setCards(result)
      setCurrentIndex(0)
      setFlipped(false)
    }
  }

  const handleQuality = async (q: number) => {
    setQuality(q)
    if (user) {
      const card = cards[currentIndex]
      await supabase.from('flashcards').insert({
        user_id: user.id,
        document_id: documentId,
        question: card.question,
        answer: card.answer,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review: new Date().toISOString().split('T')[0],
        last_quality: q,
      })
    }
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(i => i + 1)
        setFlipped(false)
        setQuality(null)
      }
    }, 500)
  }

  if (cards.length === 0) {
    return (
      <button
        onClick={handleGenerate}
        disabled={isLoading || !text}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-background rounded-xl text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {isLoading ? 'Generating...' : 'Generate Flashcards'}
      </button>
    )
  }

  const card = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{currentIndex + 1} / {cards.length}</span>
        <span>{Math.round(progress)}%</span>
      </div>

      <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="flashcard-flip cursor-pointer"
        style={{ height: '200px' }}
      >
        <div className={`flashcard-inner w-full h-full rounded-xl border border-border bg-surface p-5 ${
          flipped ? 'flipped' : ''
        }`}>
          <div className="flashcard-front flex items-center justify-center">
            <p className="text-sm text-text-primary text-center">{card.question}</p>
          </div>
          <div className="flashcard-back flex items-center justify-center">
            <p className="text-sm text-text-secondary text-center">{card.answer}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-text-muted text-center">Click to flip</p>

      {flipped && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => handleQuality(1)} className="flex items-center gap-1 px-3 py-1.5 bg-error/10 text-error rounded-lg text-xs hover:bg-error/20 transition-colors">
            <X className="w-3 h-3" /> Again
          </button>
          <button onClick={() => handleQuality(3)} className="flex items-center gap-1 px-3 py-1.5 bg-warning/10 text-warning rounded-lg text-xs hover:bg-warning/20 transition-colors">
            <TrendingUp className="w-3 h-3" /> Hard
          </button>
          <button onClick={() => handleQuality(5)} className="flex items-center gap-1 px-3 py-1.5 bg-success/10 text-success rounded-lg text-xs hover:bg-success/20 transition-colors">
            <Check className="w-3 h-3" /> Easy
          </button>
        </div>
      )}
    </div>
  )
}

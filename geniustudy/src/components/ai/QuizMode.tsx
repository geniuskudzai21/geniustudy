import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { useAI } from '@/hooks/useAI'
import { Sparkles, Loader2, Clock, Trophy, Check, X, ChevronRight } from 'lucide-react'
import type { QuizQuestion } from '@/types'

interface QuizModeProps {
  text: string
  documentId: string
}

export function QuizMode({ text, documentId }: QuizModeProps) {
  const user = useAppStore((s) => s.user)
  const { getQuiz, isLoading } = useAI()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [count, setCount] = useState(5)
  const [startTime] = useState(Date.now())

  const handleGenerate = async () => {
    const result = await getQuiz(text, count)
    if (result) {
      setQuestions(result)
      setCurrentIndex(0)
      setAnswers([])
      setShowResult(false)
    }
  }

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex]
    setAnswers(newAnswers)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      finishQuiz(newAnswers)
    }
  }

  const finishQuiz = async (finalAnswers: number[]) => {
    setShowResult(true)
    const score = finalAnswers.filter((a, i) => a === questions[i].correct).length
    const timeSecs = Math.floor((Date.now() - startTime) / 1000)

    if (user) {
      await supabase.from('quiz_results').insert({
        user_id: user.id,
        document_id: documentId,
        score,
        total: questions.length,
        time_secs: timeSecs,
        questions: questions.map((q, i) => ({
          ...q,
          userAnswer: finalAnswers[i],
        })),
      })
    }
  }

  if (questions.length === 0 || showResult) {
    if (showResult) {
      const score = answers.filter((a, i) => a === questions[i].correct).length
      const percentage = Math.round((score / questions.length) * 100)
      return (
        <div className="space-y-4">
          <div className="text-center py-6">
            <Trophy className={`w-10 h-10 mx-auto mb-2 ${percentage >= 70 ? 'text-accent' : 'text-text-muted'}`} />
            <p className="text-xl font-bold text-text-primary">{score}/{questions.length}</p>
            <p className="text-sm text-text-secondary">{percentage}% correct</p>
          </div>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="p-3 bg-surface border border-border rounded-xl text-xs">
                <div className="flex items-start gap-2">
                  {answers[i] === q.correct
                    ? <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    : <X className="w-3.5 h-3.5 text-error shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="text-text-primary font-medium mb-1">{q.question}</p>
                    <p className="text-text-muted">{q.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleGenerate} className="w-full py-2 bg-accent text-background rounded-xl text-sm font-medium">
            Try Again
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="flex gap-1">
          {[5, 10, 20].map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                count === n ? 'bg-accent text-background' : 'bg-surface text-text-secondary'
              }`}
            >
              {n} Qs
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !text}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-background rounded-xl text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>
    )
  }

  const q = questions[currentIndex]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>Question {currentIndex + 1} of {questions.length}</span>
      </div>

      <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <p className="text-sm text-text-primary font-medium">{q.question}</p>

      <div className="space-y-1.5">
        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full text-left px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-secondary hover:border-accent hover:text-text-primary transition-all"
          >
            <span className="text-accent font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

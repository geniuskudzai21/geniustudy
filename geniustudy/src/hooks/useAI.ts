import { useState, useCallback } from 'react'
import { generateSummary, generateFlashcards, generateQuiz, askDocument, explainText } from '@/lib/claude'
import type { AISummary, QuizQuestion } from '@/types'

export function useAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSummary = useCallback(async (text: string, length: 'brief' | 'standard' | 'detailed' = 'standard'): Promise<AISummary | null> => {
    setIsLoading(true)
    setError(null)
    try {
      return await generateSummary(text, length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getFlashcards = useCallback(async (text: string, count: number = 10): Promise<any[] | null> => {
    setIsLoading(true)
    setError(null)
    try {
      return await generateFlashcards(text, count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getQuiz = useCallback(async (text: string, count: number = 5): Promise<QuizQuestion[] | null> => {
    setIsLoading(true)
    setError(null)
    try {
      return await generateQuiz(text, count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const askQuestion = useCallback(async (text: string, question: string, history: { role: string; content: string }[] = []): Promise<string | null> => {
    setIsLoading(true)
    setError(null)
    try {
      return await askDocument(text, question, history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getExplanation = useCallback(async (text: string, selectedText: string): Promise<string | null> => {
    setIsLoading(true)
    setError(null)
    try {
      return await explainText(text, selectedText)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get explanation')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { getSummary, getFlashcards, getQuiz, askQuestion, getExplanation, isLoading, error }
}

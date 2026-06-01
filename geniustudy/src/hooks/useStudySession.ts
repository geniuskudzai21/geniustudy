import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'

export function useStudySession() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startTime = useRef<number>(0)
  const intervalRef = useRef<number>(0)
  const user = useAppStore((s) => s.user)
  const currentDocument = useAppStore((s) => s.currentDocument)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startSession = useCallback(async () => {
    if (!user) return
    startTime.current = Date.now()
    setIsRunning(true)
    intervalRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)

    const { data } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        document_id: currentDocument?.id || null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (data) setSessionId(data.id)
  }, [user, currentDocument])

  const pauseSession = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const resumeSession = useCallback(() => {
    if (!startTime.current) return
    startTime.current = Date.now() - elapsed * 1000
    setIsRunning(true)
    intervalRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
  }, [elapsed])

  const endSession = useCallback(async () => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (sessionId && user) {
      const duration = elapsed
      const xp = Math.floor(duration / 60)
      await supabase
        .from('study_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_secs: duration,
          xp_earned: xp,
        })
        .eq('id', sessionId)

      await supabase
        .from('profiles')
        .update({
          xp: (user.xp || 0) + xp,
          last_studied: new Date().toISOString().split('T')[0],
        })
        .eq('id', user.id)
    }

    setElapsed(0)
    setSessionId(null)
  }, [sessionId, user, elapsed])

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [])

  return {
    elapsed,
    isRunning,
    formatTime,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
  }
}

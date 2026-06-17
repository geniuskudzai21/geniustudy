import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Sparkles } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/app/dashboard', { replace: true })
      } else {
        navigate('/auth', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="w-8 h-8 text-accent mx-auto mb-4 animate-pulse" />
        <p className="text-text-secondary">Completing sign in...</p>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const navigate = useNavigate()
  const { user, setUser, sidebarOpen, preferences } = useAppStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth')
      } else {
        loadProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        navigate('/auth')
      } else {
        loadProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    const { data: existing, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existing) {
      setUser(existing)
      return
    }

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Profile select error:', selectError)
    }

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId })
      .select()
      .single()

    if (insertError) {
      console.error('Profile insert error:', insertError)
      return
    }

    if (newProfile) setUser(newProfile)
  }

  useEffect(() => {
    const root = document.documentElement
    if (preferences.theme) {
      root.setAttribute('data-theme', preferences.theme)
    }
  }, [preferences.theme])

  if (!user) return null

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
